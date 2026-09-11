// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgreementRegistry.sol";

/// @title MilestonePayout
/// @notice Member 3's module — Milestone Tracking & Progressive Payout.
/// Inherits AgreementRegistry directly, fully decoupled from the reputation
/// system — reward triggering is handled separately by LogisticsEscrow's
/// rewardMilestone()/rewardCompletion() wrappers over TokenisationModule.
abstract contract MilestonePayout is AgreementRegistry {
  // ---------------------------------------------------------------------
  // Data Structures
  // ---------------------------------------------------------------------

  struct Milestone {
    string description; // Description of work (e.g. "Cargo Picked Up")
    uint256 amount; // ETH payout amount for this specific milestone
    bool isSubmitted; // Submitted by Carrier
    bool isVerified; // Approved by Shipper
    bool isPaid; // Payout released
  }

  // agreementId => array of Milestones
  mapping(uint256 => Milestone[]) public agreementMilestones;

  // agreementId => total amount of ETH already paid out
  mapping(uint256 => uint256) public totalPaidOut;

  // ---------------------------------------------------------------------
  // Custom Errors
  // ---------------------------------------------------------------------

  error MilestoneAlreadySubmitted();
  error MilestoneNotSubmitted();
  error MilestoneAlreadyVerified();
  error MilestoneAlreadyPaid();
  error InvalidMilestoneIndex();
  error InvalidMilestoneConfig();
  error MilestoneInsufficientContractBalance();
  error MilestoneTransferFailed();

  // ---------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------

  event MilestonesConfigured(uint256 indexed agreementId, uint256 count);
  event MilestoneSubmitted(uint256 indexed agreementId, uint256 indexed index);
  event MilestoneVerified(uint256 indexed agreementId, uint256 indexed index);
  event PaymentReleased(
    uint256 indexed agreementId,
    uint256 indexed index,
    address indexed carrier,
    uint256 amount
  );

  // ---------------------------------------------------------------------
  // Functions
  // ---------------------------------------------------------------------

  /**
   * @notice Allows the Shipper to setup milestone breakdown and individual amounts.
   * @dev Total sum of milestone amounts must match payloadValue.
   */
  function setupMilestones(
    uint256 agreementId,
    string[] calldata descriptions,
    uint256[] calldata amounts
  ) external whenNotPaused agreementExists(agreementId) {
    Agreement storage a = agreements[agreementId];
    if (msg.sender != a.shipper) revert NotShipper();
    if (
      descriptions.length != a.milestoneCount ||
      amounts.length != a.milestoneCount
    ) {
      revert InvalidMilestoneConfig();
    }
    if (agreementMilestones[agreementId].length > 0) revert AlreadyRegistered();

    uint256 total = 0;
    for (uint256 i = 0; i < amounts.length; i++) {
      total += amounts[i];
      agreementMilestones[agreementId].push(
        Milestone({
          description: descriptions[i],
          amount: amounts[i],
          isSubmitted: false,
          isVerified: false,
          isPaid: false
        })
      );
    }

    if (total != a.payloadValue) revert InvalidMilestoneConfig();
    emit MilestonesConfigured(agreementId, a.milestoneCount);
  }

  /**
   * @notice Carrier submits proof or claims milestone completed.
   */
  function submitMilestone(
    uint256 agreementId,
    uint256 index
  ) external whenNotPaused agreementExists(agreementId) {
    Agreement storage a = agreements[agreementId];
    if (msg.sender != a.carrier) revert NotCarrier();
    if (index >= agreementMilestones[agreementId].length)
      revert InvalidMilestoneIndex();

    Milestone storage m = agreementMilestones[agreementId][index];
    if (m.isSubmitted) revert MilestoneAlreadySubmitted();

    m.isSubmitted = true;
    emit MilestoneSubmitted(agreementId, index);
  }

  /**
   * @notice Shipper verifies completed milestone and releases funds to Carrier.
   */
  function verifyAndReleaseMilestone(
    uint256 agreementId,
    uint256 index
  ) external whenNotPaused agreementExists(agreementId) {
    Agreement storage a = agreements[agreementId];
    if (msg.sender != a.shipper) revert NotShipper();
    if (index >= agreementMilestones[agreementId].length)
      revert InvalidMilestoneIndex();

    Milestone storage m = agreementMilestones[agreementId][index];
    if (!m.isSubmitted) revert MilestoneNotSubmitted();
    if (m.isPaid) revert MilestoneAlreadyPaid();

    m.isVerified = true;
    m.isPaid = true;
    totalPaidOut[agreementId] += m.amount;

    // Transition agreement status to InProgress on first payout
    if (a.status == AgreementStatus.Funded) {
      _setStatus(agreementId, AgreementStatus.InProgress);
    }

    // If all milestones paid out, mark agreement completed.
    // Reputation reward is claimed separately via
    // LogisticsEscrow's rewardCompletion() once status is Completed.
    if (totalPaidOut[agreementId] == a.payloadValue) {
      _setStatus(agreementId, AgreementStatus.Completed);
    }

    // Payout transfer
    (bool sent, ) = payable(a.carrier).call{ value: m.amount }("");
    if (!sent) revert MilestoneTransferFailed();

    emit MilestoneVerified(agreementId, index);
    emit PaymentReleased(agreementId, index, a.carrier, m.amount);
  }

  /**
   * @notice Get all milestones for an agreement.
   */
  function getMilestones(
    uint256 agreementId
  ) external view agreementExists(agreementId) returns (Milestone[] memory) {
    return agreementMilestones[agreementId];
  }
}
