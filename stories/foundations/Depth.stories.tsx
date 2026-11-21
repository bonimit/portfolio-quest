import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, within} from 'storybook/test';
import type {ReactNode} from 'react';
import {
  Architecture, ContextBoth, ContextFrames, DepthBanner, ExistingFloating, ExpressiveLive, ExpressiveSpecimens, FloatSwitcher, FloatingSpecimens,
  LayerBindingTable, NestedLayers, NestingNotElevation, RoleTable, SeparationTable, ShadowTokenTable, StackingTable, SurfaceTokenTable, useFloat,
} from './depth/Depth';
import {Badge} from './carbon/CarbonColors';
import {DEPTH, FLOATING_OPTIONS, MODES, SHADOW_ROLES, Z_ROWS, layerAliases, shadowSet, type FloatingOption} from './depth/depth-model';
import {carbonColor, toHex} from './carbon/carbon-model';
import {parseColor} from './color-math';
import {useAudit} from './ColorFoundations';

/*
 * Foundations / Surfaces & Depth — proposal. Carbon layering = primary depth system; selective floating shadows;
 * expressive effects preserved. Reuses the Colors v2 model (carbon/*). Proposal only; nothing is implemented.
 */
type Args = {float: FloatingOption};
const Page = ({title, children}: {title: string; children: ReactNode}) => <main className="fx"><h1>{title}</h1><DepthBanner />{children}</main>;

// Specimens intentionally show real production CSS and neon/low-contrast surfaces; axe's color-contrast rule is off here only,
// and surface/border/focus contrast is measured in the Light vs Dark story instead.
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;

const meta = {
  title: 'Foundations/Surfaces & Depth',
  parameters: {layout: 'fullscreen', a11y: specimenA11y},
  argTypes: {float: {control: 'inline-radio', options: ['carbon', 'border-first']}},
  args: {float: 'carbon'},
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

const norm = (css: string) => { const c = parseColor(css.trim()); return c ? toHex(c).toLowerCase() : css; };
const shadowAlpha = (css: string) => Number(/rgba?\([^)]*?,\s*([\d.]+)\)/.exec(css)?.[1] ?? '1');

export const Overview: Story = {
  render: () => (
    <Page title="Surfaces & Depth — overview">
      <h2>Three approaches to depth</h2>
      <ol>
        <li><Badge kind="proposed" /><strong>Surface layering (primary).</strong> Carbon White in light, Gray 100 in dark; semantic layer tokens make one component adapt to both modes.</li>
        <li><Badge kind="proposed" /><strong>Selective shadows.</strong> <code>shadow-floating</code> for dropdowns and popovers, <code>shadow-modal</code> for dialogs, <code>shadow-none</code> everywhere else.</li>
        <li><Badge kind="current" /><strong>Expressive effects.</strong> Sticker shadows, editorial cards, Island/Arcade/Neon and game effects stay exactly as authored.</li>
      </ol>
      <p>Layer numbers mean <strong>surface nesting</strong>, not z-index or elevation. They are not coupled to Material 3 elevation levels, and none of the six Material elevation levels is introduced.</p>
      <h2>Open decisions (none are decided)</h2>
      <ol>
        <li><strong>Dark floating treatment:</strong> {FLOATING_OPTIONS.carbon.name} vs {FLOATING_OPTIONS['border-first'].name} (Floating Elements).</li>
        <li><strong>shadow-modal:</strong> Carbon has no modal shadow. Light reuses the existing soft layer of <code>.guide-dialog</code>; dark relies on scrim + border. Needs approval.</li>
        <li><strong>Stacking names</strong> (<code>z-base … z-modal</code>) are proposed from existing values; the existing dropdown (40) and compact menu (30) differ for the same role.</li>
        <li><strong>Where floating shadows are optional</strong> versus required.</li>
      </ol>
      <h2>Sections</h2>
      <p>Surface Layers · Surface Tokens · Floating Elements · Light vs Dark · Components in Context · Expressive Exceptions · Usage Guidelines · Stacking &amp; Architecture.</p>
    </Page>
  ),
};

export const SurfaceLayers: Story = {
  render: () => (
    <Page title="Surface layers">
      <p>Light (White) alternates white / gray 10, so layer-02 equals the page; separation there relies on border-subtle. Dark (Gray 100) steps lighter with each nested level.</p>
      <div className="pqc-pair">{MODES.map(m => <NestedLayers key={m} mode={m} />)}</div>
      <h2>Nesting is not elevation</h2>
      <div className="pqc-pair">{MODES.map(m => <NestingNotElevation key={m} mode={m} />)}</div>
      <h2>Alias bindings by nesting depth</h2>
      <LayerBindingTable />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const m of MODES) {
      const frame = c.getAllByTestId(`mode-${m}`)[0];
      await expect(norm(getComputedStyle(frame).backgroundColor)).toBe(toHex(carbonColor(m, 'background')).toLowerCase());
      for (const d of [1, 2, 3]) {
        const layer = within(frame).getByTestId(`layer-${m}-${d}`);
        const cs = getComputedStyle(layer);
        await expect(norm(cs.backgroundColor)).toBe(layerAliases(m, d).layer.toLowerCase());
        await expect(cs.boxShadow).toBe('none'); // no shadow merely because a surface is nested
      }
    }
  },
};

export const SurfaceTokens: Story = {
  render: args => (
    <Page title="Surface tokens">
      <SurfaceTokenTable />
      <h2>Optional floating shadows</h2>
      <ShadowTokenTable float={args.float} />
      <ExistingFloating />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('shadow-tokens')).toBeVisible();
    await expect(SHADOW_ROLES.map(r => r.name)).toEqual(['shadow-none', 'shadow-floating', 'shadow-modal']);
    await expect(c.getByTestId('existing-modal').textContent).toMatch(/0 1\.5rem 4rem/);
  },
};

export const FloatingElements: Story = {
  render: args => {
    const Inner = () => {
      const [float, setFloat] = useFloat(args.float);
      return (
        <Page title="Floating elements — dropdowns, popovers, modals">
          <FloatSwitcher value={float} onChange={setFloat} />
          <p className="fx-muted">{FLOATING_OPTIONS[float].summary} Light mode is identical in both options.</p>
          <div className="pqc-pair">{MODES.map(m => <FloatingSpecimens key={m} mode={m} float={float} />)}</div>
        </Page>
      );
    };
    return <Inner />;
  },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    const light = getComputedStyle(c.getByTestId('float-menu-light')).boxShadow;
    await expect(light).toContain('2px 6px');
    await expect(shadowAlpha(light)).toBe(shadowAlpha(DEPTH.shadowToken.light));
    await expect(getComputedStyle(c.getByTestId('menu-flat-light')).boxShadow).toBe('none');
    // Option X: Carbon's dark shadow token as-is.
    await expect(shadowAlpha(getComputedStyle(c.getByTestId('float-menu-dark')).boxShadow)).toBe(shadowAlpha(DEPTH.shadowToken.dark));
    // Option Y: border-first reuses the light strength and a strong border.
    await userEvent.click(c.getByLabelText(FLOATING_OPTIONS['border-first'].name));
    const dark = getComputedStyle(c.getByTestId('float-menu-dark'));
    await expect(shadowAlpha(dark.boxShadow)).toBe(shadowAlpha(DEPTH.shadowToken.light));
    await expect(norm(dark.borderTopColor)).toBe(layerAliases('dark', 1)['border-strong'].toLowerCase());
    // Dark modal carries no heavy shadow; light reuses the existing soft value.
    await expect(getComputedStyle(c.getByTestId('modal-dark')).boxShadow).toBe('none');
    await expect(getComputedStyle(c.getByTestId('modal-light')).boxShadow).not.toBe('none');
  },
};

export const LightVsDark: Story = {
  render: args => (
    <Page title="Light vs dark — side by side">
      <div className="pqc-pair">{MODES.map(m => <FloatingSpecimens key={m} mode={m} float={args.float} />)}</div>
      <h2>Separation, boundaries and focus</h2>
      <SeparationTable />
      <p className="fx-muted">Surface fill steps and subtle borders are decorative and reported for information. Control boundaries and focus rings are graded at 3:1. Shadows cannot be contrast-measured; in dark mode separation is carried by fill steps and borders.</p>
    </Page>
  ),
  play: async ({canvasElement}) => {
    const t = within(canvasElement).getByTestId('separation');
    await expect(t.textContent).not.toMatch(/NaN|Infinity/);
    await expect(within(t).getAllByText(/Pass|Fail/).length).toBeGreaterThanOrEqual(12);
  },
};

export const ComponentsInContext: Story = {
  render: args => (
    <Page title="Components in context — cards, forms, dialogs, navigation">
      <ContextBoth float={args.float} />
      <h2>Responsive layout (desktop · tablet · mobile)</h2>
      <p className="fx-muted">Container-width frames: the grid and navigation adapt, the layer hierarchy does not. Frames scroll horizontally on small screens.</p>
      <ContextFrames />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const frames = within(canvasElement).getByTestId('frames');
    const cards = frames.querySelectorAll('.pqs-grid');
    await expect(cards.length).toBe(3);
    const cols = [...cards].map(g => getComputedStyle(g).gridTemplateColumns.split(' ').length);
    await expect(cols).toEqual([1, 2, 3]); // 375 → 1, 768 → 2, 1024 → 3 columns
  },
};

export const ExpressiveExceptions: Story = {
  render: () => {
    const Inner = () => {
      const audit = useAudit();
      return (
        <Page title="Expressive depth exceptions">
          <p><Badge kind="current" />Sticker shadows, editorial cards, Island / Arcade / Neon effects and game scenes are <strong>not</strong> replaced, standardized or mapped to depth tokens.</p>
          <h2>Real components (production Adventure CSS)</h2>
          <ExpressiveLive audit={audit} />
          <h2>Existing treatments, values read live</h2>
          <ExpressiveSpecimens />
        </Page>
      );
    };
    return <Inner />;
  },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getAllByTestId(/^sticker-/).length).toBeGreaterThanOrEqual(10);
    // The real Adventure tile keeps its authored effect (not flattened by depth tokens).
    const tile = canvasElement.querySelector('.fx-adv-scope .tile.sel') as HTMLElement | null;
    await expect(tile).not.toBeNull();
    await expect(getComputedStyle(tile!).boxShadow).not.toBe('none');
  },
};

export const UsageGuidelines: Story = {
  render: () => (
    <Page title="Usage guidelines">
      <RoleTable />
      <h2>Rules of thumb</h2>
      <ul>
        <li><strong>Do</strong> nest surfaces with the next layer token; use border-subtle for separation, especially in light mode where layer-02 equals the page.</li>
        <li><strong>Do</strong> add <code>shadow-floating</code> only when an element overlaps other content; <code>shadow-modal</code> only with a scrim.</li>
        <li><strong>Don’t</strong> add a shadow because a card sits inside another layer.</li>
        <li><strong>Don’t</strong> tie layer numbers to z-index, or to Material elevation levels.</li>
        <li><strong>Don’t</strong> flatten sticker, editorial, game, Island, Arcade or Neon treatments into these tokens.</li>
        <li><strong>Focus:</strong> rings must stay visible on every layer in both modes; the ring color is a semantic token (see the contrast table in Light vs Dark).</li>
        <li><strong>Motion:</strong> floating surfaces animate only opacity and respect <code>prefers-reduced-motion</code>.</li>
      </ul>
    </Page>
  ),
};

export const StackingAndArchitecture: Story = {
  render: args => (
    <Page title="Stacking order and token architecture">
      <h2>Architecture</h2>
      <Architecture float={args.float} />
      <h2>Stacking order</h2>
      <p className="fx-muted">Separate from layers. Existing values are read live from source; names are proposals.</p>
      <StackingTable />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(Z_ROWS.filter(r => r.existing.length).length).toBeGreaterThanOrEqual(5);
    const json = JSON.parse(c.getByTestId('figma-json').textContent ?? '{}');
    const semantic = json.collections.find((x: {name: string}) => x.name === 'Semantic / Surface');
    await expect(Object.keys(semantic.variables)).toContain('surface/layer-01');
    await expect(json.collections.find((x: {name: string}) => x.name === 'Expressive exceptions').variables).toEqual({});
    await expect(shadowSet('light', 'carbon').floating).toContain(DEPTH.floating.geometry);
  },
};
