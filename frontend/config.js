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

  contractABI: [
    // ---- functions ----
    {
      inputs: [{ internalType: "uint8", name: "role", type: "uint8" }],
      name: "registerUser",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "carrier", type: "address" },
        { internalType: "uint256", name: "payloadValue", type: "uint256" },
        { internalType: "uint256", name: "milestoneCount", type: "uint256" },
        { internalType: "uint256", name: "durationInDays", type: "uint256" },
      ],
      name: "createAgreement",
      outputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      name: "getAgreement",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "address", name: "shipper", type: "address" },
            { internalType: "address", name: "carrier", type: "address" },
            { internalType: "uint256", name: "payloadValue", type: "uint256" },
            {
              internalType: "uint256",
              name: "milestoneCount",
              type: "uint256",
            },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "uint256", name: "createdAt", type: "uint256" },
            { internalType: "uint8", name: "status", type: "uint8" },
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
      inputs: [{ internalType: "address", name: "user", type: "address" }],
      name: "getUserRole",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "address", name: "user", type: "address" },
      ],
      name: "isParticipant",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "agreementCount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "userRole",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },

    // ---- events ----
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "user",
          type: "address",
        },
        { indexed: false, internalType: "uint8", name: "role", type: "uint8" },
      ],
      name: "UserRegistered",
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
          internalType: "uint256",
          name: "milestoneCount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "deadline",
          type: "uint256",
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
          indexed: false,
          internalType: "uint8",
          name: "oldStatus",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "newStatus",
          type: "uint8",
        },
      ],
      name: "AgreementStatusChanged",
      type: "event",
    },

    // ---- MilestonePayout functions (Member 3) ----
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "string[]", name: "descriptions", type: "string[]" },
        { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      ],
      name: "setupMilestones",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "uint256", name: "index", type: "uint256" },
      ],
      name: "submitMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "uint256", name: "index", type: "uint256" },
      ],
      name: "verifyAndReleaseMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      name: "getMilestones",
      outputs: [
        {
          components: [
            { internalType: "string", name: "description", type: "string" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "bool", name: "isSubmitted", type: "bool" },
            { internalType: "bool", name: "isVerified", type: "bool" },
            { internalType: "bool", name: "isPaid", type: "bool" },
          ],
          internalType: "struct MilestonePayout.Milestone[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    // ---- MilestonePayout events (Member 3) ----
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

    // ---- RefundDispute functions (Member 4) ----
    {
      inputs: [
        { internalType: "address", name: "arbitratorAddress", type: "address" },
      ],
      name: "setArbitrator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "arbitrator",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      name: "checkAndTriggerRefund",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "string", name: "reason", type: "string" },
      ],
      name: "raiseDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "uint256", name: "toShipper", type: "uint256" },
        { internalType: "uint256", name: "toCarrier", type: "uint256" },
      ],
      name: "resolveDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "isDisputed",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      name: "getRefundDisputeHistory",
      outputs: [
        {
          components: [
            { internalType: "uint8", name: "status", type: "uint8" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
          ],
          internalType: "struct RefundDispute.StatusLogEntry[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    // ---- RefundDispute events (Member 4) ----
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
          name: "arbitrator",
          type: "address",
        },
      ],
      name: "ArbitratorSet",
      type: "event",
    },

    // ---- ReputationToken functions (Member 5) ----
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      name: "claimCompletionBonus",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },

    // ---- ReputationToken events (Member 5) ----
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
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "reason",
          type: "string",
        },
      ],
      name: "ReputationMinted",
      type: "event",
    },

    // ---- TokenisationModule functions (Member 5 — Tokenisation) ----
    // balanceOf/totalSupply/name/symbol/decimals are already declared above
    // under "ReputationToken functions (Member 5)" with identical signatures,
    // so they aren't repeated here.
    {
      inputs: [{ internalType: "address", name: "carrier", type: "address" }],
      name: "reputationLevel",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "uint256", name: "milestoneId", type: "uint256" },
      ],
      name: "milestoneRewarded",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      name: "completionRewarded",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },

    // ---- TokenisationModule events (Member 5 — Tokenisation) ----
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
          internalType: "uint8",
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

    // ---- HARNESS-ONLY (RefundDisputeHarness.sol) — remove once testing against real LogisticsEscrow ----
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
      ],
      name: "fundForTesting",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "agreementId", type: "uint256" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "simulateMilestonePayout",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
