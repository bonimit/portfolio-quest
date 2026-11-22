import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';
import {ProvenanceTables, ReviewPage} from './DesignReview';
import {PROVENANCE} from './review-model';

/* Design Review / Provenance: official guidelines, local adaptations and intentional exceptions, listed separately per foundation. */
const meta = {title: 'Design Review/Provenance', parameters: {layout: 'fullscreen', a11y: {test: 'todo'}}} satisfies Meta;
export default meta;
type Story = StoryObj;

export const OfficialLocalExceptions: Story = {
  name: 'Official, local and exceptions',
  render: () => <ReviewPage title="Official guidelines, local adaptations and intentional exceptions"><ProvenanceTables /></ReviewPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(PROVENANCE.length).toBe(9);
    for (const p of PROVENANCE) {
      const row = c.getByTestId(`prov-${p.foundation}`);
      await expect(row).toBeVisible();
      // Three separate, non-empty lists; they are never merged into one.
      await expect(p.official.length).toBeGreaterThan(0);
      await expect(p.local.length).toBeGreaterThan(0);
      await expect(p.exceptions.length).toBeGreaterThan(0);
      await expect(row.querySelectorAll('td').length).toBe(3);
    }
    // The package-only distinction from Shape is carried through, and Illustrations says plainly that no external standard governs it.
    await expect(c.getByTestId('prov-Shape & Corners')).toHaveTextContent('Package-only values');
    await expect(c.getByTestId('prov-Illustrations')).toHaveTextContent('no external standard');
    await expect(c.getByTestId('prov-Accessibility')).toHaveTextContent('No conformance is claimed');
  },
};
