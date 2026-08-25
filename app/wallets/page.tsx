interface WalletEntry {
  name: string;
  bestFor: string;
  mobile: boolean;
  browser: boolean;
  installUrl: string;
  badge?: string;
}

const WALLETS: WalletEntry[] = [
  {
    name: 'Freighter',
    bestFor: 'Desktop power users',
    mobile: false,
    browser: true,
    installUrl: 'https://www.freighter.app/',
    badge: 'Best for DApps',
  },
  {
    name: 'xBull',
    bestFor: 'Mobile + desktop',
    mobile: true,
    browser: true,
    installUrl: 'https://xbull.app/',
  },
  {
    name: 'Lobstr',
    bestFor: 'Beginners',
    mobile: true,
    browser: true,
    installUrl: 'https://lobstr.co/',
    badge: 'Recommended for beginners',
  },
  {
    name: 'Hana',
    bestFor: 'Soroban DApps',
    mobile: false,
    browser: true,
    installUrl: 'https://www.hanawallet.io/',
  },
  {
    name: 'Rabet',
    bestFor: 'Privacy-focused',
    mobile: false,
    browser: true,
    installUrl: 'https://rabet.io/',
  },
  {
    name: 'Albedo',
    bestFor: 'No install, sign in from any browser',
    mobile: true,
    browser: true,
    installUrl: 'https://albedo.link/',
  },
];

export default function WalletsPage() {
  return (
    <section className="section">
      <span className="tag">Wallets</span>
      <h2>Supported Stellar wallets</h2>
      <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
        New to crypto? Here&apos;s every wallet LinguaLayer supports, and which one to pick.
      </p>

      <div className="wallets-table-wrap">
        <table className="wallets-table">
          <thead>
            <tr>
              <th>Wallet</th>
              <th>Best for</th>
              <th>Mobile</th>
              <th>Browser</th>
              <th>Get started</th>
            </tr>
          </thead>
          <tbody>
            {WALLETS.map((w) => (
              <tr key={w.name}>
                <td>
                  {w.name}
                  {w.badge && <span className="wallet-list-badge">{w.badge}</span>}
                </td>
                <td>{w.bestFor}</td>
                <td>{w.mobile ? '✅' : '❌'}</td>
                <td>{w.browser ? '✅' : '❌'}</td>
                <td>
                  <a href={w.installUrl} target="_blank" rel="noreferrer">
                    Install ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 24, color: 'var(--muted)' }}>
        Need help? See the{' '}
        <a href="https://stellar.org/learn/wallets" target="_blank" rel="noreferrer">
          Stellar.org wallet guide ↗
        </a>
        .
      </p>
    </section>
  );
}
