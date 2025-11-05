/**
 * Unit tests for format utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getFormatLabel,
  getFormatDescription,
  getAvailableFormats,
  getBestFormat,
  validateFormat,
  formatToMimeType,
  mimeTypeToFormat,
} from '../../src/lib/utils/formatUtils';
import type { ServiceDescription } from '../../src/lib/types';

// Mock service descriptions
const mockServiceDescWithAllFormats: ServiceDescription = {
  endpoint: 'http://example.org/sparql',
  supportedLanguages: [],
  features: [],
  resultFormats: [
    'application/sparql-results+json',
    'application/sparql-results+xml',
    'text/csv',
    'text/tab-separated-values',
    'text/turtle',
    'application/rdf+xml',
    'application/ld+json',
    'application/n-triples',
  ],
  inputFormats: [],
  extensionFunctions: [],
  extensionAggregates: [],
  datasets: [],
  lastFetched: new Date(),
  available: true,
};

const mockServiceDescWithLimitedFormats: ServiceDescription = {
  endpoint: 'http://example.org/sparql',
  supportedLanguages: [],
  features: [],
  resultFormats: [
    'application/sparql-results+json',
    'text/csv',
    'text/turtle',
  ],
  inputFormats: [],
  extensionFunctions: [],
  extensionAggregates: [],
  datasets: [],
  lastFetched: new Date(),
  available: true,
};

const mockServiceDescUnavailable: ServiceDescription = {
  endpoint: 'http://example.org/sparql',
  supportedLanguages: [],
  features: [],
  resultFormats: [],
  inputFormats: [],
  extensionFunctions: [],
  extensionAggregates: [],
  datasets: [],
  lastFetched: new Date(),
  available: false,
};

describe('getFormatLabel', () => {
  it('returns human-readable labels for known MIME types', () => {
    expect(getFormatLabel('application/sparql-results+json')).toBe('JSON');
    expect(getFormatLabel('application/sparql-results+xml')).toBe('XML');
    expect(getFormatLabel('text/csv')).toBe('CSV');
    expect(getFormatLabel('text/tab-separated-values')).toBe('TSV');
    expect(getFormatLabel('text/turtle')).toBe('Turtle');
    expect(getFormatLabel('application/rdf+xml')).toBe('RDF/XML');
    expect(getFormatLabel('application/n-triples')).toBe('N-Triples');
    expect(getFormatLabel('application/ld+json')).toBe('JSON-LD');
  });

  it('returns the original MIME type for unknown formats', () => {
    expect(getFormatLabel('application/unknown')).toBe('application/unknown');
  });
});

describe('getFormatDescription', () => {
  it('returns descriptions for known MIME types', () => {
    expect(getFormatDescription('application/sparql-results+json')).toContain('JSON');
    expect(getFormatDescription('text/csv')).toContain('Comma-Separated Values');
    expect(getFormatDescription('text/turtle')).toContain('Turtle');
  });

  it('returns empty string for unknown formats', () => {
    expect(getFormatDescription('application/unknown')).toBe('');
  });
});

describe('getAvailableFormats', () => {
  it('returns binding formats for SELECT queries with service description', () => {
    const formats = getAvailableFormats(mockServiceDescWithAllFormats, 'SELECT');
    expect(formats).toContain('application/sparql-results+json');
    expect(formats).toContain('application/sparql-results+xml');
    expect(formats).toContain('text/csv');
    expect(formats).toContain('text/tab-separated-values');
    expect(formats).not.toContain('text/turtle');
    expect(formats).not.toContain('application/rdf+xml');
  });

  it('returns binding formats for ASK queries with service description', () => {
    const formats = getAvailableFormats(mockServiceDescWithAllFormats, 'ASK');
    expect(formats).toContain('application/sparql-results+json');
    expect(formats).toContain('application/sparql-results+xml');
  });

  it('returns RDF formats for CONSTRUCT queries with service description', () => {
    const formats = getAvailableFormats(mockServiceDescWithAllFormats, 'CONSTRUCT');
    expect(formats).toContain('text/turtle');
    expect(formats).toContain('application/rdf+xml');
    expect(formats).toContain('application/ld+json');
    expect(formats).toContain('application/n-triples');
    expect(formats).not.toContain('application/sparql-results+json');
    expect(formats).not.toContain('text/csv');
  });

  it('returns RDF formats for DESCRIBE queries with service description', () => {
    const formats = getAvailableFormats(mockServiceDescWithAllFormats, 'DESCRIBE');
    expect(formats).toContain('text/turtle');
    expect(formats).toContain('application/rdf+xml');
  });

  it('returns default formats when service description unavailable', () => {
    const formats = getAvailableFormats(mockServiceDescUnavailable, 'SELECT');
    expect(formats.length).toBeGreaterThan(0);
    expect(formats).toContain('application/sparql-results+json');
  });

  it('returns default formats when service description is null', () => {
    const formats = getAvailableFormats(null, 'SELECT');
    expect(formats.length).toBeGreaterThan(0);
    expect(formats).toContain('application/sparql-results+json');
  });

  it('returns default formats when service description is undefined', () => {
    const formats = getAvailableFormats(undefined, 'SELECT');
    expect(formats.length).toBeGreaterThan(0);
    expect(formats).toContain('application/sparql-results+json');
  });

  it('filters formats correctly for limited service description', () => {
    const selectFormats = getAvailableFormats(mockServiceDescWithLimitedFormats, 'SELECT');
    expect(selectFormats).toContain('application/sparql-results+json');
    expect(selectFormats).toContain('text/csv');
    expect(selectFormats).not.toContain('text/turtle');

    const constructFormats = getAvailableFormats(mockServiceDescWithLimitedFormats, 'CONSTRUCT');
    expect(constructFormats).toContain('text/turtle');
    expect(constructFormats).not.toContain('application/sparql-results+json');
  });
});

describe('getBestFormat', () => {
  it('prefers JSON for SELECT/ASK queries when available', () => {
    const formats = ['text/csv', 'application/sparql-results+json', 'text/turtle'];
    expect(getBestFormat(formats, 'SELECT')).toBe('application/sparql-results+json');
    expect(getBestFormat(formats, 'ASK')).toBe('application/sparql-results+json');
  });

  it('falls back to XML for SELECT/ASK queries when JSON unavailable', () => {
    const formats = ['text/csv', 'application/sparql-results+xml'];
    expect(getBestFormat(formats, 'SELECT')).toBe('application/sparql-results+xml');
  });

  it('falls back to CSV for SELECT/ASK queries when JSON and XML unavailable', () => {
    const formats = ['text/csv', 'text/tab-separated-values'];
    expect(getBestFormat(formats, 'SELECT')).toBe('text/csv');
  });

  it('prefers Turtle for CONSTRUCT/DESCRIBE queries when available', () => {
    const formats = ['application/rdf+xml', 'text/turtle', 'application/ld+json'];
    expect(getBestFormat(formats, 'CONSTRUCT')).toBe('text/turtle');
    expect(getBestFormat(formats, 'DESCRIBE')).toBe('text/turtle');
  });

  it('falls back to RDF/XML for CONSTRUCT/DESCRIBE queries when Turtle unavailable', () => {
    const formats = ['application/rdf+xml', 'application/ld+json'];
    expect(getBestFormat(formats, 'CONSTRUCT')).toBe('application/rdf+xml');
  });

  it('returns first format when no preferred format available', () => {
    const formats = ['application/unknown'];
    expect(getBestFormat(formats, 'SELECT')).toBe('application/unknown');
  });

  it('returns default JSON when formats array is empty', () => {
    expect(getBestFormat([], 'SELECT')).toBe('application/sparql-results+json');
  });
});

describe('validateFormat', () => {
  it('validates format is supported by endpoint', () => {
    const result = validateFormat(
      'application/sparql-results+json',
      mockServiceDescWithAllFormats,
      'SELECT'
    );
    expect(result.valid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('invalidates format not supported by endpoint', () => {
    const result = validateFormat(
      'text/tab-separated-values',
      mockServiceDescWithLimitedFormats,
      'SELECT'
    );
    expect(result.valid).toBe(false);
    expect(result.message).toBeDefined();
    expect(result.suggestedFormat).toBeDefined();
  });

  it('suggests alternative format when format unsupported', () => {
    const result = validateFormat(
      'application/sparql-results+xml',
      mockServiceDescWithLimitedFormats,
      'SELECT'
    );
    expect(result.valid).toBe(false);
    expect(result.suggestedFormat).toBe('application/sparql-results+json');
  });

  it('assumes format is valid when service description unavailable', () => {
    const result = validateFormat(
      'application/sparql-results+json',
      mockServiceDescUnavailable,
      'SELECT'
    );
    expect(result.valid).toBe(true);
  });

  it('assumes format is valid when service description is null', () => {
    const result = validateFormat(
      'application/sparql-results+json',
      null,
      'SELECT'
    );
    expect(result.valid).toBe(true);
  });
});

describe('formatToMimeType', () => {
  it('converts short format names to MIME types', () => {
    expect(formatToMimeType('json')).toBe('application/sparql-results+json');
    expect(formatToMimeType('xml')).toBe('application/sparql-results+xml');
    expect(formatToMimeType('csv')).toBe('text/csv');
    expect(formatToMimeType('tsv')).toBe('text/tab-separated-values');
    expect(formatToMimeType('turtle')).toBe('text/turtle');
    expect(formatToMimeType('jsonld')).toBe('application/ld+json');
    expect(formatToMimeType('ntriples')).toBe('application/n-triples');
    expect(formatToMimeType('rdfxml')).toBe('application/rdf+xml');
  });

  it('returns input if already a MIME type', () => {
    const mimeType = 'application/sparql-results+json';
    expect(formatToMimeType(mimeType)).toBe(mimeType);
  });

  it('returns unknown format unchanged', () => {
    expect(formatToMimeType('unknown')).toBe('unknown');
  });
});

describe('mimeTypeToFormat', () => {
  it('converts MIME types to short format names', () => {
    expect(mimeTypeToFormat('application/sparql-results+json')).toBe('json');
    expect(mimeTypeToFormat('application/sparql-results+xml')).toBe('xml');
    expect(mimeTypeToFormat('text/csv')).toBe('csv');
    expect(mimeTypeToFormat('text/tab-separated-values')).toBe('tsv');
    expect(mimeTypeToFormat('text/turtle')).toBe('turtle');
    expect(mimeTypeToFormat('application/ld+json')).toBe('jsonld');
    expect(mimeTypeToFormat('application/n-triples')).toBe('ntriples');
    expect(mimeTypeToFormat('application/rdf+xml')).toBe('rdfxml');
  });

  it('defaults to json for unknown MIME types', () => {
    expect(mimeTypeToFormat('application/unknown')).toBe('json');
  });
});
