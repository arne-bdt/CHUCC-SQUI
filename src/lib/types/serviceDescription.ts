/**
 * TypeScript type definitions for SPARQL Service Description
 * Based on W3C SPARQL 1.1 Service Description specification
 * @see https://www.w3.org/TR/sparql11-service-description/
 */

/**
 * SPARQL Service Description containing endpoint metadata and capabilities
 */
export interface ServiceDescription {
  /** SPARQL endpoint URL */
  endpoint: string;

  /** Supported SPARQL languages (e.g., SPARQL 1.0 Query, SPARQL 1.1 Query, SPARQL 1.1 Update) */
  supportedLanguages: SPARQLLanguage[];

  /** Supported service features (e.g., URI dereferencing, union default graph) */
  features: ServiceFeature[];

  /** Supported result formats (MIME types) */
  resultFormats: ResultFormat[];

  /** Supported input formats for RDF data loading (MIME types) */
  inputFormats: InputFormat[];

  /** Extension functions supported by the endpoint */
  extensionFunctions: ExtensionFunction[];

  /** Extension aggregates supported by the endpoint */
  extensionAggregates: ExtensionAggregate[];

  /** Available datasets at the endpoint */
  datasets: Dataset[];

  /** Timestamp when the service description was last fetched */
  lastFetched: Date;

  /** Whether the endpoint supports service description (false if unavailable) */
  available: boolean;
}

/**
 * SPARQL language versions supported by the endpoint
 * @see http://www.w3.org/ns/sparql-service-description
 */
export enum SPARQLLanguage {
  /** SPARQL 1.0 Query Language */
  SPARQL10Query = 'http://www.w3.org/ns/sparql-service-description#SPARQL10Query',

  /** SPARQL 1.1 Query Language */
  SPARQL11Query = 'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',

  /** SPARQL 1.1 Update Language */
  SPARQL11Update = 'http://www.w3.org/ns/sparql-service-description#SPARQL11Update',
}

/**
 * Service features supported by the endpoint
 * @see http://www.w3.org/ns/sparql-service-description
 */
export enum ServiceFeature {
  /** Endpoint dereferences URIs used in FROM/FROM NAMED clauses */
  DereferencesURIs = 'http://www.w3.org/ns/sparql-service-description#DereferencesURIs',

  /** Default graph is the union of all named graphs */
  UnionDefaultGraph = 'http://www.w3.org/ns/sparql-service-description#UnionDefaultGraph',

  /** Endpoint requires dataset specification (FROM/FROM NAMED) */
  RequiresDataset = 'http://www.w3.org/ns/sparql-service-description#RequiresDataset',

  /** Endpoint allows empty graphs */
  EmptyGraphs = 'http://www.w3.org/ns/sparql-service-description#EmptyGraphs',

  /** Endpoint supports basic federated query (SERVICE keyword) */
  BasicFederatedQuery = 'http://www.w3.org/ns/sparql-service-description#BasicFederatedQuery',
}

/**
 * RDF dataset available at the endpoint
 */
export interface Dataset {
  /** Dataset URI (optional) */
  uri?: string;

  /** Default graph descriptions */
  defaultGraphs: GraphDescription[];

  /** Named graph descriptions */
  namedGraphs: NamedGraph[];
}

/**
 * Description of an RDF graph
 */
export interface GraphDescription {
  /** Graph URI (optional) */
  uri?: string;

  /** Entailment regime used for the graph (e.g., RDF, RDFS, OWL) */
  entailmentRegime?: string;

  /** Additional metadata from voiD or other vocabularies */
  metadata?: Record<string, unknown>;
}

/**
 * Named graph with IRI identifier
 */
export interface NamedGraph extends GraphDescription {
  /** Graph IRI name */
  name: string;
}

/**
 * Extension function supported by the endpoint
 */
export interface ExtensionFunction {
  /** Function URI */
  uri: string;

  /** Human-readable label (optional) */
  label?: string;

  /** Function description (optional) */
  comment?: string;
}

/**
 * Extension aggregate function supported by the endpoint
 */
export interface ExtensionAggregate extends ExtensionFunction {}

/**
 * Result format MIME type (e.g., application/sparql-results+json, text/turtle)
 */
export type ResultFormat = string;

/**
 * Input format MIME type for RDF data loading
 */
export type InputFormat = string;

/**
 * Cache configuration for service descriptions
 */
export interface ServiceDescriptionCacheConfig {
  /** Time-to-live in milliseconds (default: 1 hour) */
  ttl: number;

  /** Maximum number of cached descriptions (LRU eviction) */
  maxSize: number;

  /** Enable localStorage persistence */
  persistToStorage: boolean;
}

/**
 * Cached service description entry
 */
export interface CachedServiceDescription {
  /** Service description data */
  description: ServiceDescription;

  /** Cache entry timestamp */
  cachedAt: number;

  /** Last access timestamp (for LRU eviction) */
  lastAccessed: number;
}
