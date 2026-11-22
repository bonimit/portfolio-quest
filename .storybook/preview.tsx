import type { Preview } from '@storybook/nextjs-vite'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Foundations', ['Overview', 'Accessibility', 'Colors', 'Typography', 'Spacing & Layout', 'Surfaces & Depth', 'Shape & Corners', 'Motion & Animation', 'Icons', 'Illustrations', ['Families', '3D Spot Illustrations']],
          'Components', 'Patterns', 'Templates', 'Design Review', 'Archive',
        ],
      },
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;