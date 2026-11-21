import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import type {ReactNode} from 'react';
import {
  Banner, ComponentDemos, CoverageSummary, DurationComparison, EasingCurves, ExistingVsProposed, MotionRoot, PreservedAnimations, ReducedMotionRules, Surface, Tag, TokenTables,
  TransitionLab, useCensus,
} from './motion/Motion';
import {M3, SEMANTIC_DURATIONS, COMPOSITES, cssEasing, bezOf, easingByToken, durationByToken, tokenShort} from './motion/motion-model';

/*
 * Foundations / Motion & Animation — proposal. Easing curves and durations come from motion/../material/material-motion.json (generated from
 * @material/web and cross-checked against the rendered m3.material.io Tokens page). Everything about today's site is read live from production
 * CSS and TSX. Production animations are preserved and never aliased to these tokens. Nothing is implemented.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Foundations/Motion & Animation', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

const Page = ({title, children}: {title: string; children: ReactNode}) => (
  <Surface testId="motion-page"><h1 style={{margin: 0, fontSize: '1.5rem'}}>{title}</h1><Banner /><MotionRoot>{children}</MotionRoot></Surface>
);

const animOf = (el: HTMLElement) => el.getAnimations()[0];
const timingOf = (el: HTMLElement) => animOf(el).effect!.getTiming();
const keyframeProps = (el: HTMLElement) => new Set((animOf(el).effect as KeyframeEffect).getKeyframes().flatMap(k => Object.keys(k)).filter(k => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)));
const std = (t: string) => cssEasing(bezOf(easingByToken(t)));

export const Overview: Story = {
  render: () => (
    <Page title="Foundations / Motion & Animation · proposal">
      <h2>What this documents</h2>
      <ul>
        <li><Tag kind="official" /> Material 3 easing curves and 16 durations, cross-checked against the rendered Material page. <Tag kind="official-pair" /> Material’s own enter / exit pairs.</li>
        <li><Tag kind="local" /> Semantic tokens for ordinary UI motion only: button and chip state, dropdown, dialog and sheet.</li>
        <li><Tag kind="preserved" /> Avatar walking, island zoom, scene changes, game interactions and expressive hover motion keep their exact timing, easing and behavior. Nothing is aliased to the new tokens.</li>
        <li>Surfaces, spacing and shadows in the demos reuse the approved Carbon, Material spacing and Surfaces &amp; Depth foundations unchanged.</li>
      </ul>
      <h2>Findings you should know first</h2>
      <ol>
        <li><strong>Emphasized has no CSS curve.</strong> Material’s own table says “N/A (Use Standard as a fallback)”. Enter and exit use emphasized decelerate and emphasized accelerate, which are real cubic-béziers.</li>
        <li><strong>Material calls this system legacy.</strong> {M3.quotes.legacyNote.replace(/^Note:\s*/, '')} Springs are listed as reference only.</li>
        <li><strong>Exits are shorter than enters</strong> in Material’s guidance: {M3.quotes.exitShorter}</li>
        <li><strong>Reduced-motion coverage in your CSS</strong> and looping animations are reported on the Preserved Animations and Reduced Motion pages. Nothing was changed.</li>
      </ol>
      <h2>Open decisions (none are decided)</h2>
      <ol>
        <li>Easing and duration tokens (what this builds) versus the spring system for future work.</li>
        <li>Bucket choices: short 200ms, medium 400ms, long 500ms, ambient 1000ms (each is Material’s own example for that range).</li>
        <li>Which ordinary UI transitions are candidates for the tokens (Existing vs Proposed lists them; nothing migrates).</li>
        <li>Reduced-motion rules for the demos (fade instead of movement) and whether production loops need a static fallback.</li>
        <li>Game and expressive tokens: documentation names only, or none.</li>
      </ol>
      <h2>Provenance</h2>
      <p>Generated {M3.provenance.generatedOn}. {M3.provenance.note}</p>
    </Page>
  ),
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByText(/Open decisions/)).toBeVisible();
    await expect(M3.durations).toHaveLength(16);
    await expect(M3.durations.every(d => d.pageVerified)).toBe(true);
    await expect(M3.easings.every(e => e.pageVerified)).toBe(true);
    await expect(M3.emphasized.css).toBeNull();
  },
};

export const EasingAndDuration: Story = {
  render: () => <Page title="Easing curves and durations"><h2>Easing curves</h2><EasingCurves /><h2>Duration comparison</h2><DurationComparison /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByLabelText('Allow')); // independent of the browser's own reduced-motion setting
    // The curve graphs and the animations use the same JSON numbers.
    for (const e of M3.easings) await expect(within(c.getByTestId(`curve-${tokenShort(e.token)}`)).getByText(cssEasing(bezOf(e)))).toBeVisible();
    await expect(c.getByTestId('curve-emphasized')).toHaveTextContent(/N\/A \(Use Standard as a fallback\)/);
    // Replay: each dot runs with exactly its token's easing and the selected duration (long2 = 500ms).
    await userEvent.click(c.getByTestId('curve-play'));
    for (const e of M3.easings) {
      const dot = c.getByTestId(`dot-${tokenShort(e.token)}`);
      await expect(timingOf(dot).duration).toBe(500);
      await expect(timingOf(dot).easing).toBe(cssEasing(bezOf(e)));
      animOf(dot).finish();
      await expect(animOf(dot).playState).toBe('finished');
    }
    // Duration comparison: every one of the 16 dots runs its own official duration.
    await userEvent.click(c.getByTestId('dur-play'));
    for (const d of M3.durations) await expect(timingOf(c.getByTestId(`ddot-${tokenShort(d.token)}`)).duration).toBe(d.ms);
  },
};

export const Transitions: Story = {
  render: () => <Page title="Fade, scale, slide and expand / collapse"><TransitionLab /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByLabelText('Allow')); // independent of the browser's own reduced-motion setting
    // Enter uses the official pair (emphasized decelerate, 400ms); exit is shorter (emphasized accelerate, 200ms).
    await userEvent.click(c.getByTestId('lab-enter'));
    for (const k of ['fade', 'scale', 'slide', 'expand']) {
      const el = c.getByTestId(`lab-${k}`);
      await expect(timingOf(el).duration).toBe(400);
      await expect(timingOf(el).easing).toBe(std('md.sys.motion.easing.emphasized.decelerate'));
      animOf(el).finish();
    }
    await userEvent.click(c.getByTestId('lab-exit'));
    for (const k of ['fade', 'slide']) {
      await expect(timingOf(c.getByTestId(`lab-${k}`)).duration).toBe(200);
      await expect(timingOf(c.getByTestId(`lab-${k}`)).easing).toBe(std('md.sys.motion.easing.emphasized.accelerate'));
    }
    await expect(M3.suggestedPairs.find(p => p.easing === 'Emphasized accelerate')!.ms).toBeLessThan(M3.suggestedPairs.find(p => p.easing === 'Emphasized decelerate')!.ms);
    // Small pair: standard decelerate 250ms.
    await userEvent.selectOptions(c.getByTestId('lab-pair'), 'motion-enter-small');
    await userEvent.click(c.getByTestId('lab-enter'));
    await expect(timingOf(c.getByTestId('lab-slide')).duration).toBe(250);
    await expect(timingOf(c.getByTestId('lab-slide')).easing).toBe(std('md.sys.motion.easing.standard.decelerate'));
    // Slide moves (transform) with full motion.
    await expect(keyframeProps(c.getByTestId('lab-slide')).has('transform')).toBe(true);
    // Reduce: every transition becomes opacity only.
    await userEvent.click(c.getByLabelText('Reduce'));
    await userEvent.click(c.getByTestId('lab-enter'));
    for (const k of ['scale', 'slide', 'expand']) await expect([...keyframeProps(c.getByTestId(`lab-${k}`))]).toEqual(['opacity']);
    await userEvent.click(c.getByLabelText('Allow'));
    await userEvent.click(c.getByTestId('lab-enter'));
    await expect(keyframeProps(c.getByTestId('lab-scale')).has('transform')).toBe(true);
  },
};

export const ButtonsDropdownsDialogs: Story = {
  render: () => <Page title="Buttons, chips, dropdowns, dialogs and sheets"><ComponentDemos /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByLabelText('Allow')); // independent of the browser's own reduced-motion setting
    // State layer: a real CSS transition built from the semantic token (200ms, standard easing), colour only.
    const btn = c.getByTestId('demo-button');
    await waitFor(() => expect(getComputedStyle(btn).transitionDuration).toBe('0.2s'));
    await expect(getComputedStyle(btn).transitionProperty).toBe('background-color');
    await expect(getComputedStyle(btn).transitionTimingFunction).toBe(std('md.sys.motion.easing.standard'));
    // Dropdown: enter 250ms standard decelerate, exit 200ms standard accelerate; expands (clip-path), no scale.
    const menu = c.getByTestId('demo-menu');
    await userEvent.click(c.getByTestId('demo-menu-toggle'));
    await expect(menu.hidden).toBe(false);
    await expect(timingOf(menu).duration).toBe(250);
    await expect(timingOf(menu).easing).toBe(std('md.sys.motion.easing.standard.decelerate'));
    await expect(keyframeProps(menu).has('transform')).toBe(false);
    animOf(menu).finish();
    await userEvent.click(c.getByTestId('demo-menu-toggle'));
    await expect(timingOf(menu).duration).toBe(200);
    await expect(timingOf(menu).easing).toBe(std('md.sys.motion.easing.standard.accelerate'));
    animOf(menu).finish();
    await waitFor(() => expect(menu.hidden).toBe(true));
    // Desktop dialog and mobile sheet: same durations (400 enter / 200 exit); only the travel differs.
    for (const d of ['desktop', 'mobile']) {
      const dlg = c.getByTestId(`dialog-${d}`);
      await userEvent.click(c.getByTestId(`open-${d}`));
      await expect(timingOf(dlg).duration).toBe(400);
      await expect(timingOf(dlg).easing).toBe(std('md.sys.motion.easing.emphasized.decelerate'));
      await expect(keyframeProps(dlg).has('transform')).toBe(true);
      animOf(dlg).finish();
      await userEvent.keyboard('{Escape}');
      await expect(timingOf(dlg).duration).toBe(200);
      await expect(timingOf(dlg).easing).toBe(std('md.sys.motion.easing.emphasized.accelerate'));
      animOf(dlg).finish();
    }
    // Reduce: opacity only, never longer than the short token; the state-layer colour transition is unchanged.
    await userEvent.click(c.getByLabelText('Reduce'));
    await userEvent.click(c.getByTestId('open-desktop'));
    const dlg = c.getByTestId('dialog-desktop');
    await expect([...keyframeProps(dlg)]).toEqual(['opacity']);
    await expect(timingOf(dlg).duration).toBeLessThanOrEqual(200);
    await expect(getComputedStyle(btn).transitionDuration).toBe('0.2s');
  },
};

export const Tokens: Story = {
  render: () => <Page title="Motion tokens"><TokenTables /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Semantic tokens resolve to official values (bucket names are local; values are Material's own examples).
    const expectMs: Record<string, number> = {'motion-duration-short': 200, 'motion-duration-medium': 400, 'motion-duration-long': 500, 'motion-duration-ambient': 1000};
    for (const d of SEMANTIC_DURATIONS) {
      await expect(c.getByTestId(`sem-${d.name}`)).toHaveTextContent(`${expectMs[d.name]}ms`);
      await expect(durationByToken(d.step).ms).toBe(expectMs[d.name]);
    }
    await expect(COMPOSITES.find(x => x.name === 'motion-enter')!.ms).toBe(400);
    await expect(COMPOSITES.find(x => x.name === 'motion-exit')!.ms).toBe(200);
    await expect(COMPOSITES.find(x => x.name === 'motion-exit-small')!.ms).toBe(200);
    // Every primitive is page-verified, springs are labelled package-only, emphasized has no CSS curve.
    await expect(within(c.getByTestId('prim-table')).queryAllByText('no')).toHaveLength(0);
    await expect(c.getByTestId('spring-table')).toBeVisible();
    await expect(c.getByTestId('token-json')).toHaveTextContent('none (use standard)');
    await waitFor(() => expect(c.getByTestId('game-table').querySelectorAll('tr').length).toBeGreaterThan(5));
    // The overshooting production pop has no close official match, so it is never forced onto one.
    await expect(c.getByTestId('game-table')).toHaveTextContent(/no close match/);
  },
};

export const ReducedMotion: Story = {
  render: () => (
    <Page title="Reduced motion">
      <p>Material’s page does not specify reduced-motion behavior. These rules are local and follow W3C technique C39 (“Using the CSS prefers-reduced-motion query to prevent motion”, level Sufficient for SC 2.3.3 Animation from Interactions, AAA). Success-criterion levels cited here (2.2.2 level A, 2.3.3 level AAA) come from a W3C summary, not verbatim page text.</p>
      <h2>Rules for the demos</h2>
      <ReducedMotionRules />
      <h2>Try it</h2>
      <p>Use the control above. “Follow system” reads <code>prefers-reduced-motion</code> live; Reduce and Allow override it for these demos only.</p>
      <TransitionLab />
    </Page>
  ),
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('reduce-table')).toHaveTextContent(/Colour change is essential feedback/);
    await expect(c.getByTestId('motion-effective')).toHaveTextContent(/system preference/);
    await userEvent.click(c.getByLabelText('Reduce'));
    await expect(c.getByTestId('motion-effective')).toHaveTextContent('reduced');
    await userEvent.click(c.getByLabelText('Allow'));
    await expect(c.getByTestId('motion-effective')).toHaveTextContent('full motion');
    await userEvent.click(c.getByLabelText('Follow system'));
    // Follow system tracks the live media query (the real emulation check runs separately in Playwright).
    await expect(c.getByTestId('motion-effective')).toHaveTextContent(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full motion');
  },
};

function CensusPage({which}: {which: 'preserved' | 'existing'}) {
  const {css, js} = useCensus();
  if (!css) return <p data-testid="loading">Reading production CSS…</p>;
  return which === 'preserved'
    ? <><h2>Reduced-motion coverage</h2><CoverageSummary css={css} /><h2>CSS animations (keyframes verbatim)</h2><PreservedAnimations css={css} js={js} /></>
    : <><h2>Ordinary UI candidates</h2><ExistingVsProposed css={css} /></>;
}
export const PreservedAnimationsStory: Story = {
  render: () => <Page title="Preserved Portfolio Quest animations"><CensusPage which="preserved" /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByTestId('coverage-line')).toBeVisible(), {timeout: 20000});
    await expect(c.getByTestId('coverage-line')).toHaveTextContent(/design-audit/);
    await expect(c.getByTestId('infinite-line')).toHaveTextContent(/infinite/);
    // Real production keyframes are present and driven by their live timing (not copied).
    await expect(c.getByTestId('pv-landing-card-pop')).toHaveTextContent(/landing\.css/);
    // Verbatim keyframes injected with a prefix, so production names are never redefined.
    await expect(c.getByTestId('pqm-keyframes').textContent).toMatch(/@keyframes pqm-landing-card-pop/);
    await waitFor(() => expect(c.getByTestId('js-table')).toBeVisible(), {timeout: 20000});
    await expect(within(c.getByTestId('js-table')).getByText('components/work/work-explorer.tsx')).toBeVisible();
    await expect(c.getByTestId('js-components/work/work-explorer.tsx')).toHaveTextContent(/\.animate\(/);
    await userEvent.click(c.getByTestId('preserved-play'));
    await expect(c.getByTestId('preserved-play')).toHaveAttribute('aria-pressed', 'true');
  },
};

export const ExistingVsProposedStory: Story = {
  render: () => <Page title="Existing vs proposed"><CensusPage which="existing" /></Page>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await waitFor(() => expect(c.getByTestId('cand-line')).toBeVisible(), {timeout: 20000});
    // Preserved groups never appear as candidates.
    const rows = within(c.getByTestId('cand-table')).getAllByRole('row').slice(1);
    await expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) await expect(r.textContent).not.toMatch(/app\/world\/|app\/quest-preview\/|app\/entrance\.css|app\/landing\.css/);
  },
};
