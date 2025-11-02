# Task: Verify Result Size Limits and Memory Safety

## Priority: P1 - HIGH

## Issue from Report
The report claims: "Without result size limits or chunking, a careless query might try to load millions of rows, risking browser crashes (the code's maxRows limit is not yet enforced)"

**Risk Level:** Top risk #3 - "Unbounded memory usage"

## Verification Steps
1. Check if `limits.maxRows` from config is actually enforced
2. Test with large result set (simulate 100k+ rows)
3. Monitor browser memory usage
4. Check if warning appears for large results
5. Review if truncation happens at parsing or rendering

## Expected Fix (if verified)
1. Enforce maxRows limit in results parser:
   ```typescript
   if (bindings.length > maxRows) {
     // show warning
     // truncate to maxRows
   }
   ```
2. Add warning notification for large results
3. Provide download option for full results
4. Consider streaming/chunking for future enhancement

## Files to Review
- `src/lib/utils/resultsParser.ts`
- `src/lib/stores/resultsStore.ts`
- `src/lib/types/config.ts` (limits configuration)

## Acceptance Criteria
- Results beyond maxRows trigger warning
- UI only renders up to maxRows
- Warning suggests downloading full results
- Browser doesn't crash/freeze on large datasets
- Default maxRows is reasonable (10k-50k)
