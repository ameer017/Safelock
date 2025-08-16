// Network types
export type NetworkType = 'mainnet' | 'testnet' | 'baklava';

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  currencySymbol: string;
  blockExplorer: string;
}

export interface Networks {
  mainnet: NetworkConfig;
  testnet: NetworkConfig;
  baklava: NetworkConfig;
}

// Account types
export interface Account {
  address: string;
  name?: string;
  isImported: boolean;
  createdAt: number;
  lastUsed: number;
}

export interface WalletState {
  accounts: Account[];
  activeAccount: string | null;
  isUnlocked: boolean;
  network: NetworkType;
  isInitialized: boolean;
}

// Transaction types
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number;
  data?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  blockNumber?: number;
}

export interface TransactionRequest {
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

// Token types
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  usdValue?: string;
}

// Extension API types
export interface ExtensionAPI {
  request: (method: string, params?: any[]) => Promise<any>;
  on: (event: string, callback: (data: any) => void) => void;
  removeListener: (event: string, callback: (data: any) => void) => void;
}

// Error types
export interface WalletError {
  code: string;
  message: string;
  details?: any;
}

// Settings types
export interface WalletSettings {
  autoLockTimeout: number;
  defaultGasPrice: string;
  defaultGasLimit: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  developerMode: boolean;
}

// Developer tools types
export interface DebugInfo {
  version: string;
  network: NetworkType;
  accounts: number;
  transactions: number;
  memoryUsage: number;
  uptime: number;
}

// Content script types
export interface ContentScriptMessage {
  type: string;
  payload: any;
  id: string;
}

export interface ContentScriptResponse {
  id: string;
  result?: any;
  error?: WalletError;
}
