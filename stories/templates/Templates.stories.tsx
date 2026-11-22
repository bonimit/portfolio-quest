import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, within} from 'storybook/test';

/*
 * Templates — placeholder section. Nothing here is built. Component development starts only after the foundations are approved
 * (see Design Review / Open Decisions). No component, migration or Figma work is started by this page.
 */
const meta = {title: 'Templates/Overview', parameters: {layout: 'fullscreen'}} satisfies Meta;
export default meta;
type Story = StoryObj;

export const NotStarted: Story = {
  name: 'Not started',
  render: () => (
    <main style={{padding: '1.5rem', maxWidth: '44rem', font: '1rem/1.5 system-ui, sans-serif'}} data-testid="placeholder">
      <h1>Templates</h1>
      <p><strong>Not started.</strong> This section is reserved. Foundations come first; Templates are built on them only after the owner approves the foundations and the open decisions in Design Review.</p>
      <p>Nothing in this section is a design, an approved component or a migration plan.</p>
    </main>
  ),
  play: async ({canvasElement}) => {
    await expect(within(canvasElement).getByTestId('placeholder')).toHaveTextContent('Not started');
  },
};
