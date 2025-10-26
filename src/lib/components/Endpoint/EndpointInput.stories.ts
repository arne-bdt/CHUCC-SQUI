/**
 * Storybook stories for EndpointInput component
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointInput from './EndpointInput.svelte';

const meta = {
  title: 'Endpoint/EndpointInput',
  component: EndpointInput,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current endpoint URL value',
    },
    label: {
      control: 'text',
      description: 'Label for the input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    validateOnBlur: {
      control: 'boolean',
      description: 'Whether to validate on blur',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    class: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<EndpointInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - empty input
 */
export const Default: Story = {
  args: {
    value: '',
    label: 'SPARQL Endpoint',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: true,
    disabled: false,
  },
};

/**
 * With valid HTTPS endpoint
 */
export const WithValidEndpoint: Story = {
  args: {
    value: 'https://dbpedia.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: true,
    disabled: false,
  },
};

/**
 * With HTTP endpoint (should show warning)
 */
export const WithHttpEndpoint: Story = {
  args: {
    value: 'http://example.com/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: true,
    disabled: false,
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    value: 'https://dbpedia.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: true,
    disabled: true,
  },
};

/**
 * Custom label
 */
export const CustomLabel: Story = {
  args: {
    value: '',
    label: 'Enter your SPARQL endpoint URL',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: true,
    disabled: false,
  },
};

/**
 * Without validation on blur
 */
export const NoValidationOnBlur: Story = {
  args: {
    value: '',
    label: 'SPARQL Endpoint',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: false,
    disabled: false,
  },
};

/**
 * With Wikidata endpoint
 */
export const WikidataEndpoint: Story = {
  args: {
    value: 'https://query.wikidata.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: true,
    disabled: false,
  },
};

/**
 * With UniProt endpoint
 */
export const UniProtEndpoint: Story = {
  args: {
    value: 'https://sparql.uniprot.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'https://example.com/sparql',
    validateOnBlur: true,
    disabled: false,
  },
};
