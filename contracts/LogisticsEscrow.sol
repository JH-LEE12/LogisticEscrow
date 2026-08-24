// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdvancedAccessControl.sol";
import "./Funding.sol";
import "./RefundDispute.sol";
import "./MilestonePayout.sol";
import "./TokenisationModule.sol";

/// @title LogisticsEscrow
/// @notice Final integration — combines every member's module via inheritance.
/// No changes were made to any individual member's file. The only new code
/// here is the one adapter TokenisationModule.sol was deliberately left
/// abstract for, plus two small trigger functions so its (internal-only)
/// reward logic can actually be called.
contract LogisticsEscrow is
    AdvancedAccessControl,
    Funding,
    RefundDispute,
    MilestonePayout,
    TokenisationModule
{
    // ---------------------------------------------------------------
    // Required override — TokenisationModule.sol left this abstract on
    // purpose, expecting the integrator to supply it. Reads directly
    // from MilestonePayout's own Milestone struct — no new state added.
    // ---------------------------------------------------------------

    function _milestoneIsVerified(
        uint256 agreementId,
        uint256 milestoneId
    ) internal view override returns (bool) {
        return agreementMilestones[agreementId][milestoneId].isVerified;
    }

    // ---------------------------------------------------------------
    // Trigger functions — TokenisationModule's reward functions are
    // `internal`, so something has to call them. Kept as thin
    // pass-throughs; all the real validation (already-rewarded checks,
    // milestone-verified checks, etc.) happens inside her module, not here.
    // Restricted to agreement participants so it can't be spammed by
    // unrelated wallets.
    // ---------------------------------------------------------------

    function rewardMilestone(
        uint256 agreementId,
        uint256 milestoneId,
        RewardKind rewardKind
    ) external onlyParticipant(agreementId) returns (uint256) {
        return _rewardVerifiedMilestone(agreementId, milestoneId, rewardKind);
    }

    function rewardCompletion(uint256 agreementId) external onlyParticipant(agreementId) returns (uint256) {
        return _rewardSuccessfulCompletion(agreementId);
    }
}
