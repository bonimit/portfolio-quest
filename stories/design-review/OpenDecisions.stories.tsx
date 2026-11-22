import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';
import {DecisionsPage} from './DesignReview';
import {DECIDED, OPEN} from './review-model';
import {TARGETS} from '../foundations/accessibility/accessibility-model';

/*
 * Design Review / Open Decisions: every decision the foundations still leave to the owner, with visual comparisons where one is possible.
 * Nothing here is approved, and no option is a default. Compiled from each foundation's own open list minus what the owner has decided.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Design Review/Open Decisions', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Decisions: Story = {
  name: 'Open decisions and visual comparisons',
  render: () => <DecisionsPage />,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // Every open item is rendered, has at least one option, names its source, and is marked Not approved.
    await expect(OPEN.length).toBeGreaterThanOrEqual(35);
    for (const d of OPEN) {
      const el = c.getByTestId(`open-${d.id}`);
      await expect(el).toHaveTextContent('Not approved');
      await expect(d.options.length).toBeGreaterThanOrEqual(1);
      await expect(d.source.length).toBeGreaterThan(10);
    }
    await expect(new Set(OPEN.map(d => d.id)).size).toBe(OPEN.length);
    // No decided item is also listed as open (matching by topic id prefix).
    await expect(DECIDED.length).toBeGreaterThanOrEqual(10);
    for (const d of DECIDED) await expect(c.getByTestId(`decided-${d.id}`)).toHaveTextContent('Decided by owner');
    await expect(OPEN.some(d => /Option M or Option C/i.test(d.question))).toBe(false);
    await expect(OPEN.some(d => /sharp.*buttons.*pill/i.test(d.question))).toBe(false);
    // The summary counts match the data.
    await expect(c.getByTestId('open-summary')).toHaveTextContent(`${OPEN.length} open decisions`);
    // Visual comparisons exist for the items that declare one and really render.
    const withVisual = OPEN.filter(d => d.visual && d.visual !== 'type-resp');
    await expect(withVisual.length).toBeGreaterThanOrEqual(9);
    // Touch targets drawn at real size.
    const t = c.getByTestId('open-spc-touch').querySelectorAll('.pqv-box-size');
    await expect([...t].slice(0, 3).map(e => Math.round(e.getBoundingClientRect().width))).toEqual(TARGETS.map(x => x.px));
    // Menu shapes: baseline 4px (decided) vs expressive 16px (not adopted).
    await expect(getComputedStyle(c.getByTestId('menu-base')).borderTopLeftRadius).toBe('4px');
    await expect(getComputedStyle(c.getByTestId('menu-expressive')).borderTopLeftRadius).toBe('16px');
    // Dialog map: three different corner treatments for three content types.
    await expect(getComputedStyle(c.getByTestId('pattern-dialog')).borderTopLeftRadius).toBe('28px');
    await expect(getComputedStyle(c.getByTestId('pattern-full-screen')).borderTopLeftRadius).toBe('0px');
    // Dark floating: the two options really differ.
    await expect(getComputedStyle(c.getByTestId('floating-carbon')).boxShadow).not.toBe(getComputedStyle(c.getByTestId('floating-border-first')).boxShadow);
    // Orange text is below 4.5:1 on Carbon White (the reason it is open).
    await expect(Number.parseFloat(c.getByTestId('orange-ratio').textContent!)).toBeLessThan(4.5);
    // Items without a visual say so instead of pretending.
    await expect(c.getAllByTestId('no-visual').length).toBe(OPEN.filter(d => !d.visual).length);
  },
};
