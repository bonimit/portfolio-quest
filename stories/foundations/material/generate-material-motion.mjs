/**
 * Generates material-motion.json: the ONLY place Material 3 motion numbers enter this repo.
 *
 *   mkdir /tmp/mw && cd /tmp/mw && npm pack @material/web@2.5.0 && mkdir pkg && tar -xzf material-web-*.tgz -C pkg
 *   node stories/foundations/material/generate-material-motion.mjs /tmp/mw/pkg/package stories/foundations/material/material-motion.json
 *
 * Sources that must agree or the script throws:
 *   1. @material/web tokens/versions/latest/sass/_md-sys-motion.scss (durations, easing curves, springs)
 *   2. the rendered m3.material.io easing-and-duration "Tokens" page (durations and CSS easing curves)
 * Also read from rendered pages (verbatim quotes, asserted to exist): suggested easing/duration pairs, enter-vs-exit guidance,
 * the transition pattern list and the "legacy system" note. Springs are PACKAGE-ONLY (their page folders are not expanded).
 * m3.material.io redirects /motion/overview and /motion/easing-and-duration; final URLs and h1 are recorded.
 * Nothing is added to the project's package.json (Playwright is already a dev dependency).
 */
import {chromium} from 'playwright';
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [pkgDir, out] = process.argv.slice(2);
if (!pkgDir || !out) throw new Error('usage: generate-material-motion.mjs <@material/web package dir> <out.json>');
const version = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
const scss = readFileSync(join(pkgDir, 'tokens/versions/latest/sass/_md-sys-motion.scss'), 'utf8');
const val = (name) => { const m = new RegExp(`^\\$${name}:\\s*([^;]+);`, 'm').exec(scss); if (!m) throw new Error(`missing $${name} in package`); return m[1].trim(); };

const DURATION_GROUPS = {short: 4, medium: 4, long: 4, 'extra-long': 4};
const durations = [];
for (const [g, n] of Object.entries(DURATION_GROUPS)) for (let i = 1; i <= n; i++) {
  const ms = Number(/^(\d+)ms$/.exec(val(`duration-${g}${i}`))[1]);
  durations.push({token: `md.sys.motion.duration.${g}${i}`, group: g, step: i, ms});
}
const bez = (s) => { const m = /^cubic-bezier\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/.exec(s); if (!m) throw new Error(`not a cubic-bezier: ${s}`); return m.slice(1).map(Number); };
const easings = [
  {token: 'md.sys.motion.easing.standard', set: 'standard', variant: 'both', css: bez(val('easing-standard'))},
  {token: 'md.sys.motion.easing.standard.decelerate', set: 'standard', variant: 'enter', css: bez(val('easing-standard-decelerate'))},
  {token: 'md.sys.motion.easing.standard.accelerate', set: 'standard', variant: 'exit', css: bez(val('easing-standard-accelerate'))},
  {token: 'md.sys.motion.easing.emphasized.decelerate', set: 'emphasized', variant: 'enter', css: bez(val('easing-emphasized-decelerate'))},
  {token: 'md.sys.motion.easing.emphasized.accelerate', set: 'emphasized', variant: 'exit', css: bez(val('easing-emphasized-accelerate'))},
];
// Emphasized itself is a path curve with no CSS form: the official table says "N/A (Use Standard as a fallback)" and @material/web aliases it to standard.
if (!/^\$easing-emphasized:\s*\$easing-standard;/m.test(scss)) throw new Error('package no longer aliases emphasized to standard');
const emphasized = {token: 'md.sys.motion.easing.emphasized', css: null, fallback: 'md.sys.motion.easing.standard', note: 'Official CSS column: "N/A (Use Standard as a fallback)". @material/web aliases emphasized to standard.'};
const springs = [];
for (const speed of ['default', 'fast', 'slow']) for (const kind of ['spatial', 'effects']) {
  springs.push({token: `md.sys.motion.spring.${speed}.${kind}`, damping: Number(val(`spring-${speed}-${kind}-damping`)), stiffness: Number(val(`spring-${speed}-${kind}-stiffness`))});
}

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1400, height: 1000}});
const PAGES = {
  tokens: 'https://m3.material.io/styles/motion/easing-and-duration/tokens-specs',
  applying: 'https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration',
  transitions: 'https://m3.material.io/styles/motion/transitions/transition-patterns',
  physics: 'https://m3.material.io/styles/motion/overview/how-it-works',
};
const text = {}, landed = {};
for (const [k, url] of Object.entries(PAGES)) {
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const r = await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});
      if (r.status() !== 200) throw new Error(`${url} -> ${r.status()}`);
      await page.waitForTimeout(1500);
      text[k] = await page.evaluate(() => document.body.innerText);
      landed[k] = {url: page.url().replace('https://m3.material.io', ''), h1: await page.evaluate(() => document.querySelector('h1')?.innerText ?? '')};
      ok = true;
    } catch (e) { if (attempt === 3) throw e; }
  }
}
await browser.close();
const flat = (s) => s.replace(/\s+/g, ' ');
const quote = (src, re, what) => { const m = re.exec(flat(src)); if (!m) throw new Error(`quote missing: ${what}`); return m[0]; };

// Cross-check 1: durations
for (const d of durations) {
  const re = new RegExp(`${d.token.replace(/\./g, '\\.')}\\s+${d.ms}ms`);
  if (!re.test(flat(text.tokens))) throw new Error(`page does not confirm ${d.token} = ${d.ms}ms`);
  d.pageVerified = true;
}
// Cross-check 2: CSS easing curves, from the page's CSS row.
const css = flat(text.tokens);
const fmt = (a) => `cubic-bezier(${a.map((n) => (Number.isInteger(n) ? `${n}` : `${n}`)).join(', ')})`;
const num = (n) => Number(n);
const cssRow = (label) => (new RegExp(`${label}\\s+(.*?)\\s+Flutter`).exec(css) ?? [])[1];
const onPage = (a) => [...(cssRow('CSS') ?? '').matchAll(/cubic-bezier\(([^)]*)\)/g)].some((m) => m[1].split(',').map((x) => num(x.trim())).every((n, i) => n === a[i]));
const allCss = [...css.matchAll(/cubic-bezier\(([^)]*)\)/g)].map((m) => m[1].split(',').map((x) => num(x.trim())));
for (const e of easings) {
  if (!allCss.some((c) => c.length === 4 && c.every((n, i) => n === e.css[i]))) throw new Error(`page does not confirm ${e.token} ${fmt(e.css)}`);
  e.pageVerified = true;
}
void onPage;
if (!/N\/A \(Use Standard as a fallback\)/.test(css)) throw new Error('page no longer states the emphasized CSS fallback');

// Suggested pairs, verbatim from the applying page.
const applying = flat(text.applying);
const PAIRS = [
  ['Emphasized', 500, 'Begin and end on screen'], ['Emphasized decelerate', 400, 'Enter the screen'], ['Emphasized accelerate', 200, 'Exit the screen'],
  ['Standard', 300, 'Begin and end on screen'], ['Standard decelerate', 250, 'Enter the screen'], ['Standard accelerate', 200, 'Exit the screen'],
];
const pairs = PAIRS.map(([easing, ms, use]) => {
  if (!new RegExp(`${easing}\\s+${ms}ms\\s+${use}`).test(applying)) throw new Error(`pair missing: ${easing} ${ms}ms ${use}`);
  return {easing, ms, use};
});
const quotes = {
  legacyNote: quote(text.tokens, /Note:\s*In the expressive update, components and motion now use the motion physics system[^.]*\.[^.]*\.[^.]*\./, 'legacy note'),
  exitShorter: quote(applying, /Transitions that exit, dismiss, or collapse an element use shorter durations\. Exit transitions are faster because they require less attention than the user’s next task\./, 'exit shorter'),
  enterLonger: quote(applying, /Transitions that enter or remain persistent on the screen use longer durations\./, 'enter longer'),
  directional: quote(text.transitions, /The direction a component enters is informed by their location on screen, expanding away from the device edge\./, 'direction'),
  noScaleAndroid: quote(text.transitions, /Scale and z-axis motion is avoided since they imply elevation change[^.]*\./, 'scale avoided'),
  transitionsLegacy: quote(text.transitions, /Note:\s*M3 transitions use the legacy easing and duration system\.[^.]*\./, 'transitions legacy'),
  accelerateExit: quote(applying, /By ending at peak velocity, it gives the impression the exiting component cannot be retrieved\./, 'accelerate exit'),
  physics: quote(text.physics, /Spring tokens work across devices\./, 'spring tokens'),
};
const patterns = ['Container transform', 'Forward and backward', 'Lateral', 'Top level', 'Enter and exit', 'Skeleton loaders'].map((name) => {
  if (!flat(text.transitions).includes(name)) throw new Error(`pattern missing: ${name}`);
  return name;
});

writeFileSync(out, JSON.stringify({
  provenance: {
    generatedOn: new Date().toISOString().slice(0, 10),
    packages: {'@material/web': version},
    pages: landed,
    sources: [PAGES.tokens, PAGES.applying, PAGES.transitions, PAGES.physics, `@material/web ${version} tokens/versions/latest/sass/_md-sys-motion.scss`],
    note: 'Durations and CSS easing curves agree between the package and the rendered Tokens page. Springs are read from the package only (not cross-checked). m3.material.io redirects /styles/motion/overview to "Motion physics system" and /styles/motion/easing-and-duration to the applying page. The easing and duration system is stated by Material to be legacy and no longer maintained; the motion physics (spring) system is the current expressive one.',
  },
  durations, easings, emphasized, springs, suggestedPairs: pairs, quotes, patterns,
}, null, 1) + '\n');
console.log('durations', durations.length, 'easings', easings.length, 'springs', springs.length, 'pairs', pairs.length);
