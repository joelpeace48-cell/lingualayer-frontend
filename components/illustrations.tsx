/**
 * A small set of inline SVG spot illustrations for empty states.
 *
 * All share one visual language so empty states read as a family:
 *   - 120×120 viewBox
 *   - 2px round strokes in `currentColor` (the accent, set by CSS)
 *   - a soft accent-tinted disc behind the motif
 *   - a subtle secondary-accent highlight
 *
 * They are pure SVG (no raster images) to keep the bundle small, and each is
 * marked `role="img"` with a caller-supplied `aria-label` so screen readers get
 * a meaningful description (acceptance criteria for #? empty-states issue).
 */
import type { ReactNode } from "react";

interface IllustrationProps {
  /** Descriptive label announced to assistive tech. */
  label: string;
  className?: string;
}

function Frame({
  label,
  className,
  children,
}: IllustrationProps & { children: ReactNode }) {
  return (
    <svg
      className={className ? `empty-art ${className}` : "empty-art"}
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft backing disc */}
      <circle cx="60" cy="60" r="52" className="empty-art__disc" />
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}

/** Empty bounty board — a signpost with a coin, "nothing posted yet". */
export function BountiesIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M60 34v54" />
      <path d="M42 88h36" />
      <path d="M60 40h26l6 8-6 8H60z" className="empty-art__fill" />
      <circle cx="46" cy="74" r="9" className="empty-art__fill" />
      <path d="M46 70v8M43 74h6" />
    </Frame>
  );
}

/** Empty datasets — a magnifier over stacked layers, "no results". */
export function DatasetsIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d="M34 52l20-10 20 10-20 10-20-10z" className="empty-art__fill" />
      <path d="M34 62l20 10 20-10" />
      <circle cx="72" cy="74" r="12" className="empty-art__fill" />
      <path d="M81 83l9 9" />
    </Frame>
  );
}

/** Empty contributor — a person outline with a dashed activity line. */
export function ContributorIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <circle cx="60" cy="50" r="12" className="empty-art__fill" />
      <path d="M38 86c2-13 11-20 22-20s20 7 22 20" />
      <path d="M40 74h-8" strokeDasharray="3 5" />
      <path d="M88 74h-8" strokeDasharray="3 5" />
    </Frame>
  );
}

/** Empty royalties — a downward-open wallet, "no payouts yet". */
export function RoyaltiesIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x="34" y="44" width="52" height="36" rx="7" className="empty-art__fill" />
      <path d="M34 56h52" />
      <circle cx="74" cy="68" r="4" />
      <path d="M46 92c4-4 24-4 28 0" strokeDasharray="3 5" />
    </Frame>
  );
}
