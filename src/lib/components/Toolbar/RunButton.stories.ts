/**
 * Storybook stories for RunButton component
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import RunButton from './RunButton.svelte';

const meta = {
  title: 'Toolbar/RunButton',
  component: RunButton,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    class: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<RunButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - ready to execute
 */
export const Default: Story = {
  args: {
    disabled: false,
  },
  parameters: {
    initialQuery: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
    initialEndpoint: 'https://dbpedia.org/sparql',
  },
};

/**
 * Disabled state - no query or endpoint
 */
export const Disabled: Story = {
  args: {
    disabled: false,
  },
  parameters: {
    initialQuery: '',
    initialEndpoint: '',
  },
};

/**
 * Loading state - query is executing
 */
export const Loading: Story = {
  args: {
    disabled: false,
  },
  parameters: {
    initialQuery: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
    initialEndpoint: 'https://dbpedia.org/sparql',
  },
  play: async () => {
    // Note: Setting loading state requires accessing the isolated resultsStore from context
    // For now, this story shows the ready state. To show loading state, we would need to:
    // 1. Add initialLoading prop to StoreProvider, OR
    // 2. Simulate clicking the run button in the play function
    // TODO: Enhance to properly show loading state
  },
};

/**
 * Explicitly disabled
 */
export const ExplicitlyDisabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    initialQuery: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
    initialEndpoint: 'https://dbpedia.org/sparql',
  },
};

/**
 * No query entered
 */
export const NoQuery: Story = {
  args: {
    disabled: false,
  },
  parameters: {
    initialQuery: '',
    initialEndpoint: 'https://dbpedia.org/sparql',
  },
};

/**
 * No endpoint selected
 */
export const NoEndpoint: Story = {
  args: {
    disabled: false,
  },
  parameters: {
    initialQuery: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
    initialEndpoint: '',
  },
};
