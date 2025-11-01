import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeImports, optimizeCss } from 'carbon-preprocess-svelte';

export default defineConfig({
  plugins: [
    svelte({
      hot: false,
      preprocess: [vitePreprocess(), optimizeImports(), optimizeCss()],
      compilerOptions: {
        runes: undefined,
      },
      configFile: false,
      dynamicCompileOptions({ filename }) {
        if (
          filename?.includes('node_modules/carbon-components-svelte') ||
          filename?.includes('node_modules/carbon-icons-svelte')
        ) {
          return { runes: false };
        }
        return { runes: true };
      },
    }),
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
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/tests/e2e/**'
    ],
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
