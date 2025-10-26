/**
 * Storybook stories for RunButton component
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import RunButton from './RunButton.svelte';
import { queryStore } from '../../stores/queryStore';
import { resultsStore } from '../../stores/resultsStore';
import { defaultEndpoint } from '../../stores/endpointStore';

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
  decorators: [
    (story: any) => {
      // Reset stores before each story
      queryStore.reset();
      resultsStore.reset();
      defaultEndpoint.set('');
      return story();
    },
  ],
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
  decorators: [
    (story: any) => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o } LIMIT 10');
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);
      return story();
    },
  ],
};

/**
 * Disabled state - no query or endpoint
 */
export const Disabled: Story = {
  args: {
    disabled: false,
  },
  decorators: [
    (story: any) => {
      queryStore.setText('');
      defaultEndpoint.set('');
      resultsStore.setLoading(false);
      return story();
    },
  ],
};

/**
 * Loading state - query is executing
 */
export const Loading: Story = {
  args: {
    disabled: false,
  },
  decorators: [
    (story: any) => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o } LIMIT 10');
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(true);
      return story();
    },
  ],
};

/**
 * Explicitly disabled
 */
export const ExplicitlyDisabled: Story = {
  args: {
    disabled: true,
  },
  decorators: [
    (story: any) => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o } LIMIT 10');
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);
      return story();
    },
  ],
};

/**
 * No query entered
 */
export const NoQuery: Story = {
  args: {
    disabled: false,
  },
  decorators: [
    (story: any) => {
      queryStore.setText('');
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);
      return story();
    },
  ],
};

/**
 * No endpoint selected
 */
export const NoEndpoint: Story = {
  args: {
    disabled: false,
  },
  decorators: [
    (story: any) => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o } LIMIT 10');
      defaultEndpoint.set('');
      resultsStore.setLoading(false);
      return story();
    },
  ],
};
