import type { Meta, StoryObj } from '@storybook/sveltekit';
import SplitPane from './SplitPane.svelte';

// Define component props interface for TypeScript support
interface SplitPaneProps {
  initialSplit?: number;
  minTopHeight?: number;
  minBottomHeight?: number;
  class?: string;
}

/**
 * A resizable split pane component that divides the layout into top and bottom sections
 * with a draggable divider. Uses Svelte 5 runes for reactivity.
 */
const meta = {
  title: 'Layout/SplitPane',
  component: SplitPane,
  tags: ['autodocs'],
  argTypes: {
    initialSplit: {
      control: { type: 'range', min: 0.1, max: 0.9, step: 0.1 },
      description: 'Initial split ratio (0-1) - percentage of total height for top pane',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0.5' },
      },
    },
    minTopHeight: {
      control: { type: 'number', min: 50, max: 500, step: 10 },
      description: 'Minimum height for top pane in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '200' },
      },
    },
    minBottomHeight: {
      control: { type: 'number', min: 50, max: 500, step: 10 },
      description: 'Minimum height for bottom pane in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '150' },
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Resizable split pane component with draggable divider. Supports keyboard navigation and ARIA attributes for accessibility.',
      },
    },
  },
} satisfies Meta<SplitPaneProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default 50/50 split between top and bottom panes.
 * Drag the divider to resize panes interactively.
 */
export const Default: Story = {
  args: {
    initialSplit: 0.5,
    minTopHeight: 200,
    minBottomHeight: 150,
  },
};

/**
 * Top-heavy layout with 70% allocated to the top pane.
 * Useful for editor-focused workflows.
 */
export const TopHeavy: Story = {
  args: {
    initialSplit: 0.7,
    minTopHeight: 200,
    minBottomHeight: 150,
  },
};

/**
 * Bottom-heavy layout with 70% allocated to the bottom pane.
 * Useful for results-focused views.
 */
export const BottomHeavy: Story = {
  args: {
    initialSplit: 0.3,
    minTopHeight: 200,
    minBottomHeight: 150,
  },
};

/**
 * Enforces strict minimum heights for both panes.
 * Try dragging - it won't let panes become smaller than minimums.
 */
export const WithConstraints: Story = {
  args: {
    initialSplit: 0.5,
    minTopHeight: 300,
    minBottomHeight: 250,
  },
};

/**
 * Dark theme variant (G90).
 * Divider colors adapt to Carbon Design System theme variables.
 */
export const DarkTheme: Story = {
  args: {
    initialSplit: 0.5,
  },
  parameters: {
    backgrounds: { default: 'g90' },
  },
};
