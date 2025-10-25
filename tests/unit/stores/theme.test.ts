import { describe, it, expect, beforeEach } from 'vitest';
import { themeStore, CARBON_THEMES } from '../../../src/lib/stores/theme';
import type { ThemeState } from '../../../src/lib/stores/theme';

describe('Theme Store', () => {
  let currentState: ThemeState | null = null;

  beforeEach(() => {
    // Reset the store before each test
    themeStore.reset();
    currentState = null;

    // Clear body classes
    if (typeof document !== 'undefined') {
      document.body.classList.remove('white', 'g10', 'g90', 'g100');
    }
  });

  describe('CARBON_THEMES constant', () => {
    it('should export all four Carbon themes', () => {
      expect(CARBON_THEMES).toHaveProperty('white');
      expect(CARBON_THEMES).toHaveProperty('g10');
      expect(CARBON_THEMES).toHaveProperty('g90');
      expect(CARBON_THEMES).toHaveProperty('g100');
    });

    it('should have name and description for each theme', () => {
      Object.values(CARBON_THEMES).forEach((theme) => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(typeof theme.name).toBe('string');
        expect(typeof theme.description).toBe('string');
      });
    });
  });

  describe('themeStore initialization', () => {
    it('should initialize with white theme', () => {
      const unsubscribe = themeStore.subscribe((state) => {
        currentState = state;
      });

      expect(currentState).not.toBeNull();
      expect(currentState?.current).toBe('white');
      expect(currentState?.previous).toBeNull();

      unsubscribe();
    });
  });

  describe('setTheme', () => {
    it('should update the current theme', () => {
      const unsubscribe = themeStore.subscribe((state) => {
        currentState = state;
      });

      themeStore.setTheme('g90');

      expect(currentState?.current).toBe('g90');
      unsubscribe();
    });

    it('should store previous theme when changing theme', () => {
      const unsubscribe = themeStore.subscribe((state) => {
        currentState = state;
      });

      // First change
      themeStore.setTheme('g90');
      expect(currentState?.previous).toBe('white');
      expect(currentState?.current).toBe('g90');

      // Second change
      themeStore.setTheme('g100');
      expect(currentState?.previous).toBe('g90');
      expect(currentState?.current).toBe('g100');

      unsubscribe();
    });

    it('should apply theme class to document body', () => {
      themeStore.setTheme('g10');
      expect(document.body.classList.contains('g10')).toBe(true);
    });

    it('should remove previous theme class when changing theme', () => {
      themeStore.setTheme('white');
      expect(document.body.classList.contains('white')).toBe(true);

      themeStore.setTheme('g90');
      expect(document.body.classList.contains('white')).toBe(false);
      expect(document.body.classList.contains('g90')).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to white theme', () => {
      const unsubscribe = themeStore.subscribe((state) => {
        currentState = state;
      });

      themeStore.setTheme('g90');
      expect(currentState?.current).toBe('g90');

      themeStore.reset();
      expect(currentState?.current).toBe('white');
      expect(currentState?.previous).toBeNull();

      unsubscribe();
    });

    it('should reset body class to white', () => {
      themeStore.setTheme('g100');
      expect(document.body.classList.contains('g100')).toBe(true);

      themeStore.reset();
      expect(document.body.classList.contains('g100')).toBe(false);
      expect(document.body.classList.contains('white')).toBe(true);
    });
  });
});
