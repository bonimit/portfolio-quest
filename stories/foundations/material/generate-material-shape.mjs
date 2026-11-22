/**
 * Generates material-shape.json: the ONLY place Material 3 shape numbers enter this repo.
 *
 *   mkdir /tmp/mw && cd /tmp/mw && npm pack @material/web@2.5.0 && mkdir pkg && tar -xzf material-web-*.tgz -C pkg
 *   node stories/foundations/material/generate-material-shape.mjs /tmp/mw/pkg/package stories/foundations/material/material-shape.json
 *
 * Sources and how they are used:
 *   - @material/web tokens/versions/latest/sass/_md-sys-shape.scss: all corner values (symmetric, asymmetric, `full`).
 *   - the rendered m3.material.io corner-radius-scale page: the nine numeric steps (dp) are ASSERTED equal to the package.
 *     The page gives no number for `full` (only "fully rounded corners", formerly 50% of the component size); 9999px is the package value.
 *     Asymmetric tokens (top / start / end) are named on the page without values: their values are package-only.
 *   - _md-comp-*.scss in the package: each component's own shape tokens (package-only; the page lists no component table).
 * m3.material.io redirects several shape URLs (overview, apply-shape, how-it-works, specs) to one "overview-principles" page;
 * final URLs and h1 are recorded. Nothing is added to the project's package.json (Playwright is already a dev dependency).
 */
import {chromium} from 'playwright';
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [pkgDir, out] = process.argv.slice(2);
if (!pkgDir || !out) throw new Error('usage: generate-material-shape.mjs <@material/web package dir> <out.json>');
const version = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
const sass = join(pkgDir, 'tokens/versions/latest/sass');
const sys = readFileSync(join(sass, '_md-sys-shape.scss'), 'utf8');

const corner = {};
for (const m of sys.matchAll(/^\$corner-([a-z-]+):\s*([^;]+);/gm)) corner[m[1]] = m[2].trim();
const need = (name) => { if (!(name in corner)) throw new Error(`package is missing $corner-${name}`); return corner[name]; };
const px = (v) => { const m = /^(\d+)px$/.exec(v); if (!m) throw new Error(`not a single px value: ${v}`); return Number(m[1]); };

const STEPS = ['none', 'extra-small', 'small', 'medium', 'large', 'large-increased', 'extra-large', 'extra-large-increased', 'extra-extra-large'];
const scale = STEPS.map((name) => ({token: `md.sys.shape.corner.${name}`, name, px: px(need(name))}));
scale.push({token: 'md.sys.shape.corner.full', name: 'full', px: px(need('full')), note: 'The page says only "fully rounded corners". 9999px is the package value.'});
const asymmetric = ['extra-small-top', 'large-top', 'large-start', 'large-end', 'extra-large-top'].map((name) => {
  const parts = need(name).split(/\s+/).map(px); // top-left top-right bottom-right bottom-left
  if (parts.length !== 4) throw new Error(`asymmetric ${name} is not four values`);
  return {token: `md.sys.shape.corner.${name}`, name, corners: {tl: parts[0], tr: parts[1], br: parts[2], bl: parts[3]}};
});

// Component shape tokens, read from the package. [id, label, file, token names]
const COMPONENTS = [
  ['button', 'Button (round)', 'button', ['container-shape-round', 'container-shape-square', 'pressed-container-shape', 'selected-container-shape-round']],
  ['filled-button-legacy', 'Filled button (legacy web component)', 'filled-button', ['container-shape']],
  ['assist-chip', 'Assist chip', 'assist-chip', ['container-shape']],
  ['filter-chip', 'Filter chip', 'filter-chip', ['container-shape']],
  ['input-chip', 'Input chip', 'input-chip', ['container-shape']],
  ['suggestion-chip', 'Suggestion chip', 'suggestion-chip', ['container-shape']],
  ['outlined-text-field', 'Outlined text field', 'outlined-text-field', ['container-shape']],
  ['filled-text-field', 'Filled text field', 'filled-text-field', ['container-shape']],
  ['menu', 'Menu (md-menu, baseline)', 'menu', ['container-shape']],
  ['menus', 'Menus (expressive)', 'menus', ['container-shape', 'group-shape']],
  ['dialog', 'Dialog', 'dialog', ['container-shape']],
  ['full-screen-dialog', 'Full-screen dialog', 'full-screen-dialog', ['container-shape']],
  ['sheet-bottom', 'Bottom sheet', 'sheet-bottom', ['docked-container-shape', 'docked-minimized-container-shape']],
  ['sheet-floating', 'Floating sheet', 'sheet-floating', ['container-shape']],
  ['sheet-side', 'Side sheet', 'sheet-side', ['detached-container-shape', 'docked-container-shape', 'docked-modal-container-shape']],
  ['elevated-card', 'Elevated card', 'elevated-card', ['container-shape']],
  ['filled-card', 'Filled card', 'filled-card', ['container-shape']],
  ['outlined-card', 'Outlined card', 'outlined-card', ['container-shape']],
  ['fab', 'Floating action button', 'fab', ['container-shape']],
  ['snackbar', 'Snackbar', 'snackbar', ['container-shape']],
  ['plain-tooltip', 'Plain tooltip', 'plain-tooltip', ['container-shape']],
  ['rich-tooltip', 'Rich tooltip', 'rich-tooltip', ['container-shape']],
  ['search-bar', 'Search bar', 'search-bar', ['container-shape']],
  ['checkbox', 'Checkbox', 'checkbox', ['container-shape']],
  ['switch', 'Switch', 'switch', ['track-shape', 'handle-shape']],
  ['navigation-bar', 'Navigation bar', 'navigation-bar', ['container-shape', 'active-indicator-shape']],
  ['segmented-button', 'Segmented button', 'outlined-segmented-button', ['shape']],
  ['badge', 'Badge', 'badge', ['shape', 'large-shape']],
];
const resolve = (raw) => {
  const m = /^md-sys-shape\.\$corner-([a-z-]+)$/.exec(raw);
  if (m) return {ref: `md.sys.shape.corner.${m[1]}`, css: need(m[1])};
  if (/^[\d.]+px(\s+[\d.]+px){0,3}$/.test(raw)) return {ref: null, css: raw, literal: true};
  throw new Error(`unrecognised shape value: ${raw}`);
};
const components = COMPONENTS.map(([id, label, file, names]) => {
  const src = readFileSync(join(sass, `_md-comp-${file}.scss`), 'utf8');
  const tokens = names.map((n) => {
    const m = new RegExp(`^\\$${n}:\\s*([^;]+);`, 'm').exec(src);
    if (!m) throw new Error(`missing $${n} in _md-comp-${file}.scss`);
    return {name: n, ...resolve(m[1].trim())};
  });
  return {id, label, file: `_md-comp-${file}.scss`, tokens};
});

// Cross-check against the rendered page.
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1400, height: 1000}});
const PAGES = {scale: 'https://m3.material.io/styles/shape/corner-radius-scale', principles: 'https://m3.material.io/styles/shape/overview', morph: 'https://m3.material.io/styles/shape/shape-morph'};
const text = {}, landed = {};
for (const [k, url] of Object.entries(PAGES)) {
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});
      await page.waitForTimeout(1500);
      text[k] = await page.evaluate(() => document.body.innerText);
      landed[k] = {requested: url.replace('https://m3.material.io', ''), landedOn: page.url().replace('https://m3.material.io', ''), h1: await page.evaluate(() => document.querySelector('h1')?.innerText ?? '')};
      ok = true;
    } catch (e) { if (attempt === 3) throw e; }
  }
}
await browser.close();
const flat = (s) => s.replace(/\s+/g, ' ');
const scalePage = flat(text.scale);
for (const s of scale.filter((x) => x.name !== 'full')) {
  const label = s.name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  if (!new RegExp(`${label} - ${s.px}dp`).test(scalePage)) throw new Error(`page does not confirm ${label} = ${s.px}dp`);
  s.pageVerified = true;
}
if (!/Full - fully rounded corners/.test(scalePage)) throw new Error('page no longer describes Full as fully rounded');
const quote = (src, re, what) => { const m = re.exec(flat(src)); if (!m) throw new Error(`quote missing: ${what}`); return m[0]; };
const quotes = {
  tenStyles: quote(text.scale, /The Material 3 shape system uses a size-based scale with ten styles\./, 'ten styles'),
  assigned: quote(text.scale, /Styles are assigned to components based on the desired amount of roundedness\./, 'assigned'),
  asymmetric: quote(text.scale, /Asymmetrical shapes are used in M3 components with closely-grouped items, such as menus and split buttons\./, 'asymmetric'),
  customize: quote(text.scale, /Generally, products should consistently use the Material 3 shape styles\. However, customization is sometimes necessary, and even encouraged, for hero moments or custom components\./, 'customization'),
  fullWas50: quote(text.principles, /Updated fully rounded corners to use full\. Previously, this was defined using 50% of the component size\./, 'full was 50%'),
  defaultRounded: quote(text.principles, /Rectangular shapes are fully rounded in all corners by default/, 'default rounded'),
};
if (/responsive|window size|breakpoint/i.test(scalePage)) console.warn('NOTE: the scale page now mentions responsive guidance; review the Responsive story');

writeFileSync(out, JSON.stringify({
  provenance: {
    generatedOn: new Date().toISOString().slice(0, 10),
    packages: {'@material/web': version},
    pages: landed,
    note: 'The nine numeric steps agree between the package and the rendered corner-radius-scale page. `full` (9999px) and the asymmetric tokens are package-only. Component shapes come from @material/web component tokens (package-only). Several shape URLs redirect to one overview-principles page. The pages contain no per-window-class shape guidance, so every responsive statement in the proposal is local.',
  },
  scale, asymmetric, components, quotes,
}, null, 1) + '\n');
console.log('scale', scale.length, 'asymmetric', asymmetric.length, 'components', components.length);
