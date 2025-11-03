/**
 * ResultsPlaceholder Component Stories
 * Demonstrates query results display with view switching and downloads
 * Task 35-38: Phase 8 - Raw View & Downloads
 */

import type { Meta, StoryObj } from '@storybook/svelte';
import ResultsPlaceholder from './ResultsPlaceholder.svelte';
import { resultsStore } from '../../stores/resultsStore';
import { queryStore } from '../../stores/queryStore';
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
  play: async () => {
    // Set query type for proper format options
    queryStore.setText(
      'SELECT ?person ?name ?birthDate WHERE { ?person a dbo:Person . ?person foaf:name ?name . ?person dbo:birthDate ?birthDate . } LIMIT 3'
    );
    queryStore.setEndpoint('https://dbpedia.org/sparql');
    queryStore.setType('SELECT');

    // Set results with execution time
    resultsStore.setData(selectResults, 125);
  },
};

/**
 * SELECT results with table view (explicit)
 * Shows the default table visualization
 */
export const TableView: Story = {
  args: {},
  play: async () => {
    queryStore.setType('SELECT');
    resultsStore.setData(selectResults, 89);
    resultsStore.setView('table');
  },
};

/**
 * SELECT results with raw view
 * Shows the raw JSON response with syntax highlighting
 */
export const RawView: Story = {
  args: {},
  play: async () => {
    queryStore.setType('SELECT');
    resultsStore.setData(selectResults, 89);
    // Switch to raw view after a short delay to show transition
    setTimeout(() => {
      resultsStore.setView('raw');
    }, 100);
  },
};

/**
 * ASK query result (true)
 * Displays boolean result without view switcher
 */
export const AskQueryTrue: Story = {
  args: {},
  play: async () => {
    queryStore.setType('ASK');
    resultsStore.setData(askResultTrue, 45);
  },
};

/**
 * ASK query result (false)
 * Displays boolean result without view switcher
 */
export const AskQueryFalse: Story = {
  args: {},
  play: async () => {
    queryStore.setType('ASK');
    resultsStore.setData(askResultFalse, 52);
  },
};

/**
 * Loading state
 * Shows spinner during query execution
 */
export const Loading: Story = {
  args: {},
  play: async () => {
    resultsStore.setLoading(true);
  },
};

/**
 * Error state - Generic
 * Shows generic error notification with dismiss button
 */
export const ErrorGeneric: Story = {
  args: {},
  play: async () => {
    resultsStore.setError('Query execution failed: Endpoint not responding (timeout after 30s)');
  },
};

/**
 * Error state - CORS
 * Shows CORS error with actionable solutions
 * Task review-10: Demonstrates enhanced CORS error messaging
 */
export const ErrorCORS: Story = {
  args: {},
  play: async () => {
    resultsStore.setError({
      message: 'CORS Error: Cross-origin request blocked',
      type: 'cors',
      details: `The SPARQL endpoint does not allow cross-origin requests from this domain.

Possible solutions:
• Use a CORS proxy service (e.g., https://corsproxy.io or https://cors-anywhere.herokuapp.com)
• For development: Use browser extensions to disable CORS (not recommended for production)
• Contact the endpoint administrator to enable CORS headers (Access-Control-Allow-Origin)
• Set up your own proxy server to forward requests

Note: CORS (Cross-Origin Resource Sharing) is a browser security feature that restricts web pages from making requests to different domains. Many public SPARQL endpoints lack proper CORS configuration.`,
    });
  },
};

/**
 * Error state - Network
 * Shows network error when endpoint is unreachable
 */
export const ErrorNetwork: Story = {
  args: {},
  play: async () => {
    resultsStore.setError({
      message: 'Network error: Unable to reach endpoint',
      type: 'network',
      details: 'Check that the endpoint URL is correct and the server is reachable.',
    });
  },
};

/**
 * Error state - HTTP 500
 * Shows server error
 */
export const ErrorServerError: Story = {
  args: {},
  play: async () => {
    resultsStore.setError({
      message: 'Internal Server Error: The SPARQL endpoint encountered an error',
      type: 'http',
      status: 500,
      details: 'The server encountered an unexpected condition. This is typically a server-side issue.',
    });
  },
};

/**
 * Large dataset (100 rows)
 * Tests performance with more data
 */
export const LargeDataset: Story = {
  args: {},
  play: async () => {
    const bindings = [];
    for (let i = 0; i < 100; i++) {
      bindings.push({
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
      results: { bindings },
    };

    queryStore.setType('SELECT');
    resultsStore.setData(largeResults, 234);
  },
};
