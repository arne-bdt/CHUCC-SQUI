/**
 * Integration tests for Service Description Store
 * Tests store, service, and cache integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { createServiceDescriptionStore } from '../../src/lib/stores/serviceDescriptionStore';
import { serviceDescriptionCache } from '../../src/lib/services/serviceDescriptionCache';

describe('Service Description Store Integration', () => {
  let store: ReturnType<typeof createServiceDescriptionStore>;

  beforeEach(() => {
    // Clear cache before each test
    serviceDescriptionCache.clear();

    // Create fresh store instance
    store = createServiceDescriptionStore();

    // Reset fetch mocks
    vi.restoreAllMocks();
  });

  const mockTurtleResponse = `
    @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

    <http://example.org/sparql> a sd:Service ;
      sd:supportedLanguage sd:SPARQL11Query ;
      sd:resultFormat <http://www.w3.org/ns/formats/SPARQL_Results_JSON> ;
      sd:feature sd:DereferencesURIs .
  `;

  describe('fetchForEndpoint', () => {
    it('should fetch service description and update store', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      await store.fetchForEndpoint('http://example.org/sparql');

      const state = get(store);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.currentEndpoint).toBe('http://example.org/sparql');

      const description = state.descriptions.get('http://example.org/sparql');
      expect(description).toBeDefined();
      expect(description?.available).toBe(true);
      expect(description?.supportedLanguages).toHaveLength(1);
    });

    it('should use cached description on second fetch', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      // First fetch
      await store.fetchForEndpoint('http://example.org/sparql');
      expect(global.fetch).toHaveBeenCalledTimes(2);

      vi.clearAllMocks();

      // Second fetch - should use cache
      await store.fetchForEndpoint('http://example.org/sparql');
      expect(global.fetch).not.toHaveBeenCalled();

      const state = get(store);
      const description = state.descriptions.get('http://example.org/sparql');
      expect(description).toBeDefined();
    });

    it('should bypass cache on force refresh', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      // First fetch
      await store.fetchForEndpoint('http://example.org/sparql');
      const firstFetchCount = (global.fetch as any).mock.calls.length;

      vi.clearAllMocks();

      // Force refresh - should fetch again
      await store.fetchForEndpoint('http://example.org/sparql', true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should set loading state during fetch', async () => {
      let loadingDuringFetch = false;

      global.fetch = vi.fn(() => {
        const state = get(store);
        loadingDuringFetch = state.loading;

        return Promise.resolve({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);
      });

      await store.fetchForEndpoint('http://example.org/sparql');

      expect(loadingDuringFetch).toBe(true);

      const finalState = get(store);
      expect(finalState.loading).toBe(false);
    });

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
        } as any)
        .mockRejectedValueOnce(new Error('Network error'));

      await store.fetchForEndpoint('http://example.org/sparql');

      const state = get(store);
      expect(state.loading).toBe(false);
      expect(state.error).toContain('Network error');
    });

    it('should handle endpoints without service description', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as any);

      await store.fetchForEndpoint('http://example.org/sparql');

      const state = get(store);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Endpoint does not support SPARQL Service Description');
    });
  });

  describe('setCurrentEndpoint', () => {
    it('should set current endpoint and fetch if not cached', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      await store.setCurrentEndpoint('http://example.org/sparql');

      const state = get(store);
      expect(state.currentEndpoint).toBe('http://example.org/sparql');
      expect(state.descriptions.has('http://example.org/sparql')).toBe(true);
    });

    it('should not refetch if already cached', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      // Pre-populate cache
      await store.fetchForEndpoint('http://example.org/sparql');
      const fetchCount = (global.fetch as any).mock.calls.length;

      vi.clearAllMocks();

      // Set current endpoint (already cached)
      await store.setCurrentEndpoint('http://example.org/sparql');

      // Should not fetch again
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('refreshCurrent', () => {
    it('should force refresh current endpoint', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      // Set current endpoint
      await store.setCurrentEndpoint('http://example.org/sparql');

      vi.clearAllMocks();

      // Refresh current
      await store.refreshCurrent();

      // Should fetch again
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should do nothing if no current endpoint', async () => {
      global.fetch = vi.fn();

      await store.refreshCurrent();

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Cache operations', () => {
    it('should clear cache and store descriptions', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      await store.fetchForEndpoint('http://example1.org/sparql');
      await store.fetchForEndpoint('http://example2.org/sparql');

      let state = get(store);
      expect(state.descriptions.size).toBe(2);

      store.clearCache();

      state = get(store);
      expect(state.descriptions.size).toBe(0);
      expect(serviceDescriptionCache.size()).toBe(0);
    });

    it('should get cache statistics', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      await store.fetchForEndpoint('http://example.org/sparql');

      const stats = store.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries).toHaveLength(1);
      expect(stats.entries[0].endpoint).toBe('http://example.org/sparql');
    });

    it('should update cache configuration', () => {
      store.updateCacheConfig({ ttl: 5000 });

      const stats = store.getCacheStats();
      expect(stats.ttl).toBe(5000);
    });

    it('should clean up expired entries', async () => {
      vi.useFakeTimers();

      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      await store.fetchForEndpoint('http://example.org/sparql');

      // Fast-forward past default TTL (1 hour)
      vi.advanceTimersByTime(3600001);

      const removed = store.cleanupExpired();
      expect(removed).toBe(1);

      vi.useRealTimers();
    });
  });

  describe('Prefetch endpoints', () => {
    it('should prefetch multiple endpoints', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      const endpoints = [
        'http://example1.org/sparql',
        'http://example2.org/sparql',
        'http://example3.org/sparql',
      ];

      await store.prefetchEndpoints(endpoints);

      const state = get(store);
      expect(state.descriptions.size).toBe(3);

      for (const endpoint of endpoints) {
        expect(state.descriptions.has(endpoint)).toBe(true);
      }
    });

    it('should skip already cached endpoints during prefetch', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      // Pre-fetch one endpoint
      await store.fetchForEndpoint('http://example1.org/sparql');

      vi.clearAllMocks();

      // Prefetch including the already cached one
      await store.prefetchEndpoints([
        'http://example1.org/sparql',
        'http://example2.org/sparql',
      ]);

      // Should only fetch the second endpoint
      const fetchCalls = (global.fetch as any).mock.calls.length;
      expect(fetchCalls).toBeLessThan(4); // 2 calls per new endpoint (check + fetch)
    });
  });

  describe('Error handling', () => {
    it('should clear error state', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await store.fetchForEndpoint('http://example.org/sparql');

      let state = get(store);
      expect(state.error).not.toBeNull();

      store.clearError();

      state = get(store);
      expect(state.error).toBeNull();
    });

    it('should reset store to initial state', async () => {
      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      await store.fetchForEndpoint('http://example.org/sparql');

      store.reset();

      const state = get(store);
      expect(state.descriptions.size).toBe(0);
      expect(state.currentEndpoint).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Reactivity', () => {
    it('should notify subscribers on state changes', async () => {
      const states: any[] = [];

      const unsubscribe = store.subscribe((state) => {
        states.push({ ...state, descriptions: new Map(state.descriptions) });
      });

      global.fetch = vi.fn()
        .mockResolvedValue({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => mockTurtleResponse,
        } as any);

      await store.fetchForEndpoint('http://example.org/sparql');

      unsubscribe();

      // Should have initial state + loading state + final state
      expect(states.length).toBeGreaterThanOrEqual(2);
      expect(states[states.length - 1].loading).toBe(false);
      expect(states[states.length - 1].descriptions.size).toBe(1);
    });
  });
});
