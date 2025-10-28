import type { Meta, StoryObj } from '@storybook/svelte';
import QueryTabs from './QueryTabs.svelte';
import { tabStore } from '../../stores/tabStore';

/**
 * Query Tabs Component Stories
 *
 * Demonstrates the tabbed interface for managing multiple SPARQL queries.
 * Each tab maintains isolated state for query text, endpoint, and results.
 */
const meta = {
  title: 'Components/Tabs/QueryTabs',
  component: QueryTabs,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'QueryTabs provides a tabbed interface for managing multiple SPARQL queries. ' +
          'Features include adding new tabs, closing tabs, switching between tabs, and ' +
          'automatic persistence to localStorage.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (story) => {
      // Reset tab store before each story
      tabStore.reset();
      localStorage.clear();
      return story();
    },
  ],
} satisfies Meta<QueryTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with one tab
 */
export const Default: Story = {
  name: 'Default (Single Tab)',
  parameters: {
    docs: {
      description: {
        story: 'Initial state with one tab. Close button is hidden when only one tab exists.',
      },
    },
  },
};

/**
 * Multiple tabs
 */
export const MultipleTabs: Story = {
  name: 'Multiple Tabs',
  parameters: {
    docs: {
      description: {
        story:
          'Multiple tabs with close buttons visible. ' +
          'Users can switch between tabs and close any tab except the last one. ' +
          'Click the "+" button to add new tabs.',
      },
    },
  },
};

/**
 * Tab with query content
 */
export const WithQueryContent: Story = {
  name: 'Tab with Query',
  parameters: {
    docs: {
      description: {
        story:
          'Tab with query content. Each tab maintains separate query state. ' +
          'Tab state is tested in integration tests.',
      },
    },
  },
};

/**
 * Dark theme
 */
export const DarkTheme: Story = {
  name: 'Dark Theme (G90)',
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story:
          'QueryTabs in dark theme (G90). All interactive elements maintain proper contrast. ' +
          'Click the "+" button to add tabs and see the dark theme styling.',
      },
    },
  },
  decorators: [
    (story) => {
      const container = document.createElement('div');
      container.className = 'g90';
      container.style.minHeight = '200px';
      container.style.backgroundColor = 'var(--cds-background, #262626)';
      return story();
    },
  ],
};

/**
 * Accessibility test
 */
export const AccessibilityTest: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story:
          'Tests keyboard navigation and screen reader support. ' +
          'All actions are accessible via keyboard and properly labeled for screen readers. ' +
          'Accessibility is tested in integration tests.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'aria-allowed-attr',
            enabled: true,
          },
        ],
      },
    },
  },
};
