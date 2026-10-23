import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // `npm run story <name>` (scripts/story.mjs) narrows Storybook to the matching stories files.
  stories: process.env.STORYBOOK_ONLY
    ? process.env.STORYBOOK_ONLY.split(",").map((file) => `../${file}`)
    : ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-themes", "@storybook/addon-vitest", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
};

export default config;
