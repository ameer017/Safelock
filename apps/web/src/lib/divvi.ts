import { getReferralTag, submitReferral } from '@divvi/referral-sdk'
import { createWalletClient, custom, type Address, type Hash } from 'viem'
import { celo, celoAlfajores } from 'wagmi/chains'

// Divvi consumer address for SafeLock
export const DIVVI_CONSUMER_ADDRESS = '0xCf7D46393309a9e46B0a3AC3f6fB8A3cA3B5C029' as const

// Create wallet client for Divvi integration
export const createDivviWalletClient = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found')
  }

  // Create a temporary client to get the current chain ID
  const tempClient = createWalletClient({
    chain: celoAlfajores, // Default to Alfajores for initial setup
    transport: custom(window.ethereum),
  })

  // Get the current chain ID from the provider
  const chainId = await tempClient.getChainId()
  
  // Determine the correct chain based on the current chain ID
  const chain = chainId === celo.id ? celo : celoAlfajores

  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  })
}

// Generate referral tag for a user
export const generateReferralTag = (userAddress: Address) => {
  return getReferralTag({
    user: userAddress,
    consumer: DIVVI_CONSUMER_ADDRESS,
  })
}

// Submit referral to Divvi
export const reportReferralToDivvi = async (txHash: Hash, chainId: number) => {
  try {
    await submitReferral({
      txHash,
      chainId,
    })
    console.log('Referral successfully submitted to Divvi:', txHash)
  } catch (error) {
    console.error('Failed to submit referral to Divvi:', error)
    // Don't throw error to avoid breaking the main transaction flow
  }
}

// Enhanced transaction function that includes Divvi referral tracking
export const sendTransactionWithReferral = async (
  userAddress: Address,
  transactionData: {
    to: Address
    data?: `0x${string}`
    value?: bigint
    gas?: bigint
    gasPrice?: bigint
  }
) => {
  const walletClient = await createDivviWalletClient()
  
  // Generate referral tag
  const referralTag = generateReferralTag(userAddress)
  
  // Append referral tag to transaction data
  const enhancedData: `0x${string}` = transactionData.data 
    ? (`${transactionData.data}${referralTag.slice(2)}` as `0x${string}`)
    : (referralTag as `0x${string}`)

  // Send transaction with referral tag
  const txHash = await walletClient.sendTransaction({
    account: userAddress,
    to: transactionData.to,
    data: enhancedData,
    value: transactionData.value || 0n,
    gas: transactionData.gas,
    gasPrice: transactionData.gasPrice,
  })

  // Get chain ID and report to Divvi
  const chainId = await walletClient.getChainId()
  await reportReferralToDivvi(txHash, chainId)

  return txHash
}

// Enhanced contract interaction function with Divvi referral tracking
export const writeContractWithReferral = async (
  userAddress: Address,
  contractData: {
    address: Address
    abi: any
    functionName: string
    args: any[]
    value?: bigint
    gas?: bigint
    gasPrice?: bigint
  }
) => {
  const walletClient = await createDivviWalletClient()
  
  // Generate referral tag
  const referralTag = generateReferralTag(userAddress)
  
  // Write contract with referral tag appended to data
  const txHash = await walletClient.writeContract({
    account: userAddress,
    address: contractData.address,
    abi: contractData.abi,
    functionName: contractData.functionName,
    args: contractData.args,
    value: contractData.value,
    gas: contractData.gas,
    gasPrice: contractData.gasPrice,
    dataSuffix: referralTag as `0x${string}`, 
  })

  // Get chain ID and report to Divvi
  const chainId = await walletClient.getChainId()
  await reportReferralToDivvi(txHash, chainId)

  return txHash
}

// Utility to check if Divvi is available
export const isDivviAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum
}

// Types for better TypeScript support
export interface DivviTransactionParams {
  userAddress: Address
  to: Address
  data?: `0x${string}`
  value?: bigint
  gas?: bigint
  gasPrice?: bigint
}

export interface DivviContractParams {
  userAddress: Address
  address: Address
  abi: any
  functionName: string
  args: any[]
  value?: bigint
  gas?: bigint
  gasPrice?: bigint
}
