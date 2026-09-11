// signTest.js — generates a valid EIP-712 signature for testing
// registerUserWithSignature() in AdvancedAccessControl.sol.
//
// This CANNOT be done inside MetaMask/Truffle console alone — signing a
// typed message off-chain needs to happen in a script like this first.
//
// SETUP (one-time):
//   npm install ethers
//
// USAGE:
//   1. Fill in the values below (contract address, chain ID, private key)
//   2. Run: node signTest.js
//   3. Copy the printed signer address + signature
//   4. Paste them into the registerUserWithSignature() call in Truffle console

const { ethers } = require("ethers");

async function main() {
  // ---------------------------------------------------------------
  // CONFIGURE THESE
  // ---------------------------------------------------------------

  const PRIVATE_KEY = "PASTE_A_FRESH_PRIVATE_KEY_HERE_BEFORE_RUNNING"; //Demo purpose
  const CONTRACT_ADDRESS = "0x9dD7f3Ae91F62B82c35691AA03497d9C3a4323f9";

  // Chain ID: 1337 for Ganache (check your Ganache window to confirm),
  // 11155111 for Sepolia
  const CHAIN_ID = 11155111;

  // Role to register as: 1 = Shipper, 2 = Carrier
  const ROLE = 1;

  // Nonce — must match the on-chain nonce for this address (starts at 0,
  // increases by 1 each time this address uses a signature to register).
  // For a fresh, never-used address, this is 0.
  const NONCE = 0;

  // ---------------------------------------------------------------
  // Signing logic — no need to edit below this line
  // ---------------------------------------------------------------

  const wallet = new ethers.Wallet(PRIVATE_KEY);

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

  const value = {
    user: wallet.address,
    role: ROLE,
    nonce: NONCE,
  };

  const signature = await wallet.signTypedData(domain, types, value);

  console.log("=".repeat(60));
  console.log("Signer address (this is who gets registered):");
  console.log(wallet.address);
  console.log("");
  console.log("Role:", ROLE, "(1=Shipper, 2=Carrier)");
  console.log("Nonce:", NONCE);
  console.log("");
  console.log("Signature (copy this):");
  console.log(signature);
  console.log("=".repeat(60));
  console.log("");
  console.log("Now run this in Truffle console (from a DIFFERENT account,");
  console.log("to prove someone else can submit it on the signer's behalf):");
  console.log("");
  console.log(`await le.registerUserWithSignature(`);
  console.log(`  "${wallet.address}",`);
  console.log(`  ${ROLE},`);
  console.log(`  ${NONCE},`);
  console.log(`  "${signature}",`);
  console.log(`  { from: accounts[SOME_OTHER_INDEX] }`);
  console.log(`)`);
}

main().catch(console.error);
