import { writable } from 'svelte/store';
import type { Endpoint } from '../types';

/**
 * Default endpoint catalogue
 * Well-known SPARQL endpoints for quick selection
 */
const defaultCatalogue: Endpoint[] = [
  {
    url: 'https://dbpedia.org/sparql',
    name: 'DBpedia',
    description: 'DBpedia SPARQL endpoint - Structured data from Wikipedia',
  },
  {
    url: 'https://query.wikidata.org/sparql',
    name: 'Wikidata',
    description: 'Wikidata Query Service - Free knowledge base',
  },
  {
    url: 'https://lod.openlinksw.com/sparql',
    name: 'LOD Cloud',
    description: 'OpenLink LOD Cloud Cache - Linked Open Data',
  },
  {
    url: 'https://sparql.uniprot.org/sparql',
    name: 'UniProt',
    description: 'UniProt SPARQL endpoint - Protein sequence and annotation data',
  },
];

/**
 * Create a new endpoint catalogue store instance
 *
 * Factory function allows creating multiple independent store instances
 * for state isolation (Storybook, tabs, tests)
 *
 * @returns Endpoint catalogue store with methods
 */
export function createEndpointCatalogueStore(): {
  subscribe: (_run: (_value: Endpoint[]) => void) => () => void;
  addEndpoint: (_endpoint: Endpoint) => void;
  removeEndpoint: (_url: string) => void;
  updateEndpoint: (_url: string, _updates: Partial<Endpoint>) => void;
  setCatalogue: (_catalogue: Endpoint[]) => void;
  reset: () => void;
} {
  const { subscribe, set, update } = writable<Endpoint[]>(defaultCatalogue);

  return {
    subscribe,

    /**
     * Add a new endpoint to the catalogue
     */
    addEndpoint: (endpoint: Endpoint): void => {
      update((endpoints) => {
        // Check if endpoint already exists
        const exists = endpoints.some((e) => e.url === endpoint.url);
        if (exists) {
          return endpoints;
        }
        return [...endpoints, endpoint];
      });
    },

    /**
     * Remove an endpoint from the catalogue
     */
    removeEndpoint: (url: string): void => {
      update((endpoints) => endpoints.filter((e) => e.url !== url));
    },

    /**
     * Update an existing endpoint
     */
    updateEndpoint: (url: string, updates: Partial<Endpoint>): void => {
      update((endpoints) => endpoints.map((e) => (e.url === url ? { ...e, ...updates } : e)));
    },

    /**
     * Set the entire catalogue
     */
    setCatalogue: (catalogue: Endpoint[]): void => {
      set(catalogue);
    },

    /**
     * Reset to default catalogue
     */
    reset: (): void => {
      set(defaultCatalogue);
    },
  };
}

/**
 * Endpoint catalogue store type
 */
export type EndpointCatalogueStore = ReturnType<typeof createEndpointCatalogueStore>;

/**
 * Global endpoint catalogue store instance
 *
 * Use this for backward compatibility with existing code.
 * New code should use context-based stores via getEndpointStore()
 */
export const endpointCatalogue = createEndpointCatalogueStore();

/**
 * Create a new endpoint store instance
 *
 * Factory function allows creating multiple independent store instances
 * for state isolation (Storybook, tabs, tests)
 *
 * @param initialEndpoint - Initial endpoint URL (default: '')
 * @returns Writable store for endpoint URL
 */
export function createEndpointStore(initialEndpoint = '') {
  return writable<string>(initialEndpoint);
}

/**
 * Endpoint store type
 */
export type EndpointStore = ReturnType<typeof createEndpointStore>;

/**
 * Global default endpoint store instance
 *
 * Use this for backward compatibility with existing code.
 * New code should use context-based stores via getEndpointStore()
 */
export const defaultEndpoint = createEndpointStore();
