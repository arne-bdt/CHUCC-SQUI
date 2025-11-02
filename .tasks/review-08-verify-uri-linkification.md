# Task: Verify URI Linkification and Abbreviation

## Priority: P2 - MEDIUM

## Issue from Report
The report claims: "URIs in results are shown as full strings, which is hard to read and not interactive. Cannot be clicked."

**Suggested features:**
- URIs should be abbreviated using prefixes (e.g., `ex:resource1`)
- URIs should be clickable links opening in new tab
- Should use `rel="noopener noreferrer"`

## Verification Steps
1. Run query returning URIs
2. Check if URIs display as full strings or abbreviated
3. Check if URIs are clickable
4. Review `getCellDisplayValue()` in DataTable
5. Check if `prefixService.abbreviateIRI()` exists but is unused

## Expected Fix (if verified)
1. Use `prefixService.abbreviateIRI()` for display
2. Make URIs clickable:
   ```svelte
   {#if cell.type === 'uri'}
     <a href={cell.value} target="_blank" rel="noopener noreferrer">
       {abbreviatedValue}
     </a>
   {/if}
   ```
3. Filter dangerous URI schemes (only allow http/https/ftp)
4. Consider using grid's custom cell renderer if available

## Files to Review
- `src/lib/components/Results/DataTable.svelte`
- `src/lib/utils/resultsParser.ts` (getCellDisplayValue)
- `src/lib/services/prefixService.ts`

## Acceptance Criteria
- URIs display abbreviated (prefix:localPart)
- Clicking URI opens resource in new tab
- Non-HTTP URIs don't create dangerous links
- Full URI available on hover/tooltip
