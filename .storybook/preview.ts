import type { Preview } from '@storybook/sveltekit';
import 'carbon-components-svelte/css/all.css';

/**
 * Storybook preview configuration for SQUI
 * Integrates Carbon Design System and provides theme switching
 */
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
    // Backgrounds configuration for testing themes
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
  // Global decorators
  decorators: [
    (Story, context) => {
      // Apply Carbon theme class based on background
      const theme = context.globals.backgrounds?.value || 'white';
      let themeClass = 'white';

      if (theme.includes('#f4f4f4') || context.parameters.backgrounds?.default === 'g10') {
        themeClass = 'g10';
      } else if (theme.includes('#262626') || context.parameters.backgrounds?.default === 'g90') {
        themeClass = 'g90';
      } else if (theme.includes('#161616') || context.parameters.backgrounds?.default === 'g100') {
        themeClass = 'g100';
      }

      return {
        Component: Story,
        props: {
          ...context.args,
        },
        context: {
          ...context,
          themeClass,
        },
      };
    },
  ],
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