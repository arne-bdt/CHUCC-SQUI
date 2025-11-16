/**
 * Storybook stories for EndpointDashboard component
 *
 * These stories demonstrate the tabbed dashboard interface for viewing endpoint capabilities
 *
 * Test coverage:
 * - E2E tests: tests/e2e/endpoint-dashboard.storybook.spec.ts
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointDashboard from './EndpointDashboard.svelte';
import {
  SPARQLLanguage,
  ServiceFeature,
  type ServiceDescription,
} from '../../types/serviceDescription';

const meta = {
  title: 'Components/Endpoint/EndpointDashboard',
  component: EndpointDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
EndpointDashboard is a tabbed interface for viewing detailed endpoint capabilities.

The component provides three tabs:
- **Capabilities**: SPARQL language support, service features, result/input formats
- **Datasets**: Named graphs and default graphs with metadata
- **Functions**: Extension functions and aggregates with search and insert

**Key Features:**
- Dynamic tab visibility (tabs hidden if no data)
- Compact mode for smaller displays
- Function insertion callback support
- Reuses existing capability components
        `,
      },
    },
  },
} satisfies Meta<EndpointDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock service description with full data
const mockFullServiceDescription: ServiceDescription = {
  endpoint: 'https://dbpedia.org/sparql',
  available: true,
  lastFetched: new Date(),
  supportedLanguages: [
    SPARQLLanguage.SPARQL10Query,
    SPARQLLanguage.SPARQL11Query,
    SPARQLLanguage.SPARQL11Update,
  ],
  features: [
    ServiceFeature.DereferencesURIs,
    ServiceFeature.UnionDefaultGraph,
    ServiceFeature.BasicFederatedQuery,
    ServiceFeature.EmptyGraphs,
  ],
  resultFormats: [
    'application/sparql-results+json',
    'application/sparql-results+xml',
    'text/csv',
    'text/tab-separated-values',
    'text/html',
  ],
  inputFormats: [
    'text/turtle',
    'application/rdf+xml',
    'application/n-triples',
    'application/ld+json',
  ],
  extensionFunctions: [
    {
      uri: 'http://dbpedia.org/function/distance',
      label: 'distance',
      comment: 'Calculate distance between two geographic points',
      parameters: [
        { name: 'lat1', type: 'xsd:decimal', optional: false },
        { name: 'lon1', type: 'xsd:decimal', optional: false },
        { name: 'lat2', type: 'xsd:decimal', optional: false },
        { name: 'lon2', type: 'xsd:decimal', optional: false },
      ],
      returnType: 'xsd:decimal',
    },
    {
      uri: 'http://dbpedia.org/function/contains',
      label: 'contains',
      comment: 'Check if string contains substring (case-insensitive)',
    },
    {
      uri: 'http://dbpedia.org/function/normalize',
      label: 'normalize',
      comment: 'Normalize text by removing accents and special characters',
    },
  ],
  extensionAggregates: [
    {
      uri: 'http://dbpedia.org/aggregate/MEDIAN',
      label: 'MEDIAN',
      comment: 'Calculate median value of numeric expression',
    },
    {
      uri: 'http://dbpedia.org/aggregate/MODE',
      label: 'MODE',
      comment: 'Find most frequent value',
    },
  ],
  datasets: [
    {
      uri: 'http://dbpedia.org/dataset',
      defaultGraphs: [
        {
          uri: 'http://dbpedia.org',
          entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
          metadata: {
            'void:triples': 1234567890,
          },
        },
      ],
      namedGraphs: [
        {
          name: 'http://dbpedia.org/graph/persons',
          uri: 'http://dbpedia.org/graph/persons',
          metadata: {
            'void:triples': 50000000,
          },
        },
        {
          name: 'http://dbpedia.org/graph/places',
          uri: 'http://dbpedia.org/graph/places',
          metadata: {
            'void:triples': 30000000,
          },
        },
        {
          name: 'http://dbpedia.org/graph/organizations',
          uri: 'http://dbpedia.org/graph/organizations',
          metadata: {
            'void:triples': 10000000,
          },
        },
      ],
    },
  ],
};

/**
 * Default view - Capabilities tab
 */
export const Default: Story = {
  args: {
    currentEndpoint: 'https://dbpedia.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://dbpedia.org/sparql',
    initialServiceDescription: mockFullServiceDescription,
  },
};

/**
 * Datasets tab - shows named graphs and default graphs
 */
export const DatasetsTab: Story = {
  args: {
    currentEndpoint: 'https://dbpedia.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://dbpedia.org/sparql',
    initialServiceDescription: mockFullServiceDescription,
  },
};

/**
 * Functions tab - shows extension functions with search
 */
export const FunctionsTab: Story = {
  args: {
    currentEndpoint: 'https://dbpedia.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://dbpedia.org/sparql',
    initialServiceDescription: mockFullServiceDescription,
  },
};

/**
 * Compact mode - reduced padding for smaller displays
 */
export const CompactMode: Story = {
  args: {
    currentEndpoint: 'https://dbpedia.org/sparql',
    compact: true,
  },
  parameters: {
    initialEndpoint: 'https://dbpedia.org/sparql',
    initialServiceDescription: mockFullServiceDescription,
  },
};

/**
 * Minimal data - only Capabilities tab visible (no datasets or functions)
 */
export const MinimalData: Story = {
  args: {
    currentEndpoint: 'https://minimal.example.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://minimal.example.org/sparql',
    initialServiceDescription: {
      endpoint: 'https://minimal.example.org/sparql',
      available: true,
      lastFetched: new Date(),
      supportedLanguages: [SPARQLLanguage.SPARQL11Query],
      features: [],
      resultFormats: ['application/sparql-results+json'],
      inputFormats: [],
      extensionFunctions: [],
      extensionAggregates: [],
      datasets: [],
    } satisfies ServiceDescription,
  },
};

/**
 * No service description - shows empty state
 */
export const NoServiceDescription: Story = {
  args: {
    currentEndpoint: 'https://example.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://example.org/sparql',
    initialServiceDescription: {
      endpoint: 'https://example.org/sparql',
      available: false,
      lastFetched: new Date(),
      supportedLanguages: [],
      features: [],
      resultFormats: [],
      inputFormats: [],
      extensionFunctions: [],
      extensionAggregates: [],
      datasets: [],
    } satisfies ServiceDescription,
  },
};
