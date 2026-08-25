import { xdr as xdrNs } from "@stellar/stellar-sdk";

export type TxStatus = "submitting" | "pending" | "confirmed" | "failed";

export interface TxStatusResult {
  status: TxStatus;
  hash: string;
  ledger?: number;
  /** Human-readable failure reason — never raw XDR. */
  errorMessage?: string;
}

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 60_000;

const RESULT_CODE_MESSAGES: Record<string, string> = {
  txFAILED: "One or more operations in this transaction failed.",
  txTOO_EARLY: "Submitted before the transaction's valid time window opened.",
  txTOO_LATE: "Submitted after the transaction's valid time window closed.",
  txMISSING_OPERATION: "Transaction has no operations.",
  txBAD_SEQ: "Wrong sequence number for the source account.",
  txBAD_AUTH: "Invalid signature(s) for this transaction.",
  txINSUFFICIENT_BALANCE: "Source account balance is too low to cover the fee and operations.",
  txNO_ACCOUNT: "Source account does not exist on this network.",
  txINSUFFICIENT_FEE: "Network fee is too low for current network conditions.",
  txBAD_AUTH_EXTRA: "Transaction has extra, unused signatures.",
  txINTERNAL_ERROR: "Stellar network internal error.",
};

/** Decodes a Horizon `result_xdr` into a human-readable reason — never surfaces raw XDR to the user. */
function decodeFailureReason(resultXdr: string): string {
  try {
    const result = xdrNs.TransactionResult.fromXDR(resultXdr, "base64");
    const code = result.result().switch().name;
    return RESULT_CODE_MESSAGES[code] ?? `Transaction failed (code: ${code}).`;
  } catch {
    return "Transaction failed (the exact reason could not be decoded).";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface HorizonTransactionResponse {
  successful: boolean;
  ledger: number;
  result_xdr: string;
}

async function fetchHorizonTransaction(
  hash: string,
  horizonUrl: string,
): Promise<HorizonTransactionResponse | null> {
  const res = await fetch(`${horizonUrl.replace(/\/+$/, "")}/transactions/${hash}`);
  if (res.status === 404) return null; // not yet included in a ledger
  if (!res.ok) throw new Error(`Horizon responded ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Polls Horizon every 2s (up to a 60s timeout) for a submitted transaction's
 * ledger confirmation (issue #8). Calls `onUpdate` on every state
 * transition so the caller can drive a status modal without managing the
 * poll loop itself.
 */
export async function pollTransactionStatus(
  hash: string,
  horizonUrl: string,
  onUpdate: (result: TxStatusResult) => void,
): Promise<TxStatusResult> {
  onUpdate({ status: "pending", hash });

  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const tx = await fetchHorizonTransaction(hash, horizonUrl);
      if (tx) {
        const result: TxStatusResult = tx.successful
          ? { status: "confirmed", hash, ledger: tx.ledger }
          : { status: "failed", hash, errorMessage: decodeFailureReason(tx.result_xdr) };
        onUpdate(result);
        return result;
      }
    } catch {
      // Transient network/Horizon errors while polling are expected — keep
      // retrying until the timeout rather than failing on the first blip.
    }
    await sleep(POLL_INTERVAL_MS);
  }

  const timedOut: TxStatusResult = {
    status: "failed",
    hash,
    errorMessage: "Timed out waiting for ledger confirmation after 60 seconds.",
  };
  onUpdate(timedOut);
  return timedOut;
}

export function explorerUrl(hash: string, network: "testnet" | "mainnet"): string {
  return `https://stellar.expert/explorer/${network === "mainnet" ? "public" : "testnet"}/tx/${hash}`;
}

/**
 * Reads `NEXT_PUBLIC_STELLAR_NETWORK` directly rather than importing a
 * shared network-config module, so this file has no dependency beyond the
 * env var itself.
 */
export function currentNetwork(): "testnet" | "mainnet" {
  return process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
}

export function defaultHorizonUrl(): string {
  if (process.env.NEXT_PUBLIC_HORIZON_URL) return process.env.NEXT_PUBLIC_HORIZON_URL;
  return currentNetwork() === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}
