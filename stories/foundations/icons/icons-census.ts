/**
 * Census of icons and glyphs in PRODUCTION source (read-only; nothing here changes or imports production code).
 * Finds: inline <svg> (multi-line tags, JSX viewBox values), non-SVG glyphs in CSS `content:` and in TSX text (arrows, geometric
 * shapes, emoji), and the production image index. Classification is by PATH first (the approved exception classes), then size.
 */
import assets from './existing-assets.json';

const tsFiles = import.meta.glob(['../../../app/**/*.tsx', '../../../components/**/*.tsx', '!../../../app/design-audit/**', '!../../../app/quest-preview/scene-review/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;
const cssFiles = import.meta.glob(['../../../app/**/*.css', '../../../components/**/*.css', '!../../../app/design-audit/**', '!../../../app/quest-preview/scene-review/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;

export type ExceptionClass = 'Adventure / Island / Arcade / Neon' | 'Game world / scenes / avatars' | 'D0–D6 case-study templates' | 'Hero / editorial / entrance composition' | 'Standard UI';
export function exceptionFor(path: string): ExceptionClass {
  if (/^app\/world\/|^components\/adventure\//.test(path)) return 'Adventure / Island / Arcade / Neon';
  if (/^app\/quest-preview\/|^components\/quest-preview\//.test(path)) return 'Game world / scenes / avatars';
  if (/^components\/work\/templates\/|^app\/work\/\[slug\]\//.test(path)) return 'D0–D6 case-study templates';
  if (/^app\/landing\.css$|^app\/entrance\.css$|^app\/portfolio\/|^components\/home\//.test(path)) return 'Hero / editorial / entrance composition';
  return 'Standard UI';
}

export type SvgUse = {file: string; line: number; viewBox: string | null; w: number | null; h: number | null; dynamic: boolean; ariaHidden: boolean; className: string | null; group: ExceptionClass};
/** Obvious one-to-one Material names. Everything else is "owner review"; no guessing. */
export const EVIDENT: Record<string, {name: string; why: string}> = {
  'components/ui/close-icon.tsx': {name: 'close', why: 'Component is named close-icon.'},
  'components/work/work-explorer.tsx#work-search-icon': {name: 'search', why: 'Class name work-search-icon.'},
  'components/work/work-explorer.tsx#work-filters-icon': {name: 'tune', why: 'Class name work-filters-icon (filter control).'},
};
export type GlyphUse = {file: string; line: number; text: string; kind: 'css-content' | 'tsx-text'; group: ExceptionClass};
export type IconCensus = {svgs: SvgUse[]; glyphs: GlyphUse[]; filesScanned: number};

const SVG_TAG = /<svg\b[^>]*>/g;
const GLYPH = /[←-⇿■-◿☀-➿\u{1F300}-\u{1FAFF}]/u;
const lineOf = (s: string, i: number) => s.slice(0, i).split('\n').length;

export async function runIconCensus(): Promise<IconCensus> {
  const svgs: SvgUse[] = [], glyphs: GlyphUse[] = [];
  for (const [key, load] of Object.entries(tsFiles)) {
    const file = key.replace('../../../', '');
    const src = await load();
    for (const m of src.matchAll(SVG_TAG)) {
      const tag = m[0];
      const vb = /viewBox=(?:"([^"]*)"|\{([^}]*)\})/.exec(tag);
      const literal = vb?.[1] ?? null;
      const nums = literal ? literal.trim().split(/[\s,]+/).map(Number) : [];
      svgs.push({
        file, line: lineOf(src, m.index!), viewBox: literal ?? (vb ? `{${vb[2]}}` : null),
        w: nums.length === 4 ? nums[2] : null, h: nums.length === 4 ? nums[3] : null, dynamic: !!vb && !literal,
        ariaHidden: /aria-hidden/.test(tag), className: /className=(?:"([^"]*)"|\{[^}]*\})/.exec(tag)?.[1] ?? null, group: exceptionFor(file),
      });
    }
    // JSX text glyphs: between > and <, outside comments
    src.split('\n').forEach((l, i) => { const t = />([^<>{}]*)</.exec(l); if (t && GLYPH.test(t[1]) && !/^\s*(\/\/|\*)/.test(l)) glyphs.push({file, line: i + 1, text: t[1].trim().slice(0, 40), kind: 'tsx-text', group: exceptionFor(file)}); });
  }
  for (const [key, load] of Object.entries(cssFiles)) {
    const file = key.replace('../../../', '');
    const css = await load();
    for (const m of css.matchAll(/content:\s*"([^"]+)"/g)) {
      if (m[1] === '' ) continue;
      if (GLYPH.test(m[1]) || /^[\w\s▶►]+$/.test(m[1])) glyphs.push({file, line: lineOf(css, m.index!), text: m[1].slice(0, 40), kind: 'css-content', group: exceptionFor(file)});
    }
  }
  return {svgs, glyphs, filesScanned: Object.keys(tsFiles).length + Object.keys(cssFiles).length};
}

/** Small viewBox is a hint, not a verdict: group (path) decides whether it is "standard UI". */
export function classifySvg(u: SvgUse): {kind: 'ui-glyph' | 'preserved-control' | 'illustration' | 'unknown'; reason: string} {
  if (u.dynamic || u.w === null) return {kind: 'unknown', reason: 'viewBox is dynamic or missing'};
  const small = Math.max(u.w, u.h ?? u.w) <= 32;
  if (!small) return {kind: 'illustration', reason: `${u.w}×${u.h} drawing canvas: artwork, not a functional icon`};
  if (u.group !== 'Standard UI') return {kind: 'preserved-control', reason: `Small glyph inside a preserved group (${u.group}): left as is`};
  return {kind: 'ui-glyph', reason: 'Small glyph in standard UI: candidate for a Material Symbols equivalent after approval'};
}
export function evidentFor(u: SvgUse) {
  return EVIDENT[u.file] ?? (u.className ? EVIDENT[`${u.file}#${u.className.split(' ')[0]}`] : undefined) ?? null;
}

/* ------------------------------------------------------- production images */

export type AssetDir = {dir: string; label: string; count: number; bytes: number; sample: string[]; group: ExceptionClass | 'Guide companion'};
const LABELS: Record<string, string> = {
  'quest-preview': 'Island scene art and sprites', 'quest-preview/restored': 'Restored scene variants', 'quest-preview/three-path': 'Three-path scene art',
  'quest-preview/concept-study': 'Concept study scene', 'quest-preview/pets': 'Companion pets (pixel / sprite art)', 'quest-preview/restored/pets': 'Restored companion pets',
  'quest-preview/guide': 'Guide art', guide: 'Guide companion sprites',
};
export function assetDirs(): AssetDir[] {
  const m = new Map<string, AssetDir>();
  for (const f of assets.files) {
    const d = m.get(f.dir) ?? {dir: f.dir, label: LABELS[f.dir] ?? f.dir, count: 0, bytes: 0, sample: [], group: f.dir.startsWith('guide') ? 'Guide companion' as const : 'Game world / scenes / avatars' as const};
    d.count++; d.bytes += f.bytes; if (d.sample.length < 4) d.sample.push(f.path);
    m.set(f.dir, d);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
export const ASSET_INDEX = assets;
