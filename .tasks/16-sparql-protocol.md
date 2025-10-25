# Task 16: SPARQL Protocol Query Execution

**Phase:** SPARQL Protocol
**Status:** TODO
**Dependencies:** 04, 15
**Estimated Effort:** 4-5 hours

## Objective

Implement SPARQL 1.2 Protocol compliant query execution with support for GET and POST methods, different query types, and proper error handling.

## Requirements

Per specification sections 1.5 and 1.6:
- Support HTTP GET and POST per SPARQL Protocol
- Handle SELECT, ASK, CONSTRUCT, DESCRIBE, UPDATE query types
- Send appropriate Accept headers
- Follow redirects and handle CORS
- Implement request timeout
- Support query cancellation via AbortController

## Implementation Steps

1. Create `src/lib/services/sparqlService.ts`:
   ```typescript
   import type { QueryType, ResultFormat, SparqlJsonResults } from '../types';

   export interface QueryOptions {
     endpoint: string;
     query: string;
     method?: 'GET' | 'POST';
     format?: ResultFormat;
     timeout?: number;
     headers?: Record<string, string>;
   }

   export interface QueryResult {
     data: string | SparqlJsonResults; // Raw or parsed
     contentType: string;
     status: number;
   }

   export class SparqlService {
     private defaultTimeout = 60000; // 60 seconds
     private abortController?: AbortController;

     /**
      * Execute a SPARQL query
      */
     async executeQuery(options: QueryOptions): Promise<QueryResult> {
       const {
         endpoint,
         query,
         method = this.determineMethod(query),
         format = 'json',
         timeout = this.defaultTimeout,
         headers = {}
       } = options;

       // Detect query type
       const queryType = this.detectQueryType(query);

       // Set Accept header based on query type and format
       const acceptHeader = this.getAcceptHeader(queryType, format);

       // Create AbortController for timeout and cancellation
       this.abortController = new AbortController();
       const timeoutId = setTimeout(() => this.abortController?.abort(), timeout);

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

         const contentType = response.headers.get('Content-Type') || 'text/plain';
         const data = await this.parseResponse(response, contentType);

         return {
           data,
           contentType,
           status: response.status
         };
       } catch (error) {
         clearTimeout(timeoutId);
         throw this.handleError(error);
       }
     }

     /**
      * Cancel ongoing query
      */
     cancelQuery() {
       this.abortController?.abort();
     }

     /**
      * Determine HTTP method based on query length
      */
     private determineMethod(query: string): 'GET' | 'POST' {
       // Use GET for small queries, POST for large ones
       const threshold = 2000; // characters
       return query.length > threshold ? 'POST' : 'GET';
     }

     /**
      * Detect query type from query text
      */
     private detectQueryType(query: string): QueryType {
       const normalized = query.trim().toUpperCase();

       if (normalized.startsWith('SELECT')) return 'SELECT';
       if (normalized.startsWith('ASK')) return 'ASK';
       if (normalized.startsWith('CONSTRUCT')) return 'CONSTRUCT';
       if (normalized.startsWith('DESCRIBE')) return 'DESCRIBE';
       if (normalized.match(/^(INSERT|DELETE)/)) return 'UPDATE';

       return 'SELECT'; // Default
     }

     /**
      * Get appropriate Accept header for query type and format
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
         rdfxml: 'application/rdf+xml'
       };

       if (queryType === 'SELECT' || queryType === 'ASK') {
         // Prefer JSON for SELECT/ASK, fall back to XML
         return format === 'json'
           ? `${mimeTypes.json},${mimeTypes.xml};q=0.9,*/*;q=0.8`
           : `${mimeTypes[format]},${mimeTypes.json};q=0.9,*/*;q=0.8`;
       } else {
         // CONSTRUCT/DESCRIBE - RDF formats
         return `${mimeTypes[format]},${mimeTypes.turtle};q=0.9,*/*;q=0.8`;
       }
     }

     /**
      * Execute query via HTTP GET
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
           'Accept': accept,
           ...customHeaders
         },
         signal: this.abortController?.signal
       });
     }

     /**
      * Execute query via HTTP POST
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
           'Accept': accept,
           'Content-Type': 'application/sparql-query',
           ...customHeaders
         },
         body: query,
         signal: this.abortController?.signal
       });
     }

     /**
      * Parse response based on content type
      */
     private async parseResponse(response: Response, contentType: string): Promise<any> {
       if (contentType.includes('application/json') || contentType.includes('application/sparql-results+json')) {
         return await response.json();
       } else if (contentType.includes('application/xml') || contentType.includes('application/sparql-results+xml')) {
         return await response.text();
       } else {
         return await response.text();
       }
     }

     /**
      * Create error from HTTP response
      */
     private async createErrorFromResponse(response: Response): Promise<Error> {
       const statusText = response.statusText;
       let message = `HTTP ${response.status}: ${statusText}`;

       try {
         const contentType = response.headers.get('Content-Type') || '';
         if (contentType.includes('json')) {
           const errorData = await response.json();
           message += `\n${errorData.message || JSON.stringify(errorData)}`;
         } else {
           const errorText = await response.text();
           if (errorText) {
             message += `\n${errorText}`;
           }
         }
       } catch {
         // Ignore parsing errors
       }

       return new Error(message);
     }

     /**
      * Handle various error types
      */
     private handleError(error: any): Error {
       if (error.name === 'AbortError') {
         return new Error('Query timeout or cancelled');
       }

       if (error instanceof TypeError && error.message.includes('fetch')) {
         return new Error('Network error: Unable to reach endpoint. Check CORS configuration.');
       }

       return error instanceof Error ? error : new Error(String(error));
     }
   }

   // Singleton instance
   export const sparqlService = new SparqlService();
   ```

2. Create `src/lib/utils/queryUtils.ts`:
   ```typescript
   /**
    * Utility functions for query manipulation
    */

   export function detectQueryType(query: string): QueryType {
     // Implementation as in service
   }

   export function addLimitOffset(query: string, limit: number, offset: number): string {
     // Check if query already has LIMIT/OFFSET
     const hasLimit = /LIMIT\\s+\\d+/i.test(query);
     const hasOffset = /OFFSET\\s+\\d+/i.test(query);

     let modifiedQuery = query.trim();

     if (!hasLimit) {
       modifiedQuery += `\nLIMIT ${limit}`;
     }

     if (!hasOffset && offset > 0) {
       modifiedQuery += `\nOFFSET ${offset}`;
     }

     return modifiedQuery;
   }

   export function extractPrefixesFromQuery(query: string): Record<string, string> {
     // Delegate to prefixService
   }
   ```

3. Update `src/lib/stores/resultsStore.ts`:
   - Add loading state management
   - Connect to sparqlService

4. Create query execution action in store or as separate action file

## Acceptance Criteria

- [ ] Can execute SELECT queries and receive JSON results
- [ ] Can execute ASK queries and receive boolean results
- [ ] Can execute CONSTRUCT/DESCRIBE queries and receive RDF
- [ ] Automatically chooses GET or POST based on query length
- [ ] Sends correct Accept header for each query type
- [ ] Handles HTTP errors gracefully (4xx, 5xx)
- [ ] Handles network errors (CORS, unreachable endpoint)
- [ ] Implements query timeout
- [ ] Can cancel ongoing query
- [ ] Follows HTTP redirects
- [ ] Parses JSON responses correctly
- [ ] Returns raw text for non-JSON formats

## Testing

1. Create `tests/unit/services/sparqlService.test.ts`:
   ```typescript
   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
   import { SparqlService } from '../../../src/lib/services/sparqlService';

   describe('SparqlService', () => {
     let service: SparqlService;

     beforeEach(() => {
       service = new SparqlService();
       global.fetch = vi.fn();
     });

     afterEach(() => {
       vi.restoreAllMocks();
     });

     it('should execute SELECT query via GET for small queries', async () => {
       const mockResponse = {
         ok: true,
         status: 200,
         headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
         json: async () => ({ head: { vars: [] }, results: { bindings: [] } })
       };
       (global.fetch as any).mockResolvedValue(mockResponse);

       const result = await service.executeQuery({
         endpoint: 'http://example.com/sparql',
         query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10'
       });

       expect(result.status).toBe(200);
       expect(global.fetch).toHaveBeenCalledWith(
         expect.stringContaining('query='),
         expect.objectContaining({ method: 'GET' })
       );
     });

     it('should execute large query via POST', async () => {
       const longQuery = 'SELECT * WHERE { ' + '?s ?p ?o . '.repeat(500) + '} LIMIT 10';
       const mockResponse = {
         ok: true,
         status: 200,
         headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
         json: async () => ({ head: { vars: [] }, results: { bindings: [] } })
       };
       (global.fetch as any).mockResolvedValue(mockResponse);

       await service.executeQuery({
         endpoint: 'http://example.com/sparql',
         query: longQuery
       });

       expect(global.fetch).toHaveBeenCalledWith(
         'http://example.com/sparql',
         expect.objectContaining({
           method: 'POST',
           body: longQuery
         })
       );
     });

     it('should handle timeout', async () => {
       (global.fetch as any).mockImplementation(() =>
         new Promise(resolve => setTimeout(resolve, 10000))
       );

       await expect(
         service.executeQuery({
           endpoint: 'http://example.com/sparql',
           query: 'SELECT * WHERE { ?s ?p ?o }',
           timeout: 100
         })
       ).rejects.toThrow('timeout');
     });

     it('should handle HTTP errors', async () => {
       const mockResponse = {
         ok: false,
         status: 400,
         statusText: 'Bad Request',
         headers: new Headers({ 'Content-Type': 'text/plain' }),
         text: async () => 'Invalid SPARQL query'
       };
       (global.fetch as any).mockResolvedValue(mockResponse);

       await expect(
         service.executeQuery({
           endpoint: 'http://example.com/sparql',
           query: 'INVALID QUERY'
         })
       ).rejects.toThrow('HTTP 400');
     });

     // More tests...
   });
   ```

2. Create integration test with mock endpoint

## Files to Create/Modify

- `src/lib/services/sparqlService.ts` (create)
- `src/lib/utils/queryUtils.ts` (create)
- `src/lib/stores/resultsStore.ts` (modify)
- `tests/unit/services/sparqlService.test.ts` (create)
- `tests/integration/query-execution.test.ts` (create)

## Commit Message

```
feat: implement SPARQL 1.2 Protocol query execution

- Add SparqlService with GET and POST support
- Implement query type detection
- Add proper Accept header negotiation
- Support timeout and cancellation via AbortController
- Handle HTTP and network errors gracefully
- Parse JSON and text responses
- Add comprehensive SPARQL service tests
```

## Notes

- SPARQL 1.2 Protocol: https://www.w3.org/TR/sparql12-protocol/
- GET method: query parameter in URL
- POST method: query in body with Content-Type: application/sparql-query
- Alternative POST: application/x-www-form-urlencoded with query parameter
- Some endpoints (like Fuseki) also accept ?output=json parameter
- Consider adding support for custom parameters in future tasks
