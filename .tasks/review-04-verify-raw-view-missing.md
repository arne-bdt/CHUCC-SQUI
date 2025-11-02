# Task: Verify Raw View Implementation Status

## Priority: P1 - HIGH

## Issue from Report
The report claims: "Result viewing is limited to JSON SELECT/ASK results – other formats (CSV, TSV, RDF) are fetched but not rendered, and there is no 'raw' view or download link yet"

**Impact:** CONSTRUCT/DESCRIBE queries cannot display results; CSV/TSV unusable

## Verification Steps
1. Check if `ResultsState` has a `view` field ('table' | 'raw' | 'graph')
2. Look for view toggle UI in results component
3. Test CONSTRUCT query - verify what displays
4. Test CSV format selection - verify rendering
5. Check for `rawData` storage in results store

## Expected Fix (if verified)
1. Implement view toggle (Tabs or SegmentedControl: "Table" / "Raw")
2. Create `RawView.svelte` component to display raw text
3. Store raw response text in `resultsStore` for non-JSON formats
4. Add syntax highlighting for RDF formats (optional)
5. Default to Raw view for CONSTRUCT/DESCRIBE

## Files to Review
- `src/lib/components/Results/` (all components)
- `src/lib/stores/resultsStore.ts`
- `src/lib/localization/en.ts` (check for 'results.raw', 'results.table')

## Acceptance Criteria
- Toggle between Table and Raw views exists
- CONSTRUCT/DESCRIBE results display as formatted text
- CSV/TSV results display in Raw view
- Table view works for SELECT/ASK JSON results
