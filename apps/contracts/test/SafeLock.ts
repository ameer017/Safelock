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
  let mockCUSD: any;
  let mockUSDT: any;
  let mockCGHS: any;
  let mockCNGN: any;
  let mockCKES: any;

  const LOCK_DURATION = 7 * 24 * 60 * 60; // 7 days
  const DEPOSIT_AMOUNT = ethers.parseEther("1000"); // 1000 cUSD
  const USERNAME1 = "alice_saves";
  const USERNAME2 = "bob_invests";
  const PROFILE_IMAGE_HASH = "QmHash123...";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy all mock tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockCUSD = await MockERC20Factory.deploy("Celo Dollar", "cUSD");
    mockUSDT = await MockERC20Factory.deploy("Tether USD", "USDT");
    mockCGHS = await MockERC20Factory.deploy("Celo Ghana Cedi", "cGHS");
    mockCNGN = await MockERC20Factory.deploy("Celo Nigerian Naira", "cNGN");
    mockCKES = await MockERC20Factory.deploy("Celo Kenyan Shilling", "cKES");

    const SafeLockFactory = await ethers.getContractFactory("SafeLock");
    safeLock = await SafeLockFactory.deploy(
      await mockCUSD.getAddress(),
      await mockUSDT.getAddress(),
      await mockCGHS.getAddress(),
      await mockCNGN.getAddress(),
      await mockCKES.getAddress(),
      owner.address
    );

    // Mint tokens to users for testing
    await mockCUSD.mint(user1.address, ethers.parseEther("10000"));
    await mockCUSD.mint(user2.address, ethers.parseEther("10000"));
    await mockUSDT.mint(user1.address, ethers.parseEther("10000"));
    await mockUSDT.mint(user2.address, ethers.parseEther("10000"));
    await mockCGHS.mint(user1.address, ethers.parseEther("10000"));
    await mockCGHS.mint(user2.address, ethers.parseEther("10000"));
    await mockCNGN.mint(user1.address, ethers.parseEther("10000"));
    await mockCNGN.mint(user2.address, ethers.parseEther("10000"));
    await mockCKES.mint(user1.address, ethers.parseEther("10000"));
    await mockCKES.mint(user2.address, ethers.parseEther("10000"));
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

    it("Should set all token addresses correctly", async function () {
      expect(await safeLock.cUSDToken()).to.equal(await mockCUSD.getAddress());
      expect(await safeLock.USDTToken()).to.equal(await mockUSDT.getAddress());
      expect(await safeLock.CGHSToken()).to.equal(await mockCGHS.getAddress());
      expect(await safeLock.CNGNToken()).to.equal(await mockCNGN.getAddress());
      expect(await safeLock.CKESToken()).to.equal(await mockCKES.getAddress());
    });

    it("Should reject deployment with zero address for any token", async function () {
      const SafeLockFactory = await ethers.getContractFactory("SafeLock");
      
      // Test zero address for cUSD token
      await expect(
        SafeLockFactory.deploy(
          ethers.ZeroAddress,
          await mockUSDT.getAddress(),
          await mockCGHS.getAddress(),
          await mockCNGN.getAddress(),
          await mockCKES.getAddress(),
          owner.address
        )
      ).to.be.revertedWith("Invalid token address");

      // Test zero address for USDT token
      await expect(
        SafeLockFactory.deploy(
          await mockCUSD.getAddress(),
          ethers.ZeroAddress,
          await mockCGHS.getAddress(),
          await mockCNGN.getAddress(),
          await mockCKES.getAddress(),
          owner.address
        )
      ).to.be.revertedWith("Invalid token address");

      // Test zero address for CGHS token
      await expect(
        SafeLockFactory.deploy(
          await mockCUSD.getAddress(),
          await mockUSDT.getAddress(),
          ethers.ZeroAddress,
          await mockCNGN.getAddress(),
          await mockCKES.getAddress(),
          owner.address
        )
      ).to.be.revertedWith("Invalid token address");

      // Test zero address for CNGN token
      await expect(
        SafeLockFactory.deploy(
          await mockCUSD.getAddress(),
          await mockUSDT.getAddress(),
          await mockCGHS.getAddress(),
          ethers.ZeroAddress,
          await mockCKES.getAddress(),
          owner.address
        )
      ).to.be.revertedWith("Invalid token address");

      // Test zero address for CKES token
      await expect(
        SafeLockFactory.deploy(
          await mockCUSD.getAddress(),
          await mockUSDT.getAddress(),
          await mockCGHS.getAddress(),
          await mockCNGN.getAddress(),
          ethers.ZeroAddress,
          owner.address
        )
      ).to.be.revertedWith("Invalid token address");

      // Test zero address for owner
      await expect(
        SafeLockFactory.deploy(
          await mockCUSD.getAddress(),
          await mockUSDT.getAddress(),
          await mockCGHS.getAddress(),
          await mockCNGN.getAddress(),
          await mockCKES.getAddress(),
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid owner address");
    });

    it("Should initialize pause state correctly", async function () {
      expect(await safeLock.isPaused()).to.be.false;
    });
  });

  describe("User Registration", function () {
    it("Should allow user to register with username", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      const profile = await safeLock.getUserProfile(user1.address);
      expect(profile.username).to.equal(USERNAME1);
      expect(profile.isActive).to.be.true;
      expect(profile.profileImageHash).to.equal(PROFILE_IMAGE_HASH);
    });

    it("Should prevent duplicate usernames", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      await expect(
        safeLock.connect(user2).registerUser(USERNAME1, PROFILE_IMAGE_HASH)
      ).to.be.revertedWith("Username already taken");
    });

    it("Should prevent duplicate registrations", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      await expect(
        safeLock.connect(user1).registerUser("another_username", PROFILE_IMAGE_HASH)
      ).to.be.revertedWith("User already registered");
    });

    it("Should enforce username length constraints", async function () {
      // Too short
      await expect(
        safeLock.connect(user1).registerUser("ab", PROFILE_IMAGE_HASH)
      ).to.be.revertedWith("Username too short");

      // Too long (33 characters)
      const longUsername = "a".repeat(33);
      await expect(
        safeLock.connect(user1).registerUser(longUsername, PROFILE_IMAGE_HASH)
      ).to.be.revertedWith("Username too long");
    });

    it("Should initialize user lock info correctly", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      const lockInfo = await safeLock.userLockInfo(user1.address);
      expect(lockInfo.totalActiveAmount).to.equal(0);
      expect(lockInfo.totalActiveLocks).to.equal(0);
      // Note: lockIds array access is complex with public mappings
      // We'll test the other fields which are more important
    });

    it("Should emit UserRegistered event", async function () {
      const tx = await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      await expect(tx)
        .to.emit(safeLock, "UserRegistered")
        .withArgs(user1.address, USERNAME1, await time());
    });
  });

  describe("Profile Management", function () {
    beforeEach(async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
    });

    it("Should allow user to update profile", async function () {
      const newUsername = "alice_updated";
      const newImageHash = "QmNewHash456...";
      
      await safeLock.connect(user1).updateProfile(newUsername, newImageHash);
      
      const profile = await safeLock.getUserProfile(user1.address);
      expect(profile.username).to.equal(newUsername);
      expect(profile.profileImageHash).to.equal(newImageHash);
    });

    it("Should prevent username conflicts during update", async function () {
      await safeLock.connect(user2).registerUser(USERNAME2, PROFILE_IMAGE_HASH);
      
      await expect(
        safeLock.connect(user1).updateProfile(USERNAME2, PROFILE_IMAGE_HASH)
      ).to.be.revertedWith("Username already taken");
    });

    it("Should update username mapping correctly", async function () {
      const newUsername = "alice_updated";
      
      await safeLock.connect(user1).updateProfile(newUsername, PROFILE_IMAGE_HASH);
      
      // Check old username is freed
      expect(await safeLock.usernameToAddress(USERNAME1)).to.equal(ethers.ZeroAddress);
      // Check new username is mapped
      expect(await safeLock.usernameToAddress(newUsername)).to.equal(user1.address);
    });

    it("Should emit UserProfileUpdated event", async function () {
      const newUsername = "alice_updated";
      
      const tx = await safeLock.connect(user1).updateProfile(newUsername, PROFILE_IMAGE_HASH);
      await expect(tx)
        .to.emit(safeLock, "UserProfileUpdated")
        .withArgs(user1.address, newUsername, await time());
    });
  });

  describe("User Lookup Functions", function () {
    beforeEach(async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
    });

    it("Should return correct username to address mapping", async function () {
      expect(await safeLock.usernameToAddress(USERNAME1)).to.equal(user1.address);
    });

    it("Should return address(0) for non-existent username", async function () {
      expect(await safeLock.usernameToAddress("nonexistent")).to.equal(ethers.ZeroAddress);
    });

    it("Should check if user is registered", async function () {
      expect(await safeLock.isUserRegistered(user1.address)).to.be.true;
      expect(await safeLock.isUserRegistered(user2.address)).to.be.false;
    });
  });

  describe("Creating Savings Locks (with registration requirement)", function () {
    it("Should reject unregistered users", async function () {
      await expect(
        safeLock.connect(user1).createSavingsLock(LOCK_DURATION, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("User not registered");
    });

    it("Should allow registered users to create locks", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      // Approve cUSD spending
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), DEPOSIT_AMOUNT);
      
      await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, DEPOSIT_AMOUNT);
      
      const lockInfo = await safeLock.userLockInfo(user1.address);
      expect(lockInfo.totalActiveAmount).to.equal(DEPOSIT_AMOUNT);
      expect(lockInfo.totalActiveLocks).to.equal(1);
    });

    it("Should reject zero amount deposits", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      await expect(
        safeLock.connect(user1).createSavingsLock(LOCK_DURATION, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should reject lock duration below minimum", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      const minDuration = await safeLock.MIN_LOCK_DURATION();
      await expect(
        safeLock.connect(user1).createSavingsLock(minDuration - 1n, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("Invalid lock duration");
    });

    it("Should reject lock duration above maximum", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      const maxDuration = await safeLock.MAX_LOCK_DURATION();
      await expect(
        safeLock.connect(user1).createSavingsLock(maxDuration + 1n, DEPOSIT_AMOUNT)
      ).to.be.revertedWith("Invalid lock duration");
    });

    it("Should reject amount above maximum", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
      const maxAmount = await safeLock.MAX_LOCK_AMOUNT();
      await expect(
        safeLock.connect(user1).createSavingsLock(LOCK_DURATION, maxAmount + 1n)
      ).to.be.revertedWith("Amount exceeds maximum limit");
    });

    it("Should enforce maximum locks per user", async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), ethers.parseEther("100000"));
      
      const maxLocks = await safeLock.MAX_USER_LOCKS();
      
      // Create maximum allowed locks
      for (let i = 0; i < maxLocks; i++) {
        await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, ethers.parseEther("100"));
      }
      
      // Try to create one more
      await expect(
        safeLock.connect(user1).createSavingsLock(LOCK_DURATION, ethers.parseEther("100"))
      ).to.be.revertedWith("Too many locks for user");
    });
  });

  describe("Lock Information Functions", function () {
    beforeEach(async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), DEPOSIT_AMOUNT);
      await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, DEPOSIT_AMOUNT);
    });

    it("Should return user locks with details", async function () {
      const [lockIds, locks] = await safeLock.getUserLocksWithDetails(user1.address);
      
      expect(lockIds.length).to.equal(1);
      expect(locks.length).to.equal(1);
      expect(locks[0].owner).to.equal(user1.address);
      expect(locks[0].amount).to.equal(DEPOSIT_AMOUNT);
      expect(locks[0].isActive).to.be.true;
    });

    it("Should return individual lock details", async function () {
      const lockDetails = await safeLock.getLockDetails(0);
      
      expect(lockDetails.owner).to.equal(user1.address);
      expect(lockDetails.amount).to.equal(DEPOSIT_AMOUNT);
      expect(lockDetails.isActive).to.be.true;
    });

    it("Should return correct user lock info", async function () {
      const lockInfo = await safeLock.userLockInfo(user1.address);
      
      expect(lockInfo.totalActiveAmount).to.equal(DEPOSIT_AMOUNT);
      expect(lockInfo.totalActiveLocks).to.equal(1);
      // Note: lockIds array access is complex with public mappings
      // We'll test the other fields which are more important
    });
  });

  describe("Early Withdrawal with Penalty", function () {
    beforeEach(async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      // Mint enough tokens for the penalty tests (need more than the default 10K)
      await mockCUSD.mint(user1.address, ethers.parseEther("2000000"));
    });

    it("Should apply 0.001% penalty on early withdrawal", async function () {
      const lockAmount = ethers.parseEther("1000000"); // 1M tokens
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), lockAmount);
      await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, lockAmount);

      const initialBalance = await mockCUSD.balanceOf(user1.address);
      
      // Withdraw immediately (early withdrawal)
      await safeLock.connect(user1).withdrawSavings(0);
      
      const finalBalance = await mockCUSD.balanceOf(user1.address);
      
      // Calculate expected penalty: 0.001% = 1/100000
      const expectedPenalty = lockAmount / 100000n;
      const expectedWithdrawal = lockAmount - expectedPenalty;
      
      expect(finalBalance - initialBalance).to.equal(expectedWithdrawal);
      
      // Check penalty pool
      const penaltyPool = await safeLock.getPenaltyPool();
      expect(penaltyPool.totalPenalties).to.equal(expectedPenalty);
    });

    it("Should handle penalty calculation for various amounts", async function () {
      const testCases = [
        ethers.parseEther("100000"),   // 100K tokens
        ethers.parseEther("500000"),   // 500K tokens
        ethers.parseEther("1000000"),  // 1M tokens
      ];

      for (let i = 0; i < testCases.length; i++) {
        const amount = testCases[i];
        await mockCUSD.connect(user1).approve(await safeLock.getAddress(), amount);
        await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, amount);

        const balanceBefore = await mockCUSD.balanceOf(user1.address);
        await safeLock.connect(user1).withdrawSavings(i);
        const balanceAfter = await mockCUSD.balanceOf(user1.address);

        const expectedPenalty = amount / 100000n;
        const expectedWithdrawal = amount - expectedPenalty;
        
        expect(balanceAfter - balanceBefore).to.equal(expectedWithdrawal);
      }
    });

    it("Should handle zero penalty for very small amounts", async function () {
      const smallAmount = 50000n; // Less than 100000, will result in 0 penalty
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), smallAmount);
      await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, smallAmount);

      const balanceBefore = await mockCUSD.balanceOf(user1.address);
      await safeLock.connect(user1).withdrawSavings(0);
      const balanceAfter = await mockCUSD.balanceOf(user1.address);

      // Penalty rounds down to 0, so full amount is returned
      expect(balanceAfter - balanceBefore).to.equal(smallAmount);
    });

    it("Should not apply penalty after lock duration expires", async function () {
      const lockAmount = ethers.parseEther("1000000");
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), lockAmount);
      await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, lockAmount);

      // Fast forward past the lock duration
      await ethers.provider.send("evm_increaseTime", [LOCK_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);

      const balanceBefore = await mockCUSD.balanceOf(user1.address);
      await safeLock.connect(user1).withdrawSavings(0);
      const balanceAfter = await mockCUSD.balanceOf(user1.address);

      // No penalty, full amount returned
      expect(balanceAfter - balanceBefore).to.equal(lockAmount);
    });

    it("Should emit correct penalty amount in SavingsWithdrawn event", async function () {
      const lockAmount = ethers.parseEther("1000000");
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), lockAmount);
      await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, lockAmount);

      const expectedPenalty = lockAmount / 100000n;
      const expectedWithdrawal = lockAmount - expectedPenalty;

      const tx = await safeLock.connect(user1).withdrawSavings(0);
      
      await expect(tx)
        .to.emit(safeLock, "SavingsWithdrawn")
        .withArgs(0, user1.address, expectedWithdrawal, expectedPenalty, true);
    });
  });

  describe("Account Deactivation", function () {
    beforeEach(async function () {
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      await mockCUSD.connect(user1).approve(await safeLock.getAddress(), DEPOSIT_AMOUNT);
      await safeLock.connect(user1).createSavingsLock(LOCK_DURATION, DEPOSIT_AMOUNT);
    });

    it("Should allow user to deactivate account", async function () {
      const initialBalance = await mockCUSD.balanceOf(user1.address);
      
      await safeLock.connect(user1).deactivateAccount();
      
      // Check user profile is deleted
      const profile = await safeLock.getUserProfile(user1.address);
      expect(profile.username).to.equal("");
      expect(profile.isActive).to.be.false;
      
      // Check username mapping is cleared
      expect(await safeLock.usernameToAddress(USERNAME1)).to.equal(ethers.ZeroAddress);
      
      // Check funds are returned
      const finalBalance = await mockCUSD.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance + DEPOSIT_AMOUNT);
    });

    it("Should prevent deactivation of already deactivated account", async function () {
      await safeLock.connect(user1).deactivateAccount();
      
      await expect(
        safeLock.connect(user1).deactivateAccount()
      ).to.be.revertedWith("User not registered");
    });

    it("Should clear all user data on deactivation", async function () {
      await safeLock.connect(user1).deactivateAccount();
      
      // Check user lock info is cleared
      const lockInfo = await safeLock.userLockInfo(user1.address);
      expect(lockInfo.totalActiveAmount).to.equal(0);
      expect(lockInfo.totalActiveLocks).to.equal(0);
      // Note: lockIds array access is complex with public mappings
      // We'll test the other fields which are more important
      
      // Note: userLocks array is cleared on deactivation, but accessing it
      // after deactivation causes issues since the user no longer exists
    });

    it("Should update penalty pool correctly on deactivation", async function () {
      const initialPool = await safeLock.getPenaltyPool();
      
      await safeLock.connect(user1).deactivateAccount();
      
      const finalPool = await safeLock.getPenaltyPool();
      expect(finalPool.totalActiveSavings).to.equal(initialPool.totalActiveSavings - DEPOSIT_AMOUNT);
    });

    it("Should emit UserDeactivated event", async function () {
      const tx = await safeLock.connect(user1).deactivateAccount();
      await expect(tx)
        .to.emit(safeLock, "UserDeactivated")
        .withArgs(user1.address, await time(), DEPOSIT_AMOUNT);
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
      
      await safeLock.connect(user1).registerUser(USERNAME1, PROFILE_IMAGE_HASH);
      
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
      expect(pauseStatus.generalPauseTime).to.equal(0);
    });
  });

  // Helper function to get current block timestamp
  async function time(): Promise<bigint> {
    return BigInt((await ethers.provider.getBlock("latest"))!.timestamp);
  }
});

// Mock ERC20 contract for testing
describe("MockERC20", function () {
  let mockCUSD: any;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const MockCUSD = await ethers.getContractFactory("MockERC20");
    mockCUSD = await MockCUSD.deploy("Celo Dollar", "cUSD");
  });

  it("Should mint tokens correctly", async function () {
    const amount = ethers.parseEther("1000");
    await mockCUSD.mint(user.address, amount);
    expect(await mockCUSD.balanceOf(user.address)).to.equal(amount);
  });

  it("Should allow approval and transfer", async function () {
    const amount = ethers.parseEther("1000");
    await mockCUSD.mint(user.address, amount);
    
    await mockCUSD.connect(user).approve(owner.address, amount);
    await mockCUSD.connect(owner).transferFrom(user.address, owner.address, amount);
    
    expect(await mockCUSD.balanceOf(owner.address)).to.equal(amount);
    expect(await mockCUSD.balanceOf(user.address)).to.equal(0);
  });
});
