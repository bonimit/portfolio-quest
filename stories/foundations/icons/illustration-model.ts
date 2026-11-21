/**
 * 3D illustration system — DESIGN SYSTEM AND ASSET SPECIFICATION (NOT artwork, NOT production).
 *
 * Nothing here is a finished illustration. The Storybook shows guideline diagrams (neutral primitives drawn from the constants
 * below) and empty PLANNED slots. Every number is a LOCAL proposal for owner approval, except the five size tokens, which the
 * owner specified. Airbnb's dimensional illustrations are general visual inspiration only; no proprietary asset is copied,
 * traced or embedded.
 */
import {brandColor} from '../carbon/carbon-model';
import {toRgb} from '../color-math';

/* ------------------------------------------------------------------ sizes */

export type IllKey = 'xs' | 's' | 'm' | 'l' | 'xl';
export const ILL_SIZES: {key: IllKey; label: string; px: number; use: string; basis: 'owner'}[] = [
  {key: 'xs', label: 'XS', px: 32, use: 'Navigation markers and dense lists. Needs a simplified silhouette; the squint test is mandatory.', basis: 'owner'},
  {key: 's', label: 'S', px: 48, use: 'Compact category tiles and mobile navigation.', basis: 'owner'},
  {key: 'm', label: 'M', px: 64, use: 'Default for categories and destinations.', basis: 'owner'},
  {key: 'l', label: 'L', px: 96, use: 'Large destination cards and section openers.', basis: 'owner'},
  {key: 'xl', label: 'XL', px: 128, use: 'Featured sections and special interactive elements.', basis: 'owner'},
];
export const DEFAULT_ILL: IllKey = 'm';
export const illPx = (k: IllKey) => ILL_SIZES.find(s => s.key === k)!.px;

/* ----------------------------------------------------------------- canvas */

export const CANVAS = {
  ratio: '1 : 1 (square)',
  safeArea: 0.8, // fraction of the canvas edge that artwork must stay inside
  groundLine: 0.82, // y position (fraction from the top) of the contact shadow baseline
  background: 'transparent',
} as const;
export const margin = () => (1 - CANVAS.safeArea) / 2;

/* ------------------------------------------------- camera, light, shadow */

export const CAMERA = {name: 'Three-quarter', yawDeg: 30, pitchDeg: 25, note: 'One camera for every asset: orthographic-leaning with a mild perspective, looking slightly down at the object from its front-left.'} as const;
export const LIGHT = {
  azimuthDeg: -45, // light comes from the upper left of the canvas
  elevationDeg: 40,
  keyIntensity: 1,
  fillIntensity: 0.25,
  note: 'One soft key light from the upper left, a weak fill from the right. Highlights face up-left; core shadow sits low-right.',
} as const;
export const SHADOW = {
  shape: 'ellipse on the ground line',
  widthRatio: 0.7, // of the object's footprint width
  heightRatio: 0.18, // of the shadow width
  blurRatio: 0.04, // of canvas edge
  alphaLight: 0.22,
  alphaDark: 0.4,
  note: 'Soft contact shadow under every object, same offset direction (down-right), never cast onto a backdrop.',
} as const;

/** Shading ramp, as mix percentages applied to the base brand color. Expressed with color-mix(), never hex. */
export const RAMP = [
  {step: 'highlight', mix: 'white', pct: 38, face: 'top / lit edge', note: 'Where the key light hits directly.'},
  {step: 'base', mix: 'none', pct: 0, face: 'main form', note: 'The existing brand color, unchanged.'},
  {step: 'shade', mix: 'black', pct: 22, face: 'right / lower faces', note: 'Core shadow. Never pure black.'},
  {step: 'bounce', mix: 'white', pct: 10, face: 'lower edge', note: 'Faint reflected light so shadows stay soft.'},
] as const;
export const MATERIALS = [
  {name: 'Matte clay', specular: 0.08, use: 'Default. Soft, friendly, prints well at small sizes.'},
  {name: 'Soft plastic', specular: 0.22, use: 'Playful objects such as game controls. One small highlight, no glints.'},
  {name: 'Frosted glass', specular: 0.14, use: 'Rare: screens and lenses. Translucency must still read on Gray 100.'},
] as const;

/** Optical sizing: scale factors so different shapes read as the same visual weight inside the same safe area. */
export const OPTICAL = [
  {shape: 'Round (sphere, bubble)', scale: 1.06, why: 'Round forms look smaller than squares of equal width; allow slight overshoot of the safe area.'},
  {shape: 'Square (box, card)', scale: 1.0, why: 'Reference shape.'},
  {shape: 'Wide (controller, banner)', scale: 1.0, why: 'Fit the width to the safe area; height follows.'},
  {shape: 'Tall (lamp, figure)', scale: 1.0, why: 'Fit the height to the safe area; width follows.'},
  {shape: 'Thin or spiky', scale: 0.92, why: 'Thin parts vanish at 32 to 48px; thicken them and reduce the overall size.'},
] as const;

/* ------------------------------------------------------------ light math */

const rad = (d: number) => (d * Math.PI) / 180;
/** Unit vector pointing TOWARD the light in screen space (x right, y down, z toward the viewer). */
export function lightVector(): [number, number, number] {
  const az = rad(LIGHT.azimuthDeg), el = rad(LIGHT.elevationDeg);
  // azimuth -45 = up-left on screen; elevation lifts toward the viewer.
  const x = Math.sin(az) * Math.cos(el), y = -Math.cos(az) * Math.cos(el), z = Math.sin(el);
  return [x, y, z];
}
/** Lambert shade 0..1 for a surface normal (screen space). Used to color the guideline cube faces from the shared light. */
export function shade(normal: [number, number, number]): number {
  const [lx, ly, lz] = lightVector();
  const n = Math.hypot(...normal);
  const d = (normal[0] * lx + normal[1] * ly + normal[2] * lz) / n;
  return Math.min(1, Math.max(0, LIGHT.fillIntensity + (1 - LIGHT.fillIntensity) * Math.max(0, d) * LIGHT.keyIntensity));
}
type V3 = [number, number, number];
/** Object → view space: rotate by CAMERA yaw about the vertical axis, then tilt by pitch (looking slightly down). x right, y up, z toward the viewer. */
export function toView(v: V3): V3 {
  const yaw = rad(CAMERA.yawDeg), p = rad(CAMERA.pitchDeg);
  const x1 = v[0] * Math.cos(yaw) + v[2] * Math.sin(yaw), z1 = -v[0] * Math.sin(yaw) + v[2] * Math.cos(yaw);
  return [x1, v[1] * Math.cos(p) - z1 * Math.sin(p), v[1] * Math.sin(p) + z1 * Math.cos(p)];
}
const toScreenNormal = (n: V3): V3 => { const v = toView(n); return [v[0], -v[1], v[2]]; };
/** The three cube faces visible from CAMERA, with shades computed from the shared light. */
export function cubeFaces(size = 44) {
  const proj = (v: V3) => { const w = toView(v); return `${Math.round((50 + w[0] * size * 0.5) * 10) / 10},${Math.round((46 - w[1] * size * 0.5) * 10) / 10}`; };
  const faces = [
    {id: 'top', n: [0, 1, 0] as V3, pts: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]] as V3[]},
    {id: 'front', n: [0, 0, 1] as V3, pts: [[-1, 1, 1], [1, 1, 1], [1, -1, 1], [-1, -1, 1]] as V3[]},
    {id: 'left', n: [-1, 0, 0] as V3, pts: [[-1, 1, -1], [-1, 1, 1], [-1, -1, 1], [-1, -1, -1]] as V3[]},
  ];
  return faces.map(f => ({id: f.id, visible: toView(f.n)[2] > 0, shade: shade(toScreenNormal(f.n)), points: f.pts.map(proj).join(' ')}));
}

/* ----------------------------------------------------------------- colors */

export const HUES = ['orange', 'yellow', 'lime', 'teal', 'pink', 'lilac'] as const;
export type Hue = (typeof HUES)[number];
/** Existing brand colors read live from production CSS (never retyped). */
export const hueRgb = (h: Hue) => toRgb(brandColor(h));
export const inkRgb = () => toRgb(brandColor('ink'));
/** CSS ramp for one base color via color-mix(). `var` is the custom property holding the base. */
export function rampCss(varName: string) {
  return {
    highlight: `color-mix(in srgb, ${varName} ${100 - RAMP[0].pct}%, white)`,
    base: varName,
    shade: `color-mix(in srgb, ${varName} ${100 - RAMP[2].pct}%, black)`,
    bounce: `color-mix(in srgb, ${varName} ${100 - RAMP[3].pct}%, white)`,
  };
}

/* ------------------------------------------------------------ responsive */

export type Responsive = {context: string; mobile: IllKey; desktop: IllKey; note: string};
/** LOCAL proposal. One master asset across breakpoints; a simplified small variant only where the silhouette fails. */
export const RESPONSIVE: Responsive[] = [
  {context: 'Navigation', mobile: 'xs', desktop: 's', note: 'Markers beside labels. XS needs the simplified silhouette; the label stays the accessible name.'},
  {context: 'Categories', mobile: 's', desktop: 'm', note: 'Default is M (64). Compact two-column mobile grids step down to S.'},
  {context: 'Destination cards', mobile: 'm', desktop: 'm', note: 'Default M (64). Large desktop cards may use L (96).'},
  {context: 'Featured illustrations', mobile: 'l', desktop: 'xl', note: 'The one place expressive scale is welcome.'},
];
export const FRAMES = [{key: 'mobile', label: 'Mobile', width: 360}, {key: 'tablet', label: 'Tablet', width: 720}, {key: 'desktop', label: 'Desktop', width: 1280}] as const;
export const sizeFor = (r: Responsive, frame: 'mobile' | 'tablet' | 'desktop'): IllKey => (frame === 'mobile' ? r.mobile : r.desktop);

/* ------------------------------------------------------------ asset spec */

export const RASTER_MIN_DENSITY = 2; // owner: at least 2× for raster assets
export const MASTER_PX = 1024; // local: master export edge
export const DENSITIES = [2, 3] as const;
export const deliveredPx = (k: IllKey, d: number) => illPx(k) * d;

export const NAMING = {
  pattern: 'pq-ill-{subject}[-{variant}]@{density}x.{ext}',
  subject: 'kebab-case destination or category slug (work, concepts, arcade, about, contact, island)',
  variant: 'omit for the master; `sm` for the simplified small-size variant (32 and 48px only)',
  density: '2 or 3 (raster). The master is `pq-ill-{subject}-master.{ext}` with no density.',
  ext: 'webp (delivery), png (master and fallback)',
  example: ['pq-ill-work-master.png', 'pq-ill-work@2x.webp', 'pq-ill-work@3x.webp', 'pq-ill-work-sm@2x.webp'],
  folder: 'public/illustrations/3d/ (proposed; not created)',
} as const;

export const SPEC = {
  canvas: {master: `${MASTER_PX} × ${MASTER_PX} px, square`, safeArea: '80% (10% margin on every side)', background: 'transparent (alpha channel)', colorSpace: 'sRGB'},
  rendering: {camera: `${CAMERA.name}: yaw ${CAMERA.yawDeg}°, pitch ${CAMERA.pitchDeg}°`, light: `key from upper left (azimuth ${LIGHT.azimuthDeg}°, elevation ${LIGHT.elevationDeg}°), weak fill`, shadow: 'soft contact shadow on the ground line, baked in'},
  color: {palette: 'existing Portfolio Quest brand colors only (orange, yellow, lime, teal, pink, lilac) plus ink and paper neutrals', maxHues: '3 per asset', ramp: RAMP.map(r => `${r.step} ${r.pct ? `${r.mix} ${r.pct}%` : 'base'}`).join(' · ')},
  delivery: {raster: 'WebP with alpha at 2× and 3×; PNG master kept as the source of truth', vector: 'not used for this style', minDensity: `${RASTER_MIN_DENSITY}×`, budget: 'local budgets: ≤ 40 KB at 2× up to L, ≤ 90 KB at 2× for XL'},
  accessibility: {decorative: 'alt="" (default; the adjacent text names the destination)', meaningful: 'role="img" with a short accessible name when the illustration alone carries meaning', motion: 'static; no animation is specified'},
  review: ['Squint test at 32px: the silhouette must still read.', 'Check on Carbon White and Gray 100: the form must read without the shadow.', 'No text, no logos, no third-party shapes.'],
} as const;

/* --------------------------------------------------------- planned assets */

export type Planned = {subject: string; label: string; hue: Hue; motif: string; destination: string; status: 'not produced'};
/** Subjects come from the real destinations (components/home/destination-art.tsx kinds + the island world). Motifs are read from the existing line art; they are NOT designs. */
export const PLANNED: Planned[] = [
  {subject: 'work', label: 'Selected Work', hue: 'orange', motif: 'Case-study board / window layout (from existing line art)', destination: '/work', status: 'not produced'},
  {subject: 'concepts', label: 'Concept Lab', hue: 'teal', motif: 'Sphere with orbit rings (from existing line art)', destination: '/concepts', status: 'not produced'},
  {subject: 'arcade', label: 'Arcade', hue: 'lilac', motif: 'Game controller (from existing line art)', destination: '/arcade', status: 'not produced'},
  {subject: 'about', label: 'About', hue: 'yellow', motif: 'Portrait in a frame (from existing line art)', destination: '/about', status: 'not produced'},
  {subject: 'contact', label: 'Contact', hue: 'pink', motif: 'Message / letter (from existing line art)', destination: '/contact', status: 'not produced'},
  {subject: 'island', label: 'Island world', hue: 'lime', motif: 'Floating island scene (existing game world, preserved)', destination: '/world', status: 'not produced'},
];
export const plannedName = (p: Planned, k: IllKey) => `pq-ill-${p.subject}${k === 'xs' || k === 's' ? '-sm' : ''}@2x.webp`;
export const specJson = () => ({naming: NAMING, sizes: ILL_SIZES.map(s => ({key: s.key, px: s.px, delivered: {'2x': deliveredPx(s.key, 2), '3x': deliveredPx(s.key, 3)}})), canvas: CANVAS, camera: CAMERA, light: LIGHT, shadow: SHADOW, ramp: RAMP, spec: SPEC, planned: PLANNED.map(p => ({subject: p.subject, destination: p.destination, hue: p.hue, status: p.status}))});
