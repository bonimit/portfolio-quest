import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {
  Banner, ColorUsage, ComponentExamples, ContrastTable, DefaultVsActive, Exceptions, Gallery, Icon, LightDark, Page, SizeScale, Tag,
} from './icons/Icons';
import {CATALOG, FAMILY, ICONS, ICON_DATA, ICON_NAMES, OPSZ_MIN, PAIRS, SIZES, TOUCH_TARGET, buttonSnippet, htmlSnippet, isBundled, opszFor, reactSnippet} from './icons/icons-model';

/*
 * Foundations / Icons (Material Symbols Rounded) — proposal. Glyphs are a self-hosted subset of Google's Material Symbols
 * Rounded (icons.json + assets/*.woff2, generated and verified by generate-icons.mjs). Default is outline (FILL 0); filled (FILL 1) is for
 * active or selected states. Production icons are not changed. Nothing is implemented or migrated.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Foundations/Icons', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

const fillOf = (el: Element) => getComputedStyle(el.querySelector('.pqi-g')!).fontVariationSettings;
const opszOf = (el: Element) => /"opsz"\s+([\d.]+)/.exec(fillOf(el))?.[1];
const fillNum = (el: Element) => /"FILL"\s+([\d.]+)/.exec(fillOf(el))?.[1];
const rect = (el: Element) => el.getBoundingClientRect();
const fontReady = async () => { await document.fonts.load(`24px "${FAMILY}"`, 'home'); await expect(document.fonts.check(`24px "${FAMILY}"`, 'home')).toBe(true); };

export const Overview: Story = {
  render: () => (
    <Page title="Foundations / Icons · Material Symbols Rounded">
      <Banner />
      <h2>Direction</h2>
      <ul>
        <li><Tag kind="official" /> Functional icons: <strong>Material Symbols Rounded</strong>. Default: <strong>outline</strong> (FILL 0). Active or selected: <strong>filled</strong> (FILL 1). Same shape and optical size in both states.</li>
        <li>Filled communicates a meaningful state, not hover. Selection is exposed to assistive tech (<code>aria-pressed</code> or <code>aria-current</code>) and fill is never the only cue.</li>
        <li><Tag kind="local" /> Five sizes: XS 16, S 20, <strong>M 24 (default)</strong>, L 32, XL 40. Icon-only buttons keep a {TOUCH_TARGET}px target regardless of glyph size.</li>
        <li><Tag kind="preserved" /> Existing pixel art, avatars, game assets and scene illustrations stay. Production icons are not replaced.</li>
      </ul>
      <h2>Pipeline facts</h2>
      <ul>
        <li>Self-hosted subset: {ICON_DATA.provenance.bundledCount} icons, {ICON_DATA.provenance.fontBytes} bytes (woff2), Google Fonts {ICON_DATA.provenance.cssVersion}, sha256 <code>{ICON_DATA.provenance.fontSha256.slice(0, 16)}…</code>. Lives under <code>stories/</code>, not <code>public/</code>, so it cannot ship with production.</li>
        <li>The generator rendered every requested ligature in a browser and failed on any miss; it also compared FILL 0 and FILL 1 ink to prove the axis is real (ink ratios: {ICON_DATA.provenance.verification.fillAxis.map(f => `${f.name} ×${f.ratio}`).join(', ')}).</li>
        <li>The catalog list comes from an <strong>undocumented</strong> Google endpoint; only derived data is stored. Docs: developers.google.com/fonts/docs/material_symbols. License: Apache 2.0.</li>
        <li>If the font ever fails to load, the ligature text would show as words; the glyph text is <code>aria-hidden</code>, unselectable and clipped to the icon box.</li>
      </ul>
      <h2>Open decisions</h2>
      <ol>
        <li>Adopt outline-by-default with filled-for-active (this brief) as the functional icon rule.</li>
        <li>The five sizes, and whether XS (16, below the font’s 20 minimum optical size) is allowed.</li>
        <li>The {TOUCH_TARGET}px minimum target (still the unconfirmed Material default).</li>
        <li>Which production glyphs map to Material icons (Exceptions lists the evident ones; the rest need review).</li>
        <li>Bundle size: {ICON_DATA.provenance.bundledCount} icons now; the full catalog has {ICON_DATA.provenance.catalogCount}.</li>
      </ol>
    </Page>
  ),
  play: async () => {
    const v = ICON_DATA.provenance;
    await expect(v.verification.ligaturesRenderedAsGlyphs).toBe(v.bundledCount);
    await expect(v.verification.fillAxis.every(f => f.filledInk > f.outlineInk * 1.15)).toBe(true);
    await expect(v.fontFormat).toMatch(/wOF2/);
    await expect(v.family).toBe('Material Symbols Rounded');
    await expect(isBundled('home')).toBe(true);
    await expect(isBundled('not_an_icon')).toBe(false);
    await expect(ICON_NAMES.size).toBe(v.bundledCount);
    await expect(CATALOG.size).toBe(v.catalogCount);
    await expect(opszFor(16)).toBe(OPSZ_MIN);
    await expect(SIZES.map(s => s.px)).toEqual([16, 20, 24, 32, 40]);
  },
};

export const RoundedOutline: Story = {
  name: 'Rounded · FILL 0 (outline)',
  render: () => <Page title="Material Symbols Rounded · FILL 0 (outline, default)"><Banner /><Gallery mode="outline" /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await fontReady();
    // Every rendered glyph is the real icon: square box, no overflowing ligature text, FILL 0 and a fixed optical size.
    const cells = [...canvasElement.querySelectorAll('[data-testid="gallery-cells"] .pqi')];
    await expect(cells.length).toBe(ICONS.length);
    for (const el of cells.slice(0, 40)) {
      const g = el.querySelector('.pqi-g') as HTMLElement;
      await expect(g.scrollWidth).toBeLessThanOrEqual(g.clientWidth + 1);
      await expect(rect(el).width).toBe(rect(el).height);
      await expect(fillNum(el)).toBe('0');
      await expect(opszOf(el)).toBe('24');
    }
    // Search by name, by tag and by category; unmatched shows an empty state; unbundled catalog names are offered, not rendered.
    await userEvent.type(c.getByTestId('gallery-search'), 'home');
    await expect(c.getByTestId('cell-home')).toBeVisible();
    await userEvent.clear(c.getByTestId('gallery-search'));
    await userEvent.type(c.getByTestId('gallery-search'), 'zzzzqq');
    await expect(c.getByTestId('gallery-empty')).toBeVisible();
    const unbundled = [...CATALOG].find(n => !ICON_NAMES.has(n) && n.length > 10)!;
    await userEvent.clear(c.getByTestId('gallery-search'));
    await userEvent.type(c.getByTestId('gallery-search'), unbundled);
    await expect(c.getByTestId('gallery-unbundled')).toHaveTextContent(unbundled);
    await userEvent.clear(c.getByTestId('gallery-search'));
    // Usage: snippets are generated from the wrapper's real props (the clipboard itself is not asserted).
    await userEvent.click(c.getByTestId('cell-search'));
    const texts = within(c.getByTestId('icon-detail')).getAllByTestId('snippet-text').map(e => e.textContent);
    await expect(texts[0]).toBe(reactSnippet({name: 'search', size: 'md', filled: false}));
    await expect(texts[1]).toBe(buttonSnippet({name: 'search', label: 'Describe the action', size: 'md'}));
    await expect(texts[2]).toBe(htmlSnippet({name: 'search', size: 'md', filled: false}));
    await expect(texts[2]).toContain("'FILL' 0");
    await expect(c.getByTestId('gallery-count')).toHaveTextContent('font loaded');
  },
};

export const RoundedFilled: Story = {
  name: 'Rounded · FILL 1 (filled)',
  render: () => <Page title="Material Symbols Rounded · FILL 1 (filled, active or selected)"><Banner /><p>Filled glyphs are for meaningful active or selected states. They are not a default style and not a hover effect.</p><Gallery mode="filled" /></Page>,
  play: async ({canvasElement}) => {
    await fontReady();
    const cells = [...canvasElement.querySelectorAll('[data-testid="gallery-cells"] .pqi')];
    for (const el of cells.slice(0, 40)) { await expect(fillNum(el)).toBe('1'); await expect(opszOf(el)).toBe('24'); }
    await userEvent.click(within(canvasElement).getByTestId('cell-favorite'));
    await expect(within(canvasElement).getAllByTestId('snippet-text')[0].textContent).toBe(reactSnippet({name: 'favorite', size: 'md', filled: true}));
  },
};

export const DefaultVsActiveStory: Story = {
  name: 'Default vs Active',
  render: () => <Page title="Default vs active"><Banner /><DefaultVsActive /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await fontReady();
    for (const p of PAIRS) {
      const row = c.getByTestId(`pair-${p.name}`);
      const [a, b] = [...row.querySelectorAll('.pqi')];
      await expect(fillNum(a)).toBe('0'); await expect(fillNum(b)).toBe('1');
      await expect(opszOf(a)).toBe(opszOf(b)); // same optical size and shape in both states
      await expect(rect(a).width).toBe(rect(b).width);
    }
    // Hover shows the state layer only: the glyph stays outline.
    const bookmark = c.getByTestId('toggle-bookmark');
    await userEvent.hover(bookmark);
    await expect(fillNum(bookmark)).toBe('0');
    await expect(c.getByTestId('toggle-hover')).toHaveAttribute('aria-label', 'Like (forced hover state)');
    await expect(fillNum(c.getByTestId('toggle-hover'))).toBe('0');
    // Selection fills the glyph and is exposed to assistive tech.
    await expect(bookmark).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(bookmark);
    await expect(bookmark).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(fillNum(bookmark)).toBe('1')); // FILL transitions over the short state token
    // Navigation: aria-current plus a visible indicator; fill is not the only cue.
    await userEvent.click(c.getByTestId('nav-lightbulb'));
    await expect(c.getByTestId('nav-lightbulb')).toHaveAttribute('aria-current', 'page');
    await waitFor(() => expect(fillNum(c.getByTestId('nav-lightbulb'))).toBe('1'));
    await waitFor(() => expect(Number(fillNum(c.getByTestId('nav-home')))).toBeLessThan(0.01)); // the previous item eases back to outline
    await expect(getComputedStyle(c.getByTestId('nav-lightbulb').querySelector('.pqi-pill')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

export const SizesAndColors: Story = {
  name: 'Sizes and Semantic Colors',
  render: () => (
    <Page title="Sizes and semantic colors"><Banner /><h2>Size scale</h2><SizeScale /><h2>Semantic colors</h2><ColorUsage /><h2>Contrast against Carbon surfaces</h2><ContrastTable /></Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await fontReady();
    for (const s of SIZES) {
      const row = c.getByTestId(`size-${s.key}`);
      const [o, f] = [...row.querySelectorAll('.pqi')];
      await expect(rect(o).width).toBe(s.px); await expect(rect(f).height).toBe(s.px);
      await expect(opszOf(o)).toBe(String(opszFor(s.px)));
      // Icon-only buttons keep their own target, whatever the glyph size.
      const btn = c.getByTestId(`target-${s.key}`);
      await expect(rect(btn).width).toBeGreaterThanOrEqual(TOUCH_TARGET); await expect(rect(btn).height).toBeGreaterThanOrEqual(TOUCH_TARGET);
    }
    await expect(c.getByTestId('size-xs')).toHaveTextContent(/below the font's minimum optical size/);
    // Contrast: the default icon color meets 3:1 on every layer in both modes; disabled is information only.
    for (const m of ['light', 'dark']) {
      const row = c.getByTestId(`contrast-${m}-icon-primary`);
      for (const td of [...row.querySelectorAll('td[data-grade]')]) await expect(td.getAttribute('data-grade')).toBe('pass');
      for (const td of [...c.getByTestId(`contrast-${m}-icon-disabled`).querySelectorAll('td[data-grade]')]) await expect(td.getAttribute('data-grade')).toBe('info');
    }
    // Icons on a fill are graded against that fill; the token buttons actually use must pass in both modes.
    for (const m of ['light', 'dark']) await expect(c.getByTestId(`contrast-${m}-on-interactive-primary`).querySelector('td[data-grade]')!.getAttribute('data-grade')).toBe('pass');
    await expect(c.getByTestId('contrast-note')).toHaveTextContent(/summary/);
  },
};

export const InComponents: Story = {
  name: 'Icons in Real Components',
  render: () => <Page title="Icons in buttons, chips, inputs, navigation and dialogs"><Banner /><ComponentExamples /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await fontReady();
    // Icon-only buttons: accessible name from `label`, target independent of the 24px glyph.
    for (const id of ['btn-icon-only', 'dialog-close']) {
      const b = c.getByTestId(id);
      await expect(b.getAttribute('aria-label')).toBeTruthy();
      await expect(rect(b).width).toBeGreaterThanOrEqual(TOUCH_TARGET); await expect(rect(b).height).toBeGreaterThanOrEqual(TOUCH_TARGET);
      await expect(b.querySelector('.pqi')!.getAttribute('aria-hidden')).toBe('true'); // the glyph is decorative; the button carries the name
    }
    // Decorative leading icon is hidden from assistive tech; the status icon is meaningful.
    await expect(c.getByTestId('btn-lead').querySelector('.pqi')!.getAttribute('aria-hidden')).toBe('true');
    await expect(within(c.getByTestId('comp-dialog')).getByRole('img', {name: 'Warning'})).toBeVisible();
    // Input: trailing clear button only appears once there is text.
    await expect(c.queryByTestId('field-clear')).toBeNull();
    await userEvent.type(within(c.getByTestId('field')).getByRole('textbox'), 'game');
    await expect(c.getByTestId('field-clear')).toBeVisible();
    await userEvent.click(c.getByTestId('field-clear'));
    await expect(c.queryByTestId('field-clear')).toBeNull();
    // Chip: selected state swaps check/add, never fills the glyph (the chip fill is the cue).
    await expect(c.getByTestId('chip')).toHaveAttribute('aria-pressed', 'true');
    await expect(c.getByTestId('chip').querySelector('.pqi-g')!.textContent).toBe('check');
    // Dialog closes with its icon button.
    await userEvent.click(c.getByTestId('dialog-close'));
    await expect(c.queryByTestId('comp-dialog')).toBeNull();
    // Dark mode renders the same markup with different token values.
    await userEvent.selectOptions(c.getByTestId('comp-mode'), 'dark');
    await expect(canvasElement.querySelector('[data-testid="mode-dark"]')).not.toBeNull();
  },
};

export const LightAndDark: Story = {
  name: 'Light and Dark',
  render: () => <Page title="Outline and filled on Carbon White and Gray 100"><Banner /><LightDark /><h2>Contrast</h2><ContrastTable /></Page>,
  play: async ({canvasElement}) => {
    await fontReady();
    const light = canvasElement.querySelector('[data-testid="ld-light-0-md"] .pqi')!;
    const dark = canvasElement.querySelector('[data-testid="ld-dark-0-md"] .pqi')!;
    await expect(getComputedStyle(light).color).not.toBe(getComputedStyle(dark).color); // theme tokens differ, markup is identical
    // Every size and layer is present in both modes for outline and filled.
    for (const m of ['light', 'dark']) for (const d of [0, 1, 2]) for (const sz of ['xs', 'sm', 'md']) {
      const row = canvasElement.querySelector(`[data-testid="ld-${m}-${d}-${sz}"]`)!;
      await expect(row.querySelectorAll('.pqi[data-fill="0"]').length).toBeGreaterThan(0);
      await expect(row.querySelectorAll('.pqi[data-fill="1"]').length).toBeGreaterThan(0);
    }
  },
};

export const ExistingExceptions: Story = {
  name: 'Existing and Custom Icon Exceptions',
  render: () => <Page title="Existing game and custom icon exceptions"><Banner /><Exceptions /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByTestId('svg-line')).toBeVisible(), {timeout: 20000});
    await expect(c.getByTestId('svg-line')).toHaveTextContent(/design-audit/);
    // Obvious one-to-one mappings are proposed; everything else is owner review.
    await expect(c.getByTestId('svg-table')).toHaveTextContent('close');
    await expect(c.getByTestId('svg-table')).toHaveTextContent(/owner review/);
    // Small game controls are never reclassified as standard UI just because they are small.
    const sceneRow = [...c.getByTestId('svg-table').querySelectorAll('tr')].find(r => r.textContent?.includes('scene-controls.tsx'))!;
    await expect(sceneRow.textContent).toMatch(/Preserved control/);
    await expect(c.getByTestId('glyph-line')).toBeVisible();
    await expect(c.getByTestId('asset-line')).toHaveTextContent(/scene-review/);
    await expect(c.getByTestId('dir-guide')).toBeVisible();
  },
};

export const UnknownIconGuard: Story = {
  tags: ['!dev'],
  render: () => <Page title="Guard"><Icon name="not_an_icon" /></Page>,
  play: async ({canvasElement}) => {
    const el = canvasElement.querySelector('.pqi[data-missing="true"]')!;
    await expect(el).not.toBeNull();
    await expect(el.getAttribute('aria-label')).toMatch(/Missing icon/);
  },
};
