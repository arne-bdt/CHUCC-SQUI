import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: 'src/SparqlQueryUI.svelte',
      name: 'SparqlQueryUI',
      fileName: 'sparql-query-ui'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
