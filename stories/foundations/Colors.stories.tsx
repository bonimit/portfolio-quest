import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, within} from 'storybook/test';
import {
  Banner, Completeness, ContrastMatrix, DuplicateValues, GroupSection, LiteralAudit, SkyVariants, SWITCHABLE,
  ThemeComparison, ThemePreview, ThemeSection, useAudit, type PreviewView,
} from './ColorFoundations';
import {parseColor, toHex} from './color-math';
import {THEMES, resolveTheme, resolveThemeView, themeById, type ThemeId} from './color-source';

/*
 * Archive / Colors (original). Superseded by Foundations / Colors; kept as the historical record.
 * All values are read from production CSS at build time (see color-source.ts).
 * Documentation only: no production color, CSS or protected file is changed here.
 */
type Args = {theme: ThemeId; view: PreviewView};

const Page = ({title, children}: {title: string; children: React.ReactNode}) => (
  <main className="fx">
    <h1>{title}</h1>
    <Banner />
    {children}
  </main>
);

// Specimens deliberately show low-contrast pairings and real production CSS, so axe's color-contrast rule is
// disabled on those stories only; the measured ratios are reported in the page itself (Contrast pairings).
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;

const meta = {
  title: 'Archive/Colors (original)',
  parameters: {layout: 'fullscreen', a11y: {test: 'error'}},
  decorators: [(Story: React.ComponentType) => <><div role="note" style={{padding: '.75rem 1rem', border: '2px dashed currentColor', margin: '1rem'}}><strong>Archived.</strong> Superseded by Foundations / Colors (Carbon). Kept unchanged as the historical current-state record; do not build new work from it.</div><Story /></>],
  argTypes: {
    theme: {control: 'select', options: SWITCHABLE.map(t => t.id)},
    view: {control: 'inline-radio', options: ['grid', 'carousel']},
  },
  args: {theme: 'island', view: 'grid'},
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

function OverviewPage() {
  const audit = useAudit();
  return (
    <Page title="Foundations / Colors">
      <p>
        Colors currently used by the site, grouped as Primitive, Semantic, Theme and Component. Each swatch shows its name, HEX, RGB,
        CSS variable, usage role, source location and measured usage. Use the other stories for each group, contrast pairings and
        the theme switcher.
      </p>
      <GroupSection group="primitive" audit={audit} />
      <GroupSection group="semantic" audit={audit} />
      <h2>Theme Colors</h2>
      {THEMES.filter(t => t.kind === 'theme').map(t => <ThemeSection key={t.id} theme={t} audit={audit} />)}
      <GroupSection group="component" audit={audit} />
      <h2>Same value, several tokens</h2>
      <DuplicateValues />
      <Completeness />
      <LiteralAudit audit={audit} />
    </Page>
  );
}

export const Overview: Story = {
  render: () => <OverviewPage />,
  parameters: {a11y: specimenA11y},
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Catalog and source agree: nothing silently dropped, no stale entries.
    await expect(c.getByTestId('unclassified-count')).toHaveTextContent('0');
    await expect(c.getByTestId('missing-count')).toHaveTextContent('0');
    // A source-derived value, not a copy: --color-ink resolves to the same color as the live :root property.
    const live = parseColor(getComputedStyle(document.documentElement).getPropertyValue('--color-ink').trim());
    await expect(live).not.toBeNull();
    await expect(c.getByTestId('swatch---color-ink')).toHaveTextContent(toHex(live!));
  },
};

export const PrimitiveColors: Story = {
  // Superseded by v2 Primitives; hidden from the sidebar, source retained (remove this tag to restore).
  tags: ['!dev'],
  render: () => {
    const Inner = () => {
      const audit = useAudit();
      return <Page title="Primitive Colors"><GroupSection group="primitive" audit={audit} /><h2>Same value, several tokens</h2><DuplicateValues /></Page>;
    };
    return <Inner />;
  },
};

export const SemanticColors: Story = {
  // Superseded by v2 Semantic tokens; hidden from the sidebar, source retained (remove this tag to restore).
  tags: ['!dev'],
  render: () => {
    const Inner = () => {
      const audit = useAudit();
      return <Page title="Semantic Colors"><GroupSection group="semantic" audit={audit} /></Page>;
    };
    return <Inner />;
  },
};

export const ThemeColors: Story = {
  parameters: {a11y: specimenA11y},
  render: () => {
    const Inner = () => {
      const audit = useAudit();
      return (
        <Page title="Theme Colors">
          <p className="fx-muted">
            Adventure hub labels map to source themes: Island = A5, Arcade = H3 (base tokens), Neon = A2. “Island · Day/Night” is the separate 3D island scene
            (<code>data-light</code>). Light/dark is derived from each view’s resolved background, not declared in source: the site has no
            <code> prefers-color-scheme</code> handling, and the light/dark palette proposals in docs/design-audit are unapproved drafts, not shown here as existing themes.
          </p>
          <h2>Comparison</h2>
          <ThemeComparison />
          <h2>Per theme</h2>
          {THEMES.filter(t => t.kind === 'theme').map(t => <ThemeSection key={t.id} theme={t} audit={audit} />)}
          <h2>Island scene sky variants</h2>
          <SkyVariants />
        </Page>
      );
    };
    return <Inner />;
  },
};

export const ComponentColors: Story = {
  render: () => {
    const Inner = () => {
      const audit = useAudit();
      return (
        <Page title="Component Colors">
          <GroupSection group="component" audit={audit} />
          <h2>Contexts that re-map tokens</h2>
          <p className="fx-muted">Footer, world preview, entrance and guide dialog scopes, resolved from their real selectors.</p>
          {THEMES.filter(t => t.kind === 'context').map(t => <ThemeSection key={t.id} theme={t} audit={audit} />)}
        </Page>
      );
    };
    return <Inner />;
  },
};

export const ContrastPairings: Story = {
  parameters: {a11y: specimenA11y},
  render: () => <Page title="Foreground / background pairings"><ContrastMatrix /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.queryAllByTestId('stale-citation')).toHaveLength(0);
    await expect(c.queryAllByText('Not resolved')).toHaveLength(0);
    // Sanity: the editorial body pairing equals the manually-known direction (ink on paper is well above 4.5:1).
    await expect(c.getByTestId('cell-ed-text-editorial')).toHaveTextContent('✓ Pass');
  },
};

export const ThemeSwitcher: Story = {
  parameters: {a11y: specimenA11y},
  render: args => {
    const Inner = () => {
      const audit = useAudit();
      return (
        <Page title="Theme switcher">
          <p>Preview sample UI against the real existing themes. Adventure themes use the production Adventure CSS unmodified.</p>
          <ThemePreview theme={args.theme} view={args.view} audit={audit} />
        </Page>
      );
    };
    return <Inner />;
  },
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // The live cascade must agree with the parsed source for each real Adventure theme and view.
    for (const id of ['island', 'arcade', 'neon'] as const) {
      await userEvent.click(c.getByLabelText(themeById(id).label));
      for (const [view, label] of [['grid', 'Grid (cabinet)'], ['carousel', 'Carousel (select)']] as const) {
        await userEvent.click(c.getByLabelText(label));
        const root = await c.findByTestId('adventure-root');
        const cs = getComputedStyle(root);
        for (const token of ['--ink', '--paper', '--card', '--tint']) {
          const expected = resolveThemeView(id, view).get(token)?.color;
          const actual = parseColor(cs.getPropertyValue(token).trim());
          await expect(expected).toBeTruthy();
          await expect(actual && toHex(actual)).toBe(toHex(expected!));
        }
      }
    }
    // Island scene specimen applies the resolved tokens.
    await userEvent.click(c.getByLabelText(themeById('island-night').label));
    const night = getComputedStyle(await c.findByTestId('island-specimen')).getPropertyValue('--q-note-bg').trim();
    await expect(toHex(parseColor(night)!)).toBe(toHex(resolveTheme('island-night').get('--q-note-bg')!.color!));
  },
};
