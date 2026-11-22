import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, waitFor, within} from 'storybook/test';
import {AssetGallery, Banner, DesktopMobile, DoDont, FamilyGuidelines, FamilyOverview, LightDark, Page, ProductionExport, SizeProportion, UsageExamples, systemJson} from './illustrations/Illustrations';
import {
  AUDIT, DO_DONT, EDITORIAL, EXPORTS, FAMILIES, FRAMES, GUIDELINE_KEYS, ILL_SIZES, MAX_CONTENT, PAD, displayWidth, filesOf, sizeAt, totalAudited, unreferenced,
} from './illustrations/illustrations-model';

/*
 * Foundations / Illustrations — a SEPARATE section from functional icons. Four families (3D Spot, Editorial, Characters & Sprites, World & Environment).
 * Existing art is audited (sizes, counts, references measured by illustrations/generate-illustration-audit.mjs) and shown read-only by URL.
 * Proposed specimens are plain shapes, always labelled. No artwork is invented, replaced or migrated. The committed
 * `Foundations / Illustrations / 3D Spot Illustrations` stories (moved here from Icons & Illustrations by owner decision) provide the 3D size scale and components this section reuses.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Foundations/Illustrations/Families', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

const wrap = (title: string, body: React.ReactNode) => <Page title={title}><Banner />{body}</Page>;
const loaded = async (root: HTMLElement) => {
  const imgs = [...root.querySelectorAll('img')];
  imgs.forEach(i => { i.loading = 'eager'; });
  await waitFor(() => { for (const i of imgs) if (!(i.complete && i.naturalWidth > 0)) throw new Error(`not loaded: ${i.getAttribute('src')}`); }, {timeout: 15000});
  return imgs;
};

export const Overview: Story = {
  name: 'Family Overview',
  render: () => wrap('Foundations / Illustrations · Family overview', <FamilyOverview />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('family-grid').children.length).toBe(4);
    await expect(FAMILIES.map(f => f.id)).toEqual(['spot3d', 'editorial', 'characters', 'world']);
    // The audit covers every indexed file exactly once and nothing is invented.
    await expect(filesOf('characters').length + filesOf('world').length).toBe(totalAudited());
    await expect(totalAudited()).toBe(191);
    await expect(c.getByTestId('audit-line')).toHaveTextContent('0 3D illustrations');
    await expect(c.getByText(/Still open/)).toBeVisible();
    await expect(c.getByTestId('decided')).toHaveTextContent('AI-generated 3D artwork');
    await expect(c.getByTestId('decided')).toHaveTextContent('1:1, 4:3, 3:2 and 16:9');
    await expect(c.getByTestId('family-spot3d')).toHaveTextContent('None produced');
    await loaded(c.getByTestId('family-grid'));
  },
};

export const Guidelines: Story = {
  name: 'Family Guidelines',
  render: () => wrap('Guidelines for each family', <FamilyGuidelines />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Completeness: every family answers all eleven guideline topics, and every cell declares where its statement comes from.
    await expect(GUIDELINE_KEYS.length).toBe(11);
    for (const f of FAMILIES) for (const k of GUIDELINE_KEYS) {
      const cells = f.guidelines[k];
      await expect(cells.length).toBeGreaterThan(0);
      for (const cell of cells) { await expect(['measured', 'owner', 'local', 'open']).toContain(cell.b); await expect(cell.t.length).toBeGreaterThan(10); }
      await expect(c.getByTestId(`g-${f.id}-${k}`)).toBeVisible();
    }
    // 3D sizes come from the committed scale, not a copy.
    await expect(ILL_SIZES.map(s => s.px)).toEqual([32, 48, 64, 96, 128]);
    await expect(c.getByTestId('g-spot3d-sizes')).toHaveTextContent('Default M 64');
    // Honest about gaps: world mobile behavior and sprite scaling are not specified.
    await expect(c.getByTestId('g-world-responsive')).toHaveTextContent('focal point');
    await expect(c.getByTestId('g-spot3d-files')).toHaveTextContent('AI-generated');
    await expect(c.getByTestId('g-characters-responsive')).toHaveTextContent('Not specified');
    // The measured sprite grid and the rendering difference are surfaced.
    await expect(c.getByTestId('g-characters-animation')).toHaveTextContent(`${AUDIT.sheet.atlas.columns}×${AUDIT.sheet.atlas.rows}`);
    await expect(c.getByTestId('g-characters-files')).toHaveTextContent('pixelated');
    await expect(c.getByTestId('g-characters-files')).toHaveTextContent('standardized within each pixel-art family');
    await expect(c.getByTestId('g-editorial-purpose')).toHaveTextContent('placeholder artwork');
  },
};

export const SizeAndProportion: Story = {
  name: 'Size & Proportion',
  render: () => wrap('Size and proportion guidelines', <SizeProportion />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Owner decision: exactly 1:1, 4:3, 3:2 and 16:9; editorial art is not forced into a square.
    await expect(EDITORIAL.ratios.map(r => `${r.w}:${r.h}`)).toEqual(['1:1', '4:3', '3:2', '16:9']);
    await expect(EDITORIAL.ratios.some(r => r.w !== r.h)).toBe(true);
    await expect(c.getByTestId('ratio-row').children.length).toBe(4);
    await expect(c.getByTestId('ratio-square')).toBeVisible();
    // The ratio math: height follows width and ratio; mobile crop is applied only where declared.
    const wide = EDITORIAL.ratios.find(r => r.key === 'wide')!;
    await expect(sizeAt(wide, 'desktop')).toEqual({w: Math.min(1280 - 2 * PAD, MAX_CONTENT), h: Math.round((Math.min(1280 - 2 * PAD, MAX_CONTENT) * 9) / 16), ratio: [16, 9]});
    await expect(sizeAt(wide, 'mobile').ratio).toEqual([4, 3]);
    await expect(sizeAt(wide, 'mobile').w).toBe(360 - 2 * PAD);
    // The ratio boxes really render at their ratio.
    const box = within(c.getByTestId('ratio-wide')).getByText(/16:9/).closest('.pqn-ratio')!;
    const r = box.getBoundingClientRect();
    await expect(Math.abs(r.width / r.height - 16 / 9)).toBeLessThan(0.03);
    await expect(c.getByTestId('size-characters')).toHaveTextContent('144×176');
    await expect(c.getByTestId('size-world')).toHaveTextContent('1440×980');
    await loaded(c.getByTestId('size-world'));
  },
};

export const DesktopVsMobile: Story = {
  name: 'Desktop vs Mobile',
  render: () => wrap('Desktop vs mobile previews', <DesktopMobile />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const f of FRAMES) await expect(c.getByTestId(`dm-ed-${f.key}`).getBoundingClientRect().width).toBeGreaterThan(0);
    // Frames are drawn at their real widths (they scroll inside their own region instead of overflowing the page).
    await expect(Math.round(c.getByTestId('dm-ed-mobile').getBoundingClientRect().width)).toBe(360);
    await expect(Math.round(c.getByTestId('dm-ed-desktop').getBoundingClientRect().width)).toBe(1280);
    await expect(displayWidth(1280)).toBe(MAX_CONTENT);
    await expect(c.getByTestId('dm-characters')).toHaveTextContent('Not specified');
    await expect(c.getByTestId('dm-world')).toHaveTextContent('focal point');
    await loaded(c.getByTestId('dm-world'));
  },
};

export const LightAndDark: Story = {
  name: 'Light & Dark',
  render: () => wrap('Light and dark mode previews', <LightDark />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('mode-light')).toHaveTextContent('Carbon White');
    await expect(c.getByTestId('mode-dark')).toHaveTextContent('Gray 100');
    await expect(c.getByTestId('ld-light')).toBeVisible();
    await expect(c.getByTestId('ld-dark')).toBeVisible();
    // The two themes really differ: the layer behind the art has a different background color.
    const bg = (id: string) => getComputedStyle(c.getByTestId(id).closest('.pqc-layer')!).backgroundColor;
    await expect(bg('ld-light')).not.toBe(bg('ld-dark'));
    // Existing sprites and scenes show on both themes.
    await loaded(c.getByTestId('ld-dark'));
    await loaded(c.getByTestId('ld-light'));
  },
};

export const Gallery: Story = {
  name: 'Asset Gallery',
  render: () => wrap('Existing theme and artwork gallery', <AssetGallery />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('gal-3d')).toHaveTextContent('None produced');
    await expect(c.getByTestId('gal-editorial').querySelectorAll('svg').length).toBe(6);
    // Existing files are measured and actually load (naturalWidth > 0).
    const imgs = await loaded(c.getByTestId('gal-world'));
    await expect(imgs.length).toBe(6);
    for (const i of imgs) { await expect(i.naturalWidth).toBe(1440); await expect(i.naturalHeight).toBe(980); }
    const chars = await loaded(c.getByTestId('gal-characters'));
    await expect(chars.length).toBeGreaterThanOrEqual(3);
    // Unreferenced files are labelled as such, not as "unused".
    await expect(c.getByTestId('gal-unreferenced')).toHaveTextContent('no reference found');
    await expect(c.getByTestId('gal-unreferenced').querySelectorAll('li').length).toBe(unreferenced().length);
    // Nothing is presented as proposed artwork here: no proposed specimen in the gallery.
    await expect(canvasElement.querySelectorAll('.pqn-ratio').length).toBe(0);
  },
};

export const Usage: Story = {
  name: 'Usage Examples',
  render: () => wrap('Usage examples', <UsageExamples />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('use-3d')).toHaveTextContent('Proposed specimen');
    await expect(Math.round(c.getByTestId('use-3d').querySelector('.pqn-canvas')!.getBoundingClientRect().width)).toBe(64);
    for (const id of ['use-editorial', 'use-characters', 'use-world']) await expect(c.getByTestId(id)).toHaveTextContent('Existing artwork');
    const sprite = c.getByTestId('use-characters').querySelector('.pqn-sprite')!.getBoundingClientRect();
    await expect([Math.round(sprite.width), Math.round(sprite.height)]).toEqual([90, 110]);
    await loaded(c.getByTestId('use-world'));
  },
};

export const DosAndDonts: Story = {
  name: "Do & Don't",
  render: () => wrap("Do and don't examples", <DoDont />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const f of FAMILIES) {
      await expect(DO_DONT.filter(d => d.family === f.id && d.verdict === 'do').length).toBe(1);
      await expect(DO_DONT.filter(d => d.family === f.id && d.verdict === 'dont').length).toBe(1);
      await expect(c.getByTestId(`dd-${f.id}-do`)).toHaveTextContent('Do');
      await expect(c.getByTestId(`dd-${f.id}-dont`)).toHaveTextContent("Don't");
    }
    // Specimens are plain shapes: no image is rendered here.
    await expect(canvasElement.querySelectorAll('img').length).toBe(0);
    await expect(c.getByText(/not artwork/)).toBeVisible();
  },
};

export const ProductionAndExport: Story = {
  name: 'Production & Export',
  render: () => wrap('Asset production and export guidelines', <ProductionExport />),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const e of EXPORTS) await expect(c.getByTestId(`export-${e.family}`)).toBeVisible();
    await expect(EXPORTS.length).toBe(4);
    await expect(c.getByTestId('export-spot3d')).toHaveTextContent('pq-ill-{subject}');
    await expect(c.getByTestId('export-world')).toHaveTextContent('kept');
    await expect(c.getByTestId('export-rules')).toHaveTextContent('2× or higher');
    // The copyable JSON is exactly the model.
    const shown = JSON.parse(c.getByTestId('snippet-text').textContent!);
    await expect(shown).toEqual(JSON.parse(JSON.stringify(systemJson())));
    await expect(shown.spot3dSizes.map((s: {px: number}) => s.px)).toEqual([32, 48, 64, 96, 128]);
    await expect(shown.families.length).toBe(4);
  },
};
