import { describe, it, expect, beforeEach } from 'vitest';
import { queryStore } from '../../../src/lib/stores/queryStore';
import type { QueryState } from '../../../src/lib/types';

describe('Query Store', () => {
  let currentState: QueryState | null = null;

  beforeEach(() => {
    // Reset the store before each test
    queryStore.reset();
    currentState = null;
  });

  describe('Initialization', () => {
    it('should initialize with empty query state', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      expect(currentState).not.toBeNull();
      expect(currentState?.text).toBe('');
      expect(currentState?.endpoint).toBe('');
      expect(currentState?.prefixes).toEqual({});
      expect(currentState?.type).toBeUndefined();

      unsubscribe();
    });
  });

  describe('setText', () => {
    it('should update query text', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setText('SELECT * WHERE { ?s ?p ?o }');

      expect(currentState?.text).toBe('SELECT * WHERE { ?s ?p ?o }');
      unsubscribe();
    });
  });

  describe('setEndpoint', () => {
    it('should update endpoint URL', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setEndpoint('https://dbpedia.org/sparql');

      expect(currentState?.endpoint).toBe('https://dbpedia.org/sparql');
      unsubscribe();
    });
  });

  describe('Prefix Management', () => {
    it('should set all prefixes at once', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      const prefixes = {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      };

      queryStore.setPrefixes(prefixes);

      expect(currentState?.prefixes).toEqual(prefixes);
      unsubscribe();
    });

    it('should update a single prefix', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.updatePrefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');

      expect(currentState?.prefixes.rdf).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      unsubscribe();
    });

    it('should add new prefix without removing existing ones', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.updatePrefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      queryStore.updatePrefix('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');

      expect(currentState?.prefixes).toHaveProperty('rdf');
      expect(currentState?.prefixes).toHaveProperty('rdfs');
      unsubscribe();
    });

    it('should remove a prefix', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setPrefixes({
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      });

      queryStore.removePrefix('rdf');

      expect(currentState?.prefixes).not.toHaveProperty('rdf');
      expect(currentState?.prefixes).toHaveProperty('rdfs');
      unsubscribe();
    });
  });

  describe('setType', () => {
    it('should set query type', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setType('SELECT');

      expect(currentState?.type).toBe('SELECT');
      unsubscribe();
    });

    it('should handle undefined query type', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setType('SELECT');
      queryStore.setType(undefined);

      expect(currentState?.type).toBeUndefined();
      unsubscribe();
    });
  });

  describe('setState', () => {
    it('should update partial state', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setState({
        text: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://dbpedia.org/sparql',
      });

      expect(currentState?.text).toBe('SELECT * WHERE { ?s ?p ?o }');
      expect(currentState?.endpoint).toBe('https://dbpedia.org/sparql');
      unsubscribe();
    });

    it('should preserve unspecified properties', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setText('INITIAL QUERY');
      queryStore.setState({
        endpoint: 'https://dbpedia.org/sparql',
      });

      expect(currentState?.text).toBe('INITIAL QUERY');
      expect(currentState?.endpoint).toBe('https://dbpedia.org/sparql');
      unsubscribe();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const unsubscribe = queryStore.subscribe((state) => {
        currentState = state;
      });

      queryStore.setText('SELECT * WHERE { ?s ?p ?o }');
      queryStore.setEndpoint('https://dbpedia.org/sparql');
      queryStore.setPrefixes({ rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' });
      queryStore.setType('SELECT');

      queryStore.reset();

      expect(currentState?.text).toBe('');
      expect(currentState?.endpoint).toBe('');
      expect(currentState?.prefixes).toEqual({});
      expect(currentState?.type).toBeUndefined();
      unsubscribe();
    });
  });
});
