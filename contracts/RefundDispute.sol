// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgreementRegistry.sol";

/**
 * @title RefundDispute
 * @notice Member 4's module — Refund, Dispute & History.
 *
 * Responsibilities covered here:
 *   1. Auto-refund the Shipper if the Carrier misses the deadline before
 *      any milestone has been paid out.
 *   2. Dispute handling: an off-chain tracking system detects a delivery
 *      anomaly and raises a dispute on-chain; a human arbitrator then
 *      reviews it (through a formal claim/appeal process off-chain) and
 *      decides the final payout split.
 *   3. On-chain status history for whatever this module changes, as a
 *      backup/convenience to the full event-based history the frontend
 *      builds via ethers.js queryFilter() (see the note above
 *      getRefundDisputeHistory below).
 *
 * ALIGNED with Member 1's revised AgreementRegistry.sol:
 *   - Uses custom errors (not require strings), matching the base module.
 *   - Respects the new emergency-pause system via whenNotPaused on the
 *     state-changing entry points.
 *   - Works with the packed struct (uint40 deadline/createdAt, uint32
 *     milestoneCount). Fields are accessed by name, so the struct's new
 *     field ordering doesn't affect this module.
 *
 * INTEGRATION NOTE — read this before wiring things up with Member 2 & 3:
 * This module inherits ONLY AgreementRegistry, per the project rule that
 * nobody depends directly on another member's file. That means it has no
 * visibility into Funding.sol's private escrow bookkeeping (how much has
 * already been paid out via milestones). To stay correct without that:
 *   - checkAndTriggerRefund() only works while status == Funded, i.e.
 *     BEFORE MilestonePayout has released anything. At that point the full
 *     `payloadValue` is guaranteed to still be in the contract, so
 *     refunding it is always safe.
 *   - If an agreement is already InProgress (partial payouts made) and the
 *     deadline passes, this module raises a Dispute instead of guessing at
 *     a refund amount. The human arbitrator (who can check history.html /
 *     the event log to see exactly what's been paid) enters the correct
 *     split manually in resolveDispute().
 */
abstract contract RefundDispute is AgreementRegistry {
    // ---------------------------------------------------------------------
    // Data structures
    // ---------------------------------------------------------------------

    /// @notice One entry in an agreement's status-change timeline.
    struct StatusLogEntry {
        AgreementStatus status;
        uint40 timestamp;
    }

    /// @dev agreementId => status changes made BY THIS MODULE.
    mapping(uint256 => StatusLogEntry[]) private _statusLog;

    /// @notice Address allowed to resolve disputes. Set once after deploy.
    address public arbitrator;
    bool private _arbitratorSet;

    /// @notice Quick lookup for whether an agreement is currently disputed.
    mapping(uint256 => bool) public isDisputed;

    /// @dev Prevents an agreement from being refunded/resolved twice.
    mapping(uint256 => bool) private _finalized;

    // ---------------------------------------------------------------------
    // Custom errors (matching AgreementRegistry's style)
    // ---------------------------------------------------------------------

    error ArbitratorAlreadySet();
    error NotArbitrator();
    error DeadlineNotPassed(uint256 agreementId);
    error AlreadyFinalized(uint256 agreementId);
    error NotDisputable(uint256 agreementId);
    error NotDisputed(uint256 agreementId);
    error InsufficientContractBalance();
    error TransferFailed();

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event DisputeRaised(uint256 indexed agreementId, address indexed raisedBy, string reason);
    event DisputeResolved(uint256 indexed agreementId, address indexed arbitrator, uint256 toShipper, uint256 toCarrier);
    event RefundIssued(uint256 indexed agreementId, address indexed shipper, uint256 amount);
    event ArbitratorSet(address indexed arbitrator);

    // ---------------------------------------------------------------------
    // Setup
    // ---------------------------------------------------------------------

    /// @notice One-time setup for the human arbitrator address. Call this
    /// right after deploying the combined LogisticsEscrow contract.
    function setArbitrator(address arbitratorAddress) external onlyOwner {
        if (_arbitratorSet) revert ArbitratorAlreadySet();
        if (arbitratorAddress == address(0)) revert ZeroAddress();
        arbitrator = arbitratorAddress;
        _arbitratorSet = true;
        emit ArbitratorSet(arbitratorAddress);
    }

    modifier onlyArbitrator() {
        if (msg.sender != arbitrator) revert NotArbitrator();
        _;
    }

    // ---------------------------------------------------------------------
    // Automatic refund — the simple, non-disputed happy path
    // ---------------------------------------------------------------------

    /**
     * @notice Anyone can call this once an agreement's deadline has passed
     *         with zero milestones paid out yet. Refunds the full
     *         payloadValue back to the Shipper and closes the agreement.
     * @dev Restricted to AgreementStatus.Funded — see the contract-level
     *      note above for why. block.timestamp (uint256) is compared
     *      against a.deadline (uint40); Solidity widens the uint40 for the
     *      comparison automatically.
     */
    function checkAndTriggerRefund(uint256 agreementId)
        external
        whenNotPaused
        agreementExists(agreementId)
        atStatus(agreementId, AgreementStatus.Funded)
    {
        Agreement storage a = agreements[agreementId];
        if (block.timestamp <= a.deadline) revert DeadlineNotPassed(agreementId);
        if (_finalized[agreementId]) revert AlreadyFinalized(agreementId);

        _finalized[agreementId] = true;
        _setStatus(agreementId, AgreementStatus.Refunded);
        _logStatus(agreementId, AgreementStatus.Refunded);

        uint256 amount = a.payloadValue;
        (bool sent, ) = payable(a.shipper).call{value: amount}("");
        if (!sent) revert TransferFailed();

        emit RefundIssued(agreementId, a.shipper, amount);
    }

    // ---------------------------------------------------------------------
    // Dispute flow — anomaly detected mid-delivery, human decides
    // ---------------------------------------------------------------------

    /**
     * @notice Flags an agreement as disputed. In production this would be
     *         triggered automatically by an off-chain tracking/anomaly-
     *         detection system (via a backend wallet address), or manually
     *         by either participant. Freezes the agreement until a human
     *         arbitrator resolves it.
     * @param reason short machine- or human-readable reason, e.g.
     *        "deadline missed mid-delivery" or "GPS anomaly detected".
     */
    function raiseDispute(uint256 agreementId, string calldata reason)
        external
        whenNotPaused
        agreementExists(agreementId)
        onlyParticipant(agreementId)
    {
        AgreementStatus current = agreements[agreementId].status;
        if (current != AgreementStatus.Funded && current != AgreementStatus.InProgress) {
            revert NotDisputable(agreementId);
        }
        if (_finalized[agreementId]) revert AlreadyFinalized(agreementId);

        isDisputed[agreementId] = true;
        _setStatus(agreementId, AgreementStatus.Disputed);
        _logStatus(agreementId, AgreementStatus.Disputed);

        emit DisputeRaised(agreementId, msg.sender, reason);
    }

    /**
     * @notice Human arbitrator decides the final split once a dispute has
     *         been reviewed through a formal claim/appeal process off-chain.
     * @param toShipper amount (wei) returned to the Shipper.
     * @param toCarrier amount (wei) paid to the Carrier.
     * @dev The arbitrator is trusted to enter amounts that don't exceed
     *      what's actually left in escrow for this agreement — this module
     *      can't independently verify that figure without reading Funding's
     *      private bookkeeping (see the note at the top of this contract).
     */
    function resolveDispute(uint256 agreementId, uint256 toShipper, uint256 toCarrier)
        external
        agreementExists(agreementId)
        onlyArbitrator
    {
        if (!isDisputed[agreementId]) revert NotDisputed(agreementId);
        if (_finalized[agreementId]) revert AlreadyFinalized(agreementId);
        if (toShipper + toCarrier > address(this).balance) revert InsufficientContractBalance();

        Agreement storage a = agreements[agreementId];
        _finalized[agreementId] = true;
        isDisputed[agreementId] = false;

        AgreementStatus finalStatus = toCarrier > 0 ? AgreementStatus.Completed : AgreementStatus.Refunded;
        _setStatus(agreementId, finalStatus);
        _logStatus(agreementId, finalStatus);

        if (toShipper > 0) {
            (bool sentShipper, ) = payable(a.shipper).call{value: toShipper}("");
            if (!sentShipper) revert TransferFailed();
        }
        if (toCarrier > 0) {
            (bool sentCarrier, ) = payable(a.carrier).call{value: toCarrier}("");
            if (!sentCarrier) revert TransferFailed();
        }

        emit DisputeResolved(agreementId, msg.sender, toShipper, toCarrier);
    }

    // ---------------------------------------------------------------------
    // History
    // ---------------------------------------------------------------------

    function _logStatus(uint256 agreementId, AgreementStatus status) internal {
        _statusLog[agreementId].push(StatusLogEntry({status: status, timestamp: uint40(block.timestamp)}));
    }

    /**
     * @notice Returns every status change THIS module made for an agreement
     *         (refunds/disputes only), with timestamps.
     * @dev For the COMPLETE history — including Created/Funded/InProgress/
     *      Completed changes made by other modules — query the shared
     *      AgreementStatusChanged event off-chain instead. Every module
     *      (including this one) emits that same event through the inherited
     *      _setStatus() helper, so ethers.js queryFilter() against it gives
     *      a full, gas-free timeline for history.html.
     */
    function getRefundDisputeHistory(uint256 agreementId)
        external
        view
        agreementExists(agreementId)
        returns (StatusLogEntry[] memory)
    {
        return _statusLog[agreementId];
    }
}
