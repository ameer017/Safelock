import { Token, NetworkType } from '@/types';
import { SUPPORTED_TOKENS } from '@/constants/networks';

/**
 * Get all supported tokens for a specific network
 */
export function getTokensForNetwork(network: NetworkType): Token[] {
  return SUPPORTED_TOKENS[network] || [];
}

/**
 * Get a specific token by symbol for a network
 */
export function getTokenBySymbol(
  network: NetworkType,
  symbol: string
): Token | undefined {
  const tokens = getTokensForNetwork(network);
  return tokens.find(
    token => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/**
 * Get a specific token by address for a network
 */
export function getTokenByAddress(
  network: NetworkType,
  address: string
): Token | undefined {
  const tokens = getTokensForNetwork(network);
  return tokens.find(
    token => token.address.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Get the native CELO token for any network
 */
export function getNativeToken(network: NetworkType): Token | undefined {
  return getTokenBySymbol(network, 'CELO');
}

/**
 * Get stablecoins for a network
 */
export function getStablecoins(network: NetworkType): Token[] {
  const tokens = getTokensForNetwork(network);
  const stablecoinSymbols = ['cUSD', 'cEUR', 'cREAL', 'USDT', 'USDC', 'USDGLO'];
  return tokens.filter(token => stablecoinSymbols.includes(token.symbol));
}

/**
 * Get local currency tokens for a network
 */
export function getLocalCurrencies(network: NetworkType): Token[] {
  const tokens = getTokensForNetwork(network);
  const localCurrencySymbols = ['cKES', 'cCOP', 'cGHS', 'eXOF', 'PUSO'];
  return tokens.filter(token => localCurrencySymbols.includes(token.symbol));
}

/**
 * Format token balance with proper decimals
 */
export function formatTokenBalance(balance: string, decimals: number): string {
  const balanceBN = BigInt(balance);
  const divisor = BigInt(10 ** decimals);
  const wholePart = balanceBN / divisor;
  const fractionalPart = balanceBN % divisor;

  if (fractionalPart === 0n) {
    return wholePart.toString();
  }

  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  // Remove trailing zeros
  const trimmedFractional = fractionalString.replace(/0+$/, '');

  return `${wholePart}.${trimmedFractional}`;
}

/**
 * Convert token amount to wei (smallest unit)
 */
export function toWei(amount: string, decimals: number): string {
  const [whole, fractional = ''] = amount.split('.');
  const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);
  return whole + paddedFractional;
}

/**
 * Convert wei to token amount
 */
export function fromWei(wei: string, decimals: number): string {
  if (wei.length <= decimals) {
    return `0.${wei.padStart(decimals, '0')}`;
  }

  const whole = wei.slice(0, -decimals);
  const fractional = wei.slice(-decimals);

  return `${whole}.${fractional}`;
}

/**
 * Validate if an address is a valid token contract
 */
export function isValidTokenAddress(
  network: NetworkType,
  address: string
): boolean {
  const token = getTokenByAddress(network, address);
  return token !== undefined;
}

/**
 * Get token logo URL
 */
export function getTokenLogo(
  network: NetworkType,
  symbol: string
): string | undefined {
  const token = getTokenBySymbol(network, symbol);
  return token?.logoURI;
}

/**
 * Get all unique token symbols across all networks
 */
export function getAllTokenSymbols(): string[] {
  const symbols = new Set<string>();

  Object.values(SUPPORTED_TOKENS).forEach(tokens => {
    tokens.forEach(token => {
      symbols.add(token.symbol);
    });
  });

  return Array.from(symbols).sort();
}
