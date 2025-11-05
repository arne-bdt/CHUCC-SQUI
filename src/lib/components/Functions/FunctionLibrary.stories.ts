import type { Meta, StoryObj } from '@storybook/svelte';
import FunctionLibrary from './FunctionLibrary.svelte';
import type { ExtensionFunction, ExtensionAggregate } from '$lib/types';
import { serviceDescriptionStore } from '$lib/stores/serviceDescriptionStore';

const meta = {
  title: 'Components/Functions/FunctionLibrary',
  component: FunctionLibrary,
  tags: ['autodocs'],
  argTypes: {
    currentEndpoint: { control: 'text' },
    onInsertFunction: { action: 'insertFunction' },
  },
} satisfies Meta<FunctionLibrary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockFunctions: ExtensionFunction[] = [
  {
    uri: 'http://jena.apache.org/ARQ/function#now',
    label: 'Current Time',
    comment: 'Returns the current date and time',
    returnType: 'xsd:dateTime',
  },
  {
    uri: 'http://jena.apache.org/ARQ/function#version',
    label: 'ARQ Version',
    comment: 'Returns the ARQ version string',
    returnType: 'xsd:string',
  },
  {
    uri: 'http://example.org/geo#distance',
    label: 'Geographic Distance',
    comment: 'Calculates distance between two geographic points',
    parameters: [
      { name: 'point1', type: 'geo:Point' },
      { name: 'point2', type: 'geo:Point' },
    ],
    returnType: 'xsd:double',
    documentationUrl: 'https://example.org/docs/geo/distance',
  },
  {
    uri: 'http://jena.apache.org/text#query',
    label: 'Full-Text Search',
    comment: 'Performs full-text search against indexed literals',
    parameters: [
      { name: 'property', type: 'rdf:Property' },
      { name: 'query', type: 'xsd:string' },
      { name: 'limit', type: 'xsd:integer', optional: true },
    ],
    returnType: 'xsd:boolean',
    examples: [
      `PREFIX text: <http://jena.apache.org/text#>
SELECT ?s WHERE {
  ?s text:query (rdfs:label "sparql") .
}`,
    ],
    documentationUrl: 'https://jena.apache.org/documentation/query/text-query.html',
  },
  {
    uri: 'http://example.org/math#sqrt',
    label: 'Square Root',
    comment: 'Calculates the square root of a number',
    parameters: [{ name: 'value', type: 'xsd:double' }],
    returnType: 'xsd:double',
  },
];

const mockAggregates: ExtensionAggregate[] = [
  {
    uri: 'http://jena.apache.org/ARQ/function#median',
    label: 'Median',
    comment: 'Calculates the median value of a set',
    parameters: [{ name: 'expr' }],
    returnType: 'xsd:double',
  },
  {
    uri: 'http://example.org/stats#stdev',
    label: 'Standard Deviation',
    comment: 'Calculates the standard deviation of a set of values',
    parameters: [{ name: 'expr' }],
    returnType: 'xsd:double',
  },
];

const mockEndpoint = 'http://localhost:3030/dataset/sparql';

export const WithFunctions: Story = {
  args: {
    currentEndpoint: mockEndpoint,
  },
  play: async () => {
    // Set up mock service description with functions
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set(mockEndpoint, {
        endpoint: mockEndpoint,
        supportedLanguages: [],
        features: [],
        resultFormats: [],
        inputFormats: [],
        extensionFunctions: mockFunctions,
        extensionAggregates: mockAggregates,
        datasets: [],
        lastFetched: new Date(),
        available: true,
      });
      return {
        ...state,
        descriptions,
        currentEndpoint: mockEndpoint,
      };
    });
  },
};

export const EmptyFunctions: Story = {
  args: {
    currentEndpoint: 'http://localhost:3030/empty/sparql',
  },
  play: async () => {
    const endpoint = 'http://localhost:3030/empty/sparql';
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set(endpoint, {
        endpoint,
        supportedLanguages: [],
        features: [],
        resultFormats: [],
        inputFormats: [],
        extensionFunctions: [],
        extensionAggregates: [],
        datasets: [],
        lastFetched: new Date(),
        available: true,
      });
      return {
        ...state,
        descriptions,
        currentEndpoint: endpoint,
      };
    });
  },
};

export const ManyFunctions: Story = {
  args: {
    currentEndpoint: 'http://localhost:3030/many/sparql',
  },
  play: async () => {
    const endpoint = 'http://localhost:3030/many/sparql';
    // Generate many functions for testing scrolling and search
    const manyFunctions: ExtensionFunction[] = [];
    const namespaces = ['math', 'string', 'geo', 'text', 'date'];
    const operations = [
      'add',
      'subtract',
      'multiply',
      'divide',
      'uppercase',
      'lowercase',
      'contains',
      'distance',
      'area',
      'search',
      'format',
    ];

    for (let i = 0; i < 50; i++) {
      const ns = namespaces[i % namespaces.length];
      const op = operations[i % operations.length];
      manyFunctions.push({
        uri: `http://example.org/${ns}#${op}${i}`,
        label: `${op.charAt(0).toUpperCase() + op.slice(1)} ${i}`,
        comment: `Description for ${op} function number ${i}`,
        parameters: [{ name: 'x' }],
        returnType: 'xsd:string',
      });
    }

    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set(endpoint, {
        endpoint,
        supportedLanguages: [],
        features: [],
        resultFormats: [],
        inputFormats: [],
        extensionFunctions: manyFunctions,
        extensionAggregates: [],
        datasets: [],
        lastFetched: new Date(),
        available: true,
      });
      return {
        ...state,
        descriptions,
        currentEndpoint: endpoint,
      };
    });
  },
};

export const OnlyAggregates: Story = {
  args: {
    currentEndpoint: 'http://localhost:3030/agg/sparql',
  },
  play: async () => {
    const endpoint = 'http://localhost:3030/agg/sparql';
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set(endpoint, {
        endpoint,
        supportedLanguages: [],
        features: [],
        resultFormats: [],
        inputFormats: [],
        extensionFunctions: [],
        extensionAggregates: mockAggregates,
        datasets: [],
        lastFetched: new Date(),
        available: true,
      });
      return {
        ...state,
        descriptions,
        currentEndpoint: endpoint,
      };
    });
  },
};

export const NoEndpoint: Story = {
  args: {
    currentEndpoint: null,
  },
};
