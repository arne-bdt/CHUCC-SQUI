import { writable } from 'svelte/store';
import type { CarbonTheme } from '../types/config';

/**
 * Theme store state
 */
export interface ThemeState {
  current: CarbonTheme;
  previous: CarbonTheme | null;
}

/**
 * Available Carbon themes with descriptions
 */
export const CARBON_THEMES: Record<CarbonTheme, { name: string; description: string }> = {
  white: {
    name: 'White',
    description: 'Light theme with white background',
  },
  g10: {
    name: 'Gray 10',
    description: 'Light theme with gray background',
  },
  g90: {
    name: 'Gray 90',
    description: 'Dark theme with dark gray background',
  },
  g100: {
    name: 'Gray 100',
    description: 'Dark theme with black background',
  },
};

/**
 * Creates a theme store for managing Carbon Design System themes
 */
function createThemeStore(): {
  subscribe: (_run: (_value: ThemeState) => void) => () => void;
  setTheme: (_theme: CarbonTheme) => void;
  reset: () => void;
} {
  const initialState: ThemeState = {
    current: 'white',
    previous: null,
  };

  const { subscribe, set, update } = writable<ThemeState>(initialState);

  return {
    subscribe,
    /**
     * Set the current theme
     * @param theme - The theme to set
     */
    setTheme: (theme: CarbonTheme): void => {
      update((state) => ({
        current: theme,
        previous: state.current,
      }));

      // Apply theme to document body
      if (typeof document !== 'undefined') {
        // Remove all theme classes
        document.body.classList.remove('white', 'g10', 'g90', 'g100');
        // Add new theme class
        document.body.classList.add(theme);
      }
    },
    /**
     * Reset theme to default (white)
     */
    reset: (): void => {
      set(initialState);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('white', 'g10', 'g90', 'g100');
        document.body.classList.add('white');
      }
    },
  };
}

/**
 * Global theme store instance
 */
export const themeStore = createThemeStore();
