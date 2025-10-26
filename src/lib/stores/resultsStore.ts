import { writable } from 'svelte/store';
import type {
  ResultsState,
  ResultFormat,
  SparqlJsonResults,
  QueryOptions,
  QueryError,
} from '../types';
import { sparqlService } from '../services/sparqlService';

/**
 * Results store for managing query results and execution state
 * Tracks result data, loading state, errors, and view preferences
 */
export function createResultsStore(): {
  subscribe: (_run: (_value: ResultsState) => void) => () => void;
  setData: (_data: SparqlJsonResults, _executionTime?: number) => void;
  setLoading: (_loading: boolean) => void;
  setError: (_error: string) => void;
  clearError: () => void;
  setView: (_view: 'table' | 'raw' | 'graph') => void;
  setFormat: (_format: ResultFormat) => void;
  setExecutionTime: (_executionTime: number) => void;
  setState: (_newState: Partial<ResultsState>) => void;
  executeQuery: (_options: QueryOptions) => Promise<void>;
  cancelQuery: () => void;
  reset: () => void;
} {
  const initialState: ResultsState = {
    data: null,
    format: 'json',
    view: 'table',
    loading: false,
    error: null,
    executionTime: undefined,
  };

  const { subscribe, set, update } = writable<ResultsState>(initialState);

  return {
    subscribe,

    /**
     * Set query results data
     * Automatically clears loading and error states
     */
    setData: (data: SparqlJsonResults, executionTime?: number): void => {
      update((state) => ({
        ...state,
        data,
        loading: false,
        error: null,
        executionTime,
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
     */
    setError: (error: string): void => {
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
     */
    executeQuery: async (options: QueryOptions): Promise<void> => {
      // Set loading state
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const result = await sparqlService.executeQuery(options);

        // Parse the result data based on content type
        let parsedData: SparqlJsonResults;
        if (typeof result.data === 'string') {
          // For non-JSON responses, create a minimal results structure
          // This will be used in the raw view
          parsedData = {
            head: { vars: [] },
            results: { bindings: [] },
          };
          // Store raw data in the state for raw view
          update((state) => ({
            ...state,
            data: parsedData,
            loading: false,
            error: null,
            executionTime: result.executionTime,
            // We could add a rawData field to ResultsState in the future
          }));
        } else {
          // JSON response - use directly
          parsedData = result.data;
          update((state) => ({
            ...state,
            data: parsedData,
            loading: false,
            error: null,
            executionTime: result.executionTime,
          }));
        }
      } catch (error) {
        // Handle errors - preserve QueryError structure or create error message
        let errorValue: string;
        if (error && typeof error === 'object' && 'message' in error) {
          // If it's a QueryError, preserve it
          const queryError = error as QueryError;
          errorValue = queryError.message;

          // Store the full QueryError for detailed display
          // For now, we store just the message, but the error notification
          // will be enhanced to show full QueryError details
          update((state) => ({
            ...state,
            loading: false,
            error: errorValue,
          }));
        } else {
          errorValue = 'An unknown error occurred';
          update((state) => ({
            ...state,
            loading: false,
            error: errorValue,
          }));
        }
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
  };
}

/**
 * Global results store instance
 */
export const resultsStore = createResultsStore();
