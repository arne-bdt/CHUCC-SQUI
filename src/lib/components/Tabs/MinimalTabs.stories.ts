import type { Meta, StoryObj } from '@storybook/svelte';
import MinimalTabs from './MinimalTabs.svelte';

/**
 * Minimal Tabs Component - Foundation for Tab Rebuild
 *
 * This is the first step in rebuilding the tab system to isolate
 * the tab switching bug. It only includes basic tab functionality
 * with no editor, toolbar, or results.
 */
const meta = {
  title: 'TabRebuild/01-MinimalTabs',
  component: MinimalTabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Minimal tabs component for testing basic tab switching functionality. ' +
          'Features include adding new tabs, closing tabs, and switching between tabs.',
      },
      // Disable automatic table of contents to prevent errors when tabs switch
      toc: {
        disable: true,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (story) => {
      // Clear localStorage before each story
      localStorage.clear();
      return story();
    },
  ],
} satisfies Meta<MinimalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with one tab
 */
export const Default: Story = {
  name: 'Default (Single Tab)',
  args: {
    instanceId: 'story-default',
  } as any,
  parameters: {
    docs: {
      description: {
        story: 'Initial state with one tab. Close button is hidden when only one tab exists.',
      },
    },
  },
};

/**
 * Multiple tabs for testing tab switching
 */
export const MultipleTabs: Story = {
  name: 'Multiple Tabs',
  args: {
    instanceId: 'story-multiple',
  } as any,
  parameters: {
    docs: {
      description: {
        story:
          'Click the "+" button to add new tabs, then click between tabs to verify switching works correctly. ' +
          'The tab content area should display the correct tab ID for each tab.',
      },
    },
  },
};
