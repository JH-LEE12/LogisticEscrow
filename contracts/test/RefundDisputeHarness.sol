// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Suggested location in the real project: contracts/test/RefundDisputeHarness.sol
// (imports below assume that location — adjust the relative paths if you
// put it somewhere else).
import "../AgreementRegistry.sol";
import "../RefundDispute.sol";

/**
 * @title RefundDisputeHarness
 * @notice TEST-ONLY contract. Lets you test RefundDispute.sol in isolation
 * before the whole team's modules are combined into LogisticsEscrow.sol.
 *
 * Do NOT submit this as part of the final contract — it's a stand-in for
 * Funding.sol and MilestonePayout.sol, with two minimal helper functions so
 * ETH actually exists in the contract to refund or split during tests.
 *
 * Once the real Funding.sol and MilestonePayout.sol are ready, you can
 * re-point Escrow.test.js at the combined LogisticsEscrow.sol instead — the
 * RefundDispute assertions themselves won't need to change, since they only
 * call functions that live in RefundDispute.sol.
 *
 * Consider adding this file to .gitignore alongside AgreementRegistryStandalone.sol,
 * the same way Member 1's standalone testing file is excluded.
 */
contract RefundDisputeHarness is AgreementRegistry, RefundDispute {
    /// @dev Stand-in for Funding.sol's fundAgreement(). Locks ETH matching
    /// the agreement's payloadValue and moves status Created -> Funded.
    function fundForTesting(uint256 agreementId)
        external
        payable
        agreementExists(agreementId)
        atStatus(agreementId, AgreementStatus.Created)
    {
        Agreement storage a = agreements[agreementId];
        require(msg.sender == a.shipper, "Harness: only the shipper can fund");
        require(msg.value == a.payloadValue, "Harness: value must match payloadValue");
        _setStatus(agreementId, AgreementStatus.Funded);
    }

    /// @dev Stand-in for MilestonePayout.sol's releasePayment(). Sends a
    /// partial amount to the Carrier and moves status Funded -> InProgress,
    /// so RefundDispute can be tested against a partially-paid agreement.
    function simulateMilestonePayout(uint256 agreementId, uint256 amount)
        external
        agreementExists(agreementId)
        atStatus(agreementId, AgreementStatus.Funded)
    {
        Agreement storage a = agreements[agreementId];
        require(amount <= address(this).balance, "Harness: amount exceeds balance");
        _setStatus(agreementId, AgreementStatus.InProgress);
        (bool sent, ) = payable(a.carrier).call{value: amount}("");
        require(sent, "Harness: payout transfer failed");
    }
}
