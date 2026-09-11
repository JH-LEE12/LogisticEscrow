// demo_merkle.js — Fully self-contained Merkle proof demo for live
// presentation. Does EVERYTHING in one script run: publishes the root,
// then registers the whitelisted address. No MetaMask, no browser, no
// switching accounts mid-demo — just `node demo_merkle.js`.
//
// SETUP (one-time, before presentation day):
//   npm install ethers merkletreejs dotenv
//
// Your .env file (already exists from deployment) needs:
//   MNEMONIC=... (already there — this is your OWNER account)

require("dotenv").config();
const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");

async function main() {
  // ---------------------------------------------------------------
  // CONFIGURE THIS ONCE, BEFORE PRESENTATION DAY
  // ---------------------------------------------------------------

  // Private key of a FRESH, never-registered demo account — this is the
  // one that will actually register. It DOES need a small amount of
  // Sepolia ETH, since it pays its own gas for this one.
  const DEMO_CARRIER_PRIVATE_KEY = "PASTE_DEMO_MERKLE_ACCOUNT_PRIVATE_KEY_HERE";

  // The whitelist. Put your demo account's address FIRST.
  const APPROVED_CARRIERS = [
    "PASTE_DEMO_MERKLE_ACCOUNT_ADDRESS_HERE", // must match the private key above
    "0x8C1A1787b62313F163Cf1e93aAdB7c33b439f5C4",
  ];

  const CONTRACT_ADDRESS = "0x9dD7f3Ae91F62B82c35691AA03497d9C3a4323f9";
  const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

  // ---------------------------------------------------------------
  // No need to edit below this line
  // ---------------------------------------------------------------

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const ownerWallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC).connect(
    provider,
  );
  const demoWallet = new ethers.Wallet(DEMO_CARRIER_PRIVATE_KEY, provider);

  const abi = [
    "function setMerkleRoot(bytes32 root) external",
    "function registerCarrierWithProof(bytes32[] calldata proof) external",
  ];

  console.log("=".repeat(70));
  console.log("STEP 1 — Building the Merkle tree off-chain");
  console.log("=".repeat(70));

  const leaves = APPROVED_CARRIERS.map((addr) =>
    ethers.solidityPackedKeccak256(["address"], [addr]),
  );
  const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
  const root = tree.getHexRoot();
  const proof = tree.getHexProof(leaves[0]);

  console.log("Approved list size:", APPROVED_CARRIERS.length, "addresses");
  console.log("Demo address:", demoWallet.address);
  console.log("Computed root:", root);
  console.log("");

  console.log("=".repeat(70));
  console.log("STEP 2 — Owner publishes the root (one-time setup)");
  console.log("=".repeat(70));
  console.log("Owner address:", ownerWallet.address);

  const ownerContract = new ethers.Contract(CONTRACT_ADDRESS, abi, ownerWallet);
  const tx1 = await ownerContract.setMerkleRoot(root);
  console.log("Transaction sent:", tx1.hash);
  console.log("Waiting for confirmation...");
  const receipt1 = await tx1.wait();
  console.log("Status:", receipt1.status === 1 ? "SUCCESS" : "FAILED");
  console.log("");

  console.log("=".repeat(70));
  console.log("STEP 3 — Demo account proves membership and registers");
  console.log("=".repeat(70));

  const demoContract = new ethers.Contract(CONTRACT_ADDRESS, abi, demoWallet);
  const tx2 = await demoContract.registerCarrierWithProof(proof);
  console.log("Transaction sent:", tx2.hash);
  console.log("Waiting for confirmation...");
  const receipt2 = await tx2.wait();

  console.log("");
  console.log("=".repeat(70));
  console.log("DONE — Status:", receipt2.status === 1 ? "SUCCESS" : "FAILED");
  console.log("=".repeat(70));
  console.log("");
  console.log(demoWallet.address, "is now registered as Carrier — using");
  console.log("only a Merkle proof, never the ordinary registerUser().");
  console.log("");
  console.log("View on Etherscan:");
  console.log("Root:         https://sepolia.etherscan.io/tx/" + tx1.hash);
  console.log("Registration: https://sepolia.etherscan.io/tx/" + tx2.hash);
}

main().catch((err) => {
  console.error("");
  console.error("FAILED:", err.reason || err.shortMessage || err.message);
});
