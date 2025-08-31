import { expect } from "chai";
import { ethers } from "hardhat";
import { SafeLock } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("SafeLock", function () {
  let safeLock: SafeLock;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  const LOCK_DURATION = 7 * 24 * 60 * 60; // 7 days
  const DEPOSIT_AMOUNT = ethers.parseEther("1000"); // 1000 cUSD
  const MOCK_CUSD_ADDRESS = "0x1234567890123456789012345678901234567890";

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    const SafeLockFactory = await ethers.getContractFactory("SafeLock");
    safeLock = await SafeLockFactory.deploy();
    
    // Initialize the contract
    await safeLock.initialize(MOCK_CUSD_ADDRESS, owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await safeLock.owner()).to.equal(owner.address);
    });

    it("Should initialize penalty pool correctly", async function () {
      const penaltyPool = await safeLock.getPenaltyPool();
      expect(penaltyPool.totalPenalties).to.equal(0);
      expect(penaltyPool.totalActiveSavings).to.equal(0);
    });

    it("Should set cUSD token address", async function () {
      expect(await safeLock.cUSDToken()).to.equal(MOCK_CUSD_ADDRESS);
    });
  });

  describe("Creating Savings Locks", function () {
    it("Should reject zero amount deposits", async function () {
      await expect(
        safeLock.connect(user1).createSavingsLock(LOCK_DURATION, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should reject lock duration below minimum", async function () {
      const minDuration = await safeLock.MIN_LOCK_DURATION();
      await expect(
        safeLock.connect(user1).createSavingsLock(minDuration - 1n, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("Invalid lock duration");
    });

    it("Should reject lock duration above maximum", async function () {
      const maxDuration = await safeLock.MAX_LOCK_DURATION();
      await expect(
        safeLock.connect(user1).createSavingsLock(maxDuration + 1n, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("Invalid lock duration");
    });

    it("Should reject amount above maximum", async function () {
      const maxAmount = await safeLock.MAX_LOCK_AMOUNT();
      await expect(
        safeLock.connect(user1).createSavingsLock(LOCK_DURATION, maxAmount + 1n)
      ).to.be.revertedWith("Amount exceeds maximum limit");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause", async function () {
      await safeLock.pause();
      expect(await safeLock.isPaused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await safeLock.pause();
      await safeLock.unpause();
      expect(await safeLock.isPaused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        safeLock.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent operations when paused", async function () {
      await safeLock.pause();
      await expect(
        safeLock.connect(user1).createSavingsLock(LOCK_DURATION, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should allow owner to update token", async function () {
      const newTokenAddress = "0x9876543210987654321098765432109876543210";
      await safeLock.updateToken(newTokenAddress);
      expect(await safeLock.cUSDToken()).to.equal(newTokenAddress);
    });

    it("Should prevent non-owner from updating token", async function () {
      const newTokenAddress = "0x9876543210987654321098765432109876543210";
      await expect(
        safeLock.connect(user1).updateToken(newTokenAddress)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("View Functions", function () {
    it("Should return correct active savings count", async function () {
      expect(await safeLock.getActiveSavingsCount()).to.equal(0);
    });

    it("Should return correct penalty pool", async function () {
      const penaltyPool = await safeLock.getPenaltyPool();
      expect(penaltyPool.totalPenalties).to.equal(0);
      expect(penaltyPool.totalActiveSavings).to.equal(0);
    });

    it("Should return correct pause status", async function () {
      const pauseStatus = await safeLock.getPauseStatus();
      expect(pauseStatus.generalPaused).to.be.false;
      expect(pauseStatus.savingsPaused).to.be.false;
      expect(pauseStatus.withdrawalsPaused).to.be.false;
    });
  });
});
