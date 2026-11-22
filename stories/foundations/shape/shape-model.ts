/**
 * Shape & Corners — proposal model (NOT production).
 *
 * Corner values come ONLY from ../material/material-shape.json (generated; the nine numeric steps are cross-checked against the
 * rendered m3.material.io page, `full` and the asymmetric tokens are package-only). Everything about today's site is read live from
 * production CSS (shape-census.ts). Hand-written data here = token names, which primitive each component decision points at, and
 * the two named options.
 *
 *   Option M · Material (OWNER DECISION):  follows Material component shapes (chip small 8, outlined input extra-small 4, menu extra-small 4).
 *   Option C · Current direction (NOT ADOPTED, kept as the comparison): keeps the pill chips and 8px fields already shown in the committed Colors specimens.
 * Buttons are pill-shaped (full) in BOTH, per the brief. Cards, panels, navigation and creative themes are preserved, never mapped.
 */
import data from '../material/material-shape.json';
import spacing from '../material/material-spacing.json';
import carbonCss from '../carbon/carbon.css?raw';
import iconsCss from '../icons/icons.css?raw';
import motionCss from '../motion/motion.css?raw';
import {walkCss} from '../motion/motion-census';
import {parseRaw, type Corner} from './shape-census';

export const M3 = data;
export const BREAKPOINTS = spacing.breakpoints;

/* ------------------------------------------------------------- primitives */

export type PrimKey = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'lg-inc' | 'xl' | 'xl-inc' | 'xxl' | 'full';
const KEY: Record<string, PrimKey> = {none: 'none', 'extra-small': 'xs', small: 'sm', medium: 'md', large: 'lg', 'large-increased': 'lg-inc', 'extra-large': 'xl', 'extra-large-increased': 'xl-inc', 'extra-extra-large': 'xxl', full: 'full'};
export type Primitive = {key: PrimKey; token: string; name: string; px: number; pageVerified: boolean; note?: string; local: string};
export const PRIMITIVES: Primitive[] = M3.scale.map(s => ({key: KEY[s.name], token: s.token, name: s.name, px: s.px, pageVerified: !!(s as {pageVerified?: boolean}).pageVerified, note: (s as {note?: string}).note, local: `shape-corner-${KEY[s.name]}`}));
export const primitive = (k: PrimKey) => PRIMITIVES.find(p => p.key === k)!;
export const px = (k: PrimKey) => primitive(k).px;
export type Asym = {name: string; token: string; local: string; corners: {tl: number; tr: number; br: number; bl: number}};
export const ASYMMETRIC: Asym[] = M3.asymmetric.map(a => ({name: a.name, token: a.token, local: `shape-corner-${a.name.replace('extra-small', 'xs').replace('extra-large', 'xl').replace('large', 'lg')}`, corners: a.corners}));
export const asym = (name: string) => ASYMMETRIC.find(a => a.name === name)!;
export const cssCorners = (c: {tl: number; tr: number; br: number; bl: number}) => `${c.tl}px ${c.tr}px ${c.br}px ${c.bl}px`;
export const SCALE_STEPS = PRIMITIVES.filter(p => p.key !== 'full');

/** Nearest scale step for an arbitrary px value; `full` is excluded (a pill is its own case). `tie` is set when two steps are equally near. */
export function nearestStep(v: number): {step: Primitive; delta: number; onScale: boolean; tie: Primitive | null} {
  const best = Math.min(...SCALE_STEPS.map(p => Math.abs(p.px - v)));
  const near = SCALE_STEPS.filter(p => Math.abs(Math.abs(p.px - v) - best) < 1e-9);
  const step = near[near.length - 1];
  return {step, delta: step.px - v, onScale: step.px === v, tie: near.length > 1 ? near[0] : null};
}
export const fmtNearest = (n: ReturnType<typeof nearestStep>) =>
  n.onScale ? `${n.step.name} ${n.step.px}px (on scale)` : n.tie ? `${n.tie.name} ${n.tie.px}px or ${n.step.name} ${n.step.px}px (equidistant)` : `${n.step.name} ${n.step.px}px (${n.delta > 0 ? '+' : ''}${Math.round(n.delta * 100) / 100}px)`;

/* -------------------------------------------------- component decisions */

export type Option = 'M' | 'C';
export const OPTIONS: Record<Option, {name: string; summary: string}> = {
  M: {name: 'Option M · Material shapes (owner decision)', summary: 'Chips use Material’s small (8px) and outlined inputs extra-small (4px); menus extra-small (4px). Buttons stay pill-shaped.'},
  C: {name: 'Option C · Current direction (not adopted)', summary: 'Keeps the pill chips and 8px fields already shown in the committed Colors, Icons and Motion specimens. Buttons stay pill-shaped.'},
};
export type Shape = PrimKey | `asym:${string}` | `literal:${number}`;
export type Decision = {id: string; label: string; m: Shape; c: Shape; official: string; basis: 'official' | 'package-literal' | 'local'; note: string};
/** Component shape decisions. `official` cites the @material/web component token each Material value comes from. */
export const DECISIONS: Decision[] = [
  {id: 'button', label: 'Button (filled, outlined, tonal, text)', m: 'full', c: 'full', official: 'button.container-shape-round', basis: 'official', note: 'Brief: every standard button stays pill-shaped. Material ships round (full) and square (medium) shapes; round is used.'},
  {id: 'icon-button', label: 'Icon button', m: 'full', c: 'full', official: 'icon-button (round)', basis: 'local', note: 'Follows the pill rule for buttons.'},
  {id: 'chip', label: 'Chip (filter, assist, input, suggestion)', m: 'sm', c: 'full', official: 'filter-chip.container-shape', basis: 'official', note: 'Material chips are small (8px). Production chips are pills today, so Option M is a visible change.'},
  {id: 'input-outlined', label: 'Text field (outlined)', m: 'xs', c: 'sm', official: 'outlined-text-field.container-shape', basis: 'official', note: 'Material outlined fields are extra-small (4px). The committed Colors and Icons specimens use 8px.'},
  {id: 'input-filled', label: 'Text field (filled)', m: 'asym:extra-small-top', c: 'asym:extra-small-top', official: 'filled-text-field.container-shape', basis: 'official', note: 'Top corners only (an asymmetric Material token).'},
  {id: 'menu', label: 'Menu / dropdown', m: 'xs', c: 'sm', official: 'menu.container-shape', basis: 'official', note: 'Baseline md-menu is extra-small (4px). The expressive `menus` tokens are 16px / 8px groups (see Tokens).'},
  {id: 'dialog', label: 'Dialog', m: 'xl', c: 'xl', official: 'dialog.container-shape', basis: 'official', note: 'Extra-large (28px). The committed dialog specimens already use 1.75rem (28px).'},
  {id: 'sheet', label: 'Bottom sheet', m: 'asym:extra-large-top', c: 'asym:extra-large-top', official: 'sheet-bottom.docked-container-shape', basis: 'official', note: 'Top corners only.'},
  {id: 'fab', label: 'Floating action button', m: 'lg', c: 'lg', official: 'fab.container-shape', basis: 'official', note: 'Large (16px).'},
  {id: 'tooltip', label: 'Tooltip (plain)', m: 'xs', c: 'xs', official: 'plain-tooltip.container-shape', basis: 'official', note: 'Extra-small.'},
  {id: 'snackbar', label: 'Snackbar', m: 'xs', c: 'xs', official: 'snackbar.container-shape', basis: 'official', note: 'Extra-small.'},
  {id: 'search-bar', label: 'Search bar', m: 'full', c: 'full', official: 'search-bar.container-shape', basis: 'official', note: 'Pill.'},
  {id: 'segmented', label: 'Segmented button', m: 'full', c: 'full', official: 'outlined-segmented-button.shape', basis: 'official', note: 'Pill.'},
  {id: 'badge', label: 'Badge / status tag', m: 'full', c: 'full', official: 'badge.shape', basis: 'official', note: 'Pill.'},
  {id: 'checkbox', label: 'Checkbox', m: 'literal:2', c: 'literal:2', official: 'checkbox.container-shape', basis: 'package-literal', note: '2px is a literal in the package, not a step on the ten-step scale.'},
  {id: 'switch', label: 'Switch track', m: 'full', c: 'full', official: 'switch.track-shape', basis: 'official', note: 'Pill.'},
];
export const decision = (id: string) => DECISIONS.find(d => d.id === id)!;
export function resolve(s: Shape): {css: string; label: string; prim: string} {
  if (s.startsWith('asym:')) { const a = asym(s.slice(5)); return {css: cssCorners(a.corners), label: `${a.corners.tl}px ${a.corners.tr}px ${a.corners.br}px ${a.corners.bl}px`, prim: a.name}; }
  if (s.startsWith('literal:')) { const v = Number(s.slice(8)); return {css: `${v}px`, label: `${v}px`, prim: 'literal'}; }
  const p = primitive(s as PrimKey);
  return {css: `${p.px}px`, label: p.key === 'full' ? 'full (9999px)' : `${p.px}px`, prim: p.name};
}
export const shapeFor = (id: string, o: Option) => resolve(o === 'M' ? decision(id).m : decision(id).c);
export const radiusVars = (o: Option): Record<string, string> => Object.fromEntries(DECISIONS.map(d => [`--pqr-${d.id}`, shapeFor(d.id, o).css]));
/** Distinct scale primitives a set of decisions uses (the "not one universal radius" check). */
export const distinctPrimitives = (o: Option) => new Set(DECISIONS.map(d => shapeFor(d.id, o).prim));

/* ------------------------------------------------------- window classes */

export const FRAMES = [{key: 'mobile', label: 'Mobile', cls: 'Compact', width: 360}, {key: 'tablet', label: 'Tablet', cls: 'Medium', width: 720}, {key: 'desktop', label: 'Desktop', cls: 'Large', width: 1280}] as const;
export const classRange = (k: 'mobile' | 'tablet' | 'desktop') => (k === 'mobile' ? BREAKPOINTS.compact : k === 'tablet' ? BREAKPOINTS.medium : BREAKPOINTS.large);
export const FULLSCREEN = resolve('none');

/* ------------------------------------------------ existing vs proposed */

export type Existing = {role: string; label: string; file: string; selector: string; comp: string | null; kind: 'standard' | 'preserved'; note?: string};
/** Evidence-backed selectors. `comp: null` = preserved (documented, never mapped). Anything not listed is "requires review". */
export const EXISTING: Existing[] = [
  {role: 'Button', label: 'Action link (global)', file: 'app/globals.css', selector: '.action-link', comp: 'button', kind: 'standard'},
  {role: 'Button', label: 'Motion toggle / landing toolbar link', file: 'app/landing.css', selector: '.motion-toggle', comp: 'button', kind: 'standard', note: 'Shares a rule with the hero action link: hero composition, owner decision.'},
  {role: 'Button', label: 'Ghost button (work)', file: 'app/work/work.css', selector: '.work-ghost', comp: 'button', kind: 'standard'},
  {role: 'Button', label: 'Solid clear button (work)', file: 'app/work/work.css', selector: '.work-clear--solid', comp: 'button', kind: 'standard'},
  {role: 'Button', label: 'Tidy button (work)', file: 'app/work/work.css', selector: '.work-tidy', comp: 'button', kind: 'standard'},
  {role: 'Button', label: 'World-page action link', file: 'app/globals.css', selector: '.world-page .action-link', comp: 'button', kind: 'standard'},
  {role: 'Chip', label: 'Work filter chip', file: 'app/work/work.css', selector: '.work-chip', comp: 'chip', kind: 'standard'},
  {role: 'Chip', label: 'Work tag chip', file: 'app/work/work.css', selector: '.work-tag-chip', comp: 'chip', kind: 'standard'},
  {role: 'Chip', label: 'Concept Lab filter', file: 'app/concepts/concepts.css', selector: '.lab-filters button', comp: 'chip', kind: 'standard'},
  {role: 'Segmented', label: 'Work segmented control', file: 'app/work/work.css', selector: '.work-seg', comp: 'segmented', kind: 'standard'},
  {role: 'Badge', label: 'Work badge', file: 'app/work/work.css', selector: '.work-badge', comp: 'badge', kind: 'standard'},
  {role: 'Input', label: 'Work search field', file: 'app/work/work.css', selector: '.work-search input', comp: 'input-outlined', kind: 'standard'},
  {role: 'Input', label: 'Work select', file: 'app/work/work.css', selector: '.work-select select', comp: 'input-outlined', kind: 'standard'},
  {role: 'Input', label: 'Contact form fields', file: 'app/contact/contact.css', selector: '.contact-form :is(input,select,textarea)', comp: 'input-outlined', kind: 'standard'},
  {role: 'Input', label: 'Custom dropdown trigger', file: 'components/ui/dropdown.css', selector: '.custom-dropdown .custom-dropdown-trigger', comp: 'input-outlined', kind: 'standard'},
  {role: 'Menu', label: 'Custom dropdown options', file: 'components/ui/dropdown.css', selector: '.custom-dropdown-options', comp: 'menu', kind: 'standard'},
  {role: 'Menu', label: 'Custom dropdown option', file: 'components/ui/dropdown.css', selector: '.custom-dropdown-option', comp: 'menu', kind: 'standard', note: 'An item inside the menu, not the menu container.'},
  {role: 'Card', label: 'Landing card', file: 'app/landing.css', selector: '.landing-card', comp: null, kind: 'preserved'},
  {role: 'Card', label: 'Work card', file: 'app/work/work.css', selector: '.work-card', comp: null, kind: 'preserved'},
  {role: 'Panel', label: 'Path card', file: 'app/globals.css', selector: '.path-card', comp: null, kind: 'preserved'},
  {role: 'Panel', label: 'World preview panel', file: 'app/globals.css', selector: '.world-preview', comp: null, kind: 'preserved'},
  {role: 'Panel', label: 'World page container', file: 'app/globals.css', selector: '.world-page', comp: null, kind: 'preserved', note: '1.75rem = 28px, which coincides with Material extra-large.'},
  {role: 'Navigation', label: 'Site navigation link', file: 'app/globals.css', selector: '.site-nav a', comp: null, kind: 'preserved'},
  {role: 'Dialog (creative)', label: 'Guide dialog close button', file: 'app/entrance.css', selector: '.guide-dialog .guide-close', comp: null, kind: 'preserved'},
];

/* committed Storybook specimens that already show shapes (read live; never edited) */
export type Committed = {section: string; file: string; selector: string; comp: string; css: string};
const COMMITTED_DEFS = [
  ['Colors', carbonCss, 'carbon/carbon.css', '.pqc-btn', 'button'], ['Colors', carbonCss, 'carbon/carbon.css', '.pqc-chip', 'chip'], ['Colors', carbonCss, 'carbon/carbon.css', '.pqc-input', 'input-outlined'],
  ['Icons', iconsCss, 'icons/icons.css', '.pqi-sbtn', 'button'], ['Icons', iconsCss, 'icons/icons.css', '.pqi-chip', 'chip'], ['Icons', iconsCss, 'icons/icons.css', '.pqi-field', 'input-outlined'], ['Icons', iconsCss, 'icons/icons.css', '.pqi-dialog', 'dialog'],
  ['Motion', motionCss, 'motion/motion.css', '.pqm-sbtn', 'button'], ['Motion', motionCss, 'motion/motion.css', '.pqm-chip', 'chip'], ['Motion', motionCss, 'motion/motion.css', '.pqm-menu', 'menu'], ['Motion', motionCss, 'motion/motion.css', '.pqm-dialog[data-kind="dialog"]', 'dialog'],
] as const;
export function committedSpecimens(): Committed[] {
  return COMMITTED_DEFS.flatMap(([section, css, file, selector, comp]) => {
    const hits = walkCss(css).blocks.filter(b => b.selector.split(',').some(s => s.trim() === selector));
    for (const b of [...hits].reverse()) { const d = b.decls.find(x => x.name === 'border-radius'); if (d) return [{section, file: `stories/foundations/${file}`, selector, comp, css: d.value}]; }
    return [];
  });
}
export const px16 = (c: Corner[]) => Math.max(...c.map(x => x.px ?? 0));
export const committedPx = (c: Committed) => { const k = parseRaw(c.css); return k.every(x => x.kind === 'pill') ? Infinity : px16(k); };
