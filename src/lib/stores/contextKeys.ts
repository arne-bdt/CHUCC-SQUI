/**
 * Context keys for store injection
 *
 * Using typed symbols ensures type safety and prevents naming collisions
 */

export const QUERY_STORE_KEY = Symbol('queryStore');
export const RESULTS_STORE_KEY = Symbol('resultsStore');
export const UI_STORE_KEY = Symbol('uiStore');
export const ENDPOINT_STORE_KEY = Symbol('endpointStore');

// Type exports for context values
export type QueryStoreContext = ReturnType<typeof import('./queryStore').createQueryStore>;
export type ResultsStoreContext = ReturnType<
  typeof import('./resultsStore').createResultsStore
>;
export type UIStoreContext = ReturnType<typeof import('./uiStore').createUIStore>;
