# Task: Verify and Fix SPARQL UPDATE Query Handling

## Status: ✅ COMPLETED

## Priority: P0 - CRITICAL

## Issue from Report
The report claims: "SPARQL 1.2 updates require urgent fixes – currently an INSERT might be sent via GET (violating the protocol and likely failing)"

**Details:**
- UPDATE queries should always use POST with `Content-Type: application/sparql-update`
- `determineMethod()` could return GET for short updates (bug)

## Verification Steps
1. ✅ Create test UPDATE query (INSERT/DELETE)
2. ✅ Run query and check browser network tab
3. ✅ Verify HTTP method (should be POST, not GET)
4. ✅ Verify Content-Type header (should be `application/sparql-update`)
5. ✅ Check `sparqlService.ts` `determineMethod()` logic for UPDATE detection

## Implementation Summary

### Bugs Found and Fixed

1. **Bug: `determineMethod()` ignored query type**
   - **Location**: `src/lib/services/sparqlService.ts:141-162`
   - **Issue**: Only checked URL length, could return GET for short UPDATE queries
   - **Fix**: Now accepts `queryType` parameter and forces POST for all UPDATE operations

2. **Bug: `executePost()` used wrong Content-Type**
   - **Location**: `src/lib/services/sparqlService.ts:250-272`
   - **Issue**: Always used `application/sparql-query` even for UPDATE queries
   - **Fix**: Now uses `application/sparql-update` for UPDATE operations

3. **Enhancement: Improved `detectQueryType()`**
   - **Location**: `src/lib/services/sparqlService.ts:169-192`
   - **Added**: Support for all UPDATE operations (INSERT, DELETE, LOAD, CLEAR, CREATE, DROP, COPY, MOVE, ADD)
   - **Added**: Proper handling of PREFIX/BASE declarations before query operations

### Files Modified
- `src/lib/services/sparqlService.ts` - Fixed UPDATE query handling
- `tests/unit/services/sparqlService.test.ts` - Added 11 comprehensive tests for UPDATE operations

### Test Coverage
Added tests for:
- ✅ INSERT DATA queries (with and without PREFIX)
- ✅ DELETE DATA queries
- ✅ LOAD, CLEAR, CREATE, DROP operations
- ✅ COPY, MOVE, ADD operations
- ✅ Verification that GET is never used for UPDATE queries
- ✅ Content-Type validation for UPDATE operations

## Acceptance Criteria
- ✅ UPDATE queries always use HTTP POST
- ✅ Content-Type is `application/sparql-update` for updates
- ✅ GET is never used for INSERT/DELETE/LOAD operations
- ✅ Build and tests pass (724/724 tests passing)

## Verification Results
- ✅ Build successful (0 errors, 0 warnings)
- ✅ All 724 tests passing
- ✅ Type checking passed
- ✅ SPARQL 1.2 Protocol compliant
