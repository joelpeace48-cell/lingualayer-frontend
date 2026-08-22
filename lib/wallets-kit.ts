/**
 * LinguaLayer — Stellar Wallets Kit Integration
 *
 * Uses @creit.tech/stellar-wallets-kit — a maintained multi-wallet library for
 * Stellar that unifies wallets behind one interface via its static
 * `StellarWalletsKit` class.
 *
 * Only `defaultModules()` are wired in here: wallets that work without extra
 * configuration or polyfills (Freighter, xBull, Lobstr, Hana, Rabet, Albedo,
 * ...). WalletConnect and hardware wallets (Ledger) each need their own extra
 * setup (a project id, a Buffer polyfill) and are added by their own issues.
 *
 * The SDK is loaded via a dynamic `import()` inside `getKit()` rather than a
 * static top-level import: one of its internal state modules reads
 * `globalThis.localStorage` at module-evaluation time, which doesn't exist in
 * Next.js's Node.js prerender/SSR pass and crashes `next build`. Deferring the
 * import means it's only ever evaluated client-side, from a user-triggered
 * callback or a post-mount effect.
 */
const NETWORK_ENV =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";

let kitPromise: Promise<typeof import("@creit.tech/stellar-wallets-kit").StellarWalletsKit> | null = null;

async function getKit() {
  if (!kitPromise) {
    kitPromise = (async () => {
      const [{ StellarWalletsKit, Networks }, { defaultModules }] = await Promise.all([
        import("@creit.tech/stellar-wallets-kit"),
        import("@creit.tech/stellar-wallets-kit/modules/utils"),
      ]);
      StellarWalletsKit.init({
        modules: defaultModules(),
        network: NETWORK_ENV === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
      });
      return StellarWalletsKit;
    })();
  }
  return kitPromise;
}

async function networkPassphrase(): Promise<string> {
  const { Networks } = await import("@creit.tech/stellar-wallets-kit");
  return NETWORK_ENV === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  isAvailable: boolean;
}

export async function detectWallets(): Promise<WalletInfo[]> {
  const kit = await getKit();
  const supported = await kit.refreshSupportedWallets();
  return supported.map((w) => ({ id: w.id, name: w.name, icon: w.icon, isAvailable: w.isAvailable }));
}

/**
 * Opens the kit's built-in wallet picker modal. Resolves once the user has
 * picked a wallet and granted access, with that wallet set as the kit's
 * active module for subsequent `signTransaction` calls.
 */
export async function openWalletModal(): Promise<{ address: string; walletId: string }> {
  const kit = await getKit();
  const { address } = await kit.authModal();
  return { address, walletId: kit.selectedModule.productId };
}

export async function signTransaction(xdr: string, address: string): Promise<string> {
  const kit = await getKit();
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    address,
    networkPassphrase: await networkPassphrase(),
  });
  return signedTxXdr;
}

export async function disconnectWallet(): Promise<void> {
  const kit = await getKit();
  await kit.disconnect();
}
