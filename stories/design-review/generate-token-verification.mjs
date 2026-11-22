/**
 * Generates token-verification.json: a static scan of the foundations source (read-only). Run:
 *   node stories/design-review/generate-token-verification.mjs
 * Records: which --pq*-* custom properties are REFERENCED (var(...)) and where, which are DEFINED statically (CSS declarations or quoted TS keys),
 * dynamic references that cannot be resolved by text, and hex color literals in CSS/TS/TSX. The Token Verification story then resolves
 * the remaining names at runtime from the real var injectors (carbon, depth, spacing, shape) so nothing is guessed.
 * Scope: stories/foundations (+ stories/design-review). Excludes stories/review (separate gated workflow), JSON data and generated files.
 */
import {readdirSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '../..');
const roots = ['stories/foundations', 'stories/design-review', 'stories/components', 'stories/patterns', 'stories/templates'].map(r => join(repo, r)).filter(p => { try { return statSync(p).isDirectory(); } catch { return false; } });
const files = [];
(function walk(d) { for (const e of readdirSync(d, {withFileTypes: true})) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(css|ts|tsx)$/.test(e.name)) files.push(p); } })(roots[0]);
for (const r of roots.slice(1)) (function walk(d) { for (const e of readdirSync(d, {withFileTypes: true})) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(css|ts|tsx)$/.test(e.name)) files.push(p); } })(r);

const refs = new Map(), noFallback = new Set(), cssDefined = new Set(), tsLiteral = new Set(), templates = new Set(), dynamic = [], hex = [];
let scanned = 0;
for (const f of files) {
  const rel = relative(repo, f);
  if (/token-verification\.json$/.test(rel) || /generate-/.test(rel) || /\.stories\.tsx$/.test(rel)) continue; // tests mention names on purpose
  scanned++;
  const text = readFileSync(f, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--pq[a-z]+-[a-z0-9-]*)(\$\{)?\s*(,)?/g)) {
      const name = m[1];
      if (name.endsWith('-') || m[2]) dynamic.push({file: rel, line: i + 1, text: name + '…'}); else { (refs.get(name) ?? refs.set(name, new Set()).get(name)).add(rel); if (!m[3]) noFallback.add(name); }
    }
    // Names DEFINED from a template string (e.g. `--pqt-${group}-${step}-size`): recorded as patterns so they can be matched transparently.
    if (!/\.css$/.test(f)) for (const m of line.matchAll(/[`'"](--pq[a-z]+-[^`'"]*\$\{[^`'"]*)[`'"]/g)) templates.add(m[1]);
    if (/\.css$/.test(f)) for (const m of line.matchAll(/(--pq[a-z]+-[a-z0-9-]+)\s*:/g)) cssDefined.add(m[1]);
    else for (const m of line.matchAll(/['"`](--pq[a-z]+-[a-z0-9-]+)['"`]/g)) tsLiteral.add(m[1]);
    if (!/&#/.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line)) for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) hex.push({file: rel, line: i + 1, text: m[0]});
  });
}
const prefixes = {};
for (const n of [...refs.keys(), ...cssDefined, ...tsLiteral]) { const p = /^--(pq[a-z]+)-/.exec(n)[1]; prefixes[p] = (prefixes[p] ?? 0) + 1; }
writeFileSync(join(here, 'token-verification.json'), JSON.stringify({
  generatedOn: new Date().toISOString().slice(0, 10), scope: roots.map(r => relative(repo, r)), excluded: ['stories/review/**', '*.stories.tsx', 'generate-*.mjs', 'JSON data'],
  filesScanned: scanned, prefixes,
  references: [...refs].map(([name, fs]) => ({name, files: [...fs].sort(), fallback: !noFallback.has(name)})).sort((a, b) => a.name.localeCompare(b.name)),
  cssDefined: [...cssDefined].sort(), tsLiteral: [...tsLiteral].sort(), templates: [...templates].sort(), dynamic, hex,
}, null, 1) + '\n');
console.log('scanned', scanned, 'prefixes', prefixes, 'refs', refs.size, 'cssDefined', cssDefined.size, 'tsLiteral', tsLiteral.size, 'templates', templates.size, 'dynamic', dynamic.length, 'hex', hex.length);
