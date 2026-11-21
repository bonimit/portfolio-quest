import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, within} from 'storybook/test';
import type {ReactNode} from 'react';
import {
  Accessibility, Badge, BrandSupport, CarbonReference, ComponentSwitcher, ComponentTokenTable, ExceptionCompare,
  LayerBindingTable, LayerDemo, PaperVsWhite, Palettes, SemanticTable, StatesGrid, V2Banner,
} from './carbon/CarbonColors';
import {
  MODES, PRIMARY_OPTIONS, PROVENANCE, SEMANTIC, carbonKeysMatch, carbonColor, layerAliases, modeVars, palette, paletteWhite, semanticValue,
  toHex, parseColor, type Mode, type PrimaryOption,
} from './carbon/carbon-model';
import {ThemePreview, useAudit} from './ColorFoundations';

/*
 * Colors v2 · Carbon proposal. A NEW, separately named version: the existing "Foundations/Colors" stories are untouched.
 * Proposal only. Carbon data: carbon/carbon-tokens.json (generated). Brand colors: read live from production CSS.
 */
type Args = {mode: Mode | 'both'; opt: PrimaryOption};

const Page = ({title, children}: {title: string; children: ReactNode}) => (
  <main className="fx"><h1>{title}</h1><V2Banner />{children}</main>
);

// Specimens intentionally show low-contrast pairings and Carbon/brand colors on varied surfaces; axe's color-contrast rule is
// disabled on these stories only, and every ratio is measured and reported in the Accessibility story instead.
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;

const meta = {
  title: 'Foundations/Colors v2 (Carbon proposal)',
  parameters: {layout: 'fullscreen', a11y: specimenA11y},
  argTypes: {mode: {control: 'inline-radio', options: ['light', 'dark', 'both']}, opt: {control: 'inline-radio', options: ['A', 'B']}},
  args: {mode: 'both', opt: 'A'},
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

const norm = (css: string) => { const c = parseColor(css.trim()); return c ? toHex(c) : css; };

export const StartHere: Story = {
  render: () => (
    <Page title="Colors v2 · Carbon proposal — start here">
      <h2>Direction chosen by the owner</h2>
      <p><strong>Colors v2 is the chosen direction. Primary action: {PRIMARY_OPTIONS.A.name}.</strong> The other open decisions below use the suggested defaults and are not yet confirmed. Colors v1 stays as the current-state reference. No production CSS has changed and no migration has started.</p>
      <h2>What this proposes</h2>
      <ul>
        <li><Badge kind="proposed" />Neutrals, layering, semantic tokens and support colors from IBM Carbon: <strong>Light = White theme</strong>, <strong>Dark = Gray 100</strong>.</li>
        <li><Badge kind="current" />Brand primary, accent, pastels and every Island / Arcade / Neon palette are preserved and read live from production CSS.</li>
        <li>Semantic token names are identical in both modes; only values change ({SEMANTIC.length} proposed tokens, {SEMANTIC.filter(d => d.origin === 'carbon').length} from Carbon, {SEMANTIC.filter(d => d.origin === 'portfolio').length} Portfolio, {SEMANTIC.filter(d => d.origin === 'derived').length} derived and flagged new).</li>
        <li>Material 3 remains the component direction. These are color specimens in pill / 8px shapes, not Carbon components.</li>
      </ul>
      <h2>Reading guide</h2>
      <p>Every panel carries a text badge: <Badge kind="current" /> exists in source today, <Badge kind="proposed" /> proposed Carbon-based design, <Badge kind="new" /> a color that does not exist in source and needs approval.</p>
      <h2>Open decisions &amp; exceptions (none are decided)</h2>
      <ol>
        <li><strong>Primary action:</strong> {PRIMARY_OPTIONS.A.name} vs {PRIMARY_OPTIONS.B.name}. Compare in Components and Brand &amp; supporting.</li>
        <li><strong>Page background:</strong> keep warm paper or adopt Carbon White (Paper vs White).</li>
        <li><strong>Hover / pressed on brand fills:</strong> Carbon has no such token. Material-3 state layers (8% / 10%) are proposed and are <em>new colors</em>.</li>
        <li><strong>Orange as text on light surfaces</strong> does not meet 4.5:1 on White; an existing darker orange literal exists in entrance.css but is not a token (Accessibility).</li>
        <li><strong>Focus ring:</strong> existing ink (light) / paper (dark, mirroring the footer) instead of Carbon blue.</li>
        <li><strong>Card exception:</strong> keep hard offset shadows on cards/panels; shadow color follows text-primary (Exceptions).</li>
        <li><strong>Disabled fill</strong> mapping is a proposal and not a documented Carbon value.</li>
        <li><strong>Neon / Arcade / Island</strong> are independent of the global mode and untouched.</li>
      </ol>
      <h2>Provenance</h2>
      <p>Generated {PROVENANCE.generatedOn} from <code>@carbon/themes {PROVENANCE.packages['@carbon/themes']}</code> and <code>@carbon/colors {PROVENANCE.packages['@carbon/colors']}</code>; the Layer depth rules come from <code>@carbon/styles {PROVENANCE.packages['@carbon/styles (layer sets)']}</code> (<code>scss/layer/_layer-sets.scss</code>). Reference: <a href="https://www.carbondesignsystem.com/elements/color/overview/">carbondesignsystem.com color overview</a>. The generator asserts the White and Gray 100 layer tables from the brief by palette name and fails on any missing token.</p>
    </Page>
  ),
  play: async ({canvasElement}) => {
    await expect(carbonKeysMatch()).toBe(true);
    // Semantic names are unique and therefore identical across modes by construction.
    await expect(new Set(SEMANTIC.map(d => d.name)).size).toBe(SEMANTIC.length);
    // The brief's layer tables, asserted by Carbon palette name (no literals).
    await expect(toHex(carbonColor('light', 'background'))).toBe(toHex(parseColor(paletteWhite())!));
    for (const [key, step] of [['layer01', 10], ['layer03', 10]] as const) await expect(toHex(carbonColor('light', key))).toBe(toHex(parseColor(palette('gray', step))!));
    await expect(toHex(carbonColor('light', 'layer02'))).toBe(toHex(parseColor(paletteWhite())!));
    for (const [key, step] of [['background', 100], ['layer01', 90], ['layer02', 80], ['layer03', 70]] as const) await expect(toHex(carbonColor('dark', key))).toBe(toHex(parseColor(palette('gray', step))!));
    await expect(within(canvasElement).getByText(/Open decisions/)).toBeVisible();
  },
};

export const Primitives: Story = {render: () => <Page title="Primitive palettes"><Palettes /></Page>};

export const SemanticTokens: Story = {
  render: args => (
    <Page title="Semantic tokens — light and dark side by side">
      <p className="fx-muted">Same names in both modes; only values change. Primary option shown: {PRIMARY_OPTIONS[args.opt].name} (use the control to switch).</p>
      <SemanticTable opt={args.opt} />
      <h2>Carbon reference</h2>
      <CarbonReference />
    </Page>
  ),
};

export const Layers: Story = {
  render: () => (
    <Page title="Layers 00–03">
      <p>Light (White) alternates white / gray 10, so layer-02 equals the background and separation relies on border-subtle. Dark (Gray 100) steps lighter with depth. Fields and borders use the numbered token for their own depth.</p>
      <LayerDemo />
      <h2>Alias bindings by depth</h2>
      <LayerBindingTable />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const m of MODES) {
      const frame = c.getByTestId(`mode-${m}`);
      await expect(norm(getComputedStyle(frame).backgroundColor)).toBe(toHex(carbonColor(m, 'background')));
      for (const d of [1, 2, 3]) {
        const layer = c.getByTestId(`layer-${m}-${d}`);
        const cs = getComputedStyle(layer);
        const expected = layerAliases(m, d);
        await expect(norm(cs.backgroundColor).toLowerCase()).toBe(expected.layer.toLowerCase());
        await expect(norm(cs.borderTopColor).toLowerCase()).toBe(expected['border-subtle'].toLowerCase());
        const input = within(layer).getAllByTestId('pqc-input')[0];
        await expect(norm(getComputedStyle(input).backgroundColor).toLowerCase()).toBe(expected.field.toLowerCase());
        await expect(norm(getComputedStyle(input).borderTopColor).toLowerCase()).toBe(expected['border-strong'].toLowerCase());
      }
    }
  },
};

export const BrandAndSupporting: Story = {render: () => <Page title="Primary, accent and supporting colors"><BrandSupport /></Page>};

export const Components: Story = {
  render: args => (
    <Page title="Button, Chip, Input, Card, Dialog and Navigation — both modes">
      <ComponentSwitcher mode={args.mode} opt={args.opt} />
      <h2>Component tokens</h2>
      <ComponentTokenTable opt={args.opt} />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Option switching changes the resolved primary fill in each mode; checked against the model, not literals.
    for (const o of ['A', 'B'] as const) {
      await userEvent.click(c.getByLabelText(PRIMARY_OPTIONS[o].name));
      for (const m of MODES) {
        const frame = c.getByTestId(`mode-${m}`);
        const btn = within(frame).getAllByRole('button', {name: 'Primary'})[0];
        await expect(norm(getComputedStyle(btn).backgroundColor)).toBe(toHex(semanticValue(m, o, 'interactive-primary')));
      }
    }
    await userEvent.click(c.getByLabelText('Dark (Gray 100)'));
    await expect(c.queryByTestId('mode-light')).toBeNull();
    await expect(c.getByTestId('mode-dark')).toBeVisible();
  },
};

export const States: Story = {
  render: args => <Page title="Hover, pressed, selected, disabled and focus"><StatesGrid opt={args.opt} /></Page>,
};

export const PaperVersusWhite: Story = {
  render: () => <Page title="Existing warm paper vs Carbon White"><PaperVsWhite /></Page>,
};

export const AccessibilityMatrix: Story = {
  render: () => <Page title="Color contrast and accessibility"><Accessibility /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getAllByText('Exempt (disabled)').length).toBeGreaterThan(0);
    await expect(canvasElement.textContent).not.toMatch(/NaN|Infinity/);
  },
};

export const Exceptions: Story = {
  render: () => <Page title="Preserved card and panel designs vs Carbon layering"><ExceptionCompare /></Page>,
};

export const IndependentThemes: Story = {
  render: () => {
    const Inner = () => {
      const audit = useAudit();
      return (
        <Page title="Island, Arcade and Neon — independent of light/dark">
          <p><Badge kind="current" />Creative game themes are preserved and are <strong>not</strong> driven by the global light/dark foundation. They use the real production Adventure CSS below; switching the global mode elsewhere does not change them.</p>
          <ThemePreview theme="arcade" view="grid" audit={audit} />
          <p className="fx-muted">Global proposal variables are scoped to wrappers with the prefix <code>--pqc-</code> and are not defined on this preview. Computed global tokens: {modeVars('light', 'A')['--pqc-background'] ? 'present only inside ModeFrame wrappers' : ''}.</p>
        </Page>
      );
    };
    return <Inner />;
  },
};
