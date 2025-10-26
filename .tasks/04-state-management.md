# Task 04: State Management Stores

**Phase:** Foundation
**Status:** DONE
**Dependencies:** 03
**Estimated Effort:** 3 hours

## Objective

Implement Svelte stores for managing application state including query text, endpoint configuration, results, and UI state.

## Requirements

Per specification:
- Manage query state (text, prefixes, endpoint)
- Manage results state (data, loading, errors)
- Support multiple tabs (prepare state structure for this)
- Persist state to localStorage where appropriate
- Use Svelte 5 runes and stores appropriately

## Implementation Steps

1. Create `src/lib/stores/queryStore.ts`:
   ```typescript
   import { writable, derived } from 'svelte/store';
   import type { QueryState } from '../types';

   export function createQueryStore() {
     const { subscribe, set, update } = writable<QueryState>({
       text: '',
       endpoint: '',
       prefixes: {},
       type: undefined
     });

     return {
       subscribe,
       setText: (text: string) => update(s => ({ ...s, text })),
       setEndpoint: (endpoint: string) => update(s => ({ ...s, endpoint })),
       setPrefixes: (prefixes: Record<string, string>) => update(s => ({ ...s, prefixes })),
       updatePrefix: (prefix: string, uri: string) => update(s => ({
         ...s,
         prefixes: { ...s.prefixes, [prefix]: uri }
       })),
       reset: () => set({ text: '', endpoint: '', prefixes: {}, type: undefined })
     };
   }

   export const queryStore = createQueryStore();
   ```

2. Create `src/lib/stores/resultsStore.ts`:
   ```typescript
   import { writable } from 'svelte/store';
   import type { ResultsState } from '../types';

   export function createResultsStore() {
     const { subscribe, set, update } = writable<ResultsState>({
       data: null,
       format: 'json',
       view: 'table',
       loading: false,
       error: null
     });

     return {
       subscribe,
       setData: (data: SparqlJsonResults) => update(s => ({ ...s, data, loading: false, error: null })),
       setLoading: (loading: boolean) => update(s => ({ ...s, loading })),
       setError: (error: string) => update(s => ({ ...s, error, loading: false })),
       setView: (view: 'table' | 'raw') => update(s => ({ ...s, view })),
       setFormat: (format: ResultFormat) => update(s => ({ ...s, format })),
       reset: () => set({ data: null, format: 'json', view: 'table', loading: false, error: null })
     };
   }

   export const resultsStore = createResultsStore();
   ```

3. Create `src/lib/stores/uiStore.ts`:
   ```typescript
   import { writable } from 'svelte/store';

   interface UIState {
     activeTab: string;
     simpleView: boolean; // true = abbreviated IRIs, false = full URIs
     filtersEnabled: boolean;
     splitterPosition: number;
   }

   export function createUIStore() {
     const { subscribe, set, update } = writable<UIState>({
       activeTab: 'tab-1',
       simpleView: true,
       filtersEnabled: false,
       splitterPosition: 50 // percentage
     });

     return {
       subscribe,
       setActiveTab: (tabId: string) => update(s => ({ ...s, activeTab: tabId })),
       toggleSimpleView: () => update(s => ({ ...s, simpleView: !s.simpleView })),
       toggleFilters: () => update(s => ({ ...s, filtersEnabled: !s.filtersEnabled })),
       setSplitterPosition: (position: number) => update(s => ({ ...s, splitterPosition: position }))
     };
   }

   export const uiStore = createUIStore();
   ```

4. Create `src/lib/stores/endpointStore.ts`:
   ```typescript
   import { writable } from 'svelte/store';
   import type { Endpoint } from '../types';

   export const endpointCatalogue = writable<Endpoint[]>([
     { url: 'https://dbpedia.org/sparql', name: 'DBpedia', description: 'DBpedia SPARQL endpoint' },
     { url: 'https://query.wikidata.org/sparql', name: 'Wikidata', description: 'Wikidata Query Service' }
   ]);

   export const defaultEndpoint = writable<string>('');
   ```

5. Create `src/lib/stores/index.ts`:
   - Export all stores

## Acceptance Criteria

- [ ] Query store manages query text, endpoint, and prefixes
- [ ] Results store manages query results, loading state, and errors
- [ ] UI store manages view preferences and UI state
- [ ] Endpoint store provides catalogue of known endpoints
- [ ] All stores have proper TypeScript types
- [ ] Store actions are properly typed and documented
- [ ] Stores can be reset to initial state

## Testing

1. Create `tests/unit/stores/queryStore.test.ts`:
   - Test query text update
   - Test prefix management
   - Test store reset

2. Create `tests/unit/stores/resultsStore.test.ts`:
   - Test results data update
   - Test loading state transitions
   - Test error handling

3. Create `tests/unit/stores/uiStore.test.ts`:
   - Test view mode toggling
   - Test filter toggle
   - Test tab switching

## Files to Create/Modify

- `src/lib/stores/queryStore.ts` (create)
- `src/lib/stores/resultsStore.ts` (create)
- `src/lib/stores/uiStore.ts` (create)
- `src/lib/stores/endpointStore.ts` (create)
- `src/lib/stores/index.ts` (create)
- `tests/unit/stores/queryStore.test.ts` (create)
- `tests/unit/stores/resultsStore.test.ts` (create)
- `tests/unit/stores/uiStore.test.ts` (create)

## Commit Message

```
feat: implement core state management stores

- Add queryStore for query text, endpoint, and prefixes
- Add resultsStore for query results and loading state
- Add uiStore for UI preferences and state
- Add endpointStore for endpoint catalogue
- Implement store actions with proper types
- Add comprehensive store tests
```

## Notes

- Consider using `writable` with custom update logic for complex state
- Stores should be framework-agnostic (pure Svelte stores)
- localStorage persistence can be added later as an enhancement
- Use derived stores for computed values where needed
