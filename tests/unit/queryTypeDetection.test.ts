/**
 * Unit tests for query type detection utilities
 */

import { describe, it, expect } from 'vitest';
import {
  detectQueryType,
  getDefaultFormats,
  producesBindings,
  producesGraph,
} from '../../src/lib/utils/queryTypeDetection';

describe('detectQueryType', () => {
  it('detects SELECT queries', () => {
    expect(detectQueryType('SELECT * WHERE { ?s ?p ?o }')).toBe('SELECT');
    expect(detectQueryType('select * where { ?s ?p ?o }')).toBe('SELECT');
    expect(detectQueryType('  SELECT  * WHERE { ?s ?p ?o }')).toBe('SELECT');
  });

  it('detects ASK queries', () => {
    expect(detectQueryType('ASK { ?s ?p ?o }')).toBe('ASK');
    expect(detectQueryType('ask { ?s ?p ?o }')).toBe('ASK');
    expect(detectQueryType('  ASK  { ?s ?p ?o }')).toBe('ASK');
  });

  it('detects CONSTRUCT queries', () => {
    expect(detectQueryType('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')).toBe('CONSTRUCT');
    expect(detectQueryType('construct { ?s ?p ?o } where { ?s ?p ?o }')).toBe('CONSTRUCT');
  });

  it('detects DESCRIBE queries', () => {
    expect(detectQueryType('DESCRIBE <http://example.org/resource>')).toBe('DESCRIBE');
    expect(detectQueryType('describe <http://example.org/resource>')).toBe('DESCRIBE');
  });

  it('detects UPDATE queries', () => {
    expect(detectQueryType('INSERT DATA { <s> <p> <o> }')).toBe('UPDATE');
    expect(detectQueryType('DELETE DATA { <s> <p> <o> }')).toBe('UPDATE');
    expect(detectQueryType('LOAD <http://example.org/data>')).toBe('UPDATE');
    expect(detectQueryType('CLEAR GRAPH <http://example.org/graph>')).toBe('UPDATE');
    expect(detectQueryType('CREATE GRAPH <http://example.org/graph>')).toBe('UPDATE');
    expect(detectQueryType('DROP GRAPH <http://example.org/graph>')).toBe('UPDATE');
  });

  it('handles queries with PREFIX declarations', () => {
    const query = `
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      SELECT * WHERE { ?s foaf:name ?name }
    `;
    expect(detectQueryType(query)).toBe('SELECT');
  });

  it('handles queries with BASE declarations', () => {
    const query = `
      BASE <http://example.org/>
      SELECT * WHERE { ?s ?p ?o }
    `;
    expect(detectQueryType(query)).toBe('SELECT');
  });

  it('handles queries with PREFIX and BASE declarations', () => {
    const query = `
      BASE <http://example.org/>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      ASK { ?s foaf:name "John" }
    `;
    expect(detectQueryType(query)).toBe('ASK');
  });

  it('defaults to SELECT for unknown query types', () => {
    expect(detectQueryType('')).toBe('SELECT');
    expect(detectQueryType('   ')).toBe('SELECT');
    expect(detectQueryType('UNKNOWN QUERY')).toBe('SELECT');
  });

  it('handles multi-line queries', () => {
    const query = `
      SELECT ?subject ?predicate ?object
      WHERE {
        ?subject ?predicate ?object .
      }
      LIMIT 10
    `;
    expect(detectQueryType(query)).toBe('SELECT');
  });

  it('handles queries with comments', () => {
    const query = `
      # This is a comment
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      # Another comment
      SELECT * WHERE { ?s foaf:name ?name }
    `;
    // Note: Comment handling depends on whether we want to support it
    // Currently the function doesn't strip comments, but PREFIX handling works
    expect(detectQueryType(query)).toBe('SELECT');
  });
});

describe('getDefaultFormats', () => {
  it('returns binding formats for SELECT queries', () => {
    const formats = getDefaultFormats('SELECT');
    expect(formats).toContain('application/sparql-results+json');
    expect(formats).toContain('application/sparql-results+xml');
    expect(formats).toContain('text/csv');
    expect(formats).toContain('text/tab-separated-values');
  });

  it('returns binding formats for ASK queries', () => {
    const formats = getDefaultFormats('ASK');
    expect(formats).toContain('application/sparql-results+json');
    expect(formats).toContain('application/sparql-results+xml');
  });

  it('returns RDF formats for CONSTRUCT queries', () => {
    const formats = getDefaultFormats('CONSTRUCT');
    expect(formats).toContain('text/turtle');
    expect(formats).toContain('application/rdf+xml');
    expect(formats).toContain('application/ld+json');
    expect(formats).toContain('application/n-triples');
  });

  it('returns RDF formats for DESCRIBE queries', () => {
    const formats = getDefaultFormats('DESCRIBE');
    expect(formats).toContain('text/turtle');
    expect(formats).toContain('application/rdf+xml');
  });

  it('returns RDF formats for UPDATE queries', () => {
    const formats = getDefaultFormats('UPDATE');
    expect(formats).toContain('text/turtle');
    expect(formats).toContain('application/rdf+xml');
  });
});

describe('producesBindings', () => {
  it('returns true for SELECT and ASK queries', () => {
    expect(producesBindings('SELECT')).toBe(true);
    expect(producesBindings('ASK')).toBe(true);
  });

  it('returns false for CONSTRUCT, DESCRIBE, and UPDATE queries', () => {
    expect(producesBindings('CONSTRUCT')).toBe(false);
    expect(producesBindings('DESCRIBE')).toBe(false);
    expect(producesBindings('UPDATE')).toBe(false);
  });
});

describe('producesGraph', () => {
  it('returns true for CONSTRUCT and DESCRIBE queries', () => {
    expect(producesGraph('CONSTRUCT')).toBe(true);
    expect(producesGraph('DESCRIBE')).toBe(true);
  });

  it('returns false for SELECT, ASK, and UPDATE queries', () => {
    expect(producesGraph('SELECT')).toBe(false);
    expect(producesGraph('ASK')).toBe(false);
    expect(producesGraph('UPDATE')).toBe(false);
  });
});
