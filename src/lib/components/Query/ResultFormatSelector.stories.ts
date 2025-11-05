/**
 * Storybook stories for ResultFormatSelector component
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import ResultFormatSelector from './ResultFormatSelector.svelte';
import { serviceDescriptionStore } from '../../stores/serviceDescriptionStore.js';
import { queryStore } from '../../stores/queryStore.js';
import type { ServiceDescription } from '../../types/index.js';

const meta = {
  title: 'Query/ResultFormatSelector',
  component: ResultFormatSelector,
  tags: ['autodocs'],
  argTypes: {
    selected: {
      control: 'text',
      description: 'Currently selected format (MIME type)',
    },
    endpoint: {
      control: 'text',
      description: 'Endpoint URL to get service description for',
    },
    query: {
      control: 'text',
      description: 'Query text to detect query type from',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the selector',
    },
  },
} satisfies Meta<ResultFormatSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock service description with all formats
const mockServiceDescWithAllFormats: ServiceDescription = {
  endpoint: 'http://example.org/sparql',
  supportedLanguages: [],
  features: [],
  resultFormats: [
    'application/sparql-results+json',
    'application/sparql-results+xml',
    'text/csv',
    'text/tab-separated-values',
    'text/turtle',
    'application/rdf+xml',
    'application/ld+json',
    'application/n-triples',
  ],
  inputFormats: [],
  extensionFunctions: [],
  extensionAggregates: [],
  datasets: [],
  lastFetched: new Date(),
  available: true,
};

// Mock service description with limited formats
const mockServiceDescWithLimitedFormats: ServiceDescription = {
  endpoint: 'http://limited.example.org/sparql',
  supportedLanguages: [],
  features: [],
  resultFormats: [
    'application/sparql-results+json',
    'text/csv',
    'text/turtle',
  ],
  inputFormats: [],
  extensionFunctions: [],
  extensionAggregates: [],
  datasets: [],
  lastFetched: new Date(),
  available: true,
};

/**
 * Default state - SELECT query with all formats available
 */
export const Default: Story = {
  args: {
    query: 'SELECT * WHERE { ?s ?p ?o }',
  },
  play: async () => {
    // Set up mock service description
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    // Set query text
    queryStore.setState({
      text: 'SELECT * WHERE { ?s ?p ?o }',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * SELECT query - shows binding formats (JSON, XML, CSV, TSV)
 */
export const SelectQuery: Story = {
  args: {
    query: 'SELECT ?name ?age WHERE { ?person foaf:name ?name ; foaf:age ?age }',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'SELECT ?name ?age WHERE { ?person foaf:name ?name ; foaf:age ?age }',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * ASK query - shows binding formats
 */
export const AskQuery: Story = {
  args: {
    query: 'ASK { ?s a foaf:Person }',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'ASK { ?s a foaf:Person }',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * CONSTRUCT query - shows RDF formats (Turtle, RDF/XML, JSON-LD, N-Triples)
 */
export const ConstructQuery: Story = {
  args: {
    query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * DESCRIBE query - shows RDF formats
 */
export const DescribeQuery: Story = {
  args: {
    query: 'DESCRIBE <http://example.org/resource>',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'DESCRIBE <http://example.org/resource>',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * Limited formats endpoint - only JSON, CSV, and Turtle available
 */
export const LimitedFormats: Story = {
  args: {
    query: 'SELECT * WHERE { ?s ?p ?o }',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://limited.example.org/sparql', mockServiceDescWithLimitedFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://limited.example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'SELECT * WHERE { ?s ?p ?o }',
      endpoint: 'http://limited.example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * No service description - shows default formats with helper text
 */
export const NoServiceDescription: Story = {
  args: {
    query: 'SELECT * WHERE { ?s ?p ?o }',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => ({
      ...state,
      descriptions: new Map(),
      currentEndpoint: null,
    }));

    queryStore.setState({
      text: 'SELECT * WHERE { ?s ?p ?o }',
      endpoint: '',
      prefixes: {},
    });
  },
};

/**
 * Query with PREFIX declarations - correctly detects SELECT
 */
export const QueryWithPrefixes: Story = {
  args: {
    query: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT ?name WHERE { ?person foaf:name ?name }`,
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT ?name WHERE { ?person foaf:name ?name }`,
      endpoint: 'http://example.org/sparql',
      prefixes: {
        foaf: 'http://xmlns.com/foaf/0.1/',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      },
    });
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    query: 'SELECT * WHERE { ?s ?p ?o }',
    disabled: true,
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'SELECT * WHERE { ?s ?p ?o }',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * Pre-selected CSV format
 */
export const PreSelectedCSV: Story = {
  args: {
    query: 'SELECT * WHERE { ?s ?p ?o }',
    selected: 'text/csv',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'SELECT * WHERE { ?s ?p ?o }',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};

/**
 * Pre-selected Turtle format for CONSTRUCT query
 */
export const PreSelectedTurtle: Story = {
  args: {
    query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
    selected: 'text/turtle',
  },
  play: async () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    queryStore.setState({
      text: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
      endpoint: 'http://example.org/sparql',
      prefixes: {},
    });
  },
};
