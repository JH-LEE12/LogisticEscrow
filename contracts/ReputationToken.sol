// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgreementRegistry.sol";

/// @title ReputationToken
/// @notice Custom group token standard rewarding platform users (Shippers & Carriers)
/// with non-transferable/reputation tokens based on agreement completion.
abstract contract ReputationToken is AgreementRegistry {
    // ---------------------------------------------------------------------
    // ERC-20 Style Standard State Variables & Mappings
    // ---------------------------------------------------------------------
    string public constant tokenName = "Logistics Reputation Token";
    string public constant tokenSymbol = "LRT";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // Reputation reward rates (e.g. 10 LRT tokens minted per successful milestone)
    uint256 public constant MILESTONE_REWARD = 10 * 10**18;
    uint256 public constant COMPLETION_BONUS = 50 * 10**18;

    // Track if a completion bonus was already claimed for an agreement
    mapping(uint256 => bool) public completionBonusClaimed;

    // ---------------------------------------------------------------------
    // Custom Errors & Events
    // ---------------------------------------------------------------------
    error TransferDisabled();
    error BonusAlreadyClaimed();

    event Transfer(address indexed from, address indexed to, uint256 value);
    event ReputationMinted(address indexed user, uint256 amount, string reason);

    // ---------------------------------------------------------------------
    // Internal Minting Engine
    // ---------------------------------------------------------------------
    function _mintReputation(address to, uint256 amount, string memory reason) internal {
        if (to == address(0)) revert ZeroAddress();

        totalSupply += amount;
        balanceOf[to] += amount;

        // ERC-20 standard Transfer event from 0x0 address indicates minting
        emit Transfer(address(0), to, amount);
        emit ReputationMinted(to, amount, reason);
    }

    // ---------------------------------------------------------------------
    // Token Standard Functions (Soulbound / Non-Transferable Rule)
    // ---------------------------------------------------------------------

    /// @dev Blocks transfers so reputation cannot be bought, sold, or faked.
    function transfer(address, uint256) external pure returns (bool) {
        revert TransferDisabled();
    }

    /// @dev Blocks transferFrom as well.
    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert TransferDisabled();
    }

    // ---------------------------------------------------------------------
    // Public Reputation Triggers
    // ---------------------------------------------------------------------

    /// @notice Allows participants of a completed agreement to claim their end-of-agreement bonus.
    function claimCompletionBonus(uint256 agreementId)
        external
        whenNotPaused
        agreementExists(agreementId)
        onlyParticipant(agreementId)
    {
        Agreement storage a = agreements[agreementId];
        if (a.status != AgreementStatus.Completed) {
            revert WrongStatus(agreementId, AgreementStatus.Completed, a.status);
        }
        if (completionBonusClaimed[agreementId]) {
            revert BonusAlreadyClaimed();
        }

        completionBonusClaimed[agreementId] = true;

        // Reward both Shipper and Carrier for successful fulfillment
        _mintReputation(a.shipper, COMPLETION_BONUS, "Agreement Completion Shipper Bonus");
        _mintReputation(a.carrier, COMPLETION_BONUS, "Agreement Completion Carrier Bonus");
    }
}
