/**
 * Query Execution Service
 * Handles SPARQL query execution against endpoints
 * NOTE: This is a stub implementation. Full SPARQL 1.2 Protocol implementation in Task 16.
 */

import { resultsStore } from '../stores/resultsStore';
import type { SparqlJsonResults } from '../types';

/**
 * Query execution options
 */
export interface QueryExecutionOptions {
  /** SPARQL query text */
  query: string;
  /** SPARQL endpoint URL */
  endpoint: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Query execution result
 */
export interface QueryExecutionResult {
  /** Result data */
  data: SparqlJsonResults;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Response status code */
  status: number;
}

/**
 * Query Execution Service
 * Manages SPARQL query execution with loading states and cancellation
 */
export class QueryExecutionService {
  private currentController: AbortController | null = null;

  /**
   * Execute a SPARQL query
   * @param options - Query execution options
   * @returns Query execution result
   */
  async executeQuery(options: QueryExecutionOptions): Promise<QueryExecutionResult> {
    const { query, endpoint, timeout = 30000, signal } = options;

    // Create abort controller for this request
    this.currentController = new AbortController();

    // Link external signal if provided
    if (signal) {
      signal.addEventListener('abort', () => this.currentController?.abort());
    }

    // Set loading state
    resultsStore.setLoading(true);
    resultsStore.clearError();

    const startTime = Date.now();

    try {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.currentController?.abort();
      }, timeout);

      // TODO: Task 16 - Implement actual SPARQL 1.2 Protocol
      // For now, return mock data
      const result = await this.mockQueryExecution(query, endpoint, this.currentController.signal);

      clearTimeout(timeoutId);

      const executionTime = Date.now() - startTime;

      // Update results store
      resultsStore.setData(result.data, executionTime);

      return {
        ...result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Handle abort (both Error and DOMException with name 'AbortError')
      if (
        (error instanceof Error && error.name === 'AbortError') ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        const cancelMessage = 'Query execution cancelled';
        resultsStore.setError(cancelMessage);
        throw new Error(cancelMessage);
      }

      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      resultsStore.setError(errorMessage);
      throw error;
    } finally {
      this.currentController = null;
    }
  }

  /**
   * Cancel the currently running query
   */
  cancelQuery(): void {
    if (this.currentController) {
      this.currentController.abort();
      this.currentController = null;
    }
  }

  /**
   * Check if a query is currently executing
   */
  isExecuting(): boolean {
    return this.currentController !== null;
  }

  /**
   * Mock query execution for development/testing
   * TODO: Remove in Task 16 and replace with real SPARQL protocol implementation
   */
  private async mockQueryExecution(
    query: string,
    endpoint: string,
    signal: AbortSignal
  ): Promise<{ data: SparqlJsonResults; status: number }> {
    // Simulate network delay
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, 1000);
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Query execution cancelled', 'AbortError'));
      });
    });

    // Return mock SPARQL JSON results
    const mockData: SparqlJsonResults = {
      head: {
        vars: ['subject', 'predicate', 'object'],
      },
      results: {
        bindings: [
          {
            subject: {
              type: 'uri',
              value: 'http://example.org/resource/1',
            },
            predicate: {
              type: 'uri',
              value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
            },
            object: {
              type: 'uri',
              value: 'http://example.org/Class',
            },
          },
          {
            subject: {
              type: 'uri',
              value: 'http://example.org/resource/1',
            },
            predicate: {
              type: 'uri',
              value: 'http://www.w3.org/2000/01/rdf-schema#label',
            },
            object: {
              type: 'literal',
              value: 'Example Resource',
              'xml:lang': 'en',
            },
          },
        ],
      },
    };

    console.log('Mock query execution:', { query, endpoint });

    return {
      data: mockData,
      status: 200,
    };
  }
}

/**
 * Singleton instance for global use
 */
export const queryExecutionService = new QueryExecutionService();
