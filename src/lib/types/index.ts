/**
 * Centralized type exports for SQUI
 * Import types from this file for consistent type usage across the codebase
 */

// Configuration types
export type {
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
} from './config';

// SPARQL types
export type {
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
} from './sparql';
