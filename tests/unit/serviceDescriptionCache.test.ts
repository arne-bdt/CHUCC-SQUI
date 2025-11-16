/**
 * Unit tests for ServiceDescriptionCache
 * Tests TTL expiration, LRU eviction, and localStorage persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceDescriptionCache } from '../../src/lib/services/serviceDescriptionCache';
import type { ServiceDescription } from '../../src/lib/types';
import { logger } from '../../src/lib/utils/logger';

describe('ServiceDescriptionCache', () => {
  let cache: ServiceDescriptionCache;

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();

    // Create cache with short TTL for testing
    cache = new ServiceDescriptionCache({
      ttl: 1000, // 1 second
      maxSize: 5,
      persistToStorage: true,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockDescription = (endpoint: string): ServiceDescription => ({
    endpoint,
    supportedLanguages: [],
    features: [],
    resultFormats: [],
    inputFormats: [],
    extensionFunctions: [],
    extensionAggregates: [],
    datasets: [],
    lastFetched: new Date(),
    available: true,
  });

  describe('Basic cache operations', () => {
    it('should store and retrieve descriptions', () => {
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      const retrieved = cache.get('http://example.org/sparql');
      expect(retrieved).toEqual(description);
    });

    it('should return null for non-existent entries', () => {
      expect(cache.get('http://nonexistent.org/sparql')).toBeNull();
    });

    it('should check if entry exists', () => {
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      expect(cache.has('http://example.org/sparql')).toBe(true);
      expect(cache.has('http://nonexistent.org/sparql')).toBe(false);
    });

    it('should delete entries', () => {
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      expect(cache.has('http://example.org/sparql')).toBe(true);

      cache.delete('http://example.org/sparql');

      expect(cache.has('http://example.org/sparql')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('http://example1.org/sparql', createMockDescription('http://example1.org/sparql'));
      cache.set('http://example2.org/sparql', createMockDescription('http://example2.org/sparql'));

      expect(cache.size()).toBe(2);

      cache.clear();

      expect(cache.size()).toBe(0);
    });

    it('should get cache keys', () => {
      cache.set('http://example1.org/sparql', createMockDescription('http://example1.org/sparql'));
      cache.set('http://example2.org/sparql', createMockDescription('http://example2.org/sparql'));

      const keys = cache.keys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('http://example1.org/sparql');
      expect(keys).toContain('http://example2.org/sparql');
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      // Entry should exist immediately
      expect(cache.get('http://example.org/sparql')).toEqual(description);

      // Fast-forward time past TTL (1 second + 1ms)
      vi.advanceTimersByTime(1001);

      // Entry should be expired
      expect(cache.get('http://example.org/sparql')).toBeNull();
    });

    it('should not expire entries before TTL', () => {
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      // Fast-forward time but stay within TTL
      vi.advanceTimersByTime(500);

      // Entry should still exist
      expect(cache.get('http://example.org/sparql')).toEqual(description);
    });

    it('should update lastAccessed on get', () => {
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      vi.advanceTimersByTime(500);
      cache.get('http://example.org/sparql');

      const stats = cache.getStats();
      const entry = stats.entries.find(e => e.endpoint === 'http://example.org/sparql');
      expect(entry).toBeDefined();
      expect(entry!.lastAccessed.getTime()).toBeGreaterThan(entry!.cachedAt.getTime());
    });

    it('should clean up expired entries', () => {
      cache.set('http://example1.org/sparql', createMockDescription('http://example1.org/sparql'));
      cache.set('http://example2.org/sparql', createMockDescription('http://example2.org/sparql'));

      // Fast-forward past TTL
      vi.advanceTimersByTime(1001);

      // Add a new entry (not expired)
      cache.set('http://example3.org/sparql', createMockDescription('http://example3.org/sparql'));

      // Clean up expired entries
      const removed = cache.cleanupExpired();

      expect(removed).toBe(2); // Two expired entries removed
      expect(cache.size()).toBe(1); // Only the new entry remains
      expect(cache.has('http://example3.org/sparql')).toBe(true);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entry when cache is full', () => {
      // Fill cache to maxSize (5)
      for (let i = 1; i <= 5; i++) {
        cache.set(`http://example${i}.org/sparql`, createMockDescription(`http://example${i}.org/sparql`));
      }

      expect(cache.size()).toBe(5);

      // Add one more entry - should evict the first one (LRU)
      cache.set('http://example6.org/sparql', createMockDescription('http://example6.org/sparql'));

      expect(cache.size()).toBe(5); // Still at max size
      expect(cache.has('http://example1.org/sparql')).toBe(false); // First entry evicted
      expect(cache.has('http://example6.org/sparql')).toBe(true); // New entry added
    });

    it('should not evict when updating existing entry', () => {
      // Fill cache to maxSize (5)
      for (let i = 1; i <= 5; i++) {
        cache.set(`http://example${i}.org/sparql`, createMockDescription(`http://example${i}.org/sparql`));
      }

      // Update an existing entry
      cache.set('http://example3.org/sparql', createMockDescription('http://example3.org/sparql'));

      expect(cache.size()).toBe(5); // Size unchanged
      expect(cache.has('http://example1.org/sparql')).toBe(true); // First entry still there
    });

    it('should evict least recently accessed entry', () => {
      // Fill cache
      for (let i = 1; i <= 5; i++) {
        cache.set(`http://example${i}.org/sparql`, createMockDescription(`http://example${i}.org/sparql`));
      }

      // Access entries 2-5 to make entry 1 the LRU
      vi.advanceTimersByTime(100);
      cache.get('http://example2.org/sparql');
      cache.get('http://example3.org/sparql');
      cache.get('http://example4.org/sparql');
      cache.get('http://example5.org/sparql');

      // Add new entry - should evict entry 1 (LRU)
      cache.set('http://example6.org/sparql', createMockDescription('http://example6.org/sparql'));

      expect(cache.has('http://example1.org/sparql')).toBe(false);
      expect(cache.has('http://example6.org/sparql')).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should respect custom TTL', () => {
      const customCache = new ServiceDescriptionCache({
        ttl: 500, // 500ms TTL
        maxSize: 10,
        persistToStorage: false,
      });

      const description = createMockDescription('http://example.org/sparql');
      customCache.set('http://example.org/sparql', description);

      // Still valid at 400ms
      vi.advanceTimersByTime(400);
      expect(customCache.get('http://example.org/sparql')).toEqual(description);

      // Expired at 501ms
      vi.advanceTimersByTime(101);
      expect(customCache.get('http://example.org/sparql')).toBeNull();
    });

    it('should update configuration', () => {
      cache.updateConfig({ ttl: 2000 }); // Extend TTL to 2 seconds

      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      // Still valid at 1500ms (would have expired with original 1000ms TTL)
      vi.advanceTimersByTime(1500);
      expect(cache.get('http://example.org/sparql')).toEqual(description);

      // Expired at 2001ms
      vi.advanceTimersByTime(501);
      expect(cache.get('http://example.org/sparql')).toBeNull();
    });

    it('should evict excess entries when maxSize is reduced', () => {
      // Fill cache to maxSize (5)
      for (let i = 1; i <= 5; i++) {
        cache.set(`http://example${i}.org/sparql`, createMockDescription(`http://example${i}.org/sparql`));
      }

      expect(cache.size()).toBe(5);

      // Reduce maxSize to 3
      cache.updateConfig({ maxSize: 3 });

      // Should evict 2 LRU entries
      expect(cache.size()).toBe(3);
    });
  });

  describe('Cache statistics', () => {
    it('should provide cache statistics', () => {
      cache.set('http://example1.org/sparql', createMockDescription('http://example1.org/sparql'));
      cache.set('http://example2.org/sparql', createMockDescription('http://example2.org/sparql'));

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(5);
      expect(stats.ttl).toBe(1000);
      expect(stats.entries).toHaveLength(2);

      const entry1 = stats.entries.find(e => e.endpoint === 'http://example1.org/sparql');
      expect(entry1).toBeDefined();
      expect(entry1!.available).toBe(true);
      expect(entry1!.age).toBeGreaterThanOrEqual(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist cache to localStorage on set', () => {
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      const stored = localStorageMock.getItem('squi_service_description_cache');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].key).toBe('http://example.org/sparql');
    });

    it('should restore cache from localStorage on initialization', () => {
      // Populate cache and let it persist
      const description1 = createMockDescription('http://example1.org/sparql');
      const description2 = createMockDescription('http://example2.org/sparql');
      cache.set('http://example1.org/sparql', description1);
      cache.set('http://example2.org/sparql', description2);

      // Create new cache instance - should load from localStorage
      const newCache = new ServiceDescriptionCache({
        ttl: 1000,
        maxSize: 5,
        persistToStorage: true,
      });

      expect(newCache.size()).toBe(2);
      expect(newCache.has('http://example1.org/sparql')).toBe(true);
      expect(newCache.has('http://example2.org/sparql')).toBe(true);
    });

    it('should not restore expired entries from localStorage', () => {
      // Populate cache
      const description = createMockDescription('http://example.org/sparql');
      cache.set('http://example.org/sparql', description);

      // Fast-forward past TTL
      vi.advanceTimersByTime(1001);

      // Create new cache instance - should not load expired entry
      const newCache = new ServiceDescriptionCache({
        ttl: 1000,
        maxSize: 5,
        persistToStorage: true,
      });

      expect(newCache.size()).toBe(0);
    });

    it('should handle disabled persistence', () => {
      const noPersistCache = new ServiceDescriptionCache({
        ttl: 1000,
        maxSize: 5,
        persistToStorage: false,
      });

      const description = createMockDescription('http://example.org/sparql');
      noPersistCache.set('http://example.org/sparql', description);

      // Should not persist to localStorage
      const stored = localStorageMock.getItem('squi_service_description_cache');
      expect(stored).toBeNull();
    });

    it('should persist cache on delete', () => {
      cache.set('http://example1.org/sparql', createMockDescription('http://example1.org/sparql'));
      cache.set('http://example2.org/sparql', createMockDescription('http://example2.org/sparql'));

      cache.delete('http://example1.org/sparql');

      const stored = localStorageMock.getItem('squi_service_description_cache');
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].key).toBe('http://example2.org/sparql');
    });

    it('should persist cache on clear', () => {
      cache.set('http://example.org/sparql', createMockDescription('http://example.org/sparql'));

      cache.clear();

      const stored = localStorageMock.getItem('squi_service_description_cache');
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle corrupted localStorage data', () => {
      // Mock logger.warn to suppress warning output
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      // Set corrupted data in localStorage
      localStorageMock.setItem('squi_service_description_cache', 'corrupted data');

      // Should not crash on initialization
      const newCache = new ServiceDescriptionCache({
        ttl: 1000,
        maxSize: 5,
        persistToStorage: true,
      });

      expect(newCache.size()).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to load service description cache:',
        expect.any(SyntaxError)
      );

      warnSpy.mockRestore();
    });

    it('should handle localStorage quota exceeded', () => {
      // Mock logger.warn to suppress warning output
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not crash on set
      expect(() => {
        cache.set('http://example.org/sparql', createMockDescription('http://example.org/sparql'));
      }).not.toThrow();

      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to persist service description cache:',
        expect.any(Error)
      );

      // Restore original setItem
      localStorageMock.setItem = originalSetItem;
      warnSpy.mockRestore();
    });
  });
});
