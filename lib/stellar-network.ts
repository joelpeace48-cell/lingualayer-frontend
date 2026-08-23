/**
 * Stellar network environment config (issue #7).
 *
 * `NEXT_PUBLIC_*` variables are inlined into the client bundle at *build*
 * time by Next.js, so reading `process.env.NEXT_PUBLIC_STELLAR_NETWORK`
 * here — in a module every route imports transitively via
 * `app/layout.tsx`'s `<NetworkBanner>` — and throwing if it's missing is
 * what makes `npm run build` actually fail when the network isn't
 * configured, rather than silently shipping a misconfigured app.
 */

export type StellarNetwork = "testnet" | "mainnet";

function readNetwork(): StellarNetwork {
  const raw = process.env.NEXT_PUBLIC_STELLAR_NETWORK;
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_STELLAR_NETWORK is not set. Set it to \"testnet\" or \"mainnet\" " +
        "(e.g. in .env.local) before building — see .env.example.",
    );
  }
  if (raw !== "testnet" && raw !== "mainnet") {
    throw new Error(`NEXT_PUBLIC_STELLAR_NETWORK must be "testnet" or "mainnet", got "${raw}".`);
  }
  return raw;
}

export interface StellarNetworkConfig {
  network: StellarNetwork;
  networkPassphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  contractIds: {
    registry: string;
    royalties: string;
    licensing: string;
  };
}

const NETWORK = readNetwork();

const NETWORK_PASSPHRASE: Record<StellarNetwork, string> = {
  testnet: "Test SDF Network ; September 2015",
  mainnet: "Public Global Stellar Network ; September 2015",
};

const DEFAULT_RPC_URL: Record<StellarNetwork, string> = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://mainnet.sorobanrpc.com",
};

const DEFAULT_HORIZON_URL: Record<StellarNetwork, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org",
};

/**
 * Contract IDs are per-deployment (a testnet deployment and a mainnet
 * deployment are different contract instances), so they come from env
 * rather than being hardcoded — empty string if unset, so a page that
 * hasn't wired up a given contract yet fails at the call site with a clear
 * "no contract ID configured" error instead of silently pointing at the
 * wrong network's contract.
 */
export const stellarNetworkConfig: StellarNetworkConfig = {
  network: NETWORK,
  networkPassphrase: NETWORK_PASSPHRASE[NETWORK],
  rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? DEFAULT_RPC_URL[NETWORK],
  horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL ?? DEFAULT_HORIZON_URL[NETWORK],
  contractIds: {
    registry: process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID ?? "",
    royalties: process.env.NEXT_PUBLIC_ROYALTIES_CONTRACT_ID ?? "",
    licensing: process.env.NEXT_PUBLIC_LICENSING_CONTRACT_ID ?? "",
  },
};

export const isTestnet = NETWORK === "testnet";
