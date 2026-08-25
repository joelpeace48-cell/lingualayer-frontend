'use client';
import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { EmptyState } from '@/components/empty-state';
import { GovernanceIllustration } from '@/components/illustrations';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer_truncated: string;
  votes_for: number;
  votes_against: number;
  state: 'active' | 'passed' | 'rejected' | 'expired';
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { connection } = useWallet();

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/governance/proposals?state=${filter}`)
      .then((r) => r.json())
      .then((d) => setProposals(d.items ?? []))
      .catch(() => setProposals([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const totalVotes = useMemo(
    () => proposals.reduce((sum, p) => sum + p.votes_for + p.votes_against, 0),
    [proposals],
  );

  async function castVote(proposal: Proposal, support: boolean) {
    if (!connection) return;
    setPendingId(proposal.id);
    try {
      const res = await fetch(`${API}/governance/proposals/${proposal.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ support, voter: connection.address }),
      });
      if (!res.ok) throw new Error('Vote failed');
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposal.id
            ? { ...p, votes_for: p.votes_for + (support ? 1 : 0), votes_against: p.votes_against + (support ? 0 : 1) }
            : p,
        ),
      );
      setVotedIds((prev) => new Set(prev).add(proposal.id));
    } catch {
      // Silently ignored: the tally simply doesn't update, and the vote
      // buttons stay enabled so the contributor can retry.
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className="section">
      <span className="tag">Governance</span>
      <h2>Community proposals</h2>
      <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
        Vote on decisions affecting language communities on LinguaLayer — dataset standards, bounty
        parameters, and treasury allocations.
      </p>

      <div className="vote-filters">
        <button
          className={filter === 'active' ? 'vote-filter-pill active' : 'vote-filter-pill'}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={filter === 'all' ? 'vote-filter-pill active' : 'vote-filter-pill'}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading proposals…</p>
      ) : proposals.length === 0 ? (
        <EmptyState
          illustration={<GovernanceIllustration label="An empty ballot box, no proposals yet" />}
          title="No proposals yet"
          message="Governance proposals will appear here once the community starts submitting them."
          cta={{ label: 'Read the roadmap', href: '/roadmap' }}
        />
      ) : (
        <div className="grid">
          {proposals.map((p) => {
            const total = p.votes_for + p.votes_against;
            const forPct = total === 0 ? 50 : Math.round((p.votes_for / total) * 100);
            const hasVoted = votedIds.has(p.id);

            return (
              <article key={p.id} className="card proposal-card">
                <div className="card-top-row">
                  <h3>{p.title}</h3>
                  <span className={`proposal-state proposal-state--${p.state}`}>{p.state}</span>
                </div>
                <p>{p.description}</p>
                <div className="vote-bar" role="img" aria-label={`${forPct}% in favor`}>
                  <div className="vote-bar-for" style={{ width: `${forPct}%` }} />
                </div>
                <div className="vote-tally">
                  <span>{p.votes_for.toLocaleString()} for</span>
                  <span>{p.votes_against.toLocaleString()} against</span>
                </div>
                <div className="proposal-footer">
                  <span className="proposer">by {p.proposer_truncated}</span>
                  {p.state === 'active' && connection && !hasVoted && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="vote-btn" disabled={pendingId === p.id} onClick={() => castVote(p, true)}>
                        Vote for
                      </button>
                      <button
                        className="vote-btn vote-btn--against"
                        disabled={pendingId === p.id}
                        onClick={() => castVote(p, false)}
                      >
                        Vote against
                      </button>
                    </div>
                  )}
                  {p.state === 'active' && hasVoted && <span className="proposer">Vote recorded</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && totalVotes === 0 && proposals.length > 0 && (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 12 }}>
          No votes cast yet — be the first.
        </p>
      )}
    </section>
  );
}
