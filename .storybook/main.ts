import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  core: { disableTelemetry: true },
  // Catalog sections, in sidebar order (see storySort in preview.tsx): Foundations, Components, Patterns, Templates, Design Review, Archive.
  // Archive stories live in stories/foundations with an `Archive/` title so their history is kept. Installer Example stories and the
  // gated component-family reviews under stories/review stay out of the catalog.
  stories: [
    "./empty/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/foundations/**/*.stories.@(ts|tsx)",
    "../stories/components/**/*.stories.@(ts|tsx)",
    "../stories/patterns/**/*.stories.@(ts|tsx)",
    "../stories/templates/**/*.stories.@(ts|tsx)",
    "../stories/design-review/**/*.stories.@(ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public"
  ]
};
export default config;