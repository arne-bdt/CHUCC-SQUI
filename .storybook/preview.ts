import type { Preview, Decorator } from '@storybook/sveltekit';
import 'carbon-components-svelte/css/all.css';
import './preview.css';
import type { CarbonTheme } from '../src/lib/types';
import { resultsStore } from '../src/lib/stores/resultsStore';
import { queryStore } from '../src/lib/stores/queryStore';

/**
 * Storybook preview configuration for SQUI
 * Integrates Carbon Design System and provides theme switching
 */

/**
 * Store initialization decorator - ensures all stores are properly initialized
 * This prevents "Cannot convert undefined or null to object" errors
 */
const withStoreInit: Decorator = (story, context) => {
  // Reset stores to initial state before each story
  if (typeof window !== 'undefined') {
    try {
      resultsStore.reset();
      queryStore.reset();
    } catch (err) {
      console.warn('Failed to reset stores:', err);
    }
  }

  return story();
};

/**
 * Theme decorator - applies Carbon theme classes to Storybook preview
 * This makes Carbon CSS variables available to all components
 */
const withTheme: Decorator = (story, context) => {
  const theme = (context.globals.theme as CarbonTheme) || 'white';

  // Apply theme to the preview body and update theme store
  if (typeof document !== 'undefined') {
    const body = document.body;

    // Remove all theme classes
    body.classList.remove('white', 'g10', 'g90', 'g100');

    // Add the current theme class
    body.classList.add(theme);

    // Apply to the main Storybook preview container
    const previewBody = document.querySelector('.sb-show-main');
    if (previewBody) {
      previewBody.classList.remove('white', 'g10', 'g90', 'g100');
      previewBody.classList.add(theme);
    }

    // Also apply to the docs root for Docs view
    const docsRoot = document.querySelector('.docs-story');
    if (docsRoot) {
      docsRoot.classList.remove('white', 'g10', 'g90', 'g100');
      docsRoot.classList.add(theme);
    }

    // Sync with our theme store (dynamic import to avoid SSR issues)
    import('../src/lib/stores/theme').then(({ themeStore }) => {
      themeStore.setTheme(theme);
    });
  }

  return story();
};

const preview: Preview = {
  parameters: {
    // Configure controls for automatic arg type inference
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    // Accessibility addon configuration
    a11y: {
      config: {
        rules: [
          {
            // Disable color-contrast rule for now (Carbon handles this)
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
    // Backgrounds configuration synchronized with themes
    backgrounds: {
      default: 'white',
      values: [
        {
          name: 'white',
          value: '#ffffff',
        },
        {
          name: 'g10',
          value: '#f4f4f4',
        },
        {
          name: 'g90',
          value: '#262626',
        },
        {
          name: 'g100',
          value: '#161616',
        },
      ],
    },
    // Docs configuration
    docs: {
      toc: true,
    },
  },
  // Apply decorators - store init first, then theme
  decorators: [withStoreInit, withTheme],
  // Global types for toolbar controls
  globalTypes: {
    theme: {
      name: 'Carbon Theme',
      description: 'Carbon Design System theme',
      defaultValue: 'white',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'white', title: 'White (Light)', left: '🌞' },
          { value: 'g10', title: 'Gray 10 (Light)', left: '☀️' },
          { value: 'g90', title: 'Gray 90 (Dark)', left: '🌙' },
          { value: 'g100', title: 'Gray 100 (Dark)', left: '🌑' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;