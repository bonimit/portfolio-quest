/**
 * Census of border-radius in PRODUCTION CSS (read-only). Reuses the brace-depth walker from the motion census, so @media chains and
 * keyframe steps are handled; here only radius declarations matter. Handles `!important`, 1 to 4 value shorthands, `a / b` ellipse
 * forms (horizontal radii only), longhand corners, rem at 16px, `50%` (a circle only on a square), pills (>= 999px) and var() tokens.
 */
import tokensCss from '../../../app/tokens.css?raw';
import {walkCss} from '../motion/motion-census';

const cssFiles = import.meta.glob(['../../../app/**/*.css', '../../../components/**/*.css', '!../../../app/design-audit/**', '!../../../app/quest-preview/scene-review/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;

export type ExceptionClass = 'Adventure / Island / Arcade / Neon' | 'Game world / scenes / avatars' | 'D0–D6 case-study templates' | 'Hero / editorial / entrance composition' | 'Standard UI';
export function exceptionFor(path: string): ExceptionClass {
  if (/^app\/world\/|^components\/adventure\//.test(path)) return 'Adventure / Island / Arcade / Neon';
  if (/^app\/quest-preview\/|^components\/quest-preview\//.test(path)) return 'Game world / scenes / avatars';
  if (/^components\/work\/templates\/|^app\/work\/\[slug\]\//.test(path)) return 'D0–D6 case-study templates';
  if (/^app\/landing\.css$|^app\/entrance\.css$|^app\/portfolio\/|^components\/home\//.test(path)) return 'Hero / editorial / entrance composition';
  return 'Standard UI';
}

const tokenTable = (() => { const m = new Map<string, string>(); for (const t of tokensCss.matchAll(/(--[\w-]*radius[\w-]*):\s*([^;]+);/g)) m.set(t[1], t[2].trim()); return m; })();
export const productionRadiusTokens = () => [...tokenTable].map(([name, value]) => ({name, value, px: lengthPx(value)}));

export const PILL_MIN = 999;
export type Corner = {px: number | null; kind: 'px' | 'circle' | 'pill' | 'dynamic'};
const lengthPx = (s: string): number | null => { const m = /^(-?[\d.]+)(px|rem|em)?$/.exec(s.trim()); if (!m) return null; return Number(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? 16 : 1); };
function oneCorner(tok: string, depth = 0): Corner {
  const t = tok.trim();
  const v = /^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/.exec(t);
  if (v && depth < 3) { const r = tokenTable.get(v[1]) ?? v[2]; return r ? oneCorner(r, depth + 1) : {px: null, kind: 'dynamic'}; }
  if (t === '50%') return {px: null, kind: 'circle'};
  const px = lengthPx(t);
  if (px === null) return {px: null, kind: 'dynamic'};
  return {px, kind: px >= PILL_MIN ? 'pill' : 'px'};
}
const split = (v: string) => v.replace(/\s*!important\s*$/i, '').split('/')[0].trim().split(/\s+/).filter(Boolean);
/** CSS 1 to 4 value expansion: [top-left, top-right, bottom-right, bottom-left]. */
export function expand(parts: string[]): string[] {
  const [a, b = a, c = a, d = b] = parts;
  return parts.length === 1 ? [a, a, a, a] : parts.length === 2 ? [a, b, a, b] : parts.length === 3 ? [a, b, c, b] : [a, b, c, d];
}
export type RadiusUse = {file: string; line: number; selector: string; chain: string[]; corners: Corner[]; raw: string; group: ExceptionClass};
const LONG = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'];

export async function runRadiusCensus(): Promise<{uses: RadiusUse[]; files: number}> {
  const uses: RadiusUse[] = [];
  for (const [key, load] of Object.entries(cssFiles)) {
    const file = key.replace('../../../', '');
    const {blocks} = walkCss(await load());
    for (const b of blocks) {
      const sh = b.decls.find(d => d.name === 'border-radius');
      const longs = LONG.map(n => b.decls.find(d => d.name === n));
      if (!sh && !longs.some(Boolean)) continue;
      const base = sh ? expand(split(sh.value)) : ['0', '0', '0', '0'];
      const resolved = base.map((v, i) => (longs[i] ? split(longs[i]!.value)[0] : v));
      uses.push({file, line: b.line, selector: b.selector, chain: b.chain, corners: resolved.map(v => oneCorner(v)), raw: sh?.value.replace(/\s*!important\s*$/i, '') ?? longs.filter(Boolean).map(d => `${d!.name}: ${d!.value}`).join('; '), group: exceptionFor(file)});
    }
  }
  return {uses, files: Object.keys(cssFiles).length};
}

/** Last declaration for an exact selector part in one file (cascade order within the file). */
export function find(uses: RadiusUse[], file: string, selectorPart: string): RadiusUse | null {
  const hits = uses.filter(u => u.file === file && u.selector.split(',').some(p => p.trim() === selectorPart));
  return hits.length ? hits[hits.length - 1] : null;
}
/** One representative px for a use: the largest finite corner, 'circle' and 'pill' reported separately. */
export const summary = (u: RadiusUse) => {
  const cs = u.corners;
  if (cs.every(c => c.kind === 'circle')) return {label: '50% (circle on a square)', px: null as number | null, kind: 'circle' as const};
  if (cs.every(c => c.kind === 'pill')) return {label: `${cs[0].px}px (pill)`, px: cs[0].px, kind: 'pill' as const};
  if (cs.some(c => c.kind === 'dynamic')) return {label: 'dynamic', px: null, kind: 'dynamic' as const};
  const uniform = cs.every(c => c.px === cs[0].px);
  const label = uniform ? `${round(cs[0].px!)}px` : cs.map(c => `${round(c.px ?? 0)}px`).join(' ');
  return {label, px: Math.max(...cs.map(c => c.px ?? 0)), kind: 'px' as const};
};
const round = (n: number) => Math.round(n * 100) / 100;

/** Parse a raw radius value (used for the committed Storybook specimens). */
export const parseRaw = (raw: string): Corner[] => expand(split(raw)).map(v => oneCorner(v));
