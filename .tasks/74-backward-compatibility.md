# Task 74: Add Backward Compatibility and Migration Utilities

## Overview

Ensure the context-based store migration doesn't break existing code. Provide utilities to help with incremental migration and support both legacy (global stores) and new (context stores) patterns.

## Motivation

### Migration Challenge

The SQUI codebase has:
- 5+ components using stores
- Multiple services accessing stores
- Existing tests expecting global stores
- Main app not yet using StoreProvider

**Goal**: Enable incremental migration without breaking existing functionality.

### Backward Compatibility Strategy

1. **Automatic Fallback**: Components work with OR without StoreProvider
2. **Migration Utilities**: Tools to help migrate code gradually
3. **Deprecation Warnings**: Guide developers to new pattern
4. **Documentation**: Clear migration guide

## Requirements

### 1. Enhanced Store Context Utilities

Update `src/lib/stores/storeContext.ts` with enhanced fallback:

```typescript
/**
 * Store context utilities with backward compatibility
 *
 * Provides type-safe access to stores from context with automatic
 * fallback to global instances for backward compatibility.
 */

import { getContext, hasContext } from 'svelte';
import { queryStore as globalQueryStore } from './queryStore';
import { resultsStore as globalResultsStore } from './resultsStore';
import { uiStore as globalUIStore } from './uiStore';
import { defaultEndpoint as globalEndpointStore } from './endpointStore';
import { serviceDescriptionStore as globalServiceDescriptionStore } from './serviceDescriptionStore';
import { settingsStore as globalSettingsStore } from './settingsStore';
import type {
  QueryStoreContext,
  ResultsStoreContext,
  UIStoreContext,
} from './contextKeys';

/**
 * Development mode flag - enables deprecation warnings
 */
const DEV_MODE = import.meta.env.DEV;

/**
 * Get query store from context with fallback to global instance
 *
 * Prefers context-based store (from StoreProvider) but falls back to
 * global singleton for backward compatibility.
 *
 * @returns Query store instance
 * @example
 * ```typescript
 * // In component
 * const queryStore = getQueryStore();
 * let query = $state($queryStore.text);
 * ```
 */
export function getQueryStore(): QueryStoreContext {
  if (hasContext('queryStore')) {
    return getContext<QueryStoreContext>('queryStore');
  }

  // Fallback to global store
  if (DEV_MODE) {
    console.warn(
      '[SQUI] Using global queryStore. Consider wrapping component in <StoreProvider> for state isolation.'
    );
  }

  return globalQueryStore;
}

/**
 * Get results store from context with fallback to global instance
 */
export function getResultsStore(): ResultsStoreContext {
  if (hasContext('resultsStore')) {
    return getContext<ResultsStoreContext>('resultsStore');
  }

  if (DEV_MODE) {
    console.warn(
      '[SQUI] Using global resultsStore. Consider wrapping component in <StoreProvider> for state isolation.'
    );
  }

  return globalResultsStore;
}

/**
 * Get UI store from context with fallback to global instance
 */
export function getUIStore(): UIStoreContext {
  if (hasContext('uiStore')) {
    return getContext<UIStoreContext>('uiStore');
  }

  if (DEV_MODE) {
    console.warn(
      '[SQUI] Using global uiStore. Consider wrapping component in <StoreProvider> for state isolation.'
    );
  }

  return globalUIStore;
}

/**
 * Get endpoint store from context with fallback to global instance
 */
export function getEndpointStore() {
  if (hasContext('endpointStore')) {
    return getContext('endpointStore');
  }

  if (DEV_MODE) {
    console.warn(
      '[SQUI] Using global endpointStore. Consider wrapping component in <StoreProvider> for state isolation.'
    );
  }

  return globalEndpointStore;
}

/**
 * Get service description store from context with fallback
 */
export function getServiceDescriptionStore() {
  if (hasContext('serviceDescriptionStore')) {
    return getContext('serviceDescriptionStore');
  }

  if (DEV_MODE) {
    console.warn(
      '[SQUI] Using global serviceDescriptionStore. Consider wrapping component in <StoreProvider> for state isolation.'
    );
  }

  return globalServiceDescriptionStore;
}

/**
 * Get settings store from context with fallback
 */
export function getSettingsStore() {
  if (hasContext('settingsStore')) {
    return getContext('settingsStore');
  }

  if (DEV_MODE) {
    console.warn(
      '[SQUI] Using global settingsStore. Consider wrapping component in <StoreProvider> for state isolation.'
    );
  }

  return globalSettingsStore;
}

/**
 * Check if component is using context-based stores
 *
 * Useful for debugging and testing
 */
export function isUsingContextStores(): boolean {
  return hasContext('queryStore');
}
```

### 2. Migration Utility Functions

**File**: `src/lib/stores/migrationUtils.ts`

```typescript
/**
 * Migration utilities for store context transition
 *
 * Helpers for migrating from global stores to context-based stores
 */

import { get } from 'svelte/store';
import type { createQueryStore } from './queryStore';
import type { createResultsStore } from './resultsStore';

/**
 * Copy state from global stores to context stores
 *
 * Useful when migrating from global to context-based stores
 *
 * @param contextStores - Context store instances to copy state into
 * @param globalStores - Global store instances to copy state from
 *
 * @example
 * ```typescript
 * // In component that's being migrated
 * const queryStore = getQueryStore();
 * const resultsStore = getResultsStore();
 *
 * // Copy existing global state to context stores
 * copyStoreState(
 *   { queryStore, resultsStore },
 *   { queryStore: globalQueryStore, resultsStore: globalResultsStore }
 * );
 * ```
 */
export function copyStoreState(
  contextStores: {
    queryStore?: ReturnType<typeof createQueryStore>;
    resultsStore?: ReturnType<typeof createResultsStore>;
  },
  globalStores: {
    queryStore?: ReturnType<typeof createQueryStore>;
    resultsStore?: ReturnType<typeof createResultsStore>;
  }
): void {
  if (contextStores.queryStore && globalStores.queryStore) {
    const state = get(globalStores.queryStore);
    contextStores.queryStore.setState(state);
  }

  if (contextStores.resultsStore && globalStores.resultsStore) {
    const state = get(globalStores.resultsStore);
    contextStores.resultsStore.setState(state);
  }
}

/**
 * Synchronize context stores with global stores
 *
 * Sets up bidirectional sync (useful during migration phase)
 *
 * @param contextStores - Context store instances
 * @param globalStores - Global store instances
 * @returns Cleanup function to stop synchronization
 *
 * @example
 * ```typescript
 * const cleanup = syncWithGlobalStores(
 *   { queryStore: contextQueryStore },
 *   { queryStore: globalQueryStore }
 * );
 *
 * // Later, when no longer needed:
 * cleanup();
 * ```
 */
export function syncWithGlobalStores(
  contextStores: {
    queryStore?: ReturnType<typeof createQueryStore>;
  },
  globalStores: {
    queryStore?: ReturnType<typeof createQueryStore>;
  }
): () => void {
  const unsubscribers: Array<() => void> = [];

  // Sync query store: context → global
  if (contextStores.queryStore && globalStores.queryStore) {
    unsubscribers.push(
      contextStores.queryStore.subscribe((state) => {
        globalStores.queryStore?.setState(state);
      })
    );
  }

  // Sync query store: global → context
  if (globalStores.queryStore && contextStores.queryStore) {
    unsubscribers.push(
      globalStores.queryStore.subscribe((state) => {
        contextStores.queryStore?.setState(state);
      })
    );
  }

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}
```

### 3. Enhanced StoreProvider with Backward Compatibility

Update `StoreProvider.svelte` to support migration:

```typescript
<script lang="ts">
  import { setContext, onMount } from 'svelte';
  import { createQueryStore } from '../stores/queryStore';
  import { createResultsStore } from '../stores/resultsStore';
  import { createUIStore } from '../stores/uiStore';
  import { writable } from 'svelte/store';
  import { copyStoreState } from '../stores/migrationUtils';
  import {
    queryStore as globalQueryStore,
    resultsStore as globalResultsStore,
  } from '../stores';

  interface Props {
    initialEndpoint?: string;
    initialQuery?: string;
    /**
     * Copy state from global stores on mount
     * Useful during migration phase
     */
    inheritGlobalState?: boolean;
    children?: any;
  }

  let {
    initialEndpoint = '',
    initialQuery = '',
    inheritGlobalState = false,
    children,
  }: Props = $props();

  // Create fresh store instances
  const queryStore = createQueryStore();
  const resultsStore = createResultsStore();
  const uiStore = createUIStore();
  const endpointStore = writable(initialEndpoint);

  // Initialize with props
  if (initialQuery) queryStore.setText(initialQuery);
  if (initialEndpoint) endpointStore.set(initialEndpoint);

  // Provide stores to children
  setContext('queryStore', queryStore);
  setContext('resultsStore', resultsStore);
  setContext('uiStore', uiStore);
  setContext('endpointStore', endpointStore);

  // Copy global state if requested
  onMount(() => {
    if (inheritGlobalState) {
      copyStoreState(
        { queryStore, resultsStore },
        { queryStore: globalQueryStore, resultsStore: globalResultsStore }
      );
    }
  });
</script>

{@render children?.()}
```

### 4. Migration Guide Documentation

**File**: `docs/MIGRATION-CONTEXT-STORES.md`

```markdown
# Migration Guide: Context-Based Stores

## Overview

SQUI is migrating from global singleton stores to context-based stores
for better state isolation in Storybook and multi-instance scenarios.

## Why Migrate?

- ✅ **State Isolation**: Each component tree has independent state
- ✅ **Testability**: Easier to mock stores in tests
- ✅ **Storybook**: No state leakage between stories
- ✅ **Multiple Instances**: Support tabs with independent state

## Migration Steps

### 1. Update Component Imports

**Before:**
```typescript
import { queryStore } from '../../stores/queryStore';
```

**After:**
```typescript
import { getQueryStore } from '../../stores/storeContext';

const queryStore = getQueryStore();
```

### 2. Wrap App in StoreProvider (Optional)

For the main app, you can continue using global stores OR wrap in StoreProvider:

```typescript
// src/SparqlQueryUI.svelte
<StoreProvider>
  <!-- App components -->
</StoreProvider>
```

### 3. Update Tests

Tests can use either pattern:

```typescript
// Option 1: Use global stores (no changes needed)
import { queryStore } from '$lib/stores/queryStore';
queryStore.setText('test');

// Option 2: Use StoreProvider for isolation
import { render } from '@testing-library/svelte';
import StoreProvider from '$lib/components/StoreProvider.svelte';

render(StoreProvider, {
  props: {
    initialQuery: 'test',
    children: MyComponent,
  },
});
```

## Backward Compatibility

All components work with OR without StoreProvider:

- **With StoreProvider**: Uses context stores (isolated)
- **Without StoreProvider**: Uses global stores (backward compatible)

No breaking changes!

## Gradual Migration

You can migrate components incrementally:

1. Update imports to use `getQueryStore()` etc.
2. Test component works with and without StoreProvider
3. Update Storybook stories to use StoreProvider
4. Repeat for next component

Each component can be migrated independently.
```

## Implementation Steps

### Step 1: Enhance storeContext.ts
1. Add deprecation warnings in dev mode
2. Add `isUsingContextStores()` utility
3. Ensure all stores have getter functions
4. Add JSDoc documentation

### Step 2: Create migrationUtils.ts
1. Implement `copyStoreState()`
2. Implement `syncWithGlobalStores()`
3. Add unit tests for utilities
4. Document usage

### Step 3: Update StoreProvider
1. Add `inheritGlobalState` prop
2. Implement global state copy on mount
3. Test both modes
4. Document prop usage

### Step 4: Create Migration Guide
1. Write `docs/MIGRATION-CONTEXT-STORES.md`
2. Include code examples
3. Document migration steps
4. Add troubleshooting section

### Step 5: Update Main App (Optional)
1. Wrap `SparqlQueryUI` in `StoreProvider`
2. Test full application
3. Verify all features work
4. Keep global stores as fallback

### Step 6: Testing
1. Test components with StoreProvider
2. Test components without StoreProvider
3. Test `inheritGlobalState` prop
4. Test migration utilities

## Acceptance Criteria

### Functional Requirements
- ✅ Components work with StoreProvider (context stores)
- ✅ Components work without StoreProvider (global fallback)
- ✅ No breaking changes to existing code
- ✅ Deprecation warnings in dev mode
- ✅ Migration utilities work correctly

### Code Quality
- ✅ Clear deprecation warnings
- ✅ Comprehensive JSDoc documentation
- ✅ Type-safe utilities
- ✅ Clean, maintainable code

### Documentation
- ✅ Migration guide created
- ✅ Code examples included
- ✅ Troubleshooting section
- ✅ Clear upgrade path

### Testing
- ✅ Unit tests for migration utilities
- ✅ Integration tests for both modes
- ✅ All existing tests still pass
- ✅ New tests for backward compatibility

### Build & Quality Checks
```bash
npm run build           # ✅ 0 errors, 0 warnings
npm test                # ✅ All tests pass
npm run lint            # ✅ No violations
```

## Deprecation Timeline (Proposed)

**Phase 1** (Current): Dual support - both patterns work
**Phase 2** (Future): Deprecation warnings in dev mode
**Phase 3** (Later): StoreProvider becomes required
**Phase 4** (Much later): Remove global store fallback

**For now**: Stay in Phase 1 - no deprecation pressure.

## Dependencies

**Prerequisite Tasks:**
- Task 70: Create StoreProvider Component
- Task 71: Update Store Factory Functions
- Task 72: Refactor Components to Use Context
- Task 73: Update Storybook Configuration

**Required for:**
- Task 75: Verify State Isolation with Tests

## Technical Notes

### Why Gradual Migration?

- **Risk Mitigation**: Test each change independently
- **Team Coordination**: Developers can migrate at their own pace
- **Rollback Safety**: Easy to revert if issues arise
- **Production Safety**: No risk of breaking production code

### Performance Impact

**Minimal**: `hasContext()` is a simple Map lookup. Negligible overhead.

## Future Enhancements

- **Strict Mode**: Require StoreProvider (no fallback)
- **DevTools**: Visualize store context hierarchy
- **Auto-Migration**: Script to update component imports
- **Store Inspector**: Debug tool to view all active stores

## References

- **Svelte Context**: https://svelte.dev/docs/svelte/context
- **Migration Patterns**: https://martinfowler.com/articles/refactoring-2nd-changes.html

---

**Previous Task**: [Task 73: Update Storybook Configuration](./73-update-storybook-config.md)
**Next Task**: [Task 75: Verify State Isolation with Tests](./75-verify-state-isolation.md)
