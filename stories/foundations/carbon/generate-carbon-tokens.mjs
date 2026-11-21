/**
 * Generates carbon-tokens.json: the ONLY place Carbon hex values enter this repo.
 *
 *   mkdir /tmp/carbon && cd /tmp/carbon && npm init -y
 *   npm i @carbon/themes@11.86.0 @carbon/colors@11.62.0 && npm pack @carbon/styles@1.120.0 && tar -xzf carbon-styles-*.tgz
 *   node <repo>/stories/foundations/carbon/generate-carbon-tokens.mjs /tmp/carbon /tmp/carbon/package/scss/layer/_layer-sets.scss <repo>/stories/foundations/carbon/carbon-tokens.json <repo>/stories/foundations/carbon/carbon-depth.json
 *
 * Nothing is added to the project's package.json. The script throws on any missing or
 * inconsistent value rather than writing a partial file.
 */
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

const [dir, layerSetsScss, out, depthOut] = process.argv.slice(2);
if (!dir || !layerSetsScss || !out) throw new Error('usage: generate-carbon-tokens.mjs <dir with node_modules> <_layer-sets.scss> <out.json> [carbon-depth.json]');
const req = createRequire(join(dir, 'noop.js'));
const themes = req('@carbon/themes');
const colors = req('@carbon/colors');
const version = n => JSON.parse(readFileSync(join(dir, 'node_modules', n, 'package.json'), 'utf8')).version;

const pick = theme => Object.fromEntries(Object.entries(theme).filter(([, v]) => typeof v === 'string'));
const light = pick(themes.white);
const dark = pick(themes.g100);

const same = (a, b) => JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort());
if (!same(light, dark)) throw new Error('White and Gray 100 expose different token names');

const palettes = {};
for (const name of ['gray', 'red', 'yellow', 'green', 'blue']) {
  palettes[name] = Object.fromEntries(Object.entries(colors[name]).map(([k, v]) => [k, v]));
}
palettes.white = colors.white;
palettes.black = colors.black;

// The brief's layer tables, asserted by PALETTE NAME so no literal is repeated here.
const expect = (cond, msg) => { if (!cond) throw new Error('brief mismatch: ' + msg); };
expect(light.background === palettes.white && light.layer01 === palettes.gray[10] && light.layer02 === palettes.white && light.layer03 === palettes.gray[10], 'White layers');
expect(dark.background === palettes.gray[100] && dark.layer01 === palettes.gray[90] && dark.layer02 === palettes.gray[80] && dark.layer03 === palettes.gray[70], 'Gray 100 layers');

// Official layer sets (which numbered tokens apply at which Layer depth) parsed from @carbon/styles.
const camel = s => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const scss = readFileSync(layerSetsScss, 'utf8').replace(/\/\/.*$/gm, '');
const layerSets = {};
for (const m of scss.matchAll(/^ {2}([a-z-]+):\s*\(([^)]*)\)/gm)) {
  const names = [...m[2].matchAll(/theme\.\$([a-z0-9-]+)/g)].map(x => camel(x[1]));
  if (names.length) layerSets[camel(m[1])] = names;
}
for (const [set, names] of Object.entries(layerSets)) for (const n of names) {
  if (!(n in light)) throw new Error(`layer set ${set} references unknown token ${n}`);
}
if (!layerSets.layer || !layerSets.field || !layerSets.borderSubtle) throw new Error('layer sets not parsed');

writeFileSync(out, JSON.stringify({
  provenance: {
    generatedOn: new Date().toISOString().slice(0, 10),
    packages: {'@carbon/themes': version('@carbon/themes'), '@carbon/colors': version('@carbon/colors'), '@carbon/styles (layer sets)': '1.120.0'},
    sources: [
      'https://www.carbondesignsystem.com/elements/color/overview/',
      'https://github.com/carbon-design-system/carbon/tree/main/packages/themes',
      'https://github.com/carbon-design-system/carbon/blob/main/packages/styles/scss/layer/_layer-sets.scss',
    ],
    note: 'Values are Carbon v11 White (light) and Gray 100 (dark) themes. Proposal reference data; not production tokens.',
  },
  themes: {light, dark},
  palettes,
  layerSets,
}, null, 1) + '\n');
// Optional second output: shadows and stacking, parsed from the published @carbon/styles SCSS (not recalled).
if (depthOut) {
  const root = join(dirname(layerSetsScss), '..'); // .../scss
  const read = f => readFileSync(join(root, f), 'utf8').replace(/\/\/.*$/gm, '');
  const mixin = /@mixin box-shadow\s*\{\s*box-shadow:\s*([^;]+);/.exec(read('utilities/_box-shadow.scss'));
  if (!mixin) throw new Error('box-shadow mixin not found');
  const pop = /drop-shadow\(\s*0\s+\$spacing-01\s+\$spacing-01\s+(rgb\([^)]*\))\s*\)/.exec(read('components/popover/_popover.scss'));
  if (!pop) throw new Error('popover drop-shadow not found');
  const layout = req('@carbon/layout');
  const z = {};
  for (const m of read('utilities/_z-index.scss').matchAll(/([A-Za-z]+):\s*(-?\s*\d+)/g)) z[m[1]] = Number(m[2].replace(/\s/g, ''));
  if (!z.modal || !z.dropdown || !z.overlay) throw new Error('z-index map not parsed');
  writeFileSync(depthOut, JSON.stringify({
    provenance: {
      generatedOn: new Date().toISOString().slice(0, 10),
      packages: {'@carbon/themes': version('@carbon/themes'), '@carbon/styles': '1.120.0'},
      sources: [
        'packages/styles/scss/utilities/_box-shadow.scss',
        'packages/styles/scss/components/popover/_popover.scss',
        'packages/styles/scss/utilities/_z-index.scss',
        'packages/themes (token "shadow")',
      ],
      note: 'Carbon defines no modal-dialog box-shadow: modal depth comes from the overlay scrim token. Reference data only.',
    },
    shadowToken: {light: light.shadow, dark: dark.shadow},
    floating: {mixin: mixin[1].trim(), geometry: mixin[1].replace(/theme\.\$shadow/, '').trim()},
    popoverDropShadow: {color: pop[1], offsetY: layout.spacing01, blur: layout.spacing01},
    zIndexes: z,
  }, null, 1) + '\n');
}
console.log('tokens:', Object.keys(light).length, 'layer sets:', Object.keys(layerSets).length);
