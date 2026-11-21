/// <reference types="vite/client" />
/**
 * Foundations / Colors — data layer.
 *
 * Every color VALUE shown in Storybook is parsed at build time from the real
 * production CSS (imported with `?raw`). Nothing here copies a color. The only
 * hand-written data is classification metadata: token name -> group, and a
 * short usage role. Tokens found in source but missing from the catalog land
 * in an "Unclassified" bucket rather than being dropped.
 *
 * Read-only: this module never writes to, or re-exports from, production code.
 */
import tokensCss from '../../app/tokens.css?raw';
import globalsCss from '../../app/globals.css?raw';
import landingCss from '../../app/landing.css?raw';
import entranceCss from '../../app/entrance.css?raw';
import adventureCss from '../../app/world/adventure.css?raw';
import questCss from '../../app/quest-preview/quest-preview.css?raw';
import navigationCss from '../../app/site-navigation.css?raw';
import dropdownCss from '../../components/ui/dropdown.css?raw';
import {parseColor, type RGBA} from './color-math';

export type SourceId = 'tokens' | 'globals' | 'landing' | 'entrance' | 'adventure' | 'quest' | 'navigation' | 'dropdown';
export const SOURCES: Record<SourceId, {path: string; css: string}> = {
  tokens: {path: 'app/tokens.css', css: tokensCss},
  globals: {path: 'app/globals.css', css: globalsCss},
  landing: {path: 'app/landing.css', css: landingCss},
  entrance: {path: 'app/entrance.css', css: entranceCss},
  adventure: {path: 'app/world/adventure.css', css: adventureCss},
  quest: {path: 'app/quest-preview/quest-preview.css', css: questCss},
  navigation: {path: 'app/site-navigation.css', css: navigationCss},
  dropdown: {path: 'components/ui/dropdown.css', css: dropdownCss},
};
const SOURCE_ORDER: SourceId[] = ['tokens', 'globals', 'landing', 'entrance', 'adventure', 'quest', 'navigation', 'dropdown'];

/* ------------------------------------------------------------------ parsing */

export type Decl = {name: string; value: string};
export type Rule = {source: SourceId; selector: string; line: number; order: number; decls: Decl[]};

const blankComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

export function parseRules(source: SourceId, css: string, orderBase = 0): Rule[] {
  const clean = blankComments(css);
  const rules: Rule[] = [];
  const re = /([^{};]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(clean))) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    if (!selector || selector.startsWith('@')) continue;
    const decls = [...m[2].matchAll(/([\w-]+)\s*:\s*([^;]+)/g)].map(d => ({name: d[1], value: d[2].trim()}));
    const selectorStart = m.index + m[0].indexOf(m[1]) + (m[1].length - m[1].trimStart().length);
    const line = clean.slice(0, selectorStart).split('\n').length;
    rules.push({source, selector, line, order: orderBase + n++, decls});
  }
  return rules;
}

let ruleCache: Rule[] | null = null;
export function allRules(): Rule[] {
  if (!ruleCache) {
    ruleCache = [];
    SOURCE_ORDER.forEach((id, i) => ruleCache!.push(...parseRules(id, SOURCES[id].css, i * 100000)));
  }
  return ruleCache;
}

/* ---------------------------------------------------------------- selectors */

export type Compound = {raw: string; root: boolean; classes: string[]; attrs: [string, string][]; specificity: number};

function splitTopLevel(sel: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim()).filter(Boolean);
}

/** A "scope" compound targets one element by class/attribute only (no descendant, no pseudo-state). */
export function parseCompound(part: string): Compound | null {
  if (part === ':root') return {raw: part, root: true, classes: [], attrs: [], specificity: 0};
  if (!/^(\.[\w-]+|\[[\w-]+="[^"]*"\])+$/.test(part)) return null;
  const classes = [...part.matchAll(/\.([\w-]+)/g)].map(x => x[1]);
  const attrs = [...part.matchAll(/\[([\w-]+)="([^"]*)"\]/g)].map(x => [x[1], x[2]] as [string, string]);
  return {raw: part, root: false, classes, attrs, specificity: classes.length + attrs.length};
}

export const compoundsOf = (selector: string) =>
  splitTopLevel(selector).map(p => ({part: p, compound: parseCompound(p)}));

export type ElementModel = {classes: string[]; attrs: Record<string, string>};
const matches = (c: Compound, el: ElementModel) =>
  c.root || (c.classes.every(k => el.classes.includes(k)) && c.attrs.every(([k, v]) => el.attrs[k] === v));

/* ------------------------------------------------------------------ cascade */

export type ResolvedToken = {
  name: string;
  /** Final value after var() alias resolution. */
  value: string;
  /** Value as written in the winning declaration. */
  declared: string;
  /** Winning declaration location. */
  from: {path: string; selector: string; line: number};
  /** Set when the winning declaration is `var(--other)`. */
  aliasOf?: string;
  color: RGBA | null;
  /** First color literal inside a composite value (e.g. a box-shadow). */
  composite: boolean;
};

const COLOR_RE = /#[0-9a-f]{8}\b|#[0-9a-f]{6}\b|#[0-9a-f]{3,4}\b|rgba?\([^)]*\)/gi;
export const colorLiterals = (value: string) => value.match(COLOR_RE) ?? [];

const cache = new Map<string, Map<string, ResolvedToken>>();

/** Resolve every custom property whose final value is (or contains) a color for one element. */
export function resolveElement(el: ElementModel): Map<string, ResolvedToken> {
  const key = JSON.stringify(el);
  const hit = cache.get(key);
  if (hit) return hit;
  const winners = new Map<string, {spec: number; order: number; decl: string; rule: Rule; selector: string}>();
  for (const rule of allRules()) {
    for (const {part, compound} of compoundsOf(rule.selector)) {
      if (!compound || !matches(compound, el)) continue;
      for (const d of rule.decls) {
        if (!d.name.startsWith('--')) continue;
        const prev = winners.get(d.name);
        if (!prev || compound.specificity > prev.spec || (compound.specificity === prev.spec && rule.order >= prev.order))
          winners.set(d.name, {spec: compound.specificity, order: rule.order, decl: d.value, rule, selector: part});
      }
    }
  }
  const resolveValue = (name: string, depth = 0): {value: string; alias?: string} | null => {
    const w = winners.get(name);
    if (!w || depth > 8) return null;
    const ref = /^var\((--[\w-]+)\)$/.exec(w.decl);
    if (!ref) return {value: w.decl};
    const inner = resolveValue(ref[1], depth + 1);
    return inner ? {value: inner.value, alias: ref[1]} : null;
  };
  const out = new Map<string, ResolvedToken>();
  for (const [name, w] of winners) {
    const r = resolveValue(name);
    if (!r) continue;
    const color = parseColor(r.value);
    const lits = colorLiterals(r.value);
    if (!color && !(lits.length && !/var\(/.test(r.value))) continue;
    out.set(name, {
      name, value: r.value, declared: w.decl, aliasOf: r.alias,
      from: {path: SOURCES[w.rule.source].path, selector: w.selector, line: w.rule.line},
      color: color ?? parseColor(lits[0] ?? ''), composite: !color,
    });
  }
  cache.set(key, out);
  return out;
}

/* ------------------------------------------------------------------- themes */

export type ViewDef = {id: string; label: string; classes: string[]; bg: string; fg: string};
export type ThemeId =
  | 'editorial' | 'island' | 'arcade' | 'neon' | 'island-day' | 'island-night'
  | 'editorial-footer' | 'world-page' | 'entrance' | 'guide';
export type ThemeDef = {
  id: ThemeId;
  label: string;
  /** theme = a real, switchable appearance; context = a component/page scope that re-maps tokens. */
  kind: 'theme' | 'context';
  family: 'Editorial' | 'Adventure' | 'Island scene' | 'Entrance';
  /** Real selector(s) this theme is read from. */
  selector: string;
  el: ElementModel;
  views: ViewDef[];
  note?: string;
};

const adv = (theme: string): ElementModel => ({classes: ['adventure'], attrs: {'data-theme': theme}});
const advViews = (bg: string, bgDark = bg): ViewDef[] => [
  {id: 'grid', label: 'Grid (cabinet)', classes: ['v-grid'], bg: bgDark, fg: '--paper'},
  {id: 'carousel', label: 'Carousel (select)', classes: ['v-carousel'], bg, fg: '--ink'},
];

export const THEMES: ThemeDef[] = [
  {
    id: 'editorial', label: 'Editorial', kind: 'theme', family: 'Editorial', selector: ':root',
    el: {classes: [], attrs: {}}, views: [{id: 'page', label: 'Page', classes: [], bg: '--color-paper', fg: '--color-ink'}],
    note: 'Site default. Defined on :root in app/tokens.css; applied by html in app/globals.css.',
  },
  {
    id: 'island', label: 'Island', kind: 'theme', family: 'Adventure', selector: '.adventure[data-theme="A5"]',
    el: adv('A5'), views: [
      {id: 'grid', label: 'Grid', classes: ['v-grid'], bg: '--sky', fg: '--ink'},
      {id: 'carousel', label: 'Carousel', classes: ['v-carousel'], bg: '--sky', fg: '--ink'},
    ],
    note: 'Hub label "Island" = data-theme A5. Both views paint a sky → sand gradient.',
  },
  {
    id: 'arcade', label: 'Arcade', kind: 'theme', family: 'Adventure', selector: '.adventure (base)',
    el: adv('H3'), views: advViews('--paper', '--ink'),
    note: 'Hub label "Arcade" = data-theme H3. H3 has no override block; it uses the base .adventure tokens. Grid = dark cabinet, carousel = light select screen.',
  },
  {
    id: 'neon', label: 'Neon', kind: 'theme', family: 'Adventure', selector: '.adventure[data-theme="A2"]',
    el: adv('A2'), views: advViews('--paper', '--paper'),
    note: 'Hub label "Neon" = data-theme A2. The grid/carousel backgrounds are literal gradients in CSS, so --paper stands in for the surface here.',
  },
  {
    id: 'island-day', label: 'Island · Day', kind: 'theme', family: 'Island scene', selector: '.quest-preview[data-light="day"]',
    el: {classes: ['quest-preview'], attrs: {'data-light': 'day'}},
    views: [{id: 'scene', label: 'Scene', classes: [], bg: '--sky-top', fg: '--q-ink'}],
    note: 'The 3D island preview (/quest-preview), daytime. Different source from the A5 "Island" hub theme.',
  },
  {
    id: 'island-night', label: 'Island · Night', kind: 'theme', family: 'Island scene', selector: '.quest-preview[data-light="night"]',
    el: {classes: ['quest-preview'], attrs: {'data-light': 'night'}},
    views: [{id: 'scene', label: 'Scene', classes: [], bg: '--sky-top', fg: '--q-paper'}],
    note: 'The 3D island preview, night. Panels use neutral grey note surfaces.',
  },
  {
    id: 'editorial-footer', label: 'Editorial footer (inverse)', kind: 'context', family: 'Editorial', selector: '.site-footer',
    el: {classes: ['site-footer'], attrs: {}}, views: [{id: 'footer', label: 'Footer', classes: [], bg: '--color-ink', fg: '--color-paper'}],
    note: 'Footer re-maps --color-focus to paper; background is ink, text is paper.',
  },
  {
    id: 'world-page', label: 'Editorial world preview', kind: 'context', family: 'Editorial', selector: '.world-page',
    el: {classes: ['world-page'], attrs: {}}, views: [{id: 'page', label: 'Page', classes: [], bg: '--temp-world-sky', fg: '--temp-world-ink'}],
    note: 'Re-maps --color-ink/-muted/-paper/-focus to --temp-world-* tokens (alias declarations in app/globals.css).',
  },
  {
    id: 'entrance', label: 'Entrance title screen', kind: 'context', family: 'Entrance', selector: '.title-screen',
    el: {classes: ['title-screen'], attrs: {}}, views: [{id: 'screen', label: 'Screen', classes: [], bg: '--entrance-night', fg: '--entrance-paper'}],
  },
  {
    id: 'guide', label: 'Guide dialog', kind: 'context', family: 'Entrance', selector: '.guide-dialog',
    el: {classes: ['guide-dialog'], attrs: {}}, views: [{id: 'dialog', label: 'Dialog', classes: [], bg: '--guide-paper', fg: '--guide-ink'}],
  },
];

export const themeById = (id: ThemeId) => THEMES.find(t => t.id === id)!;
export const resolveTheme = (id: ThemeId) => resolveElement(themeById(id).el);

/** Resolve with the view's extra classes (v-grid / v-carousel) applied to the same element. */
export function resolveThemeView(id: ThemeId, viewId: string) {
  const t = themeById(id);
  const v = t.views.find(x => x.id === viewId) ?? t.views[0];
  return resolveElement({classes: [...t.el.classes, ...v.classes], attrs: t.el.attrs});
}

/* ----------------------------------------------------------------- catalog */

export type GroupId = 'primitive' | 'semantic' | 'theme' | 'component';
export const GROUPS: Record<GroupId, {title: string; intro: string}> = {
  primitive: {
    title: 'Primitive Colors',
    intro: 'Raw palette values named for the hue, not for a job. In source there is no separate primitive layer for the neutrals: core ink/paper are declared directly as semantic --color-* tokens (see Semantic Colors).',
  },
  semantic: {
    title: 'Semantic Colors',
    intro: 'Role-named tokens used by the Editorial site (page, text, border, focus, divider).',
  },
  theme: {
    title: 'Theme Colors',
    intro: 'Tokens that are re-declared per theme: Adventure Island / Arcade / Neon, and the Island scene day / night. Values below are resolved per theme from the real cascade.',
  },
  component: {
    title: 'Component Colors',
    intro: 'Tokens scoped to one component or page (Entrance, Guide dialog, world preview and map art). They are not theme switches.',
  },
};

export type CatalogEntry = {group: GroupId; subgroup: string; role: string; basis: 'source' | 'usage' | 'unknown'};
const e = (group: GroupId, subgroup: string, role: string, basis: CatalogEntry['basis'] = 'usage'): CatalogEntry => ({group, subgroup, role, basis});
const UNDOC = 'Role not documented in source';

const advHub = 'Adventure UI';
const q = 'Island scene';
export const CATALOG: Record<string, CatalogEntry> = {
  // ---- Primitive
  '--landing-orange': e('primitive', 'Brand orange', 'Brand orange for landing graphics and controls. See “Same value, several tokens” for matching declarations.'),
  '--landing-yellow': e('primitive', 'Pastel accents', 'Pastel accent. Landing-page art and chips; no documented text pairing.'),
  '--landing-lime': e('primitive', 'Pastel accents', 'Pastel accent. Used as the hover fill on landing toolbar links.'),
  '--landing-teal': e('primitive', 'Pastel accents', 'Pastel accent. Landing-page art and chips; no documented text pairing.'),
  '--landing-pink': e('primitive', 'Pastel accents', 'Pastel accent. Landing-page art and chips; no documented text pairing.'),
  '--landing-lilac': e('primitive', 'Pastel accents', 'Pastel accent. Landing-page art and chips; no documented text pairing.'),
  '--landing-footer-muted': e('primitive', 'Neutral', 'Muted text on the dark (ink) footer.'),
  // ---- Semantic
  '--color-paper': e('semantic', 'Core editorial', 'Page background (html) and inverse text on ink.', 'source'),
  '--color-surface': e('semantic', 'Core editorial', 'Raised/alternate surface. Declared; value equals --color-secondary-paper.'),
  '--color-secondary-paper': e('semantic', 'Core editorial', 'Alternate section/panel background (e.g. .editorial-path, .world-preview).'),
  '--color-ink': e('semantic', 'Core editorial', 'Primary text, rules and inverse background (footer, primary action).', 'source'),
  '--color-muted': e('semantic', 'Core editorial', 'Secondary text (labels, captions).'),
  '--color-accent': e('semantic', 'Core editorial', 'Orange accent fill/hover (e.g. footer eyebrow, selected states).'),
  '--color-border': e('semantic', 'Core editorial', 'Hairline borders (e.g. .mode-bar).'),
  '--color-focus': e('semantic', 'Core editorial', 'Focus ring color (a/button :focus-visible outline). Remapped to paper in the footer.', 'source'),
  '--landing-line': e('semantic', 'Dividers', 'Translucent hairline dividers on the landing page (alpha token).'),
  // ---- Theme · Adventure
  '--ink': e('theme', advHub, 'Primary text and borders; the cabinet (grid) view uses it as the page background.'),
  '--paper': e('theme', advHub, 'Page background; tile face; inverse text on the cabinet view.'),
  '--paper2': e('theme', advHub, 'Secondary paper tone. Declared; no var() usage found.'),
  '--card': e('theme', advHub, 'Card / panel surface.'),
  '--muted': e('theme', advHub, 'Secondary text.'),
  '--line': e('theme', advHub, 'Translucent hairline (alpha token).'),
  '--tint': e('theme', advHub, 'Highlight: selected/pressed fill, focus outline, PLAY button.'),
  '--orange': e('theme', advHub, 'Accent hue; project tile tint (Seat Optimizer, Festival).'),
  '--lime': e('theme', advHub, 'Accent hue; project tile tint (Budget Run).'),
  '--teal': e('theme', advHub, 'Accent hue; project tile tint (Vacancy Radar). Neon glow color.'),
  '--lilac': e('theme', advHub, 'Accent hue; project tile tint (Poster Machine, API Playground).'),
  '--pink': e('theme', advHub, 'Accent hue; project tile tint (Break the Bot). In Island it is declared as a rust tone.'),
  '--note': e('theme', advHub, 'Blueprint "system layer" color (declared in source comment).', 'source'),
  '--bad': e('theme', advHub, 'Negative / error state.'),
  '--sky': e('theme', 'Island-only', 'Island sky: page gradient start, overlay tones.'),
  '--sand': e('theme', 'Island-only', 'Island sand: page gradient end.'),
  '--ground': e('theme', 'Island-only', 'Island ground tone used in tile preview gradients.'),
  '--slate': e('theme', 'Island-only', 'Underside/"edge" shadow of floating tiles.'),
  '--rust': e('theme', 'Island-only', 'Accent text/marks (numbers, heading square).'),
  '--leaf': e('theme', 'Island-only', 'Declared; no var() usage found.'),
  // ---- Theme · Island scene
  '--q-paper': e('theme', q, 'Light text/paper tone for scene UI (night text).'),
  '--q-ink': e('theme', q, 'Dark text tone for scene UI (day text).'),
  '--q-orange': e('theme', q, 'Scene accent orange.'),
  '--q-muted': e('theme', q, 'Secondary text on scene panels.'),
  '--q-note-bg': e('theme', q, 'Panel / note background.'),
  '--q-note-ink': e('theme', q, 'Panel / note text.'),
  '--q-note-line': e('theme', q, 'Panel divider (alpha token).'),
  '--q-control-border': e('theme', q, 'Control outline on panels.'),
  '--sky-top': e('theme', q, 'Top of the animated sky gradient (varies by city, season, light).'),
  '--sky-bottom': e('theme', q, 'Bottom of the animated sky gradient.'),
  // ---- Component · Entrance + Guide
  '--entrance-night': e('component', 'Entrance', 'Dark ground of the title screen and entrance header.'),
  '--entrance-ink': e('component', 'Entrance', 'Dark text/ink inside entrance panels.'),
  '--entrance-paper': e('component', 'Entrance', 'Light text on the dark title screen.'),
  '--entrance-muted': e('component', 'Entrance', 'Muted text on the entrance header.'),
  '--entrance-orange': e('component', 'Entrance', 'Orange accent / focus outline on the entrance header.'),
  '--entrance-secondary': e('component', 'Entrance', 'Secondary paper tone. Declared; no var() usage found beyond its own block.'),
  '--entrance-border': e('component', 'Entrance', 'Declared; no var() usage found.'),
  '--guide-paper': e('component', 'Guide dialog', 'Dialog background.'),
  '--guide-ink': e('component', 'Guide dialog', 'Dialog text and border. Overridden to light in Island night panels.'),
  '--guide-orange': e('component', 'Guide dialog', 'Hard offset shadow and tab accent.'),
  '--guide-muted': e('component', 'Guide dialog', 'Secondary dialog text.'),
  // ---- Component · Dropdown (aliases with literal fallbacks)
  '--dropdown-paper': e('component', 'Dropdown', 'Dropdown panel background: --q-note-bg, else --color-paper (literal fallback in source).', 'source'),
  '--dropdown-ink': e('component', 'Dropdown', 'Dropdown text: --q-note-ink, else --color-ink (literal fallback in source).', 'source'),
  '--dropdown-accent': e('component', 'Dropdown', 'Dropdown sticker shadow and active-row tint: --q-orange, else a literal orange fallback.', 'source'),
  // ---- Component · World preview (preview-only styling per tokens.css comment)
  '--temp-world-sky': e('component', 'World preview', 'Preview-only world page background. Final game art direction is unapproved.', 'source'),
  '--temp-world-surface': e('component', 'World preview', 'Preview-only world surface (becomes --color-paper in .world-page).', 'source'),
  '--temp-world-ink': e('component', 'World preview', 'Preview-only world text (becomes --color-ink in .world-page).', 'source'),
  '--temp-world-muted': e('component', 'World preview', 'Preview-only world secondary text.', 'source'),
  '--temp-world-edge': e('component', 'World preview', 'Preview-only world panel border.', 'source'),
  '--temp-world-shadow': e('component', 'World preview', 'Composite: hard offset shadow with a green-tinted color.', 'source'),
  '--temp-shadow': e('component', 'Editorial shadow', 'Composite: hard offset shadow used by .world-preview.'),
  // ---- Component · Map art (original map colors intentionally preserved)
  ...Object.fromEntries(
    ['shadow', 'earth', 'grass', 'edge', 'path', 'building', 'building-shade', 'roof', 'roof-shade', 'window', 'ink', 'lilac', 'purple', 'gold', 'gold-shade', 'trunk', 'tree', 'tree-light', 'flower']
      .map(k => [`--temp-map-${k}`, e('component', 'Map art', `Map illustration fill (${k.replace('-', ' ')}). "Original map colors are intentionally preserved" (tokens.css).`, 'source')]),
  ),
};

/* ----------------------------------------------------------- token inventory */

export type TokenRow = CatalogEntry & {name: string; present: Record<string, ResolvedToken>};

/** Themes in which each token resolves, so every token is reported in every environment it exists in. */
export function inventory(): {rows: TokenRow[]; unclassified: TokenRow[]; missing: string[]} {
  const names = new Set<string>();
  const perTheme = new Map<ThemeId, Map<string, ResolvedToken>>();
  for (const t of THEMES) {
    // Union over views so view-only tokens are not missed.
    const merged = new Map(resolveElement(t.el));
    for (const v of t.views) for (const [k, val] of resolveThemeView(t.id, v.id)) merged.set(k, val);
    perTheme.set(t.id, merged);
    for (const k of merged.keys()) names.add(k);
  }
  // Also catch color tokens declared only in rules that no theme element matches (e.g. descendant-scoped overrides).
  const scopedOnly = new Map<string, ResolvedToken>();
  for (const rule of allRules()) {
    for (const d of rule.decls) {
      if (!d.name.startsWith('--') || names.has(d.name)) continue;
      const lits = colorLiterals(d.value);
      if (!lits.length) continue;
      names.add(d.name);
      scopedOnly.set(d.name, {
        name: d.name, value: d.value, declared: d.value, color: parseColor(lits[0] ?? ''), composite: !parseColor(d.value),
        from: {path: SOURCES[rule.source].path, selector: rule.selector, line: rule.line},
      });
    }
  }
  const mk = (name: string): TokenRow => {
    const present: Record<string, ResolvedToken> = {};
    for (const [tid, map] of perTheme) {
      const r = map.get(name);
      if (r) present[tid] = r;
    }
    if (!Object.keys(present).length && scopedOnly.has(name)) present['(scoped)'] = scopedOnly.get(name)!;
    return {name, present, ...(CATALOG[name] ?? e('component', 'Unclassified', UNDOC, 'unknown'))};
  };
  const rows = [...names].filter(n => CATALOG[n]).map(mk);
  const unclassified = [...names].filter(n => !CATALOG[n]).map(mk);
  const missing = Object.keys(CATALOG).filter(n => !names.has(n));
  return {rows, unclassified, missing};
}

/** The best single resolved value for a token in a given theme (falls back to first environment found). */
export const valueIn = (row: TokenRow, theme: ThemeId) => row.present[theme] ?? null;
export const firstValue = (row: TokenRow) => Object.values(row.present)[0] ?? null;

/* ------------------------------------------ usage + literal audit (lazy, raw) */

const rawModules = import.meta.glob(
  [
    '../../app/**/*.{css,ts,tsx}', '../../components/**/*.{css,ts,tsx}', '../../lib/adventure/*.ts',
    '!../../app/design-audit/**', '!../../app/quest-preview/scene-review/**', '!../../**/*.test.*',
  ],
  {query: '?raw', import: 'default'},
) as Record<string, () => Promise<string>>;

export type LiteralHit = {value: string; hex: string; count: number; files: Set<string>; samples: string[]};
export type Audit = {usage: Record<string, number>; literals: LiteralHit[]; filesScanned: number};

export async function runAudit(): Promise<Audit> {
  const usage: Record<string, number> = {};
  const lit = new Map<string, LiteralHit>();
  const entries = Object.entries(rawModules);
  const texts = await Promise.all(entries.map(async ([p, load]) => [p.replace('../../', ''), await load()] as const));
  const names = Object.keys(CATALOG);
  for (const [path, text] of texts) {
    for (const n of names) {
      const hits = text.split(`var(${n}`).length - 1;
      if (hits) usage[n] = (usage[n] ?? 0) + hits;
    }
    if (!path.endsWith('.css')) continue;
    for (const rule of parseRules('tokens', text)) {
      for (const d of rule.decls) {
        if (d.name.startsWith('--') || !/^(color|background|background-color|border|border-\w+|outline|outline-color|fill|stroke|box-shadow|text-shadow|caret-color|accent-color)$/.test(d.name)) continue;
        for (const l of colorLiterals(d.value)) {
          const c = parseColor(l);
          if (!c) continue;
          const key = l.toLowerCase().replace(/\s+/g, ' ');
          const hit = lit.get(key) ?? {value: l, hex: key, count: 0, files: new Set<string>(), samples: []};
          hit.count++;
          hit.files.add(path);
          if (hit.samples.length < 3) hit.samples.push(`${rule.selector.slice(0, 70)} { ${d.name} }`);
          lit.set(key, hit);
        }
      }
    }
  }
  return {usage, literals: [...lit.values()].sort((a, b) => b.count - a.count), filesScanned: texts.length};
}

/** Read one declaration (any property) from the rule whose selector list contains `selector` exactly. Live from source. */
export function readDecl(source: SourceId, selector: string, prop: string): {value: string; path: string; line: number} | null {
  for (const rule of allRules()) {
    if (rule.source !== source) continue;
    if (!compoundsOfRaw(rule.selector).includes(selector)) continue;
    const d = rule.decls.find(x => x.name === prop);
    if (d) return {value: d.value, path: SOURCES[source].path, line: rule.line};
  }
  return null;
}
const compoundsOfRaw = (selector: string) => splitTopLevel(selector);
