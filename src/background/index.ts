import { WalletState, NetworkType } from '@/types';
import { DEFAULT_NETWORK } from '@/constants/networks';

// Initialize wallet state
const initialState: WalletState = {
  accounts: [],
  activeAccount: null,
  isUnlocked: false,
  network: DEFAULT_NETWORK as NetworkType,
  isInitialized: false,
};

// Service worker initialization
chrome.runtime.onInstalled.addListener(details => {
  console.log('Cartridge wallet extension installed:', details.reason);

  // Initialize storage with default values
  chrome.storage.local.set({
    walletState: initialState,
    settings: {
      autoLockTimeout: 300000, // 5 minutes
      defaultGasPrice: '5000000000',
      defaultGasLimit: '21000',
      theme: 'system',
      language: 'en',
      developerMode: false,
    },
  });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Cartridge wallet extension started');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Background received message:', message);

  // Handle different message types
  switch (message.type) {
    case 'GET_WALLET_STATE':
      chrome.storage.local.get(['walletState'], result => {
        sendResponse({ walletState: result['walletState'] || initialState });
      });
      return true; // Keep message channel open for async response

    case 'UPDATE_WALLET_STATE':
      chrome.storage.local.set({ walletState: message.payload }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'UNLOCK_WALLET':
      // TODO: Implement wallet unlocking logic
      chrome.storage.local.get(['walletState'], result => {
        const updatedState = {
          ...result['walletState'],
          isUnlocked: true,
        };
        chrome.storage.local.set({ walletState: updatedState }, () => {
          sendResponse({ success: true, walletState: updatedState });
        });
      });
      return true;

    case 'LOCK_WALLET':
      chrome.storage.local.get(['walletState'], result => {
        const updatedState = {
          ...result['walletState'],
          isUnlocked: false,
        };
        chrome.storage.local.set({ walletState: updatedState }, () => {
          sendResponse({ success: true, walletState: updatedState });
        });
      });
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
      return false;
  }
});

// Handle tab updates for content script injection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject content script if needed
    chrome.scripting
      .executeScript({
        target: { tabId },
        files: ['content.js'],
      })
      .catch(() => {
        // Ignore errors for restricted pages
      });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(_tab => {
  // Open popup (handled by manifest)
  console.log('Extension icon clicked');
});

console.log('Cartridge background service worker loaded');
