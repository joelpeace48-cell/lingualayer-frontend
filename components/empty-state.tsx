/**
 * Reusable empty-state block: a friendly SVG illustration, a title, a short
 * encouraging message, and an action CTA. Used across /bounties, /datasets,
 * /contributors/[address] and /royalties so every empty state looks and behaves
 * consistently.
 *
 * The CTA is either a navigation link (`href`) or an action button (`onClick`).
 * Exactly one should be provided.
 */
import Link from "next/link";
import type { ReactNode } from "react";

interface CtaLink {
  label: string;
  href: string;
  onClick?: never;
}

interface CtaButton {
  label: string;
  onClick: () => void;
  href?: never;
}

export interface EmptyStateProps {
  /** The illustration element (from `components/illustrations`). */
  illustration: ReactNode;
  title: string;
  message: string;
  cta?: CtaLink | CtaButton;
}

export function EmptyState({ illustration, title, message, cta }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__art" aria-hidden={false}>
        {illustration}
      </div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__message">{message}</p>
      {cta &&
        ("href" in cta && cta.href ? (
          <Link className="cta empty-state__cta" href={cta.href}>
            {cta.label}
          </Link>
        ) : (
          <button
            type="button"
            className="cta empty-state__cta"
            onClick={(cta as CtaButton).onClick}
          >
            {cta.label}
          </button>
        ))}
    </div>
  );
}
