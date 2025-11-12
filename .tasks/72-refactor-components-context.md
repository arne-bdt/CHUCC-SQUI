# Task 72: Refactor Components to Use Context-Based Stores

## Overview

Update all components to access stores via Svelte context instead of direct imports. This is a **complete, one-time refactoring** - no gradual migration or backward compatibility needed since the project hasn't been released yet.

## Motivation

### Current Pattern (Global Imports)

```typescript
// ❌ CURRENT: Direct import of global singleton
import { queryStore } from '../../stores/queryStore';

let queryState = $state($queryStore);
```

**Problems:**
- All components share same store instance
- No state isolation in Storybook
- Cannot have multiple independent instances

### New Pattern (Context-Based)

```typescript
// ✅ NEW: Context-based stores
import { getQueryStore } from '../../stores/storeContext';

const queryStore = getQueryStore();
let queryState = $state($queryStore);
```

**Benefits:**
- Each StoreProvider creates isolated store instances
- State isolation in Storybook and multi-instance scenarios
- Clean dependency injection pattern

## Requirements

### 1. Components to Update

Based on store usage analysis:

#### Components with Direct Store Usage
- `src/lib/components/Editor/SparqlEditor.svelte` - queryStore, resultsStore, endpointStore
- `src/lib/components/Toolbar/RunButton.svelte` - queryStore, resultsStore, endpointStore
- `src/lib/components/Results/ResultsPlaceholder.svelte` - resultsStore
- `src/lib/components/Query/ResultFormatSelector.svelte` - queryStore
- `src/SparqlQueryUI.svelte` - Multiple stores

### 2. Refactoring Pattern

**Before:**
```typescript
<script lang="ts">
  import { queryStore } from '../../stores/queryStore';
  import { resultsStore } from '../../stores/resultsStore';
  import { defaultEndpoint } from '../../stores/endpointStore';

  // Direct usage of global stores
  let queryState = $state($queryStore);
  let resultsState = $state($resultsStore);
  let endpoint = $state($defaultEndpoint);
</script>
```

**After:**
```typescript
<script lang="ts">
  import { getQueryStore, getResultsStore, getEndpointStore } from '../../stores/storeContext';

  // Get stores from context
  const queryStore = getQueryStore();
  const resultsStore = getResultsStore();
  const endpointStore = getEndpointStore();

  // Use stores as before (no change to reactivity)
  let queryState = $state($queryStore);
  let resultsState = $state($resultsStore);
  let endpoint = $state($endpointStore);
</script>
```

### 3. Update storeContext.ts

Create simple context accessors that throw if StoreProvider is missing:

```typescript
/**
 * Store context utilities
 *
 * Provides type-safe access to stores from Svelte context.
 * Throws error if StoreProvider is not present (fail fast).
 */

import { getContext } from 'svelte';
import type {
  QueryStoreContext,
  ResultsStoreContext,
  UIStoreContext,
} from './contextKeys';

/**
 * Get query store from context
 *
 * @throws Error if StoreProvider is not present
 */
export function getQueryStore(): QueryStoreContext {
  const store = getContext<QueryStoreContext>('queryStore');

  if (!store) {
    throw new Error(
      '[SQUI] queryStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get results store from context
 *
 * @throws Error if StoreProvider is not present
 */
export function getResultsStore(): ResultsStoreContext {
  const store = getContext<ResultsStoreContext>('resultsStore');

  if (!store) {
    throw new Error(
      '[SQUI] resultsStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get UI store from context
 *
 * @throws Error if StoreProvider is not present
 */
export function getUIStore(): UIStoreContext {
  const store = getContext<UIStoreContext>('uiStore');

  if (!store) {
    throw new Error(
      '[SQUI] uiStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get endpoint store from context
 *
 * @throws Error if StoreProvider is not present
 */
export function getEndpointStore() {
  const store = getContext('endpointStore');

  if (!store) {
    throw new Error(
      '[SQUI] endpointStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get service description store from context
 *
 * @throws Error if StoreProvider is not present
 */
export function getServiceDescriptionStore() {
  const store = getContext('serviceDescriptionStore');

  if (!store) {
    throw new Error(
      '[SQUI] serviceDescriptionStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}

/**
 * Get settings store from context
 *
 * @throws Error if StoreProvider is not present
 */
export function getSettingsStore() {
  const store = getContext('settingsStore');

  if (!store) {
    throw new Error(
      '[SQUI] settingsStore not found in context. Wrap your component in <StoreProvider>.'
    );
  }

  return store;
}
```

### 4. Wrap Main App in StoreProvider

Update `src/SparqlQueryUI.svelte`:

```typescript
<script lang="ts">
  import StoreProvider from './lib/components/StoreProvider.svelte';
  import SplitPane from './lib/components/Layout/SplitPane.svelte';
  // ... other imports

  // Props for initial configuration
  interface Props {
    initialEndpoint?: string;
    initialQuery?: string;
  }

  let { initialEndpoint = '', initialQuery = '' }: Props = $props();
</script>

<StoreProvider {initialEndpoint} {initialQuery}>
  <div class="sparql-query-ui">
    <SplitPane>
      <!-- App content -->
    </SplitPane>
  </div>
</StoreProvider>
```

## Implementation Steps

### Step 1: Update storeContext.ts
1. Remove fallback logic (no `hasContext()` checks)
2. Throw clear errors when StoreProvider is missing
3. Add JSDoc documentation
4. Remove deprecation warnings (not needed)

### Step 2: Update All Components
1. Replace direct store imports with `getQueryStore()`, etc.
2. Update all store references
3. Test each component
4. No need to test "without StoreProvider" - it should fail

### Step 3: Wrap Main App
1. Update `SparqlQueryUI.svelte` to use StoreProvider
2. Pass initial values via props
3. Test full application workflow
4. Verify all features work

### Step 4: Update All Tests
1. Update tests to use StoreProvider
2. Remove tests for "global fallback" (doesn't exist)
3. Ensure all tests pass
4. Update test setup files if needed

## Acceptance Criteria

### Functional Requirements
- ✅ All components use context-based store access
- ✅ Components throw clear error without StoreProvider
- ✅ Main app wrapped in StoreProvider
- ✅ No functional regressions
- ✅ All features continue to work

### Code Quality
- ✅ Consistent pattern across all components
- ✅ No direct store imports in components
- ✅ Clean, readable code
- ✅ Proper TypeScript types
- ✅ No backward compatibility code

### Testing
- ✅ All tests updated to use StoreProvider
- ✅ All existing tests still pass
- ✅ Components fail fast without StoreProvider
- ✅ No tests for "fallback" behavior

### Build & Quality Checks
```bash
npm run build           # ✅ 0 errors, 0 warnings
npm test                # ✅ All tests pass (unit + integration)
npm run lint            # ✅ No violations
npm run type-check      # ✅ No type errors
```

## Component Update Checklist

For each component:

- [ ] Import `getQueryStore`, `getResultsStore`, etc. from `storeContext`
- [ ] Replace direct imports of global stores
- [ ] Call getter functions: `const queryStore = getQueryStore()`
- [ ] Update all store references to use local const
- [ ] Remove unused imports
- [ ] Test component works with StoreProvider
- [ ] Update component tests to use StoreProvider
- [ ] Update Storybook story (handled in Task 73)

## Dependencies

**Prerequisite Tasks:**
- Task 70: Create StoreProvider Component
- Task 71: Update Store Factory Functions

**Required for:**
- Task 73: Update Storybook Configuration
- Task 75: Verify State Isolation

**Task 74 (Backward Compatibility)**: **DELETED** - Not needed

## Technical Notes

### Why No Fallback?

- **No external users**: Project hasn't been released
- **Simpler code**: One execution path, not two
- **Fail fast**: Clear error messages if StoreProvider is missing
- **No technical debt**: Clean architecture from day one

### What About Global Stores?

**Option 1**: Keep global store exports for potential future use
- Allows standalone component usage if needed later
- No harm in keeping them

**Option 2**: Remove global store exports entirely
- Forces use of StoreProvider everywhere
- Cleaner but less flexible

**Recommendation**: Keep global exports but don't use them in components

## Future Enhancements

- **DevTools**: Visualize which stores a component uses
- **Performance Monitoring**: Track context lookups
- **Type Guards**: Runtime validation of store types

## References

- **Svelte Context API**: https://svelte.dev/docs/svelte/context
- **Svelte Stores**: https://svelte.dev/docs/svelte-store
- **Dependency Injection Pattern**: https://en.wikipedia.org/wiki/Dependency_injection

---

**Previous Task**: [Task 71: Update Store Factory Functions](./71-update-store-factories.md)
**Next Task**: [Task 73: Update Storybook Configuration](./73-update-storybook-config.md)
