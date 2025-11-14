/**
 * SQUI - SPARQL Query UI Web Component
 * Modern SPARQL query interface built with Svelte 5
 *
 * @packageDocumentation
 */

// Main component export
export { default as SparqlQueryUI } from '../SparqlQueryUI.svelte';

// Type exports
export type {
  // Configuration types
  SquiConfig,
  EndpointConfig,
  Endpoint,
  PrefixConfig,
  QueryTemplate,
  TemplateConfig,
  ThemeConfig,
  LocalizationConfig,
  FeatureFlags,
  LimitsConfig,
  CarbonTheme,
  // SPARQL types
  QueryType,
  ResultFormat,
  SparqlJsonResults,
  SparqlBinding,
  SparqlTerm,
  QueryState,
  ResultsState,
  QueryOptions,
  QueryResult,
  QueryError,
  QueryErrorType,
  Tab,
  TabsState,
} from './types';

// Service exports (for advanced usage)
export { prefixService } from './services/prefixService';
export { sparqlService } from './services/sparqlService';
export { templateService } from './services/templateService';

// Store factory exports (for custom integration - use these to create isolated store instances)
export { createQueryStore } from './stores/queryStore';
export { createResultsStore } from './stores/resultsStore';
export { createUIStore } from './stores/uiStore';
export { createServiceDescriptionStore } from './stores/serviceDescriptionStore';
export { createSettingsStore } from './stores/settingsStore';
export { createThemeStore } from './stores/theme';
export { createTabStore } from './stores/tabStore';

// Endpoint catalogue (shared global state - safe to use globally)
export { endpointCatalogue, defaultEndpoint } from './stores/endpointStore';
