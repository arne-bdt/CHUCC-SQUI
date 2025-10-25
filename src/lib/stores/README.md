# Stores

Svelte stores for state management.

## State Modules

- **query.ts** - Query text, execution state, history
- **endpoint.ts** - Active endpoint, endpoint list
- **results.ts** - Query results, pagination state
- **tabs.ts** - Open tabs, active tab

## Pattern

```typescript
import { writable, derived } from 'svelte/store';

export const queryStore = writable({
  text: '',
  isExecuting: false,
  lastResult: null,
  error: null,
});

export const setQuery = (text: string) => {
  queryStore.update((s) => ({ ...s, text }));
};
```
