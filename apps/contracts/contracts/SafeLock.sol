// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SafeLock
 * @dev A decentralized savings platform with time-locked deposits, penalty system,
 * user registration, and emergency account deactivation
 */
contract SafeLock {
    using SafeERC20 for IERC20;

    // Ownership
    address private _owner;

    // Custom pause functionality
    bool public isPaused;

    // Pause timestamp for tracking
    uint256 public pauseTimestamp;

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

    // New: User Profile struct
    struct UserProfile {
        string username;
        uint256 registrationDate;
        bool isActive;
        uint256 lastActivity;
        string profileImageHash;
    }

    // State variables
    uint256 private _lockIds;
    uint256 private _activeSavingsCount;
    bool private locked;
    // The cUSD token contract
    IERC20 public cUSDToken;
    IERC20 public USDTToken;
    IERC20 public CGHSToken;
    IERC20 public CNGNToken;
    IERC20 public CKESToken;

    // Mapping from lock ID to SavingsLock
    mapping(uint256 => SavingsLock) public savingsLocks;

    // Mapping from user address to their lock IDs
    mapping(address => uint256[]) public userLocks;

    // Mapping from user address to their active lock count and total amount
    mapping(address => UserLockInfo) public userLockInfo;

    // New: User profile mapping
    mapping(address => UserProfile) public userProfiles;

    // New: Username to address mapping (for unique usernames)
    mapping(string => address) public usernameToAddress;

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

    // New: User management events
    event UserRegistered(
        address indexed user,
        string username,
        uint256 registrationDate
    );

    event UserProfileUpdated(
        address indexed user,
        string username,
        uint256 timestamp
    );

    event UserDeactivated(
        address indexed user,
        uint256 deactivationDate,
        uint256 totalRefunded
    );

    // Custom pause events
    event ContractPaused(address indexed pauser, uint256 timestamp);
    event ContractUnpaused(address indexed unpauser, uint256 timestamp);

    // Ownership events
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

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

    modifier withinUserLimits(address user) {
        require(
            userLocks[user].length < MAX_USER_LOCKS,
            "Too many locks for user"
        );
        _;
    }

    // New: Username validation modifier
    modifier validUsername(string memory username) {
        require(bytes(username).length >= 3, "Username too short");
        require(bytes(username).length <= 32, "Username too long");
        require(
            usernameToAddress[username] == address(0),
            "Username already taken"
        );
        _;
    }

    // Custom pause modifiers
    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    /**
     * @dev Constructor to initialize the contract
     * @param _cUSDToken Address of the cUSD token
     * @param _USDTToken Address of the USDT token
     * @param _CGHSToken Address of the CGHST token
     * @param _CNGNToken Address of the CNGN token
     * @param _CKESToken Address of the CKESToken token
     * @param initialOwner Address of the contract owner
     */
    constructor(
        address _cUSDToken,
        address _USDTToken,
        address _CGHSToken,
        address _CNGNToken,
        address _CKESToken,
        address initialOwner
    ) {
        require(initialOwner != address(0), "Invalid owner address");
        require(_cUSDToken != address(0), "Invalid token address");
        require(_USDTToken != address(0), "Invalid token address");
        require(_CGHSToken != address(0), "Invalid token address");
        require(_CNGNToken != address(0), "Invalid token address");
        require(_CKESToken != address(0), "Invalid token address");

        cUSDToken = IERC20(_cUSDToken);
        USDTToken = IERC20(_USDTToken);
        CGHSToken = IERC20(_CGHSToken);
        CNGNToken = IERC20(_CNGNToken);
        CKESToken = IERC20(_CKESToken);
        _transferOwnership(initialOwner);

        // Initialize pause state
        isPaused = false;
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
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
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

    // New: User Registration Functions

    /**
     * @dev Register a new user with username
     * @param username Unique username for the user
     * @param profileImageHash IPFS hash for profile image (optional)
     */
    function registerUser(
        string memory username,
        string memory profileImageHash
    ) external validUsername(username) {
        require(!userProfiles[msg.sender].isActive, "User already registered");

        // Create user profile
        UserProfile memory newProfile = UserProfile({
            username: username,
            registrationDate: block.timestamp,
            isActive: true,
            lastActivity: block.timestamp,
            profileImageHash: profileImageHash
        });

        userProfiles[msg.sender] = newProfile;
        usernameToAddress[username] = msg.sender;

        // Initialize user lock info
        userLockInfo[msg.sender] = UserLockInfo({
            lockIds: new uint256[](0),
            totalActiveAmount: 0,
            totalActiveLocks: 0
        });

        emit UserRegistered(msg.sender, username, block.timestamp);
    }

    /**
     * @dev Update user profile information
     * @param newUsername New username (must be unique)
     * @param newProfileImageHash New profile image hash
     */
    function updateProfile(
        string memory newUsername,
        string memory newProfileImageHash
    ) external {
        require(userProfiles[msg.sender].isActive, "User not registered");
        UserProfile storage profile = userProfiles[msg.sender];

        // If username is changing, validate it's unique
        if (
            keccak256(bytes(profile.username)) != keccak256(bytes(newUsername))
        ) {
            require(
                usernameToAddress[newUsername] == address(0),
                "Username already taken"
            );
            require(bytes(newUsername).length >= 3, "Username too short");
            require(bytes(newUsername).length <= 32, "Username too long");

            // Remove old username mapping
            delete usernameToAddress[profile.username];
            // Set new username mapping
            usernameToAddress[newUsername] = msg.sender;
            profile.username = newUsername;
        }

        if (bytes(newProfileImageHash).length > 0) {
            profile.profileImageHash = newProfileImageHash;
        }

        profile.lastActivity = block.timestamp;

        emit UserProfileUpdated(msg.sender, newUsername, block.timestamp);
    }

    /**
     * @dev Emergency account deactivation - sends all funds back to user regardless of lock status
     * This is a critical safety feature that allows users to exit the platform immediately
     * Optimized to avoid N+1 queries by using cached user info
     */
    function deactivateAccount() external reentrancyGuard {
        require(userProfiles[msg.sender].isActive, "User not registered");
        UserProfile storage profile = userProfiles[msg.sender];
        require(profile.isActive, "Account already deactivated");

        // Get cached user info to avoid N+1 queries
        UserLockInfo storage userInfo = userLockInfo[msg.sender];
        uint256 totalRefunded = 0;

        // Use the cached total active amount for immediate penalty pool update
        uint256 userActiveAmount = userInfo.totalActiveAmount;
        uint256 userActiveLocks = userInfo.totalActiveLocks;

        // Process each lock and refund the full amount
        uint256[] memory userLockIds = userLocks[msg.sender];
        uint256[] memory activeLockIds = new uint256[](userActiveLocks);
        uint256 activeIndex = 0;

        for (uint256 i = 0; i < userLockIds.length; i++) {
            uint256 lockId = userLockIds[i];
            SavingsLock storage lock = savingsLocks[lockId];

            if (lock.isActive && !lock.isWithdrawn) {
                // Calculate penalty that would have been applied
                uint256 penaltyAmount = 0;
                if (block.timestamp < (lock.unlockTime - TIME_BUFFER)) {
                    penaltyAmount =
                        (lock.amount * EARLY_WITHDRAWAL_PENALTY) /
                        100;
                }

                // Refund full amount (no penalty for emergency deactivation)
                uint256 refundAmount = lock.amount;
                totalRefunded += refundAmount;

                // Update lock status
                lock.isActive = false;
                lock.isWithdrawn = true;
                lock.penaltyAmount = penaltyAmount; // Record what penalty would have been

                // Store active lock ID for efficient cleanup
                activeLockIds[activeIndex] = lockId;
                activeIndex++;
            }
        }

        // Bulk update penalty pool using cached values (avoid N+1)
        penaltyPool.totalActiveSavings -= userActiveAmount;
        _activeSavingsCount -= userActiveLocks;

        // Clear user data
        string memory username = profile.username;
        delete userProfiles[msg.sender];
        delete usernameToAddress[username];
        delete userLocks[msg.sender];
        delete userLockInfo[msg.sender];

        // Transfer all refunded funds
        if (totalRefunded > 0) {
            cUSDToken.safeTransfer(msg.sender, totalRefunded);
        }

        emit UserDeactivated(msg.sender, block.timestamp, totalRefunded);
        emit PenaltyPoolUpdated(
            penaltyPool.totalPenalties,
            penaltyPool.totalActiveSavings
        );
    }

    /**
     * @dev Get user profile information
     * @param user Address of the user
     * @return User profile details
     */
    function getUserProfile(
        address user
    ) external view returns (UserProfile memory) {
        require(user != address(0), "Invalid user address");
        return userProfiles[user];
    }

    /**
     * @dev Check if a user is registered (gas-efficient check)
     * @param user Address of the user
     * @return True if user is registered and active
     */
    function isUserRegistered(address user) external view returns (bool) {
        return userProfiles[user].isActive;
    }

    /**
     * @dev Check if a username is available
     * @param username Username to check
     * @return True if username is available, false if already taken
     */
    function isUsernameAvailable(
        string memory username
    ) external view returns (bool) {
        require(bytes(username).length >= 3, "Username too short");
        require(bytes(username).length <= 32, "Username too long");
        return usernameToAddress[username] == address(0);
    }

    /**
     * @dev Create a new savings lock (now requires user registration)
     * @param lockDuration Duration to lock funds (in seconds)
     * @param amount Amount of cUSD to lock
     */
    function createSavingsLock(
        uint256 lockDuration,
        uint256 amount
    ) external reentrancyGuard whenNotPaused withinUserLimits(msg.sender) {
        require(userProfiles[msg.sender].isActive, "User not registered");
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

        // Update last activity
        userProfiles[msg.sender].lastActivity = block.timestamp;

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
     * @dev Withdraw funds from a savings lock (now requires user registration)
     * @param lockId ID of the lock to withdraw from
     */
    function withdrawSavings(
        uint256 lockId
    )
        external
        reentrancyGuard
        whenNotPaused
        onlyLockOwner(lockId)
        lockExists(lockId)
        lockActive(lockId)
    {
        require(userProfiles[msg.sender].isActive, "User not registered");
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

        // Update last activity
        userProfiles[msg.sender].lastActivity = block.timestamp;

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
    function updateToken(address newToken) external onlyOwner {
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
     * @dev Get pause status information
     * @return generalPaused General pause status
     * @return generalPauseTime General pause timestamp
     */
    function getPauseStatus()
        external
        view
        returns (bool generalPaused, uint256 generalPauseTime)
    {
        return (isPaused, pauseTimestamp);
    }

    /**
     * @dev Get all locks for a user with full details in one call
     * @param user Address of the user
     * @return lockIds Array of all lock IDs for the user
     * @return locks Array of complete lock details
     */
    function getUserLocksWithDetails(
        address user
    )
        external
        view
        returns (uint256[] memory lockIds, SavingsLock[] memory locks)
    {
        require(user != address(0), "Invalid user address");

        lockIds = userLocks[user];
        locks = new SavingsLock[](lockIds.length);

        for (uint256 i = 0; i < lockIds.length; i++) {
            locks[i] = savingsLocks[lockIds[i]];
        }
    }

    /**
     * @dev Get individual lock details by ID
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
}
