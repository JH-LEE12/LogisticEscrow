// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgreementRegistry
/// @notice Foundation module: roles, agreement storage, access control.
/// Other modules (Funding, MilestonePayout, RefundDispute, AdvancedAccessControl, TokenisationModule) inherit this contract directly.
abstract contract AgreementRegistry {
  // ---------------------------------------------------------------
  // Enums
  // ---------------------------------------------------------------

  enum Role {
    None,
    Shipper,
    Carrier
  }

  enum AgreementStatus {
    Created,
    Funded,
    InProgress,
    Completed,
    Refunded,
    Disputed
  }

  // ---------------------------------------------------------------
  // Struct — fields ordered to pack into 4 storage slots instead of 8
  // (saves ~50% gas on every new agreement write)
  // ---------------------------------------------------------------

  struct Agreement {
    // slot 1: address (20 bytes) + deadline (5) + createdAt (5) + status (1) = 31 bytes
    address shipper;
    uint40 deadline;
    uint40 createdAt;
    AgreementStatus status;
    // slot 2: address (20 bytes) + milestoneCount (4 bytes)
    address carrier;
    uint32 milestoneCount;
    // slot 3
    uint256 id;
    // slot 4 — kept full uint256 for money precision
    uint256 payloadValue;
  }

  // ---------------------------------------------------------------
  // Storage
  // ---------------------------------------------------------------

  address public owner;
  bool public paused;

  mapping(address => Role) public userRole;
  mapping(uint256 => Agreement) public agreements;
  uint256 public agreementCount;

  // ---------------------------------------------------------------
  // Custom errors (cheaper than require strings)
  // ---------------------------------------------------------------

  error NotOwner();
  error ContractIsPaused();
  error ZeroAddress();
  error ZeroValue();
  error InvalidRole();
  error AlreadyRegistered();
  error NotShipper();
  error NotCarrier();
  error CarrierNotRegistered();
  error NotParticipant(uint256 agreementId);
  error AgreementNotFound(uint256 agreementId);
  error WrongStatus(
    uint256 agreementId,
    AgreementStatus expected,
    AgreementStatus actual
  );

  // ---------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------

  event UserRegistered(address indexed user, Role role);
  event AgreementCreated(
    uint256 indexed agreementId,
    address indexed shipper,
    address indexed carrier,
    uint256 payloadValue,
    uint32 milestoneCount,
    uint40 deadline
  );
  event AgreementStatusChanged(
    uint256 indexed agreementId,
    AgreementStatus oldStatus,
    AgreementStatus newStatus
  );
  event Paused(address account);
  event Unpaused(address account);

  // ---------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------

  constructor() {
    owner = msg.sender;
  }

  // ---------------------------------------------------------------
  // Modifiers
  // ---------------------------------------------------------------

  modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
  }

  modifier whenNotPaused() {
    if (paused) revert ContractIsPaused();
    _;
  }

  modifier onlyShipper() {
    if (userRole[msg.sender] != Role.Shipper) revert NotShipper();
    _;
  }

  modifier onlyCarrier() {
    if (userRole[msg.sender] != Role.Carrier) revert NotCarrier();
    _;
  }

  modifier onlyParticipant(uint256 agreementId) {
    Agreement storage a = agreements[agreementId];
    if (msg.sender != a.shipper && msg.sender != a.carrier)
      revert NotParticipant(agreementId);
    _;
  }

  modifier agreementExists(uint256 agreementId) {
    if (agreementId == 0 || agreementId > agreementCount)
      revert AgreementNotFound(agreementId);
    _;
  }

  modifier atStatus(uint256 agreementId, AgreementStatus expected) {
    AgreementStatus actual = agreements[agreementId].status;
    if (actual != expected) revert WrongStatus(agreementId, expected, actual);
    _;
  }

  // ---------------------------------------------------------------
  // Admin controls (emergency stop)
  // ---------------------------------------------------------------

  function pause() external onlyOwner {
    paused = true;
    emit Paused(msg.sender);
  }

  function unpause() external onlyOwner {
    paused = false;
    emit Unpaused(msg.sender);
  }

  // ---------------------------------------------------------------
  // Core functions
  // ---------------------------------------------------------------

  function registerUser(Role role) external whenNotPaused {
    if (role != Role.Shipper && role != Role.Carrier) revert InvalidRole();
    if (userRole[msg.sender] != Role.None) revert AlreadyRegistered();

    userRole[msg.sender] = role;
    emit UserRegistered(msg.sender, role);
  }

  function createAgreement(
    address carrier,
    uint256 payloadValue,
    uint32 milestoneCount,
    uint40 durationInDays
  ) external onlyShipper whenNotPaused returns (uint256 agreementId) {
    if (carrier == address(0)) revert ZeroAddress();
    if (userRole[carrier] != Role.Carrier) revert CarrierNotRegistered();
    if (payloadValue == 0) revert ZeroValue();
    if (milestoneCount == 0) revert ZeroValue();

    agreementCount += 1;
    agreementId = agreementCount;

    uint40 deadline = uint40(block.timestamp) + (durationInDays * 1 days);

    agreements[agreementId] = Agreement({
      shipper: msg.sender,
      deadline: deadline,
      createdAt: uint40(block.timestamp),
      status: AgreementStatus.Created,
      carrier: carrier,
      milestoneCount: milestoneCount,
      id: agreementId,
      payloadValue: payloadValue
    });

    emit AgreementCreated(
      agreementId,
      msg.sender,
      carrier,
      payloadValue,
      milestoneCount,
      deadline
    );
  }

  // ---------------------------------------------------------------
  // Internal helper for other modules
  // ---------------------------------------------------------------

  function _setStatus(uint256 agreementId, AgreementStatus newStatus) internal {
    AgreementStatus oldStatus = agreements[agreementId].status;
    agreements[agreementId].status = newStatus;
    emit AgreementStatusChanged(agreementId, oldStatus, newStatus);
  }

  // ---------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------

  function getAgreement(
    uint256 agreementId
  ) external view agreementExists(agreementId) returns (Agreement memory) {
    return agreements[agreementId];
  }

  function getUserRole(address user) external view returns (Role) {
    return userRole[user];
  }

  function isParticipant(
    uint256 agreementId,
    address user
  ) external view returns (bool) {
    Agreement storage a = agreements[agreementId];
    return user == a.shipper || user == a.carrier;
  }
}
