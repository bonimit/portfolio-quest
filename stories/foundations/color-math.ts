/** Pure color math for Foundations / Colors. No colors are defined here. */
export type RGBA = {r: number; g: number; b: number; a: number};

const clamp = (n: number, lo = 0, hi = 255) => Math.min(hi, Math.max(lo, n));

/** Parses #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() with space or comma syntax and optional alpha. */
export function parseColor(input: string): RGBA | null {
  const v = input.trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(v);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return {r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1};
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+)(%?))?\s*\)$/.exec(v);
  if (m) {
    const a = m[4] === undefined ? 1 : m[5] ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return {r: clamp(+m[1]), g: clamp(+m[2]), b: clamp(+m[3]), a: clamp(a, 0, 1)};
  }
  return null;
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();
export const toHex = (c: RGBA) => `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 1 ? hex2(c.a * 255) : ''}`;
export const toRgb = (c: RGBA) =>
  c.a < 1
    ? `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)} / ${+(c.a * 100).toFixed(1)}%)`
    : `rgb(${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)})`;

/** Source-over compositing of fg onto an opaque bg. */
export const composite = (fg: RGBA, bg: RGBA): RGBA => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
/** WCAG 2.x relative luminance. */
export const luminance = (c: RGBA) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);

/** WCAG 2.x contrast ratio; a translucent fg is composited over bg first. */
export function contrastRatio(fg: RGBA, bg: RGBA): number {
  const f = fg.a < 1 ? composite(fg, bg) : fg;
  const [hi, lo] = [luminance(f), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

export type Grade = 'pass' | 'large-only' | 'fail' | 'info';
/**
 * text: >= 4.5 passes WCAG AA; 3-4.5 passes only for large text; < 3 fails.
 * ui:   >= 3 passes WCAG 2.1 non-text contrast.
 * The project's target policy is an owner decision; this only reports measurements.
 */
export function grade(ratio: number, kind: 'text' | 'ui' | 'info'): Grade {
  if (kind === 'info') return 'info';
  if (kind === 'ui') return ratio >= 3 ? 'pass' : 'fail';
  return ratio >= 4.5 ? 'pass' : ratio >= 3 ? 'large-only' : 'fail';
}
