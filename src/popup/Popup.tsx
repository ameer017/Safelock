import React, { useState, useEffect } from 'react';
import { WalletState } from '@/types';

export const Popup: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load wallet state from background script
    chrome.runtime.sendMessage({ type: 'GET_WALLET_STATE' }, response => {
      if (chrome.runtime.lastError) {
        setError('Failed to connect to wallet');
        setLoading(false);
        return;
      }

      setWalletState(response.walletState);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className='loading'>
        <div className='spinner'></div>
        Loading Cartridge...
      </div>
    );
  }

  if (error) {
    return (
      <div className='error'>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!walletState) {
    return (
      <div className='error'>
        <h2>Wallet Not Found</h2>
        <p>Unable to load wallet state</p>
      </div>
    );
  }

  return (
    <div className='popup'>
      <header className='header'>
        <h1>Cartridge</h1>
        <div className='network-badge'>{walletState.network}</div>
      </header>

      <main className='main'>
        {walletState.isUnlocked ? (
          <div className='wallet-content'>
            <div className='account-info'>
              <h3>Active Account</h3>
              {walletState.activeAccount ? (
                <p className='address'>{walletState.activeAccount}</p>
              ) : (
                <p className='no-account'>No account selected</p>
              )}
            </div>

            <div className='actions'>
              <button className='btn btn-primary'>Send</button>
              <button className='btn btn-secondary'>Receive</button>
              <button className='btn btn-secondary'>Settings</button>
            </div>
          </div>
        ) : (
          <div className='unlock-screen'>
            <h2>Welcome to Cartridge</h2>
            <p>Your Celo wallet is locked</p>
            <button
              className='btn btn-primary'
              onClick={() => {
                chrome.runtime.sendMessage(
                  { type: 'UNLOCK_WALLET' },
                  response => {
                    if (response.success) {
                      setWalletState(response.walletState);
                    }
                  }
                );
              }}
            >
              Unlock Wallet
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
