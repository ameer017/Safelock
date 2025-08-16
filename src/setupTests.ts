// Jest setup file for testing
import '@testing-library/jest-dom';

// Mock chrome API for testing
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
    onStartup: {
      addListener: jest.fn(),
    },
    lastError: null,
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn(),
    },
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
  scripting: {
    executeScript: jest.fn(),
  },
} as any;

// Mock window.postMessage for content script testing
Object.defineProperty(window, 'postMessage', {
  value: jest.fn(),
  writable: true,
});

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn(),
    subtle: {
      generateKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    },
  },
  writable: true,
});

// Mock fetch API
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
