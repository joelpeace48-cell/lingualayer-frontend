'use client';
import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { EmptyState } from '@/components/empty-state';
import { DatasetsIllustration } from '@/components/illustrations';

interface Dataset {
  dataset_id: string;
  name: string;
  language_code: string;
  owner: string;
  sample_count: number;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    fetch(`${API}/datasets`)
      .then((r) => r.json())
      .then((d) => setDatasets(d.datasets ?? []))
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  }, []);

  const hasFilters = query.trim() !== '' || language !== '';

  const visible = useMemo(
    () =>
      datasets.filter((d) => {
        const matchesQuery =
          query.trim() === '' ||
          d.name.toLowerCase().includes(query.trim().toLowerCase());
        const matchesLanguage = language === '' || d.language_code === language;
        return matchesQuery && matchesLanguage;
      }),
    [datasets, query, language],
  );

  const clearFilters = () => {
    setQuery('');
    setLanguage('');
  };

  const languages = useMemo(
    () => Array.from(new Set(datasets.map((d) => d.language_code))).sort(),
    [datasets],
  );

  return (
    <section className="section">
      <span className="tag">Datasets</span>
      <h2>Dataset marketplace</h2>
      <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
        Browse African language datasets registered on-chain and available to license.
      </p>

      <div className="dataset-filters" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '18px 0' }}>
        <input
          type="search"
          placeholder="Search datasets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search datasets by name"
          style={filterInputStyle}
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Filter datasets by language"
          style={filterInputStyle}
        >
          <option value="">All languages</option>
          {languages.map((code) => (
            <option key={code} value={code}>
              {code.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading datasets…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          illustration={
            <DatasetsIllustration label="A magnifier over stacked data layers, no datasets found" />
          }
          title={hasFilters ? 'No datasets match your filters' : 'No datasets yet'}
          message={
            hasFilters
              ? 'Try removing some filters to see more results.'
              : 'Datasets registered on-chain will appear here. Post a bounty to commission one.'
          }
          cta={
            hasFilters
              ? { label: 'Clear filters', onClick: clearFilters }
              : { label: 'Browse bounties', href: '/bounties' }
          }
        />
      ) : (
        <div className="grid">
          {visible.map((d) => (
            <article key={d.dataset_id} className="card">
              <h3>{d.name}</h3>
              <p>
                {d.language_code.toUpperCase()} · {d.sample_count.toLocaleString()} samples
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const filterInputStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  background: 'color-mix(in srgb, var(--surface) 85%, var(--bg))',
  border: '1px solid color-mix(in srgb, var(--accent) 24%, transparent)',
  color: 'var(--text)',
  minWidth: 180,
};
