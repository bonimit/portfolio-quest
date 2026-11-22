/**
 * Generates illustration-audit.json: a READ-ONLY, measured audit of existing artwork. Nothing under public/, app/, components/ or lib/ is changed.
 *
 *   node stories/foundations/illustrations/generate-illustration-audit.mjs
 *
 * - Pixel sizes are read from the PNG / WebP file headers (no dependency). existing-assets.json only has PNG sizes, so this measures WebP too.
 * - "referenced" is a plain-text search of app/, components/ and lib/ for the file's path, or for its directory when a template builds the name.
 *   It is evidence of use, not proof; "none found" means present in public/ with no reference found, NOT "unused".
 * - Excludes public/quest-preview/scene-review/** (untracked review-tooling output) and the HTML review pages.
 * - Code-drawn SVG art is measured from its viewBox attributes.
 */
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '../../..');
const pub = join(repo, 'public');
const IMG = /\.(png|webp|svg|gif|jpe?g)$/i;
const SKIP = /^quest-preview\/scene-review(\/|$)/;

function size(buf, name) {
  if (/\.png$/i.test(name) && buf.subarray(1, 4).toString() === 'PNG') return {w: buf.readUInt32BE(16), h: buf.readUInt32BE(20)};
  if (/\.webp$/i.test(name) && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') {
    const kind = buf.subarray(12, 16).toString();
    if (kind === 'VP8 ') return {w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff};
    if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return {w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1}; }
    if (kind === 'VP8X') return {w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1};
  }
  return {w: null, h: null};
}

function family(rel) {
  if (/^guide\//.test(rel) || /(^|\/)pets\//.test(rel) || /^quest-preview\/guide\//.test(rel)) return 'characters';
  if (/^quest-preview\//.test(rel)) return 'world';
  return 'other';
}

const code = [];
(function walk(dir) {
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!/design-audit|scene-review/.test(relative(repo, p))) walk(p); }
    else if (/\.(tsx?|css|mjs)$/.test(e.name)) code.push(readFileSync(p, 'utf8'));
  }
})(join(repo, 'app')); // app/ minus review tooling
for (const d of ['components', 'lib']) (function walk(dir) {
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p); else if (/\.(tsx?|css|mjs)$/.test(e.name)) code.push(readFileSync(p, 'utf8'));
  }
})(join(repo, d));
const corpus = code.join('\n');

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    const rel = relative(pub, p);
    if (SKIP.test(rel)) continue;
    if (e.isDirectory()) walk(p);
    else if (IMG.test(e.name)) {
      const buf = readFileSync(p);
      const {w, h} = size(buf, e.name);
      const lit = corpus.includes(`/${rel}`);
      const d = `/${dirname(rel)}/`;
      const tmpl = !lit && dirname(rel) !== '.' && corpus.includes(d);
      files.push({path: rel, dir: dirname(rel), family: family(rel), bytes: statSync(p).size, w, h, referenced: lit ? 'path' : tmpl ? 'directory' : 'none found'});
    }
  }
})(pub);
files.sort((a, b) => a.path.localeCompare(b.path));

// Code-drawn artwork: measured viewBoxes.
const drawn = [
  ['components/work/work-art.tsx', 'Case-study and figure art (editorial, code-drawn SVG)'],
  ['components/home/destination-art.tsx', 'Destination line art (code-drawn SVG)'],
  ['components/home/world-preview.tsx', 'Island world preview (code-drawn SVG)'],
].map(([file, label]) => {
  const src = readFileSync(join(repo, file), 'utf8');
  const boxes = [...new Set([...src.matchAll(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/g)].map(m => `${m[3]}x${m[4]}`))];
  return {file, label, viewBoxes: boxes};
});

// Sprite sheets: grid read from the code that defines it.
const atlas = readFileSync(join(repo, 'lib/guide/assistant-atlas.ts'), 'utf8');
const num = (k) => Number(new RegExp(`"${k}":\\s*(\\d+)`).exec(atlas)?.[1]);
const sheet = {atlas: {src: '/guide/assistant-atlas.webp', cellW: num('width'), cellH: num('height'), columns: num('columns'), rows: num('rows'), groups: [...atlas.matchAll(/"([a-z-]+)":\s*\[([\d,\s]+)\]/g)].map(m => ({name: m[1], frames: m[2].split(',').filter(s => s.trim()).length}))}};
const pets = readFileSync(join(repo, 'lib/quest-preview/restored/pet-sprites.ts'), 'utf8');
sheet.pets = [...pets.matchAll(/(\w+):\{src:'([^']+)',frames:(\d+),walk:\[([\d,]+)\]/g)].map(m => ({id: m[1], src: m[2], frames: Number(m[3]), walkFrames: m[4].split(',').length}));

// Current (non-restored) pet registry: display scale per pet, read from the code.
const petsNow = readFileSync(join(repo, 'lib/quest-preview/pet-sprites.ts'), 'utf8');
sheet.petsCurrent = [...petsNow.matchAll(/(\w+):\{src:'([^']+)',frames:(\d+),walk:\[[\d,]+\],stride:[\d.]+,scale:([\d.*]+)/g)].map(m => ({id: m[1], src: m[2], frames: Number(m[3]), scale: Function(`return ${m[4]}`)()}));
const petPipeline = readFileSync(join(repo, 'scripts/prepare-quest-pets.mjs'), 'utf8');
const tileM = /tile:(\d+),columns:(\d+),rows:(\d+),feet:(\d+)/.exec(petPipeline);
sheet.petTile = tileM ? {tile: Number(tileM[1]), columns: Number(tileM[2]), rows: Number(tileM[3]), feet: Number(tileM[4])} : null;
const qp = readFileSync(join(repo, 'app/quest-preview/quest-preview.css'), 'utf8');
const petComponents = ['components/quest-preview/pets.tsx', 'components/quest-preview/restored/pets.tsx'].filter(f => /quest-pet-sheet/.test(readFileSync(join(repo, f), 'utf8')));

// Motion-related behaviour found in code (findings, not fixes).
const finding = {
  guideReducedMotion: /prefers-reduced-motion/.test(readFileSync(join(repo, 'components/entrance/walking-guide.tsx'), 'utf8')),
  guideSheetRendering: /assistant-sprite img[^}]*image-rendering:\s*(\w+)/.exec(readFileSync(join(repo, 'app/entrance.css'), 'utf8'))?.[1] ?? null,
  petSheetRendering: /quest-pet-sheet[^}]*image-rendering:\s*(\w+)/.exec(readFileSync(join(repo, 'app/quest-preview/quest-preview.css'), 'utf8'))?.[1] ?? null,
  guidePipelineAntialiased: /antialias/i.test(readFileSync(join(repo, 'scripts/prepare-guide-atlas.py'), 'utf8')),
  petSheetPaths: petComponents.length,
  sceneFit: /\.quest-illustration[^{]*\{[^}]*object-fit:\s*(\w+)/.exec(qp)?.[1] ?? null,
  sceneZoomOrigin: /quest-illustration[^{]*\{[^}]*transform-origin:\s*(\w+)/.exec(qp)?.[1] ?? null,
  petSheetCss: /quest-pet-sheet\s*\{[^}]*width:\s*(\d+)%[^}]*height:\s*(\d+)%/.exec(readFileSync(join(repo, 'app/quest-preview/quest-preview.css'), 'utf8'))?.slice(1, 3).map(Number) ?? null,
};

writeFileSync(join(here, 'illustration-audit.json'), JSON.stringify({generatedOn: new Date().toISOString().slice(0, 10), excluded: ['public/quest-preview/scene-review/**', 'app/design-audit/**'], count: files.length, files, drawn, sheet, finding}, null, 1) + '\n');
const by = {}; for (const f of files) { by[f.family] = (by[f.family] ?? 0) + 1; }
console.log('files', files.length, by, 'unmeasured', files.filter(f => f.w === null).length, 'unreferenced', files.filter(f => f.referenced === 'none found').length);
console.log(JSON.stringify({sheet: {atlas: {...sheet.atlas, groups: sheet.atlas.groups.length}, pets: sheet.pets}, finding, drawn}));
