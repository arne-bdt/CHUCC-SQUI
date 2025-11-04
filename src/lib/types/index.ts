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
  QueryErrorType,
  ProgressState,
  Tab,
  TabsState,
} from './sparql';

// Query analysis types
export type { QueryAnalysis, QueryThresholds } from '../utils/queryAnalyzer';
export { analyzeQuery, DEFAULT_THRESHOLDS } from '../utils/queryAnalyzer';

// Results parser types
export type { ParsedTableData, ParsedRow, ParsedCell, ParsedResults, ParsedAskResult } from '../utils/resultsParser';

// Service description types
export type {
  ServiceDescription,
  Dataset,
  GraphDescription,
  NamedGraph,
  ExtensionFunction,
  ExtensionAggregate,
  ServiceDescriptionCacheConfig,
  CachedServiceDescription,
} from './serviceDescription';
export { SPARQLLanguage, ServiceFeature } from './serviceDescription';
export type { ResultFormat as ServiceDescriptionResultFormat, InputFormat } from './serviceDescription';
