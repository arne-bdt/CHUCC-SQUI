# Task 87: Fix Component Development Issues

**Status:** PENDING
**Priority:** HIGH
**Estimated Effort:** 5-7 hours
**Dependencies:** None
**Agent Required:** component-dev

## Overview

Fix high-priority component development issues identified in Task 83 comprehensive review to improve code quality, prevent bugs, and standardize patterns across the codebase.

## Issues to Fix

### 1. DataTable Effect Cleanup (HIGH PRIORITY)
**File:** `src/lib/components/Results/DataTable.svelte:89-120`
**Severity:** HIGH - Memory leak risk
**Estimated Effort:** 1 hour

**Issue:** Infinite scroll $effect sets up interval but doesn't clean up on early returns.

**Fix:**
```typescript
// ❌ CURRENT (line 89-120)
$effect(() => {
  if (!enableInfiniteScroll || !onLoadMore) {
    return; // LEAKED interval if set up earlier!
  }
  const interval = setInterval(() => {
    const gridElement = document.querySelector('.wx-grid');
    if (gridElement) {
      clearInterval(interval);
      // Setup scroll listener...
    }
  }, 100);
  // Missing cleanup!
});

// ✅ FIX
$effect(() => {
  if (!enableInfiniteScroll || !onLoadMore) {
    return undefined; // Explicitly no cleanup needed
  }

  const interval = setInterval(() => {
    const gridElement = document.querySelector('.wx-grid');
    if (gridElement) {
      clearInterval(interval);
      setupScrollListener(gridElement);
    }
  }, 100);

  return () => {
    clearInterval(interval);
    if (scrollContainer) {
      scrollContainer.removeEventListener('scroll', handleScroll);
    }
  };
});
```

### 2. QueryTabs Circular Update Risk (HIGH PRIORITY)
**File:** `src/lib/components/Tabs/QueryTabs.svelte:52-62`
**Severity:** HIGH - Potential infinite loop
**Estimated Effort:** 2 hours

**Issue:** Tab switch effect could trigger infinite loop with store updates (no guard flag).

**Fix:**
```typescript
// ❌ CURRENT (no guard flag)
$effect(() => {
  const selectedTab = tabsState.tabs[selectedIndex];
  if (selectedTab && selectedTab.id !== tabsState.activeTabId) {
    tabStore.switchTab(selectedTab.id); // Could trigger subscription effect
  }
});

// ✅ FIX: Add guard flag like SparqlEditor
let isUpdatingFromUser = false;

$effect(() => {
  if (!isUpdatingFromUser) {
    const selectedTab = tabsState.tabs[selectedIndex];
    if (selectedTab && selectedTab.id !== tabsState.activeTabId) {
      isUpdatingFromUser = true;
      tabStore.switchTab(selectedTab.id);
      tick().then(() => { isUpdatingFromUser = false; });
    }
  }
});
```

### 3. RunButton Redundant $effect Blocks (MEDIUM PRIORITY)
**File:** `src/lib/components/Toolbar/RunButton.svelte:36-46`
**Severity:** MEDIUM - Unnecessary reactive overhead
**Estimated Effort:** 30 minutes

**Issue:** Three $effect blocks just to sync store values - unnecessary in Svelte 5.

**Fix:**
```typescript
// ❌ CURRENT (redundant effects)
let queryState = $state($queryStore);
$effect(() => { queryState = $queryStore; });

let resultsState = $state($resultsStore);
$effect(() => { resultsState = $resultsStore; });

let endpoint = $state($defaultEndpoint);
$effect(() => { endpoint = $defaultEndpoint; });

// ✅ FIX: Just use $derived
const queryState = $derived($queryStore);
const resultsState = $derived($resultsStore);
const endpoint = $derived($defaultEndpoint);
```

### 4. Add JSON Parse Error Handling (CRITICAL)
**File:** `src/lib/services/sparqlService.ts:422`
**Severity:** CRITICAL - Application crash risk
**Estimated Effort:** 1 hour

**Issue:** JSON.parse() can throw but has no error handling.

**Fix:**
```typescript
// ❌ CURRENT
if (contentType.includes('application/json') ||
    contentType.includes('application/sparql-results+json')) {
  const parsedData = JSON.parse(rawText) as SparqlJsonResults; // Can throw!
  profiler.markParseComplete();
  return { raw: rawText, data: parsedData };
}

// ✅ FIX
if (contentType.includes('application/json') ||
    contentType.includes('application/sparql-results+json')) {
  try {
    const parsedData = JSON.parse(rawText) as SparqlJsonResults;

    // Validate structure
    if (!parsedData.head || (!parsedData.results && parsedData.boolean === undefined)) {
      throw new Error('Invalid SPARQL JSON Results format');
    }

    profiler.markParseComplete();
    return { raw: rawText, data: parsedData };
  } catch (error) {
    throw new QueryError({
      message: 'Failed to parse SPARQL JSON Results',
      type: 'parse',
      details: error instanceof Error ? error.message : String(error),
      originalError: error instanceof Error ? error : undefined,
    });
  }
}
```

### 5. SPARQL JSON Error Format Support (HIGH PRIORITY)
**File:** `src/lib/services/sparqlService.ts:491-520`
**Severity:** HIGH - Better error messages
**Estimated Effort:** 2 hours

**Issue:** Some endpoints return errors in SPARQL JSON Results format with `error` object.

**Fix:**
```typescript
// ✅ Add to createErrorFromResponse method
private async createErrorFromResponse(response: Response, requestedFormat?: string): Promise<QueryError> {
  const statusText = response.statusText;
  const status = response.status;
  let message = `HTTP ${status}: ${statusText}`;
  let details: string | undefined;
  let type: 'http' | 'sparql' = 'http';

  try {
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('json')) {
      const errorData = await response.json();

      // Check for SPARQL JSON Results error format
      if (errorData.error && errorData.error.message) {
        message = errorData.error.message;
        type = 'sparql';
        details = errorData.error.type || 'unknown-error';
      } else {
        details = errorData.message || JSON.stringify(errorData, null, 2);
      }
    } else {
      const errorText = await response.text();
      if (errorText) {
        details = errorText;
        // Detect SPARQL syntax errors
        if (errorText.toLowerCase().includes('syntax') ||
            errorText.toLowerCase().includes('parse') ||
            errorText.toLowerCase().includes('malformed')) {
          type = 'sparql';
        }
      }
    }
  } catch {
    // Ignore parsing errors
  }

  // ... rest of error categorization
}
```

### 6. Multi-line PREFIX Detection (MEDIUM PRIORITY)
**File:** `src/lib/services/sparqlService.ts:225-228`
**Severity:** MEDIUM - Edge case handling
**Estimated Effort:** 30 minutes

**Issue:** Query type detection fails for multi-line PREFIX declarations.

**Fix:**
```typescript
// ❌ CURRENT (assumes single line)
const withoutPrefixes = normalized.replace(
  /^\s*((?:PREFIX|BASE)\s+\S+\s*<[^>]+>\s*)+/g,
  ''
).trim();

// ✅ FIX (handles multi-line)
const withoutPrefixes = normalized.replace(
  /^\s*((?:PREFIX|BASE)\s+\S+\s*<[^>]+>\s*\n?)+/gm,
  ''
).trim();
```

## Implementation Steps

### Step 1: Fix DataTable Effect Cleanup (1 hour)

1. Open `src/lib/components/Results/DataTable.svelte`
2. Locate the infinite scroll $effect (lines 89-120)
3. Update to return cleanup function in all code paths
4. Test infinite scroll enable/disable toggle
5. Verify no memory leaks

### Step 2: Fix QueryTabs Circular Update (2 hours)

1. Open `src/lib/components/Tabs/QueryTabs.svelte`
2. Add `isUpdatingFromUser` guard flag
3. Wrap tab switch logic with guard check
4. Use `tick()` to clear flag after state update
5. Test tab switching doesn't cause loops
6. Verify two-way binding still works

### Step 3: Simplify RunButton Effects (30 minutes)

1. Open `src/lib/components/Toolbar/RunButton.svelte`
2. Replace three $effect blocks with $derived
3. Update references to use derived values
4. Test query execution still works
5. Verify reactive updates still occur

### Step 4: Add JSON Parse Error Handling (1 hour)

1. Open `src/lib/services/sparqlService.ts`
2. Wrap JSON.parse in try-catch block
3. Add structure validation
4. Throw QueryError with parse type
5. Add unit test for malformed JSON
6. Verify error handling works

### Step 5: Add SPARQL JSON Error Format Support (2 hours)

1. Update `createErrorFromResponse` method
2. Check for `errorData.error.message` pattern
3. Extract error type from response
4. Set `type: 'sparql'` for structured errors
5. Add unit tests for SPARQL JSON error format
6. Test with mock endpoint responses

### Step 6: Fix Multi-line PREFIX Detection (30 minutes)

1. Update `detectQueryType` method
2. Add `\n?` to regex and use `gm` flags
3. Add unit tests for multi-line PREF prefixes
4. Verify detection still works for single-line

### Step 7: Run Tests and Verify (30 minutes)

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Unit tests
npm test

# Build
npm run build

# E2E tests
npm run test:e2e:storybook
```

## Acceptance Criteria

- ✅ DataTable infinite scroll effect has proper cleanup
- ✅ QueryTabs has guard flag to prevent circular updates
- ✅ RunButton uses $derived instead of redundant $effects
- ✅ JSON.parse wrapped in try-catch with validation
- ✅ SPARQL JSON error format detected and handled
- ✅ Multi-line PREFIX declarations handled correctly
- ✅ All unit tests pass
- ✅ All E2E tests pass
- ✅ Build passes with zero errors and warnings
- ✅ Type check passes
- ✅ Lint passes
- ✅ No memory leaks detected
- ✅ No infinite loops in tab switching

## Testing Strategy

### Unit Tests

1. **sparqlService.test.ts:**
   - Add test for malformed JSON response
   - Add test for SPARQL JSON error format
   - Add test for multi-line PREFIX detection

2. **QueryTabs.test.ts** (if exists):
   - Add test for rapid tab switching
   - Verify no infinite loops

### Integration Tests

1. **DataTable.test.ts:**
   - Add test for infinite scroll enable/disable
   - Verify cleanup on unmount

2. **RunButton.test.ts** (if exists):
   - Verify reactive updates still work after change

### Manual Testing

1. **Tab Switching:**
   - Click tabs rapidly
   - Verify no infinite loops or freezes
   - Check browser console for warnings

2. **Infinite Scroll:**
   - Enable infinite scroll
   - Disable infinite scroll
   - Unmount component
   - Check for memory leaks (Chrome DevTools Memory profiler)

3. **Error Handling:**
   - Test with endpoint that returns malformed JSON
   - Test with endpoint that returns SPARQL JSON errors
   - Verify helpful error messages displayed

## Success Criteria

- ✅ All 6 issues fixed with tests
- ✅ No regressions in functionality
- ✅ Improved code quality and maintainability
- ✅ Better error handling for edge cases
- ✅ Memory leaks prevented
- ✅ Circular update risks eliminated

## References

- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/$effect)
- [Svelte 5 Effect Cleanup](https://svelte.dev/docs/svelte/$effect#Cleanup)
- [Task 83 - Comprehensive Review](./83-comprehensive-project-review.md)
- [CLAUDE.md - Svelte 5 Patterns](../.claude/CLAUDE.md#svelte-5-patterns)
