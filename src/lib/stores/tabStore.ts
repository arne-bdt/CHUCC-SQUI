import { writable, get } from 'svelte/store';
import type { Tab, TabsState, QueryState, ResultsState } from '../types';

/**
 * Generate a unique tab ID
 */
function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial query state for a new tab
 */
function createInitialQueryState(endpoint: string = ''): QueryState {
  return {
    text: '',
    endpoint,
    type: undefined,
    prefixes: {},
  };
}

/**
 * Create initial results state for a new tab
 */
function createInitialResultsState(): ResultsState {
  return {
    data: null,
    format: 'json',
    view: 'table',
    loading: false,
    error: null,
    executionTime: undefined,
    prefixes: undefined,
  };
}

/**
 * Create a new tab with default values
 * @param name - Tab display name
 * @param endpoint - Optional endpoint URL to copy to the new tab
 */
function createNewTab(name: string, endpoint: string = ''): Tab {
  return {
    id: generateTabId(),
    name,
    query: createInitialQueryState(endpoint),
    results: createInitialResultsState(),
    lastModified: Date.now(),
  };
}

/**
 * Tab store for managing multiple query tabs
 * Provides isolated state for each tab (query, endpoint, results)
 */
export function createTabStore(): {
  subscribe: (_run: (_value: TabsState) => void) => () => void;
  addTab: (_endpoint?: string) => string;
  removeTab: (_tabId: string) => void;
  switchTab: (_tabId: string) => void;
  renameTab: (_tabId: string, _name: string) => void;
  updateTabQuery: (_tabId: string, _query: Partial<QueryState>) => void;
  updateTabResults: (_tabId: string, _results: Partial<ResultsState>) => void;
  getActiveTab: () => Tab | null;
  getTab: (_tabId: string) => Tab | null;
  reset: () => void;
  // Persistence methods
  loadFromStorage: () => void;
  saveToStorage: () => void;
  clearStorage: () => void;
} {
  const STORAGE_KEY = 'squi-tabs';
  const STORAGE_EXPIRY_DAYS = 30;

  // Create initial state with one tab
  const initialState: TabsState = {
    tabs: [createNewTab('Query 1')],
    activeTabId: null,
  };
  initialState.activeTabId = initialState.tabs[0].id;

  const { subscribe, set, update } = writable<TabsState>(initialState);

  /**
   * Get the current state value
   */
  function getState(): TabsState {
    return get({ subscribe });
  }

  /**
   * Save tabs to localStorage
   */
  function saveToStorage(): void {
    try {
      const state = getState();
      const storageData = {
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save tabs to localStorage:', error);
    }
  }

  /**
   * Load tabs from localStorage
   */
  function loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const storageData = JSON.parse(stored);
      const savedAt = storageData.savedAt || 0;
      const expiryTime = STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      // Check if data has expired
      if (Date.now() - savedAt > expiryTime) {
        console.log('Stored tabs have expired, clearing storage');
        clearStorage();
        return;
      }

      // Restore tabs from storage
      const tabs = storageData.tabs || [];
      const activeTabId = storageData.activeTabId || null;

      if (tabs.length > 0) {
        set({
          tabs,
          activeTabId: activeTabId || tabs[0].id,
        });
      }
    } catch (error) {
      console.error('Failed to load tabs from localStorage:', error);
    }
  }

  /**
   * Clear tabs from localStorage
   */
  function clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear tabs from localStorage:', error);
    }
  }

  return {
    subscribe,

    /**
     * Add a new tab
     * @param endpoint - Optional endpoint URL to copy to the new tab (default: copy from active tab)
     * @returns The ID of the newly created tab
     */
    addTab: (endpoint?: string): string => {
      let newTabId: string = '';
      update((state) => {
        // Determine endpoint for new tab
        let tabEndpoint = endpoint;
        if (!tabEndpoint && state.activeTabId) {
          const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
          tabEndpoint = activeTab?.query.endpoint || '';
        }

        // Create new tab
        const newTab = createNewTab(`Query ${state.tabs.length + 1}`, tabEndpoint || '');
        newTabId = newTab.id;

        return {
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id, // Auto-switch to new tab
        };
      });

      saveToStorage();
      return newTabId;
    },

    /**
     * Remove a tab
     * If removing the active tab, switches to an adjacent tab
     * @param tabId - ID of the tab to remove
     */
    removeTab: (tabId: string): void => {
      update((state) => {
        const newTabs = state.tabs.filter((t) => t.id !== tabId);

        // Don't allow removing the last tab
        if (newTabs.length === 0) {
          console.warn('Cannot remove the last tab');
          return state;
        }

        let newActiveId = state.activeTabId;

        // If removing the active tab, switch to another tab
        if (state.activeTabId === tabId) {
          const removedIndex = state.tabs.findIndex((t) => t.id === tabId);
          // Switch to the tab before the removed one, or the first tab if removing the first tab
          const newIndex = Math.max(0, removedIndex - 1);
          newActiveId = newTabs[newIndex].id;
        }

        return {
          tabs: newTabs,
          activeTabId: newActiveId,
        };
      });

      saveToStorage();
    },

    /**
     * Switch to a different tab
     * @param tabId - ID of the tab to switch to
     */
    switchTab: (tabId: string): void => {
      update((state) => {
        const tabExists = state.tabs.some((t) => t.id === tabId);
        if (!tabExists) {
          console.warn(`Tab ${tabId} does not exist`);
          return state;
        }

        return {
          ...state,
          activeTabId: tabId,
        };
      });

      saveToStorage();
    },

    /**
     * Rename a tab
     * @param tabId - ID of the tab to rename
     * @param name - New name for the tab
     */
    renameTab: (tabId: string, name: string): void => {
      update((state) => ({
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId ? { ...tab, name, lastModified: Date.now() } : tab
        ),
      }));

      saveToStorage();
    },

    /**
     * Update query state for a specific tab
     * @param tabId - ID of the tab to update
     * @param query - Partial query state to merge with existing state
     */
    updateTabQuery: (tabId: string, query: Partial<QueryState>): void => {
      update((state) => ({
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                query: { ...tab.query, ...query },
                lastModified: Date.now(),
              }
            : tab
        ),
      }));

      saveToStorage();
    },

    /**
     * Update results state for a specific tab
     * @param tabId - ID of the tab to update
     * @param results - Partial results state to merge with existing state
     */
    updateTabResults: (tabId: string, results: Partial<ResultsState>): void => {
      update((state) => ({
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                results: { ...tab.results, ...results },
                lastModified: Date.now(),
              }
            : tab
        ),
      }));

      saveToStorage();
    },

    /**
     * Get the currently active tab
     * @returns The active tab or null if no tab is active
     */
    getActiveTab: (): Tab | null => {
      const state = getState();
      if (!state.activeTabId) {
        return null;
      }
      return state.tabs.find((t) => t.id === state.activeTabId) || null;
    },

    /**
     * Get a specific tab by ID
     * @param tabId - ID of the tab to retrieve
     * @returns The tab or null if not found
     */
    getTab: (tabId: string): Tab | null => {
      const state = getState();
      return state.tabs.find((t) => t.id === tabId) || null;
    },

    /**
     * Reset store to initial state (one empty tab)
     */
    reset: (): void => {
      const newState: TabsState = {
        tabs: [createNewTab('Query 1')],
        activeTabId: null,
      };
      newState.activeTabId = newState.tabs[0].id;
      set(newState);
      saveToStorage();
    },

    // Persistence methods
    loadFromStorage,
    saveToStorage,
    clearStorage,
  };
}

/**
 * Global tab store instance
 */
export const tabStore = createTabStore();
