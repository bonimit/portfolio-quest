import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import type {ReactNode} from 'react';
import {Banner, ComponentShapes, ComponentSet, DecisionTable, Exceptions, ExistingVsProposed, Page, RadiusCensus, Responsive, ShapeScale, Switched, Tag, ThemePreviews, TokenTables} from './shape/Shape';
import {ModeFrame, Layer} from './carbon/CarbonColors';
import {ASYMMETRIC, DECISIONS, FRAMES, M3, PRIMITIVES, distinctPrimitives, nearestStep, primitive, shapeFor, type Option} from './shape/shape-model';
import {expand, runRadiusCensus} from './shape/shape-census';

/*
 * Foundations / Shape & Corners — proposal. Corner values come from shape/../material/material-shape.json (generated from @material/web and
 * cross-checked against the rendered m3.material.io corner-radius-scale page). Everything about today's site is read live from production CSS.
 * Buttons are pill-shaped; each other component takes its own step; cards, panels, navigation and creative themes are preserved.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Foundations/Shape & Corners', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

const P = ({title, children}: {title: string; children: ReactNode}) => <Page title={title}><Banner />{children}</Page>;
const radius = (el: Element) => getComputedStyle(el).borderRadius;
/** Expected computed border-radius string for a decision under an option (Chrome serialises equal corners as one value). */
const expected = (id: string, o: Option) => { const css = shapeFor(id, o).css; const parts = css.split(' '); return parts.length === 4 && parts.every(x => x === parts[0]) ? parts[0] : css.replace(/\b0px\b/g, '0px'); };
const sameOrder = (a: string) => a.split(' ').map(x => x.replace(/^0$/, '0px')).join(' ');

export const Overview: Story = {
  render: () => (
    <P title="Foundations / Shape & Corners · proposal">
      <h2>Direction</h2>
      <ul>
        <li><Tag kind="official" /> Material 3 corner-radius scale: ten styles, none (0) to full, documented below with Material’s own values.</li>
        <li>Buttons stay <strong>pill-shaped</strong> (full). Chips, inputs, menus and other standard controls take the Material step for that component; there is no single universal radius.</li>
        <li><Tag kind="preserved" /> Existing cards, panels, navigation and the Island, Arcade, Neon and game treatments are preserved. Material itself says customization is “sometimes necessary, and even encouraged, for hero moments or custom components”.</li>
      </ul>
      <h2>Findings you should know first</h2>
      <ol>
        <li><strong>Owner decision: Option M.</strong> Chips, outlined inputs and standard menus follow Material (chip 8px, outlined input 4px, menu 4px). Option C (pill chips, 8px fields) is kept only as the comparison and is not adopted.</li>
        <li><strong>The committed specimens now disagree with the decided system:</strong> the Colors, Icons and Motion specimens draw pill chips and 8px fields. Existing vs Proposed lists exactly which differ; they are specimens, not production, and are not edited here.</li>
        <li><strong>Owner decision: all standard buttons are pills</strong>, including the existing sharp 2px editorial buttons. That is a visible change for those buttons in the proposed system.</li>
        <li><strong>Material’s own pages give no responsive shape rules</strong>, so every Responsive statement is local.</li>
        <li>Some Material values are package-only: <code>full</code> (9999px), the asymmetric tokens and each component’s shape. The nine numeric steps are page-verified.</li>
      </ol>
      <h2>Decided by the owner</h2>
      <ul data-testid="shape-decided"><li>Option M for chips, outlined inputs and standard menus (baseline 4px menu).</li><li>All standard buttons, including sharp editorial ones, are pills.</li><li>The compact dialog pattern is chosen by content and purpose, not one universal treatment.</li><li>Custom card, panel, navigation and game shapes are preserved.</li></ul>
      <h2>Still open (not approved)</h2>
      <ol data-testid="shape-open"><li>The mapping from dialog content type to pattern (proposal on the Responsive page).</li><li>Which “requires review” production shapes are standard UI.</li><li>Whether the expressive 16px menu is ever wanted (not part of the baseline decision).</li></ol>
      <h2>Provenance</h2>
      <p>Generated {M3.provenance.generatedOn}. {M3.provenance.note}</p>
    </P>
  ),
  play: async () => {
    await expect(PRIMITIVES).toHaveLength(10);
    await expect(M3.scale.filter(s => s.name !== 'full').every(s => (s as {pageVerified?: boolean}).pageVerified)).toBe(true);
    await expect(primitive('full').px).toBe(9999);
    await expect(PRIMITIVES.map(p => p.px)).toEqual([0, 4, 8, 12, 16, 20, 28, 32, 48, 9999]);
  },
};

export const ShapeScaleStory: Story = {
  name: 'Shape Scale',
  render: () => <P title="Material 3 shape scale"><ShapeScale /></P>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Each sample renders exactly the corner value from the JSON.
    for (const p of PRIMITIVES) await expect(radius(c.getByTestId(`sample-${p.key}`))).toBe(`${p.px}px`);
    for (const a of ASYMMETRIC) await expect(sameOrder(radius(c.getByTestId(`asym-${a.name}`)))).toBe(`${a.corners.tl}px ${a.corners.tr}px ${a.corners.br}px ${a.corners.bl}px`);
    await expect(c.getByTestId('scale-full')).toHaveTextContent('9999px');
    // Interactive: the example height changes; a fixed step keeps its radius while `full` stays a pill.
    await userEvent.type(c.getByTestId('scale-height'), '{arrowright}');
    await expect(c.getByTestId('scale-height-value')).toHaveTextContent(/px/);
    await expect(radius(c.getByTestId('sample-md'))).toBe('12px');
    await expect(c.getByTestId('scale-table')).toHaveTextContent(/fully rounded|pill/);
  },
};

export const ComponentShapesStory: Story = {
  name: 'Component Shapes',
  render: () => <P title="Component shapes"><Switched>{opt => <ComponentShapes opt={opt} />}</Switched></P>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Every specimen's computed radius equals the model's token for the active option (Option M).
    for (const d of DECISIONS) {
      const el = canvasElement.querySelector(`[data-testid="shape-${d.id}"]`);
      if (!el) continue;
      await expect(sameOrder(radius(el))).toBe(sameOrder(expected(d.id, 'M')));
    }
    // Buttons are pill-shaped in every variant.
    for (const b of canvasElement.querySelectorAll('.pqr-btnf')) await expect(radius(b)).toBe('9999px');
    // Not one universal radius: the component set uses at least four distinct primitives.
    await expect(distinctPrimitives('M').size).toBeGreaterThanOrEqual(4);
    // Option C changes only chip, outlined input and menu.
    await userEvent.click(c.getByLabelText(/Option C/));
    await expect(radius(c.getByTestId('shape-chip'))).toBe('9999px');
    await expect(radius(c.getByTestId('shape-input-outlined'))).toBe('8px');
    await expect(radius(c.getByTestId('shape-menu'))).toBe('8px');
    await expect(radius(c.getByTestId('shape-dialog'))).toBe('28px');
    await expect(radius(c.getByTestId('shape-checkbox'))).toBe('2px'); // package literal, off the scale
    const changed = DECISIONS.filter(d => shapeFor(d.id, 'M').css !== shapeFor(d.id, 'C').css).map(d => d.id).sort();
    await expect(changed).toEqual(['chip', 'input-outlined', 'menu']);
    await expect(c.getByTestId('decision-button')).toHaveTextContent('full (9999px)');
  },
};

export const ExistingVsProposedStory: Story = {
  name: 'Existing vs Proposed',
  render: () => <P title="Existing vs proposed"><Switched>{opt => <ExistingVsProposed opt={opt} />}</Switched></P>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByTestId('evp-table')).toBeVisible(), {timeout: 20000});
    // Read live: the work chip is a pill today; Material's chip is 8px, so Option M is a visible change and Option C is not.
    await waitFor(() => expect(c.getByTestId('evp-cur-.work-chip')).toHaveTextContent('999px'), {timeout: 20000});
    await expect(c.getByTestId('evp-.work-chip').getAttribute('data-change')).toBe('Visible change');
    // The global action link is 2px (var(--temp-radius-sm)); pill buttons would be a visible change.
    await expect(c.getByTestId('evp-cur-.action-link')).toHaveTextContent('2px');
    await expect(c.getByTestId('evp-.action-link').getAttribute('data-change')).toBe('Visible change');
    // Preserved roles are never mapped.
    await expect(c.getByTestId('evp-.landing-card').getAttribute('data-change')).toBe('Preserved');
    await expect(c.getByTestId('evp-.work-card').getAttribute('data-change')).toBe('Preserved');
    // The committed Storybook specimens are compared, not edited.
    await expect(c.getByTestId('committed-.pqc-chip')).toHaveTextContent('Option C');
    await expect(c.getByTestId('committed-.pqc-input')).toHaveTextContent('Option C');
    await userEvent.click(c.getByLabelText(/Option C/));
    await expect(c.getByTestId('evp-.work-chip').getAttribute('data-change')).toBe('Unchanged');
  },
};

export const ResponsiveStory: Story = {
  name: 'Responsive',
  render: () => <P title="Desktop, tablet and mobile"><Switched>{opt => <Responsive opt={opt} />}</Switched></P>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('resp-note')).toHaveTextContent(/no per-window-class guidance/);
    // Corner values are constant across window classes (button, chip, input), measured on real frames.
    for (const f of FRAMES) {
      await expect(radius(c.getByTestId(`frame-button-${f.key}`))).toBe('9999px');
      await expect(radius(c.getByTestId(`frame-chip-${f.key}`))).toBe('8px');
      await expect(radius(c.getByTestId(`frame-input-${f.key}`))).toBe('4px');
      const frame = c.getByTestId(`frame-${f.key}`);
      await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
    }
    await expect(sameOrder(radius(c.getByTestId('frame-sheet-mobile')))).toBe('28px 28px 0px 0px');
    await expect(radius(c.getByTestId('frame-dialog-desktop'))).toBe('28px');
    await expect(c.getByTestId('resp-table')).toHaveTextContent(/corner none/);
    // Owner decision: the compact pattern depends on content and purpose, so three different content types map to three treatments.
    await expect(c.getByTestId('pattern-confirm')).toHaveTextContent('Dialog');
    await expect(c.getByTestId('pattern-choice')).toHaveTextContent('Bottom sheet');
    await expect(c.getByTestId('pattern-task')).toHaveTextContent('Full-screen dialog');
    await expect(c.getByTestId('resp-note')).toHaveTextContent('content and purpose');
  },
};

export const ThemePreviewsStory: Story = {
  name: 'Theme Previews',
  render: () => <P title="Carbon White and Gray 100"><Switched>{opt => <ThemePreviews opt={opt} />}</Switched></P>,
  play: async ({canvasElement}) => {
    const light = canvasElement.querySelector('[data-testid="set-light"]')!, dark = canvasElement.querySelector('[data-testid="set-dark"]')!;
    // Shape is identical in both themes; only color tokens differ.
    for (const id of ['button', 'chip', 'input-outlined', 'menu', 'dialog']) {
      await expect(radius(light.querySelector(`[data-testid="shape-${id}"]`)!)).toBe(radius(dark.querySelector(`[data-testid="shape-${id}"]`)!));
    }
    await expect(getComputedStyle(light.querySelector('[data-testid="shape-dialog"]')!).backgroundColor).not.toBe(getComputedStyle(dark.querySelector('[data-testid="shape-dialog"]')!).backgroundColor);
  },
};

export const ExceptionsStory: Story = {
  name: 'Exceptions',
  render: () => <P title="Preserved shapes"><Exceptions /><h2>All production radius values</h2><RadiusCensus /></P>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByTestId('ex-line')).toBeVisible(), {timeout: 20000});
    await expect(c.getByTestId('ex-line')).toHaveTextContent(/design-audit/);
    // Cards and navigation declare no radius (sharp); panels use the 2px panel token. All are preserved, not mapped.
    await expect(c.getByTestId('ex-.landing-card')).toHaveTextContent('no radius declared');
    await expect(c.getByTestId('ex-.path-card')).toHaveTextContent('2px');
    await expect(c.getByTestId('ex-.world-page')).toHaveTextContent(/28px/);
    await expect(c.getByTestId('group-Adventure / Island / Arcade / Neon')).toBeVisible();
    await expect(c.getByTestId('review-line')).toHaveTextContent(/requires review|not covered/);
    await expect(c.getByTestId('tok---temp-radius-pill')).toHaveTextContent('full');
    // The census never includes untracked audit tooling or scene-review files.
    await waitFor(() => expect(c.getByTestId('census-table')).toBeVisible(), {timeout: 20000});
    const census = await runRadiusCensus();
    await expect(census.uses.some(u => /design-audit|scene-review/.test(u.file))).toBe(false);
    await expect(nearestStep(2).tie).not.toBeNull(); // 2px sits exactly between none and extra-small
    // 28px (1.75rem) happens to land exactly on Material extra-large.
    await expect(nearestStep(28).onScale).toBe(true);
    await expect(expand(['1px', '2px'])).toEqual(['1px', '2px', '1px', '2px']);
  },
};

export const Tokens: Story = {
  render: () => <P title="Token architecture"><TokenTables /></P>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('prim-full')).toHaveTextContent('9999px');
    await expect(c.getByTestId('decision-table')).toHaveTextContent('full (9999px)');
    const json = JSON.parse(c.getByTestId('token-json').textContent!);
    await expect(Object.keys(json.primitive)).toContain('shape-corner-xl');
    await expect(json.component['shape-chip'].M).toBe('8px');
    await expect(json.component['shape-chip'].C).toBe('9999px');
    await expect(json.component['shape-button'].usesPrimitive.M).toBe('full');
    // Component decisions reference primitives; only the checkbox holds a literal.
    const literals = DECISIONS.filter(d => shapeFor(d.id, 'M').prim === 'literal').map(d => d.id);
    await expect(literals).toEqual(['checkbox']);
    await expect(c.getByTestId('pres-table')).toHaveTextContent('--temp-radius-pill');
  },
};

export const HiddenHelpers: Story = {
  tags: ['!dev'],
  render: () => <Page title="helpers"><ModeFrame mode="light"><Layer hideMeta title="x"><ComponentSet mode="light" opt="M" /></Layer></ModeFrame><DecisionTable opt="M" /></Page>,
};
