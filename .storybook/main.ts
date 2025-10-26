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
  async viteFinal(config) {
    // Exclude Carbon packages from optimization to prevent runes mode conflicts
    // Carbon components use legacy Svelte syntax ($$props, $$restProps) incompatible with Svelte 5 runes
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
    config.optimizeDeps.exclude.push('carbon-components-svelte', 'carbon-icons-svelte');

    return config;
  },
};

export default config;