import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateUrlFormat,
  validateEndpoint,
  testEndpointAccessibility,
  type ValidationResult,
} from '../../../src/lib/utils/endpointValidator';

describe('endpointValidator', () => {
  describe('validateUrlFormat', () => {
    it('should accept empty URLs', () => {
      const result = validateUrlFormat('');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid HTTPS URLs', () => {
      const result = validateUrlFormat('https://example.com/sparql');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid HTTP URLs with warning', () => {
      const result = validateUrlFormat('http://example.com/sparql');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('HTTP');
    });

    it('should reject URLs with invalid protocols', () => {
      const result = validateUrlFormat('ftp://example.com/sparql');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('HTTP or HTTPS');
    });

    it('should reject malformed URLs', () => {
      const result = validateUrlFormat('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid URL');
    });

    it('should trim whitespace from URLs', () => {
      const result = validateUrlFormat('  https://example.com/sparql  ');
      expect(result.valid).toBe(true);
    });

    it('should accept URLs with query parameters', () => {
      const result = validateUrlFormat('https://example.com/sparql?default-graph-uri=test');
      expect(result.valid).toBe(true);
    });

    it('should accept URLs with ports', () => {
      const result = validateUrlFormat('https://example.com:8080/sparql');
      expect(result.valid).toBe(true);
    });

    it('should accept URLs with authentication', () => {
      const result = validateUrlFormat('https://user:pass@example.com/sparql');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateEndpoint', () => {
    it('should be an alias for validateUrlFormat', () => {
      const url = 'https://example.com/sparql';
      const result1 = validateUrlFormat(url);
      const result2 = validateEndpoint(url);
      expect(result1).toEqual(result2);
    });
  });

  describe('testEndpointAccessibility', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return valid for empty URLs without testing', async () => {
      const result = await testEndpointAccessibility('');
      expect(result.valid).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return error for invalid URL format', async () => {
      const result = await testEndpointAccessibility('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return valid for accessible endpoints', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
      } as Response);

      const result = await testEndpointAccessibility('https://example.com/sparql');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/sparql', {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache',
      });
    });

    it('should return warning for endpoints with non-OK status', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await testEndpointAccessibility('https://example.com/sparql');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('404');
    });

    it('should return warning for CORS errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await testEndpointAccessibility('https://example.com/sparql');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('CORS');
    });

    it('should return warning for network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await testEndpointAccessibility('https://example.com/sparql');
      expect(result.valid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('Unable to reach');
    });

    it('should handle HTTP URLs with warning', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
      } as Response);

      const result = await testEndpointAccessibility('http://example.com/sparql');
      expect(result.valid).toBe(true);
      // Should have warning about HTTP even if endpoint is accessible
      expect(result.warning).toBeDefined();
    });
  });
});
