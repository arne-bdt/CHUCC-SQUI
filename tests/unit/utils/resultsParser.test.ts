/**
 * Unit tests for SPARQL Results Parser
 * Tests parsing of SPARQL JSON Results format
 */

import { describe, it, expect, beforeEach } from 'vitest';
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
  abbreviateIRI,
  clearAbbreviationCache,
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

  describe('abbreviateIRI', () => {
    beforeEach(() => {
      // Clear cache before each test to ensure clean state
      clearAbbreviationCache();
    });

    it('should abbreviate IRIs using provided custom prefixes', () => {
      const customPrefixes = {
        ex: 'http://example.org/',
        my: 'http://my-domain.com/ontology/',
      };

      expect(abbreviateIRI('http://example.org/Person', customPrefixes)).toBe('ex:Person');
      expect(abbreviateIRI('http://my-domain.com/ontology/hasValue', customPrefixes)).toBe(
        'my:hasValue'
      );
    });

    it('should abbreviate common RDF namespace IRIs when no custom prefixes provided', () => {
      // Falls back to common prefixes from prefixService
      expect(abbreviateIRI('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBe('rdf:type');
      expect(abbreviateIRI('http://www.w3.org/2000/01/rdf-schema#label')).toBe('rdfs:label');
      expect(abbreviateIRI('http://www.w3.org/2002/07/owl#Class')).toBe('owl:Class');
    });

    it('should abbreviate XSD namespace IRIs', () => {
      expect(abbreviateIRI('http://www.w3.org/2001/XMLSchema#string')).toBe('xsd:string');
      expect(abbreviateIRI('http://www.w3.org/2001/XMLSchema#integer')).toBe('xsd:integer');
      expect(abbreviateIRI('http://www.w3.org/2001/XMLSchema#dateTime')).toBe('xsd:dateTime');
    });

    it('should abbreviate FOAF namespace IRIs', () => {
      expect(abbreviateIRI('http://xmlns.com/foaf/0.1/name')).toBe('foaf:name');
      expect(abbreviateIRI('http://xmlns.com/foaf/0.1/Person')).toBe('foaf:Person');
    });

    it('should abbreviate DBpedia namespace IRIs', () => {
      expect(abbreviateIRI('http://dbpedia.org/ontology/birthDate')).toBe('dbo:birthDate');
      expect(abbreviateIRI('http://dbpedia.org/resource/Albert_Einstein')).toBe(
        'dbr:Albert_Einstein'
      );
    });

    it('should abbreviate Wikidata namespace IRIs', () => {
      expect(abbreviateIRI('http://www.wikidata.org/entity/Q42')).toBe('wd:Q42');
      expect(abbreviateIRI('http://www.wikidata.org/prop/direct/P31')).toBe('wdt:P31');
    });

    it('should abbreviate Schema.org IRIs', () => {
      expect(abbreviateIRI('http://schema.org/Person')).toBe('schema:Person');
      expect(abbreviateIRI('http://schema.org/name')).toBe('schema:name');
    });

    it('should abbreviate Dublin Core IRIs', () => {
      expect(abbreviateIRI('http://purl.org/dc/terms/title')).toBe('dcterms:title');
      expect(abbreviateIRI('http://purl.org/dc/elements/1.1/creator')).toBe('dc:creator');
    });

    it('should abbreviate SKOS IRIs', () => {
      expect(abbreviateIRI('http://www.w3.org/2004/02/skos/core#prefLabel')).toBe(
        'skos:prefLabel'
      );
      expect(abbreviateIRI('http://www.w3.org/2004/02/skos/core#Concept')).toBe('skos:Concept');
    });

    it('should return full IRI when no prefix matches', () => {
      const customIRI = 'http://example.org/custom/resource';
      expect(abbreviateIRI(customIRI)).toBe(customIRI);
    });

    it('should handle IRIs with fragments', () => {
      expect(abbreviateIRI('http://xmlns.com/foaf/0.1/name#fragment')).toBe('foaf:name#fragment');
    });

    it('should cache abbreviations for performance', () => {
      const iri = 'http://xmlns.com/foaf/0.1/name';

      // First call - should calculate
      const result1 = abbreviateIRI(iri);
      expect(result1).toBe('foaf:name');

      // Second call - should use cache (same result)
      const result2 = abbreviateIRI(iri);
      expect(result2).toBe('foaf:name');

      // Results should be identical (cache hit)
      expect(result1).toBe(result2);
    });

    it('should use longest matching prefix', () => {
      // Dublin Core has both 'dc' and 'dcterms' prefixes
      // dcterms URI is longer, so it should match first
      expect(abbreviateIRI('http://purl.org/dc/terms/title')).toBe('dcterms:title');
      expect(abbreviateIRI('http://purl.org/dc/elements/1.1/creator')).toBe('dc:creator');
    });

    it('should handle empty strings', () => {
      expect(abbreviateIRI('')).toBe('');
    });

    it('should cache abbreviations separately for different prefix sets', () => {
      const prefixes1 = { ex: 'http://example.org/' };
      const prefixes2 = { ex: 'http://different.org/' };

      const iri1 = abbreviateIRI('http://example.org/Person', prefixes1);
      const iri2 = abbreviateIRI('http://example.org/Person', prefixes2);

      expect(iri1).toBe('ex:Person');
      // Without prefixes2 having the right match, should return full IRI
      expect(iri2).toBe('http://example.org/Person');
    });

    it('should prefer custom prefixes over common prefixes', () => {
      // Custom prefix that shadows a common one
      const customPrefixes = {
        rdf: 'http://my-custom.org/rdf#',
      };

      // Should use custom prefix, not common rdf prefix
      expect(abbreviateIRI('http://my-custom.org/rdf#myTerm', customPrefixes)).toBe('rdf:myTerm');
    });
  });

  describe('clearAbbreviationCache', () => {
    it('should clear the abbreviation cache', () => {
      // Populate cache
      abbreviateIRI('http://xmlns.com/foaf/0.1/name');

      // Clear cache
      clearAbbreviationCache();

      // Next call should recalculate (we can't directly test cache state,
      // but we can verify the function still works)
      expect(abbreviateIRI('http://xmlns.com/foaf/0.1/name')).toBe('foaf:name');
    });
  });

  describe('getCellDisplayValue with abbreviateUri', () => {
    beforeEach(() => {
      clearAbbreviationCache();
    });

    it('should abbreviate URIs using custom prefixes when provided', () => {
      const cell: ParsedCell = {
        value: 'http://example.org/Person',
        type: 'uri',
        rawValue: 'http://example.org/Person',
      };

      const customPrefixes = { ex: 'http://example.org/' };

      expect(getCellDisplayValue(cell, { abbreviateUri: true, prefixes: customPrefixes })).toBe(
        'ex:Person'
      );
    });

    it('should abbreviate URIs when abbreviateUri is true', () => {
      const cell: ParsedCell = {
        value: 'http://xmlns.com/foaf/0.1/name',
        type: 'uri',
        rawValue: 'http://xmlns.com/foaf/0.1/name',
      };

      expect(getCellDisplayValue(cell, { abbreviateUri: true })).toBe('foaf:name');
    });

    it('should not abbreviate URIs when abbreviateUri is false', () => {
      const cell: ParsedCell = {
        value: 'http://xmlns.com/foaf/0.1/name',
        type: 'uri',
        rawValue: 'http://xmlns.com/foaf/0.1/name',
      };

      expect(getCellDisplayValue(cell, { abbreviateUri: false })).toBe(
        'http://xmlns.com/foaf/0.1/name'
      );
    });

    it('should use abbreviateUri=false by default', () => {
      const cell: ParsedCell = {
        value: 'http://xmlns.com/foaf/0.1/name',
        type: 'uri',
        rawValue: 'http://xmlns.com/foaf/0.1/name',
      };

      // Default behavior (no options)
      expect(getCellDisplayValue(cell)).toBe('http://xmlns.com/foaf/0.1/name');
    });

    it('should abbreviate DBpedia URIs', () => {
      const cell: ParsedCell = {
        value: 'http://dbpedia.org/resource/Albert_Einstein',
        type: 'uri',
        rawValue: 'http://dbpedia.org/resource/Albert_Einstein',
      };

      expect(getCellDisplayValue(cell, { abbreviateUri: true })).toBe('dbr:Albert_Einstein');
    });

    it('should abbreviate Wikidata URIs', () => {
      const cell: ParsedCell = {
        value: 'http://www.wikidata.org/entity/Q42',
        type: 'uri',
        rawValue: 'http://www.wikidata.org/entity/Q42',
      };

      expect(getCellDisplayValue(cell, { abbreviateUri: true })).toBe('wd:Q42');
    });

    it('should keep full URI when no prefix matches', () => {
      const cell: ParsedCell = {
        value: 'http://example.org/custom/resource',
        type: 'uri',
        rawValue: 'http://example.org/custom/resource',
      };

      expect(getCellDisplayValue(cell, { abbreviateUri: true })).toBe(
        'http://example.org/custom/resource'
      );
    });

    it('should not affect literals with abbreviateUri option', () => {
      const cell: ParsedCell = {
        value: 'Hello',
        type: 'literal',
        lang: 'en',
      };

      expect(getCellDisplayValue(cell, { abbreviateUri: true })).toBe('"Hello"@en');
    });

    it('should not affect blank nodes with abbreviateUri option', () => {
      const cell: ParsedCell = {
        value: '_:b0',
        type: 'bnode',
        rawValue: '_:b0',
      };

      expect(getCellDisplayValue(cell, { abbreviateUri: true })).toBe('_:b0');
    });
  });

  describe('maxRows enforcement', () => {
    it('should enforce maxRows limit when parsing results', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x'] },
        results: {
          bindings: Array.from({ length: 1000 }, (_, i) => ({
            x: { type: 'literal', value: `value${i}` },
          })),
        },
      };

      const parsed = parseResults(results, { maxRows: 100 });
      expect((parsed as ParsedTableData).rowCount).toBe(100);
      expect((parsed as ParsedTableData).rows.length).toBe(100);
    });

    it('should set isTruncated flag when results exceed maxRows', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x'] },
        results: {
          bindings: Array.from({ length: 150 }, (_, i) => ({
            x: { type: 'literal', value: `value${i}` },
          })),
        },
      };

      const parsed = parseResults(results, { maxRows: 100 }) as ParsedTableData;
      expect(parsed.isTruncated).toBe(true);
      expect(parsed.totalRows).toBe(150);
      expect(parsed.rowCount).toBe(100);
    });

    it('should not set isTruncated when results are within limit', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x'] },
        results: {
          bindings: Array.from({ length: 50 }, (_, i) => ({
            x: { type: 'literal', value: `value${i}` },
          })),
        },
      };

      const parsed = parseResults(results, { maxRows: 100 }) as ParsedTableData;
      expect(parsed.isTruncated).toBeUndefined();
      expect(parsed.totalRows).toBeUndefined();
      expect(parsed.rowCount).toBe(50);
    });

    it('should parse all results when maxRows is not specified', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x'] },
        results: {
          bindings: Array.from({ length: 150 }, (_, i) => ({
            x: { type: 'literal', value: `value${i}` },
          })),
        },
      };

      const parsed = parseResults(results) as ParsedTableData;
      expect(parsed.rowCount).toBe(150);
      expect(parsed.isTruncated).toBeUndefined();
      expect(parsed.totalRows).toBeUndefined();
    });

    it('should handle large datasets (10,000 rows) with maxRows limit', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['id', 'name', 'value'] },
        results: {
          bindings: Array.from({ length: 10000 }, (_, i) => ({
            id: { type: 'literal', value: `${i}` },
            name: { type: 'literal', value: `Item ${i}` },
            value: { type: 'literal', value: `${i * 100}` },
          })),
        },
      };

      const parsed = parseResults(results, { maxRows: 1000 }) as ParsedTableData;
      expect(parsed.rowCount).toBe(1000);
      expect(parsed.isTruncated).toBe(true);
      expect(parsed.totalRows).toBe(10000);
      expect(parsed.rows[0].id.value).toBe('0');
      expect(parsed.rows[999].id.value).toBe('999');
    });

    it('should not affect ASK query results', () => {
      const results: SparqlJsonResults = {
        head: { vars: [] },
        boolean: true,
      };

      const parsed = parseResults(results, { maxRows: 10 });
      expect(parsed).toEqual({
        value: true,
        type: 'boolean',
      });
    });
  });
});
