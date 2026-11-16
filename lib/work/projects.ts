/**
 * Work discovery model: the filter dimensions, project shape, URL query
 * parsing and the pure filter/sort logic used by the Selected Work page.
 * Every project can carry several tags per dimension; within one dimension
 * tags are OR-ed, across dimensions they are AND-ed.
 */

import type { TemplateId } from "./templates";

export const DIMENSIONS = [
  { key: "type", label: "Content type", options: ["Professional Work", "Concept/Pitch", "Build Lab"] },
  { key: "discipline", label: "Discipline", options: ["Product Design", "UX/UI", "Branding", "Graphic Design", "Marketing Ads"] },
  {
    key: "industry",
    label: "Industry",
    options: ["FinTech", "Restaurant Tech", "Entertainment", "Oil & Gas", "Telecommunication", "F&B", "Real Estate", "Art & Design"],
  },
  { key: "model", label: "Business model", options: ["B2B", "B2C", "B2B2C", "B2D"] },
  // SaaS describes what was built, not who buys it, so it lives in its own dimension.
  {
    key: "product",
    label: "Product type",
    options: ["SaaS", "Web app", "Mobile app", "Marketplace", "Internal tool", "Developer platform", "Website", "Brand experience", "Campaign"],
  },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];
export type Filters = Record<DimensionKey, string[]>;

export const SORTS = [
  { key: "curated", label: "Curated" },
  { key: "az", label: "A–Z" },
  { key: "newest", label: "Newest" },
  { key: "colour", label: "Colour" },
] as const;

export type SortKey = (typeof SORTS)[number]["key"];

export type Tint = "orange" | "lilac" | "yellow" | "lime" | "teal" | "pink";
const TINT_HUE: Record<Tint, number> = { pink: 336, orange: 31, yellow: 46, lime: 73, teal: 166, lilac: 268 };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  year: number;
  tint: Tint;
  tags: Filters;
  /** Case-study page template (D0–D6). Defaults to D6 when not set. */
  template?: TemplateId;
};

/**
 * Standard image ratios. Every card picture uses one of these, never a stretched in-between size:
 * landscape 16:9, rectangle 4:3, square 1:1, portrait 4:5.
 */
export type ImageShape = "landscape" | "rectangle" | "square" | "portrait";

type Align = "start" | "center" | "end";
type Cell = [col: number, shape: ImageShape, align?: Align];
/** Where a card sits: its column span and start, its row, how it aligns in that row, and its image shape. */
export type PlacedSlot = { col: number; colStart: number; rowStart: number; align: Align; shape: ImageShape };

/**
 * Composed rows: each row fills the 12 columns. Card height comes from the image ratio plus the text,
 * so heights differ inside a row and the shorter cards sit top, centre or bottom by design.
 */
const ROWS: Cell[][] = [
  [[7, "landscape"], [5, "rectangle", "end"]],
  [[4, "square", "end"], [4, "portrait"], [4, "square", "end"]],
  [[5, "square", "center"], [7, "rectangle"]],
  [[3, "portrait", "center"], [6, "rectangle"], [3, "portrait", "center"]],
  [[8, "landscape"], [4, "portrait", "start"]],
  [[6, "rectangle"], [6, "landscape", "end"]],
];

/** Leftover cards on the last row still read as composed. */
const TAIL: Record<number, Cell[]> = {
  1: [[7, "landscape"]],
  2: [[7, "landscape"], [5, "rectangle"]],
};

/** Equal boxes: three across, every card the same size and the same 4:3 image. */
export function gridLayout(count: number): PlacedSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    col: 4, colStart: (i % 3) * 4 + 1, rowStart: Math.floor(i / 3) + 1, align: "start" as const, shape: "rectangle" as const,
  }));
}

export function quiltLayout(count: number): PlacedSlot[] {
  const out: PlacedSlot[] = [];
  let left = count;
  let r = 0;
  while (left > 0) {
    let cells = ROWS[r % ROWS.length];
    if (left < cells.length) cells = TAIL[left] ?? cells.slice(0, left);
    let colStart = 1;
    for (const [col, shape, align = "start"] of cells) {
      out.push({ col, colStart, rowStart: r + 1, align, shape });
      colStart += col;
    }
    left -= cells.length;
    r += 1;
  }
  return out;
}

export type LayoutKey = "collage" | "grid";
export type WorkQuery = { q: string; filters: Filters; sort: SortKey; layout: LayoutKey };

export function emptyFilters(): Filters {
  return { type: [], discipline: [], industry: [], model: [], product: [] };
}

export const DEFAULT_QUERY: WorkQuery = { q: "", filters: emptyFilters(), sort: "curated", layout: "collage" };

type Params = Record<string, string | string[] | undefined>;

/** Reads ?q=&industry=FinTech,F%26B&sort=az, keeping only known values. */
export function parseWorkQuery(params: Params): WorkQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const filters = emptyFilters();
  for (const dim of DIMENSIONS) {
    const allowed: readonly string[] = dim.options;
    const wanted = one(params[dim.key]).split(",").map((s) => s.trim());
    filters[dim.key] = allowed.filter((o) => wanted.includes(o));
  }
  const sort = SORTS.find((s) => s.key === one(params.sort))?.key ?? "curated";
  const layout: LayoutKey = one(params.layout) === "grid" ? "grid" : "collage";
  return { q: one(params.q).slice(0, 80), filters, sort, layout };
}

export function toSearchString(query: WorkQuery) {
  const out = new URLSearchParams();
  if (query.q.trim()) out.set("q", query.q.trim());
  for (const dim of DIMENSIONS) if (query.filters[dim.key].length) out.set(dim.key, query.filters[dim.key].join(","));
  if (query.sort !== "curated") out.set("sort", query.sort);
  if (query.layout === "grid") out.set("layout", "grid");
  const s = out.toString();
  return s ? `?${s}` : "";
}

const fold = (s: string) => s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();

function matchesText(project: Project, q: string) {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = fold([project.title, project.summary, project.role, ...Object.values(project.tags).flat()].join(" "));
  return words.every((w) => hay.includes(w));
}

/** True when the project passes the query, optionally ignoring one dimension (for facet counts). */
export function matches(project: Project, query: WorkQuery, ignore?: DimensionKey) {
  if (!matchesText(project, query.q)) return false;
  return DIMENSIONS.every(({ key }) => {
    const chosen = query.filters[key];
    return key === ignore || !chosen.length || chosen.some((t) => project.tags[key].includes(t));
  });
}

/** How many results the visitor would see if this option were also selected. */
export function facetCount(projects: Project[], query: WorkQuery, key: DimensionKey, option: string) {
  return projects.filter((p) => matches(p, query, key) && p.tags[key].includes(option)).length;
}

export function activeCount(filters: Filters) {
  return DIMENSIONS.reduce((n, d) => n + filters[d.key].length, 0);
}

export function sortProjects(projects: Project[], sort: SortKey) {
  const list = [...projects];
  const byName = (a: Project, b: Project) => a.title.localeCompare(b.title);
  if (sort === "az") list.sort(byName);
  if (sort === "newest") list.sort((a, b) => b.year - a.year || byName(a, b));
  if (sort === "colour") list.sort((a, b) => TINT_HUE[a.tint] - TINT_HUE[b.tint] || byName(a, b));
  return list;
}
