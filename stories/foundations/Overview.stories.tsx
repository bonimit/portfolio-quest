import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';
import {FOUNDATIONS, OverviewPage, SPEC_MOTION, SPEC_ROLES, prefixCount} from './overview/Overview';
import {spacingVars} from './spacing/spacing-model';

/*
 * Foundations / Overview: how all foundations work together. A composed specimen renders color, depth, spacing, type, shape, motion and icons
 * in Carbon White and Gray 100 from each foundation's own model. Documentation only.
 */
const specimenA11y = {test: 'todo', config: {rules: [{id: 'color-contrast', enabled: false}]}} as const;
const meta = {title: 'Foundations/Overview', parameters: {layout: 'fullscreen', a11y: specimenA11y}} satisfies Meta;
export default meta;
type Story = StoryObj;

const cs = (el: Element) => getComputedStyle(el);

export const HowFoundationsFit: Story = {
  name: 'How the foundations fit together',
  render: () => <OverviewPage />,
  play: async ({canvasElement}) => {
    const c = within(canvasElement);
    // One row per foundation, each with a distinct prefix that exists in source.
    await expect(new Set(FOUNDATIONS.map(f => f.prefix)).size).toBe(FOUNDATIONS.length);
    for (const f of FOUNDATIONS) { await expect(c.getByTestId(`map-${f.prefix}`)).toBeVisible(); await expect(prefixCount(f.prefix)).toBeGreaterThan(0); }
    await expect(c.getByTestId('overview-decided').children.length).toBe(4);
    const sp = spacingVars('medium', 'px');
    for (const mode of ['light', 'dark'] as const) {
      const btn = c.getByTestId(`spec-btn-${mode}`), chip = c.getByTestId(`spec-chip-${mode}`), field = c.getByTestId(`spec-field-${mode}`), menu = c.getByTestId(`spec-menu-${mode}`), panel = c.getByTestId(`spec-panel-${mode}`);
      // Shape (Option M): pill button, 8px chip, 4px outlined input, 4px menu; the preserved panel declares no radius.
      await expect(cs(btn).borderTopLeftRadius).toBe('9999px');
      await expect(cs(chip).borderTopLeftRadius).toBe('8px');
      await expect(cs(field).borderTopLeftRadius).toBe('4px');
      await expect(cs(menu).borderTopLeftRadius).toBe('4px');
      await expect(cs(panel).borderTopLeftRadius).toBe('0px');
      // Spacing: heights and padding are the spacing tokens' values.
      await expect(cs(btn).minHeight).toBe(sp['--pqx-button-height']);
      await expect(cs(chip).minHeight).toBe(sp['--pqx-chip-height']);
      await expect(cs(c.getByTestId(`spec-card-${mode}`)).paddingTop).toBe(sp['--pqx-card-padding']);
      // Typography: the title is Material title-large.
      await expect(cs(c.getByTestId(`spec-title-${mode}`)).fontSize).toBe(`${SPEC_ROLES.title.sizePx}px`);
      // Motion: the button transition uses the short4 duration.
      await expect(cs(btn).transitionDuration).toBe(`${SPEC_MOTION.duration.ms / 1000}s`);
      // Depth: the menu has a floating shadow.
      await expect(cs(menu).boxShadow).not.toBe('none');
    }
    // Color differs between the modes; shape, spacing and motion do not.
    const L = c.getByTestId('spec-btn-light'), D = c.getByTestId('spec-btn-dark');
    await expect(cs(L).backgroundColor).not.toBe(cs(D).backgroundColor);
    await expect(cs(c.getByTestId('spec-card-light')).backgroundColor).not.toBe(cs(c.getByTestId('spec-card-dark')).backgroundColor);
    for (const prop of ['borderTopLeftRadius', 'minHeight', 'transitionDuration'] as const) await expect(cs(L)[prop]).toBe(cs(D)[prop]);
    await expect(cs(c.getByTestId('spec-menu-light')).borderTopLeftRadius).toBe(cs(c.getByTestId('spec-menu-dark')).borderTopLeftRadius);
  },
};
