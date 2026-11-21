/**
 * Icons — proposal model (NOT production).
 *
 * Glyph data comes only from ./icons.json (generated from Google's Material Symbols Rounded; see generate-icons.mjs).
 * Everything about today's site is read from production TSX/CSS (icons-census.ts). Hand-written data here = size tokens,
 * semantic color names, which icons demonstrate which pattern, and the snippet generator. Sizes are LOCAL proposals.
 *
 * Naming: the UI says "Rounded · FILL 0 (outline)" and "Rounded · FILL 1 (filled)". "Outline" means the Rounded FAMILY at FILL 0;
 * it is NOT the separate "Material Symbols Outlined" family, which is not used.
 */
import data from './icons.json';
import spacing from '../material/material-spacing.json';
import motion from '../material/material-motion.json';

export const ICON_DATA = data;
export type IconRecord = (typeof data.icons)[number];
export const ICONS: IconRecord[] = data.icons;
export const ICON_NAMES = new Set(ICONS.map(i => i.name));
export const CATALOG = new Set(data.catalog);
export const FAMILY = data.provenance.family;
export const isBundled = (name: string) => ICON_NAMES.has(name);

/* ------------------------------------------------------------------ sizes */

export type SizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SizeDef = {key: SizeKey; label: string; px: number; usage: string; basis: 'local' | 'material-default'};
/** Local proposal. Material's own default is 24 (the font's default opsz); the others are not Material defaults. */
export const SIZES: SizeDef[] = [
  {key: 'xs', label: 'XS', px: 16, usage: 'Inline with body or label text, dense metadata rows, status dots inside chips. Never as the only target.', basis: 'local'},
  {key: 'sm', label: 'S', px: 20, usage: 'Leading and trailing icons inside inputs, chips and compact buttons; list-item accessories.', basis: 'local'},
  {key: 'md', label: 'M', px: 24, usage: 'Default. Buttons, navigation items, icon buttons, dialog and menu actions.', basis: 'material-default'},
  {key: 'lg', label: 'L', px: 32, usage: 'Emphasis in cards, empty states, section headers and feature rows.', basis: 'local'},
  {key: 'xl', label: 'XL', px: 40, usage: 'Hero actions and large empty states. Larger expressive imagery belongs to the 3D illustration set, not to functional icons.', basis: 'local'},
];
export const sizePx = (k: SizeKey) => SIZES.find(s => s.key === k)!.px;
/** Material Symbols optical size axis: documented range 20..48. Below 20 the font cannot optically adjust further. */
export const OPSZ_MIN = 20, OPSZ_MAX = 48;
export const opszFor = (px: number) => Math.min(OPSZ_MAX, Math.max(OPSZ_MIN, px));
export const opszFinding = (px: number) => (px < OPSZ_MIN ? `${px}px is below the font's minimum optical size (${OPSZ_MIN}); it renders with the ${OPSZ_MIN} design scaled down, not a native ${px} design.` : null);
/** Material's README: only the 20 and 24px designs are pixel-grid aligned. */
export const PIXEL_GRID_ALIGNED = [20, 24];

/** Minimum interactive target, independent of the glyph. Material's value, still an unconfirmed default for this project (see Spacing). */
export const TOUCH_TARGET = spacing.touchTarget as number;
export const STATE_MS = motion.durations.find(d => d.token === 'md.sys.motion.duration.short4')!.ms;

/* ----------------------------------------------------------------- colors */

export type ColorDef = {token: string; role: string; ui: boolean; /** graded against this FILL token instead of the surface layers */ on?: string};
/** Semantic Carbon / brand tokens an icon may use. `ui` means it needs 3:1 against its surface when it carries information. */
export const COLORS: ColorDef[] = [
  {token: 'icon-primary', role: 'Default icon color.', ui: true},
  {token: 'icon-secondary', role: 'Supporting or inactive-looking (but still active) icons.', ui: true},
  {token: 'icon-disabled', role: 'Disabled controls. Translucent; WCAG exempts inactive components.', ui: false},
  {token: 'on-interactive-primary', role: 'Icon on the primary action fill (Option A: paper on ink in light, ink on paper in dark). Graded against that fill.', ui: true, on: 'interactive-primary'},
  {token: 'icon-on-color', role: 'Carbon icon-on-color: for saturated support fills (status badges). Graded against the info fill; do not use on the primary button in dark mode.', ui: true, on: 'support-info'},
  {token: 'interactive-primary', role: 'Brand primary action color (Option A: ink / paper).', ui: true},
  {token: 'accent', role: 'Brand accent (orange). Decorative emphasis only until contrast is confirmed.', ui: true},
  {token: 'link', role: 'Link affordance icons (inherits text color today).', ui: true},
  {token: 'support-error', role: 'Error status.', ui: true},
  {token: 'support-warning', role: 'Warning status.', ui: true},
  {token: 'support-success', role: 'Success status.', ui: true},
  {token: 'support-info', role: 'Information status.', ui: true},
];
export const colorVar = (token: string) => `var(--pqc-${token})`;

/* --------------------------------------------------------------- patterns */

export const PAIRS: {name: string; use: string}[] = [
  {name: 'home', use: 'Navigation: home'}, {name: 'search', use: 'Navigation / input'}, {name: 'favorite', use: 'Toggle: like'}, {name: 'bookmark', use: 'Toggle: save'},
  {name: 'notifications', use: 'Navigation'}, {name: 'star', use: 'Toggle: rate'}, {name: 'settings', use: 'Navigation'}, {name: 'person', use: 'Navigation: account'},
  {name: 'explore', use: 'Navigation'}, {name: 'work', use: 'Navigation: portfolio'}, {name: 'lightbulb', use: 'Navigation: concepts'}, {name: 'sports_esports', use: 'Navigation: arcade'},
];

/* -------------------------------------------------------------- snippets */

export type IconProps = {name: string; size?: SizeKey; filled?: boolean; color?: string; label?: string};
/** Snippets are generated from the wrapper's real props. The import path is Storybook-only until migration is approved. */
export function reactSnippet(p: IconProps): string {
  const a = [`name="${p.name}"`];
  if (p.size && p.size !== 'md') a.push(`size="${p.size}"`);
  if (p.filled) a.push('filled');
  if (p.color && p.color !== 'icon-primary') a.push(`color="${p.color}"`);
  if (p.label) a.push(`label="${p.label}"`);
  return `<Icon ${a.join(' ')} />`;
}
export function buttonSnippet(p: {name: string; label: string; selected?: boolean; size?: SizeKey}): string {
  const a = [`icon="${p.name}"`, `label="${p.label}"`];
  if (p.size && p.size !== 'md') a.push(`size="${p.size}"`);
  a.push(p.selected === undefined ? '' : `selected={${p.selected}}`);
  return `<IconButton ${a.filter(Boolean).join(' ')} />`;
}
export const IMPORT_SNIPPET = `// Storybook-only until migration is approved\nimport {Icon, IconButton} from '@/stories/foundations/icons/Icons';`;
export function htmlSnippet(p: IconProps): string {
  const px = sizePx(p.size ?? 'md');
  const fill = p.filled ? 1 : 0;
  const aria = p.label ? `role="img" aria-label="${p.label}"` : 'aria-hidden="true"';
  return `<span class="material-symbols-rounded" ${aria} style="font-size:${px}px;font-variation-settings:'FILL' ${fill},'wght' 400,'GRAD' 0,'opsz' ${opszFor(px)}">${p.name}</span>`;
}
export const fontFaceSnippet = `@font-face {\n  font-family: "${FAMILY}";\n  src: url(/path/to/material-symbols-rounded.woff2) format("woff2");\n  font-weight: 400;\n  font-display: block; /* avoids showing ligature text before the font loads */\n}`;

/* ----------------------------------------------------------------- search */

export const CATEGORIES = [...new Set(ICONS.flatMap(i => i.categories))].sort();
export function searchIcons(q: string, category: string): IconRecord[] {
  const s = q.trim().toLowerCase().replace(/\s+/g, '_');
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return ICONS.filter(i => (category === 'all' || i.categories.includes(category)) && (!words.length || i.name.includes(s) || words.every(w => i.name.includes(w) || i.tags.some(t => t.includes(w)))));
}
/** Names in the full Rounded catalog that are not bundled (shown as "add via the generator"). */
export function searchCatalog(q: string, limit = 24): string[] {
  const s = q.trim().toLowerCase().replace(/\s+/g, '_');
  if (!s) return [];
  return data.catalog.filter(n => n.includes(s) && !ICON_NAMES.has(n)).slice(0, limit);
}
