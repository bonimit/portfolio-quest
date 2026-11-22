import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';
import {AssetGallery, AssetSpec, CanvasGrid, ColorMaterial, IllBanner, IllExceptions, PerspectiveLighting, ProductionBrief, ResponsiveComparison, SizeScaleIll, UsageExamples} from './icons/Illustrations';
import {Page, Tag} from './icons/Icons';
import {BRIEFS, CANVAS, DEFAULT_ILL, DENSITIES, HUES, ILL_SIZES, MASTER_PX, PLANNED, RASTER_MIN_DENSITY, RESPONSIVE, SHADOW, cubeFaces, deliveredPx, illPx, sizeFor, specJson} from './icons/illustration-model';

/*
 * Foundations / Illustrations / 3D Spot Illustrations — a DESIGN SYSTEM AND ASSET SPECIFICATION. No finished illustration exists:
 * diagrams use neutral primitives drawn from the shared constants, and slots are empty placeholders. The five sizes and the 64px default
 * are owner-specified; every other number is a local proposal. The style is a proposal, not an approved replacement for any existing art.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Foundations/Illustrations/3D Spot Illustrations', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

const W = (el: Element) => el.getBoundingClientRect().width;
const H = (el: Element) => el.getBoundingClientRect().height;
const lum = (css: string) => { const n = (css.match(/[\d.]+/g) ?? []).map(Number); const [r, g, b] = css.startsWith('color(') ? n.slice(0, 3).map(v => v * 255) : n.slice(0, 3); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

export const Overview: Story = {
  render: () => (
    <Page title="Foundations / Illustrations · 3D Spot Illustrations" testId="ill-page">
      <IllBanner />
      <h2>Direction</h2>
      <ul>
        <li><Tag kind="local" /> A separate category of custom 3D-style illustrated icons for portfolio destinations, experience categories, featured sections and special interactive elements. It is for expressive content, never for functional UI icons (use Material Symbols Rounded for those).</li>
        <li>Soft, dimensional, rounded forms; subtle lighting and contact shadows; playful but refined; one camera, scale and light across the set; existing brand colors.</li>
        <li><Tag kind="preserved" /> Existing pixel art, avatars, game assets and scene illustrations stay exactly as they are.</li>
      </ul>
      <h2>Sections</h2>
      <ol><li>Size Scale</li><li>Canvas Grid &amp; Safe Area</li><li>Perspective &amp; Lighting</li><li>Color &amp; Material</li><li>Responsive Size Comparison</li><li>Asset Gallery (planned, none produced)</li><li>Usage Examples</li><li>Asset Specification</li><li>Custom Illustration Exceptions</li></ol>
      <h2>Open decisions</h2>
      <ol>
        <li><strong>How the real assets get produced (decided).</strong> The owner selected AI-generated artwork, human-curated, as the future approach, behind the gates on the Production Brief page. Nothing is generated yet, and a vector approximation is not rendered 3D.</li>
        <li>The camera (yaw {30}°, pitch {25}°), light direction and contact-shadow values.</li>
        <li>The responsive mapping per context (Responsive Size Comparison).</li>
        <li>Whether the contact shadow is baked into the asset (proposed) or rendered separately.</li>
        <li>The planned subjects and their hues.</li>
        <li>Delivery formats and size budgets.</li>
      </ol>
    </Page>
  ),
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByText('Open decisions')).toBeVisible();
    await expect(ILL_SIZES.map(s => s.px)).toEqual([32, 48, 64, 96, 128]);
    await expect(illPx(DEFAULT_ILL)).toBe(64);
    await expect(CANVAS.safeArea).toBe(0.8);
  },
};

export const SizeScale: Story = {
  render: () => <Page title="3D illustration size scale" testId="ill-page"><IllBanner /><SizeScaleIll /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const s of ILL_SIZES) {
      const slot = c.getByTestId(`ill-size-${s.key}`).querySelector('.pqi-slot')!;
      await expect(W(slot)).toBe(s.px); await expect(H(slot)).toBe(s.px);
      // Raster delivery is at least 2x the display size.
      await expect(deliveredPx(s.key, 2)).toBeGreaterThanOrEqual(s.px * RASTER_MIN_DENSITY);
    }
    await expect(c.getByTestId('ill-size-m')).toHaveTextContent('default');
  },
};

export const CanvasGridSafeArea: Story = {
  name: 'Canvas Grid & Safe Area',
  render: () => <Page title="Canvas grid and safe area" testId="ill-page"><IllBanner /><CanvasGrid /></Page>,
  play: async ({canvasElement}) => {
    const rect = within(canvasElement).getByTestId('safe-rect');
    await expect(Number(rect.getAttribute('x'))).toBeCloseTo(10); await expect(Number(rect.getAttribute('width'))).toBeCloseTo(80);
    await expect(Number(rect.getAttribute('y'))).toBeCloseTo(10); await expect(Number(rect.getAttribute('height'))).toBeCloseTo(80);
  },
};

export const PerspectiveLightingStory: Story = {
  name: 'Perspective & Lighting',
  render: () => <Page title="Perspective and lighting guidelines" testId="ill-page"><IllBanner /><PerspectiveLighting /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    const shades = Object.fromEntries(cubeFaces().filter(f => f.visible).map(f => [f.id, f.shade]));
    await expect(Object.keys(shades).sort()).toEqual(['front', 'left', 'top']);
    await expect(shades.top).toBeGreaterThan(shades.left);
    await expect(shades.left).toBeGreaterThan(shades.front); // upper-left key light: the left face is lit, the right-facing front is not
    await expect(c.getByTestId('shade-top')).toBeVisible();
    // One shared contact shadow: same ground line and same shape ratio on every object.
    for (const e of canvasElement.querySelectorAll('[data-testid="contact-shadow"]')) {
      await expect(Number(e.getAttribute('cy'))).toBeCloseTo(CANVAS.groundLine * 100);
      await expect(Number(e.getAttribute('ry')) / Number(e.getAttribute('rx'))).toBeCloseTo(SHADOW.heightRatio);
    }
    await expect(c.getByTestId('shadow-dark')).toBeVisible();
  },
};

export const ColorMaterialStory: Story = {
  name: 'Color & Material',
  render: () => <Page title="Color and material guidelines" testId="ill-page"><IllBanner /><ColorMaterial /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Every ramp is derived from the live brand color: highlight is lighter than base, shade is darker.
    for (const h of HUES) {
      const sw = [...c.getByTestId(`ramp-${h}`).querySelectorAll('.pqi-rampsw > div')].map(d => lum(getComputedStyle(d).backgroundColor));
      await expect(sw[0]).toBeGreaterThan(sw[1]); await expect(sw[1]).toBeGreaterThan(sw[2]);
    }
    await expect(c.getByTestId('ramp-table')).toHaveTextContent('white 38%');
  },
};

export const ResponsiveSizes: Story = {
  name: 'Responsive Size Comparison',
  render: () => <Page title="Responsive size comparison" testId="ill-page"><IllBanner /><ResponsiveComparison /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const f of [['mobile', 'mobile'], ['tablet', 'desktop'], ['desktop', 'desktop']] as const) {
      const frame = c.getByTestId(`frame-${f[0]}`);
      for (const r of RESPONSIVE) {
        const slot = frame.querySelector(`[data-testid="ctx-${r.context}"] .pqi-slot`)!;
        await expect(W(slot)).toBe(illPx(sizeFor(r, f[0] as 'mobile' | 'tablet' | 'desktop')));
      }
      await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
    }
    // One master across breakpoints: the mobile and desktop sizes always come from the same five tokens.
    for (const r of RESPONSIVE) { await expect(ILL_SIZES.some(s => s.key === r.mobile)).toBe(true); await expect(ILL_SIZES.some(s => s.key === r.desktop)).toBe(true); }
  },
};

export const AssetGalleryStory: Story = {
  name: 'Asset Gallery',
  render: () => <Page title="Asset gallery (planned slots)" testId="ill-page"><IllBanner /><AssetGallery /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('gallery-note')).toHaveTextContent(/None produced/);
    await expect(c.getByTestId('planned-grid').children.length).toBe(PLANNED.length);
    // Honest placeholders: no image or finished artwork is rendered here.
    await expect(c.getByTestId('planned-grid').querySelectorAll('img').length).toBe(0);
    for (const p of PLANNED) await expect(c.getByTestId(`planned-${p.subject}`)).toHaveTextContent('not produced');
  },
};

export const Usage: Story = {
  name: 'Usage Examples',
  render: () => <Page title="Usage examples (placeholders)" testId="ill-page"><IllBanner /><UsageExamples /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(W(c.getByTestId('use-category').querySelector('.pqi-slot')!)).toBe(64);
    await expect(W(c.getByTestId('use-nav').querySelector('.pqi-slot')!)).toBe(32);
    await expect(W(c.getByTestId('use-featured').querySelector('.pqi-slot')!)).toBe(128);
  },
};

export const AssetSpecification: Story = {
  render: () => <Page title="Asset specification: naming, formats and resolution" testId="ill-page"><IllBanner /><AssetSpec /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('naming-table')).toHaveTextContent('pq-ill-{subject}');
    await expect(c.getByTestId('density-note')).toHaveTextContent(`${deliveredPx('xl', 2)}px`);
    // The copyable JSON is exactly the model's specification (clipboard itself is not asserted).
    const shown = JSON.parse(within(c.getByTestId('snippet-text').closest('div')!.parentElement!).getByTestId('snippet-text').textContent!);
    await expect(shown).toEqual(JSON.parse(JSON.stringify(specJson())));
    await expect(Math.min(...DENSITIES)).toBeGreaterThanOrEqual(RASTER_MIN_DENSITY);
    await expect(MASTER_PX).toBeGreaterThanOrEqual(illPx('xl') * 4);
  },
};

export const IllustrationExceptions: Story = {
  name: 'Custom Illustration Exceptions',
  render: () => <Page title="Custom illustration exceptions" testId="ill-page"><IllBanner /><IllExceptions /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('ill-exceptions')).toHaveTextContent(/Preserved/);
    await expect(c.getByTestId('ill-dir-guide')).toBeVisible();
    await expect(c.getByTestId('ill-exceptions')).toHaveTextContent('destination-art.tsx');
  },
};

export const ProductionBriefStory: Story = {
  name: 'Production Brief',
  render: () => <Page title="Production brief (no artwork produced)" testId="ill-page"><IllBanner /><ProductionBrief /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('brief-note')).toHaveTextContent(/nothing was sent/);
    await expect(c.getByTestId('route-decided')).toHaveTextContent(/Nothing has been generated/);
    await expect(c.getByTestId('ai-gates').children.length).toBeGreaterThanOrEqual(6);
    await expect(c.getByTestId('brief-grid').children.length).toBe(PLANNED.length);
    await expect(c.getByTestId('brief-grid').querySelectorAll('img').length).toBe(0);
    for (const b of BRIEFS) {
      await expect(b.text).toContain(`${CANVAS.safeArea * 100}%`);
      await expect(b.text).toContain(`${MASTER_PX}x${MASTER_PX}`);
      await expect(b.text).toMatch(/Do not include: text, logos/);
    }
    await expect(c.getByTestId('acceptance').children.length).toBeGreaterThanOrEqual(5);
  },
};
