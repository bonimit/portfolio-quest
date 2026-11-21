import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  core: { disableTelemetry: true },
  // Catalog cleared at the owner's request. Source files are retained.
  // Foundations / Colors is the only section listed; Example and Review stories stay out of the catalog.
  stories: [
    "./empty/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../stories/foundations/**/*.stories.@(ts|tsx)"
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