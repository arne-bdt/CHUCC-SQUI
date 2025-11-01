import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeImports, optimizeCss } from 'carbon-preprocess-svelte';

export default {
  preprocess: [
    vitePreprocess(),
    optimizeImports(),
    optimizeCss()
  ],
  compilerOptions: {
    runes: true
  },
  kit: {
    // Configure @sveltejs/package for library packaging
    package: {
      dir: 'package',
      exports: (filepath) => {
        // Export all .ts and .svelte files except stories, tests, and examples
        if (filepath.endsWith('.stories.ts')) return false;
        if (filepath.includes('test')) return false;
        if (filepath.includes('spec')) return false;
        return filepath.endsWith('.ts') || filepath.endsWith('.svelte');
      },
      files: (filepath) => {
        // Include all relevant files
        return !filepath.includes('node_modules');
      }
    }
  }
};
