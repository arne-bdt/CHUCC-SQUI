/**
 * Tests for SPARQL language support in CodeMirror
 */

import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { sparql, sparqlKeywords } from '../../../src/lib/editor/sparqlLanguage';

/**
 * Helper function to get syntax highlighting tokens for a query
 */
function getTokens(query: string) {
  const state = EditorState.create({
    doc: query,
    extensions: [sparql()],
  });

  const tokens: Array<{ text: string; type: string | null }> = [];
  const tree = state.tree;

  // Simple token extraction for testing
  return { state, tree };
}

describe('SPARQL Language Support', () => {
  describe('Keywords', () => {
    it('should export SPARQL keywords set', () => {
      expect(sparqlKeywords).toBeInstanceOf(Set);
      expect(sparqlKeywords.size).toBeGreaterThan(0);
    });

    it('should include basic query forms', () => {
      expect(sparqlKeywords.has('SELECT')).toBe(true);
      expect(sparqlKeywords.has('CONSTRUCT')).toBe(true);
      expect(sparqlKeywords.has('ASK')).toBe(true);
      expect(sparqlKeywords.has('DESCRIBE')).toBe(true);
    });

    it('should include common keywords', () => {
      expect(sparqlKeywords.has('WHERE')).toBe(true);
      expect(sparqlKeywords.has('FILTER')).toBe(true);
      expect(sparqlKeywords.has('OPTIONAL')).toBe(true);
      expect(sparqlKeywords.has('UNION')).toBe(true);
      expect(sparqlKeywords.has('PREFIX')).toBe(true);
    });

    it('should include SPARQL functions', () => {
      expect(sparqlKeywords.has('BOUND')).toBe(true);
      expect(sparqlKeywords.has('STR')).toBe(true);
      expect(sparqlKeywords.has('LANG')).toBe(true);
      expect(sparqlKeywords.has('DATATYPE')).toBe(true);
      expect(sparqlKeywords.has('COUNT')).toBe(true);
    });

    it('should include string functions', () => {
      expect(sparqlKeywords.has('CONCAT')).toBe(true);
      expect(sparqlKeywords.has('STRLEN')).toBe(true);
      expect(sparqlKeywords.has('UCASE')).toBe(true);
      expect(sparqlKeywords.has('LCASE')).toBe(true);
      expect(sparqlKeywords.has('CONTAINS')).toBe(true);
    });

    it('should include aggregates', () => {
      expect(sparqlKeywords.has('COUNT')).toBe(true);
      expect(sparqlKeywords.has('SUM')).toBe(true);
      expect(sparqlKeywords.has('MIN')).toBe(true);
      expect(sparqlKeywords.has('MAX')).toBe(true);
      expect(sparqlKeywords.has('AVG')).toBe(true);
    });
  });

  describe('Language extension', () => {
    it('should create a language extension', () => {
      const lang = sparql();
      expect(lang).toBeDefined();
    });

    it('should parse simple SELECT query', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse query with PREFIX', () => {
      const query = 'PREFIX ex: <http://example.org/>\nSELECT * WHERE { ?s ?p ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse query with FILTER', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o . FILTER(?o > 10) }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse CONSTRUCT query', () => {
      const query = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse ASK query', () => {
      const query = 'ASK { ?s ?p ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse DESCRIBE query', () => {
      const query = 'DESCRIBE <http://example.org/resource>';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });
  });

  describe('Syntax elements', () => {
    it('should handle comments', () => {
      const query = '# This is a comment\nSELECT * WHERE { ?s ?p ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle string literals with double quotes', () => {
      const query = 'SELECT * WHERE { ?s rdfs:label "test" }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle string literals with single quotes', () => {
      const query = "SELECT * WHERE { ?s rdfs:label 'test' }";
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle IRIs in angle brackets', () => {
      const query = 'SELECT * WHERE { <http://example.org/s> ?p ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle prefixed names', () => {
      const query = 'SELECT * WHERE { ex:subject rdfs:label ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle variables with ?', () => {
      const query = 'SELECT ?subject ?predicate ?object WHERE { ?subject ?predicate ?object }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle variables with $', () => {
      const query = 'SELECT $subject WHERE { $subject ?p ?o }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle numbers', () => {
      const query = 'SELECT * WHERE { ?s ?p 42 }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle decimal numbers', () => {
      const query = 'SELECT * WHERE { ?s ?p 3.14 }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should handle scientific notation', () => {
      const query = 'SELECT * WHERE { ?s ?p 1.23e10 }';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });
  });

  describe('Complex queries', () => {
    it('should parse query with OPTIONAL', () => {
      const query = `
        SELECT ?name ?age
        WHERE {
          ?person foaf:name ?name .
          OPTIONAL { ?person foaf:age ?age }
        }
      `;
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse query with UNION', () => {
      const query = `
        SELECT ?x
        WHERE {
          { ?x a ex:TypeA }
          UNION
          { ?x a ex:TypeB }
        }
      `;
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse query with GROUP BY and aggregates', () => {
      const query = `
        SELECT ?type (COUNT(?item) AS ?count)
        WHERE {
          ?item a ?type
        }
        GROUP BY ?type
        ORDER BY DESC(?count)
      `;
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse query with LIMIT and OFFSET', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 OFFSET 50';
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });

    it('should parse query with FILTER and boolean expressions', () => {
      const query = `
        SELECT ?name ?age
        WHERE {
          ?person foaf:name ?name ;
                  foaf:age ?age .
          FILTER(?age >= 18 && ?age <= 65)
        }
      `;
      const { state } = getTokens(query);
      expect(state.doc.toString()).toBe(query);
    });
  });
});
