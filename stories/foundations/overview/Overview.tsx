import {useMemo} from 'react';
import type {CSSProperties} from 'react';
import {Layer, ModeFrame} from '../carbon/CarbonColors';
import {MODES, MODE_LABEL, type Mode} from '../carbon/carbon-model';
import {shadowVars} from '../depth/depth-model';
import {Icon, IconFontStyles} from '../icons/Icons';
import {cssEasing, bezOf, durationByToken, easingByToken} from '../motion/motion-model';
import {radiusVars} from '../shape/shape-model';
import {spacingVars} from '../spacing/spacing-model';
import {roleOf} from '../typography/typography-model';
import verification from '../../design-review/token-verification.json';
import {Legend, Page, Tag} from './ui';

/** The one set of values the composed specimen uses. Each comes from its own foundation's model; nothing is retyped. */
export const SPEC_MOTION = {duration: durationByToken('md.sys.motion.duration.short4'), easing: easingByToken('md.sys.motion.easing.standard')};
export const SPEC_ROLES = {title: roleOf('title', 'large'), body: roleOf('body', 'medium'), label: roleOf('label', 'large')};
export function specVars(mode: Mode): CSSProperties {
  const px = (n: number) => `${n}px`;
  return {
    ...spacingVars('medium', 'px'),
    ...radiusVars('M'),
    ...shadowVars(mode, 'carbon'),
    '--pqt-title-size': px(SPEC_ROLES.title.sizePx), '--pqt-title-line': px(SPEC_ROLES.title.lineHeightPx),
    '--pqt-body-size': px(SPEC_ROLES.body.sizePx), '--pqt-body-line': px(SPEC_ROLES.body.lineHeightPx),
    '--pqt-label-size': px(SPEC_ROLES.label.sizePx), '--pqt-label-line': px(SPEC_ROLES.label.lineHeightPx),
    '--pqm-ms': `${SPEC_MOTION.duration.ms}ms`, '--pqm-ease': cssEasing(bezOf(SPEC_MOTION.easing)),
  } as CSSProperties;
}

/* ------------------------------------------------------- the foundations map */

export type FoundationRow = {name: string; story: string; prefix: string; source: string; dependsOn: string; status: string; kind: 'decided' | 'open'};
export const FOUNDATIONS: FoundationRow[] = [
  {name: 'Colors (Carbon)', story: 'Foundations / Colors', prefix: 'pqc', source: 'carbon/carbon-model.ts', dependsOn: 'Existing brand colors read live from production CSS', status: 'Canonical (Option A, ink / paper). Carbon light and Gray 100 layering preserved. Other color details still open.', kind: 'decided'},
  {name: 'Surfaces & Depth', story: 'Foundations / Surfaces & Depth', prefix: 'pqs', source: 'depth/depth-model.ts', dependsOn: 'Colors (layers, borders)', status: 'Proposal. Dark floating treatment and modal shadow still open.', kind: 'open'},
  {name: 'Spacing & Layout', story: 'Foundations / Spacing & Layout', prefix: 'pqx', source: 'spacing/spacing-model.ts', dependsOn: 'Material spacing data', status: 'Proposal. Unit, touch target and local values still open.', kind: 'open'},
  {name: 'Typography', story: 'Foundations / Typography', prefix: 'pqt', source: 'typography/typography-model.ts', dependsOn: 'Existing font families read live from production CSS', status: 'Proposal (Option P suggested default, not confirmed). Several items still open.', kind: 'open'},
  {name: 'Shape & Corners', story: 'Foundations / Shape & Corners', prefix: 'pqr', source: 'shape/shape-model.ts', dependsOn: 'Material shape data; component shapes feed Spacing and Colors specimens', status: 'Option M adopted; buttons all pills; custom shapes preserved. Dialog mapping and review shapes open.', kind: 'decided'},
  {name: 'Motion & Animation', story: 'Foundations / Motion & Animation', prefix: 'pqm', source: 'motion/motion-model.ts', dependsOn: 'Material motion data', status: 'Proposal. Buckets and reduced-motion rules still open.', kind: 'open'},
  {name: 'Icons', story: 'Foundations / Icons', prefix: 'pqi', source: 'icons/icons-model.ts', dependsOn: 'Colors (icon tokens), Spacing (touch target), Motion (state duration)', status: 'Outlined by default, filled for active or selected. Sizes, XS and glyph mapping still open.', kind: 'decided'},
  {name: 'Illustrations', story: 'Foundations / Illustrations', prefix: 'pqn', source: 'illustrations/illustrations-model.ts', dependsOn: 'Colors (brand hues), Spacing (frames), existing art audited read-only', status: 'Ratio set, per-family rendering, focal-point cropping and the AI route decided; mappings and values open.', kind: 'decided'},
];
export const prefixCount = (p: string) => (verification.prefixes as Record<string, number>)[p] ?? 0;

export function FoundationsMap() {
  return (
    <div className="pqv-scroll"><table data-testid="foundations-map">
      <thead><tr><th scope="col">Foundation</th><th scope="col">Token prefix</th><th scope="col">Names in source</th><th scope="col">Built on</th><th scope="col">Status</th></tr></thead>
      <tbody>{FOUNDATIONS.map(f => (
        <tr key={f.prefix} data-testid={`map-${f.prefix}`}>
          <th scope="row">{f.name}<br /><span className="pqv-muted">{f.story}</span></th>
          <td><code>--{f.prefix}-*</code></td><td>{prefixCount(f.prefix)}</td><td>{f.dependsOn}</td><td><Tag kind={f.kind === 'decided' ? 'decided' : 'open'}>{f.kind === 'decided' ? 'Partly decided' : 'Open items'}</Tag> {f.status}</td>
        </tr>))}</tbody>
    </table></div>
  );
}

/* --------------------------------------------------------- composed specimen */

export function SpecimenBody({mode}: {mode: Mode}) {
  return (
    <div data-testid={`spec-${mode}`} style={specVars(mode)} className="pqv-spec-wrap">
      <Layer hideMeta title={`All foundations on ${MODE_LABEL[mode]}`}>
        <div className="pqv-spec" data-testid={`spec-card-${mode}`}>
          <h3 className="pqv-spec-title" data-testid={`spec-title-${mode}`}>Selected Work</h3>
          <p className="pqv-spec-body">One surface using color, depth, spacing, type, shape, motion and icons together.</p>
          <div className="pqv-spec-row">
            <button type="button" className="pqv-spec-btn" data-testid={`spec-btn-${mode}`}><Icon name="search" size="sm" color="on-interactive-primary" /> Explore</button>
            <button type="button" className="pqv-spec-chip" aria-pressed="true" data-testid={`spec-chip-${mode}`}>Filter</button>
            <input className="pqv-spec-field" placeholder="Search" aria-label={`Search field ${mode}`} data-testid={`spec-field-${mode}`} />
          </div>
          <div className="pqv-spec-menu" role="menu" aria-label={`Menu ${mode}`} data-testid={`spec-menu-${mode}`}><span role="menuitem">Newest</span><span role="menuitem">Oldest</span></div>
          <Layer hideMeta>
            <div className="pqv-spec-card" data-testid={`spec-panel-${mode}`}><strong>Preserved panel</strong><span className="pqv-muted">Cards, panels and navigation keep their own shapes; they take layer and border tokens only.</span></div>
          </Layer>
        </div>
      </Layer>
    </div>
  );
}
export function ComposedSpecimens() {
  return (
    <section>
      <IconFontStyles />
      <div className="pqv-cmp" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))'}}>
        {MODES.map(m => <ModeFrame key={m} mode={m} title={MODE_LABEL[m]}><SpecimenBody mode={m} /></ModeFrame>)}
      </div>
      <div className="pqv-scroll"><table data-testid="spec-table" style={{marginTop: '1rem'}}>
        <caption className="pqv-muted" style={{textAlign: 'left'}}>Where each value in the specimen comes from</caption>
        <thead><tr><th scope="col">Part</th><th scope="col">Foundation and token</th><th scope="col">Value</th></tr></thead>
        <tbody>
          <tr><td>Surface, text, borders, focus</td><td>Colors: <code>--pqc-layer</code>, <code>--pqc-text-*</code>, <code>--pqc-border-*</code>, <code>--pqc-focus</code></td><td>Differ between Carbon White and Gray 100</td></tr>
          <tr><td>Menu shadow</td><td>Surfaces &amp; Depth: <code>--pqs-shadow-floating</code></td><td>Carbon floating shadow (dark treatment still open)</td></tr>
          <tr><td>Padding and gaps</td><td>Spacing: <code>--pqx-card-padding</code>, <code>--pqx-button-height</code>, <code>--pqx-chip-height</code> …</td><td>Identical in both modes</td></tr>
          <tr><td>Title, body, label</td><td>Typography: Material title-large, body-medium, label-large sizes</td><td>{SPEC_ROLES.title.sizePx}/{SPEC_ROLES.body.sizePx}/{SPEC_ROLES.label.sizePx}px</td></tr>
          <tr><td>Button, chip, field, menu corners</td><td>Shape (Option M): <code>--pqr-button</code>, <code>--pqr-chip</code>, <code>--pqr-input-outlined</code>, <code>--pqr-menu</code></td><td>Pill, 8px, 4px, 4px; identical in both modes</td></tr>
          <tr><td>Button hover</td><td>Motion: short4 with the standard easing</td><td>{SPEC_MOTION.duration.ms}ms</td></tr>
          <tr><td>Search icon</td><td>Icons: Material Symbols Rounded, outlined, 20px</td><td>Colored by <code>on-interactive-primary</code></td></tr>
          <tr><td>Panel</td><td>Intentional exception: preserved card/panel shape</td><td>No new radius</td></tr>
        </tbody>
      </table></div>
    </section>
  );
}

export function OverviewPage() {
  const decided = useMemo(() => [
    'Colors: the Carbon system (Option A) is canonical; the original Colors section is archived. Carbon light and Gray 100 layering preserved.',
    'Shape: Material 3 for standard controls (Option M); every standard button is a pill, including existing sharp editorial buttons; custom card, panel, navigation and game shapes preserved.',
    'Dialogs: the compact pattern is chosen by content and purpose, not one universal mobile treatment.',
    'Illustrations: 3D documentation lives under Illustrations; editorial ratios 1:1, 4:3, 3:2 and 16:9 by usage; rendering standardized within each pixel-art family; crops preserve scene focal points; AI-generated 3D artwork is the future production approach (nothing generated yet).',
  ], []);
  return (
    <Page title="Foundations overview">
      <Legend />
      <h2>How the foundations fit together</h2>
      <p>Colors set the surfaces. Depth, spacing, type, shape and motion are built on those surfaces and never change a color. Icons and illustrations sit inside them. Every custom property uses one prefix per foundation, so a name tells you where it comes from.</p>
      <FoundationsMap />
      <h2>All foundations at once</h2>
      <p className="pqv-muted">One composed specimen in Carbon White and Gray 100. The values come from each foundation&rsquo;s own model, so a change in one foundation shows up here.</p>
      <ComposedSpecimens />
      <h2>Decided by the owner</h2>
      <ul data-testid="overview-decided">{decided.map(d => <li key={d}><Tag kind="decided" /> {d}</li>)}</ul>
      <p>Everything not listed above is <strong>not approved</strong>. The full list, with visual comparisons, is in Design Review / Open Decisions; where each rule comes from is in Design Review / Provenance; shared-token checks are in Design Review / Token Verification.</p>
    </Page>
  );
}
