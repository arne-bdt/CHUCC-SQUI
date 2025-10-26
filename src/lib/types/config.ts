/**
 * Component configuration types
 * Defines all configuration options for the SQUI component
 */

/**
 * Carbon Design System theme names
 */
export type CarbonTheme = 'white' | 'g10' | 'g90' | 'g100';

/**
 * Main component configuration interface
 * All properties are optional with sensible defaults
 */
export interface SquiConfig {
  /** Endpoint configuration */
  endpoint?: EndpointConfig;
  /** Prefix configuration for SPARQL queries */
  prefixes?: PrefixConfig;
  /** Query template configuration */
  templates?: TemplateConfig;
  /** Theme configuration */
  theme?: ThemeConfig;
  /** Localization configuration */
  localization?: LocalizationConfig;
  /** Feature flags to enable/disable functionality */
  features?: FeatureFlags;
  /** Limits for query execution and results */
  limits?: LimitsConfig;
}

/**
 * Endpoint configuration
 * Defines SPARQL endpoint settings
 */
export interface EndpointConfig {
  /** Default endpoint URL */
  url?: string;
  /** Catalogue of known endpoints for selection */
  catalogue?: Endpoint[];
  /** Hide the endpoint selector (useful when endpoint is fixed) */
  hideSelector?: boolean;
}

/**
 * Single endpoint definition
 */
export interface Endpoint {
  /** Endpoint URL (required) */
  url: string;
  /** Display name for the endpoint */
  name: string;
  /** Optional description of the endpoint */
  description?: string;
}

/**
 * Prefix configuration for SPARQL queries
 */
export interface PrefixConfig {
  /** Default prefixes to include in new queries */
  default?: Record<string, string>;
  /** Hook to discover prefixes from an endpoint */
  discoveryHook?: (_endpoint: string) => Promise<Record<string, string>>;
}

/**
 * Query template definition
 */
export interface QueryTemplate {
  /** Template name for identification */
  name: string;
  /** Template description */
  description?: string;
  /** The SPARQL query template text */
  query: string;
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  /** Default template for new queries */
  default?: string;
  /** Custom templates provided by integrator */
  custom?: QueryTemplate[];
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Carbon Design System theme */
  theme?: CarbonTheme;
}

/**
 * Localization configuration
 */
export interface LocalizationConfig {
  /** Locale code (e.g., 'en', 'de', 'fr') */
  locale?: string;
  /** Custom translation strings */
  strings?: Record<string, string>;
}

/**
 * Feature flags to enable/disable functionality
 */
export interface FeatureFlags {
  /** Enable multiple query tabs */
  enableTabs?: boolean;
  /** Enable result filtering */
  enableFilters?: boolean;
  /** Enable result downloads */
  enableDownloads?: boolean;
  /** Enable query sharing */
  enableSharing?: boolean;
  /** Enable query history */
  enableHistory?: boolean;
}

/**
 * Limits configuration for query execution
 */
export interface LimitsConfig {
  /** Maximum number of result rows to display */
  maxRows?: number;
  /** Chunk size for progressive loading */
  chunkSize?: number;
  /** Query execution timeout in milliseconds */
  timeout?: number;
}
