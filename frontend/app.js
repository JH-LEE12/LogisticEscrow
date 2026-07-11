// app.js — shared wallet connection + contract call helpers.
// Written by Member 1. Every page (index.html, create.html, milestones.html,
// history.html) includes this file so nobody has to rewrite wallet-connect
// or contract-call logic from scratch.
//
// Requires: ethers.js (loaded via CDN in the HTML <head>), and config.js
// (loaded before this file) to provide window.CHAINCONFIG.

let provider;
let signer;
let contract;
let currentAccount = null;

// Mirrors AgreementRegistry.sol -> enum Role { None, Shipper, Carrier }
const ROLE = { NONE: 0, SHIPPER: 1, CARRIER: 2 };
const ROLE_LABEL = ["Not registered", "Shipper", "Carrier"];

// Mirrors AgreementRegistry.sol -> enum AgreementStatus
const STATUS_LABEL = ["Created", "Funded", "In Progress", "Completed", "Refunded", "Disputed"];

/**
 * Prompts MetaMask to connect, then sets up the ethers provider/signer/contract.
 * Call this from a "Connect Wallet" button.
 */
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected. Please install the MetaMask browser extension to use this dApp.");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    currentAccount = accounts[0];

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(
      window.CHAINCONFIG.contractAddress,
      window.CHAINCONFIG.contractABI,
      signer
    );

    // Reload automatically if the user switches account or network in MetaMask,
    // so the UI never shows stale data.
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());

    return currentAccount;
  } catch (err) {
    console.error("Wallet connection failed:", err);
    alert("Wallet connection failed. Check the browser console for details.");
    return null;
  }
}

/**
 * Silently reconnects if MetaMask already has an approved account for this site
 * (so users don't have to click "Connect" again every time they reload the page).
 */
async function restoreSession() {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (accounts.length > 0) {
    return connectWallet();
  }
  return null;
}

function getContract() {
  if (!contract) throw new Error("Wallet not connected yet — call connectWallet() first.");
  return contract;
}

function getCurrentAccount() {
  return currentAccount;
}

/**
 * Registers the connected wallet as Shipper or Carrier.
 * @param {number} role - use ROLE.SHIPPER or ROLE.CARRIER
 */
async function registerUser(role) {
  const c = getContract();
  const tx = await c.registerUser(role);
  await tx.wait();
}

async function getUserRole(address) {
  const c = getContract();
  const role = await c.getUserRole(address);
  return Number(role);
}

/**
 * Creates a new agreement. Only works if the connected wallet is registered as Shipper.
 * @param {string} carrierAddress
 * @param {string|number} payloadValueEth - amount in ETH (e.g. "0.5"), not wei
 * @param {number} milestoneCount
 * @param {number} durationInDays
 */
async function createAgreement(carrierAddress, payloadValueEth, milestoneCount, durationInDays) {
  const c = getContract();
  const payloadValueWei = ethers.parseEther(payloadValueEth.toString());
  const tx = await c.createAgreement(carrierAddress, payloadValueWei, milestoneCount, durationInDays);
  return tx.wait();
}

/**
 * Fetches one agreement and converts it into a plain, UI-friendly object.
 */
async function getAgreement(agreementId) {
  const c = getContract();
  const a = await c.getAgreement(agreementId);
  return {
    id: Number(a.id),
    shipper: a.shipper,
    carrier: a.carrier,
    payloadValueEth: ethers.formatEther(a.payloadValue),
    milestoneCount: Number(a.milestoneCount),
    deadline: new Date(Number(a.deadline) * 1000),
    createdAt: new Date(Number(a.createdAt) * 1000),
    statusCode: Number(a.status),
    statusLabel: STATUS_LABEL[Number(a.status)]
  };
}

async function getAgreementCount() {
  const c = getContract();
  const count = await c.agreementCount();
  return Number(count);
}

/**
 * Loops through every agreement and returns only the ones the given address
 * is part of (as Shipper or Carrier). Fine for a small class-project dataset;
 * a larger production app would index this off-chain instead.
 */
async function getMyAgreements(address) {
  const total = await getAgreementCount();
  const mine = [];
  for (let id = 1; id <= total; id++) {
    const a = await getAgreement(id);
    if (
      a.shipper.toLowerCase() === address.toLowerCase() ||
      a.carrier.toLowerCase() === address.toLowerCase()
    ) {
      mine.push(a);
    }
  }
  return mine;
}
