'use client';

interface ShareButtonsProps {
  text: string;
  /** Query params forwarded to /api/og, e.g. { lang: 'Yoruba', amount: '500' }. */
  ogParams?: Record<string, string>;
}

export function ShareButtons({ text, ogParams }: ShareButtonsProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lingualayer.app';
  const ogImageUrl = ogParams
    ? `${siteUrl}/api/og?${new URLSearchParams(ogParams).toString()}`
    : undefined;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${
    ogImageUrl ? `&url=${encodeURIComponent(ogImageUrl)}` : ''
  }`;
  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;

  return (
    <div className="share-buttons">
      <a href={tweetUrl} target="_blank" rel="noreferrer" className="cta-secondary">
        Share on X
      </a>
      <a href={farcasterUrl} target="_blank" rel="noreferrer" className="cta-secondary">
        Cast on Farcaster
      </a>
    </div>
  );
}
