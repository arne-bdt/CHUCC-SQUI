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
  }
};
