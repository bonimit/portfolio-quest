/**
 * Generates material-typography.json: the ONLY place Material 3 type-scale numbers enter this repo.
 *
 *   mkdir /tmp/mw && cd /tmp/mw && npm pack @material/web@2.5.0 && mkdir pkg && tar -xzf material-web-*.tgz -C pkg
 *   node stories/foundations/material/generate-material-typography.mjs /tmp/mw/pkg/package stories/foundations/material/material-typography.json
 *
 * Two independent sources must agree or the script throws:
 *   1. @material/web tokens/versions/latest/sass/_md-sys-typescale.scss (rem; 1rem = 16px)
 *   2. the rendered m3.material.io/styles/typography/type-scale-tokens page (sp/pt), after expanding every style folder.
 * Only size and line height are exported as the proposal baseline. Material's font, weight and tracking are recorded as
 * reference ("not adopted") because the owner preserves the existing typography character.
 * Nothing is added to the project's package.json (Playwright is already a dev dependency).
 */
import {chromium} from 'playwright';
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [pkgDir, out] = process.argv.slice(2);
if (!pkgDir || !out) throw new Error('usage: generate-material-typography.mjs <@material/web package dir> <out.json>');
const version = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
const scss = readFileSync(join(pkgDir, 'tokens/versions/latest/sass/_md-sys-typescale.scss'), 'utf8');
const GROUPS = ['display', 'headline', 'title', 'body', 'label'];
const STEPS = ['large', 'medium', 'small'];
const rem = (name) => {
  const m = new RegExp(`^\\$${name}:\\s*([\\d.]+)rem;`, 'm').exec(scss);
  if (!m) throw new Error(`missing ${name} in package`);
  return Math.round(Number(m[1]) * 16 * 1000) / 1000;
};
const raw = (name) => {
  const m = new RegExp(`^\\$${name}:\\s*([^;]+);`, 'm').exec(scss);
  if (!m) throw new Error(`missing ${name} in package`);
  return m[1].trim();
};

const roles = [];
for (const g of GROUPS) for (const s of STEPS) {
  const k = `${g}-${s}`;
  roles.push({
    role: k, group: g, step: s,
    sizePx: rem(`${k}-size`), lineHeightPx: rem(`${k}-line-height`),
    referenceOnly: {weight: raw(`${k}-weight`), tracking: raw(`${k}-tracking`), font: raw(`${k}-font`)},
  });
}

// Independent check against the rendered official page.
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1400, height: 1000}});
let text = '';
for (let attempt = 1; attempt <= 3 && !text; attempt++) {
  try {
    await page.goto('https://m3.material.io/styles/typography/type-scale-tokens', {waitUntil: 'networkidle', timeout: 60000});
    await page.waitForTimeout(2000);
    for (const g of GROUPS) { try { await page.getByText(`${g[0].toUpperCase()}${g.slice(1)} styles`, {exact: true}).first().click({timeout: 3000}); } catch { /* folder already open */ } }
    await page.waitForTimeout(500);
    for (const g of GROUPS) for (const s of STEPS) {
      const title = `${g[0].toUpperCase()}${g.slice(1)} styles / ${g[0].toUpperCase()}${g.slice(1)} ${s[0].toUpperCase()}${s.slice(1)}`;
      await page.getByText(title, {exact: true}).first().click({timeout: 4000});
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(800);
    text = await page.evaluate(() => document.body.innerText);
  } catch (e) { if (attempt === 3) throw e; }
}
const overview = await (async () => {
  await page.goto('https://m3.material.io/styles/typography/overview', {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForTimeout(1500);
  return page.evaluate(() => document.body.innerText);
})();
await browser.close();

const flat = (s) => s.replace(/\s+/g, ' ');
const title = (r) => `${r.group[0].toUpperCase()}${r.group.slice(1)} ${r.step[0].toUpperCase()}${r.step.slice(1)}`;
for (const r of roles) {
  const t = title(r);
  const size = new RegExp(`([\\d.]+)(?:pt|sp)\\s+${t} font size`).exec(flat(text));
  const lh = new RegExp(`([\\d.]+)(?:pt|sp)\\s+${t} line height`).exec(flat(text));
  if (!size || !lh) throw new Error(`official page value missing for ${t}`);
  if (Number(size[1]) !== r.sizePx || Number(lh[1]) !== r.lineHeightPx) {
    throw new Error(`package/page disagree for ${t}: package ${r.sizePx}/${r.lineHeightPx}, page ${size[1]}/${lh[1]}`);
  }
  r.pageVerified = true;
}
const quote = (src, re, what) => { const m = re.exec(flat(src)); if (!m) throw new Error(`quote missing: ${what}`); return m[0]; };

writeFileSync(out, JSON.stringify({
  provenance: {
    generatedOn: new Date().toISOString().slice(0, 10),
    packages: {'@material/web': version},
    sources: [
      'https://m3.material.io/styles/typography/type-scale-tokens (expanded folders, rendered with Playwright)',
      'https://m3.material.io/styles/typography/overview',
      `@material/web ${version} tokens/versions/latest/sass/_md-sys-typescale.scss`,
    ],
    note: 'Size and line height agree between the package and the rendered official page for all 15 baseline roles. 1sp = 1px = 1/16 rem on web (official conversion). Font, weight and tracking are reference only and are NOT adopted. Material publishes no per-window-class type sizes: every responsive value in the proposal is a local adaptation.',
    unitConversion: quote(overview + ' ' + text, /Web browsers calculate the REM[^.]*\.[^.]*SP_SIZE\/16 = rem\./, 'rem conversion'),
  },
  roles,
}, null, 1) + '\n');
console.log('roles:', roles.length, 'all page-verified');
