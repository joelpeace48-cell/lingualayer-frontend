/**
 * LinguaLayer — Stellar Wallets Kit Integration
 *
 * Uses @creit.tech/stellar-wallets-kit — a maintained multi-wallet library for
 * Stellar that unifies wallets behind one interface via its static
 * `StellarWalletsKit` class.
 *
 * `defaultModules()` cover wallets that work without extra configuration
 * (Freighter, xBull, Lobstr, Hana, Rabet, Albedo, ...). WalletConnect is added
 * on top when NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set (free at
 * https://cloud.reown.com) — its own QR-code-with-copy-link UI is provided by
 * @reown/appkit, the underlying SDK, rather than reimplemented here.
 * Hardware wallets (Ledger) need a Buffer polyfill and are added by #21.
 * (Freighter, xBull, Lobstr, Hana, Rabet, Albedo, ...). Ledger is added on
 * top via WebUSB — the SDK's own isAvailable() check already hides it from
 * the picker on browsers without WebUSB support (Firefox, Safari), so no
 * extra feature-detection is needed here. WalletConnect needs its own extra
 * setup (a project id) and is added by #20.
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

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
/**
 * The Ledger module (via @ledgerhq/hw-transport-webusb) assumes a Node-style
 * global `Buffer`, which browsers don't have. Polyfilled lazily, right before
 * the module is constructed, rather than globally in next.config.ts, so
 * pages that never touch the wallet kit don't pay for it.
 */
async function ensureBufferPolyfill(): Promise<void> {
  if (typeof window === "undefined" || (window as typeof window & { Buffer?: unknown }).Buffer) return;
  const { Buffer } = await import("buffer");
  (window as typeof window & { Buffer: typeof Buffer }).Buffer = Buffer;
}

async function getKit() {
  if (!kitPromise) {
    kitPromise = (async () => {
      const [{ StellarWalletsKit, Networks }, { defaultModules }] = await Promise.all([
        import("@creit.tech/stellar-wallets-kit"),
        import("@creit.tech/stellar-wallets-kit/modules/utils"),
      ]);
      const network = NETWORK_ENV === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
      const modules = defaultModules();

      if (WALLETCONNECT_PROJECT_ID) {
        const { WalletConnectModule, WalletConnectTargetChain } = await import(
          "@creit.tech/stellar-wallets-kit/modules/wallet-connect"
        );
        modules.push(
          new WalletConnectModule({
            projectId: WALLETCONNECT_PROJECT_ID,
            metadata: {
              name: "LinguaLayer",
              description: "Rights, licensing, and royalties for African language AI.",
              url: typeof window !== "undefined" ? window.location.origin : "https://lingualayer.app",
              icons: ["/icon.svg"],
            },
            allowedChains: [
              NETWORK_ENV === "mainnet" ? WalletConnectTargetChain.PUBLIC : WalletConnectTargetChain.TESTNET,
            ],
          }),
        );
      }

      StellarWalletsKit.init({ modules, network });
      await ensureBufferPolyfill();
      const { LedgerModule } = await import("@creit.tech/stellar-wallets-kit/modules/ledger");

      StellarWalletsKit.init({
        modules: [...defaultModules(), new LedgerModule()],
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
