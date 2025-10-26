import { writable } from 'svelte/store';
import type { ResultsState, ResultFormat, SparqlJsonResults } from '../types';

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
