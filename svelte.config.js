import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true
  },
  // Handle legacy packages that don't support Svelte 5 runes
  onwarn: (warning, handler) => {
    // Suppress warnings from Carbon packages about legacy syntax ($$props, $$restProps)
    if (
      warning.filename?.includes('node_modules/carbon-icons-svelte') ||
      warning.filename?.includes('node_modules/carbon-components-svelte')
    ) {
      return;
    }
    handler(warning);
  }
};
