import { describe, it, expect } from 'vitest';
import type {
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
} from '../../../src/lib/types';

describe('SPARQL Types', () => {
  describe('QueryType', () => {
    it('should accept valid query types', () => {
      const types: QueryType[] = ['SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE', 'UPDATE'];
      expect(types).toHaveLength(5);
      expect(types).toContain('SELECT');
      expect(types).toContain('ASK');
    });
  });

  describe('ResultFormat', () => {
    it('should accept valid result formats', () => {
      const formats: ResultFormat[] = [
        'json',
        'xml',
        'csv',
        'tsv',
        'turtle',
        'jsonld',
        'ntriples',
        'rdfxml',
      ];
      expect(formats).toHaveLength(8);
      expect(formats).toContain('json');
      expect(formats).toContain('turtle');
    });
  });

  describe('SparqlTerm', () => {
    it('should create URI term', () => {
      const term: SparqlTerm = {
        type: 'uri',
        value: 'http://dbpedia.org/resource/Berlin',
      };

      expect(term.type).toBe('uri');
      expect(term.value).toBe('http://dbpedia.org/resource/Berlin');
    });

    it('should create literal term with language tag', () => {
      const term: SparqlTerm = {
        type: 'literal',
        value: 'Berlin',
        'xml:lang': 'de',
      };

      expect(term.type).toBe('literal');
      expect(term['xml:lang']).toBe('de');
    });

    it('should create typed literal term', () => {
      const term: SparqlTerm = {
        type: 'literal',
        value: '42',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      };

      expect(term.datatype).toBe('http://www.w3.org/2001/XMLSchema#integer');
    });

    it('should create blank node term', () => {
      const term: SparqlTerm = {
        type: 'bnode',
        value: '_:b0',
      };

      expect(term.type).toBe('bnode');
    });
  });

  describe('SparqlBinding', () => {
    it('should create binding with variables', () => {
      const binding: SparqlBinding = {
        city: {
          type: 'uri',
          value: 'http://dbpedia.org/resource/Berlin',
        },
        label: {
          type: 'literal',
          value: 'Berlin',
          'xml:lang': 'en',
        },
      };

      expect(binding.city.type).toBe('uri');
      expect(binding.label.value).toBe('Berlin');
    });
  });

  describe('SparqlJsonResults', () => {
    it('should create SELECT query results', () => {
      const results: SparqlJsonResults = {
        head: {
          vars: ['city', 'label'],
        },
        results: {
          bindings: [
            {
              city: {
                type: 'uri',
                value: 'http://dbpedia.org/resource/Berlin',
              },
              label: {
                type: 'literal',
                value: 'Berlin',
              },
            },
          ],
        },
      };

      expect(results.head.vars).toHaveLength(2);
      expect(results.results?.bindings).toHaveLength(1);
    });

    it('should create ASK query results', () => {
      const results: SparqlJsonResults = {
        head: {},
        boolean: true,
      };

      expect(results.boolean).toBe(true);
    });

    it('should include optional link in head', () => {
      const results: SparqlJsonResults = {
        head: {
          vars: ['s', 'p', 'o'],
          link: ['http://example.org/metadata'],
        },
      };

      expect(results.head.link).toBeDefined();
      expect(results.head.link).toHaveLength(1);
    });
  });

  describe('QueryState', () => {
    it('should create query state', () => {
      const state: QueryState = {
        text: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
        endpoint: 'https://dbpedia.org/sparql',
        type: 'SELECT',
        prefixes: {
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        },
      };

      expect(state.text).toContain('SELECT');
      expect(state.type).toBe('SELECT');
      expect(state.prefixes.rdf).toBeDefined();
    });
  });

  describe('ResultsState', () => {
    it('should create results state', () => {
      const state: ResultsState = {
        data: null,
        format: 'json',
        view: 'table',
        loading: false,
        error: null,
      };

      expect(state.loading).toBe(false);
      expect(state.format).toBe('json');
      expect(state.view).toBe('table');
    });

    it('should track loading state', () => {
      const state: ResultsState = {
        data: null,
        format: 'json',
        view: 'table',
        loading: true,
        error: null,
      };

      expect(state.loading).toBe(true);
    });

    it('should include execution time', () => {
      const state: ResultsState = {
        data: { head: { vars: [] } },
        format: 'json',
        view: 'table',
        loading: false,
        error: null,
        executionTime: 234,
      };

      expect(state.executionTime).toBe(234);
    });
  });

  describe('QueryOptions', () => {
    it('should create basic query options', () => {
      const options: QueryOptions = {
        endpoint: 'https://dbpedia.org/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
      };

      expect(options.endpoint).toBe('https://dbpedia.org/sparql');
      expect(options.query).toContain('SELECT');
    });

    it('should include optional parameters', () => {
      const options: QueryOptions = {
        endpoint: 'https://dbpedia.org/sparql',
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
        method: 'POST',
        timeout: 5000,
        headers: {
          'User-Agent': 'SQUI/1.0',
        },
      };

      expect(options.method).toBe('POST');
      expect(options.timeout).toBe(5000);
      expect(options.headers?.['User-Agent']).toBe('SQUI/1.0');
    });
  });

  describe('QueryResult', () => {
    it('should create query result', () => {
      const result: QueryResult = {
        data: {
          head: { vars: ['s'] },
          results: { bindings: [] },
        },
        executionTime: 123,
        status: 200,
        headers: {
          'content-type': 'application/sparql-results+json',
        },
      };

      expect(result.status).toBe(200);
      expect(result.executionTime).toBe(123);
      expect(result.headers['content-type']).toBe('application/sparql-results+json');
    });
  });

  describe('QueryError', () => {
    it('should create query error', () => {
      const error: QueryError = {
        message: 'Query timeout',
        status: 408,
      };

      expect(error.message).toBe('Query timeout');
      expect(error.status).toBe(408);
    });

    it('should include detailed error information', () => {
      const originalError = new Error('Network error');
      const error: QueryError = {
        message: 'Failed to execute query',
        status: 500,
        details: 'Connection refused',
        originalError,
      };

      expect(error.details).toBe('Connection refused');
      expect(error.originalError).toBe(originalError);
    });
  });
});
