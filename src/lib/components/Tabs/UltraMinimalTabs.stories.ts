import type { Meta, StoryObj } from '@storybook/svelte';
import UltraMinimalTabs from './UltraMinimalTabs.svelte';

/**
 * Ultra Minimal Tabs - Absolute bare minimum for isolating the bug
 *
 * This component removes EVERYTHING except:
 * - Carbon Tabs component
 * - 3 hardcoded tabs
 * - Click to switch
 * - Display active tab
 *
 * No add button, no close button, no store, no event.stopPropagation()
 * PURE tab switching test.
 */
const meta = {
  title: 'TabRebuild/00-UltraMinimal',
  component: UltraMinimalTabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Ultra-minimal tabs component with only 3 hardcoded tabs. ' +
          'No add/close functionality, no store, just pure tab switching. ' +
          'This is the absolute minimum to test if Carbon Tabs change event works.',
      },
      // Disable automatic table of contents to prevent errors when tabs switch
      toc: {
        disable: true,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<UltraMinimalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - Just click between tabs
 */
export const Default: Story = {
  name: 'Three Static Tabs',
  args: {} as any,
  parameters: {
    docs: {
      description: {
        story:
          'Click between Tab 1, Tab 2, and Tab 3. ' +
          'Watch the console for "Carbon Tabs change event" logs. ' +
          'Check if the "Active Tab" heading and content update correctly.',
      },
    },
  },
};
