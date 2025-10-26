/**
 * Storybook stories for EndpointSelector component
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointSelector from './EndpointSelector.svelte';
import { endpointCatalogue } from '../../stores/endpointStore';

const meta = {
  title: 'Endpoint/EndpointSelector',
  component: EndpointSelector,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current endpoint URL value',
    },
    label: {
      control: 'text',
      description: 'Label for the selector',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    allowCustom: {
      control: 'boolean',
      description: 'Whether to allow adding custom endpoints',
    },
    class: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<EndpointSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - no endpoint selected
 */
export const Default: Story = {
  args: {
    value: '',
    label: 'SPARQL Endpoint',
    placeholder: 'Select or enter SPARQL endpoint',
    disabled: false,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      // Reset catalogue to default
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * With DBpedia selected
 */
export const DBpediaSelected: Story = {
  args: {
    value: 'https://dbpedia.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'Select or enter SPARQL endpoint',
    disabled: false,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * With Wikidata selected
 */
export const WikidataSelected: Story = {
  args: {
    value: 'https://query.wikidata.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'Select or enter SPARQL endpoint',
    disabled: false,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * With UniProt selected
 */
export const UniProtSelected: Story = {
  args: {
    value: 'https://sparql.uniprot.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'Select or enter SPARQL endpoint',
    disabled: false,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * With custom endpoint
 */
export const CustomEndpoint: Story = {
  args: {
    value: 'https://my-custom-endpoint.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'Select or enter SPARQL endpoint',
    disabled: false,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    value: 'https://dbpedia.org/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'Select or enter SPARQL endpoint',
    disabled: true,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * Without custom endpoint support
 */
export const NoCustomEndpoints: Story = {
  args: {
    value: '',
    label: 'SPARQL Endpoint',
    placeholder: 'Select an endpoint',
    disabled: false,
    allowCustom: false,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * Compact (no label)
 */
export const Compact: Story = {
  args: {
    value: '',
    label: '',
    placeholder: 'Select endpoint',
    disabled: false,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};

/**
 * With LOD Cloud selected
 */
export const LODCloudSelected: Story = {
  args: {
    value: 'https://lod.openlinksw.com/sparql',
    label: 'SPARQL Endpoint',
    placeholder: 'Select or enter SPARQL endpoint',
    disabled: false,
    allowCustom: true,
  },
  decorators: [
    (story: any) => {
      endpointCatalogue.reset();
      return story();
    },
  ],
};
