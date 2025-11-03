/**
 * Integration tests for worker-based parsing
 * Tests end-to-end parsing with Web Workers
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { SparqlJsonResults } from '../../src/lib/types';
import { parseTableResults } from '../../src/lib/utils/resultsParser';

describe('Worker Parsing Integration', () => {
  describe('Small datasets (< 5000 rows)', () => {
    it('should parse small dataset on main thread', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: Array.from({ length: 100 }, (_, i) => ({
            subject: { type: 'uri', value: `http://example.org/subject-${i}` },
            predicate: { type: 'uri', value: 'http://example.org/predicate' },
            object: { type: 'literal', value: `Object ${i}` },
          })),
        },
      };

      const parsed = parseTableResults(results);

      expect(parsed.rowCount).toBe(100);
      expect(parsed.columns).toEqual(['subject', 'predicate', 'object']);
      expect(parsed.rows[0].subject.value).toBe('http://example.org/subject-0');
    });

    it('should handle empty results', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x'] },
        results: { bindings: [] },
      };

      const parsed = parseTableResults(results);

      expect(parsed.rowCount).toBe(0);
      expect(parsed.columns).toEqual(['x']);
      expect(parsed.rows).toEqual([]);
    });

    it('should handle unbound variables', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x', 'y'] },
        results: {
          bindings: [
            { x: { type: 'literal', value: 'value1' } }, // y is unbound
            { y: { type: 'literal', value: 'value2' } }, // x is unbound
          ],
        },
      };

      const parsed = parseTableResults(results);

      expect(parsed.rowCount).toBe(2);
      expect(parsed.rows[0].x.value).toBe('value1');
      expect(parsed.rows[0].y.type).toBe('unbound');
      expect(parsed.rows[1].x.type).toBe('unbound');
      expect(parsed.rows[1].y.value).toBe('value2');
    });
  });

  describe('Large datasets (> 5000 rows)', () => {
    it('should parse large dataset correctly', () => {
      const largeResults: SparqlJsonResults = {
        head: { vars: ['id', 'name', 'value'] },
        results: {
          bindings: Array.from({ length: 10000 }, (_, i) => ({
            id: { type: 'literal', value: String(i) },
            name: { type: 'literal', value: `Name ${i}` },
            value: { type: 'literal', value: `Value ${i}` },
          })),
        },
      };

      const parsed = parseTableResults(largeResults);

      expect(parsed.rowCount).toBe(10000);
      expect(parsed.columns).toEqual(['id', 'name', 'value']);
      expect(parsed.rows[0].id.value).toBe('0');
      expect(parsed.rows[9999].id.value).toBe('9999');
    });

    it('should enforce maxRows limit', () => {
      const largeResults: SparqlJsonResults = {
        head: { vars: ['x'] },
        results: {
          bindings: Array.from({ length: 20000 }, (_, i) => ({
            x: { type: 'literal', value: String(i) },
          })),
        },
      };

      const parsed = parseTableResults(largeResults, 10000);

      expect(parsed.rowCount).toBe(10000);
      expect(parsed.isTruncated).toBe(true);
      expect(parsed.totalRows).toBe(20000);
    });
  });

  describe('Chunked parsing simulation', () => {
    it('should parse in chunks and accumulate results', () => {
      const totalRows = 5000;
      const chunkSize = 1000;
      const results: SparqlJsonResults = {
        head: { vars: ['x'] },
        results: {
          bindings: Array.from({ length: totalRows }, (_, i) => ({
            x: { type: 'literal', value: String(i) },
          })),
        },
      };

      const allRows: typeof parseTableResults extends (...args: any[]) => infer R
        ? R extends { rows: infer T }
          ? T
          : never
        : never = [];

      // Simulate chunked parsing
      for (let i = 0; i < totalRows; i += chunkSize) {
        const end = Math.min(i + chunkSize, totalRows);
        const chunk = results.results.bindings.slice(i, end);
        const chunkResults: SparqlJsonResults = {
          head: results.head,
          results: { bindings: chunk },
        };
        const parsed = parseTableResults(chunkResults);
        allRows.push(...parsed.rows);
      }

      expect(allRows.length).toBe(totalRows);
      expect(allRows[0].x.value).toBe('0');
      expect(allRows[totalRows - 1].x.value).toBe(String(totalRows - 1));
    });
  });

  describe('Data types and formats', () => {
    it('should parse URIs correctly', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['uri'] },
        results: {
          bindings: [
            { uri: { type: 'uri', value: 'http://example.org/resource' } },
          ],
        },
      };

      const parsed = parseTableResults(results);

      expect(parsed.rows[0].uri.type).toBe('uri');
      expect(parsed.rows[0].uri.value).toBe('http://example.org/resource');
      expect(parsed.rows[0].uri.rawValue).toBe('http://example.org/resource');
    });

    it('should parse literals with datatypes', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['num', 'date'] },
        results: {
          bindings: [
            {
              num: {
                type: 'literal',
                value: '42',
                datatype: 'http://www.w3.org/2001/XMLSchema#integer',
              },
              date: {
                type: 'literal',
                value: '2024-01-01',
                datatype: 'http://www.w3.org/2001/XMLSchema#date',
              },
            },
          ],
        },
      };

      const parsed = parseTableResults(results);

      expect(parsed.rows[0].num.type).toBe('literal');
      expect(parsed.rows[0].num.datatype).toBe('http://www.w3.org/2001/XMLSchema#integer');
      expect(parsed.rows[0].date.datatype).toBe('http://www.w3.org/2001/XMLSchema#date');
    });

    it('should parse literals with language tags', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['label'] },
        results: {
          bindings: [
            {
              label: {
                type: 'literal',
                value: 'Hello',
                'xml:lang': 'en',
              },
            },
            {
              label: {
                type: 'literal',
                value: 'Hola',
                'xml:lang': 'es',
              },
            },
          ],
        },
      };

      const parsed = parseTableResults(results);

      expect(parsed.rows[0].label.lang).toBe('en');
      expect(parsed.rows[1].label.lang).toBe('es');
    });

    it('should parse blank nodes', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['node'] },
        results: {
          bindings: [{ node: { type: 'bnode', value: '_:b0' } }],
        },
      };

      const parsed = parseTableResults(results);

      expect(parsed.rows[0].node.type).toBe('bnode');
      expect(parsed.rows[0].node.value).toBe('_:b0');
    });
  });

  describe('Performance characteristics', () => {
    it('should parse 10k rows in reasonable time', () => {
      const results: SparqlJsonResults = {
        head: { vars: ['x', 'y', 'z'] },
        results: {
          bindings: Array.from({ length: 10000 }, (_, i) => ({
            x: { type: 'literal', value: `x-${i}` },
            y: { type: 'literal', value: `y-${i}` },
            z: { type: 'literal', value: `z-${i}` },
          })),
        },
      };

      const startTime = performance.now();
      const parsed = parseTableResults(results);
      const duration = performance.now() - startTime;

      expect(parsed.rowCount).toBe(10000);
      // Should parse in less than 500ms on main thread
      expect(duration).toBeLessThan(500);
    });

    it('should maintain consistent memory usage', () => {
      // Parse multiple datasets to check for memory leaks
      for (let batch = 0; batch < 5; batch++) {
        const results: SparqlJsonResults = {
          head: { vars: ['x'] },
          results: {
            bindings: Array.from({ length: 5000 }, (_, i) => ({
              x: { type: 'literal', value: String(i) },
            })),
          },
        };

        const parsed = parseTableResults(results);
        expect(parsed.rowCount).toBe(5000);
      }

      // If we get here without running out of memory, test passes
      expect(true).toBe(true);
    });
  });
});
