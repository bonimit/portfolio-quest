/**
 * Generates existing-assets.json: a read-only INDEX of the production images under public/ (paths, byte sizes, PNG pixel sizes).
 *
 *   node stories/foundations/icons/generate-asset-index.mjs
 *
 * Excludes public/quest-preview/scene-review/** (untracked review-tooling output). Nothing under public/ is changed or imported;
 * Storybook previews use the files by URL path (staticDirs serves public/).
 */
import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../../public');
const EXT = /\.(png|svg|webp|gif|jpg|jpeg)$/i;
const SKIP = /^quest-preview\/scene-review(\/|$)/;
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    const rel = relative(root, p);
    if (SKIP.test(rel)) continue;
    if (e.isDirectory()) walk(p);
    else if (EXT.test(e.name)) {
      let w = null, h = null;
      if (/\.png$/i.test(e.name)) { const b = readFileSync(p); if (b.subarray(1, 4).toString() === 'PNG') { w = b.readUInt32BE(16); h = b.readUInt32BE(20); } }
      files.push({path: rel, dir: dirname(rel), bytes: statSync(p).size, w, h});
    }
  }
})(root);
files.sort((a, b) => a.path.localeCompare(b.path));
writeFileSync(join(here, 'existing-assets.json'), JSON.stringify({generatedOn: new Date().toISOString().slice(0, 10), excluded: ['public/quest-preview/scene-review/**'], count: files.length, files}, null, 1) + '\n');
console.log('indexed', files.length, 'files in', new Set(files.map(f => f.dir)).size, 'directories');
