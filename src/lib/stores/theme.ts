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
 * Detect user's color scheme preference
 * @returns 'dark' if user prefers dark mode, 'light' otherwise
 */
function detectColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get appropriate theme based on color scheme preference
 * @param scheme - 'light' or 'dark'
 * @returns Carbon theme name
 */
function getThemeForScheme(scheme: 'light' | 'dark'): CarbonTheme {
  return scheme === 'dark' ? 'g90' : 'white';
}

/**
 * Create a new theme store instance
 *
 * Factory function allows creating multiple independent store instances
 * for state isolation (Storybook, tabs, tests)
 *
 * @returns Theme store with methods for managing Carbon Design System themes
 */
export function createThemeStore(): {
  subscribe: (_run: (_value: ThemeState) => void) => () => void;
  setTheme: (_theme: CarbonTheme) => void;
  detectAndApplyPreference: () => void;
  reset: () => void;
} {
  // Start with user's preferred color scheme
  const preferredScheme = detectColorScheme();
  const initialTheme = getThemeForScheme(preferredScheme);

  const initialState: ThemeState = {
    current: initialTheme,
    previous: null,
  };

  const { subscribe, set, update } = writable<ThemeState>(initialState);

  // Apply initial theme to document body
  if (typeof document !== 'undefined') {
    document.body.classList.add(initialTheme);
  }

  // Listen for system color scheme changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newScheme = e.matches ? 'dark' : 'light';
      const newTheme = getThemeForScheme(newScheme);
      // Only auto-switch if user hasn't manually set a theme
      // (This could be enhanced with a flag to track manual vs auto theme)
      update((state) => {
        // If current theme matches the old preference, update to new preference
        const oldScheme = state.current === 'g90' || state.current === 'g100' ? 'dark' : 'light';
        if (oldScheme !== newScheme) {
          return {
            current: newTheme,
            previous: state.current,
          };
        }
        return state;
      });

      if (typeof document !== 'undefined') {
        document.body.classList.remove('white', 'g10', 'g90', 'g100');
        document.body.classList.add(newTheme);
      }
    };

    // Modern browsers
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleChange);
    } else {
      // Legacy browsers
      darkModeQuery.addListener(handleChange);
    }
  }

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
     * Detect and apply user's color scheme preference
     * Useful for manual preference detection after initial load
     */
    detectAndApplyPreference: (): void => {
      const scheme = detectColorScheme();
      const theme = getThemeForScheme(scheme);
      update((state) => ({
        current: theme,
        previous: state.current,
      }));

      if (typeof document !== 'undefined') {
        document.body.classList.remove('white', 'g10', 'g90', 'g100');
        document.body.classList.add(theme);
      }
    },
    /**
     * Reset theme to user's preferred color scheme
     */
    reset: (): void => {
      const scheme = detectColorScheme();
      const theme = getThemeForScheme(scheme);
      set({
        current: theme,
        previous: null,
      });
      if (typeof document !== 'undefined') {
        document.body.classList.remove('white', 'g10', 'g90', 'g100');
        document.body.classList.add(theme);
      }
    },
  };
}

/**
 * Theme store type
 */
export type ThemeStore = ReturnType<typeof createThemeStore>;

/**
 * Global theme store instance
 *
 * Use this for backward compatibility with existing code.
 * New code should use context-based stores via getThemeStore()
 */
export const themeStore = createThemeStore();
