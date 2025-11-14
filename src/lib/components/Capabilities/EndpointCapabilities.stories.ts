/**
 * Storybook stories for EndpointCapabilities component
 *
 * These stories demonstrate all states of the component using StoreProvider parameters
 * to initialize store state via isolated context stores.
 *
 * Test coverage:
 * - E2E tests: tests/e2e/endpoint-capabilities.storybook.spec.ts
 * - Sub-component tests: tests/integration/LanguageSupport.test.ts, etc.
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointCapabilities from './EndpointCapabilities.svelte';
import {
  SPARQLLanguage,
  ServiceFeature,
  type ServiceDescription,
} from '../../types/serviceDescription';

const meta = {
  title: 'Components/Capabilities/EndpointCapabilities',
  component: EndpointCapabilities,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
EndpointCapabilities displays SPARQL endpoint capabilities based on Service Description metadata.

The component reads from \`serviceDescriptionStore\` and displays:
- Supported SPARQL versions
- Service features
- Result/input formats
- Extension functions and aggregates
- Dataset information

**Component States:**
- Loading: Shows skeleton loader while fetching
- Full Capabilities: Displays all endpoint capabilities with refresh button
- Error: Shows error message with retry button
- No Data: Shows "not available" message with fetch button
        `,
      },
    },
  },
} satisfies Meta<EndpointCapabilities>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Loading state - shows skeleton loader while fetching service description
 */
export const Loading: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://example.org/sparql',
    initialServiceDescriptionLoading: true,
  },
};

/**
 * Full capabilities display with all data populated
 */
export const WithFullCapabilities: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://example.org/sparql',
    initialServiceDescription: {
      endpoint: 'https://example.org/sparql',
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
      ],
      resultFormats: [
        'application/sparql-results+json',
        'application/sparql-results+xml',
        'text/csv',
        'text/tab-separated-values',
      ],
      inputFormats: ['text/turtle', 'application/rdf+xml', 'application/n-triples'],
      extensionFunctions: [
        {
          uri: 'http://example.org/fn#customFunction',
          label: 'customFunction',
          comment: 'A custom SPARQL extension function for data processing',
        },
        {
          uri: 'http://example.org/fn#geoDistance',
          label: 'geoDistance',
          comment: 'Calculate distance between geographic coordinates',
        },
      ],
      extensionAggregates: [
        {
          uri: 'http://example.org/agg#MEDIAN',
          label: 'MEDIAN',
          comment: 'Calculate median value of a numeric expression',
        },
      ],
      datasets: [
        {
          uri: 'http://example.org/dataset',
          defaultGraphs: [
            {
              uri: 'http://example.org/graph/default',
              entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
            },
          ],
          namedGraphs: [
            {
              name: 'http://example.org/graph/named1',
              uri: 'http://example.org/graph/named1',
            },
            {
              name: 'http://example.org/graph/named2',
              uri: 'http://example.org/graph/named2',
            },
          ],
        },
      ],
    } satisfies ServiceDescription,
  },
};

/**
 * Error state - shows error message with retry button
 */
export const ErrorState: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
  },
  parameters: {
    initialEndpoint: 'https://example.org/sparql',
    initialServiceDescriptionError: 'Failed to fetch service description: Network error',
  },
};

/**
 * No endpoint provided - shows empty state
 */
export const NoEndpoint: Story = {
  args: {},
};

/**
 * Service description not available - endpoint doesn't support it
 */
export const NotAvailable: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
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
