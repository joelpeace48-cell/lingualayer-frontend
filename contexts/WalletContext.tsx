'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { openWalletModal, disconnectWallet } from '@/lib/wallets-kit';
import { sep010Auth, storeToken, loadToken, clearToken } from '@/lib/sep010';

interface WalletConnection {
  address: string;
  walletId: string;
}

interface WalletContextType {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore a still-valid SEP-0010 session after a page refresh. Runs after
  // mount (not as a lazy useState initializer) so the client's first render
  // matches the server's, avoiding a hydration mismatch.
  useEffect(() => {
    const existing = loadToken();
    if (existing) setConnection({ address: existing.address, walletId: '' });
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { address, walletId } = await openWalletModal();
      const token = await sep010Auth(address);
      storeToken(token);
      setConnection({ address, walletId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    clearToken();
    setConnection(null);
    void disconnectWallet();
  }, []);

  return (
    <WalletContext.Provider value={{ connection, isConnecting, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
};
