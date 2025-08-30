"use client"

import { useState, useEffect } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { celo, celoAlfajores } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { http } from 'wagmi'

// Create config with proper SSR handling
let config: any = null

function getWagmiConfig() {
  if (!config) {
    config = getDefaultConfig({
      appName: 'cartridge',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
      chains: [celo, celoAlfajores],
      transports: {
        [celo.id]: http(),
        [celoAlfajores.id]: http(),
      },
      ssr: true,
    })
  }
  return config
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show children without wallet functionality during SSR
  if (!mounted) {
    return <>{children}</>
  }

  return <WalletProviderInner>{children}</WalletProviderInner>
}
