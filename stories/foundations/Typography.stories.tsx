import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import type {ReactNode} from 'react';
import {
  Banner, ContextSamples, ExistingTable, FontFamilies, HeroExceptions, OptionSwitcher, ProductionFaceList, ResponsiveFrames, RoleComparison, ReviewIssues,
  ScaleTable, Surface, Tag, ThemeFamilyTable, ThemePreview, ThemeSlotMap, TokenTables, TypeTokenTable, useOption,
} from './typography/Typography';
import {FAMILIES, FRAME_WIDTH, M3, MODES, ROLE_GROUPS, STEPS, faceFor, roleLabel, sizeFor, splitRoles, themeMaps, tokenName, type RespOption} from './typography/typography-model';

/*
 * Foundations / Typography — proposal. Material 3 sizes come from typography/../material/material-typography.json (generated from
 * @material/web and cross-checked with m3.material.io). Everything about today's site is read live from production CSS and
 * app/world/page.tsx. Existing fonts, weights, line heights, tracking and hero treatments are preserved. Nothing is implemented.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;

const meta = {
  title: 'Foundations/Typography',
  parameters: {layout: 'fullscreen', a11y: specimenA11y},
} satisfies Meta;
export default meta;
type Story = StoryObj;

const Page = ({title, children}: {title: string; children: ReactNode}) => (
  <Surface testId="typography-page"><h1 style={{margin: 0, fontSize: '1.5rem'}}>{title}</h1><Banner />{children}</Surface>
);

function Switched({children}: {children: (opt: RespOption) => ReactNode}) {
  return <Inner render={children} />;
}
function Inner({render}: {render: (opt: RespOption) => ReactNode}) {
  const [opt, setOpt] = useOption('P');
  return <><OptionSwitcher opt={opt} onChange={setOpt} />{render(opt)}</>;
}

export const Overview: Story = {
  render: () => (
    <Page title="Foundations / Typography · proposal">
      <h2>Decisions accepted by the owner</h2>
      <ul>
        <li><strong>Responsive option P (Display only)</strong>, with tablet as shown.</li>
        <li><strong>Role-to-family slots</strong> as shown in Typography by Theme.</li>
        <li><strong>Existing-element to Material-size mappings</strong> accepted as the documented direction. No production change until a separate migration is approved.</li>
        <li><strong>Exceptions by path:</strong> hero, game world, D0–D6 and Adventure/Neon stay as they are.</li>
        <li><strong>Arial</strong> stays the root default for now. <strong>Synthesized bold, missing weights and glyph coverage</strong> are tracked review issues, not changed.</li>
        <li>The existing <code>Review/04 Typography</code> record is untouched.</li>
      </ul>
      <h2>What this documents</h2>
      <ul>
        <li><Tag kind="current" /> Every font in use is kept: Instrument Sans (primary), Newsreader (secondary), Anton (display), plus Figtree, Press Start 2P and IBM Plex Mono in the Adventure themes.</li>
        <li><Tag kind="official" /> Material 3 is used for font <strong>sizes only</strong>: 15 roles (Display, Headline, Title, Body, Label; Large, Medium, Small).</li>
        <li><Tag kind="local" /> Desktop, tablet and mobile sizes are local adaptations. Material publishes one scale and no per-window-class sizes.</li>
        <li><Tag kind="preserved" /> Material fonts (Roboto), weights, tracking and full type-style definitions are not adopted. Weights, line heights, tracking, capitalization and every hero treatment stay as they are.</li>
      </ul>
      <h2>Sections</h2>
      <ol>
        <li>Font Families</li><li>Desktop Type Scale</li><li>Mobile Type Scale</li><li>Desktop vs Mobile (with tablet)</li><li>Typography by Theme</li><li>Existing vs Proposed</li><li>Token Architecture</li><li>Review Issues &amp; Validation</li>
      </ol>
      <h2>Open decisions (none are decided)</h2>
      <ol>
        <li><strong>Responsive option:</strong> P (Display only) or Q (Display and Headline).</li>
        <li><strong>Arial:</strong> root body default and the family of any unstyled text. Primary-by-default, or fallback only.</li>
        <li><strong>Role-to-family slots</strong> (for example Headline as display or secondary).</li>
        <li><strong>Size-only adoption:</strong> approve mapping existing elements to Material sizes (changes appear only after a later, separately approved migration).</li>
        <li><strong>Weight review issues</strong> (synthesized bold, missing weights) and <strong>glyph coverage</strong> of the latin subsets.</li>
        <li><strong>Existing Review/04 Typography</strong> proposal (45/52, 57/64 and 72/80) versus this one. They differ; nothing is changed in that record.</li>
        <li><strong>Hero and creative-theme exceptions</strong> by path (Existing vs Proposed).</li>
      </ol>
      <h2>Provenance</h2>
      <p>Generated {M3.provenance.generatedOn} from <code>@material/web {M3.provenance.packages['@material/web']}</code> and the rendered m3.material.io type-scale tokens page. {M3.provenance.note}</p>
      <h2>Font files in use</h2>
      <ProductionFaceList />
    </Page>
  ),
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByText(/Open decisions/)).toBeVisible();
    // Official scale: 15 roles, every one cross-checked against the rendered page by the generator.
    await expect(M3.roles).toHaveLength(15);
    await expect(M3.roles.every(r => (r as {pageVerified?: boolean}).pageVerified)).toBe(true);
  },
};

export const FontFamiliesStory: Story = {
  name: 'Font Families',
  render: () => <Page title="Font families"><FontFamilies /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const d of FAMILIES) await expect(c.getByTestId(`family-${d.id}`)).toBeVisible();
    // Every real font asset must actually load, so specimens are not silently fallbacks.
    await waitFor(async () => {
      for (const d of FAMILIES.filter(f => faceFor(f))) {
        const note = c.getByTestId(`loaded-${d.id}`);
        await expect(note).toHaveTextContent(/loaded/);
        await expect(note.textContent).not.toMatch(/NOT loaded/);
      }
    }, {timeout: 15000});
  },
};

export const DesktopTypeScale: Story = {
  render: () => <Page title="Desktop type scale"><Switched>{opt => <ScaleTable mode="desktop" opt={opt} />}</Switched></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Desktop uses the official Material sizes for every role.
    const expected: Record<string, number> = {'display-large': 57, 'display-medium': 45, 'display-small': 36, 'headline-large': 32, 'headline-medium': 28, 'headline-small': 24, 'title-large': 22, 'title-medium': 16, 'title-small': 14, 'body-large': 16, 'body-medium': 14, 'body-small': 12, 'label-large': 14, 'label-medium': 12, 'label-small': 11};
    for (const [k, v] of Object.entries(expected)) await expect(c.getByTestId(`px-${k}-desktop`)).toHaveTextContent(`${v}px`);
    // The rendered specimen really has that computed size (rem-based, 16px root).
    const spec = c.getByTestId('spec-display-large-desktop');
    await expect(parseFloat(getComputedStyle(spec).fontSize)).toBe(57);
  },
};

export const MobileTypeScale: Story = {
  render: () => <Page title="Mobile type scale"><Switched>{opt => <ScaleTable mode="mobile" opt={opt} />}</Switched></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Option P: only Display steps down, to the next official size.
    await expect(c.getByTestId('px-display-large-mobile')).toHaveTextContent('45px');
    await expect(c.getByTestId('px-display-medium-mobile')).toHaveTextContent('36px');
    await expect(c.getByTestId('px-display-small-mobile')).toHaveTextContent('32px');
    await expect(c.getByTestId('px-headline-large-mobile')).toHaveTextContent('32px');
    await expect(c.getByTestId('px-body-large-mobile')).toHaveTextContent('16px');
    await userEvent.click(c.getByLabelText(/Option Q/));
    await expect(c.getByTestId('px-headline-large-mobile')).toHaveTextContent('28px');
    await expect(c.getByTestId('px-label-small-mobile')).toHaveTextContent('11px');
  },
};

export const DesktopVsMobile: Story = {
  name: 'Desktop vs Mobile',
  render: () => (
    <Page title="Desktop, tablet and mobile">
      <Switched>{opt => (
        <>
          <h2>Same role across layouts</h2>
          <RoleComparison opt={opt} />
          <h2>Preview frames</h2>
          <p className="pqt-muted">Fixed-width frames with the proposal’s sizes injected: media queries would follow the preview iframe, not the frame.</p>
          <ResponsiveFrames opt={opt} />
        </>
      )}</Switched>
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Reflow: no frame clips its content at any width, at default and doubled root text.
    const html = document.documentElement;
    const before = html.style.fontSize;
    try {
      for (const scale of ['', '200%']) {
        html.style.fontSize = scale;
        for (const m of MODES) {
          const frame = c.getByTestId(`frame-${m}`);
          await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
          await expect(frame.clientWidth).toBeGreaterThanOrEqual(Math.min(FRAME_WIDTH[m], frame.clientWidth));
        }
      }
    } finally { html.style.fontSize = before; }
    // Tablet keeps Material's Display Medium size and steps Display Large down.
    await expect(sizeFor('display-large', 'tablet', 'P').px).toBe(45);
    await expect(sizeFor('display-medium', 'tablet', 'P').px).toBe(45);
    await expect(c.getByTestId('cmp-body-large-mobile')).toHaveTextContent('16px');
    await expect(c.getByTestId('cmp-body-large')).toHaveTextContent('no, single token');
  },
};

export const TypographyByTheme: Story = {
  name: 'Typography by Theme',
  render: () => (
    <Page title="Typography by theme">
      <Switched>{opt => (
        <>
          <h2>Role to family slot (proposal)</h2>
          <ThemeSlotMap />
          <h2>Families resolved from the real cascade</h2>
          <ThemeFamilyTable />
          <h2>Same roles, different families</h2>
          <p className="pqt-muted" data-testid="neon-note"><Tag kind="issue" /> Press Start 2P is a wide pixel face. At Material Display and Headline sizes a single word wraps mid-word in a narrow card (see Neon). Neon is a preserved creative theme, so no size change is proposed; its existing small sizes are listed as an exception for approval.</p>
          <div className="pqt-grid">{themeMaps().map(t => <ThemePreview key={t.id} theme={t} opt={opt} />)}</div>
        </>
      )}</Switched>
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    const name = (id: string, slot: string) => c.getByTestId(`theme-${id}-${slot}`).textContent ?? '';
    await expect(name('editorial', 'display')).toMatch(/Anton/);
    await expect(name('editorial', 'primary')).toMatch(/Instrument Sans/);
    await expect(name('editorial', 'secondary')).toMatch(/Newsreader/);
    // Neon differs from Island/Arcade; Island and Arcade resolve identically (a finding, reported on the page).
    await expect(name('neon', 'display')).toMatch(/Press Start 2P/);
    await expect(name('neon', 'primary')).toMatch(/IBM Plex Mono/);
    await expect(name('island', 'display')).toMatch(/Anton/);
    await expect(name('island', 'primary')).toMatch(/Figtree/);
    await expect(name('arcade', 'primary')).toMatch(/Figtree/);
    // The family a specimen actually renders with is the family the cascade resolved (not a fallback).
    await waitFor(async () => {
      await document.fonts.ready;
      const neon = within(c.getByTestId('preview-neon')).getByTestId('spec-display-medium-desktop');
      await expect(getComputedStyle(neon).fontFamily).toMatch(/adventure-pixel/);
      await expect(document.fonts.check('16px "PQT adventure-pixel"', 'Aa')).toBe(true);
    }, {timeout: 15000});
  },
};

export const ExistingVsProposed: Story = {
  name: 'Existing vs Proposed',
  render: () => (
    <Page title="Existing vs proposed">
      <h2>Existing app type tokens vs the Material scale</h2>
      <TypeTokenTable />
      <h2>Real elements, current size vs proposed Material size</h2>
      <p className="pqt-muted">Current values are read live from the cited CSS file and line. The Material role for each element is a <Tag kind="local" /> mapping that needs approval. Weights, tracking, capitalization and line height are shown as they are today and are not part of the proposal.</p>
      <ExistingTable />
      <h2>Specimens: current vs proposed</h2>
      <ContextSamples />
      <h2>Hero and display compositions (preserved, never mapped)</h2>
      <HeroExceptions />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByTestId('existing-table')).toBeVisible(), {timeout: 15000});
    // Live read: card title is 1.25rem in app/landing.css (20px), proposed Title Large is 22px.
    await waitFor(() => expect(c.getByTestId('ex-cur-.landing-card h3')).toHaveTextContent('20px'), {timeout: 15000});
    await expect(c.getByTestId('ex-cur-.work-chip')).toHaveTextContent(/px/);
    // The existing app scale already sits on Material values for most steps (12, 14, 16, 24).
    await expect(c.getByTestId('tok---temp-type-sm')).toHaveTextContent('yes');
    await expect(c.getByTestId('tok---temp-type-base')).toHaveTextContent('yes');
    await expect(c.getByTestId('tok---temp-type-lg')).toHaveTextContent('no');
    // Hero compositions are far above Display Large and are listed as exceptions only.
    await expect(within(c.getByTestId('hero-table')).getAllByText(/Preserved/).length).toBeGreaterThan(0);
  },
};

export const TokenArchitecture: Story = {
  render: () => <Page title="Token architecture"><Switched>{opt => <TokenTables opt={opt} />}</Switched></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('dup-note')).toHaveTextContent('none');
    // Option P: only Display roles are split per mode; Body, Label and Title stay single tokens.
    const split = splitRoles('P').map(r => r.role);
    await expect(split.sort()).toEqual(['display-large', 'display-medium', 'display-small']);
    await expect(c.getByTestId('tok-type-display-lg-mobile')).toBeVisible();
    await expect(c.getByTestId('tok-type-body-md')).toBeVisible();
    await expect(c.queryByTestId('tok-type-body-md-mobile')).toBeNull();
    await userEvent.click(c.getByLabelText(/Option Q/));
    await expect(c.getByTestId('tok-type-headline-md-mobile')).toBeVisible();
    // Token names are unique for every role and mode.
    const names = M3.roles.flatMap(r => [tokenName(r.role, null), ...MODES.map(m => tokenName(r.role, m))]);
    await expect(new Set(names).size).toBe(names.length);
    await expect(ROLE_GROUPS).toHaveLength(5);
    await expect(STEPS).toHaveLength(3);
    await expect(roleLabel({group: 'display', step: 'large'})).toBe('Display Large');
  },
};

export const ReviewIssuesStory: Story = {
  name: 'Review Issues & Validation',
  render: () => <Page title="Review issues and validation"><ReviewIssues /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByTestId('census-line')).toBeVisible(), {timeout: 20000});
    await expect(c.getByTestId('census-line')).toHaveTextContent(/design-audit/);
    await waitFor(async () => {
      const rows = within(c.getByTestId('load-table')).getAllByRole('row').slice(1);
      await expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) await expect(r).toHaveTextContent(/loaded/);
      for (const r of rows) await expect(r.textContent).not.toMatch(/not loaded/);
    }, {timeout: 15000});
  },
};
