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
        string title; // Custom title for the lock
        address token; // Token address used for this lock
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

    // Whitelisted tokens mapping
    mapping(address => bool) public isWhitelistedToken;

    PenaltyPool public penaltyPool;

    // Per-token penalties accrued from early withdrawals
    mapping(address => uint256) public penaltiesByToken;

    // Per-token total active principal currently locked
    mapping(address => uint256) public activeSavingsByToken;

    // Per-token maximum lock amount to handle decimals differences
    mapping(address => uint256) public maxLockAmountByToken;

    // Configuration
    uint256 public constant MIN_LOCK_DURATION = 1 days;
    uint256 public constant MAX_LOCK_DURATION = 365 days;
    uint256 public constant EARLY_WITHDRAWAL_PENALTY_BASIS_POINTS = 1; // 0.001% penalty (1/100000)
    uint256 public constant PENALTY_DENOMINATOR = 100000; // Denominator for penalty calculation
    uint256 public constant MAX_LOCK_AMOUNT = 1000000 * 10 ** 18; // 1M cUSD max per lock
    uint256 public constant TIME_BUFFER = 300; // 5 minutes buffer for timestamp manipulation
    uint256 public constant MAX_USER_LOCKS = 20; // Maximum locks per user
    uint256 public constant MAX_LOCK_TITLE_LENGTH = 50; // Maximum characters for lock title

    // Events
    event SavingsLocked(
        uint256 indexed lockId,
        address indexed owner,
        uint256 amount,
        uint256 lockTime,
        uint256 unlockTime,
        string title
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
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event TokenUpdated(address indexed oldToken, address indexed newToken);
    event TokenWhitelisted(address indexed token, uint256 maxLockAmount);
    event TokenWhitelistRemoved(address indexed token);
    event TokenMaxUpdated(address indexed token, uint256 oldMax, uint256 newMax);

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
        string memory normalized = _normalize(username);
        require(bytes(normalized).length >= 3, "Username too short");
        require(bytes(normalized).length <= 32, "Username too long");
        require(
            usernameToAddress[normalized] == address(0),
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

        // Whitelist all supported tokens
        isWhitelistedToken[_cUSDToken] = true;
        isWhitelistedToken[_USDTToken] = true;
        isWhitelistedToken[_CGHSToken] = true;
        isWhitelistedToken[_CNGNToken] = true;
        isWhitelistedToken[_CKESToken] = true;

        // Initialize pause state
        isPaused = false;

        // Initialize per-token max lock amounts (defaults)
        maxLockAmountByToken[_cUSDToken] = MAX_LOCK_AMOUNT;
        maxLockAmountByToken[_USDTToken] = MAX_LOCK_AMOUNT;
        maxLockAmountByToken[_CGHSToken] = MAX_LOCK_AMOUNT;
        maxLockAmountByToken[_CNGNToken] = MAX_LOCK_AMOUNT;
        maxLockAmountByToken[_CKESToken] = MAX_LOCK_AMOUNT;
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

    /**
     * @dev Normalize a username: lowercase and disallow leading/trailing spaces
     */
    function _normalize(string memory input) internal pure returns (string memory) {
        bytes memory data = bytes(input);
        if (data.length > 0) {
            // Disallow leading or trailing spaces (0x20)
            require(!(data[0] == 0x20 || data[data.length - 1] == 0x20), "No leading/trailing spaces");
            // Convert ASCII A-Z to a-z
            for (uint256 i = 0; i < data.length; i++) {
                uint8 c = uint8(data[i]);
                if (c >= 65 && c <= 90) {
                    data[i] = bytes1(c + 32);
                }
            }
        }
        return string(data);
    }

    /**
     * @dev Validate a title has at least one non-space character
     */
    function _hasNonWhitespace(string memory input) internal pure returns (bool) {
        bytes memory data = bytes(input);
        for (uint256 i = 0; i < data.length; i++) {
            if (data[i] != 0x20) {
                return true;
            }
        }
        return false;
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
    ) external whenNotPaused validUsername(username) {
        require(!userProfiles[msg.sender].isActive, "User already registered");
        string memory normalizedUsername = _normalize(username);

        // Create user profile
        UserProfile memory newProfile = UserProfile({
            username: normalizedUsername,
            registrationDate: block.timestamp,
            isActive: true,
            lastActivity: block.timestamp,
            profileImageHash: profileImageHash
        });

        userProfiles[msg.sender] = newProfile;
        usernameToAddress[normalizedUsername] = msg.sender;

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
    ) external whenNotPaused {
        require(userProfiles[msg.sender].isActive, "User not registered");
        UserProfile storage profile = userProfiles[msg.sender];
        string memory normalizedNew = _normalize(newUsername);

        // If username is changing, validate it's unique
        if (
            keccak256(bytes(profile.username)) != keccak256(bytes(normalizedNew))
        ) {
            require(
                usernameToAddress[normalizedNew] == address(0),
                "Username already taken"
            );
            require(bytes(normalizedNew).length >= 3, "Username too short");
            require(bytes(normalizedNew).length <= 32, "Username too long");

            // Remove old username mapping
            delete usernameToAddress[profile.username];
            // Set new username mapping
            usernameToAddress[normalizedNew] = msg.sender;
            profile.username = normalizedNew;
        }

        if (bytes(newProfileImageHash).length > 0) {
            profile.profileImageHash = newProfileImageHash;
        }

        profile.lastActivity = block.timestamp;

        emit UserProfileUpdated(msg.sender, normalizedNew, block.timestamp);
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

        for (uint256 i = 0; i < userLockIds.length; i++) {
            uint256 lockId = userLockIds[i];
            SavingsLock storage lock = savingsLocks[lockId];

            if (lock.isActive && !lock.isWithdrawn) {
                // Calculate penalty that would have been applied
                uint256 penaltyAmount = 0;
                if (block.timestamp < (lock.unlockTime - TIME_BUFFER)) {
                    penaltyAmount =
                        (lock.amount * EARLY_WITHDRAWAL_PENALTY_BASIS_POINTS) /
                        PENALTY_DENOMINATOR;
                }

                // Refund full amount (no penalty for emergency deactivation)
                uint256 refundAmount = lock.amount;
                totalRefunded += refundAmount;

                // Update lock status
                lock.isActive = false;
                lock.isWithdrawn = true;
                lock.penaltyAmount = penaltyAmount; // Record what penalty would have been

                // Transfer tokens immediately to avoid complex tracking
                IERC20(lock.token).safeTransfer(msg.sender, refundAmount);

                // Decrement per-token active savings
                activeSavingsByToken[lock.token] -= lock.amount;
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
        string memory normalized = _normalize(username);
        require(bytes(normalized).length >= 3, "Username too short");
        require(bytes(normalized).length <= 32, "Username too long");
        return usernameToAddress[normalized] == address(0);
    }

    /**
     * @dev Create a new savings lock (now requires user registration)
     * @param lockDuration Duration to lock funds (in seconds)
     * @param amount Amount of tokens to lock
     * @param title Custom title for the lock (1-50 characters)
     * @param tokenAddress Address of the token to lock
     */
    function createSavingsLock(
        uint256 lockDuration,
        uint256 amount,
        string memory title,
        address tokenAddress
    ) external reentrancyGuard whenNotPaused withinUserLimits(msg.sender) {
        require(userProfiles[msg.sender].isActive, "User not registered");
        require(amount > 0, "Amount must be greater than 0");
        require(isWhitelistedToken[tokenAddress], "Token not whitelisted");
        require(amount <= maxLockAmountByToken[tokenAddress], "Amount exceeds token maximum");
        require(
            lockDuration >= MIN_LOCK_DURATION &&
                lockDuration <= MAX_LOCK_DURATION,
            "Invalid lock duration"
        );
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(title).length <= MAX_LOCK_TITLE_LENGTH, "Title too long");
        require(_hasNonWhitespace(title), "Title cannot be whitespace");

        // Transfer tokens from user to contract
        IERC20(tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );

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
            penaltyAmount: 0,
            title: title,
            token: tokenAddress
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
        activeSavingsByToken[tokenAddress] += amount;

        // Update last activity
        userProfiles[msg.sender].lastActivity = block.timestamp;

        emit SavingsLocked(
            lockId,
            msg.sender,
            amount,
            block.timestamp,
            unlockTime,
            title
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
            // Penalty is 0.001% (1/100000) of the locked amount
            penaltyAmount =
                (lock.amount * EARLY_WITHDRAWAL_PENALTY_BASIS_POINTS) /
                PENALTY_DENOMINATOR;
            require(penaltyAmount < lock.amount, "Penalty calculation error");
            // For very small amounts, penalty might be 0 due to rounding, which is acceptable
            withdrawalAmount = lock.amount - penaltyAmount;

            // Add penalty to the pool
            penaltiesByToken[lock.token] += penaltyAmount;
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
        activeSavingsByToken[lock.token] -= lock.amount;

        // Update last activity
        userProfiles[msg.sender].lastActivity = block.timestamp;

        // Transfer tokens to user (external call last)
        IERC20(lock.token).safeTransfer(msg.sender, withdrawalAmount);

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
     * @dev Withdraw accumulated penalties for a specific token (owner only)
     * @param token The token address to withdraw penalties for
     */
    function withdrawPenalties(address token)
        external
        reentrancyGuard
        whenNotPaused
        onlyOwner
    {
        uint256 amount = penaltiesByToken[token];
        require(amount > 0, "No penalties for token");

        // Zero out per-token penalties first
        penaltiesByToken[token] = 0;

        // Adjust aggregate penalties to keep accounting consistent
        if (penaltyPool.totalPenalties >= amount) {
            penaltyPool.totalPenalties -= amount;
        } else {
            penaltyPool.totalPenalties = 0;
        }

        IERC20(token).safeTransfer(owner(), amount);

        emit PenaltiesWithdrawn(owner(), token, amount, block.timestamp);
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
        // Ensure no active principal or unwithdrawn penalties exist for current cUSD token
        require(
            activeSavingsByToken[address(cUSDToken)] == 0,
            "Per-token active savings not zero"
        );
        require(
            penaltiesByToken[address(cUSDToken)] == 0,
            "Unwithdrawn cUSD penalties exist"
        );

        address oldToken = address(cUSDToken);
        cUSDToken = IERC20(newToken);

        emit TokenUpdated(oldToken, newToken);
    }

    /**
     * @dev Owner: Add a new whitelisted token with a per-token max lock amount
     */
    function addWhitelistedToken(address token, uint256 maxLockAmount) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!isWhitelistedToken[token], "Already whitelisted");
        require(maxLockAmount > 0, "Max must be > 0");
        isWhitelistedToken[token] = true;
        maxLockAmountByToken[token] = maxLockAmount;
        emit TokenWhitelisted(token, maxLockAmount);
    }

    /**
     * @dev Owner: Update per-token max lock amount
     */
    function updateTokenMaxLock(address token, uint256 newMax) external onlyOwner {
        require(isWhitelistedToken[token], "Token not whitelisted");
        require(newMax > 0, "Max must be > 0");
        uint256 old = maxLockAmountByToken[token];
        maxLockAmountByToken[token] = newMax;
        emit TokenMaxUpdated(token, old, newMax);
    }

    /**
     * @dev Owner: Remove a token from whitelist. Only when no principal or penalties remain.
     */
    function removeWhitelistedToken(address token) external onlyOwner {
        require(isWhitelistedToken[token], "Token not whitelisted");
        require(activeSavingsByToken[token] == 0, "Active savings exist for token");
        require(penaltiesByToken[token] == 0, "Unwithdrawn penalties for token");
        isWhitelistedToken[token] = false;
        maxLockAmountByToken[token] = 0;
        emit TokenWhitelistRemoved(token);
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
