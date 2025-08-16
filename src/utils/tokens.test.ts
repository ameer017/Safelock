import {
  getTokensForNetwork,
  getTokenBySymbol,
  getNativeToken,
} from './tokens';
import { NetworkType } from '../types';

describe('Token Utilities', () => {
  describe('getTokensForNetwork', () => {
    it('should return tokens for mainnet', () => {
      const tokens = getTokensForNetwork('mainnet');
      expect(tokens).toBeDefined();
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.some(token => token.symbol === 'CELO')).toBe(true);
    });

    it('should return tokens for testnet', () => {
      const tokens = getTokensForNetwork('testnet');
      expect(tokens).toBeDefined();
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.some(token => token.symbol === 'CELO')).toBe(true);
    });

    it('should return tokens for baklava', () => {
      const tokens = getTokensForNetwork('baklava');
      expect(tokens).toBeDefined();
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.some(token => token.symbol === 'CELO')).toBe(true);
    });
  });

  describe('getTokenBySymbol', () => {
    it('should find CELO token on mainnet', () => {
      const token = getTokenBySymbol('mainnet', 'CELO');
      expect(token).toBeDefined();
      expect(token?.symbol).toBe('CELO');
      expect(token?.name).toBe('Celo');
    });

    it('should return undefined for non-existent token', () => {
      const token = getTokenBySymbol('mainnet', 'NONEXISTENT');
      expect(token).toBeUndefined();
    });
  });

  describe('getNativeToken', () => {
    it('should return CELO token for any network', () => {
      const networks: NetworkType[] = ['mainnet', 'testnet', 'baklava'];

      networks.forEach(network => {
        const token = getNativeToken(network);
        expect(token).toBeDefined();
        expect(token?.symbol).toBe('CELO');
      });
    });
  });
});
