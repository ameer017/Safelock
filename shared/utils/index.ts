// =============================================================================
// Cross-Chain DeFi Dashboard Shared Utilities
// =============================================================================

import { ChainId, ChainConfig, Token, TokenBalance } from '../types';

// =============================================================================
// Blockchain Utilities
// =============================================================================

export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [ChainId.ETHEREUM]: {
    id: ChainId.ETHEREUM,
    name: 'Ethereum',
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/',
    wsUrl: process.env.ETHEREUM_WS_URL,
    explorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockTime: 12,
    isTestnet: false,
  },
  [ChainId.POLYGON]: {
    id: ChainId.POLYGON,
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    wsUrl: process.env.POLYGON_WS_URL,
    explorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockTime: 2,
    isTestnet: false,
  },
  [ChainId.BSC]: {
    id: ChainId.BSC,
    name: 'Binance Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
    wsUrl: process.env.BSC_WS_URL,
    explorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockTime: 3,
    isTestnet: false,
  },
  [ChainId.AVALANCHE]: {
    id: ChainId.AVALANCHE,
    name: 'Avalanche',
    rpcUrl: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
    wsUrl: process.env.AVALANCHE_WS_URL,
    explorer: 'https://snowtrace.io',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    blockTime: 2,
    isTestnet: false,
  },
  [ChainId.ARBITRUM]: {
    id: ChainId.ARBITRUM,
    name: 'Arbitrum',
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    wsUrl: process.env.ARBITRUM_WS_URL,
    explorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockTime: 1,
    isTestnet: false,
  },
  [ChainId.GOERLI]: {
    id: ChainId.GOERLI,
    name: 'Goerli',
    rpcUrl: process.env.GOERLI_RPC_URL || 'https://goerli.infura.io/v3/',
    explorer: 'https://goerli.etherscan.io',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockTime: 12,
    isTestnet: true,
  },
  [ChainId.MUMBAI]: {
    id: ChainId.MUMBAI,
    name: 'Mumbai',
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockTime: 2,
    isTestnet: true,
  },
  [ChainId.BSC_TESTNET]: {
    id: ChainId.BSC_TESTNET,
    name: 'BSC Testnet',
    rpcUrl: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    blockTime: 3,
    isTestnet: true,
  },
  [ChainId.FUJI]: {
    id: ChainId.FUJI,
    name: 'Fuji',
    rpcUrl: process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    blockTime: 2,
    isTestnet: true,
  },
  [ChainId.ARBITRUM_GOERLI]: {
    id: ChainId.ARBITRUM_GOERLI,
    name: 'Arbitrum Goerli',
    rpcUrl: process.env.ARBITRUM_GOERLI_RPC_URL || 'https://goerli-rollup.arbitrum.io/rpc',
    explorer: 'https://goerli.arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockTime: 1,
    isTestnet: true,
  },
};

export function getChainConfig(chainId: ChainId): ChainConfig {
  return CHAIN_CONFIGS[chainId];
}

export function getChainName(chainId: ChainId): string {
  return CHAIN_CONFIGS[chainId]?.name || 'Unknown Chain';
}

export function isTestnet(chainId: ChainId): boolean {
  return CHAIN_CONFIGS[chainId]?.isTestnet || false;
}

// =============================================================================
// Token Utilities
// =============================================================================

export const COMMON_TOKENS: Record<ChainId, Token[]> = {
  [ChainId.ETHEREUM]: [
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      chainId: ChainId.ETHEREUM,
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png',
      coingeckoId: 'weth',
    },
    {
      address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
      chainId: ChainId.ETHEREUM,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
      coingeckoId: 'usd-coin',
    },
  ],
  [ChainId.POLYGON]: [
    {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      chainId: ChainId.POLYGON,
      name: 'Wrapped MATIC',
      symbol: 'WMATIC',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/14073/thumb/matic.png',
      coingeckoId: 'matic-network',
    },
  ],
  [ChainId.BSC]: [
    {
      address: '0xbb4CdB9CBd36B01bD1cBaEF2AF88C6E6d7B4b5b5',
      chainId: ChainId.BSC,
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png',
      coingeckoId: 'binancecoin',
    },
  ],
  [ChainId.AVALANCHE]: [
    {
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
      chainId: ChainId.AVALANCHE,
      name: 'Wrapped AVAX',
      symbol: 'WAVAX',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/12559/thumb/avalanche-avax-logo.png',
      coingeckoId: 'avalanche-2',
    },
  ],
  [ChainId.ARBITRUM]: [
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      chainId: ChainId.ARBITRUM,
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png',
      coingeckoId: 'weth',
    },
  ],
  // Add testnet tokens as needed
  [ChainId.GOERLI]: [],
  [ChainId.MUMBAI]: [],
  [ChainId.BSC_TESTNET]: [],
  [ChainId.FUJI]: [],
  [ChainId.ARBITRUM_GOERLI]: [],
};

export function getCommonTokens(chainId: ChainId): Token[] {
  return COMMON_TOKENS[chainId] || [];
}

export function formatTokenAmount(amount: string, decimals: number): number {
  return parseFloat(amount) / Math.pow(10, decimals);
}

export function parseTokenAmount(amount: number, decimals: number): string {
  return (amount * Math.pow(10, decimals)).toString();
}

export function calculateTokenValue(balance: string, price: number, decimals: number): number {
  const amount = formatTokenAmount(balance, decimals);
  return amount * price;
}

// =============================================================================
// Number Formatting Utilities
// =============================================================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatCompactNumber(amount: number): string {
  const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return formatter.format(amount);
}

export function formatAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// =============================================================================
// Date Utilities
// =============================================================================

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

// =============================================================================
// Validation Utilities
// =============================================================================

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidChainId(chainId: number): boolean {
  return Object.values(ChainId).includes(chainId);
}

export function isValidToken(token: any): token is Token {
  return (
    token &&
    typeof token.address === 'string' &&
    isValidAddress(token.address) &&
    typeof token.chainId === 'number' &&
    isValidChainId(token.chainId) &&
    typeof token.name === 'string' &&
    typeof token.symbol === 'string' &&
    typeof token.decimals === 'number'
  );
}

// =============================================================================
// Math Utilities
// =============================================================================

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function calculateAPY(apr: number, compoundFrequency: number = 365): number {
  return Math.pow(1 + apr / compoundFrequency, compoundFrequency) - 1;
}

export function calculateTVL(positions: TokenBalance[]): number {
  return positions.reduce((total, position) => total + position.balanceUSD, 0);
}

export function calculateDiversificationScore(positions: TokenBalance[]): number {
  if (positions.length === 0) return 0;
  
  const totalValue = calculateTVL(positions);
  if (totalValue === 0) return 0;
  
  const weights = positions.map(pos => pos.balanceUSD / totalValue);
  const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
  
  // Convert HHI to diversification score (0-100)
  return Math.max(0, 100 - (hhi * 100));
}

// =============================================================================
// Error Handling Utilities
// =============================================================================

export function handleError(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
}

export function isNetworkError(error: any): boolean {
  return error?.code === 'NETWORK_ERROR' || error?.message?.includes('network');
}

export function isUserRejectedError(error: any): boolean {
  return error?.code === 4001 || error?.message?.includes('user rejected');
}

// =============================================================================
// Storage Utilities
// =============================================================================

export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue || null;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

// =============================================================================
// URL Utilities
// =============================================================================

export function getExplorerUrl(chainId: ChainId, address: string, type: 'address' | 'tx' = 'address'): string {
  const config = getChainConfig(chainId);
  return `${config.explorer}/${type}/${address}`;
}

export function getTokenLogoUrl(symbol: string): string {
  return `https://assets.coingecko.com/coins/images/1/thumb/${symbol.toLowerCase()}.png`;
}

// =============================================================================
// Color Utilities
// =============================================================================

export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
}

export function getRiskLevelColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'high': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

// =============================================================================
// Constants
// =============================================================================

export const GAS_LIMITS = {
  TRANSFER: 21000,
  SWAP: 200000,
  APPROVE: 46000,
  DEPOSIT: 150000,
  WITHDRAW: 100000,
} as const;

export const REFRESH_INTERVALS = {
  PRICES: 30000, // 30 seconds
  PORTFOLIO: 60000, // 1 minute
  ARBITRAGE: 15000, // 15 seconds
  YIELD: 300000, // 5 minutes
} as const;

export const MIN_PROFIT_THRESHOLD = 0.5; // 0.5%
export const MAX_SLIPPAGE = 3; // 3%
export const DEFAULT_GAS_PRICE = 20000000000; // 20 gwei
