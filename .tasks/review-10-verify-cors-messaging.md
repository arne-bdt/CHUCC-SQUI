# Task: Verify CORS Error Messaging

## Priority: P2 - MEDIUM

## Issue from Report
The report claims: "Many public endpoints lack CORS; the UI will silently fail on those. Users may perceive this as 'broken' unless clear error messaging or proxy workarounds are provided (currently only a console warning and a generic message)"

**Risk Level:** Top risk #5 - "Security and CORS"

## Verification Steps
1. Test with CORS-restricted endpoint
2. Check error message shown to user
3. Verify if error type is detected as 'cors'
4. Check if helpful suggestions are provided
5. Review error notification content

## Expected Fix (if verified)
1. Ensure CORS errors are detected and categorized
2. Enhance error message with actionable advice:
   - "Enable CORS on your endpoint"
   - "Use a proxy service"
   - Link to documentation
3. Make error prominent (not just console warning)
4. Consider adding proxy URL configuration option

## Files to Review
- `src/lib/services/sparqlService.ts` (handleError, CORS detection)
- `src/lib/components/Results/ErrorNotification.svelte`
- `src/lib/localization/en.ts` (error messages)

## Acceptance Criteria
- CORS errors show clear, user-friendly message
- Error suggests concrete solutions
- Message is visible in UI (not just console)
- Different from generic network errors
