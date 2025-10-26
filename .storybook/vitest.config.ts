/**
 * Vitest configuration for Storybook addon-vitest
 * Enables "Run tests" button in Storybook UI
 *
 * Docs: https://storybook.js.org/docs/writing-tests/vitest-plugin
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/plugin';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeImports, optimizeCss } from 'carbon-preprocess-svelte';

export default defineConfig({
  plugins: [
    storybookTest({
      // Storybook configuration directory
      configDir: '.storybook',
      // Tags to include/exclude from tests
      tags: {
        include: ['test', 'autodocs'],
        exclude: ['skip-test'],
      },
    }),
    svelte({
      hot: false,
      preprocess: [vitePreprocess(), optimizeImports(), optimizeCss()],
      compilerOptions: {
        runes: undefined,
      },
      configFile: false,
      dynamicCompileOptions({ filename }) {
        // Disable runes for Carbon packages
        if (
          filename?.includes('node_modules/carbon-components-svelte') ||
          filename?.includes('node_modules/carbon-icons-svelte')
        ) {
          return { runes: false };
        }
        // Enable runes for our code
        return { runes: true };
      },
    }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
    },
    // Inherit setup from main vitest config
    setupFiles: ['../tests/setup.ts'],
    globals: true,
  },
});
