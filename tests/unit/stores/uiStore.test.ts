import { describe, it, expect, beforeEach } from 'vitest';
import { uiStore } from '../../../src/lib/stores/uiStore';
import type { UIState } from '../../../src/lib/stores/uiStore';

describe('UI Store', () => {
  let currentState: UIState | null = null;

  beforeEach(() => {
    // Reset the store before each test
    uiStore.reset();
    currentState = null;
  });

  describe('Initialization', () => {
    it('should initialize with default UI state', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      expect(currentState).not.toBeNull();
      expect(currentState?.activeTab).toBe('tab-1');
      expect(currentState?.simpleView).toBe(true);
      expect(currentState?.filtersEnabled).toBe(false);
      expect(currentState?.splitterPosition).toBe(50);

      unsubscribe();
    });
  });

  describe('setActiveTab', () => {
    it('should set active tab', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setActiveTab('tab-2');

      expect(currentState?.activeTab).toBe('tab-2');
      unsubscribe();
    });

    it('should allow switching between tabs', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setActiveTab('tab-2');
      expect(currentState?.activeTab).toBe('tab-2');

      uiStore.setActiveTab('tab-3');
      expect(currentState?.activeTab).toBe('tab-3');

      unsubscribe();
    });
  });

  describe('Simple View', () => {
    it('should toggle simple view', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      // Initially true
      expect(currentState?.simpleView).toBe(true);

      uiStore.toggleSimpleView();
      expect(currentState?.simpleView).toBe(false);

      uiStore.toggleSimpleView();
      expect(currentState?.simpleView).toBe(true);

      unsubscribe();
    });

    it('should set simple view explicitly', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setSimpleView(false);
      expect(currentState?.simpleView).toBe(false);

      uiStore.setSimpleView(true);
      expect(currentState?.simpleView).toBe(true);

      unsubscribe();
    });
  });

  describe('Filters', () => {
    it('should toggle filters', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      // Initially false
      expect(currentState?.filtersEnabled).toBe(false);

      uiStore.toggleFilters();
      expect(currentState?.filtersEnabled).toBe(true);

      uiStore.toggleFilters();
      expect(currentState?.filtersEnabled).toBe(false);

      unsubscribe();
    });

    it('should set filters explicitly', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setFilters(true);
      expect(currentState?.filtersEnabled).toBe(true);

      uiStore.setFilters(false);
      expect(currentState?.filtersEnabled).toBe(false);

      unsubscribe();
    });
  });

  describe('Splitter Position', () => {
    it('should set splitter position', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setSplitterPosition(60);

      expect(currentState?.splitterPosition).toBe(60);
      unsubscribe();
    });

    it('should clamp position to minimum (0)', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setSplitterPosition(-10);

      expect(currentState?.splitterPosition).toBe(0);
      unsubscribe();
    });

    it('should clamp position to maximum (100)', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setSplitterPosition(150);

      expect(currentState?.splitterPosition).toBe(100);
      unsubscribe();
    });

    it('should accept boundary values', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setSplitterPosition(0);
      expect(currentState?.splitterPosition).toBe(0);

      uiStore.setSplitterPosition(100);
      expect(currentState?.splitterPosition).toBe(100);

      unsubscribe();
    });
  });

  describe('setState', () => {
    it('should update partial state', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setState({
        activeTab: 'tab-5',
        filtersEnabled: true,
      });

      expect(currentState?.activeTab).toBe('tab-5');
      expect(currentState?.filtersEnabled).toBe(true);
      unsubscribe();
    });

    it('should preserve unspecified properties', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setSplitterPosition(70);
      uiStore.setState({
        activeTab: 'tab-2',
      });

      expect(currentState?.splitterPosition).toBe(70);
      expect(currentState?.activeTab).toBe('tab-2');
      unsubscribe();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const unsubscribe = uiStore.subscribe((state) => {
        currentState = state;
      });

      uiStore.setActiveTab('tab-10');
      uiStore.setSimpleView(false);
      uiStore.setFilters(true);
      uiStore.setSplitterPosition(75);

      uiStore.reset();

      expect(currentState?.activeTab).toBe('tab-1');
      expect(currentState?.simpleView).toBe(true);
      expect(currentState?.filtersEnabled).toBe(false);
      expect(currentState?.splitterPosition).toBe(50);
      unsubscribe();
    });
  });
});
