/**
 * i18n utilities for non-reactive contexts
 * Use these functions in services, utilities, and other non-Svelte contexts
 */

import { get } from 'svelte/store';
import { t } from '../localization';

/**
 * Translate a key in a non-reactive context
 * Use this in services, utilities, and places where you cannot use the reactive $t store
 *
 * @param key - Translation key
 * @param replacements - Optional placeholder replacements
 * @returns Translated string
 *
 * @example
 * ```typescript
 * import { translate } from '$lib/utils/i18n';
 *
 * // Simple translation
 * const message = translate('error.network');
 *
 * // With placeholders
 * const warning = translate('warning.limitReached', { limit: 1000 });
 * ```
 */
export function translate(key: string, replacements?: Record<string, string | number>): string {
  const translator = get(t);
  return translator(key, replacements);
}

/**
 * Get multiple translations at once
 *
 * @param keys - Array of translation keys
 * @returns Object mapping keys to translated values
 *
 * @example
 * ```typescript
 * const labels = translateMany(['toolbar.run', 'toolbar.save', 'toolbar.download']);
 * // { 'toolbar.run': 'Run Query', 'toolbar.save': 'Save', ... }
 * ```
 */
export function translateMany(keys: string[]): Record<string, string> {
  const translator = get(t);
  return keys.reduce(
    (acc, key) => {
      acc[key] = translator(key);
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Format a translation with numbered placeholders
 * Useful for templates with multiple similar replacements
 *
 * @param key - Translation key
 * @param values - Array of values to replace {0}, {1}, {2}, etc.
 * @returns Translated string with replacements
 *
 * @example
 * ```typescript
 * // Translation: 'Found {0} results in {1} ms'
 * formatTranslation('search.results', [42, 150]);
 * // Returns: 'Found 42 results in 150 ms'
 * ```
 */
export function formatTranslation(key: string, values: (string | number)[]): string {
  const translator = get(t);
  let text = translator(key);

  values.forEach((value, index) => {
    text = text.replace(`{${index}}`, String(value));
  });

  return text;
}
