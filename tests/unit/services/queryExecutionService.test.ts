/**
 * Unit tests for Query Execution Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  QueryExecutionService,
  queryExecutionService,
} from '../../../src/lib/services/queryExecutionService';
import { resultsStore } from '../../../src/lib/stores/resultsStore';
import { get } from 'svelte/store';
import type { SparqlJsonResults } from '../../../src/lib/types';

describe('QueryExecutionService', () => {
  let service: QueryExecutionService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new QueryExecutionService();
    resultsStore.reset();

    // Mock fetch for sparqlService
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    // Default mock response (SPARQL JSON Results)
    const mockResults: SparqlJsonResults = {
      head: { vars: ['subject', 'predicate', 'object'] },
      results: {
        bindings: [
          {
            subject: { type: 'uri', value: 'http://example.org/subject' },
            predicate: { type: 'uri', value: 'http://example.org/predicate' },
            object: { type: 'literal', value: 'object' },
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeQuery', () => {
    it('should execute query and update results store', async () => {
      const result = await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.executionTime).toBeGreaterThanOrEqual(0); // Mock may execute instantly (0ms)
      expect(result.status).toBe(200);

      // Check results store was updated
      const resultsState = get(resultsStore);
      expect(resultsState.loading).toBe(false);
      expect(resultsState.data).toBeDefined();
      expect(resultsState.executionTime).toBeGreaterThanOrEqual(0); // Mock may execute instantly (0ms)
    });

    it('should set loading state during execution', async () => {
      const promise = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      // Check loading is true immediately
      const resultsState = get(resultsStore);
      expect(resultsState.loading).toBe(true);

      await promise;

      // Check loading is false after completion
      const finalState = get(resultsStore);
      expect(finalState.loading).toBe(false);
    });

    it('should return mock SPARQL JSON results', async () => {
      const result = await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      expect(result.data.head).toBeDefined();
      expect(result.data.head.vars).toBeDefined();
      expect(result.data.results).toBeDefined();
      expect(result.data.results.bindings).toBeDefined();
      expect(Array.isArray(result.data.results.bindings)).toBe(true);
    });

    it('should handle query cancellation via external signal', async () => {
      const controller = new AbortController();

      // Mock fetch to properly respond to abort signal
      // Create a promise that rejects when the signal is aborted
      fetchMock.mockImplementationOnce(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            // Set up abort listener before any async operations
            const abortHandler = () => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            };

            if (options?.signal) {
              options.signal.addEventListener('abort', abortHandler);

              // If already aborted, reject immediately
              if (options.signal.aborted) {
                abortHandler();
              }
            }
            // Never resolve - simulates long-running query
          })
      );

      // Start query execution
      const promise = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
        signal: controller.signal,
      });

      // Abort immediately (no setTimeout needed - abort is synchronous)
      controller.abort();

      // Should reject with cancellation error
      await expect(promise).rejects.toThrow('Query execution cancelled');

      // Check error was set in results store
      const resultsState = get(resultsStore);
      expect(resultsState.error).toBe('Query execution cancelled');
      expect(resultsState.loading).toBe(false);
    });

    it('should respect custom timeout', async () => {
      const result = await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
        timeout: 5000,
      });

      expect(result).toBeDefined();
      expect(result.executionTime).toBeLessThan(5000);
    });
  });

  describe('cancelQuery', () => {
    it('should cancel running query via cancelQuery() method', async () => {
      // Mock fetch to properly respond to abort signal
      fetchMock.mockImplementationOnce(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            // Set up abort listener
            const abortHandler = () => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            };

            if (options?.signal) {
              options.signal.addEventListener('abort', abortHandler);

              // If already aborted, reject immediately
              if (options.signal.aborted) {
                abortHandler();
              }
            }
            // Never resolve - simulates long-running query
          })
      );

      // Start query execution
      const promise = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      // Cancel using the service's cancelQuery method (synchronous)
      service.cancelQuery();

      // Should reject with cancellation error
      await expect(promise).rejects.toThrow('Query execution cancelled');

      // Verify results store state
      const resultsState = get(resultsStore);
      expect(resultsState.error).toBe('Query execution cancelled');
      expect(resultsState.loading).toBe(false);
    });

    it('should be safe to call when no query is running', () => {
      expect(() => service.cancelQuery()).not.toThrow();
    });
  });

  describe('isExecuting', () => {
    it('should return false when no query is running', () => {
      expect(service.isExecuting()).toBe(false);
    });

    it('should return true when query is executing', async () => {
      const promise = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      expect(service.isExecuting()).toBe(true);

      await promise;

      expect(service.isExecuting()).toBe(false);
    });

    it('should return false after query completes', async () => {
      await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      expect(service.isExecuting()).toBe(false);
    });

    it('should return false after query is cancelled', async () => {
      const promise = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      service.cancelQuery();

      try {
        await promise;
      } catch (error) {
        // Expected error
      }

      expect(service.isExecuting()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error in results store on failure', async () => {
      // Mock a network error
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        service.executeQuery({
          query: 'SELECT * WHERE { ?s ?p ?o }',
          endpoint: 'https://example.org/sparql',
        })
      ).rejects.toThrow();

      const resultsState = get(resultsStore);
      expect(resultsState.error).toContain('Network error');
      expect(resultsState.loading).toBe(false);
    });

    it('should clear previous errors before execution', async () => {
      // Set an error first
      resultsStore.setError('Previous error');

      await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      const resultsState = get(resultsStore);
      expect(resultsState.error).toBeNull();
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton queryExecutionService instance', () => {
      expect(queryExecutionService).toBeInstanceOf(QueryExecutionService);
    });

    it('should be usable without creating new instance', async () => {
      const result = await queryExecutionService.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      expect(result).toBeDefined();
    });
  });

  describe('real SPARQL service integration', () => {
    it('should use real sparqlService for query execution', async () => {
      const result = await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      // Verify fetch was called
      expect(fetchMock).toHaveBeenCalled();

      // Check structure matches SPARQL JSON Results format
      expect(result.data.head.vars).toEqual(['subject', 'predicate', 'object']);
      expect(result.data.results.bindings.length).toBeGreaterThan(0);

      const binding = result.data.results.bindings[0];
      expect(binding.subject).toBeDefined();
      expect(binding.subject.type).toBe('uri');
      expect(binding.subject.value).toBeDefined();
    });

    it('should handle non-JSON responses', async () => {
      // Mock a text/turtle response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/turtle' }),
        text: async () => '@prefix ex: <http://example.org/> .',
      });

      const result = await service.executeQuery({
        query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      // Should create minimal structure for non-JSON responses
      expect(result.data).toBeDefined();
      expect(result.data.head).toBeDefined();
      expect(result.data.results).toBeDefined();
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sequential executions', async () => {
      const result1 = await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      const result2 = await service.executeQuery({
        query: 'SELECT * WHERE { ?s a ?type }',
        endpoint: 'https://example.org/sparql',
      });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(service.isExecuting()).toBe(false);
    });

    it('should handle execution, cancellation, then new execution', async () => {
      const promise1 = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      service.cancelQuery();

      try {
        await promise1;
      } catch (error) {
        // Expected
      }

      // Should be able to execute again
      const result2 = await service.executeQuery({
        query: 'SELECT * WHERE { ?s a ?type }',
        endpoint: 'https://example.org/sparql',
      });

      expect(result2).toBeDefined();
    });
  });
});
