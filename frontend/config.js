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
      "inputs": [{ "internalType": "uint8", "name": "role", "type": "uint8" }],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "carrier", "type": "address" },
        { "internalType": "uint256", "name": "payloadValue", "type": "uint256" },
        { "internalType": "uint256", "name": "milestoneCount", "type": "uint256" },
        { "internalType": "uint256", "name": "durationInDays", "type": "uint256" }
      ],
      "name": "createAgreement",
      "outputs": [{ "internalType": "uint256", "name": "agreementId", "type": "uint256" }],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "agreementId", "type": "uint256" }],
      "name": "getAgreement",
      "outputs": [
        {
          "components": [
            { "internalType": "uint256", "name": "id", "type": "uint256" },
            { "internalType": "address", "name": "shipper", "type": "address" },
            { "internalType": "address", "name": "carrier", "type": "address" },
            { "internalType": "uint256", "name": "payloadValue", "type": "uint256" },
            { "internalType": "uint256", "name": "milestoneCount", "type": "uint256" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" },
            { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
            { "internalType": "uint8", "name": "status", "type": "uint8" }
          ],
          "internalType": "struct AgreementRegistry.Agreement",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
      "name": "getUserRole",
      "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "agreementId", "type": "uint256" },
        { "internalType": "address", "name": "user", "type": "address" }
      ],
      "name": "isParticipant",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "agreementCount",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "userRole",
      "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
      "stateMutability": "view",
      "type": "function"
    },

    // ---- events ----
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
        { "indexed": false, "internalType": "uint8", "name": "role", "type": "uint8" }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "agreementId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "shipper", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "carrier", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "payloadValue", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "milestoneCount", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "AgreementCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "agreementId", "type": "uint256" },
        { "indexed": false, "internalType": "uint8", "name": "oldStatus", "type": "uint8" },
        { "indexed": false, "internalType": "uint8", "name": "newStatus", "type": "uint8" }
      ],
      "name": "AgreementStatusChanged",
      "type": "event"
    }
  ]
};
