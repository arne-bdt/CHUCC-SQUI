/**
 * Unit tests for SPARQL Service
 * Tests query execution, error handling, and protocol compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SparqlService } from '../../../src/lib/services/sparqlService';
import type { SparqlJsonResults } from '../../../src/lib/types';

describe('SparqlService', () => {
  let service: SparqlService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new SparqlService();
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Query Type Detection', () => {
    it('should detect SELECT query', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['s'] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('query='),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: expect.stringContaining('application/sparql-results+json'),
          }),
        })
      );
    });

    it('should detect ASK query', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        boolean: true,
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'ASK WHERE { ?s ?p ?o }',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: expect.stringContaining('application/sparql-results+json'),
          }),
        })
      );
    });

    it('should detect CONSTRUCT query', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/turtle' }),
        text: async () => '@prefix ex: <http://example.org/> .',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: expect.stringContaining('text/turtle'),
          }),
        })
      );
    });
  });

  describe('SPARQL UPDATE Operations (SPARQL 1.2 Protocol)', () => {
    it('should use POST for INSERT UPDATE queries (not GET)', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'INSERT DATA { <http://example.org/s> <http://example.org/p> "value" }',
      });

      // Should use POST even though query is short
      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for DELETE UPDATE queries (not GET)', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'DELETE DATA { <http://example.org/s> <http://example.org/p> "value" }',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for LOAD UPDATE queries', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'LOAD <http://example.org/data.ttl>',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for CLEAR UPDATE queries', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'CLEAR GRAPH <http://example.org/graph>',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for CREATE UPDATE queries', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'CREATE GRAPH <http://example.org/graph>',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for DROP UPDATE queries', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'DROP GRAPH <http://example.org/graph>',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for COPY UPDATE queries', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'COPY <http://example.org/graph1> TO <http://example.org/graph2>',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for MOVE UPDATE queries', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'MOVE <http://example.org/graph1> TO <http://example.org/graph2>',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use POST for ADD UPDATE queries', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'ADD <http://example.org/graph1> TO <http://example.org/graph2>',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should use application/sparql-update Content-Type for UPDATE operations', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query:
          'PREFIX ex: <http://example.org/> INSERT DATA { ex:subject ex:predicate "value" }',
      });

      // Verify Content-Type is application/sparql-update (not application/sparql-query)
      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-update',
          }),
        })
      );
    });

    it('should never use GET for UPDATE queries regardless of size', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      // Very short UPDATE query (would normally be GET)
      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'INSERT DATA { <s> <p> "o" }',
      });

      // Should still use POST, never GET
      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('HTTP Method Selection', () => {
    it('should use GET for small queries', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      });

      // Should call GET with query parameter in URL
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('query=SELECT'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should use POST for large queries', async () => {
      const longQuery = 'SELECT * WHERE { ' + '?s ?p ?o . '.repeat(500) + '} LIMIT 10';
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: longQuery,
      });

      // Should call POST with query in body
      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({
          method: 'POST',
          body: longQuery,
          headers: expect.objectContaining({
            'Content-Type': 'application/sparql-query',
          }),
        })
      );
    });

    it('should respect explicit method parameter', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      // Force POST for a small query
      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
        method: 'POST',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://example.com/sparql',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should account for full URL length including endpoint and encoding', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      // Very long endpoint URL
      const longEndpoint =
        'http://very-long-endpoint-url-' + 'x'.repeat(500) + '.example.com/sparql';

      // Query that would normally be GET, but with long endpoint pushes over limit
      const query = 'SELECT * WHERE { ' + '?s ?p ?o . '.repeat(150) + '}';

      await service.executeQuery({
        endpoint: longEndpoint,
        query: query,
      });

      // Should use POST because total URL length exceeds limit
      expect(fetchMock).toHaveBeenCalledWith(
        longEndpoint,
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('Response Parsing', () => {
    it('should parse JSON results', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['s', 'p', 'o'] },
        results: {
          bindings: [
            {
              s: { type: 'uri', value: 'http://example.org/subject' },
              p: { type: 'uri', value: 'http://example.org/predicate' },
              o: { type: 'literal', value: 'object' },
            },
          ],
        },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      const result = await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      expect(result.data).toEqual(mockResults);
      expect(result.status).toBe(200);
    });

    it('should parse XML results as text', async () => {
      const mockXml = '<?xml version="1.0"?><sparql></sparql>';

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+xml' }),
        text: async () => mockXml,
      });

      const result = await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
        format: 'xml',
      });

      expect(result.data).toBe(mockXml);
    });

    it('should parse RDF formats as text', async () => {
      const mockTurtle = '@prefix ex: <http://example.org/> .';

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/turtle' }),
        text: async () => mockTurtle,
      });

      const result = await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
      });

      expect(result.data).toBe(mockTurtle);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP 400 errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => 'Invalid SPARQL query',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'INVALID QUERY',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Bad Request'),
        type: 'sparql',
        status: 400,
      });
    });

    it('should handle HTTP 500 errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Database connection failed' }),
        json: async () => ({ message: 'Database connection failed' }),
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Internal Server Error'),
        type: 'http',
      });
    });

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        service.executeQuery({
          endpoint: 'http://unreachable.example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Network error'),
        type: 'network',
      });
    });

    it('should handle timeout', async () => {
      fetchMock.mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            // Simulate the abort happening due to timeout
            if (options?.signal) {
              options.signal.addEventListener('abort', () => {
                const error = new Error('The operation was aborted');
                error.name = 'AbortError';
                reject(error);
              });
            }
          })
      );

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          timeout: 100,
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('timeout'),
        type: 'timeout',
      });
    }, 10000);
  });

  describe('Error Categorization (Task 18)', () => {
    it('should categorize HTTP 401 as unauthorized', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Unauthorized'),
        type: 'http',
        status: 401,
      });
    });

    it('should categorize HTTP 403 as forbidden', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Forbidden'),
        type: 'http',
        status: 403,
      });
    });

    it('should categorize HTTP 404 as not found', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Not Found'),
        type: 'http',
        status: 404,
      });
    });

    it('should categorize HTTP 408 as timeout', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 408,
        statusText: 'Request Timeout',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Request Timeout'),
        type: 'http',
        status: 408,
      });
    });

    it('should categorize HTTP 502 as bad gateway', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Bad Gateway'),
        type: 'http',
        status: 502,
      });
    });

    it('should categorize HTTP 503 as service unavailable', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Service Unavailable'),
        type: 'http',
        status: 503,
      });
    });

    it('should categorize HTTP 504 as gateway timeout', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 504,
        statusText: 'Gateway Timeout',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => '',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Gateway Timeout'),
        type: 'http',
        status: 504,
      });
    });

    it('should detect SPARQL syntax errors in response text', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: async () => 'SPARQL syntax error: Expected SELECT, found SLECT',
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SLECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Bad Request'),
        type: 'sparql',
        details: expect.stringContaining('syntax'),
      });
    });

    it('should detect CORS errors', async () => {
      const corsError = new TypeError(
        'Failed to fetch: CORS policy blocked cross-origin request'
      );
      fetchMock.mockRejectedValue(corsError);

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('CORS Error'),
        type: 'cors',
        details: expect.stringContaining('cross-origin'),
      });
    });

    it('should include detailed error information', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        text: async () => JSON.stringify({
          message: 'Lexical error at line 1, column 2. Encountered: "L"',
        }),
        json: async () => ({
          message: 'Lexical error at line 1, column 2. Encountered: "L"',
        }),
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'INVALID',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Bad Request'),
        type: 'sparql',
        status: 400,
        details: expect.stringContaining('Lexical error'),
      });
    });
  });

  describe('Custom Headers', () => {
    it('should include custom headers in request', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
        text: async () => JSON.stringify(mockResults),
        json: async () => mockResults,
      });

      await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
        headers: {
          Authorization: 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token123',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('Query Cancellation', () => {
    it('should cancel ongoing query', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';

      fetchMock.mockRejectedValue(abortError);

      const queryPromise = service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      service.cancelQuery();

      await expect(queryPromise).rejects.toMatchObject({
        message: expect.stringContaining('timeout or cancelled'),
      });
    });
  });

  describe('Execution Time Tracking', () => {
    it('should track query execution time', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      fetchMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
                text: async () => JSON.stringify(mockResults),
                json: async () => mockResults,
              });
            }, 50);
          })
      );

      const result = await service.executeQuery({
        endpoint: 'http://example.com/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o }',
      });

      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(1000);
    });
  });

  describe('Format Negotiation (Task 17)', () => {
    describe('SELECT/ASK Query Formats', () => {
      it('should request JSON format for SELECT queries', async () => {
        const mockResults: SparqlJsonResults = {
          head: { vars: [] },
          results: { bindings: [] },
        };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
          text: async () => JSON.stringify(mockResults),
          json: async () => mockResults,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          format: 'json',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('application/sparql-results+json'),
            }),
          })
        );
      });

      it('should request XML format for SELECT queries', async () => {
        const mockXml = '<?xml version="1.0"?><sparql></sparql>';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/sparql-results+xml' }),
          text: async () => mockXml,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          format: 'xml',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('application/sparql-results+xml'),
            }),
          })
        );
      });

      it('should request CSV format for SELECT queries', async () => {
        const mockCsv = 's,p,o\nhttp://example.org/s,http://example.org/p,value';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'text/csv' }),
          text: async () => mockCsv,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          format: 'csv',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('text/csv'),
            }),
          })
        );
      });

      it('should request TSV format for SELECT queries', async () => {
        const mockTsv = 's\tp\to\nhttp://example.org/s\thttp://example.org/p\tvalue';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'text/tab-separated-values' }),
          text: async () => mockTsv,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          format: 'tsv',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('text/tab-separated-values'),
            }),
          })
        );
      });

      it('should include quality preferences for SELECT queries', async () => {
        const mockResults: SparqlJsonResults = {
          head: { vars: [] },
          results: { bindings: [] },
        };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
          text: async () => JSON.stringify(mockResults),
          json: async () => mockResults,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          format: 'json',
        });

        const acceptHeader = (fetchMock.mock.calls[0][1] as RequestInit)?.headers as Record<
          string,
          string
        >;
        const accept = acceptHeader.Accept;

        // Should include quality preferences for fallback formats
        expect(accept).toContain('application/sparql-results+json');
        expect(accept).toContain(';q=0.9');
        expect(accept).toContain(';q=0.8');
      });
    });

    describe('CONSTRUCT/DESCRIBE Query Formats', () => {
      it('should request Turtle format for CONSTRUCT queries', async () => {
        const mockTurtle = '@prefix ex: <http://example.org/> .';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'text/turtle' }),
          text: async () => mockTurtle,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
          format: 'turtle',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('text/turtle'),
            }),
          })
        );
      });

      it('should request JSON-LD format for CONSTRUCT queries', async () => {
        const mockJsonLd = '{"@context": {}, "@graph": []}';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/ld+json' }),
          text: async () => mockJsonLd,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
          format: 'jsonld',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('application/ld+json'),
            }),
          })
        );
      });

      it('should request N-Triples format for CONSTRUCT queries', async () => {
        const mockNTriples =
          '<http://example.org/s> <http://example.org/p> "value" .';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/n-triples' }),
          text: async () => mockNTriples,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
          format: 'ntriples',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('application/n-triples'),
            }),
          })
        );
      });

      it('should request RDF/XML format for CONSTRUCT queries', async () => {
        const mockRdfXml = '<?xml version="1.0"?><rdf:RDF></rdf:RDF>';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/rdf+xml' }),
          text: async () => mockRdfXml,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
          format: 'rdfxml',
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('application/rdf+xml'),
            }),
          })
        );
      });

      it('should default to Turtle for CONSTRUCT queries without format', async () => {
        const mockTurtle = '@prefix ex: <http://example.org/> .';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'text/turtle' }),
          text: async () => mockTurtle,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
          // No format specified
        });

        expect(fetchMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              Accept: expect.stringContaining('text/turtle'),
            }),
          })
        );
      });

      it('should include quality preferences for CONSTRUCT queries', async () => {
        const mockTurtle = '@prefix ex: <http://example.org/> .';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'text/turtle' }),
          text: async () => mockTurtle,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
          format: 'turtle',
        });

        const acceptHeader = (fetchMock.mock.calls[0][1] as RequestInit)?.headers as Record<
          string,
          string
        >;
        const accept = acceptHeader.Accept;

        // Should include quality preferences for fallback formats
        expect(accept).toContain('text/turtle');
        expect(accept).toContain(';q=0.9');
        expect(accept).toContain(';q=0.8');
      });
    });

    describe('MIME Type Compliance (SPARQL 1.2 Protocol)', () => {
      it('should use correct MIME type for SPARQL JSON Results', async () => {
        const mockResults: SparqlJsonResults = {
          head: { vars: [] },
          results: { bindings: [] },
        };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/sparql-results+json' }),
          text: async () => JSON.stringify(mockResults),
          json: async () => mockResults,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          format: 'json',
        });

        const acceptHeader = (fetchMock.mock.calls[0][1] as RequestInit)?.headers as Record<
          string,
          string
        >;
        // SPARQL 1.2 Protocol specifies application/sparql-results+json
        expect(acceptHeader.Accept).toContain('application/sparql-results+json');
      });

      it('should use correct MIME type for SPARQL XML Results', async () => {
        const mockXml = '<?xml version="1.0"?><sparql></sparql>';

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/sparql-results+xml' }),
          text: async () => mockXml,
        });

        await service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
          format: 'xml',
        });

        const acceptHeader = (fetchMock.mock.calls[0][1] as RequestInit)?.headers as Record<
          string,
          string
        >;
        // SPARQL 1.2 Protocol specifies application/sparql-results+xml
        expect(acceptHeader.Accept).toContain('application/sparql-results+xml');
      });
    });
  });
});
