/**
 * Tests for localization (i18n) infrastructure
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  currentLocale,
  t,
  setLocale,
  addTranslations,
  getTranslations,
  hasTranslation,
  type Locale,
} from '../../../src/lib/localization';
import { translate, translateMany, formatTranslation } from '../../../src/lib/utils/i18n';

describe('Localization Store', () => {
  beforeEach(() => {
    // Reset to default locale before each test
    setLocale('en');
  });

  describe('currentLocale', () => {
    it('should have default locale of "en"', () => {
      expect(get(currentLocale)).toBe('en');
    });

    it('should allow setting locale', () => {
      setLocale('en');
      expect(get(currentLocale)).toBe('en');
    });
  });

  describe('Translation function (t)', () => {
    it('should translate known keys', () => {
      const translator = get(t);
      expect(translator('toolbar.run')).toBe('Run Query');
      expect(translator('editor.placeholder')).toBe('Enter your SPARQL query here...');
      expect(translator('results.loading')).toBe('Executing query...');
    });

    it('should return key if translation not found', () => {
      const translator = get(t);
      expect(translator('unknown.key')).toBe('unknown.key');
    });

    it('should support placeholder replacement', () => {
      const translator = get(t);
      const result = translator('a11y.sortColumn', { column: 'Name' });
      expect(result).toBe('Sort by Name');
    });

    it('should support multiple placeholder replacements', () => {
      const translator = get(t);
      const result = translator('warning.limitReached', { limit: '1000' });
      expect(result).toBe('Result limit of 1000 rows reached');
    });

    it('should handle numeric placeholders', () => {
      const translator = get(t);
      const result = translator('results.rowCount', { count: 42 });
      expect(result).toBe('42 rows');
    });

    it('should handle missing placeholders gracefully', () => {
      const translator = get(t);
      const result = translator('a11y.sortColumn'); // No replacement provided
      expect(result).toBe('Sort by {column}');
    });
  });

  describe('addTranslations', () => {
    it('should add new translations to existing locale', () => {
      addTranslations('en', {
        'custom.test': 'Test Translation',
        'custom.hello': 'Hello {name}',
      });

      const translator = get(t);
      expect(translator('custom.test')).toBe('Test Translation');
      expect(translator('custom.hello', { name: 'World' })).toBe('Hello World');
    });

    it('should not affect other existing translations', () => {
      addTranslations('en', {
        'custom.new': 'New Translation',
      });

      const translator = get(t);
      expect(translator('editor.placeholder')).toBe('Enter your SPARQL query here...');
      expect(translator('custom.new')).toBe('New Translation');
    });
  });

  describe('getTranslations', () => {
    it('should return all translations for a locale', () => {
      const translations = getTranslations('en');
      expect(translations).toHaveProperty('toolbar.run');
      expect(translations).toHaveProperty('editor.placeholder');
      expect(translations['toolbar.run']).toBe('Run Query');
    });

    it('should return a copy of translations', () => {
      const translations1 = getTranslations('en');
      const translations2 = getTranslations('en');
      expect(translations1).not.toBe(translations2); // Different objects
      expect(translations1).toEqual(translations2); // Same content
    });
  });

  describe('hasTranslation', () => {
    it('should return true for existing keys', () => {
      expect(hasTranslation('toolbar.run')).toBe(true);
      expect(hasTranslation('editor.placeholder')).toBe(true);
    });

    it('should return false for non-existing keys', () => {
      expect(hasTranslation('unknown.key')).toBe(false);
      expect(hasTranslation('missing.translation')).toBe(false);
    });

    it('should check against specified locale', () => {
      expect(hasTranslation('toolbar.run', 'en')).toBe(true);
    });
  });
});

describe('Non-reactive i18n utilities', () => {
  beforeEach(() => {
    setLocale('en');
  });

  describe('translate', () => {
    it('should translate keys in non-reactive context', () => {
      expect(translate('toolbar.run')).toBe('Run Query');
      expect(translate('error.network')).toBe('Network error occurred');
    });

    it('should support placeholder replacement', () => {
      const result = translate('a11y.sortColumn', { column: 'Date' });
      expect(result).toBe('Sort by Date');
    });

    it('should handle numeric values', () => {
      const result = translate('results.columnCount', { count: 5 });
      expect(result).toBe('5 columns');
    });

    it('should return key for missing translations', () => {
      expect(translate('missing.key')).toBe('missing.key');
    });
  });

  describe('translateMany', () => {
    it('should translate multiple keys', () => {
      const translations = translateMany(['toolbar.run', 'toolbar.save', 'toolbar.download']);

      expect(translations).toEqual({
        'toolbar.run': 'Run Query',
        'toolbar.save': 'Save',
        'toolbar.download': 'Download',
      });
    });

    it('should handle empty array', () => {
      const translations = translateMany([]);
      expect(translations).toEqual({});
    });

    it('should include keys even if translations missing', () => {
      const translations = translateMany(['toolbar.run', 'missing.key']);
      expect(translations['toolbar.run']).toBe('Run Query');
      expect(translations['missing.key']).toBe('missing.key');
    });
  });

  describe('formatTranslation', () => {
    it('should replace numbered placeholders', () => {
      // First add a translation with numbered placeholders
      addTranslations('en', {
        'test.numbered': 'Found {0} results in {1} ms',
      });

      const result = formatTranslation('test.numbered', [42, 150]);
      expect(result).toBe('Found 42 results in 150 ms');
    });

    it('should handle single placeholder', () => {
      addTranslations('en', {
        'test.single': 'Value: {0}',
      });

      const result = formatTranslation('test.single', ['test']);
      expect(result).toBe('Value: test');
    });

    it('should handle numeric values', () => {
      addTranslations('en', {
        'test.numbers': '{0} + {1} = {2}',
      });

      const result = formatTranslation('test.numbers', [1, 2, 3]);
      expect(result).toBe('1 + 2 = 3');
    });

    it('should handle empty array', () => {
      addTranslations('en', {
        'test.empty': 'No placeholders',
      });

      const result = formatTranslation('test.empty', []);
      expect(result).toBe('No placeholders');
    });
  });
});

describe('Translation coverage', () => {
  it('should have all required toolbar translations', () => {
    expect(hasTranslation('toolbar.run')).toBe(true);
    expect(hasTranslation('toolbar.endpoint')).toBe(true);
    expect(hasTranslation('toolbar.download')).toBe(true);
  });

  it('should have all required editor translations', () => {
    expect(hasTranslation('editor.placeholder')).toBe(true);
    expect(hasTranslation('editor.queryTemplate')).toBe(true);
  });

  it('should have all required results translations', () => {
    expect(hasTranslation('results.table')).toBe(true);
    expect(hasTranslation('results.raw')).toBe(true);
    expect(hasTranslation('results.noResults')).toBe(true);
    expect(hasTranslation('results.loading')).toBe(true);
  });

  it('should have all required error translations', () => {
    expect(hasTranslation('error.network')).toBe(true);
    expect(hasTranslation('error.timeout')).toBe(true);
    expect(hasTranslation('error.parse')).toBe(true);
    expect(hasTranslation('error.sparql')).toBe(true);
  });

  it('should have all required a11y translations', () => {
    expect(hasTranslation('a11y.runQuery')).toBe(true);
    expect(hasTranslation('a11y.editor')).toBe(true);
    expect(hasTranslation('a11y.results')).toBe(true);
    expect(hasTranslation('a11y.sortColumn')).toBe(true);
  });

  it('should have all required format translations', () => {
    expect(hasTranslation('format.json')).toBe(true);
    expect(hasTranslation('format.csv')).toBe(true);
    expect(hasTranslation('format.xml')).toBe(true);
    expect(hasTranslation('format.turtle')).toBe(true);
  });
});
