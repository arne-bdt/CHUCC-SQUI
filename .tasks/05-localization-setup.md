# Task 05: Localization Infrastructure

**Phase:** Foundation
**Status:** TODO
**Dependencies:** 03, 04
**Estimated Effort:** 2-3 hours

## Objective

Set up localization (i18n) infrastructure to support multiple languages, starting with English as the default.

## Requirements

Per specification section 5.5:
- All UI text must be externalizable for translation
- No hard-coded English strings
- Support for locale switching
- Simple dictionary-based approach
- English as default, mechanism for adding other languages

## Implementation Steps

1. Create `src/lib/localization/en.ts`:
   ```typescript
   export const en = {
     // Toolbar
     'toolbar.run': 'Run Query',
     'toolbar.endpoint': 'Endpoint',
     'toolbar.download': 'Download',

     // Editor
     'editor.placeholder': 'Enter your SPARQL query here...',
     'editor.queryTemplate': 'Query Template',

     // Results
     'results.table': 'Table',
     'results.raw': 'Raw',
     'results.noResults': 'No results found',
     'results.loading': 'Executing query...',
     'results.simpleView': 'Simple View',
     'results.fullView': 'Full View',
     'results.toggleFilters': 'Toggle Filters',
     'results.downloadAs': 'Download as...',

     // Tabs
     'tabs.new': 'New Query',
     'tabs.close': 'Close Tab',
     'tabs.untitled': 'Query',

     // Endpoint
     'endpoint.validation.required': 'Endpoint URL is required',
     'endpoint.validation.invalid': 'Invalid endpoint URL',
     'endpoint.error.unreachable': 'Failed to reach endpoint',
     'endpoint.error.cors': 'CORS error - endpoint not accessible',

     // Errors
     'error.network': 'Network error occurred',
     'error.timeout': 'Query timeout',
     'error.parse': 'Failed to parse query results',
     'error.sparql': 'SPARQL error',

     // ASK results
     'ask.true': 'True',
     'ask.false': 'False',
     'ask.result': 'Result',

     // Accessibility
     'a11y.runQuery': 'Execute SPARQL query (Ctrl+Enter)',
     'a11y.editor': 'SPARQL Query Editor',
     'a11y.results': 'Query Results',
     'a11y.sortColumn': 'Sort by {column}',
     'a11y.resizeColumn': 'Resize column',

     // Data Grid
     'grid.columns': 'Columns',
     'grid.filter': 'Filter',
     'grid.sort': 'Sort',
     'grid.noData': 'No data available',
     'grid.showColumn': 'Show column',
     'grid.hideColumn': 'Hide column',

     // Warnings
     'warning.largeResult': 'Result set is too large to display completely. Please refine your query.',
     'warning.timeout': 'Query is taking longer than expected',

     // Format names
     'format.json': 'JSON',
     'format.xml': 'XML',
     'format.csv': 'CSV',
     'format.tsv': 'TSV',
     'format.turtle': 'Turtle',
     'format.jsonld': 'JSON-LD',
     'format.ntriples': 'N-Triples',
     'format.rdfxml': 'RDF/XML'
   };

   export type TranslationKey = keyof typeof en;
   ```

2. Create `src/lib/localization/index.ts`:
   ```typescript
   import { writable, derived } from 'svelte/store';
   import { en } from './en';

   type Locale = 'en'; // Expand as more locales are added
   type Translations = Record<string, string>;

   const translations: Record<Locale, Translations> = {
     en
   };

   export const currentLocale = writable<Locale>('en');

   export const t = derived(currentLocale, ($locale) => {
     return (key: string, replacements?: Record<string, string>): string => {
       let text = translations[$locale]?.[key] || key;

       if (replacements) {
         Object.entries(replacements).forEach(([placeholder, value]) => {
           text = text.replace(`{${placeholder}}`, value);
         });
       }

       return text;
     };
   });

   export function setLocale(locale: Locale) {
     currentLocale.set(locale);
   }

   export function addTranslations(locale: Locale, newTranslations: Translations) {
     translations[locale] = { ...translations[locale], ...newTranslations };
   }
   ```

3. Create utility function `src/lib/utils/i18n.ts`:
   ```typescript
   import { get } from 'svelte/store';
   import { t } from '../localization';

   // Utility for non-reactive contexts
   export function translate(key: string, replacements?: Record<string, string>): string {
     const translator = get(t);
     return translator(key, replacements);
   }
   ```

## Acceptance Criteria

- [ ] English translation dictionary is complete for all UI text
- [ ] Translation function supports placeholder replacement
- [ ] Locale can be changed programmatically
- [ ] Translation function is available both as store (reactive) and utility (non-reactive)
- [ ] Type-safe translation keys
- [ ] New locales can be easily added

## Testing

1. Create `tests/unit/localization/i18n.test.ts`:
   - Test translation retrieval
   - Test placeholder replacement
   - Test locale switching
   - Test fallback to key if translation missing
   - Test adding custom translations

## Files to Create/Modify

- `src/lib/localization/en.ts` (create)
- `src/lib/localization/index.ts` (create)
- `src/lib/utils/i18n.ts` (create)
- `tests/unit/localization/i18n.test.ts` (create)

## Commit Message

```
feat: implement localization infrastructure

- Add English translation dictionary
- Create translation store with reactive support
- Implement placeholder replacement in translations
- Add locale switching mechanism
- Provide non-reactive translation utility
- Add i18n tests
```

## Notes

- Use `$t('key')` in Svelte components for reactive translations
- Use `translate('key')` in non-reactive contexts (services, utils)
- Placeholder syntax: `{placeholder}` replaced with values from object
- Future task: Add more locales (e.g., German, French, Spanish)
- Consider lazy loading translations for large locale files
