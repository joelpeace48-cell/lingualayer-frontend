/**
 * SEP-0010 Web Authentication — Official Stellar Auth Standard
 *
 * SEP-0010 is the Stellar Ecosystem Proposal for web authentication.
 * It is supported by all major Stellar wallets and exchanges.
 *
 * Flow:
 *   1. GET  /api/v1/auth/challenge?address={pubkey}
 *         → server returns signed challenge XDR (Stellar transaction)
 *   2. Wallet signs the challenge transaction
 *   3. POST /api/v1/auth/token  { xdr: signedXdr }
 *         → server verifies signature → returns JWT
 */

import { signTransaction } from "./wallets-kit";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export interface SEP010Token {
  token: string;       // JWT
  expiresAt: number;   // Unix timestamp
  address: string;
}

/**
 * Full SEP-0010 authentication flow.
 * Fetches challenge, signs with connected wallet, exchanges for JWT.
 */
export async function sep010Auth(address: string): Promise<SEP010Token> {
  // Step 1: fetch challenge
  const challengeRes = await fetch(
    `${API}/auth/challenge?address=${encodeURIComponent(address)}`
  );
  if (!challengeRes.ok) {
    throw new Error(`Challenge fetch failed: ${challengeRes.statusText}`);
  }
  const { transaction: challengeXdr } = await challengeRes.json();

  // Step 2: sign with the wallet already selected via openWalletModal()
  const signedTxXdr = await signTransaction(challengeXdr, address);

  // Step 3: exchange for JWT
  const tokenRes = await fetch(`${API}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: signedTxXdr }),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(err?.message ?? "SEP-0010 token exchange failed");
  }
  return tokenRes.json();
}

/** Persist JWT in sessionStorage (survives page refresh within tab). */
export function storeToken(token: SEP010Token): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("ll_jwt", JSON.stringify(token));
}

export function loadToken(): SEP010Token | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("ll_jwt");
    if (!raw) return null;
    const t: SEP010Token = JSON.parse(raw);
    if (Date.now() / 1000 > t.expiresAt) {
      sessionStorage.removeItem("ll_jwt");
      return null;
    }
    return t;
  } catch {
    return null;
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") sessionStorage.removeItem("ll_jwt");
}
