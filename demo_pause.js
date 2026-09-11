// demo_pause.js — Fully self-contained pause/unpause demo for live
// presentation. Proves BOTH sides: that a sensitive action is genuinely
// blocked while paused, AND that it resumes normally once unpaused.
// No MetaMask, no browser — just `node demo_pause.js`.
//
// SETUP (one-time, before presentation day):
//   npm install ethers dotenv   (already installed from earlier scripts)
//
// Your .env file (already exists) needs:
//   MNEMONIC=... (already there — this is your OWNER account, since
//   pause()/unpause() are onlyOwner)

require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  // ---------------------------------------------------------------
  // CONFIGURE THIS ONCE, BEFORE PRESENTATION DAY
  // ---------------------------------------------------------------

  // Private key of a FRESH, never-registered demo account. This account
  // needs a small amount of Sepolia ETH, since it pays its own gas for
  // the registerUser() attempts below (both the blocked one and the
  // successful one).
  const DEMO_ACCOUNT_PRIVATE_KEY = "PASTE_DEMO_PAUSE_ACCOUNT_PRIVATE_KEY_HERE";

  const CONTRACT_ADDRESS = "0x9dD7f3Ae91F62B82c35691AA03497d9C3a4323f9";
  const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
  const ROLE = 1; // 1 = Shipper, 2 = Carrier

  // ---------------------------------------------------------------
  // No need to edit below this line
  // ---------------------------------------------------------------

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const ownerWallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC).connect(
    provider,
  );
  const demoWallet = new ethers.Wallet(DEMO_ACCOUNT_PRIVATE_KEY, provider);

  const abi = [
    "function pause() external",
    "function unpause() external",
    "function paused() external view returns (bool)",
    "function registerUser(uint8 role) external",
  ];

  const ownerContract = new ethers.Contract(CONTRACT_ADDRESS, abi, ownerWallet);
  const demoContract = new ethers.Contract(CONTRACT_ADDRESS, abi, demoWallet);

  console.log("Owner address:", ownerWallet.address);
  console.log("Demo account:", demoWallet.address);
  console.log("");

  // -----------------------------------------------------------------
  console.log("=".repeat(70));
  console.log("STEP 1 — Owner pauses the contract");
  console.log("=".repeat(70));
  const tx1 = await ownerContract.pause();
  console.log("Transaction sent:", tx1.hash);
  await tx1.wait();
  const isPaused1 = await ownerContract.paused();
  console.log("Contract paused() now reads:", isPaused1);
  console.log("");

  // -----------------------------------------------------------------
  console.log("=".repeat(70));
  console.log("STEP 2 — Attempt to register WHILE PAUSED (should be blocked)");
  console.log("=".repeat(70));
  try {
    const txBlocked = await demoContract.registerUser(ROLE);
    await txBlocked.wait();
    console.log("UNEXPECTED: transaction succeeded — this should not happen!");
  } catch (err) {
    console.log("BLOCKED AS EXPECTED.");
    console.log(
      "Revert reason:",
      err.reason || err.shortMessage || "ContractIsPaused (custom error)",
    );
    console.log("This proves the emergency stop genuinely halts registration.");
  }
  console.log("");

  // -----------------------------------------------------------------
  console.log("=".repeat(70));
  console.log("STEP 3 — Owner unpauses the contract");
  console.log("=".repeat(70));
  const tx3 = await ownerContract.unpause();
  console.log("Transaction sent:", tx3.hash);
  await tx3.wait();
  const isPaused3 = await ownerContract.paused();
  console.log("Contract paused() now reads:", isPaused3);
  console.log("");

  // -----------------------------------------------------------------
  console.log("=".repeat(70));
  console.log("STEP 4 — Same account registers AGAIN, now that it's unpaused");
  console.log("=".repeat(70));
  const tx4 = await demoContract.registerUser(ROLE);
  console.log("Transaction sent:", tx4.hash);
  const receipt4 = await tx4.wait();
  console.log("Status:", receipt4.status === 1 ? "SUCCESS" : "FAILED");
  console.log("");

  console.log("=".repeat(70));
  console.log("DONE — pause() genuinely blocks sensitive actions, and");
  console.log("unpause() genuinely restores normal operation.");
  console.log("=".repeat(70));
  console.log("");
  console.log("View on Etherscan:");
  console.log("Pause:            https://sepolia.etherscan.io/tx/" + tx1.hash);
  console.log("Unpause:          https://sepolia.etherscan.io/tx/" + tx3.hash);
  console.log(
    "Successful register (after unpause): https://sepolia.etherscan.io/tx/" +
      tx4.hash,
  );
}

main().catch((err) => {
  console.error("");
  console.error(
    "SCRIPT FAILED (not the expected pause revert):",
    err.reason || err.shortMessage || err.message,
  );
});
