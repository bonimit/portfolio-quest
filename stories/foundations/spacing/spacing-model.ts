/**
 * Spacing & Layout — proposal model (NOT production).
 *
 * Numbers come only from material/material-spacing.json (generated from m3.material.io and @material/web) or are read
 * LIVE from production CSS. Hand-written data here = token names, which primitive a role maps to, and rules.
 *
 * Every token carries a basis label:
 *   official-system    Material 3 system spacing token (published for Jetpack Compose; Web is listed "Unavailable")
 *   official-layout    Material 3 layout guidance for margins / spacers by breakpoint
 *   material-web       value from the @material/web package (legacy "-space" token naming)
 *   local              local adaptation / proposal, NOT Material-verified
 */
import data from '../material/material-spacing.json';
import {compoundsOf, parseRules, readDecl} from '../color-source';

export const M3 = data;
export type Basis = 'official-system' | 'official-layout' | 'material-web' | 'local';
export const BASIS_LABEL: Record<Basis, string> = {
  'official-system': 'Official M3 system token',
  'official-layout': 'Official M3 layout guidance',
  'material-web': 'Material Web component value',
  local: 'Local adaptation (not Material-verified)',
};

/* ------------------------------------------------------------ window classes */

export type WindowClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extraLarge';
export const CLASSES: WindowClass[] = ['compact', 'medium', 'expanded', 'large', 'extraLarge'];
export const CLASS_LABEL: Record<WindowClass, string> = {compact: 'Compact', medium: 'Medium', expanded: 'Expanded', large: 'Large', extraLarge: 'Extra-large'};
export const BREAKPOINTS = data.breakpoints as Record<WindowClass, {min: number; max: number | null}>;
export function classOf(width: number): WindowClass {
  return [...CLASSES].reverse().find(c => width >= BREAKPOINTS[c].min) ?? 'compact';
}
/** One representative frame width per class, plus 320 for WCAG reflow. */
export const FRAME_WIDTHS = [320, 480, 720, 1024, 1400, 1700];

/* ----------------------------------------------------------------- primitives */

export type Unit = 'px' | 'rem';
export const UNIT_OPTIONS: Record<Unit, {name: string; summary: string}> = {
  px: {name: 'Option P · px (fixed)', summary: 'Matches Material’s statement that spacing is preserved when text scales to 200%: spacing stays the same while text grows.'},
  rem: {name: 'Option R · rem (scales with text)', summary: 'Matches the existing rem-based code. Spacing grows with the user’s font-size setting, so a 200% text size doubles spacing.'},
};
export const fmt = (dp: number, unit: Unit) => (unit === 'px' ? `${dp}px` : `${dp / 16}rem`);

/** The 11 values named in the brief, by dp. Asserted to be official steps. */
export const BRIEF_VALUES = [0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64];
const USAGE: Record<number, string> = {
  0: 'Reset; flush edges', 2: 'Hairline offsets', 4: 'Tight icon or badge nudges', 6: 'Nested unit (available, not adopted)', 8: 'Icon–label gap, component gap, menu padding',
  10: 'Nested unit (available, not adopted)', 12: 'Dense list-item padding', 14: 'Nested unit (available, not adopted)', 16: 'Input padding, chip padding, compact page margin',
  20: 'Available, not adopted', 24: 'Button padding, page margin, dialog padding', 32: 'Chip height, inner section gap', 36: 'Available, not adopted', 40: 'Button height, large gaps',
  48: 'Section spacing, touch target', 56: 'Available, not adopted', 64: 'Large section spacing', 72: 'Available, not adopted',
};
export type Primitive = {name: string; official: string; dp: number; adopted: boolean; usage: string};
export const PRIMITIVES: Primitive[] = data.scale.map(s => ({
  name: `space-${s.token.slice(5)}`, official: `md.sys.measurement.${s.token}`, dp: s.dp, adopted: BRIEF_VALUES.includes(s.dp), usage: USAGE[s.dp] ?? 'Available, not adopted',
}));
export const primitiveByName = (name: string) => {
  const p = PRIMITIVES.find(x => x.name === name);
  if (!p) throw new Error(`Unknown primitive ${name}`);
  return p;
};
/** Primitive whose value equals dp; throws if the value is not on the official scale. */
export const primitiveFor = (dp: number) => {
  const p = PRIMITIVES.find(x => x.dp === dp);
  if (!p) throw new Error(`${dp}dp is not an official Material step`);
  return p;
};
export const nearest = (px: number) => PRIMITIVES.reduce((a, b) => (Math.abs(b.dp - px) < Math.abs(a.dp - px) ? b : a));

/* ------------------------------------------------------------------- semantic */

export type PerClass = Record<WindowClass, string>;
const all = (name: string): PerClass => ({compact: name, medium: name, expanded: name, large: name, extraLarge: name});
const split = (compact: string, rest: string): PerClass => ({compact, medium: rest, expanded: rest, large: rest, extraLarge: rest});
const layoutPrimitive = (key: 'margin' | 'spacer'): PerClass => {
  const out = {} as PerClass;
  for (const c of CLASSES) {
    const v = (data.layout as Record<string, {margin: number; spacer?: number}>)[c][key];
    out[c] = v === undefined ? '' : primitiveFor(v).name;
  }
  return out;
};

export type SemanticToken = {name: string; purpose: string; group: string; role: string; values: PerClass; basis: Basis; note?: string};
const marginP = layoutPrimitive('margin');
const spacerP = layoutPrimitive('spacer');
export const SEMANTIC: SemanticToken[] = [
  {name: 'spacing-page', purpose: 'page-margin', group: 'Page gutters', role: 'Leading/trailing page margin (window edge to content).', values: marginP, basis: 'official-layout',
    note: 'Numbers are Material’s (16dp compact, 24dp otherwise). Mapped to primitives locally. Brief examples spacing-page-compact / -expanded are modes of this one token.'},
  {name: 'spacing-gutter', purpose: 'pane-gutter', group: 'Layout', role: 'Space between panes / columns.', values: {...spacerP, compact: 'space-200'}, basis: 'official-layout',
    note: 'Material gives spacers only for multi-pane classes (24dp). The compact value is a local proposal (single pane in Material).'},
  {name: 'spacing-grid-gap', purpose: 'grid-gap', group: 'Layout', role: 'Gap between cards in a grid.', values: split('space-200', 'space-300'), basis: 'local'},
  {name: 'spacing-section', purpose: 'section-gap', group: 'Layout', role: 'Vertical space between page sections.', values: split('space-600', 'space-800'), basis: 'local'},
  {name: 'spacing-content', purpose: 'container-padding', group: 'Content padding', role: 'Padding inside cards and panels.', values: split('space-200', 'space-300'), basis: 'local'},
  {name: 'spacing-stack', purpose: 'stack-gap', group: 'Content padding', role: 'Vertical gap between stacked blocks inside a container.', values: all('space-200'), basis: 'local'},
  {name: 'spacing-component-gap', purpose: 'inline-gap', group: 'Component gaps', role: 'Gap between sibling elements in a component (icon–label, dialog gap).', values: all(primitiveFor(data.components['assist-chip']['icon-label-space'] as number).name), basis: 'material-web'},
  {name: 'spacing-field-group', purpose: 'field-group', group: 'Form groups', role: 'Vertical space between form fields.', values: all('space-300'), basis: 'local', note: 'Needs approval; existing contact form uses 21.6px (1.35rem).'},
  {name: 'spacing-field-label', purpose: 'label-gap', group: 'Form groups', role: 'Space between a label and its input.', values: all(primitiveFor(data.components['filled-text-field']['with-label-top-space'] as number).name), basis: 'material-web'},
  {name: 'spacing-nav-gap', purpose: 'nav-gap', group: 'Navigation', role: 'Gap between navigation items.', values: all('space-100'), basis: 'local'},
  {name: 'spacing-nav-item-y', purpose: 'nav-item-padding', group: 'Navigation', role: 'Vertical padding of a navigation item.', values: all(primitiveFor(data.components['list-item']['top-space'] as number).name), basis: 'material-web'},
  {name: 'spacing-touch-target', purpose: 'min-target', group: 'Layout', role: 'Minimum interactive target (height/width).', values: all(primitiveFor(data.touchTarget).name), basis: 'material-web',
    note: 'Material Web touch target is 48. WCAG 2.2: 24 (AA, 2.5.8) and 44 (AAA, 2.5.5).'},
];

/* ------------------------------------------------------------------ component */

export type ComponentToken = {name: string; component: string; role: string; primitive: string; basis: Basis; source?: string};
const mw = (file: keyof typeof data.components, key: string) => {
  const v = (data.components[file] as Record<string, number | null>)[key];
  if (v === null || v === undefined) throw new Error(`Material Web ${file}.${key} missing`);
  return {primitive: primitiveFor(v).name, source: `@material/web · ${file} · ${key} = ${v}px`};
};
export const COMPONENT: ComponentToken[] = [
  {name: 'button-padding-x', component: 'Button', role: 'Leading/trailing padding', basis: 'material-web', ...mw('filled-button', 'leading-space')},
  {name: 'button-padding-x-icon', component: 'Button', role: 'Padding on the icon side', basis: 'material-web', ...mw('filled-button', 'with-leading-icon-leading-space')},
  {name: 'button-height', component: 'Button', role: 'Container height', basis: 'material-web', ...mw('filled-button', 'container-height')},
  {name: 'chip-padding-x', component: 'Chip', role: 'Leading/trailing padding', basis: 'material-web', ...mw('assist-chip', 'leading-space')},
  {name: 'chip-height', component: 'Chip', role: 'Container height', basis: 'material-web', ...mw('assist-chip', 'container-height')},
  {name: 'input-padding-x', component: 'Input', role: 'Leading/trailing padding', basis: 'material-web', ...mw('outlined-text-field', 'leading-space')},
  {name: 'input-padding-y', component: 'Input', role: 'Top/bottom padding', basis: 'material-web', ...mw('outlined-text-field', 'top-space')},
  {name: 'input-gap-icon', component: 'Input', role: 'Icon to input text', basis: 'material-web', ...mw('outlined-text-field', 'icon-input-space')},
  {name: 'card-padding', component: 'Card', role: 'Container padding (alias of spacing-content)', basis: 'local', primitive: 'spacing-content'},
  {name: 'card-gap', component: 'Card', role: 'Gap between card parts (alias of spacing-stack)', basis: 'local', primitive: 'spacing-stack'},
  {name: 'dialog-padding', component: 'Dialog', role: 'Content padding', basis: 'material-web', primitive: primitiveFor(Number(data.dialog.contentPadding.replace('px', ''))).name, source: `@material/web · dialog · padding ${data.dialog.contentPadding}`},
  {name: 'dialog-actions-padding', component: 'Dialog', role: 'Actions padding (top / sides / bottom)', basis: 'material-web', primitive: 'space-200 space-300 space-300', source: `@material/web · dialog · padding ${data.dialog.actionsPadding}`},
  {name: 'dialog-gap', component: 'Dialog', role: 'Gap between header parts and actions', basis: 'material-web', primitive: primitiveFor(data.dialog.gap).name, source: `@material/web · dialog · gap ${data.dialog.gap}px`},
  {name: 'menu-padding-y', component: 'Menu / list', role: 'Menu top/bottom padding', basis: 'material-web', ...mw('menu', 'top-space')},
  {name: 'nav-item-padding-x', component: 'Navigation', role: 'Horizontal padding of a navigation item', basis: 'local', primitive: 'space-200'},
];

/** Resolve a name that may be a primitive, a semantic token, or a multi-value primitive list, to dp for a window class. */
export function dpFor(ref: string, cls: WindowClass): number {
  if (ref.includes(' ')) return dpFor(ref.split(' ')[0], cls);
  const comp = COMPONENT.find(c => c.name === ref);
  if (comp) return dpFor(comp.primitive, cls);
  const sem = SEMANTIC.find(s => s.name === ref);
  return primitiveByName(sem ? sem.values[cls] : ref).dp;
}

/** Duplicate-purpose check: no two semantic tokens may share a purpose; no two component tokens a (component, role). */
export function duplicates() {
  const seen = new Map<string, string>();
  const dup: string[] = [];
  for (const s of SEMANTIC) { if (seen.has(s.purpose)) dup.push(`${s.name} ~ ${seen.get(s.purpose)}`); else seen.set(s.purpose, s.name); }
  const seenC = new Map<string, string>();
  for (const c of COMPONENT) { const k = `${c.component}|${c.role}`; if (seenC.has(k)) dup.push(`${c.name} ~ ${seenC.get(k)}`); else seenC.set(k, c.name); }
  return dup;
}

/** Inject all tokens as --pqx-* custom properties for a window class and unit. */
export function spacingVars(cls: WindowClass, unit: Unit): Record<string, string> {
  const v: Record<string, string> = {};
  for (const p of PRIMITIVES) v[`--pqx-${p.name}`] = fmt(p.dp, unit);
  for (const s of SEMANTIC) v[`--pqx-${s.name}`] = fmt(primitiveByName(s.values[cls]).dp, unit);
  for (const c of COMPONENT) if (!c.primitive.includes(' ')) v[`--pqx-${c.name}`] = fmt(dpFor(c.primitive, cls), unit);
  v['--pqx-dialog-actions-top'] = fmt(16, unit); // from dialog.actionsPadding "16px 24px 24px"
  return v;
}
export const GRID_COLUMNS: Record<WindowClass, number> = {compact: 1, medium: 2, expanded: 3, large: 3, extraLarge: 4};

/* ---------------------------------------------------------- existing census */

export type Existing = {id: string; group: string; label: string; file: string; selector: string; prop: string; proposed: string; exception?: string};
export const EXISTING_LIVE: Existing[] = [
  {id: 'btn-site', group: 'Button', label: 'Site action link', file: 'app/globals.css', selector: '.action-link', prop: 'padding', proposed: 'button-padding-x 24 · height 40'},
  {id: 'btn-adv', group: 'Button', label: 'Adventure button', file: 'app/world/adventure.css', selector: '.adventure .btn', prop: 'padding', proposed: 'button-padding-x 24 · height 40', exception: 'Adventure / Arcade'},
  {id: 'chip-toolbar', group: 'Chip', label: 'Landing toolbar chip', file: 'app/landing.css', selector: '.landing-toolbar a', prop: 'padding', proposed: 'chip-padding-x 16 · height 32'},
  {id: 'chip-tag', group: 'Chip', label: 'Landing card tag', file: 'app/landing.css', selector: '.landing-card-tag', prop: 'padding', proposed: 'chip-padding-x 16 · height 32'},
  {id: 'chip-work', group: 'Chip', label: 'Work card tag', file: 'app/work/work.css', selector: '.work-card-tags li', prop: 'padding', proposed: 'chip-padding-x 16 · height 32'},
  {id: 'input-contact', group: 'Input', label: 'Contact form field', file: 'app/contact/contact.css', selector: '.contact-form :is(input,select,textarea)', prop: 'padding', proposed: 'input-padding 16 / 16'},
  {id: 'input-guide', group: 'Input', label: 'Guide input', file: 'app/entrance.css', selector: '.guide-input-row input', prop: 'padding', proposed: 'input-padding 16 / 16'},
  {id: 'card-landing', group: 'Card', label: 'Landing card', file: 'app/landing.css', selector: '.landing-card', prop: 'padding', proposed: 'card-padding 16 / 24', exception: 'Hero / editorial composition'},
  {id: 'card-path', group: 'Card', label: 'Path card', file: 'app/globals.css', selector: '.path-card', prop: 'padding', proposed: 'card-padding 16 / 24'},
  {id: 'dialog-guide', group: 'Dialog', label: 'Guide dialog', file: 'app/entrance.css', selector: '.guide-dialog', prop: 'padding', proposed: 'dialog-padding 24', exception: 'Entrance composition'},
  {id: 'menu-compact', group: 'Dialog', label: 'Compact menu', file: 'app/site-navigation.css', selector: '.compact-menu', prop: 'padding', proposed: 'menu-padding-y 8'},
  {id: 'nav-gap', group: 'Navigation', label: 'Site nav list gap', file: 'app/globals.css', selector: '.site-nav ul', prop: 'gap', proposed: 'spacing-nav-gap 8'},
  {id: 'nav-mode', group: 'Navigation', label: 'Mode bar gap', file: 'app/globals.css', selector: '.mode-bar-inner', prop: 'gap', proposed: 'spacing-nav-gap 8'},
  {id: 'nav-compact', group: 'Navigation', label: 'Compact header nav gap', file: 'app/site-navigation.css', selector: '.compact-header nav', prop: 'gap', proposed: 'spacing-nav-gap 8'},
  {id: 'page-hero', group: 'Page', label: 'Home hero padding', file: 'app/globals.css', selector: '.home-hero', prop: 'padding', proposed: 'spacing-page', exception: 'Hero / editorial composition'},
  {id: 'page-section', group: 'Page', label: 'Destinations section', file: 'app/globals.css', selector: '.destinations-section', prop: 'padding-block', proposed: 'spacing-section'},
  {id: 'page-footer', group: 'Page', label: 'Site footer', file: 'app/globals.css', selector: '.site-footer', prop: 'padding-block', proposed: 'spacing-section'},
];

export const TOKENS_CROSSWALK = [...Array.from({length: 9}, (_, i) => `--temp-space-${i + 1}`), '--temp-page-gutter', '--landing-gutter', '--temp-content-width', '--temp-reading-width', '--temp-touch-target', '--temp-focus-width', '--temp-focus-offset'];

const REM = 16;
export type Px = {px: number | null; dynamic?: string};
/** Convert one CSS length (resolving var() against live tokens) to px. */
export function toPx(part: string, depth = 0): Px {
  const v = part.trim();
  if (/^-?0(\.0+)?$/.test(v)) return {px: 0};
  let m = /^(-?[\d.]+)px$/.exec(v); if (m) return {px: Math.abs(Number(m[1]))};
  m = /^(-?[\d.]+)rem$/.exec(v); if (m) return {px: Math.abs(Number(m[1])) * REM};
  m = /^var\((--[\w-]+)\)$/.exec(v);
  if (m && depth < 3) {
    const d = readDecl('tokens', ':root', m[1]);
    return d ? toPx(d.value, depth + 1) : {px: null, dynamic: v};
  }
  return {px: null, dynamic: v};
}
export function splitValue(value: string): string[] {
  const out: string[] = []; let depth = 0; let cur = '';
  for (const ch of value) {
    if (ch === '(') depth++; if (ch === ')') depth--;
    if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
export const measureValue = (value: string) => splitValue(value).map(p => ({part: p, ...toPx(p)}));

/* ---- path-based exception classes (from the brief's preserve list; proposed, need approval) ---- */
export function exceptionFor(path: string): string | null {
  if (/^app\/world\/|^components\/adventure\//.test(path)) return 'Adventure / Island / Arcade';
  if (/^app\/quest-preview\/|^components\/quest-preview\//.test(path)) return 'Game world / scenes';
  if (/^components\/work\/templates\/|^app\/work\/\[slug\]\//.test(path)) return 'D0–D6 case-study templates';
  if (/^app\/landing\.css$|^app\/entrance\.css$|^app\/portfolio\//.test(path)) return 'Hero / editorial / entrance composition';
  return null;
}

const rawCss = import.meta.glob(['../../../app/**/*.css', '../../../components/**/*.css', '!../../../app/design-audit/**', '!../../../app/quest-preview/scene-review/**'], {query: '?raw', import: 'default'}) as Record<string, () => Promise<string>>;

export type FileCensus = {file: string; exception: string | null; official: number; offScale: number; dynamic: number};
export type Curated = {item: Existing; value: string | null; line: number | null; measured: {part: string; px: number | null; dynamic?: string}[]};
export type Census = {curated: Curated[]; files: FileCensus[]; off: {px: number; count: number; nearest: Primitive}[]; totals: {official: number; offScale: number; dynamic: number}; breakpoints: {px: number; count: number; cls: WindowClass; boundary: boolean}[]};
const SPACING_PROP = /^(padding|margin|gap|row-gap|column-gap)(-(block|inline)(-(start|end))?|-(top|right|bottom|left))?$/;

export async function runCensus(): Promise<Census> {
  const files = new Map<string, FileCensus>();
  const off = new Map<number, number>();
  const bp = new Map<number, number>();
  const curated: Curated[] = EXISTING_LIVE.map(item => ({item, value: null, line: null, measured: []}));
  const official = new Set(PRIMITIVES.map(p => p.dp));
  for (const [key, load] of Object.entries(rawCss)) {
    const file = key.replace('../../../', '');
    const css = await load();
    const rec: FileCensus = {file, exception: exceptionFor(file), official: 0, offScale: 0, dynamic: 0};
    for (const rule of parseRules('tokens', css)) {
      for (const c of curated) {
        if (c.item.file !== file || c.value !== null) continue;
        if (!compoundsOf(rule.selector).some(x => x.part === c.item.selector)) continue;
        const decl = rule.decls.find(x => x.name === c.item.prop);
        if (decl) { c.value = decl.value; c.line = rule.line; c.measured = measureValue(decl.value); }
      }
      for (const d of rule.decls) {
        if (!SPACING_PROP.test(d.name)) continue;
        for (const part of splitValue(d.value)) {
          if (part === 'auto' || part === 'inherit' || part === '0') continue;
          const r = toPx(part);
          if (r.px === null) { rec.dynamic++; continue; }
          if (r.px === 0) continue;
          const rounded = Math.round(r.px * 100) / 100;
          if (official.has(rounded)) rec.official++; else { rec.offScale++; off.set(rounded, (off.get(rounded) ?? 0) + 1); }
        }
      }
    }
    for (const m of css.matchAll(/\((?:min|max)-width:\s*([\d.]+)(px|rem|em)\)/g)) {
      const px = Math.round(Number(m[1]) * (m[2] === 'px' ? 1 : REM));
      bp.set(px, (bp.get(px) ?? 0) + 1);
    }
    if (rec.official + rec.offScale + rec.dynamic > 0) files.set(file, rec);
  }
  const list = [...files.values()].sort((a, b) => b.official + b.offScale + b.dynamic - (a.official + a.offScale + a.dynamic));
  const starts = new Set<number>(); for (const c of CLASSES) { starts.add(BREAKPOINTS[c].min); starts.add(BREAKPOINTS[c].min - 1); }
  return {
    curated,
    files: list,
    off: [...off.entries()].map(([px, count]) => ({px, count, nearest: nearest(px)})).sort((a, b) => b.count - a.count),
    totals: list.reduce((t, f) => ({official: t.official + f.official, offScale: t.offScale + f.offScale, dynamic: t.dynamic + f.dynamic}), {official: 0, offScale: 0, dynamic: 0}),
    breakpoints: [...bp.entries()].map(([px, count]) => ({px, count, cls: classOf(px), boundary: starts.has(px)})).sort((a, b) => a.px - b.px),
  };
}
