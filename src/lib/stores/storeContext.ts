/**
 * Store context utilities
 *
 * Provides type-safe access to stores from context with fallback to global instances
 */

import { getContext, hasContext } from 'svelte';
import { queryStore as globalQueryStore } from './queryStore';
import { resultsStore as globalResultsStore } from './resultsStore';
import { uiStore as globalUIStore } from './uiStore';
import { defaultEndpoint as globalEndpointStore } from './endpointStore';
import { serviceDescriptionStore as globalServiceDescriptionStore } from './serviceDescriptionStore';
import { settingsStore as globalSettingsStore } from './settingsStore';
import { themeStore as globalThemeStore } from './theme';
import type {
  QueryStoreContext,
  ResultsStoreContext,
  UIStoreContext,
} from './contextKeys';

/**
 * Get query store from context with fallback to global instance
 *
 * @returns Query store instance
 */
export function getQueryStore(): QueryStoreContext {
  if (hasContext('queryStore')) {
    return getContext<QueryStoreContext>('queryStore');
  }
  return globalQueryStore;
}

/**
 * Get results store from context with fallback to global instance
 *
 * @returns Results store instance
 */
export function getResultsStore(): ResultsStoreContext {
  if (hasContext('resultsStore')) {
    return getContext<ResultsStoreContext>('resultsStore');
  }
  return globalResultsStore;
}

/**
 * Get UI store from context with fallback to global instance
 *
 * @returns UI store instance
 */
export function getUIStore(): UIStoreContext {
  if (hasContext('uiStore')) {
    return getContext<UIStoreContext>('uiStore');
  }
  return globalUIStore;
}

/**
 * Get endpoint store from context with fallback to global instance
 *
 * @returns Endpoint store (writable)
 */
export function getEndpointStore() {
  if (hasContext('endpointStore')) {
    return getContext('endpointStore');
  }
  return globalEndpointStore;
}

/**
 * Get service description store from context with fallback to global instance
 *
 * @returns Service description store instance
 */
export function getServiceDescriptionStore() {
  if (hasContext('serviceDescriptionStore')) {
    return getContext('serviceDescriptionStore');
  }
  return globalServiceDescriptionStore;
}

/**
 * Get settings store from context with fallback to global instance
 *
 * @returns Settings store instance
 */
export function getSettingsStore() {
  if (hasContext('settingsStore')) {
    return getContext('settingsStore');
  }
  return globalSettingsStore;
}

/**
 * Get theme store from context with fallback to global instance
 *
 * @returns Theme store instance
 */
export function getThemeStore() {
  if (hasContext('themeStore')) {
    return getContext('themeStore');
  }
  return globalThemeStore;
}
