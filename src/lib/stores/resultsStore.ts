import { writable } from 'svelte/store';
import type {
  ResultsState,
  ResultFormat,
  SparqlJsonResults,
  QueryOptions,
  QueryError,
  ProgressState,
} from '../types';
import { sparqlService, type ExtendedQueryOptions } from '../services/sparqlService';
import { prefixService } from '../services/prefixService';

/**
 * Results store for managing query results and execution state
 * Tracks result data, loading state, errors, and view preferences
 */
export function createResultsStore(): {
  subscribe: (_run: (_value: ResultsState) => void) => () => void;
  setData: (_data: SparqlJsonResults, _executionTime?: number, _prefixes?: Record<string, string>) => void;
  setLoading: (_loading: boolean) => void;
  setError: (_error: string | QueryError) => void;
  clearError: () => void;
  setView: (_view: 'table' | 'raw' | 'graph') => void;
  setFormat: (_format: ResultFormat) => void;
  setExecutionTime: (_executionTime: number) => void;
  setState: (_newState: Partial<ResultsState>) => void;
  executeQuery: (_options: ExtendedQueryOptions) => Promise<void>;
  cancelQuery: () => void;
  reset: () => void;
  // Task 33: Chunked loading methods
  enableChunkedLoading: (_chunkSize: number) => void;
  loadNextChunk: (_query: string, _endpoint: string) => Promise<void>;
  appendChunkData: (_data: SparqlJsonResults) => void;
  // STREAMING-02: Progress tracking methods
  setProgress: (_progress: ProgressState) => void;
  clearProgress: () => void;
} {
  const initialState: ResultsState = {
    data: null,
    format: 'json',
    view: 'table',
    loading: false,
    error: null,
    executionTime: undefined,
    prefixes: undefined,
  };

  const { subscribe, set, update } = writable<ResultsState>(initialState);

  return {
    subscribe,

    /**
     * Set query results data
     * Automatically clears loading and error states
     * Task 36: Resets view to 'table' when new data arrives
     * Task 38: Now also sets rawData for download/raw view functionality
     * @param data - SPARQL JSON results
     * @param executionTime - Query execution time in ms
     * @param prefixes - Prefixes from the query for IRI abbreviation
     */
    setData: (data: SparqlJsonResults, executionTime?: number, prefixes?: Record<string, string>): void => {
      // Generate raw data from JSON for raw view and downloads
      const rawData = JSON.stringify(data, null, 2);

      update((state) => ({
        ...state,
        data,
        rawData,
        contentType: 'application/sparql-results+json',
        view: 'table', // Reset to table view when new data arrives
        loading: false,
        error: null,
        executionTime,
        prefixes,
      }));
    },

    /**
     * Set loading state
     */
    setLoading: (loading: boolean): void => {
      update((state) => ({ ...state, loading }));
    },

    /**
     * Set error state
     * Automatically clears loading state
     * Accepts both string and QueryError objects for rich error details
     */
    setError: (error: string | QueryError): void => {
      update((state) => ({
        ...state,
        error,
        loading: false,
      }));
    },

    /**
     * Clear error state
     */
    clearError: (): void => {
      update((state) => ({ ...state, error: null }));
    },

    /**
     * Set the view mode (table, raw, graph)
     */
    setView: (view: 'table' | 'raw' | 'graph'): void => {
      update((state) => ({ ...state, view }));
    },

    /**
     * Set the result format
     */
    setFormat: (format: ResultFormat): void => {
      update((state) => ({ ...state, format }));
    },

    /**
     * Set execution time
     */
    setExecutionTime: (executionTime: number): void => {
      update((state) => ({ ...state, executionTime }));
    },

    /**
     * Update the entire results state
     */
    setState: (newState: Partial<ResultsState>): void => {
      update((state) => ({ ...state, ...newState }));
    },

    /**
     * Execute a SPARQL query
     * Sets loading state, executes query via sparqlService, and updates results
     * Task 37: Now supports format parameter for content negotiation
     */
    executeQuery: async (options: ExtendedQueryOptions): Promise<void> => {
      // Set loading state
      update((state) => ({ ...state, loading: true, error: null }));

      // Parse prefixes from the query
      const queryPrefixes = prefixService.parsePrefixesFromQuery(options.query);

      try {
        const result = await sparqlService.executeQuery(options);

        // Parse the result data based on content type
        // Use the raw response text from the server (preserves original formatting)
        // For JSON: server's original formatting
        // For XML/CSV/TSV: raw text as received
        const rawData = result.raw;

        let parsedData: SparqlJsonResults;

        if (typeof result.data === 'string') {
          // For non-JSON responses (XML, CSV, TSV, RDF formats)
          // Create a minimal results structure for compatibility
          parsedData = {
            head: { vars: [] },
            results: { bindings: [] },
          };
        } else {
          // JSON response - already parsed by service
          parsedData = result.data;
        }

        // Store both parsed and raw data in the state
        update((state) => ({
          ...state,
          data: parsedData,
          rawData, // Original server response (preserves formatting)
          contentType: result.contentType,
          loading: false,
          error: null,
          executionTime: result.executionTime,
          prefixes: queryPrefixes,
        }));
      } catch (error) {
        // Handle errors - preserve QueryError structure for rich error details
        let errorValue: string | QueryError;
        if (error && typeof error === 'object' && 'message' in error) {
          // Preserve the full QueryError object with all details
          errorValue = error as QueryError;
        } else {
          errorValue = 'An unknown error occurred';
        }

        update((state) => ({
          ...state,
          loading: false,
          error: errorValue,
        }));
      }
    },

    /**
     * Cancel ongoing query execution
     */
    cancelQuery: (): void => {
      sparqlService.cancelQuery();
      update((state) => ({
        ...state,
        loading: false,
        error: 'Query cancelled',
      }));
    },

    /**
     * Reset store to initial state
     */
    reset: (): void => {
      set(initialState);
    },

    /**
     * Task 33: Enable chunked loading for large result sets
     * Initializes the chunked loading state
     * @param chunkSize - Number of rows to load per chunk (default: 1000)
     */
    enableChunkedLoading: (chunkSize: number = 1000): void => {
      update((state) => ({
        ...state,
        chunkedLoading: {
          loadingChunk: false,
          currentOffset: 0,
          chunkSize,
          hasMore: true,
          totalLoaded: 0,
        },
      }));
    },

    /**
     * Task 33: Load next chunk of results
     * Re-queries with LIMIT/OFFSET to fetch the next batch
     * @param query - Original SPARQL query (will be modified with LIMIT/OFFSET)
     * @param endpoint - SPARQL endpoint URL
     */
    loadNextChunk: async (query: string, endpoint: string): Promise<void> => {
      let currentState: ResultsState;
      const unsubscribe = subscribe((state) => {
        currentState = state;
      });
      unsubscribe();

      const chunkedLoading = currentState!.chunkedLoading;
      if (!chunkedLoading || chunkedLoading.loadingChunk || !chunkedLoading.hasMore) {
        return; // Already loading or no more data
      }

      // Set loading state for chunk
      update((state) => ({
        ...state,
        chunkedLoading: state.chunkedLoading
          ? { ...state.chunkedLoading, loadingChunk: true }
          : undefined,
      }));

      try {
        // Modify query to add LIMIT and OFFSET
        const modifiedQuery = addLimitOffset(query, chunkedLoading.chunkSize, chunkedLoading.currentOffset);

        // Execute query for the chunk
        const result = await sparqlService.executeQuery({
          endpoint,
          query: modifiedQuery,
        });

        // Handle string responses (non-JSON)
        if (typeof result.data === 'string') {
          console.warn('Chunked loading only works with JSON results');
          update((state) => ({
            ...state,
            chunkedLoading: state.chunkedLoading
              ? {
                  ...state.chunkedLoading,
                  loadingChunk: false,
                  hasMore: false,
                }
              : undefined,
          }));
          return;
        }

        // Check if we got any results
        const resultData = result.data as SparqlJsonResults;
        const hasResults = resultData.results && resultData.results.bindings.length > 0;
        const receivedCount = resultData.results?.bindings.length || 0;

        // Append the chunk data to existing results
        if (hasResults) {
          update((state) => {
            if (!state.data || !state.data.results) {
              return state; // No initial data, can't append
            }

            // Merge bindings
            const mergedBindings = [
              ...state.data.results.bindings,
              ...resultData.results!.bindings,
            ];

            return {
              ...state,
              data: {
                ...state.data,
                results: {
                  bindings: mergedBindings,
                },
              },
              chunkedLoading: state.chunkedLoading
                ? {
                    ...state.chunkedLoading,
                    loadingChunk: false,
                    currentOffset: state.chunkedLoading.currentOffset + receivedCount,
                    totalLoaded: state.chunkedLoading.totalLoaded + receivedCount,
                    hasMore: receivedCount === chunkedLoading.chunkSize, // If we got fewer, no more data
                  }
                : undefined,
            };
          });
        } else {
          // No more results
          update((state) => ({
            ...state,
            chunkedLoading: state.chunkedLoading
              ? {
                  ...state.chunkedLoading,
                  loadingChunk: false,
                  hasMore: false,
                }
              : undefined,
          }));
        }
      } catch (error) {
        // Handle error but don't clear existing data
        console.error('Failed to load chunk:', error);
        update((state) => ({
          ...state,
          chunkedLoading: state.chunkedLoading
            ? {
                ...state.chunkedLoading,
                loadingChunk: false,
                hasMore: false, // Stop trying if we hit an error
              }
            : undefined,
        }));
      }
    },

    /**
     * Task 33: Append chunk data to existing results
     * @param data - Chunk data to append
     */
    appendChunkData: (data: SparqlJsonResults): void => {
      update((state) => {
        if (!state.data || !state.data.results || !data.results) {
          return state; // Can't append without existing data
        }

        const mergedBindings = [...state.data.results.bindings, ...data.results.bindings];

        return {
          ...state,
          data: {
            ...state.data,
            results: {
              bindings: mergedBindings,
            },
          },
        };
      });
    },

    /**
     * STREAMING-02: Set progress state for query execution
     * @param progress - Current progress state
     */
    setProgress: (progress: ProgressState): void => {
      update((state) => ({ ...state, progress }));
    },

    /**
     * STREAMING-02: Clear progress state
     */
    clearProgress: (): void => {
      update((state) => ({ ...state, progress: undefined }));
    },
  };
}

/**
 * Helper: Add LIMIT and OFFSET to a SPARQL query
 * Handles queries with or without existing LIMIT/OFFSET clauses
 * @param query - Original SPARQL query
 * @param limit - Number of results to fetch
 * @param offset - Offset in the result set
 * @returns Modified query with LIMIT and OFFSET
 */
function addLimitOffset(query: string, limit: number, offset: number): string {
  // Remove existing LIMIT and OFFSET clauses (case-insensitive)
  let modifiedQuery = query.replace(/\s+LIMIT\s+\d+/gi, '');
  modifiedQuery = modifiedQuery.replace(/\s+OFFSET\s+\d+/gi, '');

  // Add new LIMIT and OFFSET at the end
  modifiedQuery = modifiedQuery.trim();
  modifiedQuery += ` LIMIT ${limit} OFFSET ${offset}`;

  return modifiedQuery;
}

/**
 * Global results store instance
 */
export const resultsStore = createResultsStore();
