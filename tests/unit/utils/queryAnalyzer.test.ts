/**
 * Tests for Query Analyzer
 */

import { describe, it, expect } from 'vitest';
import { analyzeQuery, DEFAULT_THRESHOLDS } from '../../../src/lib/utils/queryAnalyzer';

describe('analyzeQuery', () => {
  describe('LIMIT detection', () => {
    it('should detect queries with LIMIT clause', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(true);
      expect(result.limitValue).toBe(100);
    });

    it('should detect queries without LIMIT clause', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(false);
      expect(result.limitValue).toBeUndefined();
    });

    it('should handle lowercase limit', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } limit 500';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(true);
      expect(result.limitValue).toBe(500);
    });

    it('should handle mixed case limit', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LiMiT 1000';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(true);
      expect(result.limitValue).toBe(1000);
    });

    it('should parse LIMIT 0 correctly', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 0';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(true);
      expect(result.limitValue).toBe(0);
    });

    it('should parse large LIMIT values', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 1000000';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(true);
      expect(result.limitValue).toBe(1000000);
    });
  });

  describe('OFFSET detection', () => {
    it('should detect queries with OFFSET clause', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 OFFSET 50';
      const result = analyzeQuery(query);

      expect(result.hasOffset).toBe(true);
      expect(result.offsetValue).toBe(50);
    });

    it('should detect queries without OFFSET clause', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100';
      const result = analyzeQuery(query);

      expect(result.hasOffset).toBe(false);
      expect(result.offsetValue).toBeUndefined();
    });

    it('should handle lowercase offset', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 offset 25';
      const result = analyzeQuery(query);

      expect(result.hasOffset).toBe(true);
      expect(result.offsetValue).toBe(25);
    });

    it('should warn about large OFFSET values', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 OFFSET 15000';
      const result = analyzeQuery(query);

      expect(result.hasOffset).toBe(true);
      expect(result.offsetValue).toBe(15000);
      expect(result.warnings).toContain('Large OFFSET (15,000) - query may be slow');
    });
  });

  describe('Result size estimation', () => {
    it('should estimate "small" for queries with LIMIT < 1000', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 500';
      const result = analyzeQuery(query);

      expect(result.estimatedRowCount).toBe('small');
      expect(result.estimatedMemoryMB).toBe(0.5);
    });

    it('should estimate "medium" for queries with LIMIT 1000-9999', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 5000';
      const result = analyzeQuery(query);

      expect(result.estimatedRowCount).toBe('medium');
      expect(result.estimatedMemoryMB).toBe(5);
    });

    it('should estimate "large" for queries with LIMIT >= 10000', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 25000';
      const result = analyzeQuery(query);

      expect(result.estimatedRowCount).toBe('large');
      expect(result.estimatedMemoryMB).toBe(25);
    });

    it('should estimate "unbounded" for queries without LIMIT', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = analyzeQuery(query);

      expect(result.estimatedRowCount).toBe('unbounded');
      expect(result.estimatedMemoryMB).toBeUndefined();
    });
  });

  describe('Recommendation levels', () => {
    it('should recommend "safe" for small queries', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100';
      const result = analyzeQuery(query);

      expect(result.recommendation).toBe('safe');
      expect(result.warnings).toHaveLength(0);
    });

    it('should recommend "safe" for queries with LIMIT < 10000', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 9999';
      const result = analyzeQuery(query);

      expect(result.recommendation).toBe('safe');
    });

    it('should recommend "warn" for queries with LIMIT 10000-50000', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 10000';
      const result = analyzeQuery(query);

      expect(result.recommendation).toBe('warn');
      expect(result.warnings).toContain('Medium LIMIT (10,000) - may be slow');
    });

    it('should recommend "warn" for LIMIT just under download threshold', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 50000';
      const result = analyzeQuery(query);

      expect(result.recommendation).toBe('warn');
    });

    it('should recommend "download-instead" for queries with LIMIT > 50000', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100000';
      const result = analyzeQuery(query);

      expect(result.recommendation).toBe('download-instead');
      expect(result.warnings).toContain('Large LIMIT (100,000) - may exhaust browser memory');
    });

    it('should recommend "download-instead" for queries without LIMIT', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = analyzeQuery(query);

      expect(result.recommendation).toBe('download-instead');
      expect(result.warnings).toContain('Query has no LIMIT clause - may return millions of results');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty query', () => {
      const query = '';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(false);
      expect(result.hasOffset).toBe(false);
      expect(result.recommendation).toBe('download-instead');
    });

    it('should handle query with only whitespace', () => {
      const query = '   \n\t  ';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(false);
      expect(result.recommendation).toBe('download-instead');
    });

    it('should handle query with LIMIT in comment', () => {
      const query = '# LIMIT 100\nSELECT * WHERE { ?s ?p ?o }';
      const result = analyzeQuery(query);

      // Will still detect LIMIT in comment (simple regex), but this is acceptable
      // Real SPARQL parser would ignore comments
      expect(result.hasLimit).toBe(true);
    });

    it('should handle query with multiple LIMIT clauses (takes first)', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 LIMIT 200';
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(true);
      expect(result.limitValue).toBe(100); // Takes first match
    });

    it('should handle complex multi-line query', () => {
      const query = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        SELECT ?name ?email
        WHERE {
          ?person foaf:name ?name .
          ?person foaf:mbox ?email .
        }
        ORDER BY ?name
        LIMIT 500
        OFFSET 100
      `;
      const result = analyzeQuery(query);

      expect(result.hasLimit).toBe(true);
      expect(result.limitValue).toBe(500);
      expect(result.hasOffset).toBe(true);
      expect(result.offsetValue).toBe(100);
      expect(result.recommendation).toBe('safe');
    });
  });

  describe('Warnings', () => {
    it('should include multiple warnings when appropriate', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100000 OFFSET 20000';
      const result = analyzeQuery(query);

      expect(result.warnings.length).toBeGreaterThan(1);
      expect(result.warnings).toContain('Large LIMIT (100,000) - may exhaust browser memory');
      expect(result.warnings).toContain('Large OFFSET (20,000) - query may be slow');
    });

    it('should not warn about OFFSET < 10000', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 OFFSET 5000';
      const result = analyzeQuery(query);

      const offsetWarnings = result.warnings.filter(w => w.includes('OFFSET'));
      expect(offsetWarnings).toHaveLength(0);
    });

    it('should warn about OFFSET at exactly 10001', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 OFFSET 10001';
      const result = analyzeQuery(query);

      expect(result.warnings).toContain('Large OFFSET (10,001) - query may be slow');
    });
  });

  describe('Thresholds', () => {
    it('should use default thresholds correctly', () => {
      expect(DEFAULT_THRESHOLDS.warnThreshold).toBe(10000);
      expect(DEFAULT_THRESHOLDS.downloadThreshold).toBe(50000);
      expect(DEFAULT_THRESHOLDS.maxRows).toBe(10000);
    });
  });

  describe('Memory estimation', () => {
    it('should estimate memory for small queries', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100';
      const result = analyzeQuery(query);

      expect(result.estimatedMemoryMB).toBe(0.1);
    });

    it('should estimate memory for medium queries', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 5000';
      const result = analyzeQuery(query);

      expect(result.estimatedMemoryMB).toBe(5);
    });

    it('should estimate memory for large queries', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100000';
      const result = analyzeQuery(query);

      expect(result.estimatedMemoryMB).toBe(100);
    });

    it('should not estimate memory for unbounded queries', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const result = analyzeQuery(query);

      expect(result.estimatedMemoryMB).toBeUndefined();
    });
  });
});
