/**
 * Foreground/background pairings and their measured contrast.
 *
 * Hand-written data is limited to WHICH tokens are paired and WHERE the source
 * pairs them (path + selector). Colors are resolved from the real cascade and
 * ratios are computed, so nothing here can drift from production values.
 *
 * basis:
 *   'source' – the cited rule really sets this foreground over this background.
 *   'check'  – not a documented pairing; a sensible combination worth measuring.
 *
 * Results are flagged, never "fixed": no token is altered. The project's
 * target (AA 4.5:1 text, 3:1 UI, or other) is an owner decision.
 */
import {contrastRatio, composite, grade, parseColor, type Grade, type RGBA} from './color-math';
import {SOURCES, allRules, compoundsOf, resolveTheme, resolveThemeView, themeById, type ResolvedToken, type ThemeId, type SourceId} from './color-source';

export type PairKind = 'text' | 'ui' | 'info';
/** A color that is a literal in a cited rule rather than a token (e.g. Neon's selected-control text). */
export type RuleSide = {file: SourceId; selector: string; prop: string};
export type Side = string | Partial<Record<ThemeId, string>> | RuleSide;
const isRuleSide = (v: Side): v is RuleSide => typeof v === 'object' && 'selector' in v;
export function describeSide(v: Side): string {
  return typeof v === 'string' ? v : isRuleSide(v) ? `literal ${v.prop} in rule` : 'per theme';
}
export type PairSpec = {
  id: string;
  section: string;
  label: string;
  fg: Side;
  bg: Side;
  kind: PairKind;
  themes: ThemeId[];
  source: {file: SourceId; selector: string};
  basis: 'source' | 'check';
  note?: string;
};

const ADV: ThemeId[] = ['island', 'arcade', 'neon'];
const ISL: ThemeId[] = ['island-day', 'island-night'];

const p = (
  id: string, section: string, label: string, fg: PairSpec['fg'], bg: PairSpec['bg'], kind: PairKind, themes: ThemeId[],
  file: SourceId, selector: string, basis: PairSpec['basis'], note?: string,
): PairSpec => ({id, section, label, fg, bg, kind, themes, source: {file, selector}, basis, note});

const PASTELS = ['orange', 'yellow', 'lime', 'teal', 'pink', 'lilac'];
const HUES = ['tint', 'orange', 'lime', 'teal', 'lilac', 'pink'];

export const PAIRS: PairSpec[] = [
  // ---------------- Editorial
  p('ed-text', 'Editorial', 'Body text on page', '--color-ink', '--color-paper', 'text', ['editorial'], 'globals', 'html', 'source'),
  p('ed-muted', 'Editorial', 'Muted text on page', '--color-muted', '--color-paper', 'text', ['editorial'], 'globals', '.mode-label', 'source'),
  p('ed-muted-alt', 'Editorial', 'Muted text on alternate section', '--color-muted', '--color-secondary-paper', 'text', ['editorial'], 'globals', '.editorial-path', 'check', 'Muted text is used widely; --color-secondary-paper is the alternate section background.'),
  p('ed-ink-alt', 'Editorial', 'Body text on alternate section', '--color-ink', '--color-secondary-paper', 'text', ['editorial'], 'globals', '.editorial-path', 'source'),
  p('ed-inverse', 'Editorial', 'Inverse: paper on ink (primary action)', '--color-paper', '--color-ink', 'text', ['editorial'], 'globals', '.action-link--primary', 'source'),
  p('ed-accent', 'Editorial', 'Ink on orange accent (hero)', '--color-ink', '--color-accent', 'text', ['editorial'], 'globals', '.home-hero', 'source'),
  p('ed-footer-muted', 'Editorial', 'Footer muted text on ink', '--landing-footer-muted', '--color-ink', 'text', ['editorial'], 'landing', '.footer-directory dt', 'source'),
  p('ed-footer-accent', 'Editorial', 'Footer eyebrow: accent on ink', '--color-accent', '--color-ink', 'text', ['editorial'], 'globals', '.site-footer .eyebrow', 'source'),
  p('ed-border', 'Editorial', 'Border on page (non-text)', '--color-border', '--color-paper', 'ui', ['editorial'], 'globals', '.mode-bar', 'source'),
  p('ed-focus', 'Editorial', 'Focus ring on page (non-text)', '--color-focus', '--color-paper', 'ui', ['editorial'], 'globals', 'a:focus-visible', 'source'),
  p('ed-line', 'Editorial', 'Landing hairline on page (alpha, decorative)', '--landing-line', '--color-paper', 'info', ['editorial'], 'tokens', '--landing-line', 'source', 'Decorative divider; reported for information, not graded.'),
  ...PASTELS.map(n => p(`ed-ink-${n}`, 'Editorial · pastel fills', `Ink on --landing-${n}`, '--color-ink', `--landing-${n}`, 'text', ['editorial'], 'tokens', `--landing-${n}`, 'check', n === 'lime' ? 'Lime is the documented hover fill for landing toolbar links.' : 'Pairing assumed, not documented in source.')),
  p('foot-text', 'Editorial footer', 'Footer text: paper on ink', '--color-paper', '--color-ink', 'text', ['editorial-footer'], 'globals', '.site-footer', 'source'),
  p('foot-focus', 'Editorial footer', 'Focus ring on footer (non-text)', '--color-focus', '--color-ink', 'ui', ['editorial-footer'], 'globals', '.site-footer', 'source'),
  p('world-text', 'World preview', 'World text on world sky', '--temp-world-ink', '--temp-world-sky', 'text', ['world-page'], 'globals', '.world-page', 'source'),
  p('world-text-surface', 'World preview', 'World text on world surface', '--temp-world-ink', '--temp-world-surface', 'text', ['world-page'], 'globals', '.world-page', 'check'),
  p('world-muted', 'World preview', 'World muted text on world surface', '--temp-world-muted', '--temp-world-surface', 'text', ['world-page'], 'globals', '.world-page', 'check'),
  p('world-edge', 'World preview', 'World edge on world sky (non-text)', '--temp-world-edge', '--temp-world-sky', 'ui', ['world-page'], 'globals', '.world-page', 'source'),

  // ---------------- Entrance + Guide
  p('ent-text', 'Entrance', 'Title screen: paper on night', '--entrance-paper', '--entrance-night', 'text', ['entrance'], 'entrance', '.title-screen', 'source'),
  p('ent-muted', 'Entrance', 'Entrance header: muted on night', '--entrance-muted', '--entrance-night', 'text', ['entrance'], 'entrance', '.site-header--entrance', 'source'),
  p('ent-focus', 'Entrance', 'Entrance header focus: orange on night (non-text)', '--entrance-orange', '--entrance-night', 'ui', ['entrance'], 'entrance', '.site-header--entrance a:focus-visible', 'source'),
  p('gd-text', 'Guide dialog', 'Dialog text: ink on paper', '--guide-ink', '--guide-paper', 'text', ['guide'], 'entrance', '.guide-dialog', 'source'),
  p('gd-muted', 'Guide dialog', 'Dialog muted text on paper', '--guide-muted', '--guide-paper', 'text', ['guide'], 'entrance', '.guide-dialog', 'check'),
  p('gd-orange', 'Guide dialog', 'Orange accent on paper (non-text)', '--guide-orange', '--guide-paper', 'ui', ['guide'], 'entrance', '.guide-dialog', 'check', 'Decorative offset shadow/tab; measured for information.'),

  // ---------------- Adventure · Arcade (H3 = base .adventure tokens)
  p('arc-carousel', 'Adventure · Arcade', 'Select (carousel) text: ink on paper', '--ink', '--paper', 'text', ['arcade'], 'adventure', '.adventure.v-carousel', 'source'),
  p('arc-cabinet', 'Adventure · Arcade', 'Cabinet (grid) text: paper on ink', '--paper', '--ink', 'text', ['arcade'], 'adventure', '.adventure.v-grid', 'source'),
  p('arc-selected', 'Adventure · Arcade', 'Selected control: ink on tint', '--ink', '--tint', 'text', ['arcade'], 'adventure', '.adventure .switch2 button[aria-pressed="true"]', 'source'),
  p('arc-focus', 'Adventure · Arcade', 'Tile focus outline: tint on ink cabinet (non-text)', '--tint', '--ink', 'ui', ['arcade'], 'adventure', '.adventure .tile:focus-visible', 'source'),
  p('arc-muted', 'Adventure · Arcade', 'Muted text on paper', '--muted', '--paper', 'text', ['arcade'], 'adventure', '.adventure .role', 'check', 'Cited rule colors the text; the dialog background it sits on is assumed to be --paper.'),
  ...HUES.map(n => p(`arc-kind-${n}`, 'Adventure · Arcade kind chips', `Kind chip: ink on --${n}`, '--ink', `--${n}`, 'text', ['arcade'], 'adventure', '.adventure .kind', 'source', 'Arcade paints each kind chip with the project tint (--c) and ink text.')),

  // ---------------- Adventure · Island (A5)
  p('isl5-sky', 'Adventure · Island', 'Page text on sky (gradient start)', '--ink', '--sky', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"].v-grid', 'source', 'Island paints a sky → sand gradient on both views; both ends are measured.'),
  p('isl5-sand', 'Adventure · Island', 'Page text on sand (gradient end)', '--ink', '--sand', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"].v-grid', 'source'),
  p('isl5-tile', 'Adventure · Island', 'Tile text: ink on card', '--ink', '--card', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"] .tile', 'source'),
  p('isl5-kind', 'Adventure · Island', 'Tile kind label: muted on card', '--muted', '--card', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"] .kind', 'source'),
  p('isl5-rust', 'Adventure · Island', 'Tile number: rust on card', '--rust', '--card', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"] .no', 'source'),
  p('isl5-muted', 'Adventure · Island', 'Role text: muted on paper (project card)', '--muted', '--paper', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"] .role', 'source'),
  p('isl5-selected', 'Adventure · Island', 'Selected control: ink on tint', '--ink', '--tint', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"] .switch2 button[aria-pressed="true"]', 'source'),
  p('isl5-play', 'Adventure · Island', 'PLAY button: ink on tint', '--ink', '--tint', 'text', ['island'], 'adventure', '.adventure[data-theme="A5"] .play', 'source'),
  p('isl5-focus-sky', 'Adventure · Island', 'Tile focus outline: tint on sky (non-text)', '--tint', '--sky', 'ui', ['island'], 'adventure', '.adventure[data-theme="A5"] .tile:focus-visible', 'source'),
  p('isl5-focus-sand', 'Adventure · Island', 'Tile focus outline: tint on sand (non-text)', '--tint', '--sand', 'ui', ['island'], 'adventure', '.adventure[data-theme="A5"] .tile:focus-visible', 'source'),

  // ---------------- Adventure · Neon (A2)
  p('neon-text', 'Adventure · Neon', 'Page text: ink on paper', '--ink', '--paper', 'text', ['neon'], 'adventure', '.adventure[data-theme="A2"].v-grid', 'check', 'Neon paints literal gradients (not tokens) behind the page; --paper is a close stand-in.'),
  p('neon-tile', 'Adventure · Neon', 'Tile text: ink on paper', '--ink', '--paper', 'text', ['neon'], 'adventure', '.adventure[data-theme="A2"] .tile', 'source'),
  p('neon-muted', 'Adventure · Neon', 'Muted text on paper', '--muted', '--paper', 'text', ['neon'], 'adventure', '.adventure[data-theme="A2"]', 'check'),
  p('neon-selected', 'Adventure · Neon', 'Selected control: literal text on tint', {file: 'adventure', selector: '.adventure[data-theme="A2"] .switch2 button[aria-pressed="true"]', prop: 'color'}, '--tint', 'text', ['neon'], 'adventure', '.adventure[data-theme="A2"] .switch2 button[aria-pressed="true"]', 'source', 'Text color is a literal in CSS, not a token; read from the rule.'),
  p('neon-play', 'Adventure · Neon', 'PLAY button: literal text on tint', {file: 'adventure', selector: '.adventure[data-theme="A2"] .play', prop: 'color'}, '--tint', 'text', ['neon'], 'adventure', '.adventure[data-theme="A2"] .play', 'source', 'Text color is a literal in CSS, not a token; read from the rule.'),
  p('neon-focus', 'Adventure · Neon', 'Tile focus outline: ink on paper (non-text)', '--ink', '--paper', 'ui', ['neon'], 'adventure', '.adventure[data-theme="A2"] .tile:focus-visible', 'source'),
  ...HUES.filter(n => n !== 'tint').map(n => p(`neon-kind-${n}`, 'Adventure · Neon kind labels', `Kind label: --${n} on paper`, `--${n}`, '--paper', 'text', ['neon'], 'adventure', '.adventure[data-theme="A2"] .kind', 'source', 'Neon colors each kind label with the project tint (--c) on the dark tile.')),

  // ---------------- Adventure · shared by all three
  p('adv-note', 'Adventure · all themes', 'System-layer note outline on paper (non-text)', '--note', '--paper', 'ui', ADV, 'adventure', '.adventure.is-system [data-note]', 'source', '--note is declared once in the base block and inherited by all three themes.'),
  p('adv-bad', 'Adventure · all themes', 'Error: --bad on paper', '--bad', '--paper', 'text', ADV, 'adventure', '.adventure', 'check', 'Pairing assumed; --bad is declared but its text use is not documented here.'),
  p('adv-line', 'Adventure · all themes', 'Hairline on paper (alpha, decorative)', '--line', '--paper', 'info', ADV, 'adventure', '.adventure', 'source', 'Decorative divider; reported for information, not graded.'),

  // ---------------- Island scene
  p('isl-text-top', 'Island scene', 'Scene text on sky (top)', {'island-day': '--q-ink', 'island-night': '--q-paper'}, '--sky-top', 'text', ISL, 'quest', '.quest-preview', 'source', 'Day uses --q-ink; night uses --q-paper. The sky is a gradient; both ends are measured.'),
  p('isl-text-bottom', 'Island scene', 'Scene text on sky (bottom)', {'island-day': '--q-ink', 'island-night': '--q-paper'}, '--sky-bottom', 'text', ISL, 'quest', '.quest-preview', 'source'),
  p('isl-note', 'Island scene', 'Panel text on panel', '--q-note-ink', '--q-note-bg', 'text', ISL, 'quest', '.quest-conversation.guide-dialog', 'source'),
  p('isl-muted', 'Island scene', 'Panel muted text on panel', '--q-muted', '--q-note-bg', 'text', ISL, 'quest', '.quest-conversation textarea::placeholder', 'check', 'The cited rule is the night placeholder; day is measured for comparison.'),
  p('isl-border', 'Island scene', 'Control border on panel (non-text)', '--q-control-border', '--q-note-bg', 'ui', ISL, 'quest', '.quest-controls-panel', 'source', 'The cited rules are the night control outlines; day uses the same token pairing.'),
  p('isl-line', 'Island scene', 'Panel divider on panel (alpha, decorative)', '--q-note-line', '--q-note-bg', 'info', ISL, 'quest', '.quest-preview', 'source', 'Decorative divider; reported for information, not graded.'),
];

/* --------------------------------------------------------------- evaluation */

export type PairCell = {
  theme: ThemeId;
  fgName: string; bgName: string;
  fg: ResolvedToken | null; bg: ResolvedToken | null;
  /** fg composited over bg when translucent. */
  effectiveFg: RGBA | null;
  ratio: number | null;
  grade: Grade | 'n/a';
};

const pick = (v: Side, t: ThemeId) => (typeof v === 'string' ? v : isRuleSide(v) ? '' : v[t] ?? '');

/** Literal color declared by a property in the cited rule (exact selector match), as a pseudo-token. */
export function readRuleColor(side: RuleSide): ResolvedToken | null {
  for (const rule of allRules()) {
    if (rule.source !== side.file) continue;
    if (!compoundsOf(rule.selector).some(c => c.part === side.selector)) continue;
    const d = rule.decls.find(x => x.name === side.prop);
    const color = d ? parseColor(d.value) : null;
    if (d && color) {
      return {name: `literal ${side.prop}`, value: d.value, declared: d.value, color, composite: false,
        from: {path: SOURCES[rule.source].path, selector: rule.selector, line: rule.line}};
    }
  }
  return null;
}

export function evaluatePair(spec: PairSpec): PairCell[] {
  return spec.themes.map(theme => {
    const fgName = isRuleSide(spec.fg) ? `literal ${spec.fg.prop}` : pick(spec.fg, theme);
    const bgName = isRuleSide(spec.bg) ? `literal ${spec.bg.prop}` : pick(spec.bg, theme);
    // Resolve the way the page does: the theme's first view, then fall back to its other views for view-only tokens.
    const lookup = (name: string) =>
      resolveTheme(theme).get(name) ?? themeById(theme).views.map(v => resolveThemeView(theme, v.id).get(name)).find(Boolean) ?? null;
    const fg = isRuleSide(spec.fg) ? readRuleColor(spec.fg) : lookup(fgName);
    const bg = isRuleSide(spec.bg) ? readRuleColor(spec.bg) : lookup(bgName);
    if (!fg?.color || !bg?.color) return {theme, fgName, bgName, fg, bg, effectiveFg: null, ratio: null, grade: 'n/a'};
    const eff = fg.color.a < 1 ? composite(fg.color, bg.color.a < 1 ? {...bg.color, a: 1} : bg.color) : fg.color;
    const ratio = contrastRatio(fg.color, bg.color);
    return {theme, fgName, bgName, fg, bg, effectiveFg: eff, ratio, grade: grade(ratio, spec.kind)};
  });
}

/** True when the cited selector text really exists in the cited source file (guards against stale citations). */
export function citationExists(spec: PairSpec): boolean {
  const src = SOURCES[spec.source.file as keyof typeof SOURCES];
  if (!src) return spec.source.file === ('landing') ? true : false;
  return src.css.includes(spec.source.selector);
}

export const isFlagged = (c: PairCell) => c.grade === 'fail' || c.grade === 'large-only';
export const isTranslucent = (value: string) => (parseColor(value)?.a ?? 1) < 1;
