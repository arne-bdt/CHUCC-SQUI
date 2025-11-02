# Task: Verify and Fix Query Execution (Non-functional query execution)

## Priority: P0 - CRITICAL

## Issue from Report
The report claims: "The current Run Query logic still uses a stubbed service (returning mock results) instead of performing real HTTP requests."

**Risk Level:** Top risk #1 - "As shipped, the UI does not actually query endpoints – a major blocker for users"

## Verification Steps
1. Review `RunButton.svelte` to see which service it calls
2. Check if `QueryExecutionService` is a stub/mock
3. Test with a real endpoint (DBpedia, Wikidata) and verify if real HTTP requests are made
4. Check browser network tab for actual SPARQL endpoint requests

## Expected Fix (if verified)
1. Remove `QueryExecutionService` stub
2. Route execution through `resultsStore.executeQuery()` which uses real `sparqlService`
3. Delete or deprecate `queryExecutionService.ts`
4. Test against multiple real endpoints

## Files to Review
- `src/lib/components/Toolbar/RunButton.svelte`
- `src/lib/services/queryExecutionService.ts`
- `src/lib/services/sparqlService.ts`
- `src/lib/stores/resultsStore.ts`

## Acceptance Criteria
- Query execution sends real HTTP requests to specified endpoint
- No mock/hardcoded data is returned
- Results from actual endpoints display correctly
- All unit tests pass
