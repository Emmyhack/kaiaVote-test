const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting, voting, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
  });

  it("should allow only owner to create a voting event", async function () {
    const companies = ["A", "B", "C"];
    await expect(voting.connect(addr1).createVotingEvent("Test Event", companies)).to.be.reverted;
    await expect(voting.createVotingEvent("Test Event", companies)).to.emit(voting, "VotingEventCreated");
  });

  it("should allow users to vote and only once per event", async function () {
    const companies = ["A", "B"];
    await voting.createVotingEvent("Event1", companies);
    await expect(voting.connect(addr1).vote(0, 1)).to.emit(voting, "Voted").withArgs(0, addr1.address, 1);
    await expect(voting.connect(addr1).vote(0, 0)).to.be.revertedWith("Already voted");
  });

  it("should not allow voting for invalid company index", async function () {
    const companies = ["A", "B"];
    await voting.createVotingEvent("Event1", companies);
    await expect(voting.connect(addr1).vote(0, 2)).to.be.revertedWith("Invalid company");
  });

  it("should return correct vote counts and winner", async function () {
    const companies = ["A", "B"];
    await voting.createVotingEvent("Event1", companies);
    await voting.connect(addr1).vote(0, 0);
    await voting.connect(addr2).vote(0, 1);
    await voting.connect(owner).vote(0, 1);
    const name = await voting.getEventName(0);
    const company0 = await voting.getCompanyName(0, 0);
    const company1 = await voting.getCompanyName(0, 1);
    const vote0 = await voting.getVoteCount(0, 0);
    const vote1 = await voting.getVoteCount(0, 1);
    const winnerIndex = await voting.getWinnerIndex(0);
    const ended = await voting.getEventEnded(0);
    expect(name).to.equal("Event1");
    expect(company0).to.equal("A");
    expect(company1).to.equal("B");
    expect(vote0).to.equal(1);
    expect(vote1).to.equal(2);
    expect(winnerIndex).to.equal(1);
    expect(ended).to.equal(false);
  });

  it("should allow owner to end voting", async function () {
    const companies = ["A", "B"];
    await voting.createVotingEvent("Event1", companies);
    await voting.endVoting(0);
    const ended = await voting.getEventEnded(0);
    expect(ended).to.equal(true);
    await expect(voting.connect(addr1).vote(0, 0)).to.be.revertedWith("Voting ended");
  });
}); 