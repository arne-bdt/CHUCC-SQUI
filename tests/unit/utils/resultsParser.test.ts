/**
 * Unit tests for SPARQL Results Parser
 * Tests parsing of SPARQL JSON Results format
 */

import { describe, it, expect } from 'vitest';
import {
  parseResults,
  parseTableResults,
  parseTerm,
  parseLiteral,
  createUnboundCell,
  isAskResult,
  isSelectResult,
  getCellDisplayValue,
  abbreviateDatatype,
  getResultStats,
  type ParsedTableData,
  type ParsedAskResult,
  type ParsedCell,
} from '../../../src/lib/utils/resultsParser';
import type { SparqlJsonResults, SparqlTerm } from '../../../src/lib/types';

describe('resultsParser', () => {
  describe('parseResults', () => {
    it('should parse ASK query results', () => {
      const results: SparqlJsonResults = {
        head: { vars: [] },
        boolean: true,
      };

      const parsed = parseResults(results);
      expect(parsed).toEqual({
        value: true,
        type: 'boolean',
      });
    });

    it('should parse SELECT query results', () => {
      const results: SparqlJsonResults = {
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

      const parsed = parseResults(results) as ParsedTableData;
      expect(parsed.columns).toEqual(['s', 'p', 'o']);
      expect(parsed.rowCount).toBe(1);
      expect(parsed.rows).toHaveLength(1);
      expect(parsed.rows[0].s.value).toBe('http://example.org/subject');
    });

    it('should handle empty results', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['s'] },
        results: { bindings: [] },
      };

      const parsed = parseResults(results) as ParsedTableData;
      expect(parsed.columns).toEqual(['s']);
      expect(parsed.rowCount).toBe(0);
      expect(parsed.rows).toHaveLength(0);
    });
  });

  describe('parseTableResults', () => {
    it('should parse multiple rows correctly', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['name', 'age'] },
        results: {
          bindings: [
            {
              name: { type: 'literal', value: 'Alice' },
              age: {
                type: 'literal',
                value: '30',
                datatype: 'http://www.w3.org/2001/XMLSchema#integer',
              },
            },
            {
              name: { type: 'literal', value: 'Bob' },
              age: {
                type: 'literal',
                value: '25',
                datatype: 'http://www.w3.org/2001/XMLSchema#integer',
              },
            },
          ],
        },
      };

      const parsed = parseTableResults(results);
      expect(parsed.rowCount).toBe(2);
      expect(parsed.columns).toEqual(['name', 'age']);
      expect(parsed.rows[0].name.value).toBe('Alice');
      expect(parsed.rows[0].age.value).toBe('30');
      expect(parsed.rows[1].name.value).toBe('Bob');
    });

    it('should handle unbound variables', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x', 'y', 'z'] },
        results: {
          bindings: [
            {
              x: { type: 'uri', value: 'http://example.org/x' },
              // y is unbound
              z: { type: 'literal', value: 'z-value' },
            },
          ],
        },
      };

      const parsed = parseTableResults(results);
      expect(parsed.rows[0].x.type).toBe('uri');
      expect(parsed.rows[0].y.type).toBe('unbound');
      expect(parsed.rows[0].y.value).toBe('');
      expect(parsed.rows[0].z.type).toBe('literal');
    });
  });

  describe('parseTerm', () => {
    it('should parse URI terms', () => {
      const term: SparqlTerm = {
        type: 'uri',
        value: 'http://example.org/resource',
      };

      const parsed = parseTerm(term);
      expect(parsed).toEqual({
        value: 'http://example.org/resource',
        type: 'uri',
        rawValue: 'http://example.org/resource',
      });
    });

    it('should parse blank node terms', () => {
      const term: SparqlTerm = {
        type: 'bnode',
        value: '_:b0',
      };

      const parsed = parseTerm(term);
      expect(parsed).toEqual({
        value: '_:b0',
        type: 'bnode',
        rawValue: '_:b0',
      });
    });

    it('should parse plain literal terms', () => {
      const term: SparqlTerm = {
        type: 'literal',
        value: 'Hello World',
      };

      const parsed = parseTerm(term);
      expect(parsed.value).toBe('Hello World');
      expect(parsed.type).toBe('literal');
      expect(parsed.datatype).toBeUndefined();
      expect(parsed.lang).toBeUndefined();
    });
  });

  describe('parseLiteral', () => {
    it('should parse language-tagged literals', () => {
      const term: SparqlTerm = {
        type: 'literal',
        value: 'Hello',
        'xml:lang': 'en',
      };

      const parsed = parseLiteral(term);
      expect(parsed).toEqual({
        value: 'Hello',
        type: 'literal',
        lang: 'en',
      });
    });

    it('should parse typed literals', () => {
      const term: SparqlTerm = {
        type: 'literal',
        value: '42',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      };

      const parsed = parseLiteral(term);
      expect(parsed).toEqual({
        value: '42',
        type: 'literal',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      });
    });

    it('should parse literals with both lang and datatype (lang takes precedence)', () => {
      const term: SparqlTerm = {
        type: 'literal',
        value: 'test',
        'xml:lang': 'en',
        datatype: 'http://www.w3.org/2001/XMLSchema#string',
      };

      const parsed = parseLiteral(term);
      expect(parsed.lang).toBe('en');
      expect(parsed.datatype).toBe('http://www.w3.org/2001/XMLSchema#string');
    });

    it('should handle various XSD datatypes', () => {
      const datatypes = [
        'http://www.w3.org/2001/XMLSchema#string',
        'http://www.w3.org/2001/XMLSchema#integer',
        'http://www.w3.org/2001/XMLSchema#decimal',
        'http://www.w3.org/2001/XMLSchema#boolean',
        'http://www.w3.org/2001/XMLSchema#dateTime',
        'http://www.w3.org/2001/XMLSchema#date',
      ];

      datatypes.forEach((datatype) => {
        const term: SparqlTerm = {
          type: 'literal',
          value: 'test',
          datatype,
        };

        const parsed = parseLiteral(term);
        expect(parsed.datatype).toBe(datatype);
      });
    });
  });

  describe('createUnboundCell', () => {
    it('should create an unbound cell marker', () => {
      const cell = createUnboundCell();
      expect(cell).toEqual({
        value: '',
        type: 'unbound',
      });
    });
  });

  describe('isAskResult', () => {
    it('should identify ASK query results', () => {
      const askResults: SparqlJsonResults = {
        head: { vars: [] },
        boolean: true,
      };

      expect(isAskResult(askResults)).toBe(true);
    });

    it('should not identify SELECT query results as ASK', () => {
      const selectResults: SparqlJsonResults = {
        head: { vars: ['s'] },
        results: { bindings: [] },
      };

      expect(isAskResult(selectResults)).toBe(false);
    });
  });

  describe('isSelectResult', () => {
    it('should identify SELECT query results', () => {
      const selectResults: SparqlJsonResults = {
        head: { vars: ['s'] },
        results: { bindings: [] },
      };

      expect(isSelectResult(selectResults)).toBe(true);
    });

    it('should not identify ASK query results as SELECT', () => {
      const askResults: SparqlJsonResults = {
        head: { vars: [] },
        boolean: false,
      };

      expect(isSelectResult(askResults)).toBe(false);
    });
  });

  describe('getCellDisplayValue', () => {
    it('should format plain literals', () => {
      const cell: ParsedCell = {
        value: 'Hello',
        type: 'literal',
      };

      expect(getCellDisplayValue(cell)).toBe('Hello');
    });

    it('should format language-tagged literals', () => {
      const cell: ParsedCell = {
        value: 'Hello',
        type: 'literal',
        lang: 'en',
      };

      expect(getCellDisplayValue(cell)).toBe('"Hello"@en');
    });

    it('should format typed literals', () => {
      const cell: ParsedCell = {
        value: '42',
        type: 'literal',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      };

      expect(getCellDisplayValue(cell)).toBe('"42"^^xsd:integer');
    });

    it('should format URIs', () => {
      const cell: ParsedCell = {
        value: 'http://example.org/resource',
        type: 'uri',
        rawValue: 'http://example.org/resource',
      };

      expect(getCellDisplayValue(cell)).toBe('http://example.org/resource');
    });

    it('should format blank nodes', () => {
      const cell: ParsedCell = {
        value: '_:b0',
        type: 'bnode',
        rawValue: '_:b0',
      };

      expect(getCellDisplayValue(cell)).toBe('_:b0');
    });

    it('should return empty string for unbound cells', () => {
      const cell: ParsedCell = {
        value: '',
        type: 'unbound',
      };

      expect(getCellDisplayValue(cell)).toBe('');
    });

    it('should respect showLang option', () => {
      const cell: ParsedCell = {
        value: 'Hello',
        type: 'literal',
        lang: 'en',
      };

      expect(getCellDisplayValue(cell, { showLang: false })).toBe('Hello');
    });

    it('should respect showDatatype option', () => {
      const cell: ParsedCell = {
        value: '42',
        type: 'literal',
        datatype: 'http://www.w3.org/2001/XMLSchema#integer',
      };

      expect(getCellDisplayValue(cell, { showDatatype: false })).toBe('42');
    });
  });

  describe('abbreviateDatatype', () => {
    it('should abbreviate XSD datatypes', () => {
      expect(abbreviateDatatype('http://www.w3.org/2001/XMLSchema#string')).toBe('xsd:string');
      expect(abbreviateDatatype('http://www.w3.org/2001/XMLSchema#integer')).toBe('xsd:integer');
      expect(abbreviateDatatype('http://www.w3.org/2001/XMLSchema#boolean')).toBe('xsd:boolean');
      expect(abbreviateDatatype('http://www.w3.org/2001/XMLSchema#dateTime')).toBe(
        'xsd:dateTime'
      );
    });

    it('should abbreviate RDF datatypes', () => {
      expect(abbreviateDatatype('http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML')).toBe(
        'rdf:HTML'
      );
      expect(abbreviateDatatype('http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral')).toBe(
        'rdf:XMLLiteral'
      );
    });

    it('should not abbreviate unknown datatypes', () => {
      const customDatatype = 'http://example.org/customType';
      expect(abbreviateDatatype(customDatatype)).toBe(customDatatype);
    });
  });

  describe('getResultStats', () => {
    it('should return stats for SELECT results', () => {
      const results: ParsedTableData = {
        columns: ['s', 'p', 'o'],
        rows: [],
        rowCount: 0,
        vars: ['s', 'p', 'o'],
      };

      const stats = getResultStats(results);
      expect(stats).toEqual({
        type: 'select',
        rowCount: 0,
        columnCount: 3,
      });
    });

    it('should return stats for ASK results', () => {
      const results: ParsedAskResult = {
        value: true,
        type: 'boolean',
      };

      const stats = getResultStats(results);
      expect(stats).toEqual({
        type: 'ask',
        booleanValue: true,
      });
    });
  });

  describe('Complex Real-World Examples', () => {
    it('should parse DBpedia-style results', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['person', 'name', 'birthDate'] },
        results: {
          bindings: [
            {
              person: { type: 'uri', value: 'http://dbpedia.org/resource/Albert_Einstein' },
              name: { type: 'literal', value: 'Albert Einstein', 'xml:lang': 'en' },
              birthDate: {
                type: 'literal',
                value: '1879-03-14',
                datatype: 'http://www.w3.org/2001/XMLSchema#date',
              },
            },
          ],
        },
      };

      const parsed = parseTableResults(results);
      expect(parsed.rowCount).toBe(1);
      expect(parsed.rows[0].person.type).toBe('uri');
      expect(parsed.rows[0].name.lang).toBe('en');
      expect(parsed.rows[0].birthDate.datatype).toBe('http://www.w3.org/2001/XMLSchema#date');
    });

    it('should parse Wikidata-style results with multiple languages', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['item', 'labelEN', 'labelDE', 'labelFR'] },
        results: {
          bindings: [
            {
              item: { type: 'uri', value: 'http://www.wikidata.org/entity/Q42' },
              labelEN: { type: 'literal', value: 'Douglas Adams', 'xml:lang': 'en' },
              labelDE: { type: 'literal', value: 'Douglas Adams', 'xml:lang': 'de' },
              labelFR: { type: 'literal', value: 'Douglas Adams', 'xml:lang': 'fr' },
            },
          ],
        },
      };

      const parsed = parseTableResults(results);
      expect(parsed.rows[0].labelEN.lang).toBe('en');
      expect(parsed.rows[0].labelDE.lang).toBe('de');
      expect(parsed.rows[0].labelFR.lang).toBe('fr');
    });

    it('should handle queries with blank nodes', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: [
            {
              subject: { type: 'bnode', value: '_:b0' },
              predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
              object: { type: 'literal', value: 'Anonymous' },
            },
          ],
        },
      };

      const parsed = parseTableResults(results);
      expect(parsed.rows[0].subject.type).toBe('bnode');
      expect(parsed.rows[0].subject.value).toBe('_:b0');
    });
  });
});
