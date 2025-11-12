import { writable } from 'svelte/store';

/**
 * UI state interface
 * Manages UI-specific settings and preferences
 */
export interface UIState {
  /** Currently active tab ID */
  activeTab: string;
  /** Simple view mode (abbreviated IRIs vs full URIs) */
  simpleView: boolean;
  /** Whether result filters are enabled */
  filtersEnabled: boolean;
  /** Splitter position as percentage (0-100) */
  splitterPosition: number;
}

/**
 * UI store for managing user interface state
 * Tracks active tab, view preferences, and layout settings
 */
export function createUIStore(): {
  subscribe: (_run: (_value: UIState) => void) => () => void;
  setActiveTab: (_tabId: string) => void;
  toggleSimpleView: () => void;
  setSimpleView: (_simpleView: boolean) => void;
  toggleFilters: () => void;
  setFilters: (_enabled: boolean) => void;
  setSplitterPosition: (_position: number) => void;
  setState: (_newState: Partial<UIState>) => void;
  reset: () => void;
} {
  const initialState: UIState = {
    activeTab: 'tab-1',
    simpleView: true,
    filtersEnabled: false,
    splitterPosition: 50,
  };

  const { subscribe, set, update } = writable<UIState>(initialState);

  return {
    subscribe,

    /**
     * Set the active tab
     */
    setActiveTab: (tabId: string): void => {
      update((state) => ({ ...state, activeTab: tabId }));
    },

    /**
     * Toggle simple view mode (abbreviated IRIs)
     */
    toggleSimpleView: (): void => {
      update((state) => ({ ...state, simpleView: !state.simpleView }));
    },

    /**
     * Set simple view mode explicitly
     */
    setSimpleView: (simpleView: boolean): void => {
      update((state) => ({ ...state, simpleView }));
    },

    /**
     * Toggle result filters
     */
    toggleFilters: (): void => {
      update((state) => ({ ...state, filtersEnabled: !state.filtersEnabled }));
    },

    /**
     * Set filters enabled state explicitly
     */
    setFilters: (enabled: boolean): void => {
      update((state) => ({ ...state, filtersEnabled: enabled }));
    },

    /**
     * Set splitter position
     * @param position - Position as percentage (0-100)
     */
    setSplitterPosition: (position: number): void => {
      // Clamp position between 0 and 100
      const clampedPosition = Math.max(0, Math.min(100, position));
      update((state) => ({ ...state, splitterPosition: clampedPosition }));
    },

    /**
     * Update the entire UI state
     */
    setState: (newState: Partial<UIState>): void => {
      update((state) => ({ ...state, ...newState }));
    },

    /**
     * Reset store to initial state
     */
    reset: (): void => {
      set(initialState);
    },
  };
}

/**
 * UI store type
 */
export type UIStore = ReturnType<typeof createUIStore>;

/**
 * Global UI store instance
 */
export const uiStore = createUIStore();
