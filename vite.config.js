import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: vitePreprocess(),
      compilerOptions: {
        // Dynamically set runes based on file path
        runes: undefined
      },
      // Custom configuration per file
      configFile: false,
      // Handle runes per-file
      dynamicCompileOptions({ filename }) {
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
    })
  ],
  optimizeDeps: {
    exclude: ['carbon-components-svelte', 'carbon-icons-svelte']
  },
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
