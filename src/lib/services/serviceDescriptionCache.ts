/**
 * Service Description Cache
 * Provides in-memory caching with TTL and LRU eviction, plus localStorage persistence
 */

import type {
  ServiceDescription,
  CachedServiceDescription,
  ServiceDescriptionCacheConfig,
} from '../types';

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: ServiceDescriptionCacheConfig = {
  ttl: 3600000, // 1 hour in milliseconds
  maxSize: 50, // Maximum 50 cached descriptions
  persistToStorage: true,
};

/**
 * localStorage key for persisted cache
 */
const STORAGE_KEY = 'squi_service_description_cache';

/**
 * Service Description Cache Manager
 * Implements in-memory cache with TTL, LRU eviction, and localStorage persistence
 */
export class ServiceDescriptionCache {
  private cache: Map<string, CachedServiceDescription>;
  private config: ServiceDescriptionCacheConfig;

  constructor(config: Partial<ServiceDescriptionCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();

    // Load persisted cache on initialization
    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
  }

  /**
   * Get cached service description
   * Returns null if not cached, expired, or invalid
   * @param endpoint Endpoint URL
   * @returns Cached service description or null
   */
  get(endpoint: string): ServiceDescription | null {
    const cached = this.cache.get(endpoint);

    if (!cached) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    const age = now - cached.cachedAt;

    if (age > this.config.ttl) {
      // Expired - remove from cache
      this.cache.delete(endpoint);
      this.persistToStorage();
      return null;
    }

    // Update last accessed time for LRU
    cached.lastAccessed = now;

    return cached.description;
  }

  /**
   * Set cached service description
   * Enforces LRU eviction if cache is full
   * @param endpoint Endpoint URL
   * @param description Service description to cache
   */
  set(endpoint: string, description: ServiceDescription): void {
    const now = Date.now();

    // Check if cache is full
    if (this.cache.size >= this.config.maxSize && !this.cache.has(endpoint)) {
      // Evict least recently used entry
      this.evictLru();
    }

    // Add or update entry
    this.cache.set(endpoint, {
      description,
      cachedAt: now,
      lastAccessed: now,
    });

    // Persist to storage
    this.persistToStorage();
  }

  /**
   * Check if endpoint is cached and not expired
   * @param endpoint Endpoint URL
   * @returns true if cached and valid
   */
  has(endpoint: string): boolean {
    return this.get(endpoint) !== null;
  }

  /**
   * Delete cached entry for endpoint
   * @param endpoint Endpoint URL
   * @returns true if entry was deleted
   */
  delete(endpoint: string): boolean {
    const deleted = this.cache.delete(endpoint);
    if (deleted) {
      this.persistToStorage();
    }
    return deleted;
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    this.persistToStorage();
  }

  /**
   * Get cache size
   * @returns Number of cached entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all cached endpoints
   * @returns Array of endpoint URLs
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Update cache configuration
   * @param config New configuration (partial)
   */
  updateConfig(config: Partial<ServiceDescriptionCacheConfig>): void {
    this.config = { ...this.config, ...config };

    // If maxSize reduced, evict excess entries
    while (this.cache.size > this.config.maxSize) {
      this.evictLru();
    }

    this.persistToStorage();
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttl: number;
    entries: Array<{
      endpoint: string;
      cachedAt: Date;
      lastAccessed: Date;
      age: number;
      available: boolean;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([endpoint, cached]) => ({
      endpoint,
      cachedAt: new Date(cached.cachedAt),
      lastAccessed: new Date(cached.lastAccessed),
      age: now - cached.cachedAt,
      available: cached.description.available,
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      entries,
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLru(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, cached] of this.cache.entries()) {
      if (cached.lastAccessed < lruTime) {
        lruTime = cached.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Persist cache to localStorage
   */
  private persistToStorage(): void {
    if (!this.config.persistToStorage) {
      return;
    }

    try {
      // Convert Map to serializable array
      const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        value: {
          ...value,
          // Convert Date to ISO string
          description: {
            ...value.description,
            lastFetched: value.description.lastFetched.toISOString(),
          },
        },
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      // Silently fail if localStorage is unavailable
      console.warn('Failed to persist service description cache:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const entries: Array<{
        key: string;
        value: {
          description: ServiceDescription & { lastFetched: string };
          cachedAt: number;
          lastAccessed: number;
        };
      }> = JSON.parse(stored);

      const now = Date.now();

      for (const { key, value } of entries) {
        // Check if entry is expired
        const age = now - value.cachedAt;
        if (age > this.config.ttl) {
          continue; // Skip expired entries
        }

        // Restore entry with Date object
        this.cache.set(key, {
          description: {
            ...value.description,
            lastFetched: new Date(value.description.lastFetched),
          },
          cachedAt: value.cachedAt,
          lastAccessed: value.lastAccessed,
        });
      }

      // Enforce maxSize limit after loading
      while (this.cache.size > this.config.maxSize) {
        this.evictLru();
      }
    } catch (error) {
      // Silently fail if localStorage is corrupted
      console.warn('Failed to load service description cache:', error);
      this.cache.clear();
    }
  }

  /**
   * Clean up expired entries
   * @returns Number of entries removed
   */
  cleanupExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, cached] of this.cache.entries()) {
      const age = now - cached.cachedAt;
      if (age > this.config.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.persistToStorage();
    }

    return removed;
  }
}

/**
 * Singleton instance of ServiceDescriptionCache
 */
export const serviceDescriptionCache = new ServiceDescriptionCache();
