/**
 * Service Description Store
 * Manages SPARQL Service Description metadata for endpoints
 * Provides reactive access to service capabilities, features, and datasets
 */

import { writable } from 'svelte/store';
import type { ServiceDescription } from '../types';
import { serviceDescriptionService } from '../services/serviceDescriptionService';
import { serviceDescriptionCache } from '../services/serviceDescriptionCache';

/**
 * Service description store state
 */
export interface ServiceDescriptionState {
  /** Service descriptions by endpoint URL */
  descriptions: Map<string, ServiceDescription>;

  /** Currently active endpoint URL */
  currentEndpoint: string | null;

  /** Loading state */
  loading: boolean;

  /** Error message */
  error: string | null;
}

/**
 * Create service description store
 * Provides reactive access to service descriptions with caching
 */
export function createServiceDescriptionStore() {
  const initialState: ServiceDescriptionState = {
    descriptions: new Map(),
    currentEndpoint: null,
    loading: false,
    error: null,
  };

  const { subscribe, set, update } = writable<ServiceDescriptionState>(initialState);

  return {
    subscribe,

    /**
     * Fetch service description for endpoint
     * Uses cache if available and valid, otherwise fetches from endpoint
     * @param endpointUrl SPARQL endpoint URL
     * @param forceRefresh Force refetch even if cached
     */
    async fetchForEndpoint(endpointUrl: string, forceRefresh = false): Promise<void> {
      // Set loading state
      update((state) => ({
        ...state,
        currentEndpoint: endpointUrl,
        loading: true,
        error: null,
      }));

      try {
        // Check cache first (unless force refresh)
        if (!forceRefresh) {
          const cached = serviceDescriptionCache.get(endpointUrl);
          if (cached) {
            update((state) => {
              const descriptions = new Map(state.descriptions);
              descriptions.set(endpointUrl, cached);
              return {
                ...state,
                descriptions,
                loading: false,
              };
            });
            return;
          }
        }

        // Fetch from endpoint
        const description = await serviceDescriptionService.fetchServiceDescription(endpointUrl);

        if (description) {
          // Cache the description (even if unavailable, for future reference)
          serviceDescriptionCache.set(endpointUrl, description);

          // Update store
          update((state) => {
            const descriptions = new Map(state.descriptions);
            descriptions.set(endpointUrl, description);
            return {
              ...state,
              descriptions,
              loading: false,
              // Set error if endpoint doesn't support service description
              error: !description.available
                ? 'Endpoint does not support SPARQL Service Description'
                : null,
            };
          });
        } else {
          // Endpoint doesn't support service description (null response)
          update((state) => ({
            ...state,
            loading: false,
            error: 'Endpoint does not support SPARQL Service Description',
          }));
        }
      } catch (error) {
        // Handle fetch error
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch service description';

        update((state) => ({
          ...state,
          loading: false,
          error: errorMessage,
        }));
      }
    },

    /**
     * Get cached service description for endpoint
     * Returns null if not cached
     * @param endpointUrl SPARQL endpoint URL
     * @returns Service description or null
     */
    getForEndpoint(endpointUrl: string): ServiceDescription | null {
      let description: ServiceDescription | null = null;

      update((state) => {
        description = state.descriptions.get(endpointUrl) || null;
        return state;
      });

      return description;
    },

    /**
     * Set current endpoint
     * Fetches service description if not already cached
     * @param endpointUrl SPARQL endpoint URL
     */
    async setCurrentEndpoint(endpointUrl: string): Promise<void> {
      update((state) => ({
        ...state,
        currentEndpoint: endpointUrl,
      }));

      // Fetch if not already cached
      const cached = serviceDescriptionCache.get(endpointUrl);
      if (!cached) {
        await this.fetchForEndpoint(endpointUrl);
      }
    },

    /**
     * Refresh service description for current endpoint
     * Forces refetch from endpoint, bypassing cache
     */
    async refreshCurrent(): Promise<void> {
      let currentEndpoint: string | null = null;

      update((state) => {
        currentEndpoint = state.currentEndpoint;
        return state;
      });

      if (currentEndpoint) {
        await this.fetchForEndpoint(currentEndpoint, true);
      }
    },

    /**
     * Clear cache and all stored descriptions
     */
    clearCache(): void {
      serviceDescriptionCache.clear();
      update((state) => ({
        ...state,
        descriptions: new Map(),
      }));
    },

    /**
     * Clear error state
     */
    clearError(): void {
      update((state) => ({
        ...state,
        error: null,
      }));
    },

    /**
     * Reset store to initial state
     */
    reset(): void {
      set(initialState);
    },

    /**
     * Get cache statistics
     * @returns Cache statistics
     */
    getCacheStats() {
      return serviceDescriptionCache.getStats();
    },

    /**
     * Update cache configuration
     * @param config Partial cache configuration
     */
    updateCacheConfig(config: { ttl?: number; maxSize?: number; persistToStorage?: boolean }): void {
      serviceDescriptionCache.updateConfig(config);
    },

    /**
     * Clean up expired cache entries
     * @returns Number of entries removed
     */
    cleanupExpired(): number {
      return serviceDescriptionCache.cleanupExpired();
    },

    /**
     * Prefetch service descriptions for multiple endpoints
     * Useful for preloading known endpoints
     * @param endpoints Array of endpoint URLs
     */
    async prefetchEndpoints(endpoints: string[]): Promise<void> {
      const promises = endpoints.map((endpoint) => {
        // Only fetch if not already cached
        const cached = serviceDescriptionCache.get(endpoint);
        if (!cached) {
          return this.fetchForEndpoint(endpoint);
        }
        return Promise.resolve();
      });

      await Promise.allSettled(promises);
    },

    /**
     * Direct state update for testing purposes
     * @internal Use only in tests/stories
     * @param updater Function to update state
     */
    update,
  };
}

/**
 * Singleton service description store instance
 */
export const serviceDescriptionStore = createServiceDescriptionStore();
