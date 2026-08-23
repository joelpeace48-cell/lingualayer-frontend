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
