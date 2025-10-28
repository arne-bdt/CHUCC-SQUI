/**
 * Test setup for Vitest
 * Configures global test utilities and mocks
 */

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock ResizeObserver (required by wx-svelte-grid)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver (required by some Carbon components and CodeMirror)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock fetch globally to avoid AbortSignal instanceof issues with undici
// Individual tests can override this mock as needed
global.fetch = vi.fn().mockImplementation(() => {
  const mockResults = {
    head: { vars: ['s', 'p', 'o'] },
    results: { bindings: [] },
  };
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/sparql-results+json' }),
    text: () => Promise.resolve(JSON.stringify(mockResults)),
    json: () => Promise.resolve(mockResults),
  });
});

// Mock URL.createObjectURL and URL.revokeObjectURL (required for download tests)
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();
