'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { EmptyState } from '@/components/empty-state';
import { BountiesIllustration } from '@/components/illustrations';

interface Commission {
  id: string;
  language_code: string;
  language_name: string;
  description_ipfs: string;
  bounty_usdc: number;
  min_sample_count: number;
  min_duration_hours: number;
  deadline_ledger: number;
  state: 'open' | 'fulfilled' | 'cancelled';
  commissioner_truncated: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

const LANGUAGE_NAMES: Record<string, string> = {
  yor: 'Yoruba', hau: 'Hausa', ibo: 'Igbo', zul: 'Zulu',
  swa: 'Swahili', amh: 'Amharic', som: 'Somali', orm: 'Oromo',
  ful: 'Fula', lin: 'Lingala', wol: 'Wolof', sot: 'Sotho',
  tir: 'Tigrinya', aka: 'Akan', ven: 'Venda',
};

export default function BountyBoardPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const { connection } = useWallet();

  useEffect(() => {
    fetch(`${API}/commissions?state=${filter}`)
      .then(r => r.json())
      .then(d => setCommissions(d.items ?? []))
      .catch(() => setCommissions([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="bounty-board">
      <header className="bounty-header">
        <div>
          <h1>Language Bounty Board</h1>
          <p className="bounty-subtitle">
            AI companies post USDC bounties for specific language datasets.
            Contributors claim by delivering and registering quality data on-chain.
          </p>
        </div>
        {connection && (
          <button className="cta" id="post-commission-btn">
            Post a Commission
          </button>
        )}
      </header>

      <div className="bounty-filters">
        <button
          className={filter === 'open' ? 'filter-pill active' : 'filter-pill'}
          onClick={() => setFilter('open')}
        >
          Open Bounties
        </button>
        <button
          className={filter === 'all' ? 'filter-pill active' : 'filter-pill'}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="bounty-skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bounty-card skeleton" />
          ))}
        </div>
      ) : (
        <div className="bounty-grid">
          {commissions.length === 0 ? (
            <EmptyState
              illustration={
                <BountiesIllustration label="An empty signpost with a coin, no bounties posted" />
              }
              title="No bounties yet"
              message="Be the first to commission African language data and put a bounty on the board."
              cta={{ label: 'Explore datasets', href: '/datasets' }}
            />
          ) : (
            commissions.map(c => (
              <article key={c.id} className="bounty-card">
                <div className="bounty-card-top">
                  <span className="lang-badge">{c.language_code.toUpperCase()}</span>
                  <span className={`state-badge state-${c.state}`}>{c.state}</span>
                </div>
                <h3>{LANGUAGE_NAMES[c.language_code] ?? c.language_code} Dataset</h3>
                <div className="bounty-amount">${c.bounty_usdc.toLocaleString()} USDC</div>
                <ul className="bounty-reqs">
                  <li>≥ {c.min_sample_count.toLocaleString()} samples</li>
                  <li>≥ {c.min_duration_hours}h of audio</li>
                </ul>
                <div className="bounty-footer">
                  <span className="commissioner">
                    by {c.commissioner_truncated}
                  </span>
                  {c.state === 'open' && connection && (
                    <button className="cta-sm" id={`claim-${c.id}`}>
                      Claim Bounty
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
