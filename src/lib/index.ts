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
export { queryExecutionService } from './services/queryExecutionService';
export { templateService } from './services/templateService';

// Store exports (for advanced integration)
export { queryStore } from './stores/queryStore';
export { resultsStore } from './stores/resultsStore';
export { endpointCatalogue, defaultEndpoint } from './stores/endpointStore';
export { tabStore } from './stores/tabStore';
