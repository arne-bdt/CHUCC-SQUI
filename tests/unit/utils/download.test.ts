/**
 * Unit tests for download utility functions - Task 38
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMimeType,
  getFileExtension,
  generateFilename,
  downloadFile,
  downloadResults,
} from '../../../src/lib/utils/download';
import type { ResultFormat } from '../../../src/lib/types';

describe('download utility', () => {
  describe('getMimeType', () => {
    it('should return correct MIME type for JSON', () => {
      expect(getMimeType('json')).toBe('application/json');
    });

    it('should return correct MIME type for XML', () => {
      expect(getMimeType('xml')).toBe('application/xml');
    });

    it('should return correct MIME type for CSV', () => {
      expect(getMimeType('csv')).toBe('text/csv');
    });

    it('should return correct MIME type for TSV', () => {
      expect(getMimeType('tsv')).toBe('text/tab-separated-values');
    });

    it('should return correct MIME type for Turtle', () => {
      expect(getMimeType('turtle')).toBe('text/turtle');
    });

    it('should return correct MIME type for JSON-LD', () => {
      expect(getMimeType('jsonld')).toBe('application/ld+json');
    });

    it('should return correct MIME type for N-Triples', () => {
      expect(getMimeType('ntriples')).toBe('application/n-triples');
    });

    it('should return correct MIME type for RDF/XML', () => {
      expect(getMimeType('rdfxml')).toBe('application/rdf+xml');
    });
  });

  describe('getFileExtension', () => {
    it('should return correct extension for JSON', () => {
      expect(getFileExtension('json')).toBe('json');
    });

    it('should return correct extension for Turtle', () => {
      expect(getFileExtension('turtle')).toBe('ttl');
    });

    it('should return correct extension for N-Triples', () => {
      expect(getFileExtension('ntriples')).toBe('nt');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with default prefix', () => {
      const filename = generateFilename('json');
      expect(filename).toMatch(/^results_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);
    });

    it('should generate filename with custom prefix', () => {
      const filename = generateFilename('csv', 'my-query');
      expect(filename).toMatch(/^my-query_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.csv$/);
    });

    it('should use correct extension for format', () => {
      const filename = generateFilename('turtle');
      expect(filename).toMatch(/\.ttl$/);
    });
  });

  describe('downloadFile', () => {
    let createElementSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;
    let clickSpy: any;

    beforeEach(() => {
      // Mock DOM elements
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      clickSpy = mockLink.click;

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should download string data', () => {
      const data = 'test data';
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      downloadFile(data, filename, mimeType);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should download object data as JSON', () => {
      const data = { foo: 'bar' };
      const filename = 'test.json';
      const mimeType = 'application/json';

      downloadFile(data, filename, mimeType);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('downloadResults', () => {
    let createElementSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;

    beforeEach(() => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should download results with generated filename', () => {
      const data = '{"results": []}';
      const format: ResultFormat = 'json';

      downloadResults(data, format);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should download results with custom filename', () => {
      const data = 'var1,var2\nval1,val2';
      const format: ResultFormat = 'csv';
      const filename = 'custom-results.csv';

      downloadResults(data, format, filename);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
