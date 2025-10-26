import { describe, it, expect, beforeEach } from 'vitest';
import { resultsStore } from '../../../src/lib/stores/resultsStore';
import type { ResultsState, SparqlJsonResults } from '../../../src/lib/types';

describe('Results Store', () => {
  let currentState: ResultsState | null = null;

  beforeEach(() => {
    // Reset the store before each test
    resultsStore.reset();
    currentState = null;
  });

  describe('Initialization', () => {
    it('should initialize with empty results state', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      expect(currentState).not.toBeNull();
      expect(currentState?.data).toBeNull();
      expect(currentState?.format).toBe('json');
      expect(currentState?.view).toBe('table');
      expect(currentState?.loading).toBe(false);
      expect(currentState?.error).toBeNull();

      unsubscribe();
    });
  });

  describe('setData', () => {
    it('should set results data', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      const mockData: SparqlJsonResults = {
        head: { vars: ['s', 'p', 'o'] },
        results: { bindings: [] },
      };

      resultsStore.setData(mockData);

      expect(currentState?.data).toEqual(mockData);
      unsubscribe();
    });

    it('should clear loading and error when setting data', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setLoading(true);
      resultsStore.setError('Some error');

      const mockData: SparqlJsonResults = {
        head: { vars: ['s'] },
        results: { bindings: [] },
      };

      resultsStore.setData(mockData);

      expect(currentState?.loading).toBe(false);
      expect(currentState?.error).toBeNull();
      unsubscribe();
    });

    it('should set execution time', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      const mockData: SparqlJsonResults = {
        head: { vars: [] },
      };

      resultsStore.setData(mockData, 123);

      expect(currentState?.executionTime).toBe(123);
      unsubscribe();
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setLoading(true);

      expect(currentState?.loading).toBe(true);
      unsubscribe();
    });

    it('should set loading state to false', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setLoading(true);
      resultsStore.setLoading(false);

      expect(currentState?.loading).toBe(false);
      unsubscribe();
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setError('Query timeout');

      expect(currentState?.error).toBe('Query timeout');
      unsubscribe();
    });

    it('should clear loading when setting error', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setLoading(true);
      resultsStore.setError('Query failed');

      expect(currentState?.loading).toBe(false);
      expect(currentState?.error).toBe('Query failed');
      unsubscribe();
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setError('Some error');
      resultsStore.clearError();

      expect(currentState?.error).toBeNull();
      unsubscribe();
    });
  });

  describe('setView', () => {
    it('should set view mode to table', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setView('table');

      expect(currentState?.view).toBe('table');
      unsubscribe();
    });

    it('should set view mode to raw', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setView('raw');

      expect(currentState?.view).toBe('raw');
      unsubscribe();
    });

    it('should set view mode to graph', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setView('graph');

      expect(currentState?.view).toBe('graph');
      unsubscribe();
    });
  });

  describe('setFormat', () => {
    it('should set result format', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setFormat('csv');

      expect(currentState?.format).toBe('csv');
      unsubscribe();
    });
  });

  describe('setExecutionTime', () => {
    it('should set execution time', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setExecutionTime(456);

      expect(currentState?.executionTime).toBe(456);
      unsubscribe();
    });
  });

  describe('setState', () => {
    it('should update partial state', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setState({
        view: 'raw',
        format: 'turtle',
      });

      expect(currentState?.view).toBe('raw');
      expect(currentState?.format).toBe('turtle');
      unsubscribe();
    });

    it('should preserve unspecified properties', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      resultsStore.setView('table');
      resultsStore.setState({
        format: 'xml',
      });

      expect(currentState?.view).toBe('table');
      expect(currentState?.format).toBe('xml');
      unsubscribe();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const unsubscribe = resultsStore.subscribe((state) => {
        currentState = state;
      });

      const mockData: SparqlJsonResults = {
        head: { vars: [] },
      };

      resultsStore.setData(mockData, 100);
      resultsStore.setView('raw');
      resultsStore.setFormat('csv');
      resultsStore.setError('Error');

      resultsStore.reset();

      expect(currentState?.data).toBeNull();
      expect(currentState?.format).toBe('json');
      expect(currentState?.view).toBe('table');
      expect(currentState?.loading).toBe(false);
      expect(currentState?.error).toBeNull();
      expect(currentState?.executionTime).toBeUndefined();
      unsubscribe();
    });
  });
});
