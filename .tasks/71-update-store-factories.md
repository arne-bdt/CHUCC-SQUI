# Task 71: Update Store Factory Functions

## Overview

Ensure all store modules export factory functions (not just singleton instances) to enable multiple independent store instances. This is required for the context-based state isolation pattern.

## Motivation

### Current State

Most stores already have factory functions, but some may only export singletons:

```typescript
// ✅ GOOD: Factory function exported
export function createQueryStore() { /* ... */ }
export const queryStore = createQueryStore(); // Also export singleton

// ❌ NEEDS UPDATE: Only singleton exported
const store = writable(initialState);
export default store;
```

### Goal

All stores should:
1. Export a **factory function** for creating new instances
2. Export a **global singleton** for backward compatibility
3. Use consistent naming conventions

## Requirements

### 1. Store Factory Pattern

**Pattern to follow:**

```typescript
// src/lib/stores/exampleStore.ts

import { writable } from 'svelte/store';
import type { ExampleState } from '../types';

/**
 * Create a new example store instance
 *
 * Factory function allows creating multiple independent store instances
 * for state isolation (Storybook, tabs, tests)
 *
 * @returns Example store with methods
 */
export function createExampleStore() {
  const initialState: ExampleState = {
    // ... initial state
  };

  const { subscribe, set, update } = writable<ExampleState>(initialState);

  return {
    subscribe,

    // Methods to update state
    setValue: (value: string): void => {
      update(state => ({ ...state, value }));
    },

    reset: (): void => {
      set(initialState);
    },
  };
}

/**
 * Global example store instance
 *
 * Use this for backward compatibility with existing code.
 * New code should use context-based stores via getExampleStore()
 */
export const exampleStore = createExampleStore();
```

### 2. Stores to Audit

Check these stores and ensure they follow the pattern:

#### Already Compliant ✅
- `src/lib/stores/queryStore.ts` - Has `createQueryStore()`
- `src/lib/stores/resultsStore.ts` - Has `createResultsStore()`
- `src/lib/stores/uiStore.ts` - Has `createUIStore()`
- `src/lib/stores/tabStore.ts` - Has `createTabStore()`

#### Need to Verify ⚠️
- `src/lib/stores/endpointStore.ts` - Check if has factory
- `src/lib/stores/serviceDescriptionStore.ts` - Check if has factory
- `src/lib/stores/settingsStore.ts` - Check if has factory
- `src/lib/stores/theme.ts` - Check if has factory

### 3. Update endpointStore (if needed)

**Current:**
```typescript
// src/lib/stores/endpointStore.ts
export const defaultEndpoint = writable<string>('');
```

**Should be:**
```typescript
// src/lib/stores/endpointStore.ts

/**
 * Create a new endpoint store instance
 */
export function createEndpointStore(initialEndpoint = '') {
  return writable<string>(initialEndpoint);
}

/**
 * Global endpoint store instance
 */
export const defaultEndpoint = createEndpointStore();
```

### 4. Update serviceDescriptionStore (if needed)

**Pattern:**
```typescript
// src/lib/stores/serviceDescriptionStore.ts

export function createServiceDescriptionStore() {
  const initialState: ServiceDescriptionState = {
    descriptions: new Map(),
    loading: false,
    error: null,
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,

    async fetchForEndpoint(endpoint: string) {
      // Implementation...
    },

    clear() {
      set(initialState);
    },
  };
}

/**
 * Global service description store instance
 */
export const serviceDescriptionStore = createServiceDescriptionStore();
```

### 5. Update settingsStore (if needed)

**Pattern:**
```typescript
// src/lib/stores/settingsStore.ts

export function createSettingsStore() {
  const initialState = getDefaultSettings();

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    updateSetting(key: string, value: any) {
      update(state => ({ ...state, [key]: value }));
    },
    reset() {
      set(initialState);
    },
  };
}

/**
 * Global settings store instance
 */
export const settingsStore = createSettingsStore();
```

## Implementation Steps

### Step 1: Audit Existing Stores
1. Review all store files in `src/lib/stores/`
2. Identify stores that only export singletons
3. Document which stores need updates

### Step 2: Update Store Files
For each store that needs updating:

1. Wrap existing logic in factory function
2. Name factory `create<StoreName>Store()`
3. Export factory function
4. Keep singleton export for backward compatibility
5. Add JSDoc comments

### Step 3: Update Type Exports
1. Export store types from factory functions:
   ```typescript
   export type ExampleStore = ReturnType<typeof createExampleStore>;
   ```
2. Update `src/lib/types/index.ts` with new types

### Step 4: Update Store Index
Update `src/lib/stores/index.ts`:

```typescript
// Export factory functions
export { createQueryStore, queryStore } from './queryStore';
export { createResultsStore, resultsStore } from './resultsStore';
export { createUIStore, uiStore } from './uiStore';
export { createEndpointStore, defaultEndpoint } from './endpointStore';
export { createServiceDescriptionStore, serviceDescriptionStore } from './serviceDescriptionStore';
export { createSettingsStore, settingsStore } from './settingsStore';
export { createTabStore, tabStore } from './tabStore';
```

### Step 5: Update Tests
1. Review unit tests for updated stores
2. Add tests for factory functions creating independent instances
3. Test that multiple instances don't share state

### Step 6: Update Documentation
1. Add JSDoc to all factory functions
2. Document the pattern in store files
3. Update comments to explain context usage

## Acceptance Criteria

### Functional Requirements
- ✅ All stores export factory functions
- ✅ Factory functions create independent instances
- ✅ Multiple instances don't share state
- ✅ Global singleton exports remain for backward compatibility
- ✅ Factory functions accept initial state parameters

### Code Quality
- ✅ Consistent naming: `create<StoreName>Store()`
- ✅ Full TypeScript types for factory return values
- ✅ JSDoc documentation on all exports
- ✅ No breaking changes to existing code

### Testing
- ✅ Unit tests verify instance isolation
- ✅ Tests verify factory parameters work
- ✅ All existing tests still pass
- ✅ Coverage >90% for updated stores

### Build & Quality Checks
```bash
npm run build           # ✅ 0 errors, 0 warnings
npm test                # ✅ All tests pass
npm run type-check      # ✅ No type errors
```

## Example Test

```typescript
// tests/unit/stores/queryStore.test.ts

describe('createQueryStore factory', () => {
  it('creates independent store instances', () => {
    const store1 = createQueryStore();
    const store2 = createQueryStore();

    store1.setText('Query 1');
    store2.setText('Query 2');

    expect(get(store1).text).toBe('Query 1');
    expect(get(store2).text).toBe('Query 2'); // Not affected by store1
  });

  it('accepts initial state', () => {
    const store = createQueryStore({
      text: 'Initial query',
      endpoint: 'http://example.org/sparql',
    });

    expect(get(store).text).toBe('Initial query');
    expect(get(store).endpoint).toBe('http://example.org/sparql');
  });
});
```

## Dependencies

**Prerequisite Tasks:**
- None (parallel with Task 70)

**Required for:**
- Task 70: Create StoreProvider Component
- Task 72: Refactor Components to Use Context

## Technical Notes

### Why Factory Functions?

1. **Multiple Instances**: Create independent state for tabs, stories, tests
2. **Testability**: Easy to create fresh instances in tests
3. **Flexibility**: Can pass initial state or configuration
4. **No Global State Pollution**: Each instance is isolated

### Backward Compatibility

Keeping singleton exports ensures existing code continues to work:

```typescript
// Old code still works
import { queryStore } from './stores/queryStore';
queryStore.setText('test');

// New code uses context
import { getQueryStore } from './stores/storeContext';
const queryStore = getQueryStore();
queryStore.setText('test');
```

## Future Enhancements

- **Store Composition**: Compose multiple stores in factory
- **Middleware**: Add logging, persistence middleware to factories
- **Store Reset**: Global reset utility for all stores
- **Store Debugging**: Dev mode logging of instance creation

## References

- **Svelte Store API**: https://svelte.dev/docs/svelte-store
- **Factory Pattern**: https://refactoring.guru/design-patterns/factory-method
- **TypeScript Generics**: https://www.typescriptlang.org/docs/handbook/2/generics.html

---

**Previous Task**: [Task 70: Create StoreProvider Component](./70-create-store-provider.md)
**Next Task**: [Task 72: Refactor Components to Use Context](./72-refactor-components-context.md)
