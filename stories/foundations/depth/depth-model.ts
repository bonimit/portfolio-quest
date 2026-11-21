/**
 * Surfaces & Depth — proposal model (NOT production).
 * Carbon layering is the primary depth system. Layer numbers mean surface NESTING, never elevation or z-index.
 * Sources: carbon-tokens.json + carbon-depth.json (generated from published Carbon packages), live production CSS for
 * existing implementations. Hand-written data here = names, roles and rules only.
 */
import depth from '../carbon/carbon-depth.json';
import {
  MODES, carbonColor, layerAliases, layerTokenNames, measure, pair, semanticValue, toHex, kebab, PALETTES,
  type Mode, type Kind, type Result,
} from '../carbon/carbon-model';
import {SOURCES, readDecl, resolveTheme, type SourceId, type ThemeId} from '../color-source';
import {parseColor} from '../color-math';

export {MODES, layerAliases, layerTokenNames, measure, pair, semanticValue, toHex, kebab};
export type {Mode, Kind, Result};
export const DEPTH = depth;

/* ------------------------------------------------------------------- shadows */

export type FloatingOption = 'carbon' | 'border-first';
export const FLOATING_OPTIONS: Record<FloatingOption, {name: string; summary: string}> = {
  carbon: {name: 'Option X · Carbon as-is', summary: 'Dark floating surfaces use Carbon’s own dark shadow token (alpha from the dark theme) with the normal layer border.'},
  'border-first': {name: 'Option Y · Border-first', summary: 'Dark floating surfaces use a strong border and reuse Carbon’s light-theme shadow strength, so contrast and borders carry the separation instead of heavy black.'},
};

const carbonShadow = (mode: Mode) => (depth.shadowToken as Record<Mode, string>)[mode];

/** Existing soft modal shadow: the non-sticker layer of .guide-dialog's box-shadow (entrance.css), read live. */
export function existingModalShadow(): {css: string; path: string; line: number} | null {
  const d = readDecl('entrance', '.guide-dialog', 'box-shadow');
  if (!d) return null;
  const soft = d.value.split(/,(?![^(]*\))/).map(x => x.trim()).find(x => !x.includes('var('));
  return soft ? {css: soft, path: d.path, line: d.line} : null;
}

export type ShadowSet = {none: string; floating: string; modal: string; floatingBorder: 'subtle' | 'strong'; modalBorder: 'subtle' | 'strong'};
export function shadowSet(mode: Mode, opt: FloatingOption): ShadowSet {
  const geometry = depth.floating.geometry; // "0 2px 6px", parsed from Carbon's box-shadow mixin
  const modal = existingModalShadow()?.css ?? 'none';
  if (mode === 'light') return {none: 'none', floating: `${geometry} ${carbonShadow('light')}`, modal, floatingBorder: 'subtle', modalBorder: 'subtle'};
  return opt === 'carbon'
    ? {none: 'none', floating: `${geometry} ${carbonShadow('dark')}`, modal: 'none', floatingBorder: 'subtle', modalBorder: 'strong'}
    : {none: 'none', floating: `${geometry} ${carbonShadow('light')}`, modal: 'none', floatingBorder: 'strong', modalBorder: 'strong'};
}
export function shadowVars(mode: Mode, opt: FloatingOption): Record<string, string> {
  const s = shadowSet(mode, opt);
  return {
    '--pqs-shadow-none': s.none, '--pqs-shadow-floating': s.floating, '--pqs-shadow-modal': s.modal,
    '--pqs-floating-border': `var(--pqc-border-${s.floatingBorder})`, '--pqs-modal-border': `var(--pqc-border-${s.modalBorder})`,
  };
}

export const SHADOW_ROLES = [
  {name: 'shadow-none', role: 'Standard nested surfaces. Depth comes from the layer fill and border-subtle only.', basis: 'Carbon layering'},
  {name: 'shadow-floating', role: 'Dropdowns, menus and popovers that overlap content.', basis: 'Carbon `box-shadow` mixin (0 2px 6px · shadow token) from @carbon/styles; Carbon popover drop-shadow is 0 2px 2px at 0.2'},
  {name: 'shadow-modal', role: 'Modal dialogs and prominent overlays, together with the overlay scrim.', basis: 'No Carbon value exists (Carbon modals rely on the scrim). Light reuses the existing soft layer of .guide-dialog (entrance.css); dark uses scrim + border.'},
] as const;

/* ------------------------------------------------------------ existing refs */

export type Existing = {id: string; label: string; kind: 'floating' | 'modal' | 'expressive'; flavor: string; source: SourceId; selector: string; prop: string; why: string};
export const EXISTING: Existing[] = [
  {id: 'dropdown', label: 'Custom dropdown options', kind: 'floating', flavor: 'sticker + soft', source: 'dropdown', selector: '.custom-dropdown-options', prop: 'box-shadow', why: 'Floating list: first layer is a sticker, second a soft shadow.'},
  {id: 'compact-menu', label: 'Compact navigation menu', kind: 'floating', flavor: 'hard offset', source: 'navigation', selector: '.compact-menu', prop: 'box-shadow', why: 'Floating menu with a hard offset shadow.'},
  {id: 'guide-dialog', label: 'Guide dialog', kind: 'modal', flavor: 'sticker + soft', source: 'entrance', selector: '.guide-dialog', prop: 'box-shadow', why: 'Orange sticker offset plus a soft ambient shadow.'},
  {id: 'quest-night-dialog', label: 'Island night dialog', kind: 'modal', flavor: 'soft', source: 'quest', selector: '.quest-preview[data-light="night"] .quest-conversation.guide-dialog', prop: 'box-shadow', why: 'Soft shadow on the night panel.'},
  {id: 'title-path', label: 'Entrance title path', kind: 'expressive', flavor: 'sticker', source: 'entrance', selector: '.title-path', prop: 'box-shadow', why: 'Sticker-style hard drop.'},
  {id: 'landing-card', label: 'Landing card (hover)', kind: 'expressive', flavor: 'sticker', source: 'landing', selector: '.landing-card:hover', prop: 'box-shadow', why: 'Editorial card hover treatment.'},
  {id: 'world-preview', label: 'Editorial world preview', kind: 'expressive', flavor: 'sticker token', source: 'tokens', selector: ':root', prop: '--temp-shadow', why: 'Editorial card treatment via --temp-shadow.'},
  {id: 'stage', label: 'Adventure stage', kind: 'expressive', flavor: 'hard offset', source: 'adventure', selector: '.adventure .stage', prop: 'box-shadow', why: 'Playable machine frame.'},
  {id: 'tile-hover', label: 'Adventure tile (hover / selected)', kind: 'expressive', flavor: 'sticker', source: 'adventure', selector: '.adventure .tile:hover', prop: 'box-shadow', why: 'Arcade tile lift.'},
  {id: 'tile-island', label: 'Island tile', kind: 'expressive', flavor: 'floating island', source: 'adventure', selector: '.adventure[data-theme="A5"] .tile', prop: 'box-shadow', why: 'Island tiles float with a slate underside.'},
  {id: 'tile-neon', label: 'Neon tile glow', kind: 'expressive', flavor: 'neon glow', source: 'adventure', selector: '.adventure[data-theme="A2"] .tile', prop: 'box-shadow', why: 'Neon glow derived from the tile hue.'},
  {id: 'aura', label: 'Island building aura', kind: 'expressive', flavor: 'game glow', source: 'quest', selector: '.quest-sign:focus-visible .quest-building-aura', prop: 'box-shadow', why: 'Selected-building glow in the island scene.'},
];
export const existingValue = (e: Existing) => readDecl(e.source, e.selector, e.prop);

/* ------------------------------------------------------------------ stacking */

export type ZRow = {role: string; existing: {value: string; where: string}[]; carbon: string; proposed: string};
const z = (source: SourceId, selector: string, prop: string) => {
  const d = readDecl(source, selector, prop);
  return d ? {value: d.value, where: `${d.path}:${d.line} · ${selector}`} : null;
};
const some = <T,>(...xs: (T | null)[]) => xs.filter((x): x is T => x !== null);
export const Z_ROWS: ZRow[] = [
  {role: 'page / base', existing: some(z('tokens', ':root', '--temp-z-page')), carbon: '—', proposed: 'z-base'},
  {role: 'navigation', existing: some(z('tokens', ':root', '--temp-z-nav'), z('navigation', '.compact-menu', 'z-index')), carbon: `header ${depth.zIndexes.header}`, proposed: 'z-nav'},
  {role: 'floating (dropdown, menu, popover)', existing: some(z('dropdown', '.custom-dropdown-options', 'z-index')), carbon: `floating ${depth.zIndexes.floating} · dropdown ${depth.zIndexes.dropdown}`, proposed: 'z-floating'},
  {role: 'overlay / scrim', existing: some(z('adventure', '.adventure .scrim', 'z-index')), carbon: `overlay ${depth.zIndexes.overlay}`, proposed: 'z-overlay'},
  {role: 'modal / drawer', existing: some(z('adventure', '.adventure .drawer', 'z-index')), carbon: `modal ${depth.zIndexes.modal}`, proposed: 'z-modal'},
  {role: 'skip link', existing: some(z('tokens', ':root', '--temp-z-skip')), carbon: '—', proposed: 'z-skip'},
  {role: 'game badge / effects', existing: some(z('adventure', '.adventure .badge', 'z-index'), z('adventure', '.adventure .spark', 'z-index')), carbon: '—', proposed: 'expressive, not tokenized'},
];

/* ---------------------------------------------------------- surface roles */

export type SurfaceRole = {name: string; surface: string; border: string; field?: string; shadow: string; depthRule: string; treatment: 'carbon' | 'preserve'};
export const SURFACE_ROLES: SurfaceRole[] = [
  {name: 'Page background', surface: 'background', border: '—', shadow: 'shadow-none', depthRule: 'Layer 00; the base every layer nests on.', treatment: 'carbon'},
  {name: 'Nested card / section', surface: 'layer', border: 'border-subtle', shadow: 'shadow-none', depthRule: 'Depth N uses layer-0N and border-subtle-0(N-1). No shadow just for being nested.', treatment: 'carbon'},
  {name: 'Input / filter', surface: 'field', border: 'border-strong', field: 'field', shadow: 'shadow-none', depthRule: 'Use the field and border-strong numbered for the surface the control sits on.', treatment: 'carbon'},
  {name: 'Dropdown', surface: 'layer (next nesting level of the surface it overlaps)', border: 'border-subtle / strong', shadow: 'shadow-floating (optional)', depthRule: 'Only add the shadow when it overlaps content.', treatment: 'carbon'},
  {name: 'Popover', surface: 'layer (next nesting level of the surface it overlaps)', border: 'border-subtle / strong', shadow: 'shadow-floating (optional)', depthRule: 'Same as dropdown.', treatment: 'carbon'},
  {name: 'Modal dialog', surface: 'layer (depth 1) over overlay scrim', border: 'border-subtle / strong', shadow: 'shadow-modal (optional)', depthRule: 'Scrim does most of the work; shadow is optional.', treatment: 'carbon'},
  {name: 'Editorial card', surface: 'existing treatment', border: 'existing', shadow: 'existing sticker / hard shadow', depthRule: 'Preserved; outside depth tokens.', treatment: 'preserve'},
  {name: 'Game / Island / Arcade / Neon', surface: 'existing theme tokens', border: 'existing', shadow: 'existing expressive effects', depthRule: 'Preserved; independent of light/dark.', treatment: 'preserve'},
];

/* -------------------------------------------------------- Figma-ready JSON */

const SURFACE_TOKENS = [
  'background', 'layer01', 'layer02', 'layer03', 'field01', 'field02', 'field03', 'borderSubtle00', 'borderSubtle01', 'borderSubtle02', 'borderSubtle03',
  'borderStrong01', 'borderStrong02', 'borderStrong03', 'layerHover01', 'layerHover02', 'layerHover03', 'layerActive01', 'layerSelected01', 'overlay',
];
export function figmaVariables(opt: FloatingOption) {
  const fmt = (m: Mode, key: string) => toHex(carbonColor(m, key));
  const semantic = Object.fromEntries(SURFACE_TOKENS.map(k => [`surface/${kebab(k)}`, {Light: fmt('light', k), Dark: fmt('dark', k), source: `carbon.${k}`}]));
  const usedGrays = Object.entries(PALETTES.gray as Record<string, string>).map(([step, hex]) => [`gray/${step}`, hex.toUpperCase()]);
  return {
    note: 'PREVIEW of a possible future variables export. Not synced to Figma; no components created.',
    collections: [
      {name: 'Primitive / Neutral', modes: ['Default'], variables: Object.fromEntries(usedGrays)},
      {name: 'Semantic / Surface', modes: ['Light', 'Dark'], variables: semantic},
      {name: 'Component / Surface', modes: ['Light', 'Dark'], variables: Object.fromEntries(SURFACE_ROLES.filter(r => r.treatment === 'carbon').map(r => [`component/${r.name.toLowerCase().replace(/[^a-z]+/g, '-')}`, {surface: r.surface, border: r.border, shadow: r.shadow}]))},
      {name: 'Elevation / Shadow', modes: ['Light', 'Dark'], variables: {'shadow/none': {Light: 'none', Dark: 'none'}, 'shadow/floating': {Light: shadowSet('light', opt).floating, Dark: shadowSet('dark', opt).floating}, 'shadow/modal': {Light: shadowSet('light', opt).modal, Dark: shadowSet('dark', opt).modal}}},
      {name: 'Stacking', modes: ['Default'], variables: Object.fromEntries(Z_ROWS.filter(r => r.existing[0] && !r.proposed.startsWith('expressive')).map(r => [r.proposed, Number(r.existing[0].value)]))},
      {name: 'Expressive exceptions', modes: [], variables: {}, note: 'Intentionally empty: sticker, glow and game shadows stay as authored CSS, outside tokens.'},
    ],
  };
}

/* ------------------------------------------------------------- separation */

export type SepRow = {depth: number; layer: string; parent: string; fillRatio: number; borderRatio: number; strongRatio: number; focusRatio: number};
/** Measured separation for a nested surface at each depth in a mode (decorative separation is informational). */
export function separation(mode: Mode): SepRow[] {
  const parents = ['background', 'layer-01', 'layer-02'];
  return [1, 2, 3].map(d => {
    const layerName = `layer-0${d}`;
    const parent = parents[d - 1];
    const fill = pair(mode, 'A', layerName, parent, 'info');
    const border = pair(mode, 'A', `border-subtle-0${d - 1}`, layerName, 'info');
    const strong = pair(mode, 'A', `border-strong-0${d}`, d === 1 ? 'background' : parent, 'ui');
    const focus = pair(mode, 'A', 'focus', layerName, 'ui');
    return {depth: d, layer: layerName, parent, fillRatio: fill.ratio, borderRatio: border.ratio, strongRatio: strong.ratio, focusRatio: focus.ratio};
  });
}

/* ------------------------------------------------------------- live helpers */

/** Inline custom properties so reconstructed specimens can resolve var() references inside live-read shadow strings. */
export function contextVars(...themes: ThemeId[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of themes) for (const [k, t] of resolveTheme(id)) if (t.color) out[k] = t.value;
  return out;
}
export const sourcePresent = (source: SourceId, text: string) => SOURCES[source].css.includes(text);
export {parseColor};
