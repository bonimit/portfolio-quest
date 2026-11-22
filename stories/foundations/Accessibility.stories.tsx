import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';
import {A11yPage, ContrastEvidence, Disclaimer, FocusRings, RulesTable, TouchTargets, VerificationStatus} from './accessibility/Accessibility';
import {CHECKS, MATERIAL_TARGET, PAIRS, RULES, WCAG, contrastEvidence, sc} from './accessibility/accessibility-model';
import {contrastRatio} from './color-math';
import {MODES, carbonColor} from './carbon/carbon-model';

/*
 * Foundations / Accessibility: guidance for every foundation. Official criterion text comes only from accessibility/wcag.json (generated from
 * w3.org with asserted thresholds). Measured values are computed from the foundations' own models. NOT a conformance claim.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Foundations/Accessibility', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Guidelines: Story = {
  render: () => <A11yPage title="Accessibility guidelines"><Disclaimer /><RulesTable /></A11yPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('a11y-disclaimer')).toHaveTextContent('not a conformance claim');
    // Every rule has our adaptation; every cited criterion exists in the generated file with its level.
    for (const r of RULES) {
      await expect(c.getByTestId(`rule-${r.id}`)).toBeVisible();
      for (const id of r.official ?? []) { await expect(wcag(id)).toBeTruthy(); await expect(c.getByTestId(`rule-${r.id}`)).toHaveTextContent(`WCAG 2.2 ${sc(id).number}`); }
    }
    // The numbers come from the verified file, not from memory.
    await expect(sc('target-size-minimum').text).toContain('24 by 24 CSS pixels');
    await expect(sc('target-size-enhanced').text).toContain('44 by 44 CSS pixels');
    await expect(sc('contrast-minimum').text).toContain('4.5:1');
    await expect(sc('animation-from-interactions').level).toBe('AAA');
    await expect(WCAG.criteria.length).toBe(15);
    // Material's 48 is a package value, tagged as such, and not a WCAG number.
    await expect(c.getByTestId('rule-target-material')).toHaveTextContent('Material package value');
    await expect(c.getByTestId('rule-target-material')).toHaveTextContent('NOT decided');
  },
};
const wcag = (id: string) => WCAG.criteria.find(x => x.id === id);

export const ContrastEvidenceStory: Story = {
  name: 'Contrast Evidence',
  render: () => <A11yPage title="Contrast evidence (both modes)"><ContrastEvidence /></A11yPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(PAIRS.length).toBeGreaterThanOrEqual(10);
    for (const mode of MODES) {
      const rows = contrastEvidence(mode);
      await expect(rows.length).toBe(PAIRS.length);
      for (const [i, r] of rows.entries()) {
        await expect(Number.isFinite(r.result.ratio)).toBe(true);
        await expect(c.getByTestId(`pair-${i}-${mode}`)).toHaveTextContent(`${r.result.ratio.toFixed(2)}:1`);
        // Text grade words are present (not color alone).
        await expect(c.getByTestId(`pair-${i}-${mode}`)).toHaveTextContent(/Pass|Fail|Large text only/);
      }
    }
    // An independent recomputation of one pair agrees with the page.
    const rows = contrastEvidence('light');
    const direct = contrastRatio(carbonColor('light', 'textPrimary'), carbonColor('light', 'background'));
    await expect(rows[0].result.ratio).toBeCloseTo(direct, 5);
    // The two modes really produce different ratios somewhere.
    await expect(contrastEvidence('dark').map(r => r.result.ratio.toFixed(2)).join()).not.toBe(rows.map(r => r.result.ratio.toFixed(2)).join());
    // The known open question stays flagged.
    await expect(c.getByTestId('contrast-table')).toHaveTextContent('Open: orange as text');
  },
};

export const TouchTargetsStory: Story = {
  name: 'Touch Targets',
  render: () => <A11yPage title="Touch targets"><TouchTargets /></A11yPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const px of [24, 44, MATERIAL_TARGET]) { const r = c.getByTestId(`target-${px}`).getBoundingClientRect(); await expect([Math.round(r.width), Math.round(r.height)]).toEqual([px, px]); }
    await expect(Math.round(c.getByTestId('target-chip').getBoundingClientRect().height)).toBe(32);
    await expect(c.getByText(/not decided/)).toBeVisible();
  },
};

export const FocusRingsStory: Story = {
  name: 'Focus Rings',
  render: () => <A11yPage title="Focus rings"><FocusRings /></A11yPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    for (const mode of MODES) {
      for (const part of ['btn', 'chip', 'field']) {
        const el = c.getByTestId(`ring-${part}-${mode}`);
        const s = getComputedStyle(el);
        await expect(s.outlineWidth).toBe('3px');
        await expect(s.outlineStyle).toBe('solid');
        await expect(s.outlineOffset).toBe('3px');
      }
      await expect(getComputedStyle(c.getByTestId(`ring-btn-${mode}`)).borderTopLeftRadius).toBe('9999px');
    }
    // The ring color is the focus token and it differs between modes.
    await expect(getComputedStyle(c.getByTestId('ring-btn-light')).outlineColor).not.toBe(getComputedStyle(c.getByTestId('ring-btn-dark')).outlineColor);
  },
};

export const VerificationStatusStory: Story = {
  name: 'Verification Status',
  render: () => <A11yPage title="What was and was not checked"><VerificationStatus /></A11yPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    await expect(CHECKS.some(x => x.status === 'not-run')).toBe(true);
    await expect(c.getByTestId('checks-table')).toHaveTextContent('Not run');
    await expect(c.getByTestId('checks-table')).toHaveTextContent('None is claimed');
    await expect(c.getAllByTestId('check-not-run').length).toBe(CHECKS.filter(x => x.status === 'not-run').length);
  },
};
