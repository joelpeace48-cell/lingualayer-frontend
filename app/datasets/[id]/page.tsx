'use client';
import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { QualityBadge, type QualityTier } from '@/components/quality-badge';

interface Dataset {
  dataset_id: string;
  name: string;
  language_code: string;
  owner: string;
  sample_count: number;
}

interface QualityInfo {
  tier: QualityTier;
  score: number;
  multiplier: number;
  curator_count: number;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
const BASE_ROYALTY_USDC = 10;
const POLL_INTERVAL_MS = 5000;

export default function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [quality, setQuality] = useState<QualityInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuality = useCallback(() => {
    fetch(`${API}/datasets/${id}/quality`)
      .then((r) => r.json())
      .then((q) =>
        setQuality({
          tier: q.tier ?? 'Unrated',
          score: q.score ?? 0,
          multiplier: q.multiplier ?? 1,
          curator_count: q.curator_count ?? 0,
        })
      )
      .catch(() => setQuality((prev) => prev ?? { tier: 'Unrated', score: 0, multiplier: 1, curator_count: 0 }));
  }, [id]);

  useEffect(() => {
    fetch(`${API}/datasets/${id}`)
      .then((r) => r.json())
      .then((d) => setDataset(d))
      .catch(() => setDataset(null))
      .finally(() => setLoading(false));

    fetchQuality();
    const interval = setInterval(fetchQuality, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id, fetchQuality]);

  if (loading) {
    return (
      <section className="section">
        <p style={{ color: 'var(--muted)' }}>Loading dataset…</p>
      </section>
    );
  }

  const effectiveRoyalty = quality ? BASE_ROYALTY_USDC * quality.multiplier : BASE_ROYALTY_USDC;
  const isPlatinum = quality?.tier === 'Platinum';

  return (
    <section className="section">
      <Link href="/datasets" style={{ color: 'var(--muted)', fontSize: 14 }}>
        ← Back to datasets
      </Link>
      <span className="tag">Dataset</span>
      <h2>{dataset?.name ?? id}</h2>
      {dataset && (
        <p style={{ color: 'var(--muted)' }}>
          {dataset.language_code.toUpperCase()} · {dataset.sample_count.toLocaleString()} samples · owned by{' '}
          {dataset.owner}
        </p>
      )}

      <div
        className="card economics-card"
        style={{
          marginTop: 20,
          maxWidth: 420,
          ...(isPlatinum
            ? {
                borderImage: 'linear-gradient(135deg, #8b5cf6, #c4b5fd) 1',
                borderWidth: 2,
                borderStyle: 'solid',
              }
            : {}),
        }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Economics
          {quality && <QualityBadge tier={quality.tier} score={quality.score} compact />}
        </h3>

        <dl className="economics-rows">
          <div className="economics-row">
            <dt>Base royalty</dt>
            <dd>{BASE_ROYALTY_USDC} USDC</dd>
          </div>
          <div className="economics-row">
            <dt>Quality multiplier</dt>
            <dd
              title={
                isPlatinum
                  ? `Platinum-tier datasets earn 50% more per license. Verified by ${quality?.curator_count ?? 0} curators.`
                  : undefined
              }
            >
              {(quality?.multiplier ?? 1).toFixed(1)}× {quality && `(${quality.tier})`}
            </dd>
          </div>
          <div className="economics-row economics-row--total">
            <dt>Effective royalty</dt>
            <dd>{effectiveRoyalty.toFixed(1)} USDC → to contributors</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
