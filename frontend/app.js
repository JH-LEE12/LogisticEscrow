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
const STATUS_LABEL = [
  "Created",
  "Funded",
  "In Progress",
  "Completed",
  "Refunded",
  "Disputed",
];

// The block this contract was deployed in — nothing relevant can predate it.
const DEPLOYMENT_BLOCK = 11656900;

// Sepolia RPC providers (including the Infura endpoint MetaMask reads through)
// reject any eth_getLogs spanning more than 10,000 blocks. Stay clear of it.
const LOG_CHUNK = 9000;

/**
 * Same contract.queryFilter(), but split into windows the RPC will accept.
 *
 * ethers defaults toBlock to "latest" when you only pass fromBlock, so a single
 * call covers the whole chain since deployment and grows by a block every ~12s.
 * Once that span passed 10,000 the node started rejecting it outright with
 * `-32602 range N exceeds limit of 10000`, which is what broke the History and
 * Reputation pages. Passing an explicit toBlock on every request fixes it for
 * good — the loop grows with the chain instead of overflowing.
 */
async function queryFilterChunked(
  contract,
  filter,
  fromBlock = DEPLOYMENT_BLOCK,
) {
  // runner is a Signer here (getContract() builds with one), so the provider
  // hangs off it — but fall back in case a read-only provider is used later.
  const runner = contract.runner;
  const latest = await (runner.provider ?? runner).getBlockNumber();
  const logs = [];

  for (let start = fromBlock; start <= latest; start += LOG_CHUNK) {
    const end = Math.min(start + LOG_CHUNK - 1, latest);
    logs.push(...(await contract.queryFilter(filter, start, end)));
  }

  return logs;
}

/**
 * Prompts MetaMask to connect, then sets up the ethers provider/signer/contract.
 * Call this from a "Connect Wallet" button.
 */
async function connectWallet() {
  if (!window.ethereum) {
    alert(
      "MetaMask not detected. Please install the MetaMask browser extension to use this dApp.",
    );
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    currentAccount = accounts[0];

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(
      window.CHAINCONFIG.contractAddress,
      window.CHAINCONFIG.contractABI,
      signer,
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
  if (!contract)
    throw new Error("Wallet not connected yet — call connectWallet() first.");
  return contract;
}

function getCurrentAccount() {
  return currentAccount;
}

// ---------------------------------------------------------------------
// Friendly error messages.
// ethers can normally decode a Solidity custom error into err.reason/
// err.shortMessage on its own, but that decode silently fails for some
// estimateGas errors surfaced through MetaMask's injected provider — those
// show up as a raw "unknown custom error" dump instead. This re-decodes the
// revert data by hand against the contract's own ABI so every page can show
// a plain-English reason instead.
// ---------------------------------------------------------------------

// Only the errors a user is likely to hit through the UI get a custom
// message; anything else still gets its real Solidity error name (via the
// fallback below) rather than a generic message.
const FRIENDLY_ERRORS = {
  NotParticipant: (args) =>
    `You're not the shipper or carrier on Agreement #${args[0]} with the connected account — double-check the agreement ID and which wallet you're using.`,
  NotShipper: () => "Only this agreement's Shipper can do that.",
  NotCarrier: () => "Only this agreement's Carrier can do that.",
  AgreementNotFound: (args) => `Agreement #${args[0]} doesn't exist.`,
  InvalidMilestoneIndex: () => "That milestone doesn't exist on this agreement.",
  MilestoneNotSubmitted: () => "The Carrier hasn't submitted this milestone yet.",
  MilestoneAlreadySubmitted: () => "This milestone has already been submitted.",
  MilestoneAlreadyVerified: () => "This milestone has already been verified.",
  MilestoneAlreadyPaid: () => "This milestone has already been paid.",
  MilestoneNotVerified: () => "This milestone hasn't been paid out yet, so there's nothing to reward.",
  MilestoneAlreadyRewarded: () => "This milestone has already been rewarded.",
  AgreementNotCompleted: () => "This agreement isn't Completed yet, so no completion bonus is available.",
  CompletionAlreadyRewarded: () => "The completion bonus for this agreement has already been claimed.",
  InvalidCarrier: () => "This agreement has no assigned carrier.",
  InvalidMilestoneConfig: () => "The milestone amounts don't add up to the total payload value.",
  DeadlineNotPassed: () => "The deadline hasn't passed yet — refund isn't available.",
  AlreadyFinalized: () => "This agreement has already been settled (refunded, completed, or resolved).",
  ContractIsPaused: () => "The contract is currently paused by its owner.",
  InvalidRole: () => "Invalid role selected.",
  AlreadyRegistered: () => "This wallet has already registered a role — it cannot be changed.",
  CarrierNotRegistered: () => "That address is not registered as a Carrier. Ask them to register as a Carrier on the Dashboard first.",
  ZeroAddress: () => "The Carrier address cannot be the zero address.",
  ZeroValue: () => "Payload value and number of milestones must both be greater than zero.",
  NotAgreementShipper: () => "Only the Shipper who created this agreement can fund it.",
  IncorrectFundingAmount: () => "The amount sent does not exactly match the agreement's payload value.",
  WrongStatus: () => "This agreement is not in the correct state for that action (it may already be funded, completed, or resolved).",
};

/**
 * Extracts the raw revert data (a 0x-prefixed hex string) from an error
 * thrown by an ethers v6 call, wherever the provider happened to nest it.
 */
function extractRevertData(err) {
  const candidates = [
    err?.data,
    err?.info?.error?.data,
    err?.error?.data,
    err?.error?.error?.data,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.startsWith("0x") && candidate.length >= 10) {
      return candidate;
    }
    if (candidate && typeof candidate.data === "string") {
      return candidate.data;
    }
  }
  return null;
}

/**
 * Turns a thrown error from a contract call into a plain-English message.
 * Use this in every catch block instead of `err.reason || err.message` so
 * custom errors MetaMask/ethers fail to auto-decode still read clearly.
 */
function describeError(err) {
  if (err?.code === "ACTION_REJECTED") return "Transaction cancelled in MetaMask.";
  if (err?.reason) return err.reason;

  const data = extractRevertData(err);
  if (data) {
    try {
      const parsed = getContract().interface.parseError(data);
      if (parsed) {
        const friendly = FRIENDLY_ERRORS[parsed.name];
        return friendly ? friendly(parsed.args) : `${parsed.name}(${parsed.args.join(", ")})`;
      }
    } catch (_) {
      // Not decodable against this ABI — fall through to the generic message.
    }
  }

  return err?.shortMessage || err?.message || "Unknown error";
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
async function createAgreement(
  carrierAddress,
  payloadValueEth,
  milestoneCount,
  durationInDays,
) {
  const c = getContract();
  const payloadValueWei = ethers.parseEther(payloadValueEth.toString());
  const tx = await c.createAgreement(
    carrierAddress,
    payloadValueWei,
    milestoneCount,
    durationInDays,
  );
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
    statusLabel: STATUS_LABEL[Number(a.status)],
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

/**
 * Fetches the LRT reputation token balance for an address.
 * TokenisationModule.decimals() == 0, so this is a plain integer —
 * no ethers.formatEther needed (that was the bug: dividing by 10^18
 * on a token that has no decimals at all).
 */
async function getReputationBalance(address) {
  const c = getContract();
  const balance = await c.balanceOf(address);
  return balance.toString();
}

/**
 * Claims the completion bonus for a completed agreement.
 */
async function claimCompletionBonus(agreementId) {
  const c = getContract();
  const tx = await c.claimCompletionBonus(agreementId);
  return tx.wait();
}

// ---------------------------------------------------------------------
// Tokenisation module (Member 5) — carrier reputation reads.
// Talks to TokenisationModule.sol via the same shared `contract` instance.
// Read-only: there is no mint/claim call here on purpose, since reward
// creation is meant to happen only through the verified milestone flow.
// Requires config.js's ABI to include the "TokenisationTest (local harness)"
// section — reputationLevel, milestoneRewarded, completionRewarded, and the
// ReputationRewarded/CompletionBonusRewarded events.
// Note: unlike getReputationBalance() above (which reads the legacy 18-decimal
// ReputationToken.sol), TokenisationModule.decimals() == 0, so balances here
// are plain integers — no ethers.formatEther needed.
// ---------------------------------------------------------------------

/**
 * Fetches a carrier's current LRT balance as a plain integer.
 */
async function getCarrierReputation(address) {
  const c = getContract();
  const balance = await c.balanceOf(address);
  return Number(balance);
}

/**
 * Fetches a carrier's displayed reputation level (New Carrier/Bronze/Silver/Gold).
 */
async function getCarrierReputationLevel(address) {
  const c = getContract();
  return c.reputationLevel(address);
}

// Mirrors TokenisationModule.sol -> enum RewardKind { Pickup, Intermediate, Delivery }
const REWARD_KIND_LABEL = ["Pickup", "In Transit", "Delivery"];

/**
 * Queries a carrier's full reward history (milestone rewards + completion
 * bonuses) from contract events and returns them newest-first, e.g.:
 * { agreementId, label: "Delivery"|"Completion"|..., amount, blockNumber }
 */
async function getCarrierRewardHistory(address) {
  const c = getContract();

  const [milestoneEvents, completionEvents] = await Promise.all([
    queryFilterChunked(c, c.filters.ReputationRewarded(address)),
    queryFilterChunked(c, c.filters.CompletionBonusRewarded(address)),
  ]);

  const milestoneRows = milestoneEvents.map((e) => ({
    agreementId: Number(e.args.agreementId),
    label: REWARD_KIND_LABEL[Number(e.args.rewardKind)],
    amount: Number(e.args.amount),
    blockNumber: e.blockNumber,
  }));

  const completionRows = completionEvents.map((e) => ({
    agreementId: Number(e.args.agreementId),
    label: "Completion",
    amount: Number(e.args.amount),
    blockNumber: e.blockNumber,
  }));

  return milestoneRows
    .concat(completionRows)
    .sort((a, b) => b.blockNumber - a.blockNumber);
}
