/**
 * Generates material-spacing.json: the ONLY place Material 3 spacing numbers enter this repo.
 *
 *   mkdir /tmp/mw && cd /tmp/mw && npm pack @material/web@2.5.0 && mkdir pkg && tar -xzf material-web-*.tgz -C pkg
 *   node stories/foundations/material/generate-material-spacing.mjs /tmp/mw/pkg/package stories/foundations/material/material-spacing.json
 *
 * m3.material.io is JavaScript-rendered, so pages are rendered with the project's existing Playwright dev dependency
 * (no package.json change). Text AND image alt text are read, because some values live in alt text.
 * The script throws on any missing or unparsable value rather than writing a partial file.
 */
import {chromium} from 'playwright';
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [pkgDir, out] = process.argv.slice(2);
if (!pkgDir || !out) throw new Error('usage: generate-material-spacing.mjs <@material/web package dir> <out.json>');
const need = (v, what) => { if (v === null || v === undefined || Number.isNaN(v)) throw new Error(`could not extract: ${what}`); return v; };
const num = (m, what) => need(m ? Number(m[1]) : null, what);

const URLS = {
  tokens: 'https://m3.material.io/styles/spacing/tokens',
  overview: 'https://m3.material.io/styles/spacing/overview',
  applying: 'https://m3.material.io/styles/spacing/applying-spacing',
  breakpoints: 'https://m3.material.io/foundations/layout/breakpoints',
  compact: 'https://m3.material.io/foundations/layout/breakpoints/compact',
  medium: 'https://m3.material.io/foundations/layout/breakpoints/medium',
  expanded: 'https://m3.material.io/foundations/layout/breakpoints/expanded',
  largeXl: 'https://m3.material.io/foundations/layout/breakpoints/large-extra-large',
  density: 'https://m3.material.io/foundations/layout/grids-spacing/density',
};
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1400, height: 1000}});
const text = {};
for (const [k, url] of Object.entries(URLS)) {
  let r;
  for (let attempt = 1; attempt <= 3 && !r; attempt++) { try { r = await page.goto(url, {waitUntil: 'networkidle', timeout: 60000}); } catch (e) { if (attempt === 3) throw e; } }
  if (r.status() !== 200) throw new Error(`${url} -> ${r.status()}`);
  await page.waitForTimeout(1500);
  text[k] = await page.evaluate(() => document.body.innerText + '\n' + [...document.querySelectorAll('img[alt],[aria-label],figcaption')].map(e => e.getAttribute('alt') || e.getAttribute('aria-label') || e.textContent || '').join('\n'));
}
await browser.close();
const flat = s => s.replace(/\s+/g, ' ');

// 1. System spacing scale
const scale = [...flat(text.tokens).matchAll(/(\d+)dp Space (\d+)/g)].map(m => ({token: `space${m[2]}`, label: `Space ${m[2]}`, dp: Number(m[1])}));
if (scale.length < 15) throw new Error(`expected the full spacing scale, got ${scale.length}`);
const baseUnit = num(/md\.sys\.measurement\.space100 is (\d+)dp/.exec(flat(text.tokens)), 'base unit');
for (const s of scale) if (s.dp !== baseUnit * Number(s.token.slice(5)) / 100) throw new Error(`scale not linear at ${s.token}`);
const quote = (src, re, what) => { const m = re.exec(flat(src)); if (!m) throw new Error(`quote missing: ${what}`); return m[0]; };
const quotes = {
  composeOnly: quote(text.tokens, /The spacing system tokens are only used on Jetpack Compose\./, 'compose only'),
  webUnavailable: quote(text.overview, /Web Unavailable|Web\s+Unavailable/, 'web unavailable'),
  nested: quote(text.tokens, /Values other than multiples of 8 are also used[^.]*\./, 'nested units'),
  textScale: quote(text.applying, /When text is scaled up to 200%, the same spacing should be preserved by default\./, '200% text'),
  multiplier: quote(text.applying, /Follow the multiplier pattern for new space tokens, so space225 = 18dp \(8dp x 2\.25\)\./, 'multiplier'),
  adaptive: quote(text.applying, /Adaptive layout: Map the spacing to different system tokens for each device type[^.]*\./, 'adaptive'),
  lineLength: quote(text.breakpoints, /keep text between 40–60 characters per line\./, 'line length'),
  density: quote(text.density, /Higher density is typically applied by decreasing the top and bottom padding or overall height by 4dp\./, 'density'),
  buttonTarget: quote(text.density, /Button with height of 36dp and interaction target of 48dp\./, 'button target'),
};

// 2. Breakpoints
const bp = flat(text.breakpoints);
const breakpoints = {
  compact: {min: 0, max: num(/Compact Under (\d+)dp/.exec(bp), 'compact max') - 1},
  medium: {min: num(/Medium (\d+)–\d+dp/.exec(bp), 'medium min'), max: num(/Medium \d+–(\d+)dp/.exec(bp), 'medium max')},
  expanded: {min: num(/Expanded (\d+)–\d+dp/.exec(bp), 'expanded min'), max: num(/Expanded \d+–(\d+)dp/.exec(bp), 'expanded max')},
  large: {min: num(/Large (\d+)–\d+dp/.exec(bp), 'large min'), max: num(/Large \d+–(\d+)dp/.exec(bp), 'large max')},
  extraLarge: {min: num(/Extra-large (\d+)dp\+/.exec(bp), 'xl min'), max: null},
};
// 3. Layout margins / spacers / fixed panes
const m = k => flat(text[k]);
const layout = {
  compact: {margin: num(/Margins are (\d+)dp from the leading and trailing edge/.exec(m('compact')), 'compact margin')},
  medium: {margin: num(/Medium layouts have margins of (\d+)dp/.exec(m('medium')), 'medium margin'), spacer: num(/spacer between panes is also (\d+)dp/.exec(m('medium')), 'medium spacer')},
  expanded: {margin: num(/leading and trailing margin of (\d+)dp/.exec(m('expanded')), 'expanded margin'), spacer: num(/spacer between panes is (\d+)dp/.exec(m('expanded')), 'expanded spacer'), fixedPane: num(/fixed pane should have a width of (\d+)dp/.exec(m('expanded')), 'expanded fixed pane')},
  large: {margin: num(/Large and extra-large layouts have a leading and trailing margin of (\d+)dp/.exec(m('largeXl')), 'large margin'), spacer: num(/spacer between panes is (\d+)dp/.exec(m('largeXl')), 'large spacer'), fixedPane: num(/fixed pane should have a width of (\d+)dp/.exec(m('largeXl')), 'large fixed pane')},
};
layout.extraLarge = {...layout.large};
const panes = {compact: '1', medium: '1 (recommended) or 2', expanded: '1 or 2 (recommended)', large: '1 or 2 (recommended)', extraLarge: '1 to 3 (recommended)'};
for (const [k, v] of Object.entries(panes)) if (!bp.includes(v)) throw new Error(`panes row not found for ${k}`);

// 4. Component values from @material/web (legacy "-space" token naming)
const px = (file, key) => {
  const src = readFileSync(join(pkgDir, 'tokens', `_md-comp-${file}.scss`), 'utf8');
  const r = new RegExp(`'${key}':\\s*if\\(\\$exclude-hardcoded-values,\\s*null,\\s*(\\d+)px\\)`).exec(src);
  if (!r) throw new Error(`token ${file}.${key} not found`);
  return Number(r[1]);
};
const component = {
  'filled-button': ['leading-space', 'trailing-space', 'with-leading-icon-leading-space', 'with-leading-icon-trailing-space', 'icon-size'],
  'outlined-button': ['leading-space', 'trailing-space'],
  'text-button': ['leading-space', 'trailing-space'],
  'assist-chip': ['leading-space', 'trailing-space', 'icon-label-space', 'with-leading-icon-leading-space'],
  'filter-chip': ['leading-space', 'trailing-space', 'icon-label-space'],
  'filled-text-field': ['leading-space', 'trailing-space', 'top-space', 'bottom-space', 'icon-input-space', 'with-label-top-space', 'with-label-bottom-space'],
  'outlined-text-field': ['leading-space', 'trailing-space', 'top-space', 'bottom-space', 'icon-input-space'],
  menu: ['top-space', 'bottom-space'],
  'list-item': ['top-space', 'bottom-space'],
};
const components = {};
for (const [file, keys] of Object.entries(component)) {
  components[file] = {};
  for (const k of keys) {
    try { components[file][k] = px(file, k); } catch (e) {
      // some tokens alias another token (value inherited); record as null only for the optional alias keys
      if (/with-|icon-size/.test(k)) components[file][k] = null; else throw e;
    }
  }
}
// Default container heights are compiled into the component CSS as var() fallbacks.
const height = (cssFile, prop) => {
  const r = new RegExp(`${prop},\\s*(\\d+)px`).exec(readFileSync(join(pkgDir, cssFile), 'utf8'));
  return num(r, `${cssFile} ${prop}`);
};
components['filled-button']['container-height'] = height('button/internal/filled-styles.css', '--md-filled-button-container-height');
components['assist-chip']['container-height'] = height('chips/internal/assist-styles.css', '--md-assist-chip-container-height');
components['filter-chip']['container-height'] = height('chips/internal/filter-styles.css', '--md-filter-chip-container-height');
const dialogScss = readFileSync(join(pkgDir, 'dialog/internal/_dialog.scss'), 'utf8');
const dlg = re => { const r = re.exec(dialogScss); if (!r) throw new Error(`dialog rule missing: ${re}`); return r[1].trim(); };
const dialog = {
  headerPadding: dlg(/padding:\s*(24px 24px 0);/), contentPadding: dlg(/padding:\s*(24px);/), actionsPadding: dlg(/padding:\s*(16px 24px 24px);/),
  gap: Number(dlg(/gap:\s*(8px);/).replace('px', '')),
};
const touch = /max\((\d+)px, 100%\)/.exec(readFileSync(join(pkgDir, 'button/internal/_touch-target.scss'), 'utf8'));
const touchTarget = num(touch, 'touch target');
const pkgVersion = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;

writeFileSync(out, JSON.stringify({
  provenance: {
    retrievedOn: new Date().toISOString().slice(0, 10),
    pages: URLS,
    package: `@material/web ${pkgVersion}`,
    note: 'System spacing tokens are published for Jetpack Compose (Web listed "Unavailable"). Component values come from the Material Web package and use the legacy "-space" token naming; Material states new tokens will use padding/margin/gap. Every web mapping (1dp = 1px, rem output, semantic names) is a local adaptation.',
  },
  quotes, baseUnit, scale, breakpoints, layout, panes, components, dialog, touchTarget,
}, null, 1) + '\n');
console.log('scale', scale.length, 'base', baseUnit, 'bp', Object.keys(breakpoints).length, 'touch', touchTarget);
