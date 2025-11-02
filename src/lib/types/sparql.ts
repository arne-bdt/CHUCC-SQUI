/**
 * SPARQL-related type definitions
 * Based on W3C SPARQL 1.2 Protocol and JSON Results format
 */

/**
 * SPARQL query types
 */
export type QueryType = 'SELECT' | 'ASK' | 'CONSTRUCT' | 'DESCRIBE' | 'UPDATE';

/**
 * SPARQL result formats for content negotiation
 */
export type ResultFormat =
  | 'json'
  | 'xml'
  | 'csv'
  | 'tsv'
  | 'turtle'
  | 'jsonld'
  | 'ntriples'
  | 'rdfxml';

/**
 * SPARQL JSON Results format (W3C standard)
 * @see https://www.w3.org/TR/sparql11-results-json/
 */
export interface SparqlJsonResults {
  /** Result set header */
  head: {
    /** Variable names in SELECT queries */
    vars: string[];
    /** Optional link information */
    link?: string[];
  };
  /** Query results for SELECT queries */
  results?: {
    /** Array of variable bindings */
    bindings: SparqlBinding[];
  };
  /** Boolean result for ASK queries */
  boolean?: boolean;
}

/**
 * A single result binding (row)
 * Maps variable names to their bound values
 */
export interface SparqlBinding {
  [variable: string]: SparqlTerm;
}

/**
 * A single term in a SPARQL result
 * Can be a URI, literal, or blank node
 */
export interface SparqlTerm {
  /** Type of the term */
  type: 'uri' | 'literal' | 'bnode';
  /** String value of the term */
  value: string;
  /** Language tag for literals (e.g., 'en', 'de') */
  'xml:lang'?: string;
  /** Datatype URI for typed literals */
  datatype?: string;
}

/**
 * Query state management
 * Tracks the current query and its metadata
 */
export interface QueryState {
  /** The SPARQL query text */
  text: string;
  /** Target endpoint URL */
  endpoint: string;
  /** Detected or specified query type */
  type?: QueryType;
  /** Active prefixes for this query */
  prefixes: Record<string, string>;
}

/**
 * Results state management
 * Tracks query results and display state
 */
export interface ResultsState {
  /** The actual result data */
  data: SparqlJsonResults | null;
  /** Current result format */
  format: ResultFormat;
  /** Current view mode */
  view: 'table' | 'raw' | 'graph';
  /** Loading indicator */
  loading: boolean;
  /** Error message or QueryError object if query failed */
  error: string | QueryError | null;
  /** Query execution time in milliseconds */
  executionTime?: number;
  /** Prefixes from the query for IRI abbreviation */
  prefixes?: Record<string, string>;
  /** Task 35: Raw response data for raw view */
  rawData?: string;
  /** Task 35: Content type of the response */
  contentType?: string;
  /** Task 33: Chunked loading state */
  chunkedLoading?: {
    /** Currently loading next chunk */
    loadingChunk: boolean;
    /** Current offset in the result set */
    currentOffset: number;
    /** Chunk size for each fetch */
    chunkSize: number;
    /** Whether there are more results to load */
    hasMore: boolean;
    /** Total number of results loaded so far */
    totalLoaded: number;
  };
}

/**
 * Query execution options
 */
export interface QueryOptions {
  /** SPARQL endpoint URL */
  endpoint: string;
  /** SPARQL query text */
  query: string;
  /** HTTP method (GET or POST) */
  method?: 'GET' | 'POST';
  /** Additional HTTP headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Query execution result
 */
export interface QueryResult {
  /** Result data */
  data: SparqlJsonResults;
  /** Execution time in milliseconds */
  executionTime: number;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
}

/**
 * Error types for query execution failures
 */
export type QueryErrorType =
  | 'network' // Network connection failure
  | 'cors' // CORS policy violation
  | 'timeout' // Request timeout or user cancellation
  | 'http' // HTTP error (4xx, 5xx)
  | 'sparql' // SPARQL syntax or semantic error
  | 'parse' // Response parsing error
  | 'unknown'; // Unknown error type

/**
 * Query error information
 */
export interface QueryError {
  /** Error message */
  message: string;
  /** Error type for categorization */
  type?: QueryErrorType;
  /** HTTP status code if available */
  status?: number;
  /** Detailed error information */
  details?: string;
  /** Original error object */
  originalError?: Error;
}

/**
 * Tab state for managing multiple query tabs
 * Each tab has its own query, endpoint, and results state
 */
export interface Tab {
  /** Unique tab identifier */
  id: string;
  /** Display name for the tab */
  name: string;
  /** Query state for this tab */
  query: QueryState;
  /** Results state for this tab */
  results: ResultsState;
  /** Timestamp of last modification (for persistence expiry) */
  lastModified: number;
}

/**
 * Tabs state management
 * Manages multiple tabs and tracks the active tab
 */
export interface TabsState {
  /** Array of all tabs */
  tabs: Tab[];
  /** ID of the currently active tab */
  activeTabId: string | null;
}
