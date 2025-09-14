import { SAFELOCK_CONTRACT, CONTRACT_CONSTANTS } from './contracts'
import { writeContractWithReferral, isDivviAvailable } from './divvi'
import type { Address } from 'viem'

// Enhanced SafeLock contract interactions with Divvi referral tracking

/**
 * Register a user with Divvi referral tracking
 */
export const registerUserWithReferral = async (
  userAddress: Address,
  username: string,
  profileImageHash: string = ''
) => {
  if (!isDivviAvailable()) {
    throw new Error('Ethereum provider not available')
  }

  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'registerUser',
    args: [username, profileImageHash],
  })
}

/**
 * Create a savings lock with Divvi referral tracking
 */
export const createSavingsLockWithReferral = async (
  userAddress: Address,
  lockDuration: number,
  amount: bigint
) => {
  if (!isDivviAvailable()) {
    throw new Error('Ethereum provider not available')
  }

  // Validate lock duration
  if (lockDuration < CONTRACT_CONSTANTS.MIN_LOCK_DURATION) {
    throw new Error('Lock duration too short')
  }
  if (lockDuration > CONTRACT_CONSTANTS.MAX_LOCK_DURATION) {
    throw new Error('Lock duration too long')
  }

  // Validate amount
  if (amount <= 0n) {
    throw new Error('Amount must be greater than 0')
  }
  if (amount > BigInt(CONTRACT_CONSTANTS.MAX_LOCK_AMOUNT)) {
    throw new Error('Amount exceeds maximum limit')
  }

  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'createSavingsLock',
    args: [lockDuration, amount],
  })
}

/**
 * Withdraw savings with Divvi referral tracking
 */
export const withdrawSavingsWithReferral = async (
  userAddress: Address,
  lockId: number
) => {
  if (!isDivviAvailable()) {
    throw new Error('Ethereum provider not available')
  }

  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'withdrawSavings',
    args: [lockId],
  })
}

/**
 * Update user profile with Divvi referral tracking
 */
export const updateProfileWithReferral = async (
  userAddress: Address,
  newUsername: string,
  newProfileImageHash: string = ''
) => {
  if (!isDivviAvailable()) {
    throw new Error('Ethereum provider not available')
  }

  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'updateProfile',
    args: [newUsername, newProfileImageHash],
  })
}

/**
 * Emergency account deactivation with Divvi referral tracking
 */
export const deactivateAccountWithReferral = async (userAddress: Address) => {
  if (!isDivviAvailable()) {
    throw new Error('Ethereum provider not available')
  }

  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'deactivateAccount',
    args: [],
  })
}

// Read-only contract functions (no referral tracking needed for reads)
export const SafeLockReadFunctions = {
  // Get user profile
  getUserProfile: (userAddress: Address) => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'getUserProfile',
    args: [userAddress],
  }),

  // Check if user is registered
  isUserRegistered: (userAddress: Address) => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'isUserRegistered',
    args: [userAddress],
  }),

  // Check username availability
  isUsernameAvailable: (username: string) => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'isUsernameAvailable',
    args: [username],
  }),

  // Get user locks with details
  getUserLocksWithDetails: (userAddress: Address) => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'getUserLocksWithDetails',
    args: [userAddress],
  }),

  // Get lock details
  getLockDetails: (lockId: number) => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'getLockDetails',
    args: [lockId],
  }),

  // Get penalty pool
  getPenaltyPool: () => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'getPenaltyPool',
    args: [],
  }),

  // Get active savings count
  getActiveSavingsCount: () => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'getActiveSavingsCount',
    args: [],
  }),

  // Get pause status
  getPauseStatus: () => ({
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'getPauseStatus',
    args: [],
  }),

  // Get contract constants
  getContractConstants: () => ({
    MIN_LOCK_DURATION: CONTRACT_CONSTANTS.MIN_LOCK_DURATION,
    MAX_LOCK_DURATION: CONTRACT_CONSTANTS.MAX_LOCK_DURATION,
    EARLY_WITHDRAWAL_PENALTY: CONTRACT_CONSTANTS.EARLY_WITHDRAWAL_PENALTY,
    MAX_LOCK_AMOUNT: CONTRACT_CONSTANTS.MAX_LOCK_AMOUNT,
    MAX_USER_LOCKS: CONTRACT_CONSTANTS.MAX_USER_LOCKS,
  }),
}

// Utility functions for validation
export const validateLockDuration = (duration: number) => {
  const min = CONTRACT_CONSTANTS.MIN_LOCK_DURATION
  const max = CONTRACT_CONSTANTS.MAX_LOCK_DURATION
  
  if (duration < min) {
    throw new Error(`Lock duration must be at least ${min / (24 * 60 * 60)} days`)
  }
  if (duration > max) {
    throw new Error(`Lock duration must be at most ${max / (24 * 60 * 60)} days`)
  }
}

export const validateLockAmount = (amount: bigint) => {
  const max = BigInt(CONTRACT_CONSTANTS.MAX_LOCK_AMOUNT)
  
  if (amount <= 0n) {
    throw new Error('Amount must be greater than 0')
  }
  if (amount > max) {
    throw new Error(`Amount must not exceed ${max / BigInt(10**18)} cUSD`)
  }
}

export const validateUsername = (username: string) => {
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long')
  }
  if (username.length > 32) {
    throw new Error('Username must be at most 32 characters long')
  }
}

// Helper function to format duration for display
export const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
}

// Helper function to format amount for display
export const formatAmount = (amount: bigint) => {
  const cusd = Number(amount) / 10**18
  return `${cusd.toFixed(2)} cUSD`
}
