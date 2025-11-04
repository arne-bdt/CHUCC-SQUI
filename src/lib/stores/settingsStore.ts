/**
 * Settings Store
 * Manages application settings and user preferences
 */

import { writable } from 'svelte/store';

/**
 * Validation settings
 */
export interface ValidationSettings {
  /** Enable/disable capability validation */
  enableCapabilityValidation: boolean;
  /** Warn on unsupported SPARQL version features */
  warnOnUnsupportedFeatures: boolean;
  /** Warn on unknown extension functions */
  warnOnUnknownFunctions: boolean;
  /** Warn on unknown graph IRIs */
  warnOnUnknownGraphs: boolean;
}

/**
 * Application settings
 */
export interface Settings {
  /** Query validation settings */
  validation: ValidationSettings;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: Settings = {
  validation: {
    enableCapabilityValidation: true,
    warnOnUnsupportedFeatures: true,
    warnOnUnknownFunctions: false, // May be too noisy
    warnOnUnknownGraphs: false, // May be too noisy
  },
};

/**
 * Settings store key for localStorage
 */
const STORAGE_KEY = 'squi-settings';

/**
 * Load settings from localStorage
 */
function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new settings
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        validation: {
          ...DEFAULT_SETTINGS.validation,
          ...parsed.validation,
        },
      };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}

/**
 * Create settings store
 */
export function createSettingsStore() {
  const initialSettings = loadSettings();
  const { subscribe, set, update } = writable<Settings>(initialSettings);

  return {
    subscribe,

    /**
     * Update validation settings
     */
    updateValidation(validation: Partial<ValidationSettings>): void {
      update((state) => {
        const newState = {
          ...state,
          validation: {
            ...state.validation,
            ...validation,
          },
        };
        saveSettings(newState);
        return newState;
      });
    },

    /**
     * Get validation settings
     */
    getValidationSettings(): ValidationSettings {
      let validation: ValidationSettings = DEFAULT_SETTINGS.validation;
      update((state) => {
        validation = state.validation;
        return state;
      });
      return validation;
    },

    /**
     * Reset all settings to defaults
     */
    reset(): void {
      set(DEFAULT_SETTINGS);
      saveSettings(DEFAULT_SETTINGS);
    },

    /**
     * Update all settings
     */
    updateSettings(settings: Partial<Settings>): void {
      update((state) => {
        const newState = {
          ...state,
          ...settings,
        };
        saveSettings(newState);
        return newState;
      });
    },
  };
}

/**
 * Singleton settings store instance
 */
export const settingsStore = createSettingsStore();
