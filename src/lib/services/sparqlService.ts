/**
 * SPARQL 1.2 Protocol Service
 * Implements SPARQL query execution with GET and POST support
 * @see https://www.w3.org/TR/sparql12-protocol/
 */

import type {
  QueryType,
  ResultFormat,
  SparqlJsonResults,
  QueryOptions,
  QueryError,
} from '../types';

/**
 * Extended query options with format specification
 */
export interface ExtendedQueryOptions extends QueryOptions {
  /** Desired result format */
  format?: ResultFormat;
}

/**
 * Internal query result with raw data
 */
interface InternalQueryResult {
  /** Raw response text from server (original formatting preserved) */
  raw: string;
  /** Parsed data (JSON object for JSON responses, same as raw for others) */
  data: SparqlJsonResults | string;
  /** Content type from response */
  contentType: string;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * SPARQL Service for executing queries against SPARQL endpoints
 * Supports SPARQL 1.2 Protocol with GET and POST methods
 */
export class SparqlService {
  private defaultTimeout = 60000; // 60 seconds
  private abortController?: AbortController;

  /**
   * Execute a SPARQL query
   * @param options Query options including endpoint, query text, and settings
   * @returns Query result with parsed data and metadata
   * @throws QueryError on failure
   */
  async executeQuery(options: ExtendedQueryOptions): Promise<InternalQueryResult> {
    const {
      endpoint,
      query,
      method = this.determineMethod(query, endpoint),
      format = 'json',
      timeout = this.defaultTimeout,
      headers = {},
      signal,
    } = options;

    // Detect query type
    const queryType = this.detectQueryType(query);

    // Set Accept header based on query type and format
    const acceptHeader = this.getAcceptHeader(queryType, format);

    // Create AbortController for timeout and cancellation
    this.abortController = new AbortController();

    // Link external signal to internal AbortController if provided
    if (signal) {
      signal.addEventListener('abort', () => this.abortController?.abort());
    }

    const timeoutId = setTimeout(() => this.abortController?.abort(), timeout);

    const startTime = Date.now();

    try {
      let response: Response;

      if (method === 'GET') {
        response = await this.executeGet(endpoint, query, acceptHeader, headers);
      } else {
        response = await this.executePost(endpoint, query, acceptHeader, headers);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createErrorFromResponse(response);
      }

      const executionTime = Date.now() - startTime;
      const contentType = response.headers.get('Content-Type') || 'text/plain';
      const parseResult = await this.parseResponse(response, contentType);

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        raw: parseResult.raw,
        data: parseResult.data,
        contentType,
        status: response.status,
        headers: responseHeaders,
        executionTime,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel ongoing query
   */
  cancelQuery(): void {
    this.abortController?.abort();
  }

  /**
   * Determine HTTP method based on full URL length
   * Uses GET for small queries, POST for large ones
   * @param query SPARQL query text
   * @param endpoint SPARQL endpoint URL
   * @returns HTTP method to use
   */
  private determineMethod(query: string, endpoint: string): 'GET' | 'POST' {
    // Construct the actual URL to check total length including encoding
    const url = new URL(endpoint);
    url.searchParams.set('query', query);
    const fullUrl = url.toString();

    // Use conservative limit of 2000 characters for the entire URL
    // This accounts for:
    // - Base endpoint URL
    // - Query parameter name (?query=)
    // - URL encoding overhead (spaces → %20, special chars → %XX, etc.)
    // - Browser and server URL length limitations
    const urlLimit = 2000;
    return fullUrl.length > urlLimit ? 'POST' : 'GET';
  }

  /**
   * Detect query type from query text
   * @param query SPARQL query text
   * @returns Detected query type
   */
  private detectQueryType(query: string): QueryType {
    const normalized = query.trim().toUpperCase();

    if (normalized.startsWith('SELECT')) return 'SELECT';
    if (normalized.startsWith('ASK')) return 'ASK';
    if (normalized.startsWith('CONSTRUCT')) return 'CONSTRUCT';
    if (normalized.startsWith('DESCRIBE')) return 'DESCRIBE';
    if (normalized.match(/^(INSERT|DELETE)/)) return 'UPDATE';

    // Default to SELECT for unknown queries
    return 'SELECT';
  }

  /**
   * Get appropriate Accept header for query type and format
   * @param queryType Type of SPARQL query
   * @param format Desired result format
   * @returns Accept header value with quality preferences
   */
  private getAcceptHeader(queryType: QueryType, format: ResultFormat): string {
    const mimeTypes: Record<ResultFormat, string> = {
      json: 'application/sparql-results+json',
      xml: 'application/sparql-results+xml',
      csv: 'text/csv',
      tsv: 'text/tab-separated-values',
      turtle: 'text/turtle',
      jsonld: 'application/ld+json',
      ntriples: 'application/n-triples',
      rdfxml: 'application/rdf+xml',
    };

    if (queryType === 'SELECT' || queryType === 'ASK') {
      // Prefer requested format for SELECT/ASK, fall back to JSON, then XML
      const preferredMime = mimeTypes[format] || mimeTypes.json;
      return `${preferredMime},${mimeTypes.json};q=0.9,${mimeTypes.xml};q=0.8,*/*;q=0.7`;
    } else {
      // CONSTRUCT/DESCRIBE - RDF formats
      const preferredMime = mimeTypes[format] || mimeTypes.turtle;
      return `${preferredMime},${mimeTypes.turtle};q=0.9,${mimeTypes.jsonld};q=0.8,*/*;q=0.7`;
    }
  }

  /**
   * Execute query via HTTP GET
   * @param endpoint SPARQL endpoint URL
   * @param query SPARQL query text
   * @param accept Accept header value
   * @param customHeaders Additional custom headers
   * @returns Fetch response
   */
  private async executeGet(
    endpoint: string,
    query: string,
    accept: string,
    customHeaders: Record<string, string>
  ): Promise<Response> {
    const url = new URL(endpoint);
    url.searchParams.set('query', query);

    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: accept,
        ...customHeaders,
      },
      signal: this.abortController?.signal,
    });
  }

  /**
   * Execute query via HTTP POST
   * Uses application/sparql-query content type per SPARQL 1.2 Protocol
   * @param endpoint SPARQL endpoint URL
   * @param query SPARQL query text
   * @param accept Accept header value
   * @param customHeaders Additional custom headers
   * @returns Fetch response
   */
  private async executePost(
    endpoint: string,
    query: string,
    accept: string,
    customHeaders: Record<string, string>
  ): Promise<Response> {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: accept,
        'Content-Type': 'application/sparql-query',
        ...customHeaders,
      },
      body: query,
      signal: this.abortController?.signal,
    });
  }

  /**
   * Parse response based on content type
   * Returns both raw text and parsed data to preserve original server formatting
   * @param response Fetch response
   * @param contentType Content-Type header value
   * @returns Object with raw text and parsed data
   */
  private async parseResponse(
    response: Response,
    contentType: string
  ): Promise<{ raw: string; data: SparqlJsonResults | string }> {
    // Always get the raw text first (before parsing consumes the stream)
    const rawText = await response.text();

    // Then parse if it's JSON
    if (
      contentType.includes('application/json') ||
      contentType.includes('application/sparql-results+json')
    ) {
      const parsedData = JSON.parse(rawText) as SparqlJsonResults;
      return { raw: rawText, data: parsedData };
    } else {
      // For XML, CSV, TSV, RDF formats - raw text is the data
      return { raw: rawText, data: rawText };
    }
  }

  /**
   * Create error from HTTP response
   * @param response Failed HTTP response
   * @returns QueryError object
   */
  private async createErrorFromResponse(response: Response): Promise<QueryError> {
    const statusText = response.statusText;
    const status = response.status;
    let message = `HTTP ${status}: ${statusText}`;
    let details: string | undefined;
    let type: 'http' | 'sparql' = 'http';

    try {
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('json')) {
        const errorData = await response.json();
        details = errorData.message || JSON.stringify(errorData, null, 2);
      } else {
        const errorText = await response.text();
        if (errorText) {
          details = errorText;
          // Detect SPARQL syntax errors in response
          if (
            errorText.toLowerCase().includes('syntax') ||
            errorText.toLowerCase().includes('parse') ||
            errorText.toLowerCase().includes('malformed')
          ) {
            type = 'sparql';
          }
        }
      }
    } catch {
      // Ignore parsing errors
    }

    // Enhance message based on status code
    if (status === 400) {
      message = 'Bad Request: Invalid SPARQL query';
      type = 'sparql';
    } else if (status === 401) {
      message = 'Unauthorized: Authentication required';
    } else if (status === 403) {
      message = 'Forbidden: Access denied to this endpoint';
    } else if (status === 404) {
      message = 'Not Found: Endpoint does not exist';
    } else if (status === 408) {
      message = 'Request Timeout: Query took too long to execute';
      type = 'http';
    } else if (status === 500) {
      message = 'Internal Server Error: The SPARQL endpoint encountered an error';
    } else if (status === 502) {
      message = 'Bad Gateway: The SPARQL endpoint is not responding correctly';
    } else if (status === 503) {
      message = 'Service Unavailable: The SPARQL endpoint is temporarily down';
    } else if (status === 504) {
      message = 'Gateway Timeout: The SPARQL endpoint did not respond in time';
    }

    return {
      message,
      type,
      status,
      details,
    };
  }

  /**
   * Handle various error types
   * @param error Raw error object
   * @returns Formatted QueryError
   */
  private handleError(error: unknown): QueryError {
    // Abort/timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        message: 'Query timeout or cancelled',
        type: 'timeout',
        details: 'The query took too long to execute or was cancelled by the user.',
      };
    }

    // Network error (typically CORS or unreachable endpoint)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Try to determine if it's a CORS issue
      const isCors =
        error.message.includes('CORS') ||
        error.message.includes('cross-origin') ||
        error.message.includes('blocked');

      return {
        message: isCors
          ? 'CORS Error: Cross-origin request blocked'
          : 'Network error: Unable to reach endpoint',
        type: isCors ? 'cors' : 'network',
        details: isCors
          ? 'The SPARQL endpoint does not allow cross-origin requests from this domain. Contact the endpoint administrator to enable CORS.'
          : 'Check that the endpoint URL is correct and the server is reachable.',
        originalError: error,
      };
    }

    // Already a QueryError
    if (this.isQueryError(error)) {
      return error;
    }

    // Generic error
    if (error instanceof Error) {
      return {
        message: error.message,
        type: 'unknown',
        originalError: error,
      };
    }

    // Unknown error type
    return {
      message: String(error),
      type: 'unknown',
    };
  }

  /**
   * Type guard for QueryError
   * @param error Unknown error object
   * @returns True if error is QueryError
   */
  private isQueryError(error: unknown): error is QueryError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as QueryError).message === 'string'
    );
  }
}

/**
 * Singleton instance of the SPARQL service
 */
export const sparqlService = new SparqlService();
