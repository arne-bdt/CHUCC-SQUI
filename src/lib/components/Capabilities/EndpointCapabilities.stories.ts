/**
 * Storybook stories for EndpointCapabilities component
 *
 * These stories demonstrate all states of the component using the play function
 * to set up the store state after rendering.
 *
 * Test coverage:
 * - E2E tests: tests/e2e/endpoint-capabilities.storybook.spec.ts
 * - Sub-component tests: tests/integration/LanguageSupport.test.ts, etc.
 */
import type { Meta, StoryObj } from '@storybook/svelte';
import EndpointCapabilities from './EndpointCapabilities.svelte';
import { serviceDescriptionStore } from '../../stores/serviceDescriptionStore';
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
  play: async () => {
    // Set loading state directly without triggering a fetch
    serviceDescriptionStore.reset();
    serviceDescriptionStore.update((state) => ({
      ...state,
      currentEndpoint: 'https://example.org/sparql',
      loading: true,
      error: null,
    }));
  },
};

/**
 * Full capabilities display with all data populated
 */
export const WithFullCapabilities: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
  },
  play: async () => {
    const mockServiceDesc: ServiceDescription = {
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
    };

    // Reset store and set the mock data
    serviceDescriptionStore.reset();

    // Manually update the store with mock data
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('https://example.org/sparql', mockServiceDesc);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'https://example.org/sparql',
        loading: false,
        error: null,
      };
    });
  },
};

/**
 * Error state - shows error message with retry button
 */
export const ErrorState: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
  },
  play: async () => {
    // Reset store and set error state
    serviceDescriptionStore.reset();

    serviceDescriptionStore.update((state) => ({
      ...state,
      currentEndpoint: 'https://example.org/sparql',
      loading: false,
      error: 'Failed to fetch service description: Network error',
    }));
  },
};

/**
 * No endpoint provided - shows empty state
 */
export const NoEndpoint: Story = {
  args: {},
  play: async () => {
    serviceDescriptionStore.reset();
  },
};

/**
 * Service description not available - endpoint doesn't support it
 */
export const NotAvailable: Story = {
  args: {
    endpointUrl: 'https://example.org/sparql',
  },
  play: async () => {
    const unavailableDesc: ServiceDescription = {
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
    };

    serviceDescriptionStore.reset();

    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('https://example.org/sparql', unavailableDesc);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'https://example.org/sparql',
        loading: false,
        error: null,
      };
    });
  },
};
