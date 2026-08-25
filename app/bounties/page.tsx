'use client';
import { useState, useEffect, type FormEvent } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { EmptyState } from '@/components/empty-state';
import { BountiesIllustration } from '@/components/illustrations';
import { ShareButtons } from '@/components/share-buttons';

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

interface PostCommissionForm {
  language_code: string;
  bounty_usdc: string;
  min_sample_count: string;
  min_duration_hours: string;
  description: string;
}

const EMPTY_FORM: PostCommissionForm = {
  language_code: 'yor',
  bounty_usdc: '',
  min_sample_count: '',
  min_duration_hours: '',
  description: '',
};

export default function BountyBoardPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [showPostModal, setShowPostModal] = useState(false);
  const [form, setForm] = useState<PostCommissionForm>(EMPTY_FORM);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const { connection } = useWallet();

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/commissions?state=${filter}`)
      .then(r => r.json())
      .then(d => setCommissions(d.items ?? []))
      .catch(() => setCommissions([]))
      .finally(() => setLoading(false));
  }, [filter]);

  async function submitCommission(e: FormEvent) {
    e.preventDefault();
    if (!connection) return;
    setPosting(true);
    setPostError(null);
    try {
      const res = await fetch(`${API}/commissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language_code: form.language_code,
          bounty_usdc: Number(form.bounty_usdc),
          min_sample_count: Number(form.min_sample_count),
          min_duration_hours: Number(form.min_duration_hours),
          description_ipfs: form.description,
          commissioner: connection.address,
        }),
      });
      if (!res.ok) throw new Error('Failed to post commission');
      const created: Commission = await res.json();
      setCommissions((prev) => [created, ...prev]);
      setShowPostModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to post commission');
    } finally {
      setPosting(false);
    }
  }

  async function claimBounty(commission: Commission) {
    if (!connection) return;
    setClaimingId(commission.id);
    try {
      const res = await fetch(`${API}/commissions/${commission.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimer: connection.address }),
      });
      if (!res.ok) throw new Error('Failed to claim bounty');
      setCommissions((prev) =>
        prev.map((c) => (c.id === commission.id ? { ...c, state: 'fulfilled' } : c)),
      );
    } catch {
      // Left as an open bounty on failure so the contributor can retry.
    } finally {
      setClaimingId(null);
    }
  }

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
          <button className="cta" id="post-commission-btn" onClick={() => setShowPostModal(true)}>
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
                    <button
                      className="cta-sm"
                      id={`claim-${c.id}`}
                      disabled={claimingId === c.id}
                      onClick={() => claimBounty(c)}
                    >
                      {claimingId === c.id ? 'Claiming…' : 'Claim Bounty'}
                    </button>
                  )}
                </div>
                {c.state === 'fulfilled' && (
                  <ShareButtons
                    text={`I just earned $${c.bounty_usdc.toLocaleString()} USDC by contributing ${LANGUAGE_NAMES[c.language_code] ?? c.language_code} speech data on @LinguaLayer! 🌍🎙️ Join us in building the future of African AI.`}
                    ogParams={{ lang: LANGUAGE_NAMES[c.language_code] ?? c.language_code, amount: String(c.bounty_usdc) }}
                  />
                )}
              </article>
            ))
          )}
        </div>
      )}

      {showPostModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Post a commission">
          <form className="modal-card" onSubmit={submitCommission}>
            <h3>Post a commission</h3>
            <label className="modal-field">
              Language
              <select
                value={form.language_code}
                onChange={(e) => setForm({ ...form, language_code: e.target.value })}
              >
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </label>
            <label className="modal-field">
              Bounty (USDC)
              <input
                type="number"
                min="1"
                required
                value={form.bounty_usdc}
                onChange={(e) => setForm({ ...form, bounty_usdc: e.target.value })}
              />
            </label>
            <label className="modal-field">
              Minimum samples
              <input
                type="number"
                min="1"
                required
                value={form.min_sample_count}
                onChange={(e) => setForm({ ...form, min_sample_count: e.target.value })}
              />
            </label>
            <label className="modal-field">
              Minimum audio hours
              <input
                type="number"
                min="1"
                required
                value={form.min_duration_hours}
                onChange={(e) => setForm({ ...form, min_duration_hours: e.target.value })}
              />
            </label>
            <label className="modal-field">
              Requirements description
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Recording conditions, dialect coverage, licensing terms…"
              />
            </label>
            {postError && <p className="modal-error">{postError}</p>}
            <div className="modal-actions">
              <button type="button" className="cta-secondary" onClick={() => setShowPostModal(false)}>
                Cancel
              </button>
              <button type="submit" className="cta-sm" disabled={posting}>
                {posting ? 'Posting…' : 'Post commission'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
