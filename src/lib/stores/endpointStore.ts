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
 * Endpoint catalogue store
 * Manages the list of available SPARQL endpoints
 */
function createEndpointCatalogueStore(): {
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
 * Global endpoint catalogue store
 */
export const endpointCatalogue = createEndpointCatalogueStore();

/**
 * Default/current endpoint store
 * Tracks the currently selected endpoint URL
 */
export const defaultEndpoint = writable<string>('');
