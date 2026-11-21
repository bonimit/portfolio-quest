/**
 * Proposal model: Carbon-based color architecture for Portfolio Quest (NOT production).
 *
 * - Carbon values come only from ./carbon-tokens.json (generated from @carbon/themes, see generator).
 * - Portfolio brand colors are read LIVE from production CSS via the v1 parser; none are copied here.
 * - Names only live in this file. Hand-written data = which token maps to which role.
 */
import data from './carbon-tokens.json';
import {composite, contrastRatio, parseColor, toHex, type RGBA} from '../color-math';
import {resolveTheme} from '../color-source';
import {readRuleColor} from '../color-pairs';

export type Mode = 'light' | 'dark';
export const MODES: Mode[] = ['light', 'dark'];
export const MODE_LABEL: Record<Mode, string> = {light: 'Light · Carbon White', dark: 'Dark · Carbon Gray 100'};
export const PROVENANCE = data.provenance;
export const PALETTES = data.palettes as Record<string, Record<string, string> | string>;
const THEMES = data.themes as Record<Mode, Record<string, string>>;
const LAYER_SETS = data.layerSets as Record<string, string[]>;

export const kebab = (k: string) => k.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/([a-z])(\d)/g, '$1-$2').toLowerCase();

export function carbonRaw(mode: Mode, key: string): string {
  const v = THEMES[mode][key];
  if (v === undefined) throw new Error(`Carbon token ${key} missing in ${mode}`);
  return v;
}
export function carbonColor(mode: Mode, key: string): RGBA {
  const c = parseColor(carbonRaw(mode, key));
  if (!c) throw new Error(`Carbon token ${key} (${mode}) is not a color: ${carbonRaw(mode, key)}`);
  return c;
}
export const carbonKeysMatch = () =>
  JSON.stringify(Object.keys(THEMES.light).sort()) === JSON.stringify(Object.keys(THEMES.dark).sort());

/** Palette lookups by NAME so tests need no literals. */
export const palette = (name: string, step: number): string => (PALETTES[name] as Record<string, string>)[String(step)];
export const paletteWhite = () => PALETTES.white as string;

/* ------------------------------------------------------------------ brand */

export type PrimaryOption = 'A' | 'B';
export const PRIMARY_OPTIONS: Record<PrimaryOption, {name: string; summary: string}> = {
  A: {name: 'Option A · Ink / Paper', summary: 'Primary action keeps today’s ink fill with paper text in light, and inverts to paper fill with ink text in dark. Orange stays the accent.'},
  B: {name: 'Option B · Orange primary', summary: 'Primary action is the existing orange accent with ink text in both modes. Ink/paper become neutral controls only.'},
};

export const BRAND_TOKENS = {
  ink: '--color-ink', paper: '--color-paper', muted: '--color-muted', orange: '--color-accent', surface: '--color-secondary-paper',
  border: '--color-border', focus: '--color-focus', lime: '--landing-lime', yellow: '--landing-yellow', teal: '--landing-teal', pink: '--landing-pink', lilac: '--landing-lilac',
} as const;
export type BrandKey = keyof typeof BRAND_TOKENS;

export function brandColor(key: BrandKey): RGBA {
  const t = resolveTheme('editorial').get(BRAND_TOKENS[key]);
  if (!t?.color) throw new Error(`Existing brand token ${BRAND_TOKENS[key]} not found in source`);
  return t.color;
}

/** Existing literal used for orange TEXT on light surfaces (entrance.css), read live; not a token. */
export const existingOrangeText = (): RGBA | null =>
  readRuleColor({file: 'entrance', selector: '.guide-dialog h2 span', prop: 'color'})?.color ?? null;

/* ------------------------------------------------------------- definitions */

export type Origin = 'carbon' | 'portfolio' | 'derived';
export type SemanticDef = {
  name: string; group: string; role: string; origin: Origin;
  /** Human-readable provenance, e.g. "Carbon · layer01" or "Portfolio · --color-ink". */
  source: string;
  value: (mode: Mode, opt: PrimaryOption) => RGBA;
  carbonRef?: string;
};

const defs: SemanticDef[] = [];
const carbon = (key: string, group: string, role: string) =>
  defs.push({name: kebab(key), group, role, origin: 'carbon', source: `Carbon · ${key}`, value: m => carbonColor(m, key)});

const SET_ROLE: Record<string, [string, string]> = {
  layer: ['Layers', 'Container surface (card, panel, dialog) at Layer depth '],
  layerHover: ['Interaction', 'Hover fill for a container at depth '],
  layerActive: ['Interaction', 'Pressed fill for a container at depth '],
  layerSelected: ['Interaction', 'Selected fill for a container/row at depth '],
  layerSelectedHover: ['Interaction', 'Hover over a selected container/row at depth '],
  layerAccent: ['Layers', 'Accent/zebra container tone at depth '],
  layerAccentHover: ['Interaction', 'Hover for accent container at depth '],
  layerAccentActive: ['Interaction', 'Pressed for accent container at depth '],
  field: ['Fields', 'Input / dropdown background at depth '],
  fieldHover: ['Interaction', 'Hover fill for a field at depth '],
  borderSubtle: ['Borders', 'Quiet divider/border; the set is 00–03 and Layer depth N uses 0(N-1). Token '],
  borderSubtleSelected: ['Borders', 'Border of a selected container at depth '],
  borderStrong: ['Borders', 'Field/control boundary at depth '],
};
for (const [set, keys] of Object.entries(LAYER_SETS)) {
  const meta = SET_ROLE[set];
  if (!meta) continue;
  keys.forEach(k => carbon(k, meta[0], meta[1] + k.slice(-2)));
}
carbon('background', 'Layers', 'Page background (Layer 00).');
carbon('backgroundHover', 'Interaction', 'Hover wash on the page background (translucent).');
carbon('backgroundActive', 'Interaction', 'Pressed wash on the page background (translucent).');
carbon('backgroundSelected', 'Interaction', 'Selected wash on the page background (translucent).');
carbon('borderDisabled', 'Borders', 'Disabled control border.');
carbon('textPrimary', 'Text', 'Primary body text and headings.');
carbon('textSecondary', 'Text', 'Secondary / supporting text.');
carbon('textHelper', 'Text', 'Helper and caption text under fields.');
carbon('textPlaceholder', 'Text', 'Placeholder text (translucent).');
carbon('textDisabled', 'Text', 'Disabled text (translucent).');
carbon('textInverse', 'Text', 'Text on inverse surfaces (tooltips, toasts).');
carbon('textOnColor', 'Text', 'Text on saturated support/status fills.');
carbon('textError', 'Text', 'Error text and inline validation.');
carbon('iconPrimary', 'Icons', 'Primary icons.');
carbon('iconSecondary', 'Icons', 'Secondary icons.');
carbon('iconDisabled', 'Icons', 'Disabled icons (translucent).');
carbon('iconOnColor', 'Icons', 'Icons on saturated fills.');
carbon('supportError', 'Support', 'Error — red.');
carbon('supportWarning', 'Support', 'Warning — yellow.');
carbon('supportSuccess', 'Support', 'Success — green.');
carbon('supportInfo', 'Support', 'Information — blue.');
carbon('overlay', 'Layers', 'Modal scrim.');
carbon('highlight', 'Interaction', 'Search/selection highlight.');

const get = (mode: Mode, opt: PrimaryOption, name: string): RGBA => {
  const d = defs.find(x => x.name === name);
  if (!d) throw new Error(`Unknown semantic token ${name}`);
  return d.value(mode, opt);
};
const brandDef = (name: string, group: string, role: string, source: string, value: SemanticDef['value'], carbonRef?: string, origin: Origin = 'portfolio') =>
  defs.push({name, group, role, origin, source, value, carbonRef});

brandDef('interactive-primary', 'Portfolio brand', 'Primary action fill. Option A: ink (light) / paper (dark). Option B: orange.',
  'Portfolio · --color-ink | --color-paper (A) or --color-accent (B)',
  (m, o) => (o === 'B' ? brandColor('orange') : m === 'light' ? brandColor('ink') : brandColor('paper')), 'interactive');
brandDef('on-interactive-primary', 'Portfolio brand', 'Content on the primary action fill.', 'Portfolio · --color-paper | --color-ink',
  (m, o) => (o === 'B' ? brandColor('ink') : m === 'light' ? brandColor('paper') : brandColor('ink')), 'text-on-color');
brandDef('accent', 'Portfolio brand', 'Brand accent fill (hero, highlights).', 'Portfolio · --color-accent', () => brandColor('orange'));
brandDef('on-accent', 'Portfolio brand', 'Content on the accent fill (existing pairing: ink on orange).', 'Portfolio · --color-ink', () => brandColor('ink'), 'text-on-color');
for (const hue of ['yellow', 'lime', 'teal', 'pink', 'lilac'] as const) {
  brandDef(`accent-${hue}`, 'Portfolio brand', `Pastel accent fill (${hue}); content on it is on-accent (ink).`, `Portfolio · ${BRAND_TOKENS[hue]}`, () => brandColor(hue));
}
brandDef('focus', 'Portfolio brand', 'Focus ring. Existing: ink on paper; dark mirrors the footer precedent (paper).', 'Portfolio · --color-focus (light) | --color-paper (dark)',
  m => (m === 'light' ? brandColor('focus') : brandColor('paper')), 'focus');
brandDef('link', 'Portfolio brand', 'Links inherit text color and are underlined today.', 'Portfolio · inherits --color-ink; Carbon text-primary in proposal',
  (m, o) => get(m, o, 'text-primary'), 'link-primary');
brandDef('chip-selected', 'Portfolio brand', 'Selected chip fill (existing lime direction).', 'Portfolio · --landing-lime', () => brandColor('lime'));
brandDef('on-chip-selected', 'Portfolio brand', 'Content on the selected chip.', 'Portfolio · --color-ink', () => brandColor('ink'));

// Material 3 state-layer opacities (the project's component direction), applied to brand fills only.
const STATE = {hover: 0.08, pressed: 0.1};
const derive = (name: string, role: string, baseTok: string, onTok: string, pct: number) =>
  brandDef(name, 'Derived (new, needs approval)', role, `New · ${onTok} at ${pct * 100}% over ${baseTok} (Material 3 state-layer opacity)`,
    (m, o) => composite({...get(m, o, onTok), a: pct}, get(m, o, baseTok)), undefined, 'derived');
derive('interactive-primary-hover', 'Hover on the primary fill. Carbon has no brand-fill hover token.', 'interactive-primary', 'on-interactive-primary', STATE.hover);
derive('interactive-primary-active', 'Pressed on the primary fill.', 'interactive-primary', 'on-interactive-primary', STATE.pressed);
derive('accent-hover', 'Hover on the accent fill.', 'accent', 'on-accent', STATE.hover);
derive('accent-active', 'Pressed on the accent fill.', 'accent', 'on-accent', STATE.pressed);

export const SEMANTIC = defs;
export const GROUP_ORDER = ['Layers', 'Fields', 'Borders', 'Text', 'Icons', 'Support', 'Interaction', 'Portfolio brand', 'Derived (new, needs approval)'];
export const semanticValue = get;

/** Carbon IBM-Blue interactive tokens: shown for reference only, never adopted. */
export const CARBON_REFERENCE = ['interactive', 'linkPrimary', 'linkPrimaryHover', 'focus', 'focusInverse', 'borderInteractive'];

/* ---------------------------------------------------------------- layering */

/** Aliases that Carbon's Layer re-binds by depth (1 = directly on the page); nth(depth) per _layer-sets.scss. */
export function layerAliases(mode: Mode, depth: number): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [set, keys] of Object.entries(LAYER_SETS)) {
    const key = keys[depth - 1];
    if (key) out[kebab(set)] = toHex(carbonColor(mode, key));
  }
  return out;
}
export const layerTokenNames = (depth: number): Record<string, string> =>
  Object.fromEntries(Object.entries(LAYER_SETS).map(([set, keys]) => [kebab(set), keys[depth - 1] ? kebab(keys[depth - 1]) : '—']));

/** CSS custom properties for a mode wrapper (depth-1 aliases included). */
export function modeVars(mode: Mode, opt: PrimaryOption): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const d of defs) vars[`--pqc-${d.name}`] = toHex(d.value(mode, opt));
  for (const [k, v] of Object.entries(layerAliases(mode, 1))) vars[`--pqc-${k}`] = v;
  return vars;
}
export const depthVars = (mode: Mode, depth: number) =>
  Object.fromEntries(Object.entries(layerAliases(mode, depth)).map(([k, v]) => [`--pqc-${k}`, v]));

/* ---------------------------------------------------------------- contrast */

export type Kind = 'text' | 'ui' | 'exempt' | 'info';
export type Result = {ratio: number; grade: 'pass' | 'large-only' | 'fail' | 'exempt' | 'info'; fg: RGBA; bg: RGBA};

/** Translucent backgrounds are composited over the surface they actually sit on. */
export function measure(fg: RGBA, bg: RGBA, kind: Kind, surface?: RGBA): Result {
  const flat = bg.a < 1 ? composite(bg, surface ?? {r: 255, g: 255, b: 255, a: 1}) : bg;
  const ratio = contrastRatio(fg, flat);
  if (kind === 'exempt') return {ratio, grade: 'exempt', fg, bg: flat};
  if (kind === 'info') return {ratio, grade: 'info', fg, bg: flat};
  if (kind === 'ui') return {ratio, grade: ratio >= 3 ? 'pass' : 'fail', fg, bg: flat};
  return {ratio, grade: ratio >= 4.5 ? 'pass' : ratio >= 3 ? 'large-only' : 'fail', fg, bg: flat};
}

export function pair(mode: Mode, opt: PrimaryOption, fg: string | ((m: Mode) => RGBA), bg: string, kind: Kind, on = 'background'): Result {
  const f = typeof fg === 'string' ? get(mode, opt, fg) : fg(mode);
  return measure(f, get(mode, opt, bg), kind, get(mode, opt, on));
}
export const SURFACES = ['background', 'layer-01', 'layer-02', 'layer-03'];
export {toHex, parseColor};
