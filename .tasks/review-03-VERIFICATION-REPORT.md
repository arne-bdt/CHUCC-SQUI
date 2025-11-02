# Error Detail Loss Verification Report

## Status: ✅ ISSUE CONFIRMED

The report's claim is **100% accurate**. Rich QueryError objects with valuable debugging information are being reduced to plain strings, losing critical details that users need to troubleshoot their queries.

---

## Evidence

### 1. Rich QueryError Objects are Created by sparqlService

**Location:** `src/lib/services/sparqlService.ts`

The service creates comprehensive error objects with:

```typescript
// HTTP/SPARQL errors (lines 318-377)
{
  message: 'Bad Request: Invalid SPARQL query',
  type: 'sparql',
  status: 400,
  details: 'Syntax error at line 3: Expected "WHERE" but found "WHER"'
}

// CORS errors (lines 402-411)
{
  message: 'CORS Error: Cross-origin request blocked',
  type: 'cors',
  details: 'The SPARQL endpoint does not allow cross-origin requests from this domain. Contact the endpoint administrator to enable CORS.',
  originalError: <Error object>
}

// Timeout errors (lines 387-391)
{
  message: 'Query timeout or cancelled',
  type: 'timeout',
  details: 'The query took too long to execute or was cancelled by the user.'
}
```

### 2. resultsStore Only Accepts Strings

**Location:** `src/lib/stores/resultsStore.ts`

```typescript
// Line 20: Method signature
setError: (_error: string) => void;

// Lines 86-92: Implementation
setError: (error: string): void => {
  update((state) => ({
    ...state,
    error,  // Only stores string
    loading: false,
  }));
}
```

### 3. executeQuery Catch Block Extracts Only Message

**Location:** `src/lib/stores/resultsStore.ts:175-199`

```typescript
} catch (error) {
  let errorValue: string;
  if (error && typeof error === 'object' && 'message' in error) {
    const queryError = error as QueryError;
    errorValue = queryError.message;  // ❌ Only extracts message

    // Comment acknowledges the issue but doesn't fix it:
    // "Store the full QueryError for detailed display"
    // "For now, we store just the message..."

    update((state) => ({
      ...state,
      loading: false,
      error: errorValue,  // ❌ Stores only string
    }));
  }
}
```

### 4. ResultsState Type Only Supports String

**Location:** `src/lib/types/sparql.ts:97`

```typescript
export interface ResultsState {
  // ... other fields
  error: string | null;  // ❌ Should be: string | QueryError | null
}
```

### 5. ErrorNotification is Already Ready! ✅

**Location:** `src/lib/components/Results/ErrorNotification.svelte`

**Good news:** The UI component ALREADY handles both string and QueryError objects correctly!

```typescript
// Lines 14-18: Props accept both types
interface Props {
  error: QueryError | string | null;  // ✅ Already correct!
  onClose?: () => void;
}

// Lines 23-85: Handles both types
const errorData = $derived.by(() => {
  if (!error) return null;

  if (typeof error === 'string') {
    return { title: 'Query Error', message: error, ... };
  }

  // Categorizes QueryError by type
  if (error.type === 'cors') { ... }
  if (error.status === 400) { ... }
  if (error.details?.includes('syntax')) { ... }

  return {
    title,
    message: error.message,
    details: error.details,  // ✅ Shows details!
    kind,
  };
});

// Lines 105-110: Collapsible details section
{#if errorData.details}
  <details class="error-details">
    <summary>Error Details</summary>
    <pre>{errorData.details}</pre>  // ✅ Would show syntax errors!
  </details>
{/if}
```

---

## Impact Demonstration

### What Users Currently See:
```
❌ Query Error
Bad Request: Invalid SPARQL query
```

### What Users SHOULD See:
```
✅ SPARQL Syntax Error (400)
Bad Request: Invalid SPARQL query

▼ Error Details
Syntax error at line 3: Expected "WHERE" but found "WHER"
```

### Lost Information:
- ❌ HTTP status codes (400, 500, etc.)
- ❌ Error type categorization (sparql, cors, network, timeout)
- ❌ Detailed server error messages (syntax error line numbers!)
- ❌ CORS troubleshooting guidance
- ❌ Original error objects for debugging

---

## Required Changes

### 1. Update ResultsState Type

**File:** `src/lib/types/sparql.ts`

```typescript
export interface ResultsState {
  // ... other fields
  error: string | QueryError | null;  // Changed from: string | null
}
```

### 2. Update resultsStore.setError()

**File:** `src/lib/stores/resultsStore.ts`

```typescript
// Line 20: Update signature
setError: (_error: string | QueryError) => void;

// Lines 86-92: Update implementation
setError: (error: string | QueryError): void => {
  update((state) => ({
    ...state,
    error,  // Store full object
    loading: false,
  }));
}
```

### 3. Update executeQuery Catch Block

**File:** `src/lib/stores/resultsStore.ts:175-199`

```typescript
} catch (error) {
  // Preserve QueryError structure
  let errorValue: string | QueryError;

  if (error && typeof error === 'object' && 'message' in error) {
    errorValue = error as QueryError;  // ✅ Store full object
  } else {
    errorValue = 'An unknown error occurred';
  }

  update((state) => ({
    ...state,
    loading: false,
    error: errorValue,  // ✅ Stores rich object
  }));
}
```

### 4. No Changes Needed to ErrorNotification ✅

The component is already correctly implemented!

---

## Testing Requirements

After implementing the fix, verify:

1. **Syntax Error:** Trigger a SPARQL syntax error
   - Should show "SPARQL Syntax Error" title
   - Should display server error message with line numbers in details

2. **CORS Error:** Query an endpoint without CORS headers
   - Should show "CORS Error" title
   - Should display helpful CORS troubleshooting message in details

3. **HTTP Error:** Query non-existent endpoint
   - Should show "Client Error (404)" or similar
   - Should display status code

4. **Network Error:** Query unreachable endpoint
   - Should show "Network Error" title
   - Should suggest checking URL and connectivity

5. **Timeout:** Trigger a timeout
   - Should show "Request Timeout" title
   - Should explain timeout in details

6. **Backward Compatibility:** String errors still work
   - Should handle plain string errors (for edge cases)

---

## Acceptance Criteria

- ✅ Error notifications show full QueryError details
- ✅ Syntax errors display server messages in collapsible section
- ✅ CORS errors show helpful troubleshooting suggestions
- ✅ HTTP status codes are visible in error titles
- ✅ No regression in error display for any error type
- ✅ Type safety maintained throughout
- ✅ All existing tests pass
- ✅ New tests added for QueryError handling

---

## Conclusion

The issue is **verified and confirmed**. The fix is straightforward:
- Change 3 type signatures
- Update 1 method implementation
- Update 1 catch block
- No changes to UI component (already ready!)

**Priority: P1 - HIGH** ✅

Users are currently missing critical debugging information that the system already collects but then throws away. This significantly impacts the developer experience when troubleshooting SPARQL queries.
