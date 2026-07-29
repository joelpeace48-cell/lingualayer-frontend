import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { ContributorIllustration } from "@/components/illustrations";

/** Shorten a Stellar address to `GABC…WXYZ` for display. */
function truncate(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 5)}…${address.slice(-5)}`;
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

  return (
    <section className="section">
      <span className="tag">Contributor</span>
      <h2 style={{ fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>
        {truncate(address)}
      </h2>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>
        Datasets registered and royalties earned by this contributor.
      </p>

      <EmptyState
        illustration={
          <ContributorIllustration label="A person outline with no recorded activity" />
        }
        title="No datasets yet"
        message="This contributor hasn't registered any datasets yet. Explore the marketplace to see what others have published."
        cta={{ label: "Explore datasets", href: "/datasets" }}
      />
    </section>
  );
}
