import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeImports, optimizeCss } from 'carbon-preprocess-svelte';

export default defineConfig({
  plugins: [
    svelte({
      hot: !process.env.VITEST,
      preprocess: [
        vitePreprocess(),
        optimizeImports(),
        optimizeCss()
      ],
      compilerOptions: {
        // Dynamically set runes based on file path
        runes: undefined
      },
      // Custom configuration per file
      configFile: false,
      // Handle runes per-file
      dynamicCompileOptions({ filename }) {
        // Disable runes for Carbon packages (they use legacy Svelte syntax)
        if (filename?.includes('node_modules/carbon-components-svelte') ||
            filename?.includes('node_modules/carbon-icons-svelte')) {
          return {
            runes: false
          };
        }
        // Enable runes for our code (Svelte 5 mode)
        return {
          runes: true
        };
      }
    })
  ],
  resolve: {
    conditions: ['browser']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
