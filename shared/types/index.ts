// =============================================================================
// Cross-Chain DeFi Dashboard Shared Types
// =============================================================================

// =============================================================================
// Blockchain Types
// =============================================================================

export enum ChainId {
  ETHEREUM = 1,
  POLYGON = 137,
  BSC = 56,
  AVALANCHE = 43114,
  ARBITRUM = 42161,
  GOERLI = 5,
  MUMBAI = 80001,
  BSC_TESTNET = 97,
  FUJI = 43113,
  ARBITRUM_GOERLI = 421613
}

export interface ChainConfig {
  id: ChainId;
  name: string;
  rpcUrl: string;
  wsUrl?: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockTime: number;
  isTestnet: boolean;
}

// =============================================================================
// Token Types
// =============================================================================

export interface Token {
  address: string;
  chainId: ChainId;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceUSD: number;
  price: number;
}

// =============================================================================
// Portfolio Types
// =============================================================================

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalValueUSD: number;
  totalValueChange24h: number;
  totalValueChangePercent24h: number;
  tokens: TokenBalance[];
  chains: ChainId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioMetrics {
  totalValueUSD: number;
  totalValueChange24h: number;
  totalValueChangePercent24h: number;
  totalValueChange7d: number;
  totalValueChangePercent7d: number;
  totalValueChange30d: number;
  totalValueChangePercent30d: number;
  bestPerformer: TokenBalance;
  worstPerformer: TokenBalance;
  diversificationScore: number;
  riskScore: number;
}

// =============================================================================
// DeFi Protocol Types
// =============================================================================

export enum ProtocolType {
  DEX = 'dex',
  LENDING = 'lending',
  YIELD_FARMING = 'yield_farming',
  STAKING = 'staking',
  LIQUIDITY_PROVIDER = 'liquidity_provider',
  DERIVATIVES = 'derivatives',
  INSURANCE = 'insurance'
}

export interface Protocol {
  id: string;
  name: string;
  type: ProtocolType;
  chainId: ChainId;
  address: string;
  website: string;
  logoURI: string;
  description: string;
  tvl: number;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  isVerified: boolean;
}

export interface Position {
  id: string;
  userId: string;
  protocol: Protocol;
  token: Token;
  amount: string;
  amountUSD: number;
  apy: number;
  rewards: Token[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

// =============================================================================
// Market Data Types
// =============================================================================

export interface MarketData {
  token: Token;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply?: number;
  ath: number;
  athDate: Date;
  atl: number;
  atlDate: Date;
  lastUpdated: Date;
}

export interface PriceHistory {
  token: Token;
  prices: Array<{
    timestamp: number;
    price: number;
  }>;
  timeframe: '1h' | '24h' | '7d' | '30d' | '1y';
}

// =============================================================================
// Arbitrage Types
// =============================================================================

export interface ArbitrageOpportunity {
  id: string;
  token: Token;
  buyChain: ChainId;
  buyProtocol: Protocol;
  buyPrice: number;
  sellChain: ChainId;
  sellProtocol: Protocol;
  sellPrice: number;
  profitPercent: number;
  profitUSD: number;
  gasCost: number;
  netProfit: number;
  estimatedTime: number;
  risk: 'low' | 'medium' | 'high';
  isExecutable: boolean;
  createdAt: Date;
}

// =============================================================================
// Yield Farming Types
// =============================================================================

export interface YieldOpportunity {
  id: string;
  protocol: Protocol;
  token: Token;
  apy: number;
  apyType: 'fixed' | 'variable';
  lockPeriod?: number;
  minStake: number;
  maxStake?: number;
  totalStaked: number;
  rewards: Token[];
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  lastUpdated: Date;
}

// =============================================================================
// Smart Contract Types
// =============================================================================

export interface ReactiveContract {
  address: string;
  chainId: ChainId;
  name: string;
  type: 'arbitrage' | 'yield_farming' | 'portfolio_manager' | 'risk_manager';
  owner: string;
  balance: string;
  balanceUSD: number;
  isActive: boolean;
  lastExecuted?: Date;
  totalExecutions: number;
  totalProfit: number;
  gasUsed: number;
  deployedAt: Date;
}

export interface ContractEvent {
  id: string;
  contractAddress: string;
  chainId: ChainId;
  eventName: string;
  eventData: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
}

// =============================================================================
// User Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isVerified: boolean;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    telegram: boolean;
  };
  alerts: {
    priceAlerts: boolean;
    portfolioAlerts: boolean;
    arbitrageAlerts: boolean;
    yieldAlerts: boolean;
  };
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// WebSocket Types
// =============================================================================

export interface WebSocketMessage {
  type: 'price_update' | 'portfolio_update' | 'arbitrage_opportunity' | 'yield_opportunity' | 'alert';
  data: any;
  timestamp: Date;
}

// =============================================================================
// Alert Types
// =============================================================================

export interface Alert {
  id: string;
  userId: string;
  type: 'price' | 'portfolio' | 'arbitrage' | 'yield' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// =============================================================================
// Analytics Types
// =============================================================================

export interface Analytics {
  totalUsers: number;
  totalPortfolios: number;
  totalValueLocked: number;
  totalTransactions: number;
  activeContracts: number;
  totalProfit: number;
  topTokens: Token[];
  topProtocols: Protocol[];
  marketTrends: Array<{
    date: Date;
    value: number;
  }>;
}

// =============================================================================
// Error Types
// =============================================================================

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  requestId?: string;
}

// =============================================================================
// Utility Types
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
