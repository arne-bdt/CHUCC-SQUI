/**
 * Storybook stories for DatasetInfo component
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import DatasetInfo from './DatasetInfo.svelte';
import type { Dataset } from '$lib/types/serviceDescription';

const meta = {
  title: 'Components/Capabilities/DatasetInfo',
  component: DatasetInfo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<DatasetInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDatasets: Dataset[] = [
  {
    uri: 'http://dbpedia.org',
    defaultGraphs: [
      {
        uri: 'http://dbpedia.org/resource',
        entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
        metadata: {
          'http://rdfs.org/ns/void#triples': 3458921,
        },
      },
    ],
    namedGraphs: [
      {
        name: 'http://dbpedia.org/graph/ontology',
        entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
        metadata: {
          'http://rdfs.org/ns/void#triples': 45678,
        },
      },
      {
        name: 'http://dbpedia.org/graph/en',
        metadata: {
          'http://rdfs.org/ns/void#triples': 1234567,
        },
      },
      {
        name: 'http://dbpedia.org/graph/de',
        metadata: {
          'http://rdfs.org/ns/void#triples': 987654,
        },
      },
    ],
  },
];

const mockMultipleDatasets: Dataset[] = [
  {
    uri: 'http://example.org/dataset1',
    defaultGraphs: [],
    namedGraphs: [
      {
        name: 'http://example.org/graph1',
        entailmentRegime: 'http://www.w3.org/ns/entailment/RDF',
        metadata: {
          'http://rdfs.org/ns/void#triples': 50000,
        },
      },
      {
        name: 'http://example.org/graph2',
        metadata: {
          'http://rdfs.org/ns/void#triples': 25000,
        },
      },
    ],
  },
  {
    uri: 'http://example.org/dataset2',
    defaultGraphs: [
      {
        uri: 'http://example.org/default',
        metadata: {
          'http://rdfs.org/ns/void#triples': 100000,
        },
      },
    ],
    namedGraphs: [
      {
        name: 'http://example.org/graph3',
        entailmentRegime: 'http://www.w3.org/ns/entailment/OWL-RDF-Based',
        metadata: {
          'http://rdfs.org/ns/void#triples': 75000,
        },
      },
    ],
  },
];

const mockSimpleDataset: Dataset[] = [
  {
    defaultGraphs: [],
    namedGraphs: [
      {
        name: 'http://example.org/graph1',
      },
    ],
  },
];

export const SingleDataset: Story = {
  args: {
    datasets: mockDatasets,
  },
};

export const MultipleDatasets: Story = {
  args: {
    datasets: mockMultipleDatasets,
  },
};

export const SimpleDataset: Story = {
  args: {
    datasets: mockSimpleDataset,
  },
};

export const NoDatasets: Story = {
  args: {
    datasets: [],
  },
};
