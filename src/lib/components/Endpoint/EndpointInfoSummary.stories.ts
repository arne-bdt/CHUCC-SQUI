/**
 * Storybook stories for EndpointInfoSummary component
 *
 * These stories demonstrate the collapsible summary bar that shows endpoint information
 *
 * Test coverage:
 * - E2E tests: tests/e2e/endpoint-dashboard.storybook.spec.ts
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointInfoSummary from './EndpointInfoSummary.svelte';
import {
  SPARQLLanguage,
  ServiceFeature,
  type ServiceDescription,
} from '../../types/serviceDescription';

const meta = {
  title: 'Components/Endpoint/EndpointInfoSummary',
  component: EndpointInfoSummary,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
EndpointInfoSummary provides a collapsible summary bar showing endpoint capabilities at a glance.

The component displays:
- **Collapsed State**: Key stats (SPARQL version, graph count, function count, last updated)
- **Expanded State**: Full EndpointDashboard with detailed capabilities, datasets, and functions
- **Auto-fetch**: Automatically fetches service description when endpoint changes
- **Refresh**: Manual refresh button to re-fetch service description

**Component States:**
- Collapsed: Shows compact summary bar
- Expanded: Shows full dashboard
- Loading: Shows skeleton loader
- Error: Shows "No service description available"
        `,
      },
    },
  },
} satisfies Meta<EndpointInfoSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock service description with full data
const mockFullServiceDescription: ServiceDescription = {
  endpoint: 'https://dbpedia.org/sparql',
  available: true,
  lastFetched: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  supportedLanguages: [
    SPARQLLanguage.SPARQL11Query,
    SPARQLLanguage.SPARQL11Update,
  ],
  features: [
    ServiceFeature.DereferencesURIs,
    ServiceFeature.UnionDefaultGraph,
    ServiceFeature.BasicFederatedQuery,
  ],
  resultFormats: [
    'application/sparql-results+json',
    'application/sparql-results+xml',
    'text/csv',
  ],
  inputFormats: ['text/turtle', 'application/rdf+xml'],
  extensionFunctions: [
    {
      uri: 'http://dbpedia.org/function/distance',
      label: 'distance',
      comment: 'Calculate distance between geographic coordinates',
    },
    {
      uri: 'http://dbpedia.org/function/contains',
      label: 'contains',
      comment: 'Check if text contains substring',
    },
  ],
  extensionAggregates: [
    {
      uri: 'http://dbpedia.org/aggregate/MEDIAN',
      label: 'MEDIAN',
      comment: 'Calculate median value',
    },
  ],
  datasets: [
    {
      uri: 'http://dbpedia.org/dataset',
      defaultGraphs: [
        {
          uri: 'http://dbpedia.org',
          entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
        },
      ],
      namedGraphs: [
        {
          name: 'http://dbpedia.org/graph/persons',
          uri: 'http://dbpedia.org/graph/persons',
        },
        {
          name: 'http://dbpedia.org/graph/places',
          uri: 'http://dbpedia.org/graph/places',
        },
        {
          name: 'http://dbpedia.org/graph/organizations',
          uri: 'http://dbpedia.org/graph/organizations',
        },
      ],
    },
  ],
};

/**
 * Collapsed state - shows compact summary
 */
export const Collapsed: Story = {
  args: {},
  parameters: {
    initialEndpoint: 'https://dbpedia.org/sparql',
    initialServiceDescription: mockFullServiceDescription,
  },
};

/**
 * Expanded state - shows full dashboard (click chevron to expand in Collapsed story)
 */
export const Expanded: Story = {
  args: {},
  parameters: {
    initialEndpoint: 'https://dbpedia.org/sparql',
    initialServiceDescription: mockFullServiceDescription,
  },
};

/**
 * Loading state - shows skeleton loader while fetching
 */
export const Loading: Story = {
  args: {},
  parameters: {
    initialEndpoint: 'https://example.org/sparql',
    initialServiceDescriptionLoading: true,
  },
};

/**
 * No service description available - endpoint doesn't support it
 */
export const NoServiceDescription: Story = {
  args: {},
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

/**
 * Minimal data - SPARQL 1.1 Query only, no graphs or functions
 */
export const MinimalData: Story = {
  args: {},
  parameters: {
    initialEndpoint: 'https://minimal.example.org/sparql',
    initialServiceDescription: {
      endpoint: 'https://minimal.example.org/sparql',
      available: true,
      lastFetched: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
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
