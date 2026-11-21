/**
 * Motion & Animation — proposal model (NOT production).
 *
 * Official numbers come ONLY from ../material/material-motion.json (generated, cross-checked against the rendered m3.material.io
 * Tokens page and @material/web). Everything about today's site is read live from production CSS/TSX (motion-census.ts).
 * Hand-written data here = token names, which official step each semantic token points at, reduced-motion rules and thresholds.
 *
 * Material states its easing-and-duration system is legacy (no longer maintained) and that the current expressive system is
 * spring-based "motion physics". Both are documented; this proposal builds the easing/duration tokens the brief asks for and shows
 * springs as reference only.
 */
import data from '../material/material-motion.json';
import tokensCss from '../../../app/tokens.css?raw';
import {BEZ, curveDistance, exceptionFor, MAX_OVERSHOOT, parseBez, splitTop, toMs, type Bez, type CssCensus} from './motion-census';

export const M3 = data;
export type Easing = (typeof data.easings)[number];
export type Duration = (typeof data.durations)[number];
export const bezOf = (e: Easing): Bez => e.css as Bez;
export const cssEasing = (b: readonly number[]) => `cubic-bezier(${b.join(', ')})`;
export const easingByToken = (token: string) => data.easings.find(e => e.token === token)!;
export const durationByToken = (token: string) => data.durations.find(d => d.token === token)!;
export const tokenShort = (t: string) => t.replace('md.sys.motion.', '');

/* ----------------------------------------------------------- basis labels */

export type Basis = 'official' | 'official-pair' | 'package' | 'local' | 'current';
export const BASIS_LABEL: Record<Basis, string> = {
  official: 'Official Material token',
  'official-pair': 'Official suggested pair (Material page)',
  package: 'Package only (@material/web, not cross-checked on the page)',
  local: 'Local adaptation',
  current: 'Current (live production CSS)',
};

/* --------------------------------------------------- proposed semantic tokens */

export type SemanticDuration = {name: string; step: string; why: string};
/** Bucket → step. Each pick is the Material page's own example for that bucket; the bucket naming is LOCAL. */
export const SEMANTIC_DURATIONS: SemanticDuration[] = [
  {name: 'motion-duration-short', step: 'md.sys.motion.duration.short4', why: 'Page example: selection controls, 200ms with Standard easing.'},
  {name: 'motion-duration-medium', step: 'md.sys.motion.duration.medium4', why: 'Page example: a FAB expanding into a sheet, 400ms with Emphasized easing.'},
  {name: 'motion-duration-long', step: 'md.sys.motion.duration.long2', why: 'Page example: a card expanding to full screen, 500ms with Emphasized easing.'},
  {name: 'motion-duration-ambient', step: 'md.sys.motion.duration.extra-long4', why: 'Page example: an ambient carousel auto-advance, 1000ms. Reserved for non-interactive motion.'},
];
export type SemanticEasing = {name: string; token: string | null; fallback?: string; why: string};
export const SEMANTIC_EASINGS: SemanticEasing[] = [
  {name: 'motion-easing-standard', token: 'md.sys.motion.easing.standard', why: 'Small, simple or utility transitions (official description).'},
  {name: 'motion-easing-emphasized', token: null, fallback: 'md.sys.motion.easing.standard', why: 'Official CSS form is "N/A (Use Standard as a fallback)". Identical to standard on the web; do not approximate the path curve.'},
  {name: 'motion-easing-enter', token: 'md.sys.motion.easing.emphasized.decelerate', why: 'Enter the screen (emphasized decelerate).'},
  {name: 'motion-easing-exit', token: 'md.sys.motion.easing.emphasized.accelerate', why: 'Exit the screen permanently (emphasized accelerate).'},
  {name: 'motion-easing-enter-small', token: 'md.sys.motion.easing.standard.decelerate', why: 'Enter, small or utility-focused.'},
  {name: 'motion-easing-exit-small', token: 'md.sys.motion.easing.standard.accelerate', why: 'Exit, small or utility-focused.'},
];
export type Composite = {name: string; easing: string; ms: number; basis: Basis; use: string};
const pair = (easing: string) => data.suggestedPairs.find(p => p.easing === easing)!;
/** enter / exit composites. The curve + duration pairs are Material's own suggested defaults; the token NAMES are local. */
export const COMPOSITES: Composite[] = [
  {name: 'motion-enter', easing: 'md.sys.motion.easing.emphasized.decelerate', ms: pair('Emphasized decelerate').ms, basis: 'official-pair', use: 'Large elements entering: dialogs, sheets.'},
  {name: 'motion-exit', easing: 'md.sys.motion.easing.emphasized.accelerate', ms: pair('Emphasized accelerate').ms, basis: 'official-pair', use: 'Large elements leaving permanently.'},
  {name: 'motion-enter-small', easing: 'md.sys.motion.easing.standard.decelerate', ms: pair('Standard decelerate').ms, basis: 'official-pair', use: 'Menus, dropdowns, tooltips entering.'},
  {name: 'motion-exit-small', easing: 'md.sys.motion.easing.standard.accelerate', ms: pair('Standard accelerate').ms, basis: 'official-pair', use: 'Menus, dropdowns, tooltips leaving.'},
  {name: 'motion-state-change', easing: 'md.sys.motion.easing.standard', ms: durationByToken('md.sys.motion.duration.short4').ms, basis: 'local', use: 'Hover / press / selection state change on buttons and chips (page example: selection controls).'},
];

export type ComponentMotion = {component: string; enter?: string; exit?: string; state?: string; note: string};
export const COMPONENT_MOTION: ComponentMotion[] = [
  {component: 'Button', state: 'motion-state-change', note: 'State layer (colour) only. No scale or translate on press, so reduced motion changes nothing essential.'},
  {component: 'Chip', state: 'motion-state-change', note: 'Selected / unselected colour change. Same rule as Button.'},
  {component: 'Dropdown / menu', enter: 'motion-enter-small', exit: 'motion-exit-small', note: 'Expands from its anchor edge along one axis and fades; scale is avoided (Material, Android).'},
  {component: 'Dialog (desktop)', enter: 'motion-enter', exit: 'motion-exit', note: 'Enters within screen bounds: fade plus a short slide; scrim fades with it. Exit is shorter than enter (Material).'},
  {component: 'Sheet (mobile)', enter: 'motion-enter', exit: 'motion-exit', note: 'Slides from the bottom edge, the sensible default location (Material). Same durations as desktop; only the distance differs.'},
];

/* --------------------------------------------------- game / expressive tokens */

/** Game tokens are DOCUMENTATION ONLY. Names are derived from observed production values; production CSS never aliases them. */
export type ProdToken = {name: string; value: string; kind: 'duration' | 'easing'; ms: number | null; bez: Bez | null};
export function productionTokens(): ProdToken[] {
  const out: ProdToken[] = [];
  for (const m of tokensCss.matchAll(/(--(?:landing|temp)-[a-z-]*(?:duration|easing|spring|slide|pop)[a-z-]*):\s*([^;]+);/g)) {
    const value = m[2].trim();
    const ms = toMs(value);
    const bez = parseBez(value);
    out.push({name: m[1], value, kind: ms !== null ? 'duration' : 'easing', ms, bez});
  }
  return out;
}
export const GAME_TOKEN_NAMES: Record<string, string> = {
  '--landing-spring': 'motion-game-spring', '--landing-pop': 'motion-game-pop', '--landing-slide': 'motion-game-slide',
  '--landing-control-duration': 'motion-game-control-duration', '--landing-color-duration': 'motion-game-color-duration',
  '--landing-card-duration': 'motion-game-card-duration', '--landing-reveal-duration': 'motion-game-reveal-duration', '--landing-drift-duration': 'motion-game-ambient-drift',
  '--temp-duration': 'motion-temp-duration', '--temp-easing': 'motion-temp-easing',
};

/* ----------------------------------------------------------- nearest match */

export const CLOSE = 0.06; // mean |Δy| over the curve; above this there is no close official curve
export type Nearest = {easing: Easing | null; distance: number; overshoot: number; close: boolean};
export function nearestEasing(css: string): Nearest | null {
  const b = parseBez(css);
  if (!b) return null;
  let best: Easing | null = null, d = Infinity;
  for (const e of data.easings) { const x = curveDistance(b, bezOf(e)); if (x < d) { d = x; best = e; } }
  const overshoot = MAX_OVERSHOOT(b);
  return {easing: d <= CLOSE && overshoot <= 1.001 ? best : null, distance: Math.round(d * 1000) / 1000, overshoot, close: d <= CLOSE && overshoot <= 1.001};
}
export function nearestDuration(ms: number): {d: Duration; delta: number} {
  const d = data.durations.reduce((a, b) => (Math.abs(b.ms - ms) < Math.abs(a.ms - ms) ? b : a));
  return {d, delta: d.ms - ms};
}

/* ------------------------------------------------- classification (census) */

export type Class = {kind: 'candidate' | 'preserved'; reason: string; group: string};
/** Default is PRESERVED. A use is an ordinary-UI candidate only when it is outside every preserved group, short, finite and non-overshooting. */
export function classify(u: CssCensus['uses'][number]): Class {
  const group = exceptionFor(u.file);
  if (group !== 'Standard UI') return {kind: 'preserved', reason: `Preserved group: ${group}`, group};
  if (u.timing.iterations === 'infinite') return {kind: 'preserved', reason: 'Looping ambient motion', group};
  if (u.timing.dynamic || u.timing.durationMs === null) return {kind: 'preserved', reason: 'Duration comes from a variable; checked via the token table', group};
  if (u.timing.durationMs > 400) return {kind: 'preserved', reason: 'Longer than a plain UI transition (over 400ms): expressive card / layout motion', group};
  const e = u.timing.easing ? parseBez(u.timing.easing) : null;
  if (e && MAX_OVERSHOOT(e) > 1.05) return {kind: 'preserved', reason: 'Overshoots (spring / pop): no Material easing overshoots', group};
  return {kind: 'candidate', reason: 'Short, finite, non-overshooting UI transition', group};
}

/* ------------------------------------------------------------ reduced motion */

export type MotionPref = 'system' | 'reduce' | 'allow';
export const PREF_LABEL: Record<MotionPref, string> = {system: 'Follow system', reduce: 'Reduce', allow: 'Allow'};
export const resolveReduced = (pref: MotionPref, systemReduced: boolean) => (pref === 'system' ? systemReduced : pref === 'reduce');
export const systemPrefersReduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export type ReduceRule = {motion: string; reduce: string; keeps: string};
/** Reduce = remove nonessential MOVEMENT; keep essential feedback. Local, aligned with WCAG C39 (see page). */
export const REDUCE_RULES: ReduceRule[] = [
  {motion: 'Slide / translate', reduce: 'Opacity only (cross-fade), at the short token', keeps: 'The element still appears and disappears, so state change is perceivable'},
  {motion: 'Scale / zoom', reduce: 'Opacity only', keeps: 'Same as above'},
  {motion: 'Expand / collapse', reduce: 'Instant size change with a short opacity fade', keeps: 'Content is revealed; no animated resize'},
  {motion: 'Dropdown / dialog / sheet enter and exit', reduce: 'Opacity only at motion-duration-short', keeps: 'Scrim and surface still fade in and out'},
  {motion: 'Button / chip state layer (colour)', reduce: 'Unchanged', keeps: 'Colour change is essential feedback, not movement'},
  {motion: 'Focus ring and pressed feedback', reduce: 'Unchanged (never animated away)', keeps: 'Essential for keyboard and touch users'},
  {motion: 'Looping ambient motion', reduce: 'Static pose', keeps: 'No content depends on the loop'},
  {motion: 'Game / scene transitions', reduce: 'Preserved behavior: production decides; see Preserved Animations for each one’s reduced-motion handling', keeps: 'Information must still be reachable without the animation'},
];

/* ------------------------------------------------------------- demo engine */

export type Axis = 'fade' | 'scale' | 'slide' | 'expand';
/** Keyframes for a demo. Reduced → opacity only (rules above). `dir` is 'in' | 'out'. */
export function demoKeyframes(kind: Axis | 'dialog' | 'sheet' | 'menu', dir: 'in' | 'out', reduced: boolean): Keyframe[] {
  const fade: Keyframe[] = dir === 'in' ? [{opacity: 0}, {opacity: 1}] : [{opacity: 1}, {opacity: 0}];
  if (reduced || kind === 'fade') return fade;
  const hidden: Record<string, Keyframe> = {
    scale: {opacity: 0, transform: 'scale(0.85)'},
    slide: {opacity: 0, transform: 'translateX(-2rem)'},
    expand: {opacity: 0, clipPath: 'inset(0 0 100% 0)'},
    menu: {opacity: 0, clipPath: 'inset(0 0 100% 0)'},
    dialog: {opacity: 0, transform: 'translateY(1.5rem)'},
    sheet: {opacity: 1, transform: 'translateY(100%)'},
  };
  const shown: Record<string, Keyframe> = {
    scale: {opacity: 1, transform: 'scale(1)'}, slide: {opacity: 1, transform: 'translateX(0)'}, expand: {opacity: 1, clipPath: 'inset(0 0 0 0)'},
    menu: {opacity: 1, clipPath: 'inset(0 0 0 0)'}, dialog: {opacity: 1, transform: 'translateY(0)'}, sheet: {opacity: 1, transform: 'translateY(0)'},
  };
  return dir === 'in' ? [hidden[kind], shown[kind]] : [shown[kind], hidden[kind]];
}
export type Timing = {easing: string; ms: number};
export const compositeTiming = (name: string, reduced: boolean): Timing => {
  const c = COMPOSITES.find(x => x.name === name)!;
  // Reduced: keep the fade but at the short token so state change stays perceivable and brief.
  const short = durationByToken(SEMANTIC_DURATIONS[0].step).ms;
  return {easing: cssEasing(bezOf(easingByToken(c.easing))), ms: reduced ? Math.min(c.ms, short) : c.ms};
};

/** Re-exported so Motion.tsx has one import for the shared splitters. */
export {BEZ, splitTop};
