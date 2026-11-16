import type { ReactNode } from "react";
import type { FigureVariant } from "@/lib/work/case-study";

/**
 * Placeholder artwork for sample projects, replaced by real images (with alt text) later.
 * Compositions are drawn on a 200×200 canvas and scaled with "meet", so they stay whole
 * in every standard frame (16:9, 4:3, 1:1, 4:5). `var(--card-tint)` gives each project its colour.
 */

const tint = "var(--card-tint, var(--landing-orange))";

const COMPOSITIONS: Record<string, ReactNode> = {
  // Product UI: a browser frame with panels
  interface: (
    <>
      <rect x="28" y="46" width="144" height="108" rx="4" />
      <path d="M28 60h144" />
      <circle cx="36" cy="53" r="2" /><circle cx="43" cy="53" r="2" />
      <rect x="38" y="70" width="70" height="44" fill={tint} />
      <rect x="116" y="70" width="46" height="20" /><rect x="116" y="94" width="46" height="20" />
      <path d="M38 124h90M38 134h60M38 144h76" />
    </>
  ),
  // Mobile: two phones at an angle
  phones: (
    <>
      <g transform="rotate(-8 80 100)">
        <rect x="52" y="40" width="58" height="116" rx="10" fill={tint} />
        <rect x="60" y="54" width="42" height="56" rx="2" fill="var(--color-paper)" />
        <path d="M60 120h34M60 130h24" />
      </g>
      <g transform="rotate(6 130 104)">
        <rect x="106" y="50" width="58" height="116" rx="10" fill="var(--color-paper)" />
        <circle cx="135" cy="92" r="18" />
        <path d="M116 126h38M116 136h26M116 146h32" />
      </g>
    </>
  ),
  // Data: a bar and line chart
  chart: (
    <>
      <path d="M36 156h132M36 156V44" />
      <rect x="48" y="112" width="16" height="44" /><rect x="74" y="92" width="16" height="64" fill={tint} />
      <rect x="100" y="120" width="16" height="36" /><rect x="126" y="76" width="16" height="80" fill={tint} />
      <rect x="152" y="98" width="12" height="58" />
      <path d="M48 98 82 72l26 18 34-42 22 12" strokeDasharray="3 4" />
    </>
  ),
  // Concept: overlapping ideas
  orbit: (
    <>
      <circle cx="84" cy="96" r="46" fill={tint} />
      <circle cx="124" cy="86" r="32" />
      <circle cx="132" cy="134" r="16" fill="var(--color-paper)" />
      <path d="M30 160h140" />
      <path d="M150 46l10-10M160 46l-10-10" />
    </>
  ),
  // Brand / poster: big shape and type lines
  poster: (
    <>
      <rect x="54" y="28" width="92" height="144" />
      <circle cx="100" cy="78" r="30" fill={tint} />
      <path d="M66 124h68M66 136h48M66 148h58" />
      <path d="M66 112h20" strokeWidth="3" />
    </>
  ),
  // Build: code window
  code: (
    <>
      <rect x="26" y="40" width="148" height="120" rx="6" />
      <path d="M26 56h148" />
      <path d="M78 82 56 102l22 20M122 82l22 20-22 20M108 76 92 128" />
      <rect x="146" y="44" width="22" height="8" fill={tint} />
    </>
  ),
};

const BY_TYPE: Record<string, string[]> = {
  "Professional Work": ["interface", "phones", "chart", "poster"],
  "Concept/Pitch": ["orbit", "poster", "phones"],
  "Build Lab": ["code", "chart", "orbit"],
};

/**
 * Deals compositions out in turn within each content type (by curated order), so the same
 * drawing never lands on neighbouring projects. Stable per project across filters and sorts.
 */
export function assignArt(projects: { slug: string; tags: { type: string[] } }[]) {
  const seen: Record<string, number> = {};
  return new Map(projects.map((p) => {
    const type = p.tags.type[0];
    const options = BY_TYPE[type] ?? Object.keys(COMPOSITIONS);
    const n = (seen[type] = (seen[type] ?? -1) + 1);
    return [p.slug, options[n % options.length]];
  }));
}

export function CardArt({ type, art }: { type: string; art?: string }) {
  const key = art && COMPOSITIONS[art] ? art : (BY_TYPE[type] ?? ["interface"])[0];
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" className="work-art">
      {COMPOSITIONS[key]}
    </svg>
  );
}

export function FigureArt({ variant }: { variant: FigureVariant }) {
  const map: Record<FigureVariant, string> = { flow: "chart", grid: "interface", board: "orbit", screens: "phones", code: "code" };
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" className="work-art">
      {COMPOSITIONS[map[variant]]}
    </svg>
  );
}
