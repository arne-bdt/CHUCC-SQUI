# Task 70: Create StoreProvider Component for State Isolation

## Overview

Create a `StoreProvider` component that instantiates fresh store instances and provides them via Svelte context. This enables proper state isolation in Storybook stories and supports multiple independent component instances (e.g., tabs).

## Motivation

### Current Problem

**Global Singleton Stores** create state leakage in Storybook:

```typescript
// src/lib/stores/queryStore.ts
export const queryStore = createQueryStore(); // ❌ Global singleton
```

**Symptoms:**
- Storybook story overview shows disabled RunButton across all stories
- One story's decorator affects all other stories
- Stories share state instead of being isolated
- Cannot have multiple independent instances

**Example of State Leakage:**
```typescript
// RunButton.stories.ts - "Disabled" story
export const Disabled: Story = {
  decorators: [(story: any) => {
    queryStore.setText('');  // ❌ Empties query for ALL stories!
    defaultEndpoint.set('');
    return story();
  }],
};
```

### Solution: Context-Based Store Instances

- Each component tree gets fresh store instances
- Storybook stories are isolated
- Tabs can have independent state
- Services can still access stores via context

## Requirements

### 1. StoreProvider Component

**File**: `src/lib/components/StoreProvider.svelte`

```typescript
<script lang="ts">
  /**
   * Store Provider Component
   *
   * Creates fresh instances of all application stores and provides them
   * via Svelte context to child components.
   *
   * This ensures state isolation between:
   * - Storybook stories
   * - Multiple tabs
   * - Multiple component instances
   *
   * @component
   */

  import { setContext } from 'svelte';
  import { createQueryStore } from '../stores/queryStore';
  import { createResultsStore } from '../stores/resultsStore';
  import { createUIStore } from '../stores/uiStore';
  import { writable } from 'svelte/store';

  /**
   * Component props
   */
  interface Props {
    /** Initial endpoint URL */
    initialEndpoint?: string;
    /** Initial query text */
    initialQuery?: string;
    /** Children components */
    children?: any;
  }

  let { initialEndpoint = '', initialQuery = '', children }: Props = $props();

  // Create fresh store instances for this component tree
  const queryStore = createQueryStore();
  const resultsStore = createResultsStore();
  const uiStore = createUIStore();
  const endpointStore = writable(initialEndpoint);

  // Initialize with props if provided
  if (initialQuery) {
    queryStore.setText(initialQuery);
  }
  if (initialEndpoint) {
    endpointStore.set(initialEndpoint);
  }

  // Provide stores to child components via context
  setContext('queryStore', queryStore);
  setContext('resultsStore', resultsStore);
  setContext('uiStore', uiStore);
  setContext('endpointStore', endpointStore);
</script>

{@render children?.()}
```

### 2. Context Key Constants

**File**: `src/lib/stores/contextKeys.ts`

```typescript
/**
 * Context keys for store injection
 *
 * Using typed symbols ensures type safety and prevents naming collisions
 */

export const QUERY_STORE_KEY = Symbol('queryStore');
export const RESULTS_STORE_KEY = Symbol('resultsStore');
export const UI_STORE_KEY = Symbol('uiStore');
export const ENDPOINT_STORE_KEY = Symbol('endpointStore');

// Type exports for context values
export type QueryStoreContext = ReturnType<typeof import('./queryStore').createQueryStore>;
export type ResultsStoreContext = ReturnType<typeof import('./resultsStore').createResultsStore>;
export type UIStoreContext = ReturnType<typeof import('./uiStore').createUIStore>;
```

### 3. Store Accessor Utility

**File**: `src/lib/stores/storeContext.ts`

```typescript
/**
 * Store context utilities
 *
 * Provides type-safe access to stores from context with fallback to global instances
 */

import { getContext, hasContext } from 'svelte';
import { queryStore as globalQueryStore } from './queryStore';
import { resultsStore as globalResultsStore } from './resultsStore';
import { uiStore as globalUIStore } from './uiStore';
import { defaultEndpoint as globalEndpointStore } from './endpointStore';
import type {
  QueryStoreContext,
  ResultsStoreContext,
  UIStoreContext,
} from './contextKeys';

/**
 * Get query store from context with fallback to global instance
 *
 * @returns Query store instance
 */
export function getQueryStore(): QueryStoreContext {
  if (hasContext('queryStore')) {
    return getContext<QueryStoreContext>('queryStore');
  }
  return globalQueryStore;
}

/**
 * Get results store from context with fallback to global instance
 *
 * @returns Results store instance
 */
export function getResultsStore(): ResultsStoreContext {
  if (hasContext('resultsStore')) {
    return getContext<ResultsStoreContext>('resultsStore');
  }
  return globalResultsStore;
}

/**
 * Get UI store from context with fallback to global instance
 *
 * @returns UI store instance
 */
export function getUIStore(): UIStoreContext {
  if (hasContext('uiStore')) {
    return getContext<UIStoreContext>('uiStore');
  }
  return globalUIStore;
}

/**
 * Get endpoint store from context with fallback to global instance
 *
 * @returns Endpoint store (writable)
 */
export function getEndpointStore() {
  if (hasContext('endpointStore')) {
    return getContext('endpointStore');
  }
  return globalEndpointStore;
}
```

## Implementation Steps

### Step 1: Create StoreProvider Component
1. Create `src/lib/components/StoreProvider.svelte`
2. Implement fresh store instantiation
3. Add context provisioning
4. Support initial values via props

### Step 2: Create Context Utilities
1. Create `src/lib/stores/contextKeys.ts` with type-safe keys
2. Create `src/lib/stores/storeContext.ts` with accessor functions
3. Export utilities from `src/lib/stores/index.ts`

### Step 3: Add Unit Tests
1. Create `tests/unit/components/StoreProvider.test.ts`
2. Test store instantiation
3. Test context provisioning
4. Test initial values
5. Test isolation between instances

### Step 4: Add Integration Tests
1. Create `tests/integration/StoreProvider.test.ts`
2. Test multiple StoreProvider instances don't share state
3. Test child components can access stores
4. Test context fallback to global stores

### Step 5: Create Storybook Story
1. Create `src/lib/components/StoreProvider.stories.ts`
2. Demonstrate isolated instances
3. Show state not shared between stories

## Acceptance Criteria

### Functional Requirements
- ✅ StoreProvider creates fresh store instances
- ✅ Stores are accessible via context in child components
- ✅ Multiple StoreProvider instances have isolated state
- ✅ Initial values can be passed via props
- ✅ Backward compatible with global stores (fallback)

### Code Quality
- ✅ TypeScript with strict mode, no `any` types
- ✅ Full JSDoc documentation
- ✅ Follows Svelte 5 patterns (`$props`, `$state`, `$derived`)
- ✅ Clean, readable code structure

### Testing
- ✅ Unit tests for StoreProvider component (>90% coverage)
- ✅ Integration tests for state isolation
- ✅ Storybook story demonstrating usage
- ✅ All existing tests still pass

### Build & Quality Checks
```bash
npm run build           # ✅ 0 errors, 0 warnings
npm test                # ✅ All tests pass
npm run lint            # ✅ No violations
npm run type-check      # ✅ No type errors
```

## Dependencies

**Prerequisite Tasks:**
- None (foundational task)

**Depends on:**
- Svelte 5 context API
- Existing store factory functions

## Technical Notes

### Why Context over Global Singletons?

1. **State Isolation**: Each component tree gets independent state
2. **Testability**: Easy to provide mock stores in tests
3. **Reusability**: Same component can be used multiple times
4. **Storybook**: Stories don't leak state to each other

### Backward Compatibility Strategy

The `storeContext.ts` utility provides **automatic fallback**:

```typescript
// If component is wrapped in StoreProvider → use context stores
// If component is used standalone → use global stores
const queryStore = getQueryStore();
```

This allows **incremental migration** without breaking existing code.

## Future Enhancements

- **Store Debugging**: Add DevTools integration for context stores
- **Store Persistence**: Per-instance localStorage keys
- **Store Migration**: Helper to copy state between instances
- **Performance Monitoring**: Track store subscription counts

## References

- **Svelte Context API**: https://svelte.dev/docs/svelte/context
- **Svelte 5 Runes**: https://svelte.dev/docs/svelte/overview
- **Store Pattern**: https://svelte.dev/docs/svelte-store

---

**Next Task**: [Task 71: Update Store Factory Functions](./71-update-store-factories.md)
