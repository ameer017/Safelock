import React, { useState, useEffect } from 'react';
import { WalletSettings } from '@/types';

export const Options: React.FC = () => {
  const [settings, setSettings] = useState<WalletSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['settings'], result => {
      setSettings(
        result['settings'] || {
          autoLockTimeout: 300000,
          defaultGasPrice: '5000000000',
          defaultGasLimit: '21000',
          theme: 'system',
          language: 'en',
          developerMode: false,
        }
      );
      setLoading(false);
    });
  }, []);

  const updateSetting = (key: keyof WalletSettings, value: any) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    chrome.storage.local.set({ settings: newSettings });
  };

  if (loading) {
    return (
      <div className='loading'>
        <div className='spinner'></div>
        Loading settings...
      </div>
    );
  }

  if (!settings) {
    return <div>Failed to load settings</div>;
  }

  return (
    <div className='options'>
      <header className='header'>
        <h1>Cartridge Settings</h1>
        <p>Configure your wallet preferences</p>
      </header>

      <main className='main'>
        <section className='section'>
          <h2>Security</h2>

          <div className='setting'>
            <label htmlFor='autoLockTimeout'>Auto-lock timeout (minutes)</label>
            <select
              id='autoLockTimeout'
              value={settings.autoLockTimeout / 60000}
              onChange={e =>
                updateSetting(
                  'autoLockTimeout',
                  parseInt(e.target.value) * 60000
                )
              }
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
        </section>

        <section className='section'>
          <h2>Transaction Settings</h2>

          <div className='setting'>
            <label htmlFor='defaultGasPrice'>Default gas price (gwei)</label>
            <input
              id='defaultGasPrice'
              type='number'
              value={parseInt(settings.defaultGasPrice) / 1000000000}
              onChange={e =>
                updateSetting(
                  'defaultGasPrice',
                  (parseInt(e.target.value) * 1000000000).toString()
                )
              }
              min='1'
              max='100'
            />
          </div>

          <div className='setting'>
            <label htmlFor='defaultGasLimit'>Default gas limit</label>
            <input
              id='defaultGasLimit'
              type='number'
              value={settings.defaultGasLimit}
              onChange={e => updateSetting('defaultGasLimit', e.target.value)}
              min='21000'
              max='1000000'
            />
          </div>
        </section>

        <section className='section'>
          <h2>Appearance</h2>

          <div className='setting'>
            <label htmlFor='theme'>Theme</label>
            <select
              id='theme'
              value={settings.theme}
              onChange={e => updateSetting('theme', e.target.value)}
            >
              <option value='light'>Light</option>
              <option value='dark'>Dark</option>
              <option value='system'>System</option>
            </select>
          </div>

          <div className='setting'>
            <label htmlFor='language'>Language</label>
            <select
              id='language'
              value={settings.language}
              onChange={e => updateSetting('language', e.target.value)}
            >
              <option value='en'>English</option>
              <option value='es'>Español</option>
              <option value='fr'>Français</option>
              <option value='de'>Deutsch</option>
            </select>
          </div>
        </section>

        <section className='section'>
          <h2>Developer Options</h2>

          <div className='setting'>
            <label htmlFor='developerMode'>
              <input
                id='developerMode'
                type='checkbox'
                checked={settings.developerMode}
                onChange={e => updateSetting('developerMode', e.target.checked)}
              />
              Enable developer mode
            </label>
            <p className='help-text'>
              Shows additional debugging information and developer tools
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
