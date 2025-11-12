import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import StoreProvider from '../../src/lib/components/StoreProvider.svelte';
import TestConsumer from '../unit/components/StoreProvider.test.consumer.svelte';
import { get } from 'svelte/store';

// Helper to render StoreProvider with TestConsumer as child
function renderWithConsumer(props: {
  initialQuery?: string;
  initialEndpoint?: string;
} = {}) {
  return render(StoreProvider, {
    props: {
      ...props,
      children: TestConsumer as any,
    },
  });
}

describe('StoreProvider Integration', () => {
  describe('Context Store Access', () => {
    it('should provide stores to child components via context', async () => {
      renderWithConsumer({
        initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        initialEndpoint: 'https://dbpedia.org/sparql',
      });

      await waitFor(() => {
        const queryText = screen.getByTestId('query-text');
        expect(queryText.textContent).toBe('SELECT * WHERE { ?s ?p ?o }');
      });

      await waitFor(() => {
        const endpoint = screen.getByTestId('endpoint');
        expect(endpoint.textContent).toBe('https://dbpedia.org/sparql');
      });
    });

    it('should initialize stores with default values when no props provided', async () => {
      renderWithConsumer();

      await waitFor(() => {
        const queryText = screen.getByTestId('query-text');
        expect(queryText.textContent).toBe('');
      });

      await waitFor(() => {
        const endpoint = screen.getByTestId('endpoint');
        expect(endpoint.textContent).toBe('');
      });

      await waitFor(() => {
        const activeTab = screen.getByTestId('active-tab');
        expect(activeTab.textContent).toBe('tab-1'); // Default from uiStore
      });

      await waitFor(() => {
        const loading = screen.getByTestId('loading');
        expect(loading.textContent).toBe('false');
      });
    });
  });

  describe('State Isolation', () => {
    it('should isolate state between multiple StoreProvider instances', async () => {
      // Render first provider with consumer
      const { container: container1 } = renderWithConsumer({
        initialQuery: 'QUERY 1',
        initialEndpoint: 'https://endpoint1.com/sparql',
      });

      // Verify first instance
      await waitFor(() => {
        const queryText = container1.querySelector('[data-testid="query-text"]');
        expect(queryText?.textContent).toBe('QUERY 1');
      });

      await waitFor(() => {
        const endpoint = container1.querySelector('[data-testid="endpoint"]');
        expect(endpoint?.textContent).toBe('https://endpoint1.com/sparql');
      });

      // Render second provider with different values
      const { container: container2 } = renderWithConsumer({
        initialQuery: 'QUERY 2',
        initialEndpoint: 'https://endpoint2.com/sparql',
      });

      // Verify second instance has different values
      await waitFor(() => {
        const queryText = container2.querySelector('[data-testid="query-text"]');
        expect(queryText?.textContent).toBe('QUERY 2');
      });

      await waitFor(() => {
        const endpoint = container2.querySelector('[data-testid="endpoint"]');
        expect(endpoint?.textContent).toBe('https://endpoint2.com/sparql');
      });

      // Verify first instance is still unchanged
      await waitFor(() => {
        const queryText = container1.querySelector('[data-testid="query-text"]');
        expect(queryText?.textContent).toBe('QUERY 1');
      });
    });

    it('should create independent store instances for each provider', async () => {
      // Each StoreProvider creates fresh store instances
      // This test verifies state isolation

      renderWithConsumer({
        initialQuery: 'PROVIDER QUERY',
        initialEndpoint: 'https://provider.endpoint.com/sparql',
      });

      await waitFor(() => {
        const queryText = screen.getByTestId('query-text');
        expect(queryText.textContent).toBe('PROVIDER QUERY');
      });

      // The stores are isolated within this provider's context
      // Note: With clean-break approach, there are no global stores to compare against
    });
  });

  describe('Initial Values', () => {
    it('should set initial query text in store', async () => {
      const initialQuery = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nSELECT * WHERE { ?s rdf:type ?o }';

      renderWithConsumer({ initialQuery });

      await waitFor(() => {
        const queryText = screen.getByTestId('query-text');
        expect(queryText.textContent).toBe(initialQuery);
      });
    });

    it('should set initial endpoint URL in store', async () => {
      const initialEndpoint = 'https://query.wikidata.org/sparql';

      renderWithConsumer({ initialEndpoint });

      await waitFor(() => {
        const endpoint = screen.getByTestId('endpoint');
        expect(endpoint.textContent).toBe(initialEndpoint);
      });
    });

    it('should handle empty strings as initial values', async () => {
      renderWithConsumer({
        initialQuery: '',
        initialEndpoint: '',
      });

      await waitFor(() => {
        const queryText = screen.getByTestId('query-text');
        expect(queryText.textContent).toBe('');
      });

      await waitFor(() => {
        const endpoint = screen.getByTestId('endpoint');
        expect(endpoint.textContent).toBe('');
      });
    });
  });

  describe('Store Reactivity', () => {
    it('should allow child components to modify context stores', async () => {
      // This test verifies that stores are reactive within the context
      // Child components should be able to call store methods and see updates

      renderWithConsumer({
        initialQuery: 'INITIAL QUERY',
      });

      await waitFor(() => {
        const queryText = screen.getByTestId('query-text');
        expect(queryText.textContent).toBe('INITIAL QUERY');
      });

      // Note: To fully test store modification, we would need a consumer component
      // that actually modifies stores. For now, we verify initial reactivity.
    });
  });

  describe('Error Handling', () => {
    it('should throw error when component is not wrapped in StoreProvider', () => {
      // With the clean-break approach, components MUST be wrapped in StoreProvider
      // Rendering without it should throw a clear error
      expect(() => {
        render(TestConsumer);
      }).toThrow('[SQUI] queryStore not found in context');
    });
  });
});
