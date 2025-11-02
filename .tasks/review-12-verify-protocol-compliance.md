# Task: Verify SPARQL 1.2 Protocol Compliance

## Priority: P1 - HIGH

## Issue from Report
Multiple protocol compliance issues identified:
- Missing dataset URI parameters (default-graph-uri, named-graph-uri)
- No version parameter in requests
- URL-encoded POST not implemented
- UPDATE using-graph-uri not supported

## Verification Steps
1. Review Accept header generation
2. Check if dataset parameters can be specified
3. Verify version parameter usage
4. Test UPDATE operations with real endpoint
5. Check POST content-type variations

## Expected Fix (if verified - prioritize based on verification)

**High Priority:**
- Ensure UPDATE queries work correctly (covered in review-02)
- Verify Accept headers are spec-compliant

**Medium Priority:**
- Add UI for specifying default-graph-uri/named-graph-uri
- Add version=1.2 parameter when appropriate

**Low Priority:**
- URL-encoded POST (most endpoints accept direct POST)
- using-graph-uri for updates (less common)

## Files to Review
- `src/lib/services/sparqlService.ts`
- W3C SPARQL 1.2 Protocol specification
- `src/lib/types/config.ts` (for dataset configuration)

## Acceptance Criteria
- Core protocol requirements met
- UPDATE operations work on compliant endpoints
- Accept headers follow spec
- Document any intentional non-compliance
