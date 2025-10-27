/**
 * Query Execution Service
 * Handles SPARQL query execution against endpoints
 * Uses the real SPARQL Protocol implementation from Task 16
 */

import { resultsStore } from '../stores/resultsStore';
import { sparqlService } from './sparqlService';
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
      // Execute query using real SPARQL Protocol implementation
      const result = await sparqlService.executeQuery({
        endpoint,
        query,
        timeout,
        signal: this.currentController.signal,
      });

      const executionTime = Date.now() - startTime;

      // Parse the result data
      let parsedData: SparqlJsonResults;
      if (typeof result.data === 'string') {
        // For non-JSON responses, create a minimal results structure
        parsedData = {
          head: { vars: [] },
          results: { bindings: [] },
        };
      } else {
        parsedData = result.data;
      }

      // Update results store
      resultsStore.setData(parsedData, executionTime);

      return {
        data: parsedData,
        executionTime,
        status: result.status,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Handle abort - check for:
      // 1. Raw AbortError (name === 'AbortError')
      // 2. QueryError with type === 'timeout' (from sparqlService.handleError)
      const isAbortError =
        (error instanceof Error && error.name === 'AbortError') ||
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error &&
          typeof error === 'object' &&
          'type' in error &&
          error.type === 'timeout');

      if (isAbortError) {
        const cancelMessage = 'Query execution cancelled';
        resultsStore.setError(cancelMessage);
        throw new Error(cancelMessage);
      }

      // Handle other errors
      // Check for QueryError (has message property), Error, or unknown
      let errorMessage = 'Unknown error occurred';
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }

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
}

/**
 * Singleton instance for global use
 */
export const queryExecutionService = new QueryExecutionService();
