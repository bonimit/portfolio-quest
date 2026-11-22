import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';
import {PREFIX_OWNER, ReviewPage, TokenVerification, injectedNames, resolveReferences} from './DesignReview';
import verification from './token-verification.json';

/*
 * Design Review / Token Verification: shared token usage across all foundations. The static scan comes from generate-token-verification.mjs;
 * remaining names are resolved at runtime from the real injectors, so nothing is guessed.
 */
const meta = {title: 'Design Review/Token Verification', parameters: {layout: 'fullscreen', a11y: {test: 'todo'}}} satisfies Meta;
export default meta;
type Story = StoryObj;

export const SharedTokens: Story = {
  name: 'Shared token usage',
  render: () => <ReviewPage title="Shared token verification"><TokenVerification /></ReviewPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // No hex literals in any scanned foundation source.
    await expect(verification.hex.length).toBe(0);
    await expect(verification.filesScanned).toBeGreaterThan(30);
    // Every prefix has an owner (no unassigned prefix).
    for (const p of Object.keys(verification.prefixes)) await expect(PREFIX_OWNER[p]).toBeTruthy();
    // The injectors really produce names for the shared foundations.
    const names = injectedNames();
    for (const prefix of ['--pqc-', '--pqs-', '--pqx-', '--pqr-']) await expect([...names].some(n => n.startsWith(prefix))).toBe(true);
    // Every referenced custom property resolves.
    const {unresolved} = resolveReferences();
    await expect(unresolved.map(u => u.name)).toEqual([]);
    await expect(c.getByTestId('unresolved-count')).toHaveTextContent('0 unresolved');
    await expect(c.getByTestId('unresolved-none')).toBeVisible();
    // Dark and light checks are described, and the Island / Arcade / Neon themes are named as independent.
    await expect(c.getByTestId('mode-checks')).toHaveTextContent('Island, Arcade and Neon');
    // The committed specimens that disagree with Option M are surfaced instead of hidden.
    await expect(c.getByTestId('specimen-diffs')).toBeVisible();
  },
};
