// Content script for Cartridge wallet extension
// This script injects into web pages to enable dApp integration

console.log('Cartridge content script loaded');

// Create a unique identifier for this content script instance
const SCRIPT_ID = 'cartridge-wallet-provider';

// Check if the provider is already injected
if (document.getElementById(SCRIPT_ID)) {
  console.log('Cartridge provider already injected');
} else {
  // Inject the wallet provider
  injectWalletProvider();
}

function injectWalletProvider() {
  // Create a script element to inject the provider
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.textContent = `
    // Cartridge Wallet Provider
    (function() {
      'use strict';
      
      if (typeof window !== 'undefined' && !window.cartridge) {
        window.cartridge = {
          isCartridge: true,
          version: '1.0.0',
          
          // Request method for dApp integration
          request: function(method, params) {
            return new Promise((resolve, reject) => {
              const id = Date.now() + Math.random();
              
              // Listen for response
              const listener = function(event) {
                if (event.source !== window) return;
                if (event.data.type !== 'CARTridge_RESPONSE') return;
                if (event.data.id !== id) return;
                
                window.removeEventListener('message', listener);
                
                if (event.data.error) {
                  reject(new Error(event.data.error.message));
                } else {
                  resolve(event.data.result);
                }
              };
              
              window.addEventListener('message', listener);
              
              // Send request to extension
              window.postMessage({
                type: 'CARTridge_REQUEST',
                id: id,
                method: method,
                params: params
              }, '*');
              
              // Timeout after 30 seconds
              setTimeout(() => {
                window.removeEventListener('message', listener);
                reject(new Error('Request timeout'));
              }, 30000);
            });
          },
          
          // Check if wallet is connected
          isConnected: function() {
            return this.request('wallet_isConnected');
          },
          
          // Request account access
          requestAccounts: function() {
            return this.request('eth_requestAccounts');
          },
          
          // Get accounts
          getAccounts: function() {
            return this.request('eth_accounts');
          },
          
          // Send transaction
          sendTransaction: function(transaction) {
            return this.request('eth_sendTransaction', [transaction]);
          },
          
          // Sign message
          signMessage: function(message, address) {
            return this.request('personal_sign', [message, address]);
          },
          
          // Get network
          getNetwork: function() {
            return this.request('net_version');
          },
          
          // Switch network
          switchNetwork: function(chainId) {
            return this.request('wallet_switchEthereumChain', [{ chainId: chainId }]);
          }
        };
        
        console.log('Cartridge wallet provider injected');
      }
    })();
  `;

  // Inject the script
  (document.head || document.documentElement).appendChild(script);

  // Listen for requests from the injected provider
  window.addEventListener('message', event => {
    if (event.source !== window) return;
    if (event.data.type !== 'CARTridge_REQUEST') return;

    // Forward request to background script
    chrome.runtime.sendMessage(
      {
        type: 'CONTENT_SCRIPT_REQUEST',
        payload: {
          id: event.data.id,
          method: event.data.method,
          params: event.data.params,
        },
      },
      response => {
        // Send response back to the page
        window.postMessage(
          {
            type: 'CARTridge_RESPONSE',
            id: event.data.id,
            result: response?.result,
            error: response?.error,
          },
          '*'
        );
      }
    );
  });

  console.log('Cartridge wallet provider setup complete');
}
