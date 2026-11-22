/**
 * Illustrations — SYSTEM MODEL (documentation and proposal; NOT production, NOT artwork).
 *
 * Existing facts come only from ./illustration-audit.json (measured by generate-illustration-audit.mjs from public/ file headers and
 * production code). Sizes for the 3D family are imported from the committed 3D model, never retyped. Every other number is tagged:
 *   measured = read from existing files or code · owner = specified by the owner · local = a proposal for approval · open = no evidence, owner decision.
 */
import audit from './illustration-audit.json';
import {CANVAS, CAMERA, ILL_SIZES, LIGHT, NAMING, OPTICAL, RAMP, RESPONSIVE, SHADOW, SPEC, MASTER_PX, RASTER_MIN_DENSITY, DENSITIES, illPx, type IllKey} from '../icons/illustration-model';
import motion from '../material/material-motion.json';

export {ILL_SIZES, CANVAS, CAMERA, LIGHT, SHADOW, RAMP, OPTICAL, RESPONSIVE, NAMING, SPEC, MASTER_PX, RASTER_MIN_DENSITY, DENSITIES, illPx};
export type {IllKey};
export const AUDIT = audit;

export type Basis = 'measured' | 'owner' | 'local' | 'open';
export type Cell = {t: string; b: Basis};
export type FamilyId = 'spot3d' | 'editorial' | 'characters' | 'world';

/* ---------------------------------------------------------------- audit */

export type AuditFile = (typeof audit.files)[number];
export const filesOf = (f: FamilyId): AuditFile[] => (f === 'characters' ? audit.files.filter(x => x.family === 'characters') : f === 'world' ? audit.files.filter(x => x.family === 'world') : []);
export const bytesStats = (fs: AuditFile[]) => {
  const b = fs.map(x => x.bytes).sort((a, c) => a - c);
  return b.length ? {min: b[0], median: b[Math.floor(b.length / 2)], max: b[b.length - 1]} : null;
};
export const dimsOf = (fs: AuditFile[]) => [...new Set(fs.map(f => `${f.w}×${f.h}`))];
export const kb = (n: number) => `${Math.round(n / 1024)} KB`;
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const ratioLabel = (w: number, h: number) => { const g = gcd(w, h); return `${w / g}:${h / g}`; };

/** A representative, lazy-loaded sample (not the whole set): scenes are ~40 KB each but there are 181 of them. */
export function gallerySample(family: 'characters' | 'world'): AuditFile[] {
  if (family === 'characters') return audit.files.filter(f => f.family === 'characters' && /(pets\/(capybara|cat)\.webp|assistant-idle\.webp|poses\.png)$/.test(f.path));
  const pick = ['classic-day', 'classic-night', 'autumn-dusk', 'bangkok-summer-day', 'frost-day', 'meadow-day'];
  return pick.map(n => audit.files.find(f => f.path === `quest-preview/${n}.webp`)).filter((f): f is AuditFile => !!f);
}
/** Day/night naming is a measured convention in the file names. */
export const lightVariants = () => ({day: audit.files.filter(f => /-day\.webp$/.test(f.path)).length, night: audit.files.filter(f => /-night\.webp$/.test(f.path)).length, dusk: audit.files.filter(f => /-dusk\.webp$/.test(f.path)).length});

/* -------------------------------------------------------- family model */

export const GUIDELINE_KEYS = ['purpose', 'style', 'sizes', 'responsive', 'aspect', 'canvas', 'composition', 'lighting', 'color', 'animation', 'files'] as const;
export type GuidelineKey = (typeof GUIDELINE_KEYS)[number];
export const KEY_LABEL: Record<GuidelineKey, string> = {
  purpose: 'Purpose and usage', style: 'Visual style', sizes: 'Size scale', responsive: 'Desktop and mobile behavior', aspect: 'Aspect ratios', canvas: 'Canvas and safe areas',
  composition: 'Composition and optical alignment', lighting: 'Perspective, lighting and shadows', color: 'Color and theme compatibility', animation: 'Animation rules', files: 'File formats, export resolution and naming',
};

const c = (t: string, b: Basis): Cell => ({t, b});
const sprite = audit.sheet.atlas;
const pet0 = audit.sheet.pets[0];
const charFiles = filesOf('characters');
const worldFiles = filesOf('world');
const scene = dimsOf(worldFiles.filter(f => !/guide|pets/.test(f.path)));
const worldBytes = bytesStats(worldFiles)!;
const lv = lightVariants();
const reduced = audit.finding.guideReducedMotion;
const durations = motion.durations.filter(d => ['short2', 'medium2', 'long2'].some(s => d.token.endsWith(s))).map(d => `${d.token.split('.').pop()} ${d.ms}ms`).join(', ');

export type Family = {id: FamilyId; name: string; tagline: string; existing: 'none' | 'code-drawn' | 'raster'; guidelines: Record<GuidelineKey, Cell[]>};

export const FAMILIES: Family[] = [
  {
    id: 'spot3d', name: '3D Spot Illustrations', tagline: 'Airbnb-inspired dimensional objects (general inspiration only; nothing copied).', existing: 'none',
    guidelines: {
      purpose: [c('Expressive objects for destinations, categories, featured sections and special interactive elements. Never functional icons (Material Symbols Rounded is for those).', 'owner')],
      style: [c('Soft, rounded, dimensional forms with subtle lighting and contact shadows; playful but refined; one camera, scale and light across the set.', 'owner'), c('No finished 3D asset exists. Every 3D drawing in Storybook is a labelled guideline specimen.', 'measured')],
      sizes: [c(ILL_SIZES.map(s => `${s.label} ${s.px}`).join(' / ') + ' px. Default M 64.', 'owner')],
      responsive: [c(RESPONSIVE.map(r => `${r.context}: ${r.mobile.toUpperCase()} on mobile, ${r.desktop.toUpperCase()} on desktop`).join('; '), 'local'), c('One master asset across breakpoints; a simplified small variant only where the silhouette fails at 32 and 48px.', 'owner')],
      aspect: [c(`${CANVAS.ratio}.`, 'owner')],
      canvas: [c(`${MASTER_PX}×${MASTER_PX} master, transparent background, artwork inside the central ${CANVAS.safeArea * 100}% (a ${Math.round(((1 - CANVAS.safeArea) / 2) * 100)}% margin per edge).`, 'owner'), c(`Contact-shadow ground line at ${CANVAS.groundLine * 100}% of the height.`, 'local')],
      composition: [c(OPTICAL.map(o => `${o.shape}: ×${o.scale}`).join('; ') + '. Fit wide shapes by width and tall shapes by height.', 'local'), c('The silhouette must read at 32px (squint test).', 'owner')],
      lighting: [c(`${CAMERA.name} perspective (yaw ${CAMERA.yawDeg}°, pitch ${CAMERA.pitchDeg}°). Soft key from the upper left (azimuth ${LIGHT.azimuthDeg}°, elevation ${LIGHT.elevationDeg}°) with a weak fill; contact shadow ${SHADOW.widthRatio * 100}% of the footprint, baked in.`, 'local'), c('Consistent three-quarter perspective, soft directional light and consistent contact shadows are required.', 'owner')],
      color: [c('Existing Portfolio Quest brand colors only, at most 3 hues per asset; shading by color-mix ramp: ' + RAMP.map(r => `${r.step} ${r.pct ? `${r.mix} ${r.pct}%` : 'base'}`).join(', ') + '.', 'local'), c('Transparent background so it sits on Carbon White and Gray 100; the form must read without its shadow on both.', 'local')],
      animation: [c('Static. No animation is specified for this family.', 'local')],
      files: [c('Owner decision: AI-generated artwork is the future production approach, behind explicit gates. Nothing has been generated and no prompt has been sent.', 'owner'), c(`Raster WebP with alpha at ${DENSITIES.join('× and ')}×, PNG master at ${MASTER_PX}px; minimum ${RASTER_MIN_DENSITY}× for any raster. Name: ${NAMING.pattern}. Folder (proposed, not created): public/illustrations/3d/.`, 'local')],
    },
  },
  {
    id: 'editorial', name: 'Editorial Illustrations', tagline: 'Project covers, storytelling and empty states. Not forced into square icon containers.', existing: 'code-drawn',
    guidelines: {
      purpose: [c('Project covers, storytelling in case studies and empty states.', 'owner'), c('Today this role is filled by code-drawn SVG compositions: work-art.tsx (case-study cards and figures) and destination-art.tsx. No raster editorial illustration exists.', 'measured'), c('work-art.tsx describes itself as placeholder artwork for sample projects, to be replaced by real images with alt text later.', 'measured')],
      style: [c('Existing: flat, line-based SVG compositions drawn in code. Not replaced and not restyled by this system.', 'measured'), c('Proposed new editorial art must follow the existing line language and add no new visual direction.', 'local')],
      sizes: [c('Existing drawings use fixed viewBoxes: ' + audit.drawn.slice(0, 2).map(d => `${d.file.split('/').pop()} ${d.viewBoxes.join(', ')}`).join('; ') + '. Display size is set by the container.', 'measured'), c('Proposed: size by container width and ratio, not by a fixed icon token. See Size & Proportion.', 'local')],
      responsive: [c('Proposed: full container width on mobile; capped width on tablet and desktop; same ratio at every breakpoint unless a crop is declared. See Desktop vs Mobile.', 'local')],
      aspect: [c('Existing: work-art is drawn on 200×200 and scaled to fit "every standard frame (16:9, 4:3, 1:1, 4:5)" per its code comment; destination-art is 240×220 (12:11).', 'measured'), c('Owner decision: 1:1, 4:3, 3:2 and 16:9, chosen by usage (see Size & Proportion). Which usage takes which ratio is a proposal.', 'owner')],
      canvas: [c('Proposed: keep 8% of the width as a quiet margin on every edge (a looser safe area than icons); subject centred in the optical centre, not the geometric one.', 'local')],
      composition: [c('Proposed: one focal subject plus at most two supporting elements; leave the lower third calm where a caption or heading may overlay.', 'local')],
      lighting: [c('Existing: flat, no lighting or cast shadows. Editorial art stays flat; no perspective or lighting rules are added.', 'measured')],
      color: [c('Existing SVG art draws with CSS color, so it follows the page theme. Proposed art uses Carbon tokens or brand colors and must be checked on Carbon White and Gray 100.', 'local')],
      animation: [c('Static by default. If an editorial piece is ever animated, use the committed motion tokens (' + durations + ') and honor prefers-reduced-motion.', 'local')],
      files: [c('Proposed: SVG first (scales, themeable); raster only for painterly art: WebP at ≥ 2×. Name: pq-edit-{slug}-{ratio}[@{n}x].{ext}. Folder (proposed): public/illustrations/editorial/.', 'local')],
    },
  },
  {
    id: 'characters', name: 'Characters & Sprites', tagline: 'Avatars, pets and animated characters. Existing art, preserved.', existing: 'raster',
    guidelines: {
      purpose: [c(`Guide companion, pets and avatars. ${charFiles.length} files are present in public/ (guide/, quest-preview/pets/, quest-preview/restored/pets/, quest-preview/guide/).`, 'measured')],
      style: [c('Existing pixel / sprite style. Preserved as is; no new character direction is introduced.', 'measured')],
      sizes: [c(`Guide atlas cell ${sprite.cellW}×${sprite.cellH}px shown at 90×110 CSS px (entrance.css); wayfinder avatar box 96×128 px.`, 'measured'), c(`Pet display scales are fractional in code (${audit.sheet.petsCurrent.map(p => `${p.id} ×${p.scale}`).join(', ')}), so existing pets are not shown at integer multiples.`, 'measured'), c('Proposed for NEW pixel-art sprites: prefer integer multiples of the cell so pixels stay crisp. Existing pets are not changed.', 'local')],
      responsive: [c('Existing sprite sizes are fixed CSS pixel boxes; no mobile/desktop variants were found. Whether to scale on mobile is not specified.', 'open')],
      aspect: [c(`Guide cell ${sprite.cellW}:${sprite.cellH} = ${ratioLabel(sprite.cellW, sprite.cellH)}. Pet sheets are ${dimsOf(charFiles.filter(f => /pets\//.test(f.path))).join(', ')} in a ${audit.finding.petSheetCss ? `${audit.finding.petSheetCss[0] / 100}×${audit.finding.petSheetCss[1] / 100}` : '?'} grid (square 256×256 cells, derived).`, 'measured')],
      canvas: [c('Each frame is a full cell; the character stands on the cell floor with feet at a constant baseline so a walk cycle does not bob. Proposed rule; existing cell margins were not audited.', 'local')],
      composition: [c('Proposed: align the optical center of every pose to the same x within a cell so frames do not jitter when stepped.', 'local')],
      lighting: [c('Pixel / sprite art carries its own baked shading. No lighting model is added.', 'measured')],
      color: [c('Sprites keep their own palette and are not recolored by theme. They must be checked on Carbon White and Gray 100 (see Light & Dark).', 'local')],
      animation: [
        c(`Guide atlas: ${sprite.columns}×${sprite.rows} grid, ${sprite.groups.length} named groups (${sprite.groups.map(g => `${g.name} ${g.frames}`).join(', ')}).`, 'measured'),
        c(`Pets: ${audit.sheet.pets.map(p => `${p.id} ${p.frames} frames (${p.walkFrames} walk)`).join(', ')}; walk frame is chosen from distance walked (stride), not from a timer.`, 'measured'),
        c(reduced ? 'The entrance guide code checks prefers-reduced-motion. Whether the quest-preview pet walk honors it was not verified.' : 'No prefers-reduced-motion check found in the guide code.', 'measured'),
      ],
      files: [c(`Owner decision: rendering is standardized within each pixel-art family (pixel-art sheets use image-rendering: pixelated; smooth sheets use auto). Current state, measured: all pet sheets render through one rule ("${audit.finding.petSheetRendering}", ${audit.finding.petSheetPaths} components) and the guide sheet through another ("${audit.finding.guideSheetRendering}"); the guide pipeline antialiases its alpha edges, so it is treated as a smooth, not pixel-art, family. No family is inconsistent today.`, 'owner'), c(`Existing: WebP sprite sheets and one PNG poses sheet; names such as guide/assistant-atlas.webp and pets/${pet0.id}.webp are kept. For NEW sprites propose pq-spr-{name}-sheet.webp (+ a JSON of grid and groups).`, 'local'), c(`Pet tile ${audit.sheet.petTile?.tile}px in a ${audit.sheet.petTile?.columns}×${audit.sheet.petTile?.rows} grid with the feet on row ${audit.sheet.petTile?.feet} of the tile (from the pet pipeline script).`, 'measured')],
    },
  },
  {
    id: 'world', name: 'World & Environment', tagline: 'Islands, cities, buildings and game scenery. Existing art, preserved.', existing: 'raster',
    guidelines: {
      purpose: [c(`Island scenes for the cities, seasons and times of day. ${worldFiles.length} WebP scenes and parts are present in public/quest-preview/, plus a code-drawn island SVG (world-preview.tsx).`, 'measured')],
      style: [c('Existing illustrated game-scene style. Preserved as is.', 'measured')],
      sizes: [c(`Scenes are ${scene.join(', ')} px (measured). The code-drawn island preview is ${audit.drawn[2].viewBoxes.join(', ')}.`, 'measured')],
      responsive: [c(`Measured: scenes are shown with object-fit: ${audit.finding.sceneFit} (whole, never cropped by CSS) and the camera zoom scales from the ${audit.finding.sceneZoomOrigin}. The canvas renderer path was not audited.`, 'measured'), c('Owner decision: any responsive cropping must preserve each scene\'s focal point.', 'owner'), c('Proposed: each scene declares a focal point as fractions of its width and height (focal: {x, y}, 0 to 1); crops are anchored on it. No focal coordinates exist yet and none are invented here.', 'local')],
      aspect: [c(`Scenes ${ratioLabel(1440, 980)} (1440×980). Island SVG ${ratioLabel(600, 440)}.`, 'measured')],
      canvas: [c('Full-bleed scenes; no safe area is defined in the files. Proposed rule for new scenery: keep interactive points and text-overlay zones out of the outer 10%, because the crop varies by viewport.', 'local')],
      composition: [c('Proposed: one clear foreground, midground and horizon band per scene so crops stay readable, with the focal subject placed first and everything else composed around it.', 'local')],
      lighting: [c(`Light is part of the set, not of the theme: file names carry the variant (${lv.day} day, ${lv.night} night, ${lv.dusk} dusk).`, 'measured')],
      color: [c('Scenes carry their own palette and time of day; they do not change with Carbon White or Gray 100. Surrounding UI uses Carbon.', 'measured')],
      animation: [c('Scenes are raster images; any motion belongs to the scene renderer and sprites in code. No animation rule is added here.', 'measured')],
      files: [c(`Existing: WebP, ${kb(worldBytes.min)} to ${kb(worldBytes.max)} (median ${kb(worldBytes.median)}); names {city}-{season}-{day|night}.webp are kept. For NEW scenery propose pq-env-{place}-{variant}.webp.`, 'local')],
    },
  },
];
export const family = (id: FamilyId) => FAMILIES.find(f => f.id === id)!;

/* ------------------------------------------------ editorial ratio options */

export type RatioDef = {key: string; label: string; w: number; h: number; use: string; mobileCrop?: [number, number]};
export type EditorialOption = {id: 'D'; name: string; summary: string; ratios: RatioDef[]};
/**
 * OWNER DECISION: editorial art supports 1:1, 4:3, 3:2 and 16:9, chosen by usage. The SET is decided; which usage takes which ratio
 * is a local proposal and is listed as not yet approved in Design Review. The existing squares (work-art 200×200) are untouched.
 */
export const EDITORIAL_OPTIONS: EditorialOption[] = [
  {id: 'D', name: 'Owner-decided ratio set', summary: 'Four ratios, chosen by usage. The ratio-to-usage mapping is a proposal.', ratios: [
    {key: 'square', label: 'Square', w: 1, h: 1, use: 'Compact cards; same as work-art today.'},
    {key: 'standard', label: 'Standard', w: 4, h: 3, use: 'Cards and empty states.'},
    {key: 'cover', label: 'Cover', w: 3, h: 2, use: 'Project covers and case-study headers.'},
    {key: 'wide', label: 'Wide', w: 16, h: 9, use: 'Story figures and feature banners.', mobileCrop: [4, 3]},
  ]},
];
export const EDITORIAL = EDITORIAL_OPTIONS[0];
export const FRAMES = [{key: 'mobile', label: 'Mobile', width: 360}, {key: 'tablet', label: 'Tablet', width: 720}, {key: 'desktop', label: 'Desktop', width: 1280}] as const;
export type FrameKey = (typeof FRAMES)[number]['key'];
/** Local: page padding 16px each side, and a content cap so wide art does not grow forever. */
export const PAD = 16;
export const MAX_CONTENT = 960;
export const displayWidth = (frame: number) => Math.min(frame - 2 * PAD, MAX_CONTENT);
export function sizeAt(r: RatioDef, frame: FrameKey): {w: number; h: number; ratio: [number, number]} {
  const f = FRAMES.find(x => x.key === frame)!;
  const ratio = frame === 'mobile' && r.mobileCrop ? r.mobileCrop : [r.w, r.h] as [number, number];
  const w = displayWidth(f.width);
  return {w, h: Math.round((w * ratio[1]) / ratio[0]), ratio};
}
/** Raster delivery at a given display width and density. */
export const rasterPx = (displayPx: number, density: number) => displayPx * density;

/* --------------------------------------------------------- do and don't */

export type DoDont = {family: FamilyId; id: string; verdict: 'do' | 'dont'; text: string};
export const DO_DONT: DoDont[] = [
  {family: 'spot3d', id: 'safe-in', verdict: 'do', text: 'Keep the object inside the 80% safe area with the contact shadow on the ground line.'},
  {family: 'spot3d', id: 'safe-out', verdict: 'dont', text: 'Let the object or its shadow touch or cross the canvas edge; it will clip at 32px and look larger than its neighbours.'},
  {family: 'editorial', id: 'own-ratio', verdict: 'do', text: 'Give editorial art its own ratio and let the container follow it.'},
  {family: 'editorial', id: 'square-crop', verdict: 'dont', text: 'Crop wide editorial art into a square icon container; the subject is cut off.'},
  {family: 'characters', id: 'integer', verdict: 'do', text: 'Use one image-rendering rule for the whole pixel-art family and keep the feet on one baseline.'},
  {family: 'characters', id: 'fraction', verdict: 'dont', text: 'Mix rendering modes inside one pixel-art family, restyle existing sprites, or let frames sit on different baselines.'},
  {family: 'world', id: 'edge-safe', verdict: 'do', text: 'Anchor every crop on the scene\'s focal point and keep key objects and overlay zones away from the outer 10%.'},
  {family: 'world', id: 'edge-key', verdict: 'dont', text: 'Crop around the geometric center when the focal subject sits off-center, or place something that must stay visible at the very edge.'},
];
export const SAFE = {scene: 0.1} as const;

/* ------------------------------------------------------ export guidelines */

export type ExportRow = {family: FamilyId; format: Cell; density: Cell; naming: Cell; budget: Cell};
export const EXPORTS: ExportRow[] = [
  {family: 'spot3d', format: c('WebP with alpha; PNG master', 'local'), density: c(`${DENSITIES.join('× and ')}× delivered; ${MASTER_PX}px master; minimum ${RASTER_MIN_DENSITY}×`, 'owner'), naming: c(NAMING.pattern, 'local'), budget: c('≤ 40 KB at 2× up to L, ≤ 90 KB at 2× for XL (local)', 'local')},
  {family: 'editorial', format: c('SVG first; WebP for painterly art', 'local'), density: c(`Raster at ≥ ${RASTER_MIN_DENSITY}× of the largest display width`, 'local'), naming: c('pq-edit-{slug}-{ratio}[@{n}x].{ext}', 'local'), budget: c('SVG ≤ 30 KB; WebP not specified', 'open')},
  {family: 'characters', format: c('WebP sprite sheet + JSON grid; existing PNG kept', 'measured'), density: c('Cell size is the native pixel size; display at integer multiples', 'local'), naming: c('Existing names kept; new: pq-spr-{name}-sheet.webp', 'local'), budget: c(`Existing: ${(() => { const s = bytesStats(charFiles)!; return `${kb(s.min)} to ${kb(s.max)}`; })()}`, 'measured')},
  {family: 'world', format: c('WebP', 'measured'), density: c(`Existing scenes are ${scene.join(', ')} px; export density for new scenes is not specified`, 'open'), naming: c('Existing {city}-{season}-{day|night}.webp kept; new: pq-env-{place}-{variant}.webp', 'local'), budget: c(`Existing: ${kb(worldBytes.min)} to ${kb(worldBytes.max)}, median ${kb(worldBytes.median)}`, 'measured')},
];

export const BASIS_LABEL: Record<Basis, string> = {measured: 'Existing (measured)', owner: 'Owner-specified', local: 'Local proposal', open: 'Not specified: owner decision'};
export const totalAudited = () => audit.files.length;
export const unreferenced = () => audit.files.filter(f => f.referenced === 'none found');
export const sizeKeyFor = (k: IllKey) => illPx(k);
