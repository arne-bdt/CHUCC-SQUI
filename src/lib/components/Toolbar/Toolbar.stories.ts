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
 * Use the theme toolbar (paintbrush icon) to test different themes.
 */
export const Default: Story = {
  args: {},
};

/**
 * Toolbar with custom CSS class applied.
 */
export const WithCustomClass: Story = {
  args: {
    class: 'custom-toolbar-class',
  },
};
