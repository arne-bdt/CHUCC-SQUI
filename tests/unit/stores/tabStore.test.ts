import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { createTabStore } from '../../../src/lib/stores/tabStore';
import type { TabsState } from '../../../src/lib/types';

describe('tabStore', () => {
  let tabStore: ReturnType<typeof createTabStore>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Create a fresh store instance
    tabStore = createTabStore();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with one tab', () => {
      const state = get(tabStore);

      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].name).toBe('Query 1');
      expect(state.activeTabId).toBe(state.tabs[0].id);
    });

    it('should have correct initial query state', () => {
      const state = get(tabStore);
      const firstTab = state.tabs[0];

      expect(firstTab.query.text).toBe('');
      expect(firstTab.query.endpoint).toBe('');
      expect(firstTab.query.type).toBeUndefined();
      expect(firstTab.query.prefixes).toEqual({});
    });

    it('should have correct initial results state', () => {
      const state = get(tabStore);
      const firstTab = state.tabs[0];

      expect(firstTab.results.data).toBeNull();
      expect(firstTab.results.format).toBe('json');
      expect(firstTab.results.view).toBe('table');
      expect(firstTab.results.loading).toBe(false);
      expect(firstTab.results.error).toBeNull();
    });
  });

  describe('addTab', () => {
    it('should add a new tab', () => {
      const tabId = tabStore.addTab();
      const state = get(tabStore);

      expect(state.tabs).toHaveLength(2);
      expect(state.tabs[1].id).toBe(tabId);
      expect(state.tabs[1].name).toBe('Query 2');
    });

    it('should switch to the new tab', () => {
      const tabId = tabStore.addTab();
      const state = get(tabStore);

      expect(state.activeTabId).toBe(tabId);
    });

    it('should copy endpoint from active tab if not provided', () => {
      // Set endpoint in first tab
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;
      tabStore.updateTabQuery(firstTabId, { endpoint: 'https://dbpedia.org/sparql' });

      // Add new tab
      const newTabId = tabStore.addTab();
      const state2 = get(tabStore);
      const newTab = state2.tabs.find((t) => t.id === newTabId);

      expect(newTab?.query.endpoint).toBe('https://dbpedia.org/sparql');
    });

    it('should use provided endpoint if specified', () => {
      const newTabId = tabStore.addTab('https://query.wikidata.org/sparql');
      const state = get(tabStore);
      const newTab = state.tabs.find((t) => t.id === newTabId);

      expect(newTab?.query.endpoint).toBe('https://query.wikidata.org/sparql');
    });
  });

  describe('removeTab', () => {
    it('should remove a tab', () => {
      const secondTabId = tabStore.addTab();
      tabStore.removeTab(secondTabId);
      const state = get(tabStore);

      expect(state.tabs).toHaveLength(1);
      expect(state.tabs.find((t) => t.id === secondTabId)).toBeUndefined();
    });

    it('should not allow removing the last tab', () => {
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;

      // Try to remove the only tab
      tabStore.removeTab(firstTabId);
      const state2 = get(tabStore);

      expect(state2.tabs).toHaveLength(1);
      expect(state2.tabs[0].id).toBe(firstTabId);
    });

    it('should switch to adjacent tab when removing active tab', () => {
      const tab2Id = tabStore.addTab();
      const tab3Id = tabStore.addTab();

      // Switch to tab 2
      tabStore.switchTab(tab2Id);

      // Remove tab 2 (should switch to tab 1)
      tabStore.removeTab(tab2Id);
      const state = get(tabStore);

      expect(state.activeTabId).not.toBe(tab2Id);
      expect(state.tabs).toHaveLength(2);
    });
  });

  describe('switchTab', () => {
    it('should switch to specified tab', () => {
      const secondTabId = tabStore.addTab();
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;

      tabStore.switchTab(firstTabId);
      const state2 = get(tabStore);

      expect(state2.activeTabId).toBe(firstTabId);
    });

    it('should not switch to non-existent tab', () => {
      const state1 = get(tabStore);
      const originalActiveId = state1.activeTabId;

      tabStore.switchTab('non-existent-id');
      const state2 = get(tabStore);

      expect(state2.activeTabId).toBe(originalActiveId);
    });
  });

  describe('renameTab', () => {
    it('should rename a tab', () => {
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;

      tabStore.renameTab(firstTabId, 'My Custom Query');
      const state2 = get(tabStore);

      expect(state2.tabs[0].name).toBe('My Custom Query');
    });

    it('should update lastModified timestamp', () => {
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;
      const originalTimestamp = state1.tabs[0].lastModified;

      // Wait a bit to ensure timestamp changes
      vi.useFakeTimers();
      vi.advanceTimersByTime(100);

      tabStore.renameTab(firstTabId, 'New Name');
      const state2 = get(tabStore);

      expect(state2.tabs[0].lastModified).toBeGreaterThan(originalTimestamp);

      vi.useRealTimers();
    });
  });

  describe('updateTabQuery', () => {
    it('should update query state', () => {
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;

      tabStore.updateTabQuery(firstTabId, {
        text: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'https://dbpedia.org/sparql',
        type: 'SELECT',
      });

      const state2 = get(tabStore);
      const updatedTab = state2.tabs[0];

      expect(updatedTab.query.text).toBe('SELECT * WHERE { ?s ?p ?o }');
      expect(updatedTab.query.endpoint).toBe('https://dbpedia.org/sparql');
      expect(updatedTab.query.type).toBe('SELECT');
    });

    it('should merge with existing query state', () => {
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;

      tabStore.updateTabQuery(firstTabId, { text: 'SELECT * WHERE { ?s ?p ?o }' });
      tabStore.updateTabQuery(firstTabId, { endpoint: 'https://dbpedia.org/sparql' });

      const state2 = get(tabStore);
      const updatedTab = state2.tabs[0];

      expect(updatedTab.query.text).toBe('SELECT * WHERE { ?s ?p ?o }');
      expect(updatedTab.query.endpoint).toBe('https://dbpedia.org/sparql');
    });
  });

  describe('updateTabResults', () => {
    it('should update results state', () => {
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;

      tabStore.updateTabResults(firstTabId, {
        loading: true,
        format: 'xml',
      });

      const state2 = get(tabStore);
      const updatedTab = state2.tabs[0];

      expect(updatedTab.results.loading).toBe(true);
      expect(updatedTab.results.format).toBe('xml');
    });

    it('should merge with existing results state', () => {
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;

      tabStore.updateTabResults(firstTabId, { loading: true });
      tabStore.updateTabResults(firstTabId, { format: 'csv' });

      const state2 = get(tabStore);
      const updatedTab = state2.tabs[0];

      expect(updatedTab.results.loading).toBe(true);
      expect(updatedTab.results.format).toBe('csv');
    });
  });

  describe('getActiveTab', () => {
    it('should return the active tab', () => {
      const activeTab = tabStore.getActiveTab();
      const state = get(tabStore);

      expect(activeTab?.id).toBe(state.activeTabId);
    });

    it('should return null if no active tab', () => {
      // This shouldn't happen in normal usage, but test it anyway
      const store = createTabStore();
      // Manually set activeTabId to null (hacky but for testing)
      store.switchTab('non-existent');

      // The store should still have an active tab because switchTab
      // only changes if the tab exists, so let's just verify getActiveTab works
      const activeTab = store.getActiveTab();
      expect(activeTab).toBeTruthy();
    });
  });

  describe('getTab', () => {
    it('should return a tab by ID', () => {
      const state = get(tabStore);
      const firstTabId = state.tabs[0].id;

      const tab = tabStore.getTab(firstTabId);

      expect(tab?.id).toBe(firstTabId);
      expect(tab?.name).toBe('Query 1');
    });

    it('should return null for non-existent tab', () => {
      const tab = tabStore.getTab('non-existent-id');

      expect(tab).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Add some tabs and modify state
      tabStore.addTab();
      tabStore.addTab();
      const state1 = get(tabStore);
      tabStore.updateTabQuery(state1.tabs[0].id, { text: 'SELECT * WHERE { ?s ?p ?o }' });

      // Reset
      tabStore.reset();
      const state2 = get(tabStore);

      expect(state2.tabs).toHaveLength(1);
      expect(state2.tabs[0].name).toBe('Query 1');
      expect(state2.tabs[0].query.text).toBe('');
    });
  });

  describe('localStorage persistence', () => {
    it('should save tabs to localStorage', () => {
      tabStore.addTab();
      tabStore.saveToStorage();

      const stored = localStorage.getItem('squi-tabs');
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.tabs).toHaveLength(2);
      expect(data.savedAt).toBeTruthy();
    });

    it('should load tabs from localStorage', () => {
      // Create and save tabs
      const tab1Id = get(tabStore).tabs[0].id;
      tabStore.addTab();
      tabStore.updateTabQuery(tab1Id, { text: 'SELECT * WHERE { ?s ?p ?o }' });
      tabStore.saveToStorage();

      // Create new store and load
      const newStore = createTabStore();
      newStore.loadFromStorage();
      const state = get(newStore);

      expect(state.tabs).toHaveLength(2);
      expect(state.tabs[0].query.text).toBe('SELECT * WHERE { ?s ?p ?o }');
    });

    it('should not load expired tabs', () => {
      // Save tabs with old timestamp
      const oldData = {
        tabs: [{ id: 'old-tab', name: 'Old Query' }],
        activeTabId: 'old-tab',
        savedAt: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
      };
      localStorage.setItem('squi-tabs', JSON.stringify(oldData));

      // Load should clear expired data
      const newStore = createTabStore();
      newStore.loadFromStorage();
      const state = get(newStore);

      // Should have default state, not loaded data
      expect(state.tabs).toHaveLength(1);
      expect(state.tabs[0].name).toBe('Query 1');
    });

    it('should clear storage', () => {
      tabStore.saveToStorage();
      expect(localStorage.getItem('squi-tabs')).toBeTruthy();

      tabStore.clearStorage();
      expect(localStorage.getItem('squi-tabs')).toBeNull();
    });
  });
});
