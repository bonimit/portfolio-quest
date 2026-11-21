/**
 * Motion census of PRODUCTION CSS and TSX (read-only; nothing is changed or imported by production).
 *
 * parseRules() elsewhere in these foundations matches only innermost `selector{...}` blocks, so it drops the enclosing
 * @media chain and treats keyframe steps as rules. Motion needs both, so this file has its own brace-depth walker that records,
 * for every declaration, the at-rule chain it sits in, and keeps @keyframes blocks verbatim.
 */

export type MotionDecl = {name: string; value: string};
export type Block = {selector: string; chain: string[]; line: number; decls: MotionDecl[]};
export type Keyframes = {name: string; raw: string; line: number; chain: string[]};

const blank = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const lineAt = (s: string, i: number) => s.slice(0, i).split('\n').length;

export function walkCss(source: string): {blocks: Block[]; keyframes: Keyframes[]} {
  const css = blank(source);
  const blocks: Block[] = [], keyframes: Keyframes[] = [];
  function matchClose(open: number): number {
    let depth = 0;
    for (let i = open; i < css.length; i++) { if (css[i] === '{') depth++; else if (css[i] === '}' && --depth === 0) return i; }
    return css.length - 1;
  }
  function parse(start: number, end: number, chain: string[]) {
    let i = start;
    while (i < end) {
      let j = i;
      while (j < end && css[j] !== '{' && css[j] !== ';' && css[j] !== '}') j++;
      if (j >= end) break;
      const prelude = css.slice(i, j).trim().replace(/\s+/g, ' ');
      if (css[j] === ';' || css[j] === '}') { i = j + 1; continue; }
      const close = matchClose(j);
      if (/^@(-webkit-)?keyframes\s/.test(prelude)) {
        keyframes.push({name: prelude.replace(/^@(-webkit-)?keyframes\s+/, ''), raw: css.slice(i, close + 1).trim(), line: lineAt(css, i + (css.slice(i, j).length - css.slice(i, j).trimStart().length)), chain});
      } else if (prelude.startsWith('@')) {
        parse(j + 1, close, [...chain, prelude]);
      } else if (prelude) {
        const body = css.slice(j + 1, close);
        const decls = [...body.matchAll(/(?:^|;)\s*([\w-]+)\s*:\s*([^;]+)/g)].map(d => ({name: d[1], value: d[2].trim()}));
        blocks.push({selector: prelude, chain, line: lineAt(css, i + (css.slice(i, j).length - css.slice(i, j).trimStart().length)), decls});
      }
      i = close + 1;
    }
  }
  parse(0, css.length, []);
  return {blocks, keyframes};
}

/* ------------------------------------------------------------ value parsing */

/** Split on commas / whitespace that are NOT inside parentheses (cubic-bezier(.2,.8,.25,1) has top-level-looking commas). */
export function splitTop(value: string, sep: ',' | ' '): string[] {
  const out: string[] = []; let depth = 0, cur = '';
  for (const ch of value) {
    if (ch === '(') depth++; if (ch === ')') depth--;
    if (depth === 0 && (sep === ' ' ? /\s/.test(ch) : ch === ',')) { if (cur.trim()) out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const TIME = /^-?(\d*\.?\d+)(ms|s)$/;
export const toMs = (t: string): number | null => { const m = TIME.exec(t); return m ? Number(m[1]) * (m[2] === 's' ? 1000 : 1) : null; };
const EASE_KW = new Set(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end']);
const isEase = (t: string) => EASE_KW.has(t) || /^(cubic-bezier|steps|linear)\(/.test(t);
const ANIM_KW = new Set(['normal', 'reverse', 'alternate', 'alternate-reverse', 'none', 'forwards', 'backwards', 'both', 'running', 'paused', 'infinite']);

export type Timing = {property: string | null; name: string | null; durationMs: number | null; delayMs: number | null; easing: string | null; iterations: string | null; dynamic: boolean; raw: string; fill: string | null};
export function parseLayer(kind: 'transition' | 'animation', layer: string): Timing {
  const t: Timing = {property: null, name: null, durationMs: null, delayMs: null, easing: null, iterations: null, dynamic: false, raw: layer, fill: null};
  for (const tok of splitTop(layer.replace(/\s*!important\s*$/i, ''), ' ')) {
    if (tok === 'none') { if (kind === 'animation') t.name = 'none'; else t.property = 'none'; continue; }
    const ms = toMs(tok);
    if (ms !== null) { if (t.durationMs === null) t.durationMs = ms; else t.delayMs = ms; }
    else if (isEase(tok)) t.easing = tok;
    else if (/^var\(|^calc\(/.test(tok)) t.dynamic = true;
    else if (tok === 'infinite' || /^\d+$/.test(tok)) t.iterations = tok;
    else if (kind === 'animation' && ANIM_KW.has(tok)) { if (/^(forwards|backwards|both)$/.test(tok)) t.fill = tok; }
    else if (kind === 'animation') t.name = t.name ?? tok;
    else t.property = t.property ?? tok;
  }
  return t;
}

export type MotionUse = {
  file: string; line: number; selector: string; chain: string[];
  kind: 'transition' | 'animation';
  timing: Timing;
  /** guarded: inside prefers-reduced-motion: no-preference. reduce: this IS a reduce block. */
  guard: 'no-preference' | 'reduce' | 'none';
};

export function motionUses(file: string, blocks: Block[]): MotionUse[] {
  const out: MotionUse[] = [];
  for (const b of blocks) {
    const guard: MotionUse['guard'] = b.chain.some(c => /prefers-reduced-motion:\s*no-preference/.test(c)) ? 'no-preference' : b.chain.some(c => /prefers-reduced-motion:\s*reduce/.test(c)) ? 'reduce' : 'none';
    const get = (n: string) => b.decls.find(d => d.name === n)?.value.replace(/\s*!important\s*$/i, '');
    for (const kind of ['transition', 'animation'] as const) {
      const sh = get(kind);
      let layers = sh ? splitTop(sh, ',').map(l => parseLayer(kind, l)) : [];
      // longhands (only when no shorthand sets the same thing in this block)
      if (!layers.length) {
        const dur = get(`${kind}-duration`), ease = get(`${kind}-timing-function`), nm = get(kind === 'animation' ? 'animation-name' : 'transition-property'), it = get('animation-iteration-count');
        if (dur || nm || (kind === 'animation' && it)) {
          const durs = dur ? splitTop(dur, ',') : [''];
          layers = durs.map(d => ({property: kind === 'transition' ? nm ?? null : null, name: kind === 'animation' ? nm ?? null : null, durationMs: d ? toMs(d) : null, delayMs: null, easing: ease ?? null, iterations: it ?? null, dynamic: /var\(|calc\(/.test(d), raw: `${kind}-*: ${d}`, fill: null}));
        }
      }
      for (const timing of layers) out.push({file, line: b.line, selector: b.selector, chain: b.chain, kind, timing, guard});
    }
  }
  return out;
}

/** Does a `reduce` block neutralise motion? (animation:none / duration ~0 / transition:none) */
export const killsMotion = (u: MotionUse) => u.timing.name === 'none' || u.timing.property === 'none' || (u.timing.durationMs !== null && u.timing.durationMs <= 1) || /^none$/.test(u.timing.raw.trim());

export type Coverage = 'guarded' | 'neutralised' | 'unguarded' | 'inert';
/** inert = does not move anything (animation:none / zero duration / paused-only reset). */
export function coverageFor(u: MotionUse, reduceUses: MotionUse[]): Coverage {
  if (u.guard === 'reduce') return 'inert';
  if (u.timing.name === 'none' || u.timing.property === 'none' || (u.timing.durationMs === 0 && !u.timing.dynamic)) return 'inert';
  if (u.guard === 'no-preference') return 'guarded';
  const parts = u.selector.split(',').map(s => s.trim());
  // A reduce rule covers a selector when it names it, or names an ancestor scope with a universal / pseudo tail
  // (`.adventure *`, `.adventure::before`, `.title-screen *`). Static, same-file matching only.
  const bases = reduceUses.filter(r => r.kind === u.kind && killsMotion(r)).flatMap(r => r.selector.split(',').map(x => x.trim()));
  const baseOf = (sel: string) => sel.replace(/(\s\*)?(::?(before|after))?$/, '').replace(/\s\*$/, '').trim();
  const covered = (p: string) => bases.some(b => {
    if (b === '*' || b === '*::before' || b === '*::after') return true;
    const base = baseOf(b);
    if (!base) return false;
    const universal = b !== base; // `.scope *` style: also covers descendants
    if (p === b || p === base) return true;
    if (!p.startsWith(base)) return false;
    const next = p.charAt(base.length);
    return universal ? /[\s:\[.>+~]/.test(next) : /[:\[.]/.test(next);
  });
  return parts.every(covered) ? 'neutralised' : 'unguarded';
}

/* -------------------------------------------------------------- curve maths */

export type Bez = [number, number, number, number];
export const BEZ = /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/;
export const KEYWORD_BEZIER: Record<string, Bez> = {ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1], linear: [0, 0, 1, 1]};
export const parseBez = (e: string): Bez | null => { const m = BEZ.exec(e.trim()); if (m) return m.slice(1).map(Number) as Bez; return KEYWORD_BEZIER[e.trim()] ?? null; };

/** y(t) of a CSS cubic-bezier at progress x (Newton + bisection). */
export function sample(b: Bez, x: number): number {
  const [x1, y1, x2, y2] = b;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t;
  const Y = (t: number) => ((ay * t + by) * t + cy) * t;
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 40; i++) { const v = X(t); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
  return Y(t);
}
/** Mean absolute difference between two curves sampled at 64 points (0 = identical). */
export function curveDistance(a: Bez, b: Bez): number {
  let sum = 0; const n = 64;
  for (let i = 1; i <= n; i++) sum += Math.abs(sample(a, i / n) - sample(b, i / n));
  return sum / n;
}
export const MAX_OVERSHOOT = (b: Bez) => { let m = 0; for (let i = 0; i <= 64; i++) m = Math.max(m, sample(b, i / 64)); return Math.round(m * 1000) / 1000; };

/* ------------------------------------------------------------ source loading */

const cssFiles = import.meta.glob(['../../../app/**/*.css', '../../../components/**/*.css', '!../../../app/design-audit/**', '!../../../app/quest-preview/scene-review/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;
const tsFiles = import.meta.glob(['../../../app/**/*.{ts,tsx}', '../../../components/**/*.{ts,tsx}', '!../../../app/design-audit/**', '!../../../app/quest-preview/scene-review/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;

export function exceptionFor(path: string): string {
  if (/^app\/world\/|^components\/adventure\//.test(path)) return 'Adventure / Island / Arcade / Neon';
  if (/^app\/quest-preview\/|^components\/quest-preview\//.test(path)) return 'Game world / scenes / avatars';
  if (/^components\/work\/templates\/|^app\/work\/\[slug\]\//.test(path)) return 'D0–D6 case-study templates';
  if (/^app\/landing\.css$|^app\/entrance\.css$|^app\/portfolio\/|^components\/home\//.test(path)) return 'Hero / editorial / entrance composition';
  return 'Standard UI';
}

export type CssCensus = {
  files: number;
  uses: (MotionUse & {coverage: Coverage; ms: number | null})[];
  keyframes: (Keyframes & {file: string})[];
  reduceBlocks: Record<string, number>;
  filesWithMotion: string[];
};
export async function runCssCensus(): Promise<CssCensus> {
  const uses: CssCensus['uses'] = [], keyframes: CssCensus['keyframes'] = [], reduceBlocks: Record<string, number> = {};
  const filesWithMotion = new Set<string>();
  for (const [key, load] of Object.entries(cssFiles)) {
    const file = key.replace('../../../', '');
    const {blocks, keyframes: kf} = walkCss(await load());
    kf.forEach(k => keyframes.push({...k, file}));
    const all = motionUses(file, blocks);
    const reduce = all.filter(u => u.guard === 'reduce');
    reduceBlocks[file] = blocks.filter(b => b.chain.some(c => /prefers-reduced-motion:\s*reduce/.test(c))).length;
    for (const u of all) { const coverage = coverageFor(u, reduce); if (u.guard !== 'reduce') { uses.push({...u, coverage, ms: u.timing.durationMs}); filesWithMotion.add(file); } }
  }
  return {files: Object.keys(cssFiles).length, uses, keyframes, reduceBlocks, filesWithMotion: [...filesWithMotion]};
}

/* JS motion evidence: found by pattern in the real TSX, never re-implemented. */
export type JsEvidence = {file: string; waapi: number; raf: number; startViewTransition: number; reducedMotionChecks: number; timers: number; lines: {line: number; text: string}[]};
export async function runJsCensus(): Promise<JsEvidence[]> {
  const out: JsEvidence[] = [];
  for (const [key, load] of Object.entries(tsFiles)) {
    const src = await load();
    const count = (re: RegExp) => (src.match(re) ?? []).length;
    const waapi = count(/\.animate\(/g), raf = count(/requestAnimationFrame\(/g), svt = count(/startViewTransition/g), rm = count(/prefers-reduced-motion/g), timers = count(/setTimeout\(|setInterval\(/g);
    if (waapi + raf + svt + timers === 0) continue;
    const lines: JsEvidence['lines'] = [];
    src.split('\n').forEach((l, i) => { if (/\.animate\(|startViewTransition|duration:|easing:|1000\/\d+|Math\.max\(\d+,/.test(l) && lines.length < 6) lines.push({line: i + 1, text: l.trim().slice(0, 170)}); });
    out.push({file: key.replace('../../../', ''), waapi, raf, startViewTransition: svt, reducedMotionChecks: rm, timers, lines});
  }
  return out.sort((a, b) => b.waapi + b.raf + b.startViewTransition - (a.waapi + a.raf + a.startViewTransition));
}
