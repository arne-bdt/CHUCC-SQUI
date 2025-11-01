import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { optimizeImports, optimizeCss } from 'carbon-preprocess-svelte';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    svelte({
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
    }),
    // Bundle analyzer (only in production build with ANALYZE=true)
    mode === 'production' && process.env.ANALYZE === 'true' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['carbon-components-svelte', 'carbon-icons-svelte']
  },
  build: {
    lib: {
      entry: 'src/SparqlQueryUI.svelte',
      name: 'SparqlQueryUI',
      fileName: 'sparql-query-ui'
    },
    // Performance optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
      }
    },
    // Rollup configuration for library build
    rollupOptions: {
      // Library builds inline all dependencies
      // For app builds, we could split chunks, but not for lib mode
    },
    // Performance budgets
    chunkSizeWarningLimit: 500 // 500KB warning
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
}));
