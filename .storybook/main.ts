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
    // Exclude Carbon packages from optimization
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
    config.optimizeDeps.exclude.push('carbon-components-svelte', 'carbon-icons-svelte');

    return config;
  },
  svelteOptions: {
    configFile: false,
    // Handle runes per-file
    dynamicCompileOptions({ filename }: { filename: string }) {
      // Disable runes for Carbon packages
      if (filename?.includes('node_modules/carbon-components-svelte') ||
          filename?.includes('node_modules/carbon-icons-svelte')) {
        return {
          runes: false
        };
      }
      // Enable runes for our code
      return {
        runes: true
      };
    }
  },
};

export default config;