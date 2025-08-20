// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ReactiveContract
 * @dev A base contract for reactive DeFi operations
 * @author Abdullah Al Ameer
 */
contract ReactiveContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event ContractActivated(address indexed owner, uint256 timestamp);
    event ContractDeactivated(address indexed owner, uint256 timestamp);
    event FundsDeposited(address indexed user, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event StrategyExecuted(string strategy, uint256 profit, uint256 timestamp);

    // State variables
    bool public isActive;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    uint256 public totalProfit;
    
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userWithdrawals;

    // Modifiers
    modifier onlyActive() {
        require(isActive, "Contract is not active");
        _;
    }

    modifier onlyInactive() {
        require(!isActive, "Contract is already active");
        _;
    }

    /**
     * @dev Constructor
     * @param initialOwner The initial owner of the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        isActive = false;
    }

    /**
     * @dev Activate the contract
     */
    function activate() external onlyOwner onlyInactive {
        isActive = true;
        emit ContractActivated(msg.sender, block.timestamp);
    }

    /**
     * @dev Deactivate the contract
     */
    function deactivate() external onlyOwner onlyActive {
        isActive = false;
        emit ContractDeactivated(msg.sender, block.timestamp);
    }

    /**
     * @dev Deposit funds into the contract
     */
    function deposit() external payable onlyActive nonReentrant {
        require(msg.value > 0, "Must deposit some ETH");
        
        userDeposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit FundsDeposited(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw funds from the contract
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyActive nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(userDeposits[msg.sender] >= amount, "Insufficient balance");
        
        userDeposits[msg.sender] -= amount;
        totalWithdrawals += amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Get user balance
     * @param user Address of the user
     * @return User's current balance
     */
    function getUserBalance(address user) external view returns (uint256) {
        return userDeposits[user] - userWithdrawals[user];
    }

    /**
     * @dev Get contract balance
     * @return Contract's current balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Execute a strategy (placeholder for future implementation)
     * @param strategyName Name of the strategy to execute
     */
    function executeStrategy(string memory strategyName) external onlyOwner onlyActive {
        // This is a placeholder for future strategy implementations
        // In a real implementation, this would contain arbitrage, yield farming, etc.
        
        emit StrategyExecuted(strategyName, 0, block.timestamp);
    }

    /**
     * @dev Emergency withdraw all funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    /**
     * @dev Withdraw ERC20 tokens (owner only)
     * @param token Address of the ERC20 token
     * @param amount Amount to withdraw
     */
    function withdrawERC20(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    // Receive function to accept ETH
    receive() external payable {
        // Only accept ETH if contract is active
        require(isActive, "Contract is not active");
    }
}
