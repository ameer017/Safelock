import {
  CUSD_TOKEN,
  USDT_TOKEN,
  CGHS_TOKEN,
  CNGN_TOKEN,
  CKES_TOKEN,
} from "./contracts";

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Truncate an address for display
 */
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Token metadata and FX helpers ---
// These are approximate FX rates used only for display.
// For production, prefer fetching live rates from a reliable API.
const TOKEN_USD_RATES: Record<string, number> = {
  [CUSD_TOKEN.address.toLowerCase()]: 1, // 1 cUSD ≈ $1
  [USDT_TOKEN.address.toLowerCase()]: 1, // 1 USDT ≈ $1
  [CGHS_TOKEN.address.toLowerCase()]: 0.087, // 1 cGHS ≈ $0.087
  [CNGN_TOKEN.address.toLowerCase()]: 0.00069, // 1 cNGN ≈ $0.00069
  [CKES_TOKEN.address.toLowerCase()]: 0.0078, // 1 cKES ≈ $0.0078
};

const TOKEN_METADATA: Record<
  string,
  {
    symbol: string;
    name: string;
  }
> = {
  [CUSD_TOKEN.address.toLowerCase()]: {
    symbol: "cUSD",
    name: "Celo Dollar",
  },
  [USDT_TOKEN.address.toLowerCase()]: {
    symbol: "USDT",
    name: "Tether USD",
  },
  [CGHS_TOKEN.address.toLowerCase()]: {
    symbol: "cGHS",
    name: "Ghana Cedi",
  },
  [CNGN_TOKEN.address.toLowerCase()]: {
    symbol: "cNGN",
    name: "Nigerian Naira",
  },
  [CKES_TOKEN.address.toLowerCase()]: {
    symbol: "cKES",
    name: "Kenyan Shilling",
  },
};

export function getTokenInfo(tokenAddress: string | undefined | null) {
  if (!tokenAddress) {
    return { symbol: "Unknown", name: "Unknown Token" };
  }

  const metadata = TOKEN_METADATA[tokenAddress.toLowerCase()];
  return metadata ?? { symbol: "Unknown", name: "Unknown Token" };
}

/**
 * Convert a token amount (in wei) into its approximate USD value.
 */
export function tokenAmountToUsd(
  amountWei: bigint | number,
  tokenAddress: string | undefined | null
): number {
  if (!tokenAddress) return 0;

  const key = tokenAddress.toLowerCase();
  const rate = TOKEN_USD_RATES[key] ?? 0;

  if (rate === 0) return 0;

  const asNumber =
    typeof amountWei === "bigint" ? Number(amountWei) : Number(amountWei);

  if (!Number.isFinite(asNumber) || asNumber <= 0) return 0;

  const amountInTokens = asNumber / 1e18;
  return amountInTokens * rate;
}

