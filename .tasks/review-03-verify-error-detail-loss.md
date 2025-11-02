# Task: Verify Error Detail Preservation

## Priority: P1 - HIGH

## Issue from Report
The report claims: "QueryError vs string: In resultsStore, setError expects a string. When sparqlService throws a rich QueryError (with type, status, details), resultsStore reduces it to just the message string. This loses error details."

**Impact:** Users don't see helpful error information like syntax error line numbers

## Verification Steps
1. Review `resultsStore.ts` `setError()` signature
2. Check how errors are handled in `executeQuery()` catch block
3. Verify `ErrorNotification.svelte` - can it handle QueryError objects?
4. Trigger a syntax error and check if details are shown in UI
5. Trigger a CORS error and verify detail display

## Expected Fix (if verified)
1. Change `resultsStore.setError()` to accept `string | QueryError`
2. Update `ResultsState.error` type to `string | QueryError | null`
3. Modify catch blocks to pass full QueryError object
4. Ensure `ErrorNotification` handles both string and QueryError

## Files to Review
- `src/lib/stores/resultsStore.ts`
- `src/lib/components/Results/ErrorNotification.svelte`
- `src/lib/types/sparql.ts` (QueryError definition)

## Acceptance Criteria
- Error notifications show full details (status, message, details)
- Syntax errors display server messages
- CORS errors show helpful suggestions
- No regression in error display
