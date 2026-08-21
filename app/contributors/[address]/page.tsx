import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { ContributorIllustration } from "@/components/illustrations";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

interface ContributorDataset {
  dataset_id: string;
  name: string;
  language_code: string;
  sample_count: number;
}

interface ContributorProfile {
  datasets: ContributorDataset[];
  total_royalties_usdc: number;
  reputation_score: number;
}

/** Shorten a Stellar address to `GABC…WXYZ` for display. */
function truncate(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 5)}…${address.slice(-5)}`;
}

async function fetchContributor(address: string): Promise<ContributorProfile | null> {
  try {
    const res = await fetch(`${API}/contributors/${encodeURIComponent(address)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  return { title: `Contributor ${truncate(address)}` };
}

export default async function ContributorPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  const profile = await fetchContributor(address);
  const datasets = profile?.datasets ?? [];

  return (
    <section className="section">
      <span className="tag">Contributor</span>
      <h2 style={{ fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>
        {truncate(address)}
      </h2>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>
        Datasets registered and royalties earned by this contributor.
      </p>

      {datasets.length === 0 ? (
        <EmptyState
          illustration={
            <ContributorIllustration label="A person outline with no recorded activity" />
          }
          title="No datasets yet"
          message="This contributor hasn't registered any datasets yet. Explore the marketplace to see what others have published."
          cta={{ label: "Explore datasets", href: "/datasets" }}
        />
      ) : (
        <>
          <div className="contributor-stats">
            <div className="stat-tile">
              <span className="stat-label">Datasets registered</span>
              <span className="stat-value">{datasets.length}</span>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Royalties earned</span>
              <span className="stat-value">
                ${(profile?.total_royalties_usdc ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Reputation score</span>
              <span className="stat-value">{profile?.reputation_score ?? 0}</span>
            </div>
          </div>

          <div className="grid">
            {datasets.map((d) => (
              <article key={d.dataset_id} className="card">
                <h3>{d.name}</h3>
                <p>
                  {d.language_code.toUpperCase()} · {d.sample_count.toLocaleString()} samples
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
