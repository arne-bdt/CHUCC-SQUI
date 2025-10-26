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
