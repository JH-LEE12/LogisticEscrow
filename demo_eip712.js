// demo_eip712.js — Fully self-contained EIP-712 demo for live presentation.
//
// Does EVERYTHING in one script run: signs off-chain, then submits the
// transaction from a DIFFERENT account. No MetaMask, no browser, no
// switching accounts mid-demo — just `node demo_eip712.js`.
//
// SETUP (one-time, before presentation day):
//   npm install ethers dotenv
//
// Your .env file (already exists from deployment) needs:
//   MNEMONIC=... (already there — this is your deployer/submitter account)

require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  // ---------------------------------------------------------------
  // CONFIGURE THIS ONCE, BEFORE PRESENTATION DAY
  // ---------------------------------------------------------------

  // Private key of a FRESH, never-registered demo account
  const SIGNER_PRIVATE_KEY = "PASTE_DEMO_EIP712_ACCOUNT_PRIVATE_KEY_HERE";

  const CONTRACT_ADDRESS = "0x9dD7f3Ae91F62B82c35691AA03497d9C3a4323f9";
  const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
  const CHAIN_ID = 11155111;
  const ROLE = 1; // 1 = Shipper, 2 = Carrier
  const NONCE = 0; // 0 for a fresh, never-used address

  // ---------------------------------------------------------------
  // No need to edit below this line
  // ---------------------------------------------------------------

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // The SIGNER — proves identity off-chain, never sends a transaction.
  const signerWallet = new ethers.Wallet(SIGNER_PRIVATE_KEY);

  // The SUBMITTER — your deployer account, pays gas, submits on the
  // signer's behalf. This is the whole point of the demo.
  const submitterWallet = ethers.Wallet.fromPhrase(
    process.env.MNEMONIC,
  ).connect(provider);

  console.log("=".repeat(70));
  console.log("STEP 1 — Signing off-chain (no gas, no transaction)");
  console.log("=".repeat(70));
  console.log("Signer address:", signerWallet.address);

  const domain = {
    name: "LogisticsEscrow",
    version: "1",
    chainId: CHAIN_ID,
    verifyingContract: CONTRACT_ADDRESS,
  };
  const types = {
    Registration: [
      { name: "user", type: "address" },
      { name: "role", type: "uint8" },
      { name: "nonce", type: "uint256" },
    ],
  };
  const value = { user: signerWallet.address, role: ROLE, nonce: NONCE };

  const signature = await signerWallet.signTypedData(domain, types, value);
  console.log("Signature generated:", signature);
  console.log("");

  console.log("=".repeat(70));
  console.log("STEP 2 — Submitting on-chain FROM A DIFFERENT ACCOUNT");
  console.log("=".repeat(70));
  console.log("Submitter address (pays gas):", submitterWallet.address);
  console.log("Sending transaction...");

  const abi = [
    "function registerUserWithSignature(address user, uint8 role, uint256 nonce, bytes calldata signature) external",
  ];
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, submitterWallet);

  const tx = await contract.registerUserWithSignature(
    signerWallet.address,
    ROLE,
    NONCE,
    signature,
  );
  console.log("Transaction sent:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("");
  console.log("=".repeat(70));
  console.log("DONE — Status:", receipt.status === 1 ? "SUCCESS" : "FAILED");
  console.log("=".repeat(70));
  console.log("");
  console.log("Signer", signerWallet.address, "is now registered — and never");
  console.log("sent a transaction or paid any gas themselves.");
  console.log("");
  console.log("View on Etherscan:");
  console.log("https://sepolia.etherscan.io/tx/" + tx.hash);
}

main().catch((err) => {
  console.error("");
  console.error("FAILED:", err.reason || err.shortMessage || err.message);
});
