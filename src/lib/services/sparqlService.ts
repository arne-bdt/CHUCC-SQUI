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
  ProgressState,
} from '../types';
import { performanceService } from './performanceService';

/**
 * Extended query options with format specification and progress callback
 */
export interface ExtendedQueryOptions extends QueryOptions {
  /** Desired result format (short name like 'json', 'turtle') */
  format?: ResultFormat;
  /** Accept MIME type for content negotiation (overrides format) */
  acceptFormat?: string;
  /** STREAMING-02: Progress callback for UI feedback */
  onProgress?: (progress: ProgressState) => void;
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
      format = 'json',
      acceptFormat,
      timeout = this.defaultTimeout,
      headers = {},
      signal,
      onProgress,
    } = options;

    // Start performance profiling
    const profiler = performanceService.startProfiling();

    // Detect query type FIRST (needed for method determination)
    const queryType = this.detectQueryType(query);

    // Determine method based on query type and URL length
    const method = options.method ?? this.determineMethod(query, endpoint, queryType);

    // Set Accept header based on query type and format
    // Use acceptFormat (MIME type) if provided, otherwise convert format short name
    const acceptHeader = acceptFormat || this.getAcceptHeader(queryType, format);

    // Create AbortController for timeout and cancellation
    this.abortController = new AbortController();

    // Link external signal to internal AbortController if provided
    if (signal) {
      signal.addEventListener('abort', () => this.abortController?.abort());
    }

    const timeoutId = setTimeout(() => this.abortController?.abort(), timeout);

    const startTime = Date.now();

    try {
      // STREAMING-02: Phase 1 - Executing query
      onProgress?.({
        phase: 'executing',
        startTime: Date.now(),
      });

      let response: Response;

      if (method === 'GET') {
        response = await this.executeGet(endpoint, query, acceptHeader, headers);
      } else {
        response = await this.executePost(endpoint, query, queryType, acceptHeader, headers);
      }

      // Mark first byte received
      profiler.markFirstByte();

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.createErrorFromResponse(response, acceptHeader);
      }

      const contentType = response.headers.get('Content-Type') || 'text/plain';

      // STREAMING-02: Phase 2 - Downloading response with progress tracking
      const parseResult = await this.downloadAndParseResponse(
        response,
        contentType,
        profiler,
        onProgress
      );

      const executionTime = Date.now() - startTime;

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Record performance metrics
      const rowCount = this.getRowCount(parseResult.data);
      const columnCount = this.getColumnCount(parseResult.data);

      performanceService.recordMetrics(
        profiler.complete({
          responseBytes: new Blob([parseResult.raw]).size,
          rowCount,
          columnCount,
          endpoint,
          format,
          queryType,
        })
      );

      // STREAMING-02: Phase 4 - Rendering (final phase before returning)
      onProgress?.({
        phase: 'rendering',
        startTime: Date.now(),
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
   * Determine HTTP method based on query type and full URL length
   * UPDATE queries MUST use POST per SPARQL 1.2 Protocol
   * Other queries use GET for small queries, POST for large ones
   * @param query SPARQL query text
   * @param endpoint SPARQL endpoint URL
   * @param queryType Type of SPARQL query
   * @returns HTTP method to use
   */
  private determineMethod(query: string, endpoint: string, queryType: QueryType): 'GET' | 'POST' {
    // SPARQL 1.2 Protocol: UPDATE operations MUST use POST
    // See: https://www.w3.org/TR/sparql12-protocol/#update-operation
    if (queryType === 'UPDATE') {
      return 'POST';
    }

    // For non-UPDATE queries, check URL length
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

    // Skip PREFIX and BASE declarations to find the actual query operation
    // PREFIX/BASE can be on same line or different lines, handle both cases
    // Match PREFIX/BASE followed by IRI declarations until we hit the query keyword
    const withoutPrefixes = normalized.replace(
      /^\s*((?:PREFIX|BASE)\s+\S+\s*<[^>]+>\s*)+/g,
      ''
    ).trim();

    if (withoutPrefixes.startsWith('SELECT')) return 'SELECT';
    if (withoutPrefixes.startsWith('ASK')) return 'ASK';
    if (withoutPrefixes.startsWith('CONSTRUCT')) return 'CONSTRUCT';
    if (withoutPrefixes.startsWith('DESCRIBE')) return 'DESCRIBE';

    // SPARQL 1.2 UPDATE operations (must use POST with application/sparql-update)
    // See: https://www.w3.org/TR/sparql12-update/#updateLanguage
    const updateOperations = /^(INSERT|DELETE|LOAD|CLEAR|CREATE|DROP|COPY|MOVE|ADD)/;
    if (updateOperations.test(withoutPrefixes)) return 'UPDATE';

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
   * Uses appropriate Content-Type per SPARQL 1.2 Protocol:
   * - application/sparql-update for UPDATE operations
   * - application/sparql-query for SELECT/ASK/CONSTRUCT/DESCRIBE
   * @param endpoint SPARQL endpoint URL
   * @param query SPARQL query text
   * @param queryType Type of SPARQL query
   * @param accept Accept header value
   * @param customHeaders Additional custom headers
   * @returns Fetch response
   */
  private async executePost(
    endpoint: string,
    query: string,
    queryType: QueryType,
    accept: string,
    customHeaders: Record<string, string>
  ): Promise<Response> {
    // SPARQL 1.2 Protocol: UPDATE uses application/sparql-update
    // See: https://www.w3.org/TR/sparql12-protocol/#update-operation
    const contentType =
      queryType === 'UPDATE' ? 'application/sparql-update' : 'application/sparql-query';

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: accept,
        'Content-Type': contentType,
        ...customHeaders,
      },
      body: query,
      signal: this.abortController?.signal,
    });
  }

  /**
   * STREAMING-02: Download and parse response with progress tracking
   * Streams the response to track download progress and provide user feedback
   * @param response Fetch response
   * @param contentType Content-Type header value
   * @param profiler Performance profiler instance
   * @param onProgress Progress callback for UI updates
   * @returns Object with raw text and parsed data
   */
  private async downloadAndParseResponse(
    response: Response,
    contentType: string,
    profiler: ReturnType<typeof performanceService.startProfiling>,
    onProgress?: (progress: ProgressState) => void
  ): Promise<{ raw: string; data: SparqlJsonResults | string }> {
    const reader = response.body?.getReader();

    if (!reader) {
      // Fallback to non-streaming if no reader available
      return this.parseResponse(response, contentType, profiler);
    }

    const contentLength = response.headers.get('Content-Length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : undefined;

    let bytesReceived = 0;
    const chunks: BlobPart[] = [];
    const downloadStartTime = Date.now();
    let lastProgressUpdate = 0;
    const progressUpdateInterval = 100; // Update at most every 100ms (10 Hz)

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        bytesReceived += value.length;

        // Throttle progress updates to avoid excessive DOM updates
        const now = Date.now();
        if (now - lastProgressUpdate >= progressUpdateInterval) {
          const elapsed = (now - downloadStartTime) / 1000;
          const downloadSpeed = elapsed > 0 ? bytesReceived / elapsed : 0;

          onProgress?.({
            phase: 'downloading',
            startTime: downloadStartTime,
            bytesReceived,
            totalBytes,
            downloadSpeed,
          });

          lastProgressUpdate = now;
        }
      }

      // Final progress update with complete download
      const finalElapsed = (Date.now() - downloadStartTime) / 1000;
      const finalSpeed = finalElapsed > 0 ? bytesReceived / finalElapsed : 0;
      onProgress?.({
        phase: 'downloading',
        startTime: downloadStartTime,
        bytesReceived,
        totalBytes,
        downloadSpeed: finalSpeed,
      });

      // Reconstruct response text from chunks
      const blob = new Blob(chunks);
      const rawText = await blob.text();

      // Mark download complete
      profiler.markDownloadComplete();

      // STREAMING-02: Phase 3 - Parsing
      onProgress?.({
        phase: 'parsing',
        startTime: Date.now(),
      });

      // Then parse if it's JSON
      if (
        contentType.includes('application/json') ||
        contentType.includes('application/sparql-results+json')
      ) {
        const parsedData = JSON.parse(rawText) as SparqlJsonResults;

        // Mark parse complete
        profiler.markParseComplete();

        return { raw: rawText, data: parsedData };
      } else {
        // For XML, CSV, TSV, RDF formats - raw text is the data
        // No parsing needed, so mark parse complete immediately
        profiler.markParseComplete();

        return { raw: rawText, data: rawText };
      }
    } catch (error) {
      // Clean up reader on error
      try {
        reader.cancel();
      } catch {
        // Ignore cancel errors
      }
      throw error;
    }
  }

  /**
   * Parse response based on content type
   * Returns both raw text and parsed data to preserve original server formatting
   * @param response Fetch response
   * @param contentType Content-Type header value
   * @param profiler Performance profiler instance
   * @returns Object with raw text and parsed data
   */
  private async parseResponse(
    response: Response,
    contentType: string,
    profiler: ReturnType<typeof performanceService.startProfiling>
  ): Promise<{ raw: string; data: SparqlJsonResults | string }> {
    // Always get the raw text first (before parsing consumes the stream)
    const rawText = await response.text();

    // Mark download complete
    profiler.markDownloadComplete();

    // Then parse if it's JSON
    if (
      contentType.includes('application/json') ||
      contentType.includes('application/sparql-results+json')
    ) {
      const parsedData = JSON.parse(rawText) as SparqlJsonResults;

      // Mark parse complete
      profiler.markParseComplete();

      return { raw: rawText, data: parsedData };
    } else {
      // For XML, CSV, TSV, RDF formats - raw text is the data
      // No parsing needed, so mark parse complete immediately
      profiler.markParseComplete();

      return { raw: rawText, data: rawText };
    }
  }

  /**
   * Create error from HTTP response
   * @param response Failed HTTP response
   * @param requestedFormat Requested Accept header format
   * @returns QueryError object
   */
  private async createErrorFromResponse(response: Response, requestedFormat?: string): Promise<QueryError> {
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
    } else if (status === 406) {
      // Not Acceptable: Content negotiation failed
      message = 'Not Acceptable: Requested format not supported by endpoint';
      if (requestedFormat) {
        details = `The endpoint does not support the requested format: ${requestedFormat}.\n\nTry a different format or check the endpoint's supported formats in Service Description.`;
      }
      type = 'http';
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
          ? `The SPARQL endpoint does not allow cross-origin requests from this domain.

Possible solutions:
• Use a CORS proxy service (e.g., https://corsproxy.io or https://cors-anywhere.herokuapp.com)
• For development: Use browser extensions to disable CORS (not recommended for production)
• Contact the endpoint administrator to enable CORS headers (Access-Control-Allow-Origin)
• Set up your own proxy server to forward requests

Note: CORS (Cross-Origin Resource Sharing) is a browser security feature that restricts web pages from making requests to different domains. Many public SPARQL endpoints lack proper CORS configuration.`
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

  /**
   * Get row count from parsed data
   * @param data Parsed query result
   * @returns Number of rows
   */
  private getRowCount(data: SparqlJsonResults | string): number {
    if (typeof data === 'string') {
      // For CSV/TSV, count lines (rough estimate)
      return Math.max(0, data.split('\n').length - 1); // Subtract header row
    }

    // For JSON results
    if ('results' in data && data.results && 'bindings' in data.results) {
      return data.results.bindings.length;
    }

    // For boolean (ASK query)
    if ('boolean' in data) {
      return 1;
    }

    return 0;
  }

  /**
   * Get column count from parsed data
   * @param data Parsed query result
   * @returns Number of columns
   */
  private getColumnCount(data: SparqlJsonResults | string): number {
    if (typeof data === 'string') {
      // For CSV/TSV, count columns from first line
      const firstLine = data.split('\n')[0];
      if (!firstLine) return 0;
      // Detect delimiter (comma or tab)
      const delimiter = firstLine.includes('\t') ? '\t' : ',';
      return firstLine.split(delimiter).length;
    }

    // For JSON results
    if ('head' in data && data.head && 'vars' in data.head) {
      return data.head.vars.length;
    }

    // For boolean (ASK query)
    if ('boolean' in data) {
      return 1;
    }

    return 0;
  }
}

/**
 * Singleton instance of the SPARQL service
 */
export const sparqlService = new SparqlService();
