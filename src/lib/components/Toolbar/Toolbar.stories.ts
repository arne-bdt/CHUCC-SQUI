import type { Meta, StoryObj } from '@storybook/sveltekit';
import Toolbar from './Toolbar.svelte';

// Define component props interface for TypeScript support
interface ToolbarProps {
  class?: string;
}

/**
 * Top toolbar component for SQUI containing endpoint selector, query controls, and actions.
 * Uses slots for flexible content composition.
 */
const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  argTypes: {
    class: {
      control: 'text',
      description: 'Additional CSS classes to apply to the toolbar',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Toolbar component providing a consistent top bar for controls and actions. Adapts to all 4 Carbon themes.',
      },
    },
  },
} satisfies Meta<ToolbarProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default empty toolbar showing structure.
 * Content should be provided via the default slot.
 */
export const Default: Story = {
  args: {},
};

/**
 * White theme (default Carbon theme).
 * Light background with dark text.
 */
export const WhiteTheme: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'white' },
  },
};

/**
 * Gray 10 theme - light theme variant.
 * Slightly darker background than white theme.
 */
export const G10Theme: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'g10' },
  },
};

/**
 * Gray 90 theme - dark theme.
 * Dark background with light text.
 */
export const G90Theme: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'g90' },
  },
};

/**
 * Gray 100 theme - darkest theme.
 * Darkest background with light text for maximum contrast.
 */
export const G100Theme: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'g100' },
  },
};

/**
 * Toolbar with custom CSS class applied.
 */
export const WithCustomClass: Story = {
  args: {
    class: 'custom-toolbar-class',
  },
};
