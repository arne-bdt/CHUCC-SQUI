/**
 * Store context utilities
 *
 * Provides type-safe access to stores from Svelte context.
 * All stores must be provided by a StoreProvider component.
 * Throws clear errors if StoreProvider is not present (fail fast).
 */

import { getContext } from 'svelte';
import type {
  QueryStoreContext,
  ResultsStoreContext,
  UIStoreContext,
} from './contextKeys';

/**
 * Get query store from context
 *
 * @returns Query store instance
 * @throws Error if StoreProvider is not present
 */
export function getQueryStore(): QueryStoreContext {
  const store = getContext<QueryStoreContext>('queryStore');

  if (!store) {
    throw new Error(
      '[SQUI] queryStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get results store from context
 *
 * @returns Results store instance
 * @throws Error if StoreProvider is not present
 */
export function getResultsStore(): ResultsStoreContext {
  const store = getContext<ResultsStoreContext>('resultsStore');

  if (!store) {
    throw new Error(
      '[SQUI] resultsStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get UI store from context
 *
 * @returns UI store instance
 * @throws Error if StoreProvider is not present
 */
export function getUIStore(): UIStoreContext {
  const store = getContext<UIStoreContext>('uiStore');

  if (!store) {
    throw new Error(
      '[SQUI] uiStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get endpoint store from context
 *
 * @returns Endpoint store (writable)
 * @throws Error if StoreProvider is not present
 */
export function getEndpointStore() {
  const store = getContext('endpointStore');

  if (!store) {
    throw new Error(
      '[SQUI] endpointStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get service description store from context
 *
 * @returns Service description store instance
 * @throws Error if StoreProvider is not present
 */
export function getServiceDescriptionStore() {
  const store = getContext('serviceDescriptionStore');

  if (!store) {
    throw new Error(
      '[SQUI] serviceDescriptionStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get settings store from context
 *
 * @returns Settings store instance
 * @throws Error if StoreProvider is not present
 */
export function getSettingsStore() {
  const store = getContext('settingsStore');

  if (!store) {
    throw new Error(
      '[SQUI] settingsStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get theme store from context
 *
 * @returns Theme store instance
 * @throws Error if StoreProvider is not present
 */
export function getThemeStore() {
  const store = getContext('themeStore');

  if (!store) {
    throw new Error(
      '[SQUI] themeStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}
