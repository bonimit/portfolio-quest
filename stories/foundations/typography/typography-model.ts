/**
 * Typography — proposal model (NOT production).
 *
 * Sizes and line heights of the Material 3 scale come ONLY from ../material/material-typography.json (generated and
 * cross-checked against m3.material.io and @material/web). Everything about today's site is READ from production CSS
 * (app/**, components/**) and from app/world/page.tsx (next/font). Hand-written data here = token names, which family slot
 * a role uses, and the proposed responsive mapping. Every responsive value is a LOCAL adaptation: Material publishes one
 * scale and no per-window-class sizes.
 *
 * Material's font family, weight and tracking are deliberately NOT adopted (owner: preserve existing character).
 */
import data from '../material/material-typography.json';
import spacing from '../material/material-spacing.json';
import tokensCss from '../../../app/tokens.css?raw';
import globalsCss from '../../../app/globals.css?raw';
import landingCss from '../../../app/landing.css?raw';
import worldPage from '../../../app/world/page.tsx?raw';
import {allRules, compoundsOf, parseRules} from '../color-source';
import type {Rule} from '../color-source';

export const M3 = data;
export const BREAKPOINTS = spacing.breakpoints;
export type Role = (typeof data.roles)[number];
export const ROLE_GROUPS = ['display', 'headline', 'title', 'body', 'label'] as const;
export type Group = (typeof ROLE_GROUPS)[number];
export const STEPS = ['large', 'medium', 'small'] as const;
export const roleOf = (group: string, step: string) => data.roles.find(r => r.group === group && r.step === step)!;
export const REM = 16;

/* ------------------------------------------------------------ font families */

export type FontFace = {family: string; src: string; weights: string; origin: string; files?: {src: string; weight: string | null}[]};

/** @font-face blocks, verbatim from production CSS (src is the public URL). */
export function fontFacesFromCss(css: string, origin: string): FontFace[] {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => {
    const body = m[1];
    const family = /font-family:\s*"([^"]+)"/.exec(body)?.[1] ?? '';
    const src = /url\("([^"]+)"\)/.exec(body)?.[1] ?? '';
    const weights = /font-weight:\s*([^;]+);/.exec(body)?.[1].trim() ?? '400';
    return {family, src, weights, origin};
  });
}

/** next/font/local calls in app/world/page.tsx. The family name is generated at build time, so a stable alias is used. */
export function localFontsFromPage(tsx: string): (FontFace & {variable: string})[] {
  const out: (FontFace & {variable: string})[] = [];
  for (const m of tsx.matchAll(/const\s+(\w+)\s*=\s*localFont\(\{(.*)\}\);?$/gm)) {
    const body = m[2];
    const variable = /variable:'(--[\w-]+)'/.exec(body)?.[1] ?? '';
    const files: {src: string; weight: string | null}[] = [...body.matchAll(/\{path:'\.\.\/\.\.\/public([^']+)',weight:'([^']+)'\}/g)].map(x => ({src: x[1], weight: x[2]}));
    const single = /src:'\.\.\/\.\.\/public([^']+)'/.exec(body)?.[1];
    const w = [...new Set([...body.matchAll(/weight:'([^']+)'/g)].map(x => x[1]))].join(', ') || 'not declared (browser default)';
    if (!files.length && single) files.push({src: single, weight: /weight:'([^']+)'/.exec(body)?.[1] ?? null});
    out.push({family: `PQT ${variable.slice(2)}`, src: files[0]?.src ?? '', weights: w, origin: `app/world/page.tsx · ${m[1]}`, variable, files});
  }
  return out;
}

export const PRODUCTION_FACES: FontFace[] = [...fontFacesFromCss(globalsCss, 'app/globals.css'), ...fontFacesFromCss(landingCss, 'app/landing.css')];
export const ADVENTURE_FACES = localFontsFromPage(worldPage);

/** Replace next/font variables with the stable alias family so Storybook can load the same files. */
export function aliasAdventureVars(value: string): string {
  let v = value;
  for (const f of ADVENTURE_FACES) v = v.split(`var(${f.variable})`).join(`"${f.family}"`);
  return v;
}

export type Slot = 'primary' | 'secondary' | 'display';
export type FamilyDef = {
  id: string; name: string; kind: 'Primary' | 'Secondary' | 'Display' | 'Theme' | 'Fallback';
  token: string;
  /** Face in production CSS or page.tsx that supplies it (null = system font, no asset). */
  face: (f: FontFace) => boolean;
  weights: number[];
  purpose: string;
  proposedToken: string;
};
const byFamily = (n: string) => (f: FontFace) => f.family === n;
const bySrc = (s: string) => (f: FontFace) => f.src.includes(s);
export const FAMILIES: FamilyDef[] = [
  {id: 'instrument', name: 'Instrument Sans', kind: 'Primary', token: '--landing-font-sans', face: byFamily('Portfolio Instrument Sans'), weights: [400, 500],
    purpose: 'Interface and utility text: navigation, labels, eyebrows, captions, buttons, chips and forms across the Editorial site.', proposedToken: 'font-primary'},
  {id: 'newsreader', name: 'Newsreader', kind: 'Secondary', token: '--landing-font-serif', face: byFamily('Portfolio Newsreader'), weights: [300, 400],
    purpose: 'Editorial reading: card titles, case-study chapter headings, footer copy, the work page body and concept-lab titles.', proposedToken: 'font-secondary'},
  {id: 'anton', name: 'Anton', kind: 'Display', token: '--font-display', face: byFamily('Portfolio Anton'), weights: [400],
    purpose: 'Display: page H1s, hero wordmarks, counters and Adventure tile names. Regular 400 only, set uppercase with negative tracking.', proposedToken: 'font-display'},
  {id: 'figtree', name: 'Figtree', kind: 'Theme', token: '--adventure-sans', face: bySrc('/figtree/'), weights: [300, 400, 500, 600, 700, 800, 900],
    purpose: 'Adventure Island and Arcade UI text (resolved from the cascade; see Typography by Theme).', proposedToken: 'font-theme-adventure-body'},
  {id: 'pressstart', name: 'Press Start 2P', kind: 'Theme', token: '--adventure-pixel', face: bySrc('/pressstart2p/'), weights: [400],
    purpose: 'Neon (A2) display pixel type. An intentional artwork-style label face, not for long reading.', proposedToken: 'font-theme-neon-display'},
  {id: 'plexmono', name: 'IBM Plex Mono', kind: 'Theme', token: '--adventure-mono', face: bySrc('/ibmplexmono/'), weights: [400, 500, 600],
    purpose: 'Neon (A2) body, serif and label slots.', proposedToken: 'font-theme-neon-body'},
  {id: 'arial', name: 'Arial (system)', kind: 'Fallback', token: '--font-body', face: () => false, weights: [400, 700],
    purpose: 'Root body default (body in globals.css) for any text that sets no family. It is the family of unstyled paragraphs, so it is in real use. Needs a decision.', proposedToken: 'font-fallback-body'},
];
export const faceFor = (d: FamilyDef): (FontFace & {variable?: string}) | null =>
  [...PRODUCTION_FACES, ...ADVENTURE_FACES].find(d.face) ?? null;
/** CSS family name to render a specimen: production family where one exists, else the stable alias. */
export const cssFamily = (d: FamilyDef): string => faceFor(d)?.family ?? 'Arial, Helvetica, sans-serif';

/** @font-face CSS for Storybook, derived from the same files production loads (no new assets). */
export function fontFaceCss(): string {
  const seen = new Set<string>();
  return [...PRODUCTION_FACES, ...ADVENTURE_FACES].filter(f => f.src && !seen.has(f.family) && seen.add(f.family)).flatMap(f => {
    const files = f.files?.length ? f.files : [{src: f.src, weight: /^[\d\s]+$/.test(f.weights) ? f.weights : null}];
    return files.map(x => `@font-face { font-family: "${f.family}"; src: url("${x.src}"); font-display: swap; ${x.weight ? `font-weight: ${x.weight};` : ''} }`);
  }).join('\n');
}

/* ------------------------------------------------------ theme family mapping */

export type ThemeMap = {id: string; label: string; selector: string; el: {classes: string[]; attrs: Record<string, string>}; family: Record<Slot, string>; from: Record<Slot, string>};
const matches = (c: {root: boolean; classes: string[]; attrs: [string, string][]}, el: ThemeMap['el']) =>
  c.root || (c.classes.every(k => el.classes.includes(k)) && c.attrs.every(([k, v]) => el.attrs[k] === v));

/** Cascade-resolve a custom property (declaration value) for an element model across all production rules. */
export function resolveVar(el: ThemeMap['el'], name: string): {value: string; path: string; line: number; selector: string} | null {
  let best: {spec: number; order: number; rule: Rule; value: string; sel: string} | null = null;
  for (const rule of allRules()) for (const {part, compound} of compoundsOf(rule.selector)) {
    if (!compound || !matches(compound, el)) continue;
    const d = rule.decls.find(x => x.name === name);
    if (!d) continue;
    if (!best || compound.specificity > best.spec || (compound.specificity === best.spec && rule.order >= best.order)) best = {spec: compound.specificity, order: rule.order, rule, value: d.value, sel: part};
  }
  if (!best) return null;
  const ref = /^var\((--[\w-]+)\)$/.exec(best.value);
  if (ref) { const inner = resolveVar(el, ref[1]); if (inner) return inner; }
  return {value: best.value, path: SOURCE_PATH[best.rule.source], line: best.rule.line, selector: best.sel};
}
const SOURCE_PATH: Record<string, string> = {tokens: 'app/tokens.css', globals: 'app/globals.css', landing: 'app/landing.css', entrance: 'app/entrance.css', adventure: 'app/world/adventure.css', quest: 'app/quest-preview/quest-preview.css', navigation: 'app/site-navigation.css', dropdown: 'components dropdown'};

const THEME_DEFS: {id: string; label: string; selector: string; el: ThemeMap['el']; vars: Record<Slot, string>}[] = [
  {id: 'editorial', label: 'Editorial (site default)', selector: ':root', el: {classes: [], attrs: {}}, vars: {primary: '--landing-font-sans', secondary: '--landing-font-serif', display: '--font-display'}},
  {id: 'island', label: 'Island (A5)', selector: '.adventure[data-theme="A5"]', el: {classes: ['adventure'], attrs: {'data-theme': 'A5'}}, vars: {primary: '--sans', secondary: '--serif', display: '--display'}},
  {id: 'arcade', label: 'Arcade (base .adventure)', selector: '.adventure', el: {classes: ['adventure'], attrs: {}}, vars: {primary: '--sans', secondary: '--serif', display: '--display'}},
  {id: 'neon', label: 'Neon (A2)', selector: '.adventure[data-theme="A2"]', el: {classes: ['adventure'], attrs: {'data-theme': 'A2'}}, vars: {primary: '--sans', secondary: '--serif', display: '--display'}},
];
export function themeMaps(): ThemeMap[] {
  return THEME_DEFS.map(t => {
    const family = {} as Record<Slot, string>; const from = {} as Record<Slot, string>;
    for (const s of ['primary', 'secondary', 'display'] as Slot[]) {
      const r = resolveVar(t.el, t.vars[s]);
      family[s] = r ? aliasAdventureVars(r.value) : 'inherit';
      from[s] = r ? `${r.path}:${r.line} ${r.selector}` : 'not declared';
    }
    return {id: t.id, label: t.label, selector: t.selector, el: t.el, family, from};
  });
}
/** First family name in a resolved stack, unquoted. */
export const leadFamily = (stack: string) => (/^\s*"?([^",]+)"?/.exec(stack)?.[1] ?? '').trim();
export function familyDefFor(stack: string): FamilyDef | null {
  const lead = leadFamily(stack);
  // Same font FILE means same family: the Adventure alias for Anton or Newsreader is the production file.
  const src = [...PRODUCTION_FACES, ...ADVENTURE_FACES].find(f => f.family === lead)?.src;
  return FAMILIES.find(d => faceFor(d)?.family === lead) ?? FAMILIES.find(d => src && faceFor(d)?.src === src) ?? null;
}

/* ------------------------------------------------------- role → family slot */

export type Slotting = {role: Group; slot: Slot; note: string};
/** Proposal: slot used by each semantic role. Hierarchy never changes by theme; only the family behind the slot does. */
export const ROLE_SLOT: Slotting[] = [
  {role: 'display', slot: 'display', note: 'Page H1s and hero wordmarks use the display family in every theme today.'},
  {role: 'headline', slot: 'display', note: 'Adventure headings use the display family. Editorial chapter headings use the secondary family today (see Existing vs Proposed); that is an open decision.'},
  {role: 'title', slot: 'secondary', note: 'Card and list titles use the secondary family on Editorial pages today.'},
  {role: 'body', slot: 'secondary', note: 'Reading text. UI body text in Adventure uses the primary slot; the split is an open decision.'},
  {role: 'label', slot: 'primary', note: 'Navigation, buttons, chips, eyebrows and captions use the primary family.'},
];

/* ---------------------------------------------------- responsive proposal (local) */

export type RespOption = 'P' | 'Q';
export const RESP_OPTIONS: Record<RespOption, {name: string; summary: string}> = {
  P: {name: 'Option P · Display only', summary: 'Only the three Display roles step down on smaller windows. Headline, Title, Body and Label keep the single Material size everywhere.'},
  Q: {name: 'Option Q · Display and Headline', summary: 'Display and the three Headline roles each step one official size down on mobile. Title, Body and Label stay single.'},
};
export type Mode = 'desktop' | 'tablet' | 'mobile';
export const MODES: Mode[] = ['desktop', 'tablet', 'mobile'];
export const MODE_CLASS: Record<Mode, string> = {desktop: 'Expanded and larger (840px and up)', tablet: 'Medium (600–839px)', mobile: 'Compact (below 600px)'};
export const FRAME_WIDTH: Record<Mode, number> = {desktop: 1280, tablet: 720, mobile: 360};

const sizes = () => [...new Set(data.roles.map(r => r.sizePx))].sort((a, b) => b - a);
/** The next smaller OFFICIAL size, so no number is invented. */
export const oneStepDown = (px: number) => { const s = sizes(); const i = s.indexOf(px); return i < 0 ? px : s[Math.min(i + 1, s.length - 1)]; };

export type Resolved = {role: string; px: number; lineHeightPx: number; official: boolean; changed: boolean};
/** Size for a role in a mode. Line height follows the Material pairing for the chosen size (reference only; existing line heights are kept). */
export function sizeFor(roleKey: string, mode: Mode, opt: RespOption): Resolved {
  const r = data.roles.find(x => x.role === roleKey)!;
  let px = r.sizePx;
  if (r.group === 'display') {
    if (mode === 'mobile') px = oneStepDown(r.sizePx);
    else if (mode === 'tablet' && r.step === 'large') px = oneStepDown(r.sizePx);
  } else if (r.group === 'headline' && opt === 'Q' && mode === 'mobile') px = oneStepDown(r.sizePx);
  const src = data.roles.find(x => x.sizePx === px)!;
  return {role: roleKey, px, lineHeightPx: src.lineHeightPx, official: true, changed: px !== r.sizePx};
}
/** Roles that differ by mode in this option (these need -desktop/-tablet/-mobile tokens). */
export const splitRoles = (opt: RespOption) => data.roles.filter(r => MODES.some(m => sizeFor(r.role, m, opt).px !== r.sizePx));
export const roleLabel = (r: {group: string; step: string}) => `${r.group[0].toUpperCase()}${r.group.slice(1)} ${r.step[0].toUpperCase()}${r.step.slice(1)}`;
export const SHORT: Record<string, string> = {large: 'lg', medium: 'md', small: 'sm'};
export const tokenName = (roleKey: string, mode: Mode | null) => {
  const [g, s] = roleKey.split('-');
  return `type-${g}-${SHORT[s]}${mode ? `-${mode}` : ''}`;
};
export function typeVars(mode: Mode, opt: RespOption): Record<string, string> {
  const v: Record<string, string> = {};
  for (const r of data.roles) {
    const s = sizeFor(r.role, mode, opt);
    v[`--pqt-${r.role}-size`] = `${s.px / REM}rem`;
    v[`--pqt-${r.role}-lh`] = `${s.lineHeightPx / REM}rem`;
  }
  return v;
}

/* ------------------------------------------------------------ length parsing */

export type SizeRange = {min: number | null; max: number | null; relative: boolean; dynamic: boolean};
let tokenTable: Map<string, string> | null = null;
function typeTokens(): Map<string, string> {
  if (!tokenTable) {
    tokenTable = new Map();
    for (const r of parseRules('tokens', tokensCss)) for (const d of r.decls) if (d.name.startsWith('--temp-type-') || d.name.startsWith('--temp-leading-')) tokenTable.set(d.name, d.value);
  }
  return tokenTable;
}
const lengthPx = (s: string): number | null => {
  const m = /^(-?[\d.]+)(px|rem|em)$/.exec(s.trim());
  return m ? Number(m[1]) * (m[2] === 'px' ? 1 : REM) : null;
};
export function sizeRange(value: string, depth = 0): SizeRange {
  const v = value.trim();
  const tok = /^var\((--[\w-]+)\)$/.exec(v);
  if (tok && depth < 3) { const t = typeTokens().get(tok[1]); return t ? sizeRange(t, depth + 1) : {min: null, max: null, relative: false, dynamic: true}; }
  const px = lengthPx(v);
  if (px !== null) return {min: px, max: px, relative: /em$/.test(v) && !/rem$/.test(v), dynamic: false};
  const cl = /^clamp\(\s*([^,]+),\s*[^,]+,\s*([^)]+)\)$/.exec(v);
  if (cl) { const a = lengthPx(cl[1]), b = lengthPx(cl[2]); return {min: a, max: b, relative: false, dynamic: a === null || b === null}; }
  return {min: null, max: null, relative: false, dynamic: true};
}

/** Parse `font:` shorthand → weight / size / line-height / family. */
export function parseFontShorthand(v: string) {
  const m = /^(?:(italic|oblique)\s+)?(?:(\d{3}|normal|bold)\s+)?(?:(small-caps)\s+)?(clamp\([^)]*\)|[\d.]+(?:px|rem|em)|var\(--[\w-]+\))\/?(\S+)?\s+(.+)$/.exec(v.trim());
  if (!m) return null;
  return {weight: m[2] ?? null, size: m[4], lineHeight: m[5] ?? null, family: m[6]};
}

/* ----------------------------------------------------------------- census */

const rawCss = import.meta.glob(['../../../app/**/*.css', '../../../components/**/*.css', '!../../../app/design-audit/**', '!../../../app/quest-preview/scene-review/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;

export type FamId = 'instrument' | 'newsreader' | 'anton' | 'arial' | 'adventure-display' | 'adventure-sans' | 'adventure-serif' | 'inherit' | 'other';
export function classifyFamily(token: string): FamId {
  const t = token.trim();
  if (/--font-display/.test(t)) return 'anton';
  if (/--landing-font-sans|--entrance-font/.test(t)) return 'instrument';
  if (/--landing-font-serif/.test(t)) return 'newsreader';
  if (/--font-body|^Arial/.test(t)) return 'arial';
  if (/var\(--display\)/.test(t)) return 'adventure-display';
  if (/var\(--sans\)/.test(t)) return 'adventure-sans';
  if (/var\(--serif\)/.test(t)) return 'adventure-serif';
  if (/^inherit$/.test(t)) return 'inherit';
  return 'other';
}
export const FAM_LABEL: Record<FamId, string> = {
  instrument: 'Instrument Sans (--landing-font-sans)', newsreader: 'Newsreader (--landing-font-serif)', anton: 'Anton (--font-display)', arial: 'Arial (--font-body)',
  'adventure-display': 'Adventure --display', 'adventure-sans': 'Adventure --sans', 'adventure-serif': 'Adventure --serif', inherit: 'inherit', other: 'other / literal',
};
/** Weights the loaded faces actually provide, per resolved family (from FAMILIES; ranges mirror @font-face / localFont). */
const WEIGHTS: Record<string, number[]> = Object.fromEntries(FAMILIES.map(f => [f.id, f.weights]));
const FAMILY_FOR: Record<FamId, {theme: string; ids: string[]}[]> = {
  instrument: [{theme: 'Editorial', ids: ['instrument']}], newsreader: [{theme: 'Editorial', ids: ['newsreader']}], anton: [{theme: 'Editorial', ids: ['anton']}], arial: [{theme: 'Editorial', ids: ['arial']}],
  'adventure-display': [{theme: 'Island / Arcade', ids: ['anton']}, {theme: 'Neon', ids: ['pressstart']}],
  'adventure-sans': [{theme: 'Island / Arcade', ids: ['figtree']}, {theme: 'Neon', ids: ['plexmono']}],
  'adventure-serif': [{theme: 'Island / Arcade', ids: ['newsreader']}, {theme: 'Neon', ids: ['plexmono']}],
  inherit: [], other: [],
};
export type WeightFinding = {file: string; line: number; selector: string; family: string; theme: string; requested: number; provided: number[]; kind: 'synthesized-bold' | 'nearest-weight'; implicit: boolean};
export type SizeRow = {file: string; line: number; selector: string; value: string; range: SizeRange};
export type FontCensus = {
  declarations: number; files: number;
  familyUse: Record<FamId, number>;
  weightFindings: WeightFinding[];
  weightsChecked: number; weightsInherited: number;
  sizes: SizeRow[];
  belowFloor: SizeRow[];
  aboveDisplay: SizeRow[];
  onScale: number; offScale: number; dynamic: number;
};
const HEADING_DEFAULT: Record<string, number> = {h1: 600, h2: 500, h3: 500};

export async function runFontCensus(): Promise<FontCensus> {
  const official = new Set(data.roles.map(r => r.sizePx));
  const floor = Math.min(...official);
  const maxOfficial = Math.max(...official);
  const out: FontCensus = {declarations: 0, files: 0, familyUse: {instrument: 0, newsreader: 0, anton: 0, arial: 0, 'adventure-display': 0, 'adventure-sans': 0, 'adventure-serif': 0, inherit: 0, other: 0}, weightFindings: [], weightsChecked: 0, weightsInherited: 0, sizes: [], belowFloor: [], aboveDisplay: [], onScale: 0, offScale: 0, dynamic: 0};
  for (const [key, load] of Object.entries(rawCss)) {
    const file = key.replace('../../../', '');
    const css = await load();
    let touched = false;
    for (const rule of parseRules('tokens', css)) {
      let family: string | null = null, weight: number | null = null, size: string | null = null;
      for (const d of rule.decls) {
        if (d.name === 'font-family') family = d.value;
        else if (d.name === 'font-weight') weight = /^\d+$/.test(d.value) ? Number(d.value) : d.value === 'bold' ? 700 : d.value === 'normal' ? 400 : null;
        else if (d.name === 'font-size') size = d.value;
        else if (d.name === 'font') {
          const p = parseFontShorthand(d.value);
          if (p) { family = p.family; if (p.weight) weight = p.weight === 'bold' ? 700 : p.weight === 'normal' ? 400 : Number(p.weight); size = p.size; }
        }
      }
      if (family === null && weight === null && size === null) continue;
      touched = true; out.declarations++;
      const fam = family ? classifyFamily(family) : null;
      if (fam) out.familyUse[fam]++;
      if (size) {
        const range = sizeRange(size);
        const row: SizeRow = {file, line: rule.line, selector: rule.selector, value: size, range};
        out.sizes.push(row);
        if (range.dynamic || range.min === null || range.max === null) out.dynamic++;
        else if (range.min === range.max) {
          if (official.has(Math.round(range.min * 100) / 100)) out.onScale++; else out.offScale++;
          if (range.min < floor) out.belowFloor.push(row);
        } else { out.dynamic++; if (range.max > maxOfficial) out.aboveDisplay.push(row); if (range.min < floor) out.belowFloor.push(row); }
      }
      // Weight vs. what the loaded face provides. Explicit weight needs an explicit or heading-default family.
      let w = weight, implicit = false;
      const tag = /(?:^|[\s>])(h[1-3])$/.exec(rule.selector.split(',')[0].trim())?.[1];
      if (w === null && tag && fam && fam !== 'inherit') { w = HEADING_DEFAULT[tag]; implicit = true; }
      if (w !== null && fam && FAMILY_FOR[fam].length) {
        out.weightsChecked++;
        for (const t of FAMILY_FOR[fam]) for (const id of t.ids) {
          const provided = WEIGHTS[id];
          if (!provided || id === 'arial') continue;
          if (provided.includes(w)) continue;
          const kind = w >= 600 && Math.max(...provided) < 600 ? 'synthesized-bold' : 'nearest-weight';
          if (kind === 'nearest-weight' && w <= Math.max(...provided) && w >= Math.min(...provided) && provided.length > 1) continue; // inside a declared range
          out.weightFindings.push({file, line: rule.line, selector: rule.selector, family: FAMILIES.find(f => f.id === id)!.name, theme: t.theme, requested: w, provided, kind, implicit});
        }
      } else if (w !== null && !fam) out.weightsInherited++;
    }
    if (touched) out.files++;
  }
  return out;
}

/* ------------------------------------------------- Existing vs Proposed (live) */

export type Existing = {context: string; label: string; file: string; selector: string; family: FamId | 'literal'; role: string; sample: string};
/** Curated real selectors. The Material role is a PROPOSED mapping (needs approval); current values are read live. */
export const EXISTING: Existing[] = [
  {context: 'Navigation', label: 'Site nav link (landing)', file: 'app/landing.css', selector: '.site-header--landing .site-nav a', family: 'instrument', role: 'label-large', sample: 'Selected Work'},
  {context: 'Navigation', label: 'Site nav link (global)', file: 'app/globals.css', selector: '.site-nav a', family: 'literal', role: 'label-large', sample: 'Concept Lab'},
  {context: 'Buttons', label: 'Adventure button', file: 'app/world/adventure.css', selector: '.adventure .btn', family: 'adventure-sans', role: 'label-large', sample: 'Play prototype'},
  {context: 'Buttons', label: 'Work filter chip', file: 'app/work/work.css', selector: '.work-chip', family: 'literal', role: 'label-large', sample: 'Research'},
  {context: 'Cards', label: 'Landing card title', file: 'app/landing.css', selector: '.landing-card h3', family: 'newsreader', role: 'title-large', sample: 'A considered reading rhythm'},
  {context: 'Cards', label: 'Work card title', file: 'app/work/work.css', selector: '.work-card h2', family: 'literal', role: 'title-large', sample: 'Wayfinding for a campus app'},
  {context: 'Cards', label: 'Work card summary', file: 'app/work/work.css', selector: '.work-card-summary', family: 'literal', role: 'body-large', sample: 'A short summary that explains the project in a sentence or two.'},
  {context: 'Cards', label: 'Landing card tag', file: 'app/landing.css', selector: '.landing-card-tag', family: 'instrument', role: 'label-small', sample: 'UX Research'},
  {context: 'Cards', label: 'Work card meta', file: 'app/work/work.css', selector: '.work-card-meta', family: 'literal', role: 'label-small', sample: '2024 · Product'},
  {context: 'Case studies', label: 'Case hero H1', file: 'app/work/[slug]/case-study.css', selector: '.case-hero h1', family: 'anton', role: 'display-medium', sample: 'Case title'},
  {context: 'Case studies', label: 'Case lede', file: 'app/work/[slug]/case-study.css', selector: '.case-lede', family: 'literal', role: 'body-large', sample: 'The lede paragraph introduces the problem and the outcome.'},
  {context: 'Case studies', label: 'Chapter heading', file: 'app/work/[slug]/case-study.css', selector: '.case-chapter h2', family: 'newsreader', role: 'headline-medium', sample: 'Discovery and framing'},
  {context: 'Case studies', label: 'Chapter body', file: 'app/work/[slug]/case-study.css', selector: '.case-chapter > p:not(.case-chapter-number)', family: 'literal', role: 'body-large', sample: 'Chapter paragraphs carry the reading experience.'},
  {context: 'Case studies', label: 'Fact label', file: 'app/work/[slug]/case-study.css', selector: '.case-facts dt', family: 'instrument', role: 'label-small', sample: 'ROLE'},
  {context: 'Case studies', label: 'Figure caption', file: 'app/work/[slug]/case-study.css', selector: '.case-figure figcaption', family: 'instrument', role: 'body-small', sample: 'Figure 1. The first prototype.'},
  {context: 'Page body', label: 'body', file: 'app/globals.css', selector: 'body', family: 'arial', role: 'body-large', sample: 'Unstyled text inherits the root body.'},
  {context: 'Page body', label: 'h3 (global)', file: 'app/globals.css', selector: 'h3', family: 'literal', role: 'headline-small', sample: 'Section sub-heading'},
  {context: 'Game UI', label: 'Adventure tile name', file: 'app/world/adventure.css', selector: '.adventure[data-theme="A5"] .name', family: 'adventure-display', role: 'title-large', sample: 'PLATFORMER'},
  {context: 'Game UI', label: 'Neon tile name', file: 'app/world/adventure.css', selector: '.adventure[data-theme="A2"] .name', family: 'adventure-display', role: 'label-medium', sample: 'PLATFORMER'},
  {context: 'Game UI', label: 'Neon selected badge', file: 'app/world/adventure.css', selector: '.adventure[data-theme="A2"] .tile.sel::before', family: 'adventure-display', role: 'label-small', sample: 'PLAY ME'},
];
/** Hero / display compositions: listed as preserved exceptions and never mapped. */
export const HERO_EXCEPTIONS: Existing[] = [
  {context: 'Hero', label: 'Contact hero H1', file: 'app/contact/contact.css', selector: '.contact-intro h1', family: 'anton', role: 'display-large', sample: 'Contact'},
  {context: 'Hero', label: 'Work page H1', file: 'app/work/work.css', selector: '.work-head h1', family: 'anton', role: 'display-large', sample: 'Selected Work.'},
  {context: 'Hero', label: 'Entrance title H1', file: 'app/entrance.css', selector: '.title-screen h1', family: 'anton', role: 'display-large', sample: 'Portfolio Quest'},
  {context: 'Hero', label: 'Island scene H1', file: 'app/quest-preview/quest-preview.css', selector: '.quest-heading h1', family: 'anton', role: 'display-large', sample: 'Island'},
  {context: 'Hero', label: 'Concept Lab H1', file: 'app/concepts/concepts.css', selector: '.lab-heading h1', family: 'anton', role: 'display-large', sample: 'Concept Lab'},
];
export type LiveType = {item: Existing; line: number | null; size: string | null; lineHeight: string | null; weight: string | null; tracking: string | null; transform: string | null; range: SizeRange | null; family: string | null};
const rawBy = import.meta.glob(['../../../app/**/*.css', '../../../components/**/*.css', '!../../../app/design-audit/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;
export async function readLive(list: Existing[]): Promise<LiveType[]> {
  const cache = new Map<string, Rule[]>();
  const rulesOf = async (file: string) => {
    if (!cache.has(file)) { const load = rawBy[`../../../${file}`]; cache.set(file, load ? parseRules('tokens', await load()) : []); }
    return cache.get(file)!;
  };
  const out: LiveType[] = [];
  for (const item of list) {
    let line: number | null = null, size: string | null = null, lh: string | null = null, weight: string | null = null, tracking: string | null = null, transform: string | null = null, family: string | null = null;
    for (const r of await rulesOf(item.file)) {
      if (!compoundsOf(r.selector).some(x => x.part === item.selector)) continue;
      for (const d of r.decls) {
        if (d.name === 'font-size') { size = d.value; line = r.line; }
        else if (d.name === 'line-height') lh = d.value;
        else if (d.name === 'font-weight') weight = d.value;
        else if (d.name === 'letter-spacing') tracking = d.value;
        else if (d.name === 'text-transform') transform = d.value;
        else if (d.name === 'font-family') family = d.value;
        else if (d.name === 'font') { const p = parseFontShorthand(d.value); if (p) { size = p.size; line = r.line; lh = p.lineHeight; if (p.weight) weight = p.weight; family = p.family; } }
      }
    }
    out.push({item, line, size, lineHeight: lh, weight, tracking, transform, range: size ? sizeRange(size) : null, family});
  }
  return out;
}

/** Existing app type tokens (--temp-type-*), read live. */
export function existingTypeTokens(): {name: string; value: string; range: SizeRange}[] {
  return [...typeTokens()].filter(([n]) => n.startsWith('--temp-type-')).map(([name, value]) => ({name, value, range: sizeRange(value)}));
}
export const nearestRole = (px: number) => data.roles.reduce((a, b) => (Math.abs(b.sizePx - px) < Math.abs(a.sizePx - px) ? b : a));

/* ---------------------------------------------------------------- exceptions */

export function exceptionFor(path: string): string | null {
  if (/^app\/world\/|^components\/adventure\//.test(path)) return 'Adventure / Island / Arcade / Neon';
  if (/^app\/quest-preview\/|^components\/quest-preview\//.test(path)) return 'Game world / scenes';
  if (/^components\/work\/templates\/|^app\/work\/\[slug\]\//.test(path)) return 'D0–D6 case-study templates';
  if (/^app\/landing\.css$|^app\/entrance\.css$|^app\/contact\/|^app\/portfolio\//.test(path)) return 'Hero / editorial / entrance composition';
  return null;
}

/** Existing unitless leading tokens (--temp-leading-body / -heading), read live. Specimens use these, never Material's line heights. */
export const existingLeading = (kind: 'body' | 'heading'): number => Number(typeTokens().get(`--temp-leading-${kind}`) ?? 1.5);
