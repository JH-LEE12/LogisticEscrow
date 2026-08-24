// config.js — contract connection settings shared by every page.
// Written by Member 1. Update this whenever a new version of the contract is deployed.
//
// IMPORTANT: the ABI below only covers AgreementRegistry's own functions
// (registerUser, createAgreement, view functions). This is enough for
// Member 1 to test the registration + agreement-creation flow alone in
// Remix using AgreementRegistryStandalone.sol.
//
// Once the whole team's modules are combined into the final
// `LogisticsEscrow.sol` and redeployed, REPLACE the ABI below with the
// full ABI Remix generates for that combined contract (it will include
// Funding, MilestonePayout, and RefundDispute's functions too, in addition
// to everything already listed here).

window.CHAINCONFIG = {
  // Paste the deployed contract address here after deploying in Remix.
  contractAddress: "0x0000000000000000000000000000000000000000",

  // ---------------------------------------------------------------
  // ABI below is generated verbatim from build/contracts/LogisticsEscrow.json
  // (the compiled combined contract). Do not hand-edit — re-copy it from
  // that artifact after every `truffle compile`.
  // ---------------------------------------------------------------
  contractABI: [
    {
      inputs: [],
      name: "AgreementNotCompleted",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "AgreementNotFound",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "AlreadyFinalized",
      type: "error",
    },
    {
      inputs: [],
      name: "AlreadyRegistered",
      type: "error",
    },
    {
      inputs: [],
      name: "ArbitratorAlreadySet",
      type: "error",
    },
    {
      inputs: [],
      name: "CarrierNotRegistered",
      type: "error",
    },
    {
      inputs: [],
      name: "CompletionAlreadyRewarded",
      type: "error",
    },
    {
      inputs: [],
      name: "ContractIsPaused",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "DeadlineNotPassed",
      type: "error",
    },
    {
      inputs: [],
      name: "DirectTransferNotAllowed",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "expected",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "received",
          type: "uint256",
        },
      ],
      name: "IncorrectFundingAmount",
      type: "error",
    },
    {
      inputs: [],
      name: "InsufficientContractBalance",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidCarrier",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidMerkleProof",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidMilestoneConfig",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidMilestoneIndex",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidNonce",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidRole",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidSignature",
      type: "error",
    },
    {
      inputs: [],
      name: "MerkleRootNotSet",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneAlreadyPaid",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneAlreadyRewarded",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneAlreadySubmitted",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneAlreadyVerified",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneInsufficientContractBalance",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneNotSubmitted",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneNotVerified",
      type: "error",
    },
    {
      inputs: [],
      name: "MilestoneTransferFailed",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "NotAgreementShipper",
      type: "error",
    },
    {
      inputs: [],
      name: "NotArbitrator",
      type: "error",
    },
    {
      inputs: [],
      name: "NotCarrier",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "NotDisputable",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "NotDisputed",
      type: "error",
    },
    {
      inputs: [],
      name: "NotOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "NotParticipant",
      type: "error",
    },
    {
      inputs: [],
      name: "NotShipper",
      type: "error",
    },
    {
      inputs: [],
      name: "TransferFailed",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "enum AgreementRegistry.AgreementStatus",
          name: "expected",
          type: "uint8",
        },
        {
          internalType: "enum AgreementRegistry.AgreementStatus",
          name: "actual",
          type: "uint8",
        },
      ],
      name: "WrongStatus",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroReward",
      type: "error",
    },
    {
      inputs: [],
      name: "ZeroValue",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "shipper",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "carrier",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "payloadValue",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint32",
          name: "milestoneCount",
          type: "uint32",
        },
        {
          indexed: false,
          internalType: "uint40",
          name: "deadline",
          type: "uint40",
        },
      ],
      name: "AgreementCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "shipper",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "AgreementFunded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "enum AgreementRegistry.AgreementStatus",
          name: "oldStatus",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "enum AgreementRegistry.AgreementStatus",
          name: "newStatus",
          type: "uint8",
        },
      ],
      name: "AgreementStatusChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "arbitrator",
          type: "address",
        },
      ],
      name: "ArbitratorSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "carrier",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "CompletionBonusRewarded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "raisedBy",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "reason",
          type: "string",
        },
      ],
      name: "DisputeRaised",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "arbitrator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "toShipper",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "toCarrier",
          type: "uint256",
        },
      ],
      name: "DisputeResolved",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "MilestoneSubmitted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "MilestoneVerified",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "count",
          type: "uint256",
        },
      ],
      name: "MilestonesConfigured",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Paused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "carrier",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "PaymentReleased",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "shipper",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "RefundIssued",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "carrier",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "milestoneId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "enum TokenisationModule.RewardKind",
          name: "rewardKind",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "ReputationRewarded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Unpaused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          indexed: false,
          internalType: "enum AgreementRegistry.Role",
          name: "role",
          type: "uint8",
        },
      ],
      name: "UserRegistered",
      type: "event",
    },
    {
      inputs: [],
      name: "COMPLETION_REWARD",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "DELIVERY_REWARD",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "DOMAIN_SEPARATOR",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "INTERMEDIATE_REWARD",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "PICKUP_REWARD",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "REGISTRATION_TYPEHASH",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "agreementCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "agreementMilestones",
      outputs: [
        {
          internalType: "string",
          name: "description",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isSubmitted",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "isVerified",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "isPaid",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "agreements",
      outputs: [
        {
          internalType: "address",
          name: "shipper",
          type: "address",
        },
        {
          internalType: "uint40",
          name: "deadline",
          type: "uint40",
        },
        {
          internalType: "uint40",
          name: "createdAt",
          type: "uint40",
        },
        {
          internalType: "enum AgreementRegistry.AgreementStatus",
          name: "status",
          type: "uint8",
        },
        {
          internalType: "address",
          name: "carrier",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "milestoneCount",
          type: "uint32",
        },
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "payloadValue",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "arbitrator",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "carrier",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "checkAndTriggerRefund",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "completionRewarded",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "carrier",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "payloadValue",
          type: "uint256",
        },
        {
          internalType: "uint32",
          name: "milestoneCount",
          type: "uint32",
        },
        {
          internalType: "uint40",
          name: "durationInDays",
          type: "uint40",
        },
      ],
      name: "createAgreement",
      outputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "escrowBalance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "fundAgreement",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "getAgreement",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "shipper",
              type: "address",
            },
            {
              internalType: "uint40",
              name: "deadline",
              type: "uint40",
            },
            {
              internalType: "uint40",
              name: "createdAt",
              type: "uint40",
            },
            {
              internalType: "enum AgreementRegistry.AgreementStatus",
              name: "status",
              type: "uint8",
            },
            {
              internalType: "address",
              name: "carrier",
              type: "address",
            },
            {
              internalType: "uint32",
              name: "milestoneCount",
              type: "uint32",
            },
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "payloadValue",
              type: "uint256",
            },
          ],
          internalType: "struct AgreementRegistry.Agreement",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "getEscrowBalance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "getMilestones",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isSubmitted",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isVerified",
              type: "bool",
            },
            {
              internalType: "bool",
              name: "isPaid",
              type: "bool",
            },
          ],
          internalType: "struct MilestonePayout.Milestone[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "getRefundDisputeHistory",
      outputs: [
        {
          components: [
            {
              internalType: "enum AgreementRegistry.AgreementStatus",
              name: "status",
              type: "uint8",
            },
            {
              internalType: "uint40",
              name: "timestamp",
              type: "uint40",
            },
          ],
          internalType: "struct RefundDispute.StatusLogEntry[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "getUserRole",
      outputs: [
        {
          internalType: "enum AgreementRegistry.Role",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "isDisputed",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "isParticipant",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "merkleRoot",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "milestoneId",
          type: "uint256",
        },
      ],
      name: "milestoneRewarded",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "nonces",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "paused",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "reason",
          type: "string",
        },
      ],
      name: "raiseDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32[]",
          name: "proof",
          type: "bytes32[]",
        },
      ],
      name: "registerCarrierWithProof",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "enum AgreementRegistry.Role",
          name: "role",
          type: "uint8",
        },
      ],
      name: "registerUser",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
        {
          internalType: "enum AgreementRegistry.Role",
          name: "role",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
      ],
      name: "registerUserWithSignature",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "carrier",
          type: "address",
        },
      ],
      name: "reputationLevel",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "toShipper",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "toCarrier",
          type: "uint256",
        },
      ],
      name: "resolveDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "arbitratorAddress",
          type: "address",
        },
      ],
      name: "setArbitrator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "root",
          type: "bytes32",
        },
      ],
      name: "setMerkleRoot",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "string[]",
          name: "descriptions",
          type: "string[]",
        },
        {
          internalType: "uint256[]",
          name: "amounts",
          type: "uint256[]",
        },
      ],
      name: "setupMilestones",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "submitMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "totalPaidOut",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "unpause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "userRole",
      outputs: [
        {
          internalType: "enum AgreementRegistry.Role",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "verifyAndReleaseMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      stateMutability: "payable",
      type: "receive",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "milestoneId",
          type: "uint256",
        },
        {
          internalType: "enum TokenisationModule.RewardKind",
          name: "rewardKind",
          type: "uint8",
        },
      ],
      name: "rewardMilestone",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "agreementId",
          type: "uint256",
        },
      ],
      name: "rewardCompletion",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
