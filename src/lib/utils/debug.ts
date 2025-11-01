/**
 * Debug utility for conditional logging
 * Only logs when DEBUG environment variable is set or in development mode
 */

/**
 * Check if debug mode is enabled
 * - In tests: Check import.meta.env.VITEST_DEBUG or process.env.DEBUG
 * - In browser: Check localStorage.getItem('DEBUG')
 * - In dev: import.meta.env.DEV
 */
function isDebugEnabled(): boolean {
  // Check Vitest environment
  if (typeof import.meta.env !== 'undefined' && import.meta.env.VITEST) {
    return import.meta.env.VITEST_DEBUG === 'true' || import.meta.env.DEBUG === 'true';
  }

  // Check browser environment
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem('DEBUG') === 'true';
    } catch {
      // localStorage might not be available
      return false;
    }
  }

  // Check Node.js environment
  if (typeof process !== 'undefined' && process.env?.DEBUG === 'true') {
    return true;
  }

  // Default to false in production
  return false;
}

/**
 * Debug logger that only logs when debug mode is enabled
 */
export const debug = {
  log: (...args: unknown[]): void => {
    if (isDebugEnabled()) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDebugEnabled()) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]): void => {
    // Always log errors
    console.error(...args);
  },

  info: (...args: unknown[]): void => {
    if (isDebugEnabled()) {
      console.info(...args);
    }
  },

  /**
   * Enable debug mode (browser only)
   */
  enable: (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('DEBUG', 'true');
      console.log('Debug mode enabled. Reload the page to see debug logs.');
    }
  },

  /**
   * Disable debug mode (browser only)
   */
  disable: (): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('DEBUG');
      console.log('Debug mode disabled. Reload the page.');
    }
  },

  /**
   * Check if debug mode is currently enabled
   */
  isEnabled: isDebugEnabled,
};
