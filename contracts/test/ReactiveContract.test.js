const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReactiveContract", function () {
  let reactiveContract;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const ReactiveContract = await ethers.getContractFactory("ReactiveContract");
    reactiveContract = await ReactiveContract.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await reactiveContract.owner()).to.equal(owner.address);
    });

    it("Should start as inactive", async function () {
      expect(await reactiveContract.isActive()).to.equal(false);
    });

    it("Should have zero initial values", async function () {
      expect(await reactiveContract.totalDeposits()).to.equal(0);
      expect(await reactiveContract.totalWithdrawals()).to.equal(0);
      expect(await reactiveContract.totalProfit()).to.equal(0);
    });
  });

  describe("Activation", function () {
    it("Should allow owner to activate", async function () {
      await reactiveContract.activate();
      expect(await reactiveContract.isActive()).to.equal(true);
    });

    it("Should not allow non-owner to activate", async function () {
      await expect(
        reactiveContract.connect(user1).activate()
      ).to.be.revertedWithCustomError(reactiveContract, "OwnableUnauthorizedAccount");
    });

    it("Should not allow activation when already active", async function () {
      await reactiveContract.activate();
      await expect(
        reactiveContract.activate()
      ).to.be.revertedWith("Contract is already active");
    });
  });

  describe("Deactivation", function () {
    beforeEach(async function () {
      await reactiveContract.activate();
    });

    it("Should allow owner to deactivate", async function () {
      await reactiveContract.deactivate();
      expect(await reactiveContract.isActive()).to.equal(false);
    });

    it("Should not allow non-owner to deactivate", async function () {
      await expect(
        reactiveContract.connect(user1).deactivate()
      ).to.be.revertedWithCustomError(reactiveContract, "OwnableUnauthorizedAccount");
    });

    it("Should not allow deactivation when already inactive", async function () {
      await reactiveContract.deactivate();
      await expect(
        reactiveContract.deactivate()
      ).to.be.revertedWith("Contract is not active");
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      await reactiveContract.activate();
    });

    it("Should allow deposits when active", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(reactiveContract.connect(user1).deposit({ value: depositAmount }))
        .to.emit(reactiveContract, "FundsDeposited")
        .withArgs(user1.address, depositAmount, await time());

      expect(await reactiveContract.userDeposits(user1.address)).to.equal(depositAmount);
      expect(await reactiveContract.totalDeposits()).to.equal(depositAmount);
    });

    it("Should not allow deposits when inactive", async function () {
      await reactiveContract.deactivate();
      
      await expect(
        reactiveContract.connect(user1).deposit({ value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Contract is not active");
    });

    it("Should not allow zero deposits", async function () {
      await expect(
        reactiveContract.connect(user1).deposit({ value: 0 })
      ).to.be.revertedWith("Must deposit some ETH");
    });
  });

  describe("Withdrawals", function () {
    const depositAmount = ethers.parseEther("2.0");
    const withdrawAmount = ethers.parseEther("1.0");

    beforeEach(async function () {
      await reactiveContract.activate();
      await reactiveContract.connect(user1).deposit({ value: depositAmount });
    });

    it("Should allow withdrawals when active", async function () {
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(reactiveContract.connect(user1).withdraw(withdrawAmount))
        .to.emit(reactiveContract, "FundsWithdrawn")
        .withArgs(user1.address, withdrawAmount, await time());

      expect(await reactiveContract.userDeposits(user1.address)).to.equal(depositAmount);
      expect(await reactiveContract.totalWithdrawals()).to.equal(withdrawAmount);
    });

    it("Should not allow withdrawals when inactive", async function () {
      await reactiveContract.deactivate();
      
      await expect(
        reactiveContract.connect(user1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Contract is not active");
    });

    it("Should not allow withdrawals exceeding balance", async function () {
      const excessiveAmount = ethers.parseEther("3.0");
      
      await expect(
        reactiveContract.connect(user1).withdraw(excessiveAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not allow zero withdrawals", async function () {
      await expect(
        reactiveContract.connect(user1).withdraw(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Balance Queries", function () {
    const depositAmount = ethers.parseEther("2.0");
    const withdrawAmount = ethers.parseEther("1.0");

    beforeEach(async function () {
      await reactiveContract.activate();
      await reactiveContract.connect(user1).deposit({ value: depositAmount });
      await reactiveContract.connect(user1).withdraw(withdrawAmount);
    });

    it("Should return correct user balance", async function () {
      const expectedBalance = depositAmount - withdrawAmount;
      expect(await reactiveContract.getUserBalance(user1.address)).to.equal(expectedBalance);
    });

    it("Should return correct contract balance", async function () {
      const expectedBalance = depositAmount - withdrawAmount;
      expect(await reactiveContract.getContractBalance()).to.equal(expectedBalance);
    });
  });

  describe("Strategy Execution", function () {
    beforeEach(async function () {
      await reactiveContract.activate();
    });

    it("Should allow owner to execute strategy", async function () {
      await expect(reactiveContract.executeStrategy("test-strategy"))
        .to.emit(reactiveContract, "StrategyExecuted")
        .withArgs("test-strategy", 0, await time());
    });

    it("Should not allow non-owner to execute strategy", async function () {
      await expect(
        reactiveContract.connect(user1).executeStrategy("test-strategy")
      ).to.be.revertedWithCustomError(reactiveContract, "OwnableUnauthorizedAccount");
    });
  });

  describe("Emergency Functions", function () {
    const depositAmount = ethers.parseEther("1.0");

    beforeEach(async function () {
      await reactiveContract.activate();
      await reactiveContract.connect(user1).deposit({ value: depositAmount });
    });

    it("Should allow owner to emergency withdraw", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await reactiveContract.emergencyWithdraw();
      
      expect(await reactiveContract.getContractBalance()).to.equal(0);
    });

    it("Should not allow non-owner to emergency withdraw", async function () {
      await expect(
        reactiveContract.connect(user1).emergencyWithdraw()
      ).to.be.revertedWithCustomError(reactiveContract, "OwnableUnauthorizedAccount");
    });
  });
});

// Helper function to get current timestamp
async function time() {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  return block.timestamp;
}
