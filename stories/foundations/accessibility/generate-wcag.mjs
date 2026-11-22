/**
 * Generates wcag.json: the ONLY place WCAG 2.2 criterion text and numbers enter this repo.
 *   node stories/foundations/accessibility/generate-wcag.mjs
 * Loads https://www.w3.org/TR/WCAG22/ with Playwright (already a dev dependency), reads each success criterion's title, level and
 * normative text by id, and ASSERTS the thresholds the stories rely on (a change upstream makes this throw).
 * Nothing here claims conformance; it records what the criteria say.
 */
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), 'wcag.json');
const URL_ = 'https://www.w3.org/TR/WCAG22/';
// [id on the page, expected number, level, [regexes that must appear in the normative text]]
const SC = [
  ['non-text-content', '1.1.1', 'A', [/text alternative/i]],
  ['use-of-color', '1.4.1', 'A', [/color is not used as the only visual means/i]],
  ['contrast-minimum', '1.4.3', 'AA', [/4\.5:1/, /3:1/]],
  ['resize-text', '1.4.4', 'AA', [/200 percent/i]],
  ['reflow', '1.4.10', 'AA', [/320 CSS pixels/i]],
  ['non-text-contrast', '1.4.11', 'AA', [/3:1/]],
  ['text-spacing', '1.4.12', 'AA', [/1\.5 times/i, /2 times/i, /0\.12 times/i, /0\.16 times/i]],
  ['keyboard', '2.1.1', 'A', [/keyboard interface/i]],
  ['pause-stop-hide', '2.2.2', 'A', [/five seconds/i]],
  ['animation-from-interactions', '2.3.3', 'AAA', [/motion animation/i]],
  ['focus-visible', '2.4.7', 'AA', [/keyboard focus indicator/i]],
  ['focus-not-obscured-minimum', '2.4.11', 'AA', [/not entirely hidden/i]],
  ['target-size-enhanced', '2.5.5', 'AAA', [/44 by 44 CSS pixels/i]],
  ['target-size-minimum', '2.5.8', 'AA', [/24 by 24 CSS pixels/i]],
  ['name-role-value', '4.1.2', 'A', [/name and role/i]],
];
const browser = await chromium.launch();
const page = await browser.newPage();
let ok = false;
for (let i = 1; i <= 3 && !ok; i++) { try { await page.goto(URL_, {waitUntil: 'domcontentloaded', timeout: 90000}); await page.waitForSelector('#contrast-minimum', {timeout: 60000}); ok = true; } catch (e) { if (i === 3) throw e; } }
const rows = [];
for (const [id, num, level, must] of SC) {
  const r = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const sec = el.closest('section') ?? el.parentElement;
    const h = sec.querySelector('h4, h3');
    const clone = sec.cloneNode(true);
    clone.querySelectorAll('.change, .note, .example, .wcag-note, details, nav, h4, h3').forEach(n => n.remove());
    return {title: (h?.innerText ?? '').replace(/\s+/g, ' ').trim(), text: clone.innerText.replace(/\s+/g, ' ').trim()};
  }, id);
  if (!r) throw new Error(`criterion ${id} not found on the page`);
  for (const re of must) if (!re.test(r.text)) throw new Error(`${num} ${id}: expected ${re} in the normative text`);
  if (!r.title.includes(num)) throw new Error(`${id}: heading "${r.title}" does not contain ${num}`);
  const lv = /\(Level (A+)\)/.exec(r.text)?.[1];
  if (lv !== level) throw new Error(`${num}: page says Level ${lv}, expected ${level}`);
  const title = r.title.split(' | ')[0].replace(/^Success Criterion /, '');
  rows.push({id, number: num, level, title, text: r.text.replace(/^.*?\(Level A+\)\s*/, '').slice(0, 700), url: `${URL_}#${id}`});
}
await browser.close();
writeFileSync(out, JSON.stringify({generatedOn: new Date().toISOString().slice(0, 10), source: URL_, note: 'WCAG 2.2 text as rendered by w3.org on the generated date. Levels are asserted by the generator through the criterion list below. No conformance is claimed anywhere in Storybook.', criteria: rows}, null, 1) + '\n');
console.log('criteria', rows.length);
for (const r of rows) console.log(r.number, r.level, '|', r.title, '|', r.text.slice(0, 90));
