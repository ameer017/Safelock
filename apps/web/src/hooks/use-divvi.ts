"use client"

import { useAccount } from 'wagmi'
import { useCallback } from 'react'
import { 
  writeContractWithReferral, 
  sendTransactionWithReferral,
  isDivviAvailable,
  DIVVI_CONSUMER_ADDRESS 
} from '@/lib/divvi'
import type { Address } from 'viem'

export interface UseDivviReturn {
  isAvailable: boolean
  consumerAddress: string
  writeContract: (contractData: {
    address: Address
    abi: any
    functionName: string
    args: any[]
    value?: bigint
    gas?: bigint
    gasPrice?: bigint
  }) => Promise<`0x${string}`>
  sendTransaction: (transactionData: {
    to: Address
    data?: `0x${string}`
    value?: bigint
    gas?: bigint
    gasPrice?: bigint
  }) => Promise<`0x${string}`>
}

/**
 * Custom hook for Divvi referral tracking integration
 */
export function useDivvi(): UseDivviReturn {
  const { address } = useAccount()
  
  // Enhanced writeContract function that ensures user address is available
  const writeContract = useCallback(async (
    contractData: Parameters<typeof writeContractWithReferral>[1]
  ) => {
    if (!address) {
      throw new Error('User address not available. Please connect your wallet.')
    }
    
    return writeContractWithReferral(address, contractData)
  }, [address])

  // Enhanced sendTransaction function that ensures user address is available
  const sendTransaction = useCallback(async (
    transactionData: Parameters<typeof sendTransactionWithReferral>[1]
  ) => {
    if (!address) {
      throw new Error('User address not available. Please connect your wallet.')
    }
    
    return sendTransactionWithReferral(address, transactionData)
  }, [address])

  return {
    isAvailable: isDivviAvailable(),
    consumerAddress: DIVVI_CONSUMER_ADDRESS,
    writeContract,
    sendTransaction,
  }
}

/**
 * Hook for checking Divvi availability and user connection status
 */
export function useDivviStatus() {
  const { address, isConnected } = useAccount()
  const isAvailable = isDivviAvailable()
  
  return {
    isDivviAvailable: isAvailable,
    isWalletConnected: isConnected,
    userAddress: address,
    canTrackReferrals: isAvailable && isConnected && !!address,
  }
}
