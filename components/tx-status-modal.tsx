"use client";

import { useEffect, useRef, useState } from "react";
import {
  currentNetwork,
  defaultHorizonUrl,
  explorerUrl,
  pollTransactionStatus,
  type TxStatusResult,
} from "@/lib/tx-status";

interface TxStatusModalProps {
  /** The submitted transaction's hash. */
  hash: string;
  /** Called when the user dismisses the modal (only available once settled). */
  onClose: () => void;
}

const STATUS_COPY: Record<TxStatusResult["status"], string> = {
  submitting: "Broadcasting to Stellar network…",
  pending: "Transaction received, waiting for confirmation…",
  confirmed: "Confirmed",
  failed: "Failed",
};

/**
 * Transaction status tracker (issue #8): submitting → in mempool →
 * confirmed/failed, polling Horizon every 2s up to a 60s timeout. Closeable
 * only once settled (confirmed or failed) — there's nothing useful to do
 * by dismissing mid-flight, and closing early would just abandon the poll.
 */
export function TxStatusModal({ hash, onClose }: TxStatusModalProps) {
  const [result, setResult] = useState<TxStatusResult>({ status: "submitting", hash });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void pollTransactionStatus(hash, defaultHorizonUrl(), setResult);
  }, [hash]);

  const settled = result.status === "confirmed" || result.status === "failed";

  return (
    <div className="tx-status-overlay" role="alertdialog" aria-modal="true" aria-labelledby="tx-status-title">
      <div className="tx-status-modal">
        <h2 id="tx-status-title" className={`tx-status-title tx-status-title-${result.status}`}>
          {result.status === "confirmed" && "✅ "}
          {result.status === "failed" && "❌ "}
          {STATUS_COPY[result.status]}
        </h2>

        {result.status === "confirmed" && result.ledger !== undefined && (
          <p>Confirmed in ledger #{result.ledger}</p>
        )}

        {result.status === "failed" && result.errorMessage && (
          <p className="tx-status-error">{result.errorMessage}</p>
        )}

        {(result.status === "submitting" || result.status === "pending") && (
          <div className="tx-status-spinner" role="status" aria-live="polite">
            <span className="sr-only">Waiting for confirmation…</span>
          </div>
        )}

        <a
          href={explorerUrl(hash, currentNetwork())}
          target="_blank"
          rel="noreferrer"
          className="tx-status-hash-link"
        >
          View on stellar.expert
        </a>

        <button type="button" className="cta-secondary" onClick={onClose} disabled={!settled}>
          Close
        </button>
      </div>
    </div>
  );
}
