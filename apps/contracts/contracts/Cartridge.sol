// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Cartridge
 * @dev A decentralized savings platform with time-locked deposits, penalty system
 */
contract Cartridge is Initializable, UUPSUpgradeable {
    using SafeERC20 for IERC20;

    // Ownership
    address private _owner;

    // Custom pause functionality
    bool public isPaused;
    bool public isSavingsPaused;
    bool public isWithdrawalsPaused;

    // Pause timestamps for tracking
    uint256 public pauseTimestamp;
    uint256 public savingsPauseTimestamp;
    uint256 public withdrawalsPauseTimestamp;

    // Structs
    struct SavingsLock {
        uint256 id;
        address owner;
        uint256 amount;
        uint256 lockTime;
        uint256 unlockTime;
        bool isActive;
        bool isWithdrawn;
        uint256 penaltyAmount;
    }

    struct PenaltyPool {
        uint256 totalPenalties;
        uint256 totalActiveSavings;
    }

    struct UserLockInfo {
        uint256[] lockIds;
        uint256 totalActiveAmount;
        uint256 totalActiveLocks;
    }



    // State variables
    uint256 private _lockIds;
    uint256 private _activeSavingsCount;
    bool private locked;
    // The cUSD token contract
    IERC20 public cUSDToken;

    // Mapping from lock ID to SavingsLock
    mapping(uint256 => SavingsLock) public savingsLocks;

    // Mapping from user address to their lock IDs
    mapping(address => uint256[]) public userLocks;

    // Mapping from user address to their active lock count and total amount
    mapping(address => UserLockInfo) public userLockInfo;

    // Penalty pool for redistributing early withdrawal penalties
    PenaltyPool public penaltyPool;

    // Configuration
    uint256 public constant MIN_LOCK_DURATION = 1 days;
    uint256 public constant MAX_LOCK_DURATION = 365 days;
    uint256 public constant EARLY_WITHDRAWAL_PENALTY = 3; // 3% penalty
    uint256 public constant MAX_LOCK_AMOUNT = 1000000 * 10 ** 18; // 1M cUSD max per lock
    uint256 public constant TIME_BUFFER = 300; // 5 minutes buffer for timestamp manipulation
    uint256 public constant MAX_USER_LOCKS = 20; // Maximum locks per user



    // Events
    event SavingsLocked(
        uint256 indexed lockId,
        address indexed owner,
        uint256 amount,
        uint256 lockTime,
        uint256 unlockTime
    );

    event SavingsWithdrawn(
        uint256 indexed lockId,
        address indexed owner,
        uint256 amount,
        uint256 penaltyAmount,
        bool isEarlyWithdrawal
    );

    event PenaltyPoolUpdated(
        uint256 totalPenalties,
        uint256 totalActiveSavings
    );

    event PenaltiesWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );

    event TokenUpdated(address indexed oldToken, address indexed newToken);



    // Custom pause events
    event ContractPaused(address indexed pauser, uint256 timestamp);
    event ContractUnpaused(address indexed unpauser, uint256 timestamp);
    event SavingsPaused(address indexed pauser, uint256 timestamp);
    event SavingsUnpaused(address indexed unpauser, uint256 timestamp);
    event WithdrawalsPaused(address indexed pauser, uint256 timestamp);
    event WithdrawalsUnpaused(address indexed unpauser, uint256 timestamp);

    // Ownership events
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier reentrancyGuard() {
        require(!locked, "ReentrancyGuard: reentrant call");

        locked = true;
        _;
        locked = false;
    }
    // Modifiers
    modifier onlyLockOwner(uint256 lockId) {
        require(savingsLocks[lockId].owner == msg.sender, "Not the lock owner");
        _;
    }

    modifier lockExists(uint256 lockId) {
        require(
            savingsLocks[lockId].owner != address(0),
            "Lock does not exist"
        );
        _;
    }

    modifier lockActive(uint256 lockId) {
        require(savingsLocks[lockId].isActive, "Lock is not active");
        _;
    }

    modifier validToken(address token) {
        require(token != address(0), "Invalid token address");
        // Basic ERC20 validation
        require(IERC20(token).totalSupply() > 0, "Invalid token contract");
        _;
    }

    modifier withinUserLimits(address user) {
        require(
            userLocks[user].length < MAX_USER_LOCKS,
            "Too many locks for user"
        );
        _;
    }

    // Custom pause modifiers
    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    modifier whenSavingsNotPaused() {
        require(!isSavingsPaused, "Savings operations are paused");
        _;
    }

    modifier whenWithdrawalsNotPaused() {
        require(!isWithdrawalsPaused, "Withdrawal operations are paused");
        _;
    }



    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev Initialize the contract (replaces constructor for upgradeable contracts)
     * @param _cUSDToken Address of the cUSD token
     * @param initialOwner Address of the contract owner
     */
    function initialize(
        address _cUSDToken,
        address initialOwner
    ) external initializer {
        require(initialOwner != address(0), "Invalid owner address");

        cUSDToken = IERC20(_cUSDToken);
        _transferOwnership(initialOwner);

        // Initialize pause states
        isPaused = false;
        isSavingsPaused = false;
        isWithdrawalsPaused = false;
    }

    /**
     * @dev Create a new savings lock
     * @param lockDuration Duration to lock funds (in seconds)
     * @param amount Amount of cUSD to lock
     */
    function createSavingsLock(
        uint256 lockDuration,
        uint256 amount
    )
        external
        reentrancyGuard
        whenNotPaused
        whenSavingsNotPaused
        withinUserLimits(msg.sender)
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_LOCK_AMOUNT, "Amount exceeds maximum limit");
        require(
            lockDuration >= MIN_LOCK_DURATION &&
                lockDuration <= MAX_LOCK_DURATION,
            "Invalid lock duration"
        );

        // Transfer cUSD from user to contract
        cUSDToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 lockId = _lockIds;
        uint256 unlockTime = block.timestamp + lockDuration + TIME_BUFFER; // Add time buffer

        SavingsLock memory newLock = SavingsLock({
            id: lockId,
            owner: msg.sender,
            amount: amount,
            lockTime: block.timestamp,
            unlockTime: unlockTime,
            isActive: true,
            isWithdrawn: false,
            penaltyAmount: 0
        });

        savingsLocks[lockId] = newLock;
        userLocks[msg.sender].push(lockId);

        // Update user lock info (prevent N+1 queries)
        UserLockInfo storage userInfo = userLockInfo[msg.sender];
        userInfo.lockIds.push(lockId);
        userInfo.totalActiveAmount += amount;
        userInfo.totalActiveLocks++;

        _lockIds++;
        _activeSavingsCount++;

        // Update penalty pool
        penaltyPool.totalActiveSavings += amount;

        emit SavingsLocked(
            lockId,
            msg.sender,
            amount,
            block.timestamp,
            unlockTime
        );

        emit PenaltyPoolUpdated(
            penaltyPool.totalPenalties,
            penaltyPool.totalActiveSavings
        );
    }



    /**
     * @dev Withdraw funds from a savings lock
     * @param lockId ID of the lock to withdraw from
     */
    function withdrawSavings(
        uint256 lockId
    )
        external
        reentrancyGuard
        whenNotPaused
        whenWithdrawalsNotPaused
        onlyLockOwner(lockId)
        lockExists(lockId)
        lockActive(lockId)
    {
        SavingsLock storage lock = savingsLocks[lockId];
        require(!lock.isWithdrawn, "Already withdrawn");

        // Use time buffer to prevent timestamp manipulation
        bool isEarlyWithdrawal = block.timestamp <
            (lock.unlockTime - TIME_BUFFER);
        uint256 penaltyAmount = 0;
        uint256 withdrawalAmount = lock.amount;

        if (isEarlyWithdrawal) {
            // Safe penalty calculation with overflow protection and precision handling
            penaltyAmount = (lock.amount * EARLY_WITHDRAWAL_PENALTY) / 100;
            require(penaltyAmount < lock.amount, "Penalty calculation error");
            require(penaltyAmount > 0, "Penalty must be greater than 0");
            withdrawalAmount = lock.amount - penaltyAmount;

            // Add penalty to the pool
            penaltyPool.totalPenalties += penaltyAmount;
            lock.penaltyAmount = penaltyAmount;
        }

        // Update lock status first (CEI pattern)
        lock.isActive = false;
        lock.isWithdrawn = true;

        // Update user lock info
        UserLockInfo storage userInfo = userLockInfo[msg.sender];
        userInfo.totalActiveAmount -= lock.amount;
        userInfo.totalActiveLocks--;

        // Update active savings count
        _activeSavingsCount--;

        // Update penalty pool
        penaltyPool.totalActiveSavings -= lock.amount;

        // Transfer cUSD to user (external call last)
        cUSDToken.safeTransfer(msg.sender, withdrawalAmount);

        emit SavingsWithdrawn(
            lockId,
            msg.sender,
            withdrawalAmount,
            penaltyAmount,
            isEarlyWithdrawal
        );

        emit PenaltyPoolUpdated(
            penaltyPool.totalPenalties,
            penaltyPool.totalActiveSavings
        );
    }

    /**
     * @dev Withdraw accumulated penalties (owner only)
     */
    function withdrawPenalties()
        external
        reentrancyGuard
        whenNotPaused
        onlyOwner
    {
        require(penaltyPool.totalPenalties > 0, "No penalties to withdraw");

        uint256 penaltyAmount = penaltyPool.totalPenalties;
        penaltyPool.totalPenalties = 0;

        cUSDToken.safeTransfer(owner(), penaltyAmount);

        emit PenaltiesWithdrawn(owner(), penaltyAmount, block.timestamp);
    }

    /**
     * @dev Update cUSD token address (owner only, emergency use)
     * @param newToken New cUSD token address
     */
    function updateToken(
        address newToken
    ) external onlyOwner {
        require(newToken != address(cUSDToken), "Same token address");
        require(
            penaltyPool.totalActiveSavings == 0,
            "Cannot update with active savings"
        );

        address oldToken = address(cUSDToken);
        cUSDToken = IERC20(newToken);

        emit TokenUpdated(oldToken, newToken);
    }

    // Custom pause functions
    /**
     * @dev Pause all contract operations (emergency only)
     */
    function pause() external onlyOwner {
        require(!isPaused, "Contract is already paused");
        isPaused = true;
        pauseTimestamp = block.timestamp;
        emit ContractPaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Unpause all contract operations
     */
    function unpause() external onlyOwner {
        require(isPaused, "Contract is not paused");
        isPaused = false;
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Pause only savings operations
     */
    function pauseSavings() external onlyOwner {
        require(!isSavingsPaused, "Savings are already paused");
        isSavingsPaused = true;
        savingsPauseTimestamp = block.timestamp;
        emit SavingsPaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Unpause savings operations
     */
    function unpauseSavings() external onlyOwner {
        require(isSavingsPaused, "Savings are not paused");
        isSavingsPaused = false;
        emit SavingsUnpaused(msg.sender, block.timestamp);
    }



    /**
     * @dev Pause only withdrawal operations
     */
    function pauseWithdrawals() external onlyOwner {
        require(!isWithdrawalsPaused, "Withdrawals are already paused");
        isWithdrawalsPaused = true;
        withdrawalsPauseTimestamp = block.timestamp;
        emit WithdrawalsPaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Unpause withdrawal operations
     */
    function unpauseWithdrawals() external onlyOwner {
        require(isWithdrawalsPaused, "Withdrawals are not paused");
        isWithdrawalsPaused = false;
        emit WithdrawalsUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Get pause status information
     * @return generalPaused General pause status
     * @return savingsPaused Savings pause status
     * @return withdrawalsPaused Withdrawals pause status
     * @return generalPauseTime General pause timestamp
     * @return savingsPauseTime Savings pause timestamp
     * @return withdrawalsPauseTime Withdrawals pause timestamp
     */
    function getPauseStatus()
        external
        view
        returns (
            bool generalPaused,
            bool savingsPaused,
            bool withdrawalsPaused,
            uint256 generalPauseTime,
            uint256 savingsPauseTime,
            uint256 withdrawalsPauseTime
        )
    {
        return (
            isPaused,
            isSavingsPaused,
            isWithdrawalsPaused,
            pauseTimestamp,
            savingsPauseTimestamp,
            withdrawalsPauseTimestamp
        );
    }

    /**
     * @dev Get all locks for a user (optimized to prevent N+1)
     * @param user Address of the user
     * @return Array of lock IDs
     */
    function getUserLocks(
        address user
    ) external view returns (uint256[] memory) {
        require(user != address(0), "Invalid user address");
        return userLocks[user];
    }

    /**
     * @dev Get user lock info (optimized query)
     * @param user Address of the user
     * @return User lock information
     */
    function getUserLockInfo(
        address user
    ) external view returns (UserLockInfo memory) {
        require(user != address(0), "Invalid user address");
        return userLockInfo[user];
    }



    /**
     * @dev Get lock details by ID
     * @param lockId ID of the lock
     * @return Lock details
     */
    function getLockDetails(
        uint256 lockId
    ) external view lockExists(lockId) returns (SavingsLock memory) {
        return savingsLocks[lockId];
    }

    /**
     * @dev Get total active savings count (gas optimized)
     * @return Count of active savings
     */
    function getActiveSavingsCount() external view returns (uint256) {
        return _getActiveSavingsCount();
    }

    /**
     * @dev Get penalty pool information
     * @return Penalty pool details
     */
    function getPenaltyPool() external view returns (PenaltyPool memory) {
        return penaltyPool;
    }

    /**
     * @dev Check if penalties can be withdrawn
     * @return True if penalties can be withdrawn
     */
    function canWithdrawPenalties() external view returns (bool) {
        return penaltyPool.totalPenalties > 0;
    }

    /**
     * @dev Get total active savings count (internal, gas optimized)
     */
    function _getActiveSavingsCount() internal view returns (uint256) {
        return _activeSavingsCount;
    }

    /**
     * @dev Emergency function to recover stuck tokens (owner only)
     * @param token Address of the token to recover
     * @param amount Amount to recover
     */
    function emergencyRecoverTokens(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(token != address(cUSDToken), "Cannot recover cUSD tokens");
        require(amount > 0, "Amount must be greater than 0");

        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Required by the OZ UUPS module
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
