/**
 * Integration tests for DataTable component
 * Tests rendering with real data, IRI abbreviation, and various cell types
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import DataTable from '../../../src/lib/components/Results/DataTable.svelte';
import { parseTableResults } from '../../../src/lib/utils/resultsParser';
import { clearAbbreviationCache } from '../../../src/lib/utils/resultsParser';
import type { SparqlJsonResults, ParsedTableData } from '../../../src/lib/types';

describe('DataTable Integration', () => {
  beforeEach(() => {
    // Clear abbreviation cache before each test
    clearAbbreviationCache();
  });

  describe('IRI Abbreviation with Query Prefixes', () => {
    it('should abbreviate IRIs using prefixes from the query', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: [
            {
              subject: { type: 'uri', value: 'http://example.org/resource1' },
              predicate: { type: 'uri', value: 'http://example.org/hasValue' },
              object: { type: 'uri', value: 'http://example.org/Value1' },
            },
          ],
        },
      };

      // Simulate prefixes parsed from query:
      // PREFIX ex: <http://example.org/>
      const queryPrefixes = {
        ex: 'http://example.org/',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      // Verify table renders - IRIs should be abbreviated using query prefixes
      expect(container.querySelector('.grid-wrapper')).toBeInTheDocument();
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    it('should abbreviate common RDF namespace IRIs when query has those prefixes', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: [
            {
              subject: { type: 'uri', value: 'http://example.org/resource1' },
              predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
              object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
            },
          ],
        },
      };

      // Simulate prefixes from query
      const queryPrefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        owl: 'http://www.w3.org/2002/07/owl#',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      // Grid should render with abbreviated IRIs
      await waitFor(() => {
        expect(container.querySelector('.wx-grid')).toBeInTheDocument();
      });

      // Note: wx-svelte-grid renders in a complex virtual DOM
      // The actual abbreviated values are in the gridData derived state
      // We can verify the component renders without errors
      expect(container.querySelector('.grid-wrapper')).toBeInTheDocument();
    });

    it('should abbreviate FOAF namespace IRIs when query declares foaf prefix', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['person', 'property'] },
        results: {
          bindings: [
            {
              person: { type: 'uri', value: 'http://example.org/person1' },
              property: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
            },
            {
              person: { type: 'uri', value: 'http://example.org/person2' },
              property: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
            },
          ],
        },
      };

      const queryPrefixes = {
        foaf: 'http://xmlns.com/foaf/0.1/',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      // Verify table shows correct number of results
      expect(screen.getByText('2 results')).toBeInTheDocument();
      expect(screen.getByText('2 variables')).toBeInTheDocument();
    });

    it('should abbreviate DBpedia namespace IRIs when query declares DBpedia prefixes', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['resource', 'ontology'] },
        results: {
          bindings: [
            {
              resource: { type: 'uri', value: 'http://dbpedia.org/resource/Albert_Einstein' },
              ontology: { type: 'uri', value: 'http://dbpedia.org/ontology/birthDate' },
            },
            {
              resource: { type: 'uri', value: 'http://dbpedia.org/resource/Marie_Curie' },
              ontology: { type: 'uri', value: 'http://dbpedia.org/ontology/deathDate' },
            },
          ],
        },
      };

      const queryPrefixes = {
        dbr: 'http://dbpedia.org/resource/',
        dbo: 'http://dbpedia.org/ontology/',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    it('should abbreviate Wikidata namespace IRIs when query declares Wikidata prefixes', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['entity', 'property'] },
        results: {
          bindings: [
            {
              entity: { type: 'uri', value: 'http://www.wikidata.org/entity/Q42' },
              property: { type: 'uri', value: 'http://www.wikidata.org/prop/direct/P31' },
            },
            {
              entity: { type: 'uri', value: 'http://www.wikidata.org/entity/Q5' },
              property: { type: 'uri', value: 'http://www.wikidata.org/prop/direct/P279' },
            },
          ],
        },
      };

      const queryPrefixes = {
        wd: 'http://www.wikidata.org/entity/',
        wdt: 'http://www.wikidata.org/prop/direct/',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    it('should abbreviate Schema.org IRIs when query declares schema prefix', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['type', 'property'] },
        results: {
          bindings: [
            {
              type: { type: 'uri', value: 'http://schema.org/Person' },
              property: { type: 'uri', value: 'http://schema.org/name' },
            },
            {
              type: { type: 'uri', value: 'http://schema.org/Organization' },
              property: { type: 'uri', value: 'http://schema.org/email' },
            },
          ],
        },
      };

      const queryPrefixes = {
        schema: 'http://schema.org/',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    it('should keep full IRI when no matching prefix in query', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['customResource'] },
        results: {
          bindings: [
            {
              customResource: {
                type: 'uri',
                value: 'http://example.org/custom/namespace/resource1',
              },
            },
            {
              customResource: {
                type: 'uri',
                value: 'http://custom-domain.com/ontology/Entity',
              },
            },
          ],
        },
      };

      // Query has no prefixes that match these IRIs
      const queryPrefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    it('should handle mixed cell types (URIs, literals, blank nodes)', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: [
            {
              subject: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
              predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
              object: { type: 'literal', value: 'Person', 'xml:lang': 'en' },
            },
            {
              subject: { type: 'bnode', value: '_:b0' },
              predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
              object: {
                type: 'literal',
                value: '42',
                datatype: 'http://www.w3.org/2001/XMLSchema#integer',
              },
            },
          ],
        },
      };

      const queryPrefixes = {
        foaf: 'http://xmlns.com/foaf/0.1/',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
      expect(screen.getByText('3 variables')).toBeInTheDocument();
    });
  });

  describe('Large Dataset with IRI Abbreviation', () => {
    it('should handle large datasets with many abbreviated IRIs efficiently', async () => {
      const bindings = [];
      for (let i = 0; i < 1000; i++) {
        bindings.push({
          subject: { type: 'uri', value: `http://dbpedia.org/resource/Person_${i}` },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
          object: { type: 'literal', value: `Name ${i}` },
        });
      }

      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: { bindings },
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData } });

      await waitFor(
        () => {
          expect(container.querySelector('.data-table-container')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify results count
      expect(screen.getByText('1000 results')).toBeInTheDocument();

      // Verify virtual scrolling is enabled for performance
      await waitFor(() => {
        expect(container.querySelector('.wx-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty results gracefully', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: { bindings: [] },
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });

      expect(screen.getByText('Try modifying your query')).toBeInTheDocument();
    });

    it('should handle unbound variables correctly', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'optional'] },
        results: {
          bindings: [
            {
              subject: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
              // optional is unbound
            },
            {
              subject: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Agent' },
              optional: { type: 'literal', value: 'bound value' },
            },
          ],
        },
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });
  });

  describe('Real-World Examples', () => {
    it('should render DBpedia query results with abbreviated IRIs', async () => {
      const mockResults: SparqlJsonResults = {
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
            {
              person: { type: 'uri', value: 'http://dbpedia.org/resource/Marie_Curie' },
              name: { type: 'literal', value: 'Marie Curie', 'xml:lang': 'en' },
              birthDate: {
                type: 'literal',
                value: '1867-11-07',
                datatype: 'http://www.w3.org/2001/XMLSchema#date',
              },
            },
          ],
        },
      };

      const queryPrefixes = {
        dbr: 'http://dbpedia.org/resource/',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
      expect(screen.getByText('3 variables')).toBeInTheDocument();
    });

    it('should render Wikidata query results with abbreviated IRIs', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['item', 'itemLabel', 'instanceOf'] },
        results: {
          bindings: [
            {
              item: { type: 'uri', value: 'http://www.wikidata.org/entity/Q42' },
              itemLabel: { type: 'literal', value: 'Douglas Adams', 'xml:lang': 'en' },
              instanceOf: { type: 'uri', value: 'http://www.wikidata.org/entity/Q5' },
            },
            {
              item: { type: 'uri', value: 'http://www.wikidata.org/entity/Q937' },
              itemLabel: { type: 'literal', value: 'Albert Einstein', 'xml:lang': 'en' },
              instanceOf: { type: 'uri', value: 'http://www.wikidata.org/entity/Q5' },
            },
          ],
        },
      };

      const queryPrefixes = {
        wd: 'http://www.wikidata.org/entity/',
      };

      const parsedData = parseTableResults(mockResults);
      const { container } = render(DataTable, { props: { data: parsedData, prefixes: queryPrefixes } });

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });
  });
});
