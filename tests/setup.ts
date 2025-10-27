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

// Mock IntersectionObserver (required by some Carbon components)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch globally to avoid AbortSignal instanceof issues with undici
// Individual tests can override this mock as needed
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () =>
      Promise.resolve({
        head: { vars: ['s', 'p', 'o'] },
        results: { bindings: [] },
      }),
    text: () => Promise.resolve(''),
  })
);
