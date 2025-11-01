import { describe, it, expect, beforeEach } from 'vitest';
import { endpointCatalogue, defaultEndpoint } from '../../../src/lib/stores/endpointStore';
import type { Endpoint } from '../../../src/lib/types';

describe('Endpoint Catalogue Store', () => {
  let currentCatalogue: Endpoint[] = [];

  beforeEach(() => {
    // Reset to default catalogue before each test
    endpointCatalogue.reset();
    currentCatalogue = [];
  });

  describe('Initialization', () => {
    it('should initialize with default catalogue', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      expect(currentCatalogue).toHaveLength(4);
      expect(currentCatalogue[0].name).toBe('DBpedia');
      expect(currentCatalogue[1].name).toBe('Wikidata');
      expect(currentCatalogue[2].name).toBe('LOD Cloud');
      expect(currentCatalogue[3].name).toBe('UniProt');
      unsubscribe();
    });

    it('should have DBpedia endpoint with correct properties', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      const dbpedia = currentCatalogue.find((e) => e.name === 'DBpedia');
      expect(dbpedia).toBeDefined();
      expect(dbpedia?.url).toBe('https://dbpedia.org/sparql');
      expect(dbpedia?.description).toContain('Wikipedia');
      unsubscribe();
    });

    it('should have Wikidata endpoint with correct properties', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      const wikidata = currentCatalogue.find((e) => e.name === 'Wikidata');
      expect(wikidata).toBeDefined();
      expect(wikidata?.url).toBe('https://query.wikidata.org/sparql');
      expect(wikidata?.description).toContain('knowledge base');
      unsubscribe();
    });
  });

  describe('addEndpoint', () => {
    it('should add a new endpoint', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      const newEndpoint: Endpoint = {
        url: 'https://example.org/sparql',
        name: 'Example',
        description: 'Test endpoint',
      };

      endpointCatalogue.addEndpoint(newEndpoint);

      expect(currentCatalogue).toHaveLength(5);
      expect(currentCatalogue[4]).toEqual(newEndpoint);
      unsubscribe();
    });

    it('should not add duplicate endpoint', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      const duplicateEndpoint: Endpoint = {
        url: 'https://dbpedia.org/sparql', // Same as existing
        name: 'DBpedia Copy',
        description: 'Duplicate',
      };

      endpointCatalogue.addEndpoint(duplicateEndpoint);

      expect(currentCatalogue).toHaveLength(4); // Should still be 4
      unsubscribe();
    });

    it('should add endpoint with minimal properties', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      const minimalEndpoint: Endpoint = {
        url: 'https://minimal.org/sparql',
        name: 'Minimal',
      };

      endpointCatalogue.addEndpoint(minimalEndpoint);

      expect(currentCatalogue).toHaveLength(5);
      expect(currentCatalogue[4].url).toBe('https://minimal.org/sparql');
      expect(currentCatalogue[4].name).toBe('Minimal');
      unsubscribe();
    });
  });

  describe('removeEndpoint', () => {
    it('should remove an endpoint by URL', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.removeEndpoint('https://dbpedia.org/sparql');

      expect(currentCatalogue).toHaveLength(3);
      expect(currentCatalogue.find((e) => e.name === 'DBpedia')).toBeUndefined();
      unsubscribe();
    });

    it('should do nothing when removing non-existent endpoint', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.removeEndpoint('https://non-existent.org/sparql');

      expect(currentCatalogue).toHaveLength(4); // Should still be 4
      unsubscribe();
    });

    it('should remove all endpoints when called multiple times', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.removeEndpoint('https://dbpedia.org/sparql');
      endpointCatalogue.removeEndpoint('https://query.wikidata.org/sparql');
      endpointCatalogue.removeEndpoint('https://lod.openlinksw.com/sparql');
      endpointCatalogue.removeEndpoint('https://sparql.uniprot.org/sparql');

      expect(currentCatalogue).toHaveLength(0);
      unsubscribe();
    });
  });

  describe('updateEndpoint', () => {
    it('should update endpoint name', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.updateEndpoint('https://dbpedia.org/sparql', {
        name: 'DBpedia Updated',
      });

      const updated = currentCatalogue.find((e) => e.url === 'https://dbpedia.org/sparql');
      expect(updated?.name).toBe('DBpedia Updated');
      expect(updated?.description).toContain('Wikipedia'); // Should keep original description
      unsubscribe();
    });

    it('should update endpoint description', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.updateEndpoint('https://dbpedia.org/sparql', {
        description: 'New description',
      });

      const updated = currentCatalogue.find((e) => e.url === 'https://dbpedia.org/sparql');
      expect(updated?.description).toBe('New description');
      expect(updated?.name).toBe('DBpedia'); // Should keep original name
      unsubscribe();
    });

    it('should update multiple properties at once', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.updateEndpoint('https://dbpedia.org/sparql', {
        name: 'New DBpedia',
        description: 'New description',
      });

      const updated = currentCatalogue.find((e) => e.url === 'https://dbpedia.org/sparql');
      expect(updated?.name).toBe('New DBpedia');
      expect(updated?.description).toBe('New description');
      unsubscribe();
    });

    it('should not affect other endpoints', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.updateEndpoint('https://dbpedia.org/sparql', {
        name: 'Updated',
      });

      const wikidata = currentCatalogue.find((e) => e.name === 'Wikidata');
      expect(wikidata?.name).toBe('Wikidata'); // Should not change
      unsubscribe();
    });
  });

  describe('setCatalogue', () => {
    it('should replace entire catalogue', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      const newCatalogue: Endpoint[] = [
        {
          url: 'https://custom1.org/sparql',
          name: 'Custom 1',
          description: 'First custom endpoint',
        },
        {
          url: 'https://custom2.org/sparql',
          name: 'Custom 2',
          description: 'Second custom endpoint',
        },
      ];

      endpointCatalogue.setCatalogue(newCatalogue);

      expect(currentCatalogue).toHaveLength(2);
      expect(currentCatalogue[0].name).toBe('Custom 1');
      expect(currentCatalogue[1].name).toBe('Custom 2');
      unsubscribe();
    });

    it('should allow setting empty catalogue', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      endpointCatalogue.setCatalogue([]);

      expect(currentCatalogue).toHaveLength(0);
      unsubscribe();
    });
  });

  describe('reset', () => {
    it('should reset to default catalogue', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      // Modify the catalogue
      endpointCatalogue.setCatalogue([]);
      expect(currentCatalogue).toHaveLength(0);

      // Reset
      endpointCatalogue.reset();

      expect(currentCatalogue).toHaveLength(4);
      expect(currentCatalogue[0].name).toBe('DBpedia');
      unsubscribe();
    });

    it('should restore all default endpoints after modifications', () => {
      const unsubscribe = endpointCatalogue.subscribe((catalogue) => {
        currentCatalogue = catalogue;
      });

      // Add, remove, and update
      endpointCatalogue.addEndpoint({
        url: 'https://test.org/sparql',
        name: 'Test',
      });
      endpointCatalogue.removeEndpoint('https://dbpedia.org/sparql');
      endpointCatalogue.updateEndpoint('https://query.wikidata.org/sparql', {
        name: 'Modified',
      });

      // Reset
      endpointCatalogue.reset();

      expect(currentCatalogue).toHaveLength(4);
      expect(currentCatalogue.find((e) => e.name === 'DBpedia')).toBeDefined();
      expect(currentCatalogue.find((e) => e.name === 'Wikidata')).toBeDefined();
      expect(currentCatalogue.find((e) => e.name === 'Test')).toBeUndefined();
      unsubscribe();
    });
  });
});

describe('Default Endpoint Store', () => {
  let currentEndpoint: string = '';

  beforeEach(() => {
    // Reset before each test
    defaultEndpoint.set('');
    currentEndpoint = '';
  });

  describe('Initialization', () => {
    it('should initialize with empty string', () => {
      const unsubscribe = defaultEndpoint.subscribe((endpoint) => {
        currentEndpoint = endpoint;
      });

      expect(currentEndpoint).toBe('');
      unsubscribe();
    });
  });

  describe('Set endpoint', () => {
    it('should set endpoint URL', () => {
      const unsubscribe = defaultEndpoint.subscribe((endpoint) => {
        currentEndpoint = endpoint;
      });

      defaultEndpoint.set('https://dbpedia.org/sparql');

      expect(currentEndpoint).toBe('https://dbpedia.org/sparql');
      unsubscribe();
    });

    it('should update endpoint URL', () => {
      const unsubscribe = defaultEndpoint.subscribe((endpoint) => {
        currentEndpoint = endpoint;
      });

      defaultEndpoint.set('https://dbpedia.org/sparql');
      defaultEndpoint.set('https://query.wikidata.org/sparql');

      expect(currentEndpoint).toBe('https://query.wikidata.org/sparql');
      unsubscribe();
    });

    it('should accept empty string', () => {
      const unsubscribe = defaultEndpoint.subscribe((endpoint) => {
        currentEndpoint = endpoint;
      });

      defaultEndpoint.set('https://dbpedia.org/sparql');
      defaultEndpoint.set('');

      expect(currentEndpoint).toBe('');
      unsubscribe();
    });
  });

  describe('Update endpoint', () => {
    it('should update via update function', () => {
      const unsubscribe = defaultEndpoint.subscribe((endpoint) => {
        currentEndpoint = endpoint;
      });

      defaultEndpoint.update(() => 'https://example.org/sparql');

      expect(currentEndpoint).toBe('https://example.org/sparql');
      unsubscribe();
    });

    it('should update based on current value', () => {
      const unsubscribe = defaultEndpoint.subscribe((endpoint) => {
        currentEndpoint = endpoint;
      });

      defaultEndpoint.set('https://dbpedia.org');
      defaultEndpoint.update((current) => current + '/sparql');

      expect(currentEndpoint).toBe('https://dbpedia.org/sparql');
      unsubscribe();
    });
  });
});
