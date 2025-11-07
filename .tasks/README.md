# SQUI Implementation Tasks

## Overview

This directory contains documentation for the SPARQL Query UI Web Component (SQUI) implementation tasks.

**Status:**
- ✅ **Tasks 51-56**: SPARQL Service Description Support - COMPLETED
- ✅ **Task 60**: Remove CDN Dependencies - COMPLETED
- 📝 **Tasks 61-62**: Self-Contained/Offline Support - PENDING
- 📝 **Tasks 63-68**: Carbon Design System Compliance - PENDING

## Task Index

### Carbon Design System Compliance (Tasks 63-68) 🆕

These tasks ensure CHUCC-SQUI fully complies with the IBM Carbon Design System, implementing the 2x Grid, standardized spacing (8px rhythm), and typography scale for a consistent, professional, and accessible UI.

- **[Task 63: Add Carbon Grid System to Main Layout](./63-add-carbon-grid-system.md)** 📝 **HIGH PRIORITY**
  - Implement Carbon's 2x Grid (16/8/4 responsive columns)
  - Add max-width container (1584px)
  - Consistent gutters and responsive breakpoints
  - **Start here** for Carbon compliance

- **[Task 64: Standardize Spacing in Capabilities Components](./64-standardize-spacing-capabilities.md)** 📝 **MEDIUM PRIORITY**
  - Replace hardcoded spacing with Carbon tokens
  - Apply 8px rhythm to all padding/margin/gap
  - 6 components: DatasetInfo, EndpointCapabilities, ExtensionList, LanguageSupport, FeatureList, FormatList
  - **Can run parallel** with Task 63

- **[Task 65: Standardize Spacing in Functions Components](./65-standardize-spacing-functions.md)** 📝 **MEDIUM PRIORITY**
  - Replace hardcoded spacing with Carbon tokens
  - 2 components: FunctionLibrary, FunctionDetails
  - Consistent card padding and gaps
  - **Can run parallel** with Tasks 63, 64

- **[Task 66: Standardize Spacing in Remaining Components](./66-standardize-spacing-remaining.md)** 📝 **MEDIUM PRIORITY**
  - Complete spacing standardization
  - 4 components: PerformancePanel, QueryWarningDialog, QueryTabs, SplitPane
  - Improve touch targets (tab close button)
  - **Can run parallel** with Tasks 63-65

- **[Task 67: Apply Carbon Typography Scale](./67-apply-carbon-typography.md)** 📝 **MEDIUM PRIORITY**
  - Replace hardcoded font-size with Carbon type tokens
  - Standardize headings, body text, labels, code
  - Ensure consistent hierarchy and readability
  - **Depends on**: Tasks 64-66 (spacing should be complete first)

- **[Task 68: Verify Carbon Design System Compliance](./68-verify-carbon-compliance.md)** 📝 **HIGH PRIORITY**
  - Comprehensive verification of Tasks 63-67
  - Automated testing (build, lint, unit, E2E)
  - Visual inspection checklist
  - Accessibility verification (WCAG AA)
  - **Depends on**: Tasks 63-67 (all previous tasks)

### Self-Contained & Offline Support (Tasks 60-62) 🆕

These tasks ensure CHUCC-SQUI can operate in isolated environments without internet access, meeting security and deployment requirements for air-gapped systems.

- **[Task 60: Remove CDN Dependencies](./60-remove-cdn-dependencies.md)** ✅ **COMPLETED**
  - Bundle Carbon CSS locally (no unpkg.com CDN)
  - Update standalone build script
  - Font override for offline operation
  - E2E tests to verify no external requests

- **[Task 61: Add Configuration to Disable External Prefix Lookup](./61-add-offline-mode-config.md)** 📝 **MEDIUM PRIORITY**
  - Add `enablePrefixLookup` config option to PrefixConfig
  - Disable prefix.cc API calls for air-gapped environments
  - Clear, specific naming (not "offline mode")
  - **Depends on**: Task 60

- **[Task 62: Audit External Dependencies](./62-audit-external-dependencies.md)** 📝 **LOW PRIORITY**
  - Security documentation
  - Build checks for CDN usage
  - Deployment guidelines
  - **Depends on**: Task 60, 61

### SPARQL Service Description Support (Tasks 51-56)

These tasks implement [W3C SPARQL 1.1 Service Description](https://www.w3.org/TR/sparql11-service-description/) support, enabling intelligent query assistance based on endpoint capabilities.

#### Core Infrastructure

- **[Task 51: Service Description Core](./51-sparql-service-description-core.md)** ✅ **COMPLETED**
  - Fetch, parse, and cache service descriptions
  - RDF parsing (Turtle, RDF/XML, JSON-LD)
  - Type definitions and Svelte store integration
  - **Start here** for service description features

#### Query Intelligence

- **[Task 52: Graph Name Auto-completion](./52-graph-name-autocompletion.md)** ✅ **COMPLETED**
  - Auto-complete `FROM` and `FROM NAMED` clauses
  - Show graph metadata (triple count, entailment regime)
  - CodeMirror integration with Carbon styling
  - **Depends on**: Task 51

- **[Task 54: Query Validation](./54-query-validation-capabilities.md)** ✅ **COMPLETED**
  - Validate queries against endpoint capabilities
  - Warn about unsupported features (SPARQL 1.1, SERVICE, etc.)
  - CodeMirror linter with inline diagnostics
  - **Depends on**: Task 51

#### UI Components

- **[Task 53: Feature Detection & Capabilities Display](./53-feature-detection-capabilities.md)** ✅ **COMPLETED**
  - Display endpoint capabilities in sidebar
  - Show supported languages, features, formats
  - Visual indicators for capability status
  - **Depends on**: Task 51

- **[Task 55: Extension Function Discovery](./55-extension-function-discovery.md)** ✅ **COMPLETED**
  - Function library panel with search
  - Auto-completion for custom functions
  - Hover tooltips with function signatures
  - **Depends on**: Task 51

- **[Task 56: Result Format Negotiation](./56-result-format-negotiation.md)** ✅ **COMPLETED**
  - Smart format selection based on supported formats
  - Automatic fallback on 406 responses
  - Format filtering by query type
  - **Depends on**: Task 51

## Completed Implementation

**SPARQL Service Description Support (Tasks 51-56):**

```
✅ Task 51 (Core) → Task 52 (Graphs) → Task 53 (UI) → Task 54 (Validation) → Task 55 (Functions) → Task 56 (Formats)
```

**Status Summary:**
- ✅ **Task 51**: Service Description Core - Fully implemented with RDF parsing and caching
- ✅ **Task 52**: Graph Name Auto-completion - CodeMirror integration with metadata display
- ✅ **Task 53**: Feature Detection & Capabilities Display - Sidebar with visual indicators
- ✅ **Task 54**: Query Validation - Inline diagnostics with linter integration
- ✅ **Task 55**: Extension Function Discovery - Function library panel with search and auto-completion
- ✅ **Task 56**: Result Format Negotiation - Smart format selection with automatic fallback

All features passed quality checks including build, unit tests, integration tests, Storybook stories, and E2E tests.

**Self-Contained/Offline Support (Task 60):**

- ✅ **Task 60**: Remove CDN Dependencies - COMPLETED
  - Removed Carbon CSS CDN dependency (unpkg.com)
  - Bundled all 5 Carbon theme files locally
  - Created font-override.css to eliminate IBM Plex font CDN requests
  - Updated standalone build script with recursive directory copying
  - Added comprehensive E2E test suite (6 tests) to verify offline capability
  - All tests passing: Unit (1,098), E2E Standalone (6)
  - **Result**: Standalone build now works 100% offline with zero external network requests

## Implemented Features

All tasks followed a comprehensive template including:

- **Overview**: High-level feature description
- **Motivation**: Business and technical rationale
- **Requirements**: Detailed specifications with code examples
- **Implementation Steps**: Step-by-step implementation guide
- **Acceptance Criteria**: Clear definition of "done"
- **Dependencies**: Task prerequisites
- **Future Enhancements**: Ideas for follow-up work
- **References**: W3C specifications and documentation links

## Key Benefits

### For Users
- ✅ **Auto-complete graph names** - No guessing available graphs
- ✅ **See endpoint capabilities** - Know what's supported before querying
- ✅ **Get early warnings** - Catch compatibility issues before execution
- ✅ **Discover custom functions** - Learn about available extensions
- ✅ **Write compatible queries** - Avoid unsupported features

### For Developers
- ✅ **Standards-compliant** - Follows W3C SPARQL 1.1 Service Description
- ✅ **Well-tested** - Unit, integration, and E2E test requirements
- ✅ **Type-safe** - Full TypeScript coverage
- ✅ **Modular** - Clean separation of concerns
- ✅ **Extensible** - Easy to add new capabilities

## Example User Flows

### Flow 1: Graph Auto-completion
```
1. User types: SELECT * FROM NAMED <|>
2. SQUI shows: 42 available named graphs with metadata
3. User selects: http://example.org/products (1M triples)
4. Query completes: SELECT * FROM NAMED <http://example.org/products>
```

### Flow 2: Feature Validation
```
1. User writes: SERVICE <http://dbpedia.org/sparql> { ... }
2. SQUI warns: "Endpoint does not support federated queries (SERVICE)"
3. User removes SERVICE clause or switches endpoint
4. Query executes successfully
```

### Flow 3: Function Discovery
```
1. User opens "Extension Functions" panel
2. Sees: geo:distance, text:query, math:sqrt
3. Clicks "Details" on geo:distance
4. Sees: Parameters, return type, examples
5. Clicks "Insert" → Function added to query at cursor
```

## Testing Requirements

Every task must include:

- ✅ **Unit Tests**: Services, utilities, pure functions
- ✅ **Integration Tests**: Component rendering and interactions
- ✅ **Storybook Stories**: Visual documentation for UI components
- ✅ **E2E Tests**: Critical user workflows (when applicable)

See `.claude/CLAUDE.md` for detailed testing guidelines.

## Quality Standards

All tasks must meet:

- ✅ **TypeScript**: Strict mode, no `any` types
- ✅ **Svelte 5**: Use runes (`$state`, `$derived`, `$effect`)
- ✅ **Carbon Design**: Use Svelte Carbon components
- ✅ **Build**: Zero errors and warnings
- ✅ **Tests**: 100% passing (unit + integration + E2E)
- ✅ **Accessibility**: WCAG 2.1 AA compliance

## License Compatibility

When adding dependencies:
- ✅ **Compatible**: Apache 2.0, MIT, BSD, ISC
- ⚠️ **Check carefully**: LGPL
- ❌ **Incompatible**: GPL, AGPL

This project uses **Apache License 2.0**.

## Current Focus: Carbon Design System Compliance (Tasks 63-68)

CHUCC-SQUI must fully comply with the IBM Carbon Design System to ensure:

- **Consistent UX** - Professional, enterprise-grade interface
- **Accessibility** - WCAG 2.1 AA compliance with proper contrast and spacing
- **Maintainability** - Design tokens prevent arbitrary styling
- **Responsive Design** - Grid system adapts to all screen sizes
- **Theme Support** - Dark mode (g90, g100) works correctly

**Implementation Order:**
1. **Task 63** (HIGH): Add Carbon Grid System - Foundation for responsive layout
2. **Tasks 64-66** (MEDIUM): Standardize Spacing - Can run in parallel
3. **Task 67** (MEDIUM): Apply Typography Scale - After spacing is complete
4. **Task 68** (HIGH): Comprehensive Verification - Final quality gate

**Key Benefits:**
- ✅ **8px Rhythm** - All spacing aligns to base unit (8, 16, 24, 32px)
- ✅ **Responsive Grid** - 16/8/4 columns at large/medium/small breakpoints
- ✅ **Type Scale** - Consistent heading hierarchy and text sizes
- ✅ **No Arbitrary Values** - All spacing/typography uses design tokens
- ✅ **Professional Appearance** - Matches IBM's enterprise design standards

**Design Tokens Used:**
```css
/* Spacing (8px base unit) */
--cds-spacing-03: 8px;   /* Small gap */
--cds-spacing-04: 12px;  /* Medium gap */
--cds-spacing-05: 16px;  /* Standard spacing */
--cds-spacing-06: 24px;  /* Section spacing */
--cds-spacing-07: 32px;  /* Large spacing */

/* Typography (productive scale) */
--cds-productive-heading-03: 1.25rem (20px);  /* Component heading */
--cds-productive-heading-02: 1rem (16px);     /* Small heading */
--cds-body-02: 1rem (16px);                   /* Body text */
--cds-body-01: 0.875rem (14px);               /* Small body */
--cds-label-01: 0.75rem (12px);               /* Labels */
```

## Previous Focus: Self-Contained Deployment (Tasks 60-62)

CHUCC-SQUI must be capable of running in isolated environments without web access. This is a critical requirement for:

- Government/military deployments
- Healthcare systems (HIPAA compliance)
- Financial institutions
- Air-gapped research environments
- Offline development/testing

**Implementation Order:**
1. **Task 60** (CRITICAL): Remove CDN dependencies
2. **Task 61** (MEDIUM): Add offline mode configuration
3. **Task 62** (LOW): Audit and document

## Development Guidelines

For future development and enhancements:

1. Review project guidelines in `.claude/CLAUDE.md`
2. Follow TypeScript and Svelte 5 best practices
3. Run quality checks: `npm run build && npm test && npm run test:e2e:storybook`
4. Commit only when all checks pass
5. Create PRs with clear descriptions
6. **NEW**: Never add CDN dependencies - bundle everything locally

## Resources

- **Project Guidelines**: `.claude/CLAUDE.md`
- **SQUI Specification**: `docs/SPARQL Query UI Web Component Specification.pdf`
- **Carbon Components**: https://svelte.carbondesignsystem.com/
- **Svelte 5**: https://svelte.dev/docs/svelte/overview
- **Service Description Spec**: https://www.w3.org/TR/sparql11-service-description/

---

**All implementation tasks completed successfully!** 🎉

The SQUI project now includes full SPARQL 1.1 Service Description support with intelligent query assistance, capability detection, and extension function discovery.
