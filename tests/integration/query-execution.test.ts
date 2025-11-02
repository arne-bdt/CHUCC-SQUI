/**
 * Integration test for query execution flow
 * Tests the complete flow from service to store
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { createResultsStore } from '../../src/lib/stores/resultsStore';
import type { SparqlJsonResults } from '../../src/lib/types';

describe('Query Execution Integration', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Results Store Query Execution', () => {
    it('should execute query and update store with results', async () => {
      const resultsStore = createResultsStore();

      const mockResults: SparqlJsonResults = {
        head: { vars: ['s', 'p', 'o'] },
        results: {
          bindings: [
            {
              s: { type: 'uri', value: 'http://example.org/subject' },
              p: { type: 'uri', value: 'http://example.org/predicate' },
              o: { type: 'literal', value: 'object' },
            },
          ],
        },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      // Subscribe to store changes
      const states: boolean[] = [];
      const unsubscribe = resultsStore.subscribe((state) => {
        states.push(state.loading);
      });

      // Execute query
      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      // Check final state
      const finalState = get(resultsStore);
      expect(finalState.data).toEqual(mockResults);
      expect(finalState.loading).toBe(false);
      expect(finalState.error).toBeNull();
      expect(finalState.executionTime).toBeGreaterThanOrEqual(0);

      // Check that loading state changed during execution
      // Should be: false (initial), true (during execution), false (after completion)
      expect(states).toContain(true);
      expect(states[states.length - 1]).toBe(false);

      unsubscribe();
    });

    it('should handle query errors and update store with error', async () => {
      const resultsStore = createResultsStore();

      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => 'Invalid SPARQL query',
      });

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'INVALID QUERY',
      });

      const finalState = get(resultsStore);
      expect(finalState.data).toBeNull();
      expect(finalState.loading).toBe(false);
      // Task 18 enhanced error messages: "Bad Request: Invalid SPARQL query" instead of "HTTP 400"
      // Error is now a QueryError object with rich details
      const errorMessage = typeof finalState.error === 'string'
        ? finalState.error
        : finalState.error?.message || '';
      expect(errorMessage).toContain('Bad Request');
    });

    it('should handle network errors', async () => {
      const resultsStore = createResultsStore();

      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await resultsStore.executeQuery({
        endpoint: 'http://unreachable.example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      const finalState = get(resultsStore);
      expect(finalState.loading).toBe(false);
      const errorMessage = typeof finalState.error === 'string'
        ? finalState.error
        : finalState.error?.message || '';
      expect(errorMessage).toContain('Network error');
    });

    it('should clear previous error when starting new query', async () => {
      const resultsStore = createResultsStore();

      // First query fails
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => 'Invalid query',
      });

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'INVALID',
      });

      expect(get(resultsStore).error).toBeTruthy();

      // Second query succeeds
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      const finalState = get(resultsStore);
      expect(finalState.error).toBeNull();
      expect(finalState.data).toEqual(mockResults);
    });

    it('should track execution time accurately', async () => {
      const resultsStore = createResultsStore();

      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      // Simulate a query that takes ~50ms
      fetchMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
                text: async () => JSON.stringify(mockResults),
                json: async () => mockResults,
              });
            }, 50);
          })
      );

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      const finalState = get(resultsStore);
      expect(finalState.executionTime).toBeGreaterThanOrEqual(50);
      expect(finalState.executionTime).toBeLessThan(200); // Allow some margin
    });
  });

  describe('Query Cancellation', () => {
    it('should cancel ongoing query', async () => {
      const resultsStore = createResultsStore();

      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      fetchMock.mockRejectedValue(abortError);

      const queryPromise = resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      // Cancel the query
      resultsStore.cancelQuery();

      await queryPromise;

      const finalState = get(resultsStore);
      expect(finalState.loading).toBe(false);
      const errorMessage = typeof finalState.error === 'string'
        ? finalState.error
        : finalState.error?.message || '';
      expect(errorMessage).toContain('cancelled');
    });
  });

  describe('Different Query Types', () => {
    it('should handle ASK query with boolean result', async () => {
      const resultsStore = createResultsStore();

      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        boolean: true,
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'ASK WHERE { ?s ?p ?o }',
      });

      const finalState = get(resultsStore);
      expect(finalState.data?.boolean).toBe(true);
    });

    it('should handle CONSTRUCT query with RDF data', async () => {
      const resultsStore = createResultsStore();

      const mockTurtle = '@prefix ex: <http://example.org/> .\nex:subject ex:predicate "object" .';

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/turtle' }),
        text: async () => mockTurtle,
      });

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
      });

      const finalState = get(resultsStore);
      // For text results, we create a minimal structure
      expect(finalState.data).toBeDefined();
      expect(finalState.loading).toBe(false);
      expect(finalState.error).toBeNull();
    });
  });

  describe('Custom Headers and Options', () => {
    it('should pass custom headers to the service', async () => {
      const resultsStore = createResultsStore();

      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
        headers: {
          Authorization: 'Bearer token123',
        },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
          }),
        })
      );
    });

    it('should respect timeout option', async () => {
      const resultsStore = createResultsStore();

      fetchMock.mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            // Simulate the abort happening due to timeout
            if (options?.signal) {
              options.signal.addEventListener('abort', () => {
                const error = new Error('The operation was aborted');
                error.name = 'AbortError';
                reject(error);
              });
            }
          })
      );

      await resultsStore.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
        timeout: 100,
      });

      const finalState = get(resultsStore);
      const errorMessage = typeof finalState.error === 'string'
        ? finalState.error
        : finalState.error?.message || '';
      expect(errorMessage).toContain('timeout');
    }, 10000);
  });
});
