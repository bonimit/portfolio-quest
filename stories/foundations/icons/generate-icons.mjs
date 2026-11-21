/**
 * Generates assets/material-symbols-rounded.woff2 and icons.json: the ONLY place Material Symbols data enters this repo.
 *
 *   node stories/foundations/icons/generate-icons.mjs
 *
 * What it does, and what it refuses to do:
 *   1. Reads the icon catalog from https://fonts.google.com/metadata/icons?key=material_symbols (an UNDOCUMENTED endpoint; only the
 *      derived JSON is committed, never the 5.8 MB response).
 *   2. Picks the icons this system needs plus the most popular Rounded-supported icons, sorted alphabetically (the documented
 *      requirement for `icon_names`).
 *   3. Requests ONE subset of "Material Symbols Rounded" from the Google Fonts CSS2 API with the variable axes opsz 20..48,
 *      FILL 0..1 (weight and grade fixed at 400 / 0) using a Chrome user-agent, downloads the woff2 and asserts the wOF2 magic.
 *   4. Renders EVERY requested ligature in a real browser: a missing ligature draws as word-width text instead of a square glyph.
 *      Throws on any miss.
 *   5. Proves the FILL axis is real: renders glyphs at FILL 0 and FILL 1 and compares ink. Throws if filled does not carry more ink.
 * Nothing is added to the project's package.json (Playwright is already a dev dependency).
 */
import {chromium} from 'playwright';
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const FAMILY = 'Material Symbols Rounded';
const BUNDLE_TARGET = 260;

/** Icons the proposal itself uses (components, navigation, states, status). Missing ones make the script fail. */
const REQUIRED = ['add', 'arrow_back', 'arrow_forward', 'arrow_upward', 'article', 'bookmark', 'brush', 'cancel', 'chat', 'check', 'check_circle', 'chevron_left', 'chevron_right',
  'close', 'code', 'content_copy', 'dark_mode', 'dashboard', 'delete', 'download', 'edit', 'error', 'explore', 'favorite', 'filter_list', 'flag', 'folder',
  'grid_view', 'help', 'home', 'image', 'info', 'keyboard_arrow_down', 'keyboard_arrow_up', 'language', 'lightbulb', 'light_mode', 'link', 'lock', 'mail', 'map', 'menu', 'more_horiz', 'more_vert', 'navigation', 'notifications',
  'open_in_new', 'palette', 'pause', 'person', 'play_arrow', 'remove', 'science', 'search', 'send', 'settings', 'share', 'sort', 'sports_esports', 'star', 'thumb_up', 'travel_explore',
  'tune', 'upload', 'videogame_asset', 'view_list', 'visibility', 'visibility_off', 'warning', 'work'];

const metaRes = await fetch('https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true', {headers: {'user-agent': UA}});
if (!metaRes.ok) throw new Error(`metadata ${metaRes.status}`);
const metaText = await metaRes.text();
const meta = JSON.parse(metaText.slice(metaText.indexOf('{')));
const supported = meta.icons.filter((i) => !(i.unsupported_families ?? []).includes(FAMILY));
const byName = new Map(supported.map((i) => [i.name, i]));
for (const n of REQUIRED) if (!byName.has(n)) throw new Error(`required icon not available in ${FAMILY}: ${n}`);
const chosen = new Map(REQUIRED.map((n) => [n, byName.get(n)]));
for (const i of [...supported].sort((a, b) => b.popularity - a.popularity)) { if (chosen.size >= BUNDLE_TARGET) break; chosen.set(i.name, i); }
const names = [...chosen.keys()].sort();

const AXES = 'opsz,wght,FILL,GRAD@20..48,400,0..1,0';
const cssUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:${AXES}&icon_names=${names.join(',')}&display=block`;
const cssRes = await fetch(cssUrl, {headers: {'user-agent': UA}});
if (!cssRes.ok) throw new Error(`css2 ${cssRes.status}`);
const css = await cssRes.text();
const fontUrl = /url\(([^)]+)\)\s*format\('woff2'\)/.exec(css)?.[1];
if (!fontUrl) throw new Error('no woff2 url in the CSS response');
const version = /[?&]v=(v\d+)/.exec(fontUrl)?.[1] ?? 'unknown';
const buf = Buffer.from(await (await fetch(fontUrl, {headers: {'user-agent': UA}})).arrayBuffer());
if (buf.subarray(0, 4).toString('latin1') !== 'wOF2') throw new Error('response is not a woff2 file');
mkdirSync(join(here, 'assets'), {recursive: true});
writeFileSync(join(here, 'assets/material-symbols-rounded.woff2'), buf);
const sha256 = createHash('sha256').update(buf).digest('hex');

// ---- render every ligature; prove FILL is a real axis
const b64 = buf.toString('base64');
const html = `<!doctype html><meta charset=utf-8><style>
@font-face{font-family:"MSR";src:url(data:font/woff2;base64,${b64}) format("woff2");font-weight:400;}
.i{font-family:"MSR";font-size:48px;line-height:1;display:inline-block;white-space:nowrap;font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 48;font-feature-settings:'liga';}
.i.f{font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 48;}
body{background:#fff;color:#000;margin:0}
</style><body>${names.map((n) => `<span class="i" data-n="${n}">${n}</span>`).join('')}<br>
<span id="o" class="i">favorite</span><span id="f" class="i f">favorite</span><span id="o2" class="i">settings</span><span id="f2" class="i f">settings</span>`;
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1600, height: 1000}});
await page.setContent(html);
await page.evaluate(() => document.fonts.load('48px "MSR"', 'a'));
await page.evaluate(() => document.fonts.ready);
const widths = await page.evaluate(() => [...document.querySelectorAll('[data-n]')].map((e) => ({n: e.dataset.n, w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height})));
const misses = widths.filter((x) => Math.abs(x.w - x.h) > 2 || x.w > 60);
if (misses.length) throw new Error(`ligatures not rendered as glyphs: ${misses.map((m) => `${m.n}(${Math.round(m.w)}px)`).join(', ')}`);
const ink = async (sel) => {
  const png = await (await page.$(sel)).screenshot({omitBackground: false});
  return page.evaluate(async (b) => {
    const img = new Image(); img.src = `data:image/png;base64,${b}`; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 255 - d[i];
    return s / 255;
  }, png.toString('base64'));
};
const fillCheck = [];
for (const [o, f, name] of [['#o', '#f', 'favorite'], ['#o2', '#f2', 'settings']]) {
  const a = await ink(o), b = await ink(f);
  fillCheck.push({name, outlineInk: Math.round(a), filledInk: Math.round(b), ratio: Math.round((b / a) * 100) / 100});
  if (!(b > a * 1.15)) throw new Error(`FILL axis did not change the glyph for ${name}: ink ${a} vs ${b}`);
}
await browser.close();

writeFileSync(join(here, 'icons.json'), JSON.stringify({
  provenance: {
    generatedOn: new Date().toISOString().slice(0, 10),
    family: FAMILY,
    request: cssUrl,
    cssVersion: version,
    userAgentSent: 'desktop Chrome (needed so Google serves woff2)',
    fontBytes: buf.length, fontSha256: sha256, fontFormat: 'woff2 (wOF2 magic asserted)',
    axes: {opsz: '20..48 (variable)', FILL: '0..1 (variable)', wght: '400 (fixed)', GRAD: '0 (fixed)'},
    metadataSource: 'https://fonts.google.com/metadata/icons?key=material_symbols (undocumented endpoint; only derived data is stored)',
    docs: ['https://developers.google.com/fonts/docs/material_symbols', 'https://github.com/google/material-design-icons'],
    license: 'Apache License 2.0 (stated on the Google Fonts documentation page and the google/material-design-icons README)',
    bundledCount: names.length, catalogCount: supported.length,
    verification: {ligaturesRenderedAsGlyphs: names.length, fillAxis: fillCheck},
  },
  required: REQUIRED,
  icons: names.map((n) => { const i = chosen.get(n); return {name: n, codepoint: i.codepoint.toString(16), categories: i.categories, tags: i.tags, popularity: i.popularity}; }),
  catalog: supported.map((i) => i.name).sort(),
}, null, 1) + '\n');
console.log(`bundled ${names.length} of ${supported.length} icons; font ${buf.length} bytes ${version}; fill check`, JSON.stringify(fillCheck));
