import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|ts|svelte)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    // '@storybook/addon-vitest', // Disabled - causing timeout errors
  ],
  framework: {
    name: '@storybook/sveltekit',
    options: {},
  },
  docs: {},
  typescript: {
    check: true,
    reactDocgen: false,
  },
};

export default config;