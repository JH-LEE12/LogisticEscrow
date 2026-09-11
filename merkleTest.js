// merkleTest.js — generates a Merkle root and proof for demoing
// setMerkleRoot() + registerCarrierWithProof() in AdvancedAccessControl.sol.
//
// Same idea as signTest.js for EIP-712: this CANNOT be demoed through the
// UI alone, since there's no frontend page for it. This script builds the
// tree offline, then gives you two ready-to-paste console commands.
//
// SETUP (one-time):
//   npm install merkletreejs ethers
//
// USAGE:
//   1. Fill in the pre-approved Carrier addresses below (use real Ganache
//      or Sepolia addresses you have access to for the demo)
//   2. Run: node merkleTest.js
//   3. Copy the printed root + the printed proof for whichever address
//      you want to demo registering
//   4. As the contract OWNER: call setMerkleRoot(root) — one-time setup
//   5. As the WHITELISTED address: call registerCarrierWithProof(proof)

const { MerkleTree } = require("merkletreejs");
const { ethers } = require("ethers");

async function main() {
  // ---------------------------------------------------------------
  // CONFIGURE THIS — the pre-approved Carrier whitelist
  // ---------------------------------------------------------------

  const APPROVED_CARRIERS = [
    "0x2c8d7E0ef6A5D0dFE1c112A0A47f2F8431aA5A9e", //To be used within the demo
    "0x999c5BE8E0d85c63d0D23C2055097177eBB36BEE",
    "0xbAAaC7108e636B77Efd806417182A6FB1AB17065",
    "0x8C1A1787b62313F163Cf1e93aAdB7c33b439f5C4",
    "0x36ffc47ECa969a320D791BcBD439cB337bbc733d",
    // Add as many as you like — the tree scales to any list size for the
    // same on-chain storage cost (just one root, always).
  ];

  // Which address in the list above you want to demo registering.
  const DEMO_INDEX = 0;

  // ---------------------------------------------------------------
  // Tree building — matches _verifyProof()'s sorted-pair keccak256
  // logic in AdvancedAccessControl.sol exactly. No need to edit below.
  // ---------------------------------------------------------------

  // Each leaf = keccak256(abi.encodePacked(address)) — matches the
  // contract's: keccak256(abi.encodePacked(msg.sender))
  const leaves = APPROVED_CARRIERS.map((addr) =>
    ethers.solidityPackedKeccak256(["address"], [addr]),
  );

  const tree = new MerkleTree(leaves, ethers.keccak256, {
    sortPairs: true, // matches the contract's "if (computedHash < proofElement)" sort logic
  });

  const root = tree.getHexRoot();
  const demoLeaf = leaves[DEMO_INDEX];
  const proof = tree.getHexProof(demoLeaf);

  console.log("=".repeat(60));
  console.log("Merkle root (call setMerkleRoot with this, as OWNER):");
  console.log(root);
  console.log("");
  console.log("Demo address:", APPROVED_CARRIERS[DEMO_INDEX]);
  console.log("");
  console.log("Proof for that address (call registerCarrierWithProof with");
  console.log("this, FROM that exact address):");
  console.log(JSON.stringify(proof));
  console.log("=".repeat(60));
  console.log("");
  console.log("Step 1 — as the contract owner, in Truffle console:");
  console.log(`await le.setMerkleRoot("${root}", { from: OWNER_ADDRESS })`);
  console.log("");
  console.log("Step 2 — switch MetaMask to the demo address, then in the");
  console.log("browser DevTools console on your live site:");
  console.log(`let c = getContract();`);
  console.log(`await c.registerCarrierWithProof(${JSON.stringify(proof)});`);
}

main().catch(console.error);
