import assert from "node:assert";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";

// Revert helper without chai-matchers: asserts the promise reverts and the
// error names the expected custom error (or at least reverts at all).
async function expectRevert(promise, errorName) {
  try {
    await promise;
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    if (errorName) assert.ok(msg.includes(errorName), `expected revert ${errorName}, got: ${msg.slice(0, 200)}`);
    return;
  }
  assert.fail(`expected revert ${errorName || "(any)"} but call succeeded`);
}

describe("AgentPoll", function () {
  let ethers;
  let agentId, poll;
  let holder1, holder2, holder3, holder4, nonHolder;

  const DAY = 24 * 60 * 60;

  async function deploy() {
    ({ ethers } = await network.connect());
    [holder1, holder2, holder3, holder4, nonHolder] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockAgentID");
    agentId = await Mock.deploy();
    await agentId.waitForDeployment();
    for (const h of [holder1, holder2, holder3, holder4]) {
      await (await agentId.mint(h.address)).wait();
    }
    const Poll = await ethers.getContractFactory("AgentPoll");
    poll = await Poll.deploy(await agentId.getAddress());
    await poll.waitForDeployment();
  }

  beforeEach(deploy);

  it("createPoll succeeds for an Agent ID holder", async function () {
    const tx = await poll.connect(holder1).createPoll("Best chain?", ["BNB", "Ethereum"], DAY);
    const receipt = await tx.wait();
    const ev = receipt.logs.map((l) => { try { return poll.interface.parseLog(l); } catch { return null; } }).find((e) => e && e.name === "PollCreated");
    assert.ok(ev, "PollCreated event emitted");
    assert.equal(ev.args.pollId, 0n);
    assert.equal(ev.args.creator, holder1.address);
    assert.equal(await poll.getPollCount(), 1n);
  });

  it("createPoll REVERTS for a non-holder", async function () {
    await expectRevert(
      poll.connect(nonHolder).createPoll("Best chain?", ["BNB", "Ethereum"], DAY),
      "NotAgentIDHolder"
    );
  });

  it("createPoll reverts on 1 option", async function () {
    await expectRevert(
      poll.connect(holder1).createPoll("Q?", ["Only"], DAY),
      "InvalidOptions"
    );
  });

  it("createPoll reverts on 9 options", async function () {
    const nine = Array.from({ length: 9 }, (_, i) => `Opt ${i}`);
    await expectRevert(
      poll.connect(holder1).createPoll("Q?", nine, DAY),
      "InvalidOptions"
    );
  });

  it("createPoll reverts on empty question", async function () {
    await expectRevert(
      poll.connect(holder1).createPoll("", ["A", "B"], DAY),
      "InvalidQuestion"
    );
  });

  it("createPoll reverts on duration too short (30 min)", async function () {
    await expectRevert(
      poll.connect(holder1).createPoll("Q?", ["A", "B"], 30 * 60),
      "InvalidDuration"
    );
  });

  it("createPoll reverts on duration too long (31 days)", async function () {
    await expectRevert(
      poll.connect(holder1).createPoll("Q?", ["A", "B"], 31 * DAY),
      "InvalidDuration"
    );
  });

  it("createPoll reverts on empty option", async function () {
    await expectRevert(
      poll.connect(holder1).createPoll("Q?", ["A", ""], DAY),
      "InvalidOptions"
    );
  });

  it("vote succeeds once and tallies", async function () {
    await (await poll.connect(holder1).createPoll("Best chain?", ["BNB", "Ethereum"], DAY)).wait();
    const tx = await poll.connect(holder2).vote(0, 1);
    const receipt = await tx.wait();
    const ev = receipt.logs.map((l) => { try { return poll.interface.parseLog(l); } catch { return null; } }).find((e) => e && e.name === "Voted");
    assert.ok(ev, "Voted event emitted");
    assert.equal(ev.args.voter, holder2.address);
    assert.equal(ev.args.optionIndex, 1n);
    assert.equal(await poll.hasVoted(0, holder2.address), true);
  });

  it("second vote on the same poll REVERTS", async function () {
    await (await poll.connect(holder1).createPoll("Q?", ["A", "B"], DAY)).wait();
    await (await poll.connect(holder2).vote(0, 0)).wait();
    await expectRevert(poll.connect(holder2).vote(0, 1), "AlreadyVoted");
  });

  it("vote on an expired poll REVERTS", async function () {
    await (await poll.connect(holder1).createPoll("Q?", ["A", "B"], 60 * 60)).wait();
    await ethers.provider.send("evm_increaseTime", [61 * 60]);
    await ethers.provider.send("evm_mine");
    await expectRevert(poll.connect(holder2).vote(0, 0), "PollClosed");
  });

  it("vote with an invalid option REVERTS", async function () {
    await (await poll.connect(holder1).createPoll("Q?", ["A", "B"], DAY)).wait();
    await expectRevert(poll.connect(holder2).vote(0, 2), "InvalidOption");
  });

  it("vote by a non-holder REVERTS", async function () {
    await (await poll.connect(holder1).createPoll("Q?", ["A", "B"], DAY)).wait();
    await expectRevert(poll.connect(nonHolder).vote(0, 0), "NotAgentIDHolder");
  });

  it("vote on a nonexistent poll REVERTS", async function () {
    await expectRevert(poll.connect(holder1).vote(99, 0), "PollNotFound");
  });

  it("getPoll tallies are exact after several votes from different holders", async function () {
    await (await poll.connect(holder1).createPoll("Best chain?", ["BNB", "Ethereum", "Solana"], DAY)).wait();
    await (await poll.connect(holder1).vote(0, 0)).wait();
    await (await poll.connect(holder2).vote(0, 1)).wait();
    await (await poll.connect(holder3).vote(0, 0)).wait();
    await (await poll.connect(holder4).vote(0, 0)).wait();
    const [creator, question, options, votes, deadline, createdAt, totalVotes] = await poll.getPoll(0);
    assert.equal(creator, holder1.address);
    assert.equal(question, "Best chain?");
    assert.deepEqual(options, ["BNB", "Ethereum", "Solana"]);
    assert.deepEqual(votes.map((v) => Number(v)), [3, 1, 0]);
    assert.equal(totalVotes, 4n);
    assert.ok(deadline > createdAt);
    assert.equal(deadline - createdAt, BigInt(DAY));
  });

  it("hasVoted and getPollCount are correct across polls", async function () {
    assert.equal(await poll.getPollCount(), 0n);
    await (await poll.connect(holder1).createPoll("Q1?", ["A", "B"], DAY)).wait();
    await (await poll.connect(holder1).createPoll("Q2?", ["X", "Y", "Z"], DAY)).wait();
    assert.equal(await poll.getPollCount(), 2n);
    assert.equal(await poll.hasVoted(0, holder2.address), false);
    await (await poll.connect(holder2).vote(0, 0)).wait();
    assert.equal(await poll.hasVoted(0, holder2.address), true);
    assert.equal(await poll.hasVoted(1, holder2.address), false);
    await expectRevert(poll.hasVoted(99, holder2.address), "PollNotFound");
    await expectRevert(poll.getPoll(99), "PollNotFound");
  });

  it("8 options and 30-day duration are accepted (bounds)", async function () {
    const eight = Array.from({ length: 8 }, (_, i) => `Opt ${i}`);
    await (await poll.connect(holder1).createPoll("Q?", eight, 30 * DAY)).wait();
    assert.equal(await poll.getPollCount(), 1n);
  });
});
