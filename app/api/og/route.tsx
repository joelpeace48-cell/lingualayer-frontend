import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const TIER_COLORS: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#9ca3af',
  Gold: '#f59e0b',
  Platinum: '#8b5cf6',
};

/**
 * Dynamic share-card image for a fulfilled commission or a quality-tier
 * upgrade. Query params: ?lang=Yoruba&flag=🇳🇬&amount=500&tier=Platinum
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') ?? 'African language';
  const flag = searchParams.get('flag') ?? '🌍';
  const amount = searchParams.get('amount');
  const tier = searchParams.get('tier');
  const tierColor = tier ? TIER_COLORS[tier] ?? '#5ee9a8' : '#5ee9a8';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(148deg, #0c1812 0%, #143224 52%, #0c1812 100%)',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 28, fontWeight: 700, color: '#f8fafc' }}>
          <span style={{ fontSize: 56 }}>{flag}</span>
          LinguaLayer
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {amount && (
            <p style={{ margin: 0, fontSize: 64, fontWeight: 800, color: '#5ee9a8' }}>
              ${amount} USDC earned
            </p>
          )}
          <p style={{ margin: 0, fontSize: 34, fontWeight: 700, color: '#f1f5f9' }}>
            {lang} data contribution
          </p>
          {tier && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderRadius: 999,
                border: `2px solid ${tierColor}`,
                color: tierColor,
                fontSize: 26,
                fontWeight: 700,
                width: 'fit-content',
              }}
            >
              ★ {tier} quality
            </div>
          )}
        </div>
        <div style={{ display: 'flex', fontSize: 18, color: 'rgba(148,163,184,0.95)' }}>
          Building the future of African AI
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
