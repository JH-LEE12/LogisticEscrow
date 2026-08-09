// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgreementRegistry.sol";

/// @title TokenisationModule
/// @notice Member 5's module — abstract carrier-reputation reward logic.
/// Awards non-transferable Logistics Reputation Tokens (LRT) to the carrier
/// assigned to an agreement once a milestone is verified, and a one-time
/// bonus once the agreement is successfully completed.
///
/// Inherits AgreementRegistry directly so the assigned carrier and agreement
/// status are always read from the single shared source of truth (no second
/// copy of agreement data is kept here). Stays abstract — see
/// `_milestoneIsVerified` — until composed with the milestone/escrow module,
/// which is the only piece that knows whether a milestone was verified.
///
/// ETH is the real payment (owned by the escrow/milestone module). LRT is a
/// reputation point only: `1 LRT = 1 point`, `decimals() == 0`, and there is
/// no transfer/approve — reputation cannot be bought, sold or gifted.
abstract contract TokenisationModule is AgreementRegistry {
    // ---------------------------------------------------------------
    // Token identity
    // ---------------------------------------------------------------

    string public constant name = "Logistics Reputation Token";
    string public constant symbol = "LRT";

    // ---------------------------------------------------------------
    // Reward table (see Tokenisation_Module_Implementation_Plan.md, section 6)
    // ---------------------------------------------------------------

    uint256 public constant PICKUP_REWARD = 10;
    uint256 public constant INTERMEDIATE_REWARD = 10;
    uint256 public constant DELIVERY_REWARD = 30;
    uint256 public constant COMPLETION_REWARD = 20;

    enum RewardKind {
        Pickup,
        Intermediate,
        Delivery
    }

    // ---------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------

    mapping(address => uint256) private _reputationBalance;
    mapping(bytes32 => bool) private _milestoneRewarded;
    mapping(uint256 => bool) private _completionRewarded;

    uint256 public totalSupply;

    // ---------------------------------------------------------------
    // Custom errors
    // ---------------------------------------------------------------

    error ZeroReward();
    error InvalidCarrier();
    error MilestoneNotVerified();
    error MilestoneAlreadyRewarded();
    error AgreementNotCompleted();
    error CompletionAlreadyRewarded();

    // ---------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------

    // ERC-20-compatible mint log (from the zero address). No user-to-user
    // transfer ever fires this event — there is no transfer function.
    event Transfer(address indexed from, address indexed to, uint256 value);

    event ReputationRewarded(
        address indexed carrier,
        uint256 indexed agreementId,
        uint256 indexed milestoneId,
        RewardKind rewardKind,
        uint256 amount
    );

    event CompletionBonusRewarded(
        address indexed carrier,
        uint256 indexed agreementId,
        uint256 amount
    );

    // ---------------------------------------------------------------
    // Public views
    // ---------------------------------------------------------------

    function decimals() external pure returns (uint8) {
        return 0;
    }

    function balanceOf(address carrier) public view returns (uint256) {
        return _reputationBalance[carrier];
    }

    function milestoneRewarded(uint256 agreementId, uint256 milestoneId) public view returns (bool) {
        return _milestoneRewarded[_rewardKey(agreementId, milestoneId)];
    }

    function completionRewarded(uint256 agreementId) public view returns (bool) {
        return _completionRewarded[agreementId];
    }

    function reputationLevel(address carrier) public view returns (string memory) {
        uint256 points = _reputationBalance[carrier];

        if (points >= 300) return "Gold";
        if (points >= 150) return "Silver";
        if (points >= 50) return "Bronze";
        return "New Carrier";
    }

    // ---------------------------------------------------------------
    // Internal reward entry points
    // Called only by the authorized milestone/completion flow — never
    // exposed publicly, so a carrier cannot mint their own reputation.
    // ---------------------------------------------------------------

    function _rewardVerifiedMilestone(
        uint256 agreementId,
        uint256 milestoneId,
        RewardKind rewardKind
    ) internal agreementExists(agreementId) returns (uint256 amount) {
        address carrier = _carrierForAgreement(agreementId);
        bytes32 key = _rewardKey(agreementId, milestoneId);

        if (carrier == address(0)) revert InvalidCarrier();
        if (!_milestoneIsVerified(agreementId, milestoneId)) revert MilestoneNotVerified();
        if (_milestoneRewarded[key]) revert MilestoneAlreadyRewarded();

        amount = _rewardFor(rewardKind);

        // Effects are recorded before the event is emitted.
        _milestoneRewarded[key] = true;
        _mintReputation(carrier, amount);

        emit ReputationRewarded(carrier, agreementId, milestoneId, rewardKind, amount);
    }

    function _rewardSuccessfulCompletion(
        uint256 agreementId
    ) internal agreementExists(agreementId) returns (uint256 amount) {
        address carrier = _carrierForAgreement(agreementId);

        if (carrier == address(0)) revert InvalidCarrier();
        if (!_agreementIsSuccessfullyCompleted(agreementId)) revert AgreementNotCompleted();
        if (_completionRewarded[agreementId]) revert CompletionAlreadyRewarded();

        _completionRewarded[agreementId] = true;
        amount = COMPLETION_REWARD;
        _mintReputation(carrier, amount);

        emit CompletionBonusRewarded(carrier, agreementId, amount);
    }

    function _rewardFor(RewardKind rewardKind) internal pure returns (uint256) {
        if (rewardKind == RewardKind.Pickup) return PICKUP_REWARD;
        if (rewardKind == RewardKind.Intermediate) return INTERMEDIATE_REWARD;
        return DELIVERY_REWARD;
    }

    function _mintReputation(address carrier, uint256 amount) private {
        if (amount == 0) revert ZeroReward();
        totalSupply += amount;
        _reputationBalance[carrier] += amount;
        emit Transfer(address(0), carrier, amount);
    }

    function _rewardKey(uint256 agreementId, uint256 milestoneId) private pure returns (bytes32) {
        return keccak256(abi.encode(agreementId, milestoneId));
    }

    // ---------------------------------------------------------------
    // Adapters onto shared state
    // ---------------------------------------------------------------

    // Implemented directly: AgreementRegistry's real field names are already
    // known (confirmed by reading contracts/AgreementRegistry.sol), so there
    // is no need to guess them behind a virtual hook.
    function _carrierForAgreement(uint256 agreementId) internal view returns (address) {
        return agreements[agreementId].carrier;
    }

    function _agreementIsSuccessfullyCompleted(uint256 agreementId) internal view returns (bool) {
        return agreements[agreementId].status == AgreementStatus.Completed;
    }

    // Stays virtual: milestone verification is owned by the milestone/escrow
    // module, which is not a parent of this contract. Implemented locally by
    // TokenisationTest.sol for testing, and by the final integrated contract
    // once the team composes this module with the real milestone module.
    function _milestoneIsVerified(
        uint256 agreementId,
        uint256 milestoneId
    ) internal view virtual returns (bool);
}
