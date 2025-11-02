# Task: Verify and Fix SPARQL UPDATE Query Handling

## Priority: P0 - CRITICAL

## Issue from Report
The report claims: "SPARQL 1.2 updates require urgent fixes – currently an INSERT might be sent via GET (violating the protocol and likely failing)"

**Details:**
- UPDATE queries should always use POST with `Content-Type: application/sparql-update`
- `determineMethod()` could return GET for short updates (bug)

## Verification Steps
1. Create test UPDATE query (INSERT/DELETE)
2. Run query and check browser network tab
3. Verify HTTP method (should be POST, not GET)
4. Verify Content-Type header (should be `application/sparql-update`)
5. Check `sparqlService.ts` `determineMethod()` logic for UPDATE detection

## Expected Fix (if verified)
1. Modify `determineMethod()` to force POST for UPDATE queries
2. Update `executePost()` to use correct Content-Type for updates:
   ```typescript
   const contentType = queryType === 'UPDATE'
     ? 'application/sparql-update'
     : 'application/sparql-query';
   ```
3. Add validation to prevent GET for UPDATE operations

## Files to Review
- `src/lib/services/sparqlService.ts` (lines around determineMethod, executePost)
- `src/lib/utils/queryDetector.ts` (if exists)

## Acceptance Criteria
- UPDATE queries always use HTTP POST
- Content-Type is `application/sparql-update` for updates
- GET is never used for INSERT/DELETE/LOAD operations
- Build and tests pass
