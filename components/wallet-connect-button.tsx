'use client';
import { useWallet } from '@/contexts/WalletContext';

function truncate(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const { connection, isConnecting, error, connect, disconnect } = useWallet();

  return (
    <div className="wallet-connect">
      {connection ? (
        <button
          type="button"
          className="wallet-btn wallet-btn--connected"
          onClick={disconnect}
          title={`${connection.address} — click to disconnect`}
        >
          {truncate(connection.address)}
        </button>
      ) : (
        <button type="button" className="wallet-btn" onClick={() => void connect()} disabled={isConnecting}>
          {isConnecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
      )}
      {error && (
        <span className="wallet-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
