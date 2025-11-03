/**
 * Query Execution Service
 * Handles SPARQL query execution against endpoints
 * Uses the real SPARQL Protocol implementation from Task 16
 */

import { resultsStore } from '../stores/resultsStore';
import { sparqlService } from './sparqlService';
import { analyzeQuery, type QueryAnalysis } from '../utils/queryAnalyzer';
import { parseResults } from '../utils/resultsParser';
import { workerParserService, isWorkerSupported } from './workerParserService';
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
 * Parsing strategy type
 */
type ParsingStrategy = 'main-thread' | 'worker' | 'chunked-worker';

/**
 * Select parsing strategy based on result size
 * @param responseSize - Response size in bytes
 * @param rowCount - Estimated row count (if known)
 * @returns Parsing strategy to use
 */
function selectParsingStrategy(responseSize: number, rowCount?: number): ParsingStrategy {
  // Small: main thread (fastest, least overhead)
  if (responseSize < 1_000_000 || (rowCount && rowCount < 5000)) {
    return 'main-thread';
  }

  // Very large: chunked worker (progressive)
  if (responseSize > 10_000_000 || (rowCount && rowCount > 50000)) {
    return 'chunked-worker';
  }

  // Large: worker (non-blocking)
  return 'worker';
}

/**
 * Query Execution Service
 * Manages SPARQL query execution with loading states and cancellation
 */
export class QueryExecutionService {
  private currentController: AbortController | null = null;

  /**
   * Analyzes a query before execution to check for potential issues
   * @param query - The SPARQL query to analyze
   * @returns Query analysis with recommendations and warnings
   */
  analyzeQueryBeforeExecution(query: string): QueryAnalysis {
    return analyzeQuery(query);
  }

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
      // STREAMING-02: Wire progress callbacks to results store
      const result = await sparqlService.executeQuery({
        endpoint,
        query,
        timeout,
        signal: this.currentController.signal,
        onProgress: (progress) => {
          resultsStore.setProgress(progress);
        },
      });

      const executionTime = Date.now() - startTime;

      // Parse the result data with adaptive strategy
      let parsedData: SparqlJsonResults;
      if (typeof result.data === 'string') {
        // For non-JSON responses, create a minimal results structure
        parsedData = {
          head: { vars: [] },
          results: { bindings: [] },
        };
      } else {
        parsedData = result.data;

        // STREAMING-05: Adaptive parsing strategy for large result sets
        // Determine parsing strategy based on response size
        const responseSize = result.raw.length;
        const estimatedRows = parsedData.results?.bindings?.length || 0;
        const strategy = selectParsingStrategy(responseSize, estimatedRows);

        // Apply parsing strategy
        if (strategy === 'main-thread') {
          // Fast path: parse on main thread (small results)
          resultsStore.setProgress({ phase: 'parsing', startTime: Date.now() });
          const parsed = parseResults(parsedData);

          // For table results, update store with parsed data
          if ('rows' in parsed) {
            // Update results store with execution time and prefixes
            resultsStore.setData(parsedData, executionTime);
          }
        } else if (isWorkerSupported()) {
          // Worker path: non-blocking parse (large results)
          resultsStore.setProgress({
            phase: 'parsing',
            startTime: Date.now(),
            totalRows: estimatedRows,
          });

          try {
            await workerParserService.parse({
              results: parsedData,
              maxRows: undefined, // Use default maxRows from settings
              chunkSize: strategy === 'chunked-worker' ? 1000 : undefined,
              onProgress: (progress) => {
                resultsStore.setProgress({
                  phase: 'parsing',
                  startTime: Date.now(),
                  rowsParsed: progress.rowsParsed,
                  totalRows: progress.totalRows,
                });
              },
              signal: this.currentController.signal,
            });

            // Update results store after parsing
            resultsStore.setData(parsedData, executionTime);
          } catch (parseError) {
            console.warn('Worker parsing failed, falling back to main thread:', parseError);
            // Fallback to main thread parsing
            resultsStore.setProgress({ phase: 'parsing', startTime: Date.now() });
            const parsed = parseResults(parsedData);
            if ('rows' in parsed) {
              resultsStore.setData(parsedData, executionTime);
            }
          }
        } else {
          // Fallback: Workers not supported, use main thread
          console.warn('Web Workers not supported, using main thread parsing');
          resultsStore.setProgress({ phase: 'parsing', startTime: Date.now() });
          const parsed = parseResults(parsedData);
          if ('rows' in parsed) {
            resultsStore.setData(parsedData, executionTime);
          }
        }
      }

      // Clear progress state after successful completion
      resultsStore.clearProgress();

      return {
        data: parsedData,
        executionTime,
        status: result.status,
      };
    } catch (error) {
      // Clear progress state on error
      resultsStore.clearProgress();

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
