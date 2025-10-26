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
        message: expect.stringContaining('HTTP 400'),
        status: 400,
      });
    });

    it('should handle HTTP 500 errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'Database connection failed' }),
      });

      await expect(
        service.executeQuery({
          endpoint: 'http://example.com/sparql',
          query: 'SELECT * WHERE { ?s ?p ?o }',
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('HTTP 500'),
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
      });
    }, 10000);
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
