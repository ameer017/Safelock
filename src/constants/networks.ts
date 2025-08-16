import { Networks } from '@/types';

export const NETWORKS: Networks = {
  mainnet: {
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    chainId: 42220,
    currencySymbol: 'CELO',
    blockExplorer: 'https://explorer.celo.org',
  },
  testnet: {
    name: 'Celo Alfajores Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    chainId: 44787,
    currencySymbol: 'CELO',
    blockExplorer: 'https://alfajores-blockscout.celo-testnet.org',
  },
  baklava: {
    name: 'Celo Baklava Testnet',
    rpcUrl: 'https://baklava-forno.celo-testnet.org',
    chainId: 62320,
    currencySymbol: 'CELO',
    blockExplorer: 'https://baklava-blockscout.celo-testnet.org',
  },
};

export const DEFAULT_NETWORK = 'testnet';

export const SUPPORTED_TOKENS = {
  mainnet: [
    {
      symbol: 'CELO',
      name: 'Celo',
      address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png',
    },
    {
      symbol: 'cUSD',
      name: 'Celo Dollar',
      address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cUSD/logo.png',
    },
    {
      symbol: 'cEUR',
      name: 'Celo Euro',
      address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cEUR/logo.png',
    },
    {
      symbol: 'cREAL',
      name: 'Celo Real',
      address: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cREAL/logo.png',
    },
    {
      symbol: 'eXOF',
      name: 'eXOF',
      address: '0x73F93dcc49cB8A239e2032663e9475dd5ef29A08',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/eXOF/logo.png',
    },
    {
      symbol: 'cKES',
      name: 'Celo Kenyan Shilling',
      address: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cKES/logo.png',
    },
    {
      symbol: 'PUSO',
      name: 'PUSO',
      address: '0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/PUSO/logo.png',
    },
    {
      symbol: 'cCOP',
      name: 'Celo Colombian Peso',
      address: '0x8A567e2aE79CA692Bd748aB832081C45de4041eA',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cCOP/logo.png',
    },
    {
      symbol: 'cGHS',
      name: 'Celo Ghanaian Cedi',
      address: '0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cGHS/logo.png',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/USDT/logo.png',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/USDC/logo.png',
    },
    {
      symbol: 'USDGLO',
      name: 'USDGLO',
      address: '0x4F604735c1cF31399C6E711D5962b2B3E0225AD3',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/USDGLO/logo.png',
    },
  ],
  testnet: [
    {
      symbol: 'CELO',
      name: 'Celo',
      address: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png',
    },
    {
      symbol: 'cUSD',
      name: 'Celo Dollar',
      address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cUSD/logo.png',
    },
    {
      symbol: 'cEUR',
      name: 'Celo Euro',
      address: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cEUR/logo.png',
    },
    {
      symbol: 'cREAL',
      name: 'Celo Real',
      address: '0xE4D517785D091D3c54818832dB6094bcc2744545',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cREAL/logo.png',
    },
    {
      symbol: 'eXOF',
      name: 'eXOF',
      address: '0xB0FA15e002516d0301884059c0aaC0F0C72b019D',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/eXOF/logo.png',
    },
    {
      symbol: 'cKES',
      name: 'Celo Kenyan Shilling',
      address: '0x1E0433C1769271ECcF4CFF9FDdD515eefE6CdF92',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cKES/logo.png',
    },
    {
      symbol: 'PUSO',
      name: 'PUSO',
      address: '0x5E0E3c9419C42a1B04e2525991FB1A2C467AB8bF',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/PUSO/logo.png',
    },
    {
      symbol: 'cCOP',
      name: 'Celo Colombian Peso',
      address: '0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cCOP/logo.png',
    },
    {
      symbol: 'cGHS',
      name: 'Celo Ghanaian Cedi',
      address: '0x295B66bE7714458Af45E6A6Ea142A5358A6cA375',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cGHS/logo.png',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/USDC/logo.png',
    },
  ],
  baklava: [
    {
      symbol: 'CELO',
      name: 'Celo',
      address: '0xdDc9bE57f553fe75752D61606B94CBD7e0264eF8',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/info/logo.png',
    },
    {
      symbol: 'cUSD',
      name: 'Celo Dollar',
      address: '0x62492A644A588FD904270BeD06ad52B9abfEA1aE',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cUSD/logo.png',
    },
    {
      symbol: 'cEUR',
      name: 'Celo Euro',
      address: '0xf9ecE301247aD2CE21894941830A2470f4E774ca',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/celo/assets/cEUR/logo.png',
    },
  ],
};

export const GAS_LIMITS = {
  DEFAULT: '21000',
  TOKEN_TRANSFER: '65000',
  CONTRACT_INTERACTION: '200000',
};

export const GAS_PRICES = {
  SLOW: '1000000000', // 1 gwei
  NORMAL: '5000000000', // 5 gwei
  FAST: '10000000000', // 10 gwei
};
