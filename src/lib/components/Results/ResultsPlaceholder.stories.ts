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
  render: () => ({
    Component: ResultsPlaceholder,
  }),
  play: async () => {
    resultsStore.reset();
  },
};

/**
 * SELECT query results with view switcher
 * Demonstrates table view, raw view toggle, format selection, and download
 */
export const SelectQueryResults: Story = {
  render: () => ({
    Component: ResultsPlaceholder,
  }),
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
  render: () => ({
    Component: ResultsPlaceholder,
  }),
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
  render: () => ({
    Component: ResultsPlaceholder,
  }),
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
  render: () => ({
    Component: ResultsPlaceholder,
  }),
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
  render: () => ({
    Component: ResultsPlaceholder,
  }),
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
  render: () => ({
    Component: ResultsPlaceholder,
  }),
  play: async () => {
    resultsStore.setLoading(true);
  },
};

/**
 * Error state
 * Shows error notification with dismiss button
 */
export const Error: Story = {
  render: () => ({
    Component: ResultsPlaceholder,
  }),
  play: async () => {
    resultsStore.setError('Query execution failed: Endpoint not responding (timeout after 30s)');
  },
};

/**
 * Large dataset (100 rows)
 * Tests performance with more data
 */
export const LargeDataset: Story = {
  render: () => ({
    Component: ResultsPlaceholder,
  }),
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
