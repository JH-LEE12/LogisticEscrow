// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgreementRegistry.sol";

/// @title AdvancedAccessControl
/// @notice Advanced registration mechanisms on top of AgreementRegistry:
///   1. EIP-712 signatures — gasless registration via off-chain signing
///   2. Merkle proofs — cheap on-chain whitelist verification
/// Teammates can inherit this file instead of AgreementRegistry directly
/// to gain both the base module AND these two features at once.
abstract contract AdvancedAccessControl is AgreementRegistry {
    // =================================================================
    // Part 1: EIP-712 Signature Verification (gasless registration)
    // =================================================================

    bytes32 public immutable DOMAIN_SEPARATOR;

    // keccak256("Registration(address user,uint8 role,uint256 nonce)")
    bytes32 public constant REGISTRATION_TYPEHASH =
        keccak256("Registration(address user,uint8 role,uint256 nonce)");

    mapping(address => uint256) public nonces;

    error InvalidSignature();
    error InvalidNonce();

    constructor() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("LogisticsEscrow"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    /// @notice Register on behalf of `user`, using their off-chain signature.
    function registerUserWithSignature(
        address user,
        Role role,
        uint256 nonce,
        bytes calldata signature
    ) external whenNotPaused {
        if (nonce != nonces[user]) revert InvalidNonce();
        if (role != Role.Shipper && role != Role.Carrier) revert InvalidRole();
        if (userRole[user] != Role.None) revert AlreadyRegistered();

        bytes32 structHash = keccak256(abi.encode(REGISTRATION_TYPEHASH, user, role, nonce));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        address signer = _recoverSigner(digest, signature);
        if (signer != user) revert InvalidSignature();

        nonces[user] += 1;
        userRole[user] = role;
        emit UserRegistered(user, role);
    }

    /// @dev Splits a 65-byte signature and recovers the signer address.
    function _recoverSigner(bytes32 digest, bytes calldata signature) internal pure returns (address) {
        if (signature.length != 65) revert InvalidSignature();

        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        return ecrecover(digest, v, r, s);
    }

    // =================================================================
    // Part 2: Merkle Tree Whitelist
    // =================================================================

    bytes32 public merkleRoot;

    error MerkleRootNotSet();
    error InvalidMerkleProof();

    /// @notice Owner publishes the root hash of the approved Carrier list.
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
    }

    /// @notice Register as Carrier by proving membership in the whitelist.
    function registerCarrierWithProof(bytes32[] calldata proof) external whenNotPaused {
        if (merkleRoot == bytes32(0)) revert MerkleRootNotSet();
        if (userRole[msg.sender] != Role.None) revert AlreadyRegistered();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!_verifyProof(proof, leaf)) revert InvalidMerkleProof();

        userRole[msg.sender] = Role.Carrier;
        emit UserRegistered(msg.sender, Role.Carrier);
    }

    /// @dev Walks the proof up to the root, hashing pairs in sorted order.
    function _verifyProof(bytes32[] calldata proof, bytes32 leaf) internal view returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == merkleRoot;
    }
}
