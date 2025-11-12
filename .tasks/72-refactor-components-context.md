# Task 72: Refactor Components to Use Context-Based Stores

## Overview

Update all components to access stores via Svelte context instead of direct imports. This enables state isolation while maintaining backward compatibility through fallback to global stores.

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

### New Pattern (Context with Fallback)

```typescript
// ✅ NEW: Context with fallback to global
import { getQueryStore } from '../../stores/storeContext';

const queryStore = getQueryStore();
let queryState = $state($queryStore);
```

**Benefits:**
- Uses context store if available (StoreProvider)
- Falls back to global store if no context (backward compatible)
- State isolation in Storybook and tabs
- No breaking changes to existing code

## Requirements

### 1. Components to Update

Based on previous analysis, these components access stores:

#### High Priority (Direct Store Usage)
- ✅ `src/lib/components/Editor/SparqlEditor.svelte` - queryStore, resultsStore, endpointStore
- ✅ `src/lib/components/Toolbar/RunButton.svelte` - queryStore, resultsStore, endpointStore
- ✅ `src/lib/components/Results/ResultsPlaceholder.svelte` - resultsStore
- ✅ `src/lib/components/Query/ResultFormatSelector.svelte` - queryStore
- ✅ `src/SparqlQueryUI.svelte` - Multiple stores

#### Already Using Context Pattern
- `src/lib/components/Tabs/QueryTabs.svelte` - Already uses context for tabStore ✅

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

  // Get stores from context (or fallback to global)
  const queryStore = getQueryStore();
  const resultsStore = getResultsStore();
  const endpointStore = getEndpointStore();

  // Use stores as before (no change to reactivity)
  let queryState = $state($queryStore);
  let resultsState = $state($resultsStore);
  let endpoint = $state($endpointStore);
</script>
```

### 3. Example: SparqlEditor.svelte

**Current (lines 31-34):**
```typescript
import { queryStore } from '../../stores';
import { resultsStore } from '../../stores/resultsStore';
import { defaultEndpoint } from '../../stores/endpointStore';
import { serviceDescriptionStore } from '../../stores/serviceDescriptionStore';
```

**Updated:**
```typescript
import {
  getQueryStore,
  getResultsStore,
  getEndpointStore,
  getServiceDescriptionStore
} from '../../stores/storeContext';

// Get stores from context (with fallback to global)
const queryStore = getQueryStore();
const resultsStore = getResultsStore();
const defaultEndpoint = getEndpointStore();
const serviceDescriptionStore = getServiceDescriptionStore();
```

### 4. Example: RunButton.svelte

**Current (lines 9-11):**
```typescript
import { queryStore } from '../../stores/queryStore';
import { resultsStore } from '../../stores/resultsStore';
import { defaultEndpoint } from '../../stores/endpointStore';
```

**Updated:**
```typescript
import { getQueryStore, getResultsStore, getEndpointStore } from '../../stores/storeContext';

// Get stores from context
const queryStore = getQueryStore();
const resultsStore = getResultsStore();
const defaultEndpoint = getEndpointStore();
```

### 5. Services Integration

Some services also access stores. Update them to accept store instances as parameters:

**Before:**
```typescript
// src/lib/services/queryExecutionService.ts
import { queryStore } from '../stores/queryStore';
import { resultsStore } from '../stores/resultsStore';

export const queryExecutionService = {
  async executeQuery(params) {
    const query = get(queryStore).text; // ❌ Uses global store
    resultsStore.setLoading(true);
    // ...
  }
};
```

**After:**
```typescript
// src/lib/services/queryExecutionService.ts

/**
 * Create query execution service instance
 *
 * @param stores - Store instances to use
 */
export function createQueryExecutionService(stores: {
  queryStore: ReturnType<typeof createQueryStore>;
  resultsStore: ReturnType<typeof createResultsStore>;
}) {
  return {
    async executeQuery(params) {
      const query = get(stores.queryStore).text; // ✅ Uses provided store
      stores.resultsStore.setLoading(true);
      // ...
    }
  };
}

// Global instance for backward compatibility
export const queryExecutionService = createQueryExecutionService({
  queryStore,
  resultsStore,
});
```

## Implementation Steps

### Step 1: Update SparqlEditor.svelte
1. Replace direct store imports with `getQueryStore()`, etc.
2. Update all store references
3. Test editor functionality
4. Verify CodeMirror integration still works

### Step 2: Update RunButton.svelte
1. Replace direct store imports
2. Update derived state computations
3. Test button enabled/disabled logic
4. Verify query execution works

### Step 3: Update ResultsPlaceholder.svelte
1. Replace `resultsStore` import
2. Test loading state display
3. Test empty state display
4. Test error state display

### Step 4: Update ResultFormatSelector.svelte
1. Replace `queryStore` import
2. Test format selection logic
3. Verify query type detection

### Step 5: Update SparqlQueryUI.svelte
1. Replace all store imports
2. Update component integration
3. Test full application workflow

### Step 6: Update Services (Optional Enhancement)
1. Refactor services to accept store instances
2. Create factory functions for services
3. Maintain global service instances for backward compatibility

### Step 7: Integration Testing
1. Test components in isolation (no StoreProvider)
2. Test components wrapped in StoreProvider
3. Test multiple StoreProvider instances
4. Test Storybook stories

## Acceptance Criteria

### Functional Requirements
- ✅ All components use context-based store access
- ✅ Components work with StoreProvider (context stores)
- ✅ Components work without StoreProvider (global fallback)
- ✅ No functional regressions
- ✅ All features continue to work as before

### Code Quality
- ✅ Consistent pattern across all components
- ✅ No direct store imports (except in tests)
- ✅ Clean, readable code
- ✅ Proper TypeScript types

### Testing
- ✅ All existing tests still pass
- ✅ New tests for context-based access
- ✅ Test fallback behavior
- ✅ Test isolation with multiple instances

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
- [ ] Test component in isolation
- [ ] Test component with StoreProvider
- [ ] Update component tests if needed
- [ ] Update Storybook story if needed

## Example Test

```typescript
// tests/integration/RunButton.test.ts

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import RunButton from '$lib/components/Toolbar/RunButton.svelte';
import StoreProvider from '$lib/components/StoreProvider.svelte';

describe('RunButton with context stores', () => {
  it('works with StoreProvider context', async () => {
    render(StoreProvider, {
      props: {
        initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        initialEndpoint: 'http://example.org/sparql',
        children: RunButton,
      },
    });

    const button = screen.getByRole('button', { name: /run/i });
    expect(button).not.toBeDisabled(); // Has query and endpoint
  });

  it('falls back to global stores without StoreProvider', () => {
    // Set global stores
    queryStore.setText('SELECT * WHERE { ?s ?p ?o }');
    defaultEndpoint.set('http://example.org/sparql');

    render(RunButton);

    const button = screen.getByRole('button', { name: /run/i });
    expect(button).not.toBeDisabled();
  });
});
```

## Dependencies

**Prerequisite Tasks:**
- Task 70: Create StoreProvider Component
- Task 71: Update Store Factory Functions

**Required for:**
- Task 73: Update Storybook Configuration
- Task 74: Add Backward Compatibility Fallbacks

## Technical Notes

### Why This Pattern Works

1. **Context Check**: `hasContext()` checks if StoreProvider is present
2. **Automatic Fallback**: Falls back to global store if no context
3. **No Breaking Changes**: Existing code works without modification
4. **Incremental Migration**: Can update components one at a time

### Performance Considerations

- **Minimal Overhead**: `getContext()` is a simple lookup
- **No Additional Subscriptions**: Same reactivity as before
- **One-Time Cost**: Context lookup happens once during component init

### Migration Strategy

**Phase 1**: Update core components (Editor, RunButton)
**Phase 2**: Update secondary components (Results, Toolbar)
**Phase 3**: Update remaining components
**Phase 4**: Update services (optional)

Each phase can be tested independently.

## Future Enhancements

- **Strict Mode**: Option to require StoreProvider (no fallback)
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
