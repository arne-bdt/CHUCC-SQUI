# Task: Verify and Update Documentation Accuracy

## Priority: P2 - MEDIUM

## Issue from Report
The report identifies several documentation issues:
- README claims "Multiple Formats" but only JSON works in-app
- Claims "Fully Accessible" but accessibility is incomplete
- Missing installation instructions for npm package
- Prop naming inconsistencies in examples

## Verification Steps
1. Review README.md features list
2. Check each claimed feature against actual implementation
3. Verify example code uses correct prop names
4. Check if package is published to npm
5. Test example code snippets

## Expected Fix (if verified)
1. Update feature claims to reflect current state:
   - "Multiple Formats" → "JSON and SPARQL XML results in-app; CSV/TSV/RDF via download (coming soon)"
   - "Fully Accessible" → "Accessibility-Focused: WCAG 2.1 AA target"

2. Fix prop naming in examples:
   - `defaultPrefixes` → `prefixes`
   - `showEndpointSelector` → `endpoint.hideSelector`

3. Add configuration documentation section
4. Note current limitations honestly
5. Add "Coming soon" markers for planned features

## Files to Review
- `README.md`
- `docs/` directory
- Example code in documentation

## Acceptance Criteria
- All README claims match implementation
- Code examples use correct API
- Limitations are clearly documented
- No misleading feature claims
