/**
 * Centralized exports for all stores
 */

// Theme store
export { createThemeStore, themeStore, CARBON_THEMES } from './theme';
export type { ThemeState, ThemeStore } from './theme';

// Query store
export { createQueryStore, queryStore } from './queryStore';
export type { QueryStore } from './queryStore';

// Results store
export { createResultsStore, resultsStore } from './resultsStore';
export type { ResultsStore } from './resultsStore';

// UI store
export { createUIStore, uiStore } from './uiStore';
export type { UIState, UIStore } from './uiStore';

// Endpoint store
export {
  createEndpointCatalogueStore,
  createEndpointStore,
  endpointCatalogue,
  defaultEndpoint,
} from './endpointStore';
export type { EndpointCatalogueStore, EndpointStore } from './endpointStore';

// Tab store
export { createTabStore, tabStore } from './tabStore';
export type { TabStore } from './tabStore';

// Service description store
export { createServiceDescriptionStore, serviceDescriptionStore } from './serviceDescriptionStore';
export type { ServiceDescriptionState, ServiceDescriptionStore } from './serviceDescriptionStore';

// Settings store
export { createSettingsStore, settingsStore } from './settingsStore';
export type { Settings, ValidationSettings, SettingsStore } from './settingsStore';

// Re-export types from config
export type { CarbonTheme } from '../types/config';

// Store context utilities
export { getQueryStore, getResultsStore, getUIStore, getEndpointStore } from './storeContext';
export type { QueryStoreContext, ResultsStoreContext, UIStoreContext } from './contextKeys';
