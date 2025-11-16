/**
 * Application logger using loglevel
 *
 * Log levels (in order of severity):
 * - trace: Very detailed debugging (not commonly used)
 * - debug: Detailed debugging for development
 * - info: Informational messages
 * - warn: Warning messages (something unexpected but handled)
 * - error: Error messages (failures that need attention)
 * - silent: Disable all logging
 *
 * Usage:
 *   import { logger } from '$lib/utils/logger';
 *   logger.debug('Debug message');
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message', error);
 *
 * Runtime control (browser console):
 *   logger.setLevel('debug');  // Show debug and above
 *   logger.setLevel('warn');   // Show only warnings and errors
 *   logger.setLevel('silent'); // Disable all logs
 *   logger.getLevel();         // Get current level
 *
 * Environment-based defaults:
 * - Development: 'debug' (show all except trace)
 * - Production: 'warn' (show only warnings and errors)
 */

import log from 'loglevel';

// Configure default log level based on environment
const defaultLevel = import.meta.env.DEV ? 'debug' : 'warn';

// Initialize logger
log.setLevel(defaultLevel);

// Check localStorage for persisted log level (browser only)
if (typeof localStorage !== 'undefined') {
	try {
		const savedLevel = localStorage.getItem('logLevel');
		if (savedLevel) {
			log.setLevel(savedLevel as log.LogLevelDesc);
		}
	} catch {
		// localStorage might not be available (e.g., in tests)
	}
}

/**
 * Wrap setLevel to persist to localStorage
 */
const originalSetLevel = log.setLevel.bind(log);
log.setLevel = ((level: log.LogLevelDesc, persist = true) => {
	originalSetLevel(level, persist);

	// Persist to localStorage if in browser
	if (persist && typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem('logLevel', String(level));
		} catch {
			// Ignore localStorage errors
		}
	}

	return log;
}) as typeof log.setLevel;

/**
 * Global logger instance
 *
 * @example
 * import { logger } from '$lib/utils/logger';
 *
 * logger.debug('Query parsing started');
 * logger.info('Connected to endpoint');
 * logger.warn('Falling back to JSON format');
 * logger.error('Failed to execute query', error);
 */
export const logger = log;

/**
 * Performance logging helper (only logs in debug mode)
 *
 * @example
 * import { logPerformance } from '$lib/utils/logger';
 *
 * logPerformance('Query Performance', {
 *   'Total time': '245.32 ms',
 *   'Network': '123.45 ms',
 *   'Parse': '67.89 ms',
 *   'Results': '1,234 rows',
 * });
 */
export function logPerformance(label: string, metrics: Record<string, unknown>): void {
	if (log.getLevel() <= log.levels.DEBUG) {
		console.group(`🔬 ${label}`);
		Object.entries(metrics).forEach(([key, value]) => {
			console.log(`  ${key}:`, value);
		});
		console.groupEnd();
	}
}

/**
 * Expose logger to window for runtime control (development only)
 *
 * Usage in browser console:
 *   window.__logger.setLevel('debug')
 *   window.__logger.setLevel('warn')
 *   window.__logger.getLevel()
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
	(window as { __logger?: typeof log }).__logger = log;
}

/**
 * Log level constants for convenience
 */
export const LogLevel = {
	TRACE: 'trace' as const,
	DEBUG: 'debug' as const,
	INFO: 'info' as const,
	WARN: 'warn' as const,
	ERROR: 'error' as const,
	SILENT: 'silent' as const,
};
