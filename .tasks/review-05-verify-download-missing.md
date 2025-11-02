# Task: Verify Download Functionality

## Priority: P2 - MEDIUM

## Issue from Report
The report claims: "There is no 'raw' view or download link yet (despite claims of multiple format support)"

**Impact:** Users cannot save query results to files

## Verification Steps
1. Run a query and check for download button in UI
2. Review toolbar components for download functionality
3. Check if download code exists but is disabled/hidden
4. Test if any download works (even basic JSON)

## Expected Fix (if verified)
1. Add Download button to toolbar/results area
2. Implement basic JSON download first:
   ```typescript
   const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   // trigger download
   ```
3. Extend to support CSV, TSV, RDF formats
4. Disable button when no results available

## Files to Review
- `src/lib/components/Toolbar/Toolbar.svelte`
- `src/lib/components/Results/` (results header area)
- `src/lib/stores/resultsStore.ts`

## Acceptance Criteria
- Download button appears after successful query
- JSON download works immediately
- Downloaded file has correct MIME type and extension
- Button is disabled when no results
