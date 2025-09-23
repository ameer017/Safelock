import { SAFELOCK_CONTRACT, CONTRACT_CONSTANTS } from './contracts'
import { writeContractWithReferral } from './divvi'
import type { Address } from 'viem'

// SafeLock contract interactions with Divvi referral tracking

/**
 * Register a user with Divvi referral tracking (async)
 */
export const registerUserWithDivvi = async (
  userAddress: Address,
  username: string,
  profileImageHash: string = ''
) => {
  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'registerUser',
    args: [username, profileImageHash],
  })
}

/**
 * Register a user (for use with useWriteContract hook)
 */
export const registerUser = (
  username: string,
  profileImageHash: string = ''
) => {
  return {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'registerUser' as const,
    args: [username, profileImageHash] as const,
  }
}

/**
 * Create a savings lock with Divvi referral tracking (async)
 */
export const createSavingsLockWithDivvi = async (
  userAddress: Address,
  lockDuration: number,
  amount: bigint
) => {
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
    args: [BigInt(lockDuration), amount],
  })
}

/**
 * Create a savings lock (for use with useWriteContract hook)
 */
export const createSavingsLock = (
  lockDuration: number,
  amount: bigint
) => {
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

  return {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'createSavingsLock' as const,
    args: [BigInt(lockDuration), amount] as const,
  }
}

/**
 * Withdraw savings with Divvi referral tracking (async)
 */
export const withdrawSavingsWithDivvi = async (
  userAddress: Address,
  lockId: bigint
) => {
  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'withdrawSavings',
    args: [lockId],
  })
}

/**
 * Withdraw savings (for use with useWriteContract hook)
 */
export const withdrawSavings = (lockId: bigint) => {
  return {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'withdrawSavings' as const,
    args: [lockId] as const,
  }
}

/**
 * Update user profile with Divvi referral tracking (async)
 */
export const updateProfileWithDivvi = async (
  userAddress: Address,
  newUsername: string,
  newProfileImageHash: string = ''
) => {
  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'updateProfile',
    args: [newUsername, newProfileImageHash],
  })
}

/**
 * Update user profile (for use with useWriteContract hook)
 */
export const updateProfile = (
  newUsername: string,
  newProfileImageHash: string = ''
) => {
  return {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'updateProfile' as const,
    args: [newUsername, newProfileImageHash] as const,
  }
}

/**
 * Emergency account deactivation with Divvi referral tracking (async)
 */
export const deactivateAccountWithDivvi = async (userAddress: Address) => {
  return writeContractWithReferral(userAddress, {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'deactivateAccount',
    args: [],
  })
}

/**
 * Emergency account deactivation (for use with useWriteContract hook)
 */
export const deactivateAccount = () => {
  return {
    address: SAFELOCK_CONTRACT.address,
    abi: SAFELOCK_CONTRACT.abi,
    functionName: 'deactivateAccount' as const,
    args: [] as const,
  }
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

// Divvi-enabled contract functions for mainnet
export const SafeLockWithDivvi = {
  registerUser: registerUserWithDivvi,
  createSavingsLock: createSavingsLockWithDivvi,
  withdrawSavings: withdrawSavingsWithDivvi,
  updateProfile: updateProfileWithDivvi,
  deactivateAccount: deactivateAccountWithDivvi,
}
