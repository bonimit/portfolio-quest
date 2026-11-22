/**
 * Accessibility guidelines for the foundations (documentation and proposal; NOT a conformance claim).
 *
 * Official criterion text comes only from ./wcag.json (generated from w3.org by generate-wcag.mjs, thresholds asserted).
 * Measured values are computed from the Carbon color model, the Material spacing data and the motion data. Everything else is tagged local.
 * Nothing here says the project conforms to WCAG: automated checks cannot establish conformance and manual checks have not been run.
 */
import wcag from './wcag.json';
import spacing from '../material/material-spacing.json';
import motion from '../material/material-motion.json';
import {PRIMARY_OPTIONS, measure, pair, type Mode, type Result} from '../carbon/carbon-model';
import type {Kind as TagKind} from '../overview/ui';

export const WCAG = wcag;
export const sc = (id: string) => {
  const c = wcag.criteria.find(x => x.id === id);
  if (!c) throw new Error(`criterion ${id} is not in wcag.json`);
  return c;
};
export const scLabel = (id: string) => `WCAG 2.2 ${sc(id).number} ${sc(id).title.replace(/^[\d.]+\s/, '')} (Level ${sc(id).level})`;

/* --------------------------------------------------------------- rules */

export type Rule = {id: string; area: string; rule: string; official?: string[]; material?: string; measured?: string; local: string; applies: string};
export const MATERIAL_TARGET = spacing.touchTarget as number;
export const RULES: Rule[] = [
  {id: 'contrast-text', area: 'Color and contrast', rule: 'Text meets 4.5:1 against its surface, or 3:1 for large text. Every text token pair is measured in both modes (Contrast Evidence).', official: ['contrast-minimum'], local: 'Measured pairs are reported in the page, not hidden by the Storybook axe rule (disabled on specimens that show low-contrast examples on purpose).', applies: 'Colors, Surfaces & Depth, Icons'},
  {id: 'contrast-ui', area: 'Color and contrast', rule: 'Boundaries, focus indicators and icons that carry meaning have at least 3:1 against adjacent colors.', official: ['non-text-contrast'], local: 'Applied to border-strong, focus, icon-primary and the primary fill in both modes.', applies: 'Colors, Icons, Shape'},
  {id: 'not-color-alone', area: 'Color and contrast', rule: 'Never signal state by color alone: add text, shape, border style or an icon.', official: ['use-of-color'], local: 'Every Storybook label here pairs color with text and a border style; Do/Don\'t uses words and border patterns.', applies: 'All foundations'},
  {id: 'target-min', area: 'Touch targets', rule: 'Pointer targets are at least 24 by 24 CSS pixels (with the spacing exception).', official: ['target-size-minimum'], local: 'A floor, not the goal.', applies: 'Spacing, Icons, Shape'},
  {id: 'target-enh', area: 'Touch targets', rule: 'Where space allows, 44 by 44 CSS pixels (AAA, enhanced).', official: ['target-size-enhanced'], local: 'Not required by AA; listed for comparison.', applies: 'Spacing, Icons'},
  {id: 'target-material', area: 'Touch targets', rule: `Material Web uses a ${MATERIAL_TARGET}px touch target.`, material: `${MATERIAL_TARGET}px, from the @material/web package (not a WCAG value).`, local: 'Which minimum this project uses (24, 44 or 48) is NOT decided. The 32px Material chip is below 44 and 48 unless its hit area is padded.', applies: 'Spacing, Icons, Shape'},
  {id: 'focus-visible', area: 'Focus', rule: 'Every keyboard-operable control shows a visible focus indicator that is not hidden by other content.', official: ['focus-visible', 'focus-not-obscured-minimum'], local: 'Focus uses the --pqc-focus token with a 2px outline and an offset so it is not clipped by pill and rounded shapes. The choice of ring color (existing ink / paper or Carbon blue) is open.', applies: 'Colors, Shape, Motion'},
  {id: 'motion-reduce', area: 'Motion', rule: 'Motion that starts from an interaction can be disabled; moving, blinking or auto-updating content longer than five seconds can be paused, stopped or hidden.', official: ['animation-from-interactions', 'pause-stop-hide'], local: 'Honor prefers-reduced-motion: replace movement with a fade or remove it. Durations come from the motion tokens (short4 = ' + (motion.durations.find(d => d.token.endsWith('short4'))?.ms ?? '?') + 'ms). Whether production loops need a static fallback is open.', applies: 'Motion, Illustrations (sprites, scenes)'},
  {id: 'resize', area: 'Text and layout', rule: 'Text can be resized to 200% without loss of content; content reflows at a 320 CSS pixel width; text-spacing overrides do not break layout.', official: ['resize-text', 'reflow', 'text-spacing'], local: 'Sizes and gaps are specified in rem or px tokens so they can scale; no fixed-height text containers in the foundations. These checks have NOT been run across every foundation.', applies: 'Typography, Spacing'},
  {id: 'non-text', area: 'Icons and illustrations', rule: 'Meaningful images and icons have a text alternative; decorative ones are hidden from assistive technology.', official: ['non-text-content', 'name-role-value'], local: 'Decorative illustrations and icons use alt="" or aria-hidden; an icon that is the only content of a control gets an accessible name on the control.', applies: 'Icons, Illustrations'},
  {id: 'keyboard', area: 'Keyboard and semantics', rule: 'All functionality is operable by keyboard.', official: ['keyboard'], local: 'Use native buttons, links, inputs and dialogs; custom shapes never change the element type.', applies: 'Shape, Overview'},
];

/* ------------------------------------------------------- contrast evidence */

export type PairDef = {label: string; fg: string; bg: string; kind: 'text' | 'ui'; need: string; open?: string};
export const PAIRS: PairDef[] = [
  {label: 'Primary text on page', fg: 'text-primary', bg: 'background', kind: 'text', need: '4.5:1'},
  {label: 'Primary text on Layer 01', fg: 'text-primary', bg: 'layer-01', kind: 'text', need: '4.5:1'},
  {label: 'Secondary text on Layer 01', fg: 'text-secondary', bg: 'layer-01', kind: 'text', need: '4.5:1'},
  {label: 'Helper text on Layer 01', fg: 'text-helper', bg: 'layer-01', kind: 'text', need: '4.5:1'},
  {label: 'Error text on Layer 01', fg: 'text-error', bg: 'layer-01', kind: 'text', need: '4.5:1'},
  {label: 'Link on Layer 01', fg: 'link', bg: 'layer-01', kind: 'text', need: '4.5:1'},
  {label: 'Label on primary button', fg: 'on-interactive-primary', bg: 'interactive-primary', kind: 'text', need: '4.5:1'},
  {label: 'Label on selected chip', fg: 'on-chip-selected', bg: 'chip-selected', kind: 'text', need: '4.5:1'},
  {label: 'Orange accent as text on page', fg: 'accent', bg: 'background', kind: 'text', need: '4.5:1', open: 'Open: orange as text is a known question (Colors).'},
  {label: 'Focus ring on page', fg: 'focus', bg: 'background', kind: 'ui', need: '3:1'},
  {label: 'Strong border on Layer 01', fg: 'border-strong-01', bg: 'layer-01', kind: 'ui', need: '3:1'},
  {label: 'Primary icon on Layer 01', fg: 'icon-primary', bg: 'layer-01', kind: 'ui', need: '3:1'},
  {label: 'Primary button fill on page', fg: 'interactive-primary', bg: 'background', kind: 'ui', need: '3:1'},
];
export type PairResult = PairDef & {mode: Mode; result: Result};
export function contrastEvidence(mode: Mode): PairResult[] {
  return PAIRS.map(p => ({...p, mode, result: pair(mode, 'A', p.fg, p.bg, p.kind)}));
}
export const OPTION_A = PRIMARY_OPTIONS.A.name;
export const measureRatio = measure;

/* -------------------------------------------------------- touch targets */

export const TARGETS = [
  {px: 24, basis: 'official' as TagKind, label: `WCAG 2.5.8 minimum (AA)`},
  {px: 44, basis: 'official' as TagKind, label: `WCAG 2.5.5 enhanced (AAA)`},
  {px: MATERIAL_TARGET, basis: 'material' as TagKind, label: 'Material Web touch target'},
];
export const CHIP_HEIGHT = 32; // Material chip height; shown against the targets above (see Spacing for its source)

/* ----------------------------------------------------------- checks status */

export type Check = {check: string; status: 'run' | 'not-run' | 'partial'; detail: string};
export const CHECKS: Check[] = [
  {check: 'Storybook axe (a11y addon)', status: 'partial', detail: 'Configured in "todo" mode: violations are shown in the Storybook UI and do not fail the build. The color-contrast rule is disabled on specimens that show low-contrast examples on purpose; their measured ratios are reported in the pages instead.'},
  {check: 'Computed-style assertions in story tests', status: 'run', detail: 'Radii, spacing, type size, motion duration and color differences between modes are asserted on rendered specimens (Foundations Overview).'},
  {check: 'Contrast ratios (this page)', status: 'run', detail: 'Computed from the Carbon color model for both modes (Contrast Evidence).'},
  {check: 'Screen reader walkthrough', status: 'not-run', detail: 'Not run on any foundation.'},
  {check: 'Keyboard-only walkthrough on real browsers and devices', status: 'not-run', detail: 'Not run. Focus styles are specified and shown, not verified on devices.'},
  {check: '200% text resize, 320px reflow, text-spacing override', status: 'not-run', detail: 'Not run across all foundations.'},
  {check: 'Reduced-motion behavior in production', status: 'not-run', detail: 'Production code was audited for reduced-motion rules (Motion & Animation); behavior was not verified end to end.'},
  {check: 'Conformance statement', status: 'not-run', detail: 'None is claimed. Automated checks cannot establish conformance.'},
];
