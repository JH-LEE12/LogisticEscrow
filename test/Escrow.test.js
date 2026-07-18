// tests/Escrow.test.js
// Member 4's test suite — covers RefundDispute.sol via the RefundDisputeHarness
// test contract (see contracts/test/RefundDisputeHarness.sol).
//
// Written for Truffle + Ganache (matches this project's truffle-config.js).
// Run with: truffle test

const RefundDisputeHarness = artifacts.require("RefundDisputeHarness");

// Mirrors AgreementRegistry.sol -> enum Role
const ROLE = { NONE: 0, SHIPPER: 1, CARRIER: 2 };

// Mirrors AgreementRegistry.sol -> enum AgreementStatus
const STATUS = {
  CREATED: "0",
  FUNDED: "1",
  IN_PROGRESS: "2",
  COMPLETED: "3",
  REFUNDED: "4",
  DISPUTED: "5",
};

contract("RefundDispute module", (accounts) => {
  const [deployer, shipper, carrier, other, arbitratorAcct] = accounts;

  const payloadValue = web3.utils.toWei("1", "ether");
  const milestoneCount = 3;
  const durationInDays = 1;

  let instance;

  beforeEach(async () => {
    instance = await RefundDisputeHarness.new({ from: deployer });
    await instance.setArbitrator(arbitratorAcct, { from: deployer });
    await instance.registerUser(ROLE.SHIPPER, { from: shipper });
    await instance.registerUser(ROLE.CARRIER, { from: carrier });
  });

  // Helper: creates an agreement and fully funds it. Returns the agreementId.
  async function createAndFund() {
    const tx = await instance.createAgreement(
      carrier,
      payloadValue,
      milestoneCount,
      durationInDays,
      {
        from: shipper,
      },
    );
    const agreementId = tx.logs.find((l) => l.event === "AgreementCreated").args
      .agreementId;
    await instance.fundForTesting(agreementId, {
      from: shipper,
      value: payloadValue,
    });
    return agreementId;
  }

  describe("setArbitrator", () => {
    it("sets the arbitrator address", async () => {
      assert.equal(await instance.arbitrator(), arbitratorAcct);
    });

    it("cannot be called a second time", async () => {
      try {
        await instance.setArbitrator(other, { from: deployer });
        assert.fail("expected revert");
      } catch (err) {
        assert.include(err.message, "arbitrator already set");
      }
    });
  });

  describe("checkAndTriggerRefund", () => {
    it("reverts before the deadline has passed", async () => {
      const agreementId = await createAndFund();
      try {
        await instance.checkAndTriggerRefund(agreementId, { from: other });
        assert.fail("expected revert");
      } catch (err) {
        assert.include(err.message, "deadline not yet passed");
      }
    });

    it("reverts once the agreement has moved past Funded (e.g. InProgress)", async () => {
      const agreementId = await createAndFund();
      await instance.simulateMilestonePayout(
        agreementId,
        web3.utils.toWei("0.3", "ether"),
        {
          from: other,
        },
      );
      await advanceTime(2 * 24 * 60 * 60);
      await advanceBlock();
      try {
        await instance.checkAndTriggerRefund(agreementId, { from: other });
        assert.fail("expected revert");
      } catch (err) {
        assert.include(err.message, "invalid agreement status");
      }
    });

    it("refunds the shipper in full once the deadline has passed", async () => {
      const agreementId = await createAndFund();
      await advanceTime(2 * 24 * 60 * 60);
      await advanceBlock();

      const before = web3.utils.toBN(await web3.eth.getBalance(shipper));
      const tx = await instance.checkAndTriggerRefund(agreementId, {
        from: other,
      });
      const after = web3.utils.toBN(await web3.eth.getBalance(shipper));

      assert.isTrue(after.sub(before).eq(web3.utils.toBN(payloadValue)));

      const agreement = await instance.getAgreement(agreementId);
      assert.equal(agreement.status.toString(), STATUS.REFUNDED);
      assert.isDefined(tx.logs.find((l) => l.event === "RefundIssued"));
    });

    it("cannot be triggered twice on the same agreement", async () => {
      const agreementId = await createAndFund();
      await advanceTime(2 * 24 * 60 * 60);
      await advanceBlock();
      await instance.checkAndTriggerRefund(agreementId, { from: other });
      try {
        await instance.checkAndTriggerRefund(agreementId, { from: other });
        assert.fail("expected revert");
      } catch (err) {
        assert.include(err.message, "invalid agreement status");
      }
    });
  });

  describe("raiseDispute", () => {
    it("only a Shipper or Carrier participant can raise it", async () => {
      const agreementId = await createAndFund();
      try {
        await instance.raiseDispute(agreementId, "GPS anomaly detected", {
          from: other,
        });
        assert.fail("expected revert");
      } catch (err) {
        assert.include(err.message, "not a participant");
      }
    });

    it("moves a Funded agreement to Disputed", async () => {
      const agreementId = await createAndFund();
      await instance.raiseDispute(agreementId, "deadline missed mid-delivery", {
        from: shipper,
      });
      const agreement = await instance.getAgreement(agreementId);
      assert.equal(agreement.status.toString(), STATUS.DISPUTED);
      assert.isTrue(await instance.isDisputed(agreementId));
    });

    it("also works from InProgress (partial payout already made)", async () => {
      const agreementId = await createAndFund();
      await instance.simulateMilestonePayout(
        agreementId,
        web3.utils.toWei("0.3", "ether"),
        {
          from: other,
        },
      );
      await instance.raiseDispute(
        agreementId,
        "carrier went dark after milestone 1",
        { from: carrier },
      );
      const agreement = await instance.getAgreement(agreementId);
      assert.equal(agreement.status.toString(), STATUS.DISPUTED);
    });
  });

  describe("resolveDispute", () => {
    it("only the arbitrator can resolve it", async () => {
      const agreementId = await createAndFund();
      await instance.raiseDispute(agreementId, "anomaly", { from: shipper });
      try {
        await instance.resolveDispute(agreementId, payloadValue, "0", {
          from: other,
        });
        assert.fail("expected revert");
      } catch (err) {
        assert.include(err.message, "not the arbitrator");
      }
    });

    it("splits funds correctly between shipper and carrier", async () => {
      const agreementId = await createAndFund();
      await instance.raiseDispute(agreementId, "partial delivery only", {
        from: carrier,
      });

      const half = web3.utils
        .toBN(payloadValue)
        .div(web3.utils.toBN(2))
        .toString();

      const shipperBefore = web3.utils.toBN(await web3.eth.getBalance(shipper));
      const carrierBefore = web3.utils.toBN(await web3.eth.getBalance(carrier));

      const tx = await instance.resolveDispute(agreementId, half, half, {
        from: arbitratorAcct,
      });

      const shipperAfter = web3.utils.toBN(await web3.eth.getBalance(shipper));
      const carrierAfter = web3.utils.toBN(await web3.eth.getBalance(carrier));

      assert.isTrue(shipperAfter.sub(shipperBefore).eq(web3.utils.toBN(half)));
      assert.isTrue(carrierAfter.sub(carrierBefore).eq(web3.utils.toBN(half)));

      const agreement = await instance.getAgreement(agreementId);
      assert.equal(agreement.status.toString(), STATUS.COMPLETED);
      assert.isFalse(await instance.isDisputed(agreementId));
      assert.isDefined(tx.logs.find((l) => l.event === "DisputeResolved"));
    });

    it("marks the agreement Refunded when the carrier gets nothing", async () => {
      const agreementId = await createAndFund();
      await instance.raiseDispute(
        agreementId,
        "carrier never picked up cargo",
        { from: shipper },
      );
      await instance.resolveDispute(agreementId, payloadValue, "0", {
        from: arbitratorAcct,
      });
      const agreement = await instance.getAgreement(agreementId);
      assert.equal(agreement.status.toString(), STATUS.REFUNDED);
    });

    it("cannot resolve the same dispute twice", async () => {
      const agreementId = await createAndFund();
      await instance.raiseDispute(agreementId, "anomaly", { from: shipper });
      await instance.resolveDispute(agreementId, payloadValue, "0", {
        from: arbitratorAcct,
      });
      try {
        await instance.resolveDispute(agreementId, "0", payloadValue, {
          from: arbitratorAcct,
        });
        assert.fail("expected revert");
      } catch (err) {
        assert.include(err.message, "not disputed");
      }
    });
  });

  describe("getRefundDisputeHistory", () => {
    it("logs every status change this module makes, in order, with timestamps", async () => {
      const agreementId = await createAndFund();
      await instance.raiseDispute(agreementId, "anomaly", { from: shipper });
      await instance.resolveDispute(agreementId, payloadValue, "0", {
        from: arbitratorAcct,
      });

      const history = await instance.getRefundDisputeHistory(agreementId);
      assert.equal(history.length, 2);
      assert.equal(history[0].status.toString(), STATUS.DISPUTED);
      assert.equal(history[1].status.toString(), STATUS.REFUNDED);
      assert.isTrue(
        Number(history[1].timestamp) >= Number(history[0].timestamp),
      );
    });
  });
});

// ---------------------------------------------------------------------
// Ganache time-travel helpers (needed to test deadline-based logic)
// ---------------------------------------------------------------------

function advanceTime(seconds) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [seconds],
        id: new Date().getTime(),
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });
}

function advanceBlock() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        params: [],
        id: new Date().getTime(),
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });
}
