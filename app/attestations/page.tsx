'use client';
import { useState, type FormEvent } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { QualityBadge, type QualityTier } from '@/components/quality-badge';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

const TIERS: QualityTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export default function AttestationsPage() {
  const [datasetId, setDatasetId] = useState('');
  const [tier, setTier] = useState<QualityTier>('Silver');
  const [score, setScore] = useState('80');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { connection } = useWallet();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!connection) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/attestations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: datasetId,
          tier,
          score: Number(score),
          notes,
          curator: connection.address,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Failed to submit attestation');
      }
      setSubmitted(true);
      setDatasetId('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attestation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <span className="tag">Quality attestation</span>
      <h2>Submit a quality attestation</h2>
      <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
        Certified curators review registered datasets and attest to their quality tier — the score
        and notes below feed directly into the QualityBadge shown across the marketplace.
      </p>

      {!connection ? (
        <p className="attestation-connect-hint">Connect your wallet to submit an attestation.</p>
      ) : (
        <form className="attestation-form" onSubmit={submit}>
          <label className="attestation-field">
            Dataset ID
            <input
              type="text"
              required
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              placeholder="e.g. yor-proverbs-001"
            />
          </label>

          <label className="attestation-field">
            Quality tier
            <select value={tier} onChange={(e) => setTier(e.target.value as QualityTier)}>
              {TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="attestation-field">
            Score (0-100)
            <input
              type="number"
              min={0}
              max={100}
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </label>

          <label className="attestation-field">
            Notes
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Audio clarity, transcription accuracy, dialect coverage…"
            />
          </label>

          <div className="attestation-preview">
            <span className="attestation-preview-label">Preview</span>
            <QualityBadge tier={tier} score={Number(score) || undefined} />
          </div>

          {error && <p className="attestation-error">{error}</p>}
          {submitted && <p className="attestation-success">Attestation submitted.</p>}

          <button type="submit" className="cta" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit attestation'}
          </button>
        </form>
      )}
    </section>
  );
}
