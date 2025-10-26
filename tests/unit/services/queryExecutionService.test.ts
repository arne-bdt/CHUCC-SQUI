/**
 * Unit tests for Query Execution Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  QueryExecutionService,
  queryExecutionService,
} from '../../../src/lib/services/queryExecutionService';
import { resultsStore } from '../../../src/lib/stores/resultsStore';
import { get } from 'svelte/store';

describe('QueryExecutionService', () => {
  let service: QueryExecutionService;

  beforeEach(() => {
    service = new QueryExecutionService();
    resultsStore.reset();
  });

  describe('executeQuery', () => {
    it('should execute query and update results store', async () => {
      const result = await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.status).toBe(200);

      // Check results store was updated
      const resultsState = get(resultsStore);
      expect(resultsState.loading).toBe(false);
      expect(resultsState.data).toBeDefined();
      expect(resultsState.executionTime).toBeGreaterThan(0);
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

    it('should handle query cancellation', async () => {
      const controller = new AbortController();

      const promise = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
        signal: controller.signal,
      });

      // Cancel immediately
      controller.abort();

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
    it('should cancel running query', async () => {
      const promise = service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      // Cancel the query
      service.cancelQuery();

      await expect(promise).rejects.toThrow('Query execution cancelled');
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
      // Mock a failure by creating a service that throws
      const failingService = new QueryExecutionService();

      // Override the mockQueryExecution to throw an error
      vi.spyOn(failingService as any, 'mockQueryExecution').mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        failingService.executeQuery({
          query: 'SELECT * WHERE { ?s ?p ?o }',
          endpoint: 'https://example.org/sparql',
        })
      ).rejects.toThrow('Network error');

      const resultsState = get(resultsStore);
      expect(resultsState.error).toBe('Network error');
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

  describe('mock implementation', () => {
    it('should log query and endpoint', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Mock query execution:',
        expect.objectContaining({
          query: 'SELECT * WHERE { ?s ?p ?o }',
          endpoint: 'https://example.org/sparql',
        })
      );

      consoleSpy.mockRestore();
    });

    it('should return mock data with expected structure', async () => {
      const result = await service.executeQuery({
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://example.org/sparql',
      });

      // Check structure matches SPARQL JSON Results format
      expect(result.data.head.vars).toEqual(['subject', 'predicate', 'object']);
      expect(result.data.results.bindings.length).toBeGreaterThan(0);

      const binding = result.data.results.bindings[0];
      expect(binding.subject).toBeDefined();
      expect(binding.subject.type).toBe('uri');
      expect(binding.subject.value).toBeDefined();
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
