import { writable } from 'svelte/store';
import type { QueryState, QueryType } from '../types';

/**
 * Query store for managing SPARQL query state
 * Tracks query text, endpoint, prefixes, and detected query type
 */
export function createQueryStore(): {
  subscribe: (_run: (_value: QueryState) => void) => () => void;
  setText: (_text: string) => void;
  setEndpoint: (_endpoint: string) => void;
  setPrefixes: (_prefixes: Record<string, string>) => void;
  updatePrefix: (_prefix: string, _uri: string) => void;
  removePrefix: (_prefix: string) => void;
  setType: (_type: QueryType | undefined) => void;
  setState: (_newState: Partial<QueryState>) => void;
  reset: () => void;
} {
  const initialState: QueryState = {
    text: '',
    endpoint: '',
    prefixes: {},
    type: undefined,
  };

  const { subscribe, set, update } = writable<QueryState>(initialState);

  return {
    subscribe,

    /**
     * Set the complete query text
     */
    setText: (text: string): void => {
      update((state) => ({ ...state, text }));
    },

    /**
     * Set the SPARQL endpoint URL
     */
    setEndpoint: (endpoint: string): void => {
      update((state) => ({ ...state, endpoint }));
    },

    /**
     * Set all prefixes at once
     */
    setPrefixes: (prefixes: Record<string, string>): void => {
      update((state) => ({ ...state, prefixes }));
    },

    /**
     * Update or add a single prefix
     */
    updatePrefix: (prefix: string, uri: string): void => {
      update((state) => ({
        ...state,
        prefixes: { ...state.prefixes, [prefix]: uri },
      }));
    },

    /**
     * Remove a prefix
     */
    removePrefix: (prefix: string): void => {
      update((state) => {
        const newPrefixes = { ...state.prefixes };
        delete newPrefixes[prefix];
        return { ...state, prefixes: newPrefixes };
      });
    },

    /**
     * Set the query type (detected or manually set)
     */
    setType: (type: QueryType | undefined): void => {
      update((state) => ({ ...state, type }));
    },

    /**
     * Update the entire query state
     */
    setState: (newState: Partial<QueryState>): void => {
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
 * Global query store instance
 */
export const queryStore = createQueryStore();
