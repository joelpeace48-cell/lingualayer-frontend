"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { stellarNetworkConfig } from "@/lib/stellar-network";

/**
 * Blocking modal shown when the connected wallet's network doesn't match
 * this deployment's configured network (issue #7).
 *
 * `WalletContext`'s connection doesn't carry a network field (the kit's
 * `authModal()`/SEP-0010 flow only returns an address), so this checks
 * Freighter directly via `getNetwork()` once a wallet is connected — the
 * multi-wallet kit itself has no wallet-agnostic "what network is the
 * active wallet on" query. Renders nothing for a non-Freighter wallet or
 * while the check is in flight; a false negative here just means no
 * blocking modal, never a wrong one.
 */
export function NetworkMismatchModal() {
  const { connection } = useWallet();
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) {
      setWalletNetwork(null);
      return;
    }
    let cancelled = false;
    void import("@stellar/freighter-api")
      .then((freighter) => freighter.getNetwork())
      .then((result) => {
        if (!cancelled && !result.error) setWalletNetwork(result.network);
      })
      .catch(() => {
        /* Not Freighter, or the extension declined — no mismatch check possible. */
      });
    return () => {
      cancelled = true;
    };
  }, [connection]);

  if (!connection || !walletNetwork) return null;

  const walletIsTestnet = walletNetwork === "TESTNET";
  const configuredIsTestnet = stellarNetworkConfig.network === "testnet";
  if (walletIsTestnet === configuredIsTestnet) return null;

  return (
    <div className="network-mismatch-overlay" role="alertdialog" aria-modal="true" aria-labelledby="network-mismatch-title">
      <div className="network-mismatch-modal">
        <h2 id="network-mismatch-title">Wrong network</h2>
        <p>
          Your wallet is connected to <strong>{walletIsTestnet ? "testnet" : "mainnet"}</strong>, but
          this app is running on <strong>{stellarNetworkConfig.network}</strong>. Switch your
          wallet&apos;s network to continue.
        </p>
      </div>
    </div>
  );
}
