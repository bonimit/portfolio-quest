import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import type {ReactNode} from 'react';
import {
  BasisTag, BreakpointCensus, CensusView, Crosswalk, CuratedTable, ExceptionsTable, GapSpecimens, PageContent, PaddingSpecimens, ResponsiveFrames, ResponsiveTable,
  ScaleBars, ScaleTable, SpacingBanner, SpacingJson, Surface, TokenTables, UnitSwitcher, ValidationTable, useCensus, useUnit,
} from './spacing/Spacing';
import {
  BASIS_LABEL, BRIEF_VALUES, CLASSES, COMPONENT, EXISTING_LIVE, FRAME_WIDTHS, GRID_COLUMNS, M3, PRIMITIVES, SEMANTIC, classOf, dpFor, duplicates, type Unit,
} from './spacing/spacing-model';

/*
 * Foundations / Spacing & Layout — proposal. Numbers come from spacing/../material/material-spacing.json (generated from
 * m3.material.io and @material/web) or are read live from production CSS. Proposal only; nothing is implemented.
 */
type Args = {unit: Unit};
const Page = ({title, children}: {title: string; children: ReactNode}) => <main className="fx"><h1>{title}</h1><SpacingBanner />{children}</main>;

// Specimens use real tokens on neutral surfaces and deliberately show hit-area outlines; axe color-contrast is off here only.
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {
  title: 'Foundations/Spacing & Layout',
  parameters: {layout: 'fullscreen', a11y: specimenA11y},
  argTypes: {unit: {control: 'inline-radio', options: ['px', 'rem']}},
  args: {unit: 'px'},
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

const px = (v: string) => parseFloat(v);
const withRootFont = async (size: string, fn: () => Promise<void>) => {
  const root = document.documentElement; const prev = root.style.fontSize;
  root.style.fontSize = size;
  try { await fn(); } finally { root.style.fontSize = prev; }
};
const noOverflow = (el: Element) => el.scrollWidth <= el.clientWidth + 1;

export const Overview: Story = {
  render: () => (
    <Page title="Spacing & Layout — overview">
      <h2>Where each value comes from</h2>
      <ul>{(Object.keys(BASIS_LABEL) as (keyof typeof BASIS_LABEL)[]).map(b => <li key={b}><BasisTag basis={b} /></li>)}</ul>
      <ul>
        <li><strong>Verified:</strong> the Material system scale is 18 steps on an 8dp base (<code>space100 = 8dp</code>); all 11 values in the brief (0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64) are official steps. Seven more official steps (6, 10, 14, 20, 36, 56, 72) are available but not adopted.</li>
        <li><strong>Verified:</strong> window classes Compact &lt;600, Medium 600–839, Expanded 840–1199, Large 1200–1599, Extra-large ≥1600 (m3.material.io “Breakpoints”; they apply to Android and web), with margins 16dp compact and 24dp otherwise and 24dp pane spacers.</li>
        <li><strong>Caveat:</strong> {M3.quotes.composeOnly} The overview lists Web as “Unavailable”. Component values come from <code>{M3.provenance.package}</code> (legacy “-space” naming).</li>
        <li><strong>Material says:</strong> “{M3.quotes.textScale}” — so spacing is not meant to grow with text.</li>
        <li><strong>Local:</strong> 1dp = 1px for web, the rem output, every semantic and component token name, section/grid/content values, and grid column counts.</li>
      </ul>
      <h2>Open decisions (none are decided)</h2>
      <ol>
        <li><strong>Unit:</strong> {`px (matches Material’s “same spacing when text scales”) vs rem (matches existing code, scales with text).`}</li>
        <li><strong>Local values:</strong> section spacing, grid gap, content padding, field-group spacing and compact gutter are not Material-verified.</li>
        <li><strong>Touch target:</strong> 24 (WCAG 2.2 AA, 2.5.8) vs 44 (AAA, 2.5.5) vs Material’s 48; the Material 32px chip is below all but 24 unless its hit area is padded.</li>
        <li><strong>Page-margin token shape:</strong> one <code>spacing-page</code> with five window-class modes, vs separate <code>spacing-page-compact</code> / <code>-expanded</code> tokens (Medium to Extra-large share 24).</li>
        <li><strong>Exceptions:</strong> the path-derived exception list (Adventure, game world, D0–D6, hero/editorial) needs approval.</li>
      </ol>
      <h2>Sections</h2>
      <p>Spacing Scale · Padding · Gaps · Page Layout · Responsive Spacing · Existing vs Proposed · Token Architecture · Accessibility &amp; Validation.</p>
    </Page>
  ),
};

export const SpacingScale: Story = {
  render: args => { const Inner = () => { const [unit, setUnit] = useUnit(args.unit); return (
    <Page title="Spacing scale">
      <UnitSwitcher value={unit} onChange={setUnit} />
      <p className="fx-muted">Solid bars are the 11 adopted values; hatched bars are official steps available but not adopted. Bar length = 8 × value.</p>
      <ScaleBars unit={unit} />
      <h2>Token table</h2>
      <ScaleTable unit={unit} />
    </Page>); }; return <Inner />; },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(PRIMITIVES.length).toBe(18);
    await expect(BRIEF_VALUES.every(v => PRIMITIVES.some(p => p.dp === v))).toBe(true); // all 11 brief values are official steps
    await expect(PRIMITIVES.filter(p => p.adopted).length).toBe(11);
    await expect(PRIMITIVES.filter(p => !p.adopted).map(p => p.dp)).toEqual([6, 10, 14, 20, 36, 56, 72]);
    await expect(PRIMITIVES.every(p => p.dp === (M3.baseUnit * Number(p.name.slice(6))) / 100)).toBe(true);
    await expect(within(c.getByTestId('scale')).getAllByRole('img').length).toBe(18);
  },
};

export const Padding: Story = {
  render: args => { const Inner = () => { const [unit, setUnit] = useUnit(args.unit); return (
    <Page title="Padding — buttons, chips, inputs, cards, dialogs">
      <UnitSwitcher value={unit} onChange={setUnit} />
      <p className="fx-muted">Hatched areas show each element’s padding. Dashed outlines are hit areas (≥ <code>spacing-touch-target</code>).</p>
      <PaddingSpecimens unit={unit} />
    </Page>); }; return <Inner />; },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    const cs = (id: string) => getComputedStyle(c.getByTestId(id));
    await expect(px(cs('pad-button').paddingLeft)).toBe(dpFor('button-padding-x', 'medium'));
    await expect(px(cs('pad-button-icon').paddingLeft)).toBe(dpFor('button-padding-x-icon', 'medium'));
    await expect(px(cs('pad-chip').paddingLeft)).toBe(dpFor('chip-padding-x', 'medium'));
    await expect(px(cs('pad-chip').height)).toBe(dpFor('chip-height', 'medium'));
    await expect([cs('pad-input').paddingTop, cs('pad-input').paddingLeft].map(px)).toEqual([dpFor('input-padding-y', 'medium'), dpFor('input-padding-x', 'medium')]);
    await expect(px(cs('pad-card').paddingLeft)).toBe(dpFor('card-padding', 'medium'));
    await expect(px(cs('pad-dialog').paddingLeft)).toBe(dpFor('dialog-padding', 'medium'));
    // Targets: every control ≥ 24 (WCAG 2.2 SC 2.5.8, AA); every hit area ≥ 48 (Material Web).
    for (const el of canvasElement.querySelectorAll('[data-testid=padding-specimens] button, [data-testid=padding-specimens] input')) {
      const r = (el as HTMLElement).getBoundingClientRect();
      await expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(24);
    }
    for (const el of canvasElement.querySelectorAll('[data-testid=padding-specimens] .pqx-hit')) await expect((el as HTMLElement).getBoundingClientRect().height).toBeGreaterThanOrEqual(dpFor('spacing-touch-target', 'medium'));
    await expect(px(cs('pad-chip').height)).toBeLessThan(44); // documented review item: chip body is below 44
    // Unit option: at 200% root text, px spacing stays, rem spacing doubles.
    await withRootFont('200%', async () => {
      await expect(px(cs('pad-button').paddingLeft)).toBe(24);
      await userEvent.click(c.getByLabelText('Option R · rem (scales with text)'));
      await waitFor(() => expect(px(cs('pad-button').paddingLeft)).toBe(48));
      await userEvent.click(c.getByLabelText('Option P · px (fixed)'));
    });
  },
};

export const Gaps: Story = {
  render: args => { const Inner = () => { const [unit, setUnit] = useUnit(args.unit); return (
    <Page title="Gaps — between elements"><UnitSwitcher value={unit} onChange={setUnit} />
      <p className="fx-muted">Dashed outlines show the elements so the gaps between them read clearly.</p><GapSpecimens unit={unit} /></Page>); }; return <Inner />; },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(px(getComputedStyle(c.getByTestId('gap-icon')).columnGap)).toBe(dpFor('spacing-component-gap', 'medium'));
    await expect(px(getComputedStyle(c.getByTestId('gap-form')).rowGap)).toBe(dpFor('spacing-field-group', 'medium'));
    await expect(px(getComputedStyle(c.getByTestId('gap-nav')).columnGap)).toBe(dpFor('spacing-nav-gap', 'medium'));
    await expect(px(getComputedStyle(c.getByTestId('gap-grid')).columnGap)).toBe(dpFor('spacing-grid-gap', 'medium'));
  },
};

export const PageLayout: Story = {
  render: args => { const Inner = () => { const [unit, setUnit] = useUnit(args.unit); return (
    <Page title="Page layout — gutters, content width, sections, grids"><UnitSwitcher value={unit} onChange={setUnit} />
      <p className="fx-muted">Shaded bands are the page margin (<code>spacing-page</code>). {M3.quotes.lineLength.replace('keep', 'Material: keep')}</p>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="Page layout frames">
        <Surface cls="expanded" unit={unit} width={1024} testId="layout-1024"><PageContent cls="expanded" /></Surface>
      </div>
      <h2>Pane gutter</h2>
      <Surface cls="expanded" unit={unit}><div className="pqx-gutter-demo" style={{padding: '1rem'}}><div className="pqx-card">Pane A</div><div className="pqx-card">Pane B</div></div></Surface>
      <p className="fx-muted">Gutter <code>spacing-gutter</code> = {dpFor('spacing-gutter', 'expanded')}dp at Expanded (official 24dp spacer; Compact value is local). Material’s fixed pane is {M3.layout.expanded.fixedPane}dp (Expanded) and {M3.layout.large.fixedPane}dp (Large and up).</p>
    </Page>); }; return <Inner />; },
  play: async ({canvasElement}) => {
    const frame = within(canvasElement).getByTestId('layout-1024');
    const page = frame.querySelector('[data-testid=page]') as HTMLElement;
    await expect(px(getComputedStyle(page).paddingLeft)).toBe(M3.layout.expanded.margin);
    await expect(frame.querySelector('[data-testid=grid]')!.children.length).toBe(4);
    await expect(getComputedStyle(frame.querySelector('[data-testid=grid]')!).gridTemplateColumns.split(' ').length).toBe(GRID_COLUMNS.expanded);
  },
};

export const ResponsiveSpacing: Story = {
  render: args => { const Inner = () => { const [unit, setUnit] = useUnit(args.unit); return (
    <Page title="Responsive spacing — compact, medium, expanded, large, extra-large"><UnitSwitcher value={unit} onChange={setUnit} />
      <ResponsiveTable />
      <h2>Frames side by side (320 · one width per class)</h2>
      <p className="fx-muted">Frames scroll horizontally on small screens; the page itself must not overflow.</p>
      <ResponsiveFrames unit={unit} />
    </Page>); }; return <Inner />; },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const w of FRAME_WIDTHS) {
      const frame = c.getByTestId(`frame-${w}`);
      const cls = classOf(w);
      await expect(frame.dataset.wc).toBe(cls);
      await expect(px(getComputedStyle(frame.querySelector('[data-testid=page]')!).paddingLeft)).toBe(dpFor('spacing-page', cls));
      await expect(getComputedStyle(frame.querySelector('[data-testid=grid]')!).gridTemplateColumns.split(' ').length).toBe(GRID_COLUMNS[cls]);
      await expect(noOverflow(frame)).toBe(true); // 320 = WCAG 1.4.10 reflow width; others included
    }
    // Focus ring (offset + width) fits inside the smallest page margin.
    await expect(px(getComputedStyle(c.getByTestId('frame-320').querySelector('[data-testid=page]')!).paddingLeft)).toBeGreaterThanOrEqual(6);
    // 200% text (WCAG 1.4.4), both unit options: no overflow, nothing clipped.
    await withRootFont('200%', async () => {
      for (const unit of ['Option P · px (fixed)', 'Option R · rem (scales with text)']) {
        await userEvent.click(c.getByLabelText(unit));
        await waitFor(() => { for (const w of FRAME_WIDTHS) expect(noOverflow(c.getByTestId(`frame-${w}`))).toBe(true); });
      }
      await userEvent.click(c.getByLabelText('Option P · px (fixed)'));
    });
  },
};

export const ExistingVsProposed: Story = {
  render: () => { const Inner = () => { const census = useCensus(); return (
    <Page title="Existing vs proposed">
      <p className="fx-muted">Values are read live from production CSS. Nothing is changed. “Proposed exception” rows follow your preserve list and need approval; everything else “requires review”.</p>
      <h2>Existing tokens → nearest official step</h2><Crosswalk />
      <h2>Components</h2><CuratedTable census={census} />
      <h2>Census (not cherry-picked)</h2><CensusView census={census} />
      <h2>Media-query widths</h2><BreakpointCensus census={census} />
      <h2>Intentional exceptions</h2><ExceptionsTable census={census} />
    </Page>); }; return <Inner />; },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    const curated = await c.findByTestId('curated', {}, {timeout: 20000});
    await expect(curated.querySelectorAll('tr[data-found="false"]').length).toBe(0); // every curated selector exists in source
    await expect(curated.querySelectorAll('tbody tr').length).toBe(EXISTING_LIVE.length);
    await expect(Number((await c.findByTestId('census-official')).textContent)).toBeGreaterThan(0);
    await expect(c.getByTestId('bp-census').querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(3);
    await expect(c.getByTestId('exceptions-spacing').textContent).toMatch(/app\/world\/adventure\.css/);
    await expect(c.getByTestId('crosswalk').textContent).not.toMatch(/not found/);
  },
};

export const TokenArchitecture: Story = {
  render: () => (
    <Page title="Token architecture">
      <ol>
        <li><strong>Primitive</strong> — <code>space-0 … space-900</code> (M3 multiplier names; 11 adopted). Local names never reuse the existing index scheme (<code>--temp-space-4</code> is 16px, <code>space-400</code> is 32px).</li>
        <li><strong>Semantic</strong> — page, gutter, grid, section, content, stack, component gap, field group, nav, touch target.</li>
        <li><strong>Component</strong> — button, chip, input, card, dialog, menu, nav.</li>
      </ol>
      <TokenTables />
      <SpacingJson />
    </Page>
  ),
  play: async ({canvasElement}) => {
    await expect(duplicates()).toEqual([]);
    await expect(new Set(SEMANTIC.map(s => s.name)).size).toBe(SEMANTIC.length);
    for (const c of CLASSES) { for (const s of SEMANTIC) await expect(dpFor(s.name, c)).toBeGreaterThanOrEqual(0); }
    for (const t of COMPONENT) await expect(dpFor(t.primitive, 'medium')).toBeGreaterThanOrEqual(0);
    // Official layout margins flow from the verified JSON.
    for (const c of CLASSES) await expect(dpFor('spacing-page', c)).toBe(M3.layout[c].margin);
    await expect(dpFor('spacing-touch-target', 'compact')).toBe(M3.touchTarget);
    await expect(within(canvasElement).getByTestId('dup-count').textContent).toBe('0');
    await expect(JSON.parse(within(canvasElement).getByTestId('spacing-json').textContent ?? '{}').collections.length).toBe(3);
  },
};

export const AccessibilityValidation: Story = {
  render: () => (
    <Page title="Accessibility and validation">
      <ValidationTable />
      <h2>Thresholds (WCAG 2.2, from w3.org)</h2>
      <ul>
        <li>SC 1.4.10 Reflow (AA): vertical-scrolling content works at a width equivalent to 320 CSS px — 1280px at 400% zoom.</li>
        <li>SC 1.4.4 Resize Text (AA): up to 200% without loss of content or functionality.</li>
        <li>SC 2.5.8 Target Size Minimum (AA): at least 24×24 CSS px, with a spacing exception for undersized targets. SC 2.5.5 Target Size Enhanced (AAA): 44×44.</li>
        <li>SC 1.4.12 Text Spacing (AA): line height 1.5, paragraphs 2, letter 0.12, word 0.16 × font size.</li>
        <li>SC 2.4.13 Focus Appearance is AAA, not AA.</li>
      </ul>
      <h2>320px reflow preview</h2>
      <div className="fx-scroll" tabIndex={0} role="region" aria-label="320px preview"><Surface cls="compact" unit="px" width={320} testId="reflow-320"><PageContent cls="compact" /></Surface></div>
    </Page>
  ),
  play: async ({canvasElement}) => {
    const f = within(canvasElement).getByTestId('reflow-320');
    await expect(f.getBoundingClientRect().width).toBe(320);
    await expect(noOverflow(f)).toBe(true);
    for (const el of f.querySelectorAll('button, input, a')) await expect(Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(24);
  },
};
