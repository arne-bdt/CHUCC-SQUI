/**
 * Localization (i18n) infrastructure for SQUI
 * Provides reactive translation store and utilities for internationalization
 */

import { writable, derived } from 'svelte/store';
import { en } from './en';

/**
 * Supported locales
 * Expand this as more translations are added
 */
export type Locale = 'en';

/**
 * Translation dictionary type
 */
export type Translations = Record<string, string>;

/**
 * Translation dictionaries for each supported locale
 */
const translations: Record<Locale, Translations> = {
  en,
};

/**
 * Current locale store
 * Use this to track and change the current locale
 */
export const currentLocale = writable<Locale>('en');

/**
 * Translation function store (reactive)
 *
 * Use in Svelte components:
 * ```svelte
 * <script>
 *   import { t } from '$lib/localization';
 * </script>
 *
 * <button>{$t('toolbar.run')}</button>
 * <h2>{$t('a11y.sortColumn', { column: 'Name' })}</h2>
 * ```
 */
export const t = derived(currentLocale, ($locale) => {
  return (key: string, replacements?: Record<string, string | number>): string => {
    let text = translations[$locale]?.[key] || key;

    // Replace placeholders with values
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, String(value));
      });
    }

    return text;
  };
});

/**
 * Set the current locale
 *
 * @param locale - The locale code to switch to
 * @example
 * setLocale('en'); // Switch to English
 */
export function setLocale(locale: Locale): void {
  currentLocale.set(locale);
}

/**
 * Add or update translations for a specific locale
 * Useful for extending translations or adding custom labels
 *
 * @param locale - The locale to add translations for
 * @param newTranslations - Dictionary of translation keys and values
 * @example
 * addTranslations('en', {
 *   'custom.label': 'My Custom Label',
 *   'custom.message': 'Hello {name}!'
 * });
 */
export function addTranslations(locale: Locale, newTranslations: Translations): void {
  translations[locale] = { ...translations[locale], ...newTranslations };
  // Trigger reactivity by updating the locale store
  currentLocale.update((current) => current);
}

/**
 * Get all translations for a specific locale
 *
 * @param locale - The locale to get translations for
 * @returns Translation dictionary for the locale
 */
export function getTranslations(locale: Locale): Translations {
  return { ...translations[locale] };
}

/**
 * Check if a translation key exists
 *
 * @param key - The translation key to check
 * @param locale - The locale to check in (defaults to current)
 * @returns True if the key exists
 */
export function hasTranslation(key: string, locale?: Locale): boolean {
  const targetLocale = locale || 'en';
  return key in translations[targetLocale];
}

// Re-export translation keys type for convenience
export type { TranslationKey } from './en';
