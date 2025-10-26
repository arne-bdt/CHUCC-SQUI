/**
 * Unit tests for Query Utilities
 * Tests query manipulation and validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  detectQueryType,
  addLimitOffset,
  extractPrefixesFromQuery,
  addPrefixesToQuery,
  removePrefixesFromQuery,
  queryContainsVariable,
  extractSelectVariables,
  validateQuerySyntax,
  getQueryResultLimit,
  isReadOnlyQuery,
} from '../../../src/lib/utils/queryUtils';

describe('queryUtils', () => {
  describe('detectQueryType', () => {
    it('should detect SELECT query', () => {
      expect(detectQueryType('SELECT * WHERE { ?s ?p ?o }')).toBe('SELECT');
      expect(detectQueryType('  select * where { ?s ?p ?o }')).toBe('SELECT');
    });

    it('should detect ASK query', () => {
      expect(detectQueryType('ASK WHERE { ?s ?p ?o }')).toBe('ASK');
      expect(detectQueryType('  ask where { ?s ?p ?o }')).toBe('ASK');
    });

    it('should detect CONSTRUCT query', () => {
      expect(detectQueryType('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')).toBe('CONSTRUCT');
      expect(detectQueryType('  construct { ?s ?p ?o } where { ?s ?p ?o }')).toBe('CONSTRUCT');
    });

    it('should detect DESCRIBE query', () => {
      expect(detectQueryType('DESCRIBE <http://example.org/resource>')).toBe('DESCRIBE');
      expect(detectQueryType('  describe <http://example.org/resource>')).toBe('DESCRIBE');
    });

    it('should detect UPDATE queries', () => {
      expect(
        detectQueryType('INSERT DATA { <http://example.org/s> <http://example.org/p> "o" }')
      ).toBe('UPDATE');
      expect(
        detectQueryType('DELETE DATA { <http://example.org/s> <http://example.org/p> "o" }')
      ).toBe('UPDATE');
    });

    it('should default to SELECT for unknown queries', () => {
      expect(detectQueryType('UNKNOWN QUERY')).toBe('SELECT');
      expect(detectQueryType('')).toBe('SELECT');
    });
  });

  describe('addLimitOffset', () => {
    it('should add LIMIT to query without LIMIT', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = addLimitOffset(query, 100);
      expect(result).toContain('LIMIT 100');
    });

    it('should add LIMIT and OFFSET to query', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = addLimitOffset(query, 100, 50);
      expect(result).toContain('LIMIT 100');
      expect(result).toContain('OFFSET 50');
    });

    it('should not add LIMIT if already present', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 10';
      const result = addLimitOffset(query, 100);
      expect(result).toBe(query);
    });

    it('should not add OFFSET if already present', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } OFFSET 20';
      const result = addLimitOffset(query, 100, 50);
      expect(result).toContain('LIMIT 100');
      expect(result).not.toContain('OFFSET 50');
    });

    it('should not add OFFSET if offset is 0', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = addLimitOffset(query, 100, 0);
      expect(result).toContain('LIMIT 100');
      expect(result).not.toContain('OFFSET');
    });
  });

  describe('extractPrefixesFromQuery', () => {
    it('should extract PREFIX declarations', () => {
      const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT * WHERE { ?s ?p ?o }
      `;
      const prefixes = extractPrefixesFromQuery(query);
      expect(prefixes).toEqual({
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      });
    });

    it('should return empty object for query without prefixes', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const prefixes = extractPrefixesFromQuery(query);
      expect(prefixes).toEqual({});
    });

    it('should handle case-insensitive PREFIX keyword', () => {
      const query = `
        prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PrEfIx rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT * WHERE { ?s ?p ?o }
      `;
      const prefixes = extractPrefixesFromQuery(query);
      expect(Object.keys(prefixes)).toHaveLength(2);
    });
  });

  describe('addPrefixesToQuery', () => {
    it('should add new prefixes to query', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const prefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      };
      const result = addPrefixesToQuery(query, prefixes);
      expect(result).toContain('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>');
      expect(result).toContain('PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>');
    });

    it('should not add duplicate prefixes', () => {
      const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT * WHERE { ?s ?p ?o }`;
      const prefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      };
      const result = addPrefixesToQuery(query, prefixes);
      // Should only add rdfs, not rdf
      expect(result.match(/PREFIX rdf:/g)?.length).toBe(1);
      expect(result).toContain('PREFIX rdfs:');
    });

    it('should return original query if no new prefixes', () => {
      const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT * WHERE { ?s ?p ?o }`;
      const prefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      };
      const result = addPrefixesToQuery(query, prefixes);
      expect(result).toBe(query);
    });
  });

  describe('removePrefixesFromQuery', () => {
    it('should remove all PREFIX declarations', () => {
      const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE { ?s ?p ?o }`;
      const result = removePrefixesFromQuery(query);
      expect(result).not.toContain('PREFIX');
      expect(result).toContain('SELECT');
    });

    it('should handle query without prefixes', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = removePrefixesFromQuery(query);
      expect(result).toBe(query);
    });
  });

  describe('queryContainsVariable', () => {
    it('should detect variable with ? prefix', () => {
      const query = 'SELECT ?subject WHERE { ?subject ?p ?o }';
      expect(queryContainsVariable(query, 'subject')).toBe(true);
    });

    it('should detect variable with $ prefix', () => {
      const query = 'SELECT $subject WHERE { $subject $p $o }';
      expect(queryContainsVariable(query, 'subject')).toBe(true);
    });

    it('should return false for missing variable', () => {
      const query = 'SELECT ?s WHERE { ?s ?p ?o }';
      expect(queryContainsVariable(query, 'missing')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const query = 'SELECT ?Subject WHERE { ?Subject ?p ?o }';
      expect(queryContainsVariable(query, 'subject')).toBe(true);
    });
  });

  describe('extractSelectVariables', () => {
    it('should extract variables from SELECT clause', () => {
      const query = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
      const vars = extractSelectVariables(query);
      expect(vars).toEqual(['s', 'p', 'o']);
    });

    it('should handle SELECT *', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const vars = extractSelectVariables(query);
      expect(vars).toEqual(['*']);
    });

    it('should handle SELECT DISTINCT', () => {
      const query = 'SELECT DISTINCT ?s ?p WHERE { ?s ?p ?o }';
      const vars = extractSelectVariables(query);
      expect(vars).toEqual(['s', 'p']);
    });

    it('should handle variables with $ prefix', () => {
      const query = 'SELECT $s $p WHERE { $s $p $o }';
      const vars = extractSelectVariables(query);
      expect(vars).toEqual(['s', 'p']);
    });

    it('should return empty array for non-SELECT queries', () => {
      const query = 'ASK WHERE { ?s ?p ?o }';
      const vars = extractSelectVariables(query);
      expect(vars).toEqual([]);
    });
  });

  describe('validateQuerySyntax', () => {
    it('should validate correct SELECT query', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = validateQuerySyntax(query);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty query', () => {
      const query = '';
      const result = validateQuerySyntax(query);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Query is empty');
    });

    it('should reject query without query type keyword', () => {
      const query = 'WHERE { ?s ?p ?o }';
      const result = validateQuerySyntax(query);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must start with');
    });

    it('should detect unbalanced braces', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o';
      const result = validateQuerySyntax(query);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unbalanced braces');
    });

    it('should validate all query types', () => {
      const queries = [
        'SELECT * WHERE { ?s ?p ?o }',
        'ASK WHERE { ?s ?p ?o }',
        'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
        'DESCRIBE <http://example.org/resource>',
        'INSERT DATA { <http://example.org/s> <http://example.org/p> "o" }',
      ];

      queries.forEach((query) => {
        const result = validateQuerySyntax(query);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('getQueryResultLimit', () => {
    it('should extract LIMIT value', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100';
      expect(getQueryResultLimit(query)).toBe(100);
    });

    it('should handle case-insensitive LIMIT', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } limit 50';
      expect(getQueryResultLimit(query)).toBe(50);
    });

    it('should return undefined for query without LIMIT', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      expect(getQueryResultLimit(query)).toBeUndefined();
    });
  });

  describe('isReadOnlyQuery', () => {
    it('should return true for SELECT query', () => {
      expect(isReadOnlyQuery('SELECT * WHERE { ?s ?p ?o }')).toBe(true);
    });

    it('should return true for ASK query', () => {
      expect(isReadOnlyQuery('ASK WHERE { ?s ?p ?o }')).toBe(true);
    });

    it('should return true for CONSTRUCT query', () => {
      expect(isReadOnlyQuery('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')).toBe(true);
    });

    it('should return true for DESCRIBE query', () => {
      expect(isReadOnlyQuery('DESCRIBE <http://example.org/resource>')).toBe(true);
    });

    it('should return false for UPDATE queries', () => {
      expect(
        isReadOnlyQuery('INSERT DATA { <http://example.org/s> <http://example.org/p> "o" }')
      ).toBe(false);
      expect(
        isReadOnlyQuery('DELETE DATA { <http://example.org/s> <http://example.org/p> "o" }')
      ).toBe(false);
    });
  });
});
