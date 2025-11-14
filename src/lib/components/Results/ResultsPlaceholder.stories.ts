/**
 * ResultsPlaceholder Component Stories
 * Demonstrates query results display with view switching and downloads
 * Task 35-38: Phase 8 - Raw View & Downloads
 *
 * Note: These stories use StoreProvider parameters to initialize store state.
 * The StoreProvider decorator creates isolated context stores for each story.
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import ResultsPlaceholder from './ResultsPlaceholder.svelte';
import type { SparqlJsonResults } from '../../types';

const meta = {
  title: 'Results/ResultsPlaceholder',
  component: ResultsPlaceholder,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<ResultsPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample SELECT query results
const selectResults: SparqlJsonResults = {
  head: { vars: ['person', 'name', 'birthDate'] },
  results: {
    bindings: [
      {
        person: { type: 'uri', value: 'http://dbpedia.org/resource/Albert_Einstein' },
        name: { type: 'literal', value: 'Albert Einstein', 'xml:lang': 'en' },
        birthDate: {
          type: 'literal',
          value: '1879-03-14',
          datatype: 'http://www.w3.org/2001/XMLSchema#date',
        },
      },
      {
        person: { type: 'uri', value: 'http://dbpedia.org/resource/Marie_Curie' },
        name: { type: 'literal', value: 'Marie Curie', 'xml:lang': 'en' },
        birthDate: {
          type: 'literal',
          value: '1867-11-07',
          datatype: 'http://www.w3.org/2001/XMLSchema#date',
        },
      },
      {
        person: { type: 'uri', value: 'http://dbpedia.org/resource/Isaac_Newton' },
        name: { type: 'literal', value: 'Isaac Newton', 'xml:lang': 'en' },
        birthDate: {
          type: 'literal',
          value: '1643-01-04',
          datatype: 'http://www.w3.org/2001/XMLSchema#date',
        },
      },
    ],
  },
};

// Sample ASK query result
const askResultTrue: SparqlJsonResults = {
  head: { vars: [] },
  boolean: true,
};

// Sample ASK query result (false)
const askResultFalse: SparqlJsonResults = {
  head: { vars: [] },
  boolean: false,
};

/**
 * Default state - no results yet
 */
export const NoResults: Story = {
  args: {},
};

/**
 * SELECT query results with view switcher
 * Demonstrates table view, raw view toggle, format selection, and download
 */
export const SelectQueryResults: Story = {
  args: {},
  parameters: {
    initialQuery:
      'SELECT ?person ?name ?birthDate WHERE { ?person a dbo:Person . ?person foaf:name ?name . ?person dbo:birthDate ?birthDate . } LIMIT 3',
    initialEndpoint: 'https://dbpedia.org/sparql',
    initialResultsData: selectResults,
    initialResultsExecutionTime: 125,
  },
};

/**
 * SELECT results with table view (explicit)
 * Shows the default table visualization
 */
export const TableView: Story = {
  args: {},
  parameters: {
    initialResultsData: selectResults,
    initialResultsExecutionTime: 89,
  },
};

/**
 * SELECT results with raw view
 * Shows the raw JSON response with syntax highlighting
 */
export const RawView: Story = {
  args: {},
  parameters: {
    initialResultsData: selectResults,
    initialResultsExecutionTime: 89,
  },
};

/**
 * ASK query result (true)
 * Displays boolean result without view switcher
 */
export const AskQueryTrue: Story = {
  args: {},
  parameters: {
    initialResultsData: askResultTrue,
    initialResultsExecutionTime: 45,
  },
};

/**
 * ASK query result (false)
 * Displays boolean result without view switcher
 */
export const AskQueryFalse: Story = {
  args: {},
  parameters: {
    initialResultsData: askResultFalse,
    initialResultsExecutionTime: 52,
  },
};

/**
 * Loading state
 * Shows spinner during query execution
 */
export const Loading: Story = {
  args: {},
  parameters: {
    initialResultsLoading: true,
  },
};

/**
 * Error state - Generic
 * Shows generic error notification with dismiss button
 */
export const ErrorGeneric: Story = {
  args: {},
  parameters: {
    initialResultsError: 'Query execution failed: Endpoint not responding (timeout after 30s)',
  },
};

/**
 * Error state - CORS
 * Shows CORS error with actionable solutions
 * Task review-10: Demonstrates enhanced CORS error messaging
 */
export const ErrorCORS: Story = {
  args: {},
  parameters: {
    initialResultsError: {
      message: 'CORS Error: Cross-origin request blocked',
      type: 'cors',
      details: `The SPARQL endpoint does not allow cross-origin requests from this domain.

Possible solutions:
• Use a CORS proxy service (e.g., https://corsproxy.io or https://cors-anywhere.herokuapp.com)
• For development: Use browser extensions to disable CORS (not recommended for production)
• Contact the endpoint administrator to enable CORS headers (Access-Control-Allow-Origin)
• Set up your own proxy server to forward requests

Note: CORS (Cross-Origin Resource Sharing) is a browser security feature that restricts web pages from making requests to different domains. Many public SPARQL endpoints lack proper CORS configuration.`,
    },
  },
};

/**
 * Error state - Network
 * Shows network error when endpoint is unreachable
 */
export const ErrorNetwork: Story = {
  args: {},
  parameters: {
    initialResultsError: {
      message: 'Network error: Unable to reach endpoint',
      type: 'network',
      details: 'Check that the endpoint URL is correct and the server is reachable.',
    },
  },
};

/**
 * Error state - HTTP 500
 * Shows server error
 */
export const ErrorServerError: Story = {
  args: {},
  parameters: {
    initialResultsError: {
      message: 'Internal Server Error: The SPARQL endpoint encountered an error',
      type: 'http',
      details: 'The server encountered an unexpected condition. This is typically a server-side issue.',
    },
  },
};

// Generate large dataset (100 rows) for performance testing
const largeBindings = [];
for (let i = 0; i < 100; i++) {
  largeBindings.push({
    id: { type: 'uri' as const, value: `http://example.org/resource/${i}` },
    name: { type: 'literal' as const, value: `Item ${i}` },
    value: {
      type: 'literal' as const,
      value: String(i * 100),
      datatype: 'http://www.w3.org/2001/XMLSchema#integer',
    },
  });
}

const largeResults: SparqlJsonResults = {
  head: { vars: ['id', 'name', 'value'] },
  results: { bindings: largeBindings },
};

/**
 * Large dataset (100 rows)
 * Tests performance with more data
 */
export const LargeDataset: Story = {
  args: {},
  parameters: {
    initialResultsData: largeResults,
    initialResultsExecutionTime: 234,
  },
};
