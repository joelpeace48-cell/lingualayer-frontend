const CONTRACTS = [
  { label: 'DatasetRegistry', address: process.env.NEXT_PUBLIC_DATASET_REGISTRY_CONTRACT },
  { label: 'QualityOracle', address: process.env.NEXT_PUBLIC_QUALITY_ORACLE_CONTRACT },
  { label: 'DataCommission', address: process.env.NEXT_PUBLIC_DATA_COMMISSION_CONTRACT },
] as const;

function truncate(address: string): string {
  return address.length > 12 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address;
}

/**
 * Testnet-only banner linking each deployed contract to Stellar Expert.
 * Renders nothing at all in mainnet mode.
 */
export function NetworkBanner() {
  if (process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet') return null;

  return (
    <div className="network-banner" role="status">
      <span className="network-banner-tag">⚠️ TESTNET MODE</span>
      <div className="network-banner-contracts">
        {CONTRACTS.map(({ label, address }) => (
          <span key={label} className="network-banner-contract">
            {label}:{' '}
            {address ? (
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${address}`}
                target="_blank"
                rel="noreferrer"
              >
                {truncate(address)} ↗
              </a>
            ) : (
              <em>Not deployed yet</em>
            )}
          </span>
        ))}
      </div>
  );
}

import { isTestnet } from "@/lib/stellar-network";

/**
 * Fixed, non-dismissable testnet warning (issue #7). Renders nothing on
 * mainnet. There is deliberately no close button — the acceptance
 * criterion is that this banner cannot be dismissed while on testnet.
 */
export function NetworkBanner() {
  if (!isTestnet) return null;

  return (
    <div className="network-banner" role="alert">
      ⚠️ TESTNET — Do not use real funds
    </div>
  );
}
