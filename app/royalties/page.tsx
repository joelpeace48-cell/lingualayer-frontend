import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { RoyaltiesIllustration } from "@/components/illustrations";

export const metadata: Metadata = {
  title: "Royalties",
  description: "Payout transparency for African language dataset contributors.",
};

export default function RoyaltiesPage() {
  return (
    <section className="section">
      <span className="tag">Royalties</span>
      <h2>Your royalties</h2>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>
        Track every payout you earn when your registered datasets are licensed.
      </p>

      <EmptyState
        illustration={
          <RoyaltiesIllustration label="An empty wallet, no royalty payouts yet" />
        }
        title="No royalties yet"
        message="Start contributing datasets to earn your share of every license sale."
        cta={{ label: "Start contributing", href: "/datasets" }}
      />
    </section>
  );
}
