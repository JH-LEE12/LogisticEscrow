// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgreementRegistry.sol";

/// @title Funding
/// @notice Handles ETH funding and escrow balance for logistics agreements.
abstract contract Funding is AgreementRegistry {
    // Records the ETH currently locked for each agreement.
    mapping(uint256 => uint256) public escrowBalance;

    // Custom errors save gas compared with long require messages.
    error NotAgreementShipper(uint256 agreementId);
    error IncorrectFundingAmount(uint256 expected, uint256 received);
    error DirectTransferNotAllowed();

    event AgreementFunded(
        uint256 indexed agreementId,
        address indexed shipper,
        uint256 amount
    );

    /// @notice Fund an agreement using the exact payload value.
    /// @param agreementId The ID of the agreement to fund.
    function fundAgreement(
        uint256 agreementId
    )
        external
        payable
        whenNotPaused
        agreementExists(agreementId)
        atStatus(agreementId, AgreementStatus.Created)
    {
        Agreement storage agreement = agreements[agreementId];

        // Only the Shipper who created this agreement may fund it.
        if (msg.sender != agreement.shipper) {
            revert NotAgreementShipper(agreementId);
        }

        // The deposited ETH must exactly match the payload value.
        if (msg.value != agreement.payloadValue) {
            revert IncorrectFundingAmount(agreement.payloadValue, msg.value);
        }

        // Lock the ETH under this agreement.
        escrowBalance[agreementId] = msg.value;

        // Change agreement status: Created -> Funded.
        _setStatus(agreementId, AgreementStatus.Funded);

        emit AgreementFunded(agreementId, msg.sender, msg.value);
    }

    /// @notice View the locked ETH balance of an agreement.
    /// @dev Only the agreement's Shipper or Carrier may view it.
    function getEscrowBalance(
        uint256 agreementId
    )
        external
        view
        agreementExists(agreementId)
        onlyParticipant(agreementId)
        returns (uint256)
    {
        return escrowBalance[agreementId];
    }

    /// @notice Reject ETH sent without specifying an agreement.
    receive() external payable {
        revert DirectTransferNotAllowed();
    }
}
