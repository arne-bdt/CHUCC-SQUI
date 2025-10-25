# SQUI Master Task List

## Overview
This file contains concise descriptions of all 50 tasks for implementing the SPARQL Query UI Web Component. Detailed task files exist for critical tasks (01-09, and select others).

---

## Phase 1: Foundation (Tasks 01-05)

### Task 01: Carbon Design System Integration ✓ DETAILED
Integrate IBM Carbon Design System with theme support for all 4 themes (White, G10, G90, G100).

### Task 02: Basic Layout Structure ✓ DETAILED
Create split-pane layout with toolbar, editor, and results sections using Carbon grid.

### Task 03: Configuration Types and Component Props ✓ DETAILED
Define comprehensive TypeScript types for configuration, SPARQL data structures, and public API.

### Task 04: State Management Stores ✓ DETAILED
Implement Svelte stores for query state, results state, UI state, and endpoint configuration.

### Task 05: Localization Infrastructure ✓ DETAILED
Set up i18n with English defaults and mechanism for adding translations.

---

## Phase 2: SPARQL Editor (Tasks 06-12)

### Task 06: CodeMirror 6 Integration with SPARQL Syntax ✓ DETAILED
Integrate CodeMirror 6 with SPARQL syntax highlighting and Carbon theme matching.

### Task 07: SPARQL Keyword Autocompletion ✓ DETAILED
Implement autocompletion for SPARQL keywords, functions, and syntax with Ctrl+Space trigger.

### Task 08: Prefix Management Service ✓ DETAILED
Create service for managing prefixes, abbreviating/expanding IRIs, and integrating prefix.cc.

### Task 09: Prefix Autocompletion in Editor ✓ DETAILED
Add PREFIX declaration autocompletion and term suggestions for common prefixes.

### Task 10: Query Templates and Defaults
Provide default query template with common PREFIX declarations and example SELECT query.
- Create template service with configurable templates
- Pre-populate new tabs with default template
- Allow integrators to provide custom templates

### Task 11: Query Execution Button and Controls
Add Run Query button to toolbar with loading state and cancel capability.
- Create Toolbar/RunButton.svelte with Carbon Button
- Connect to query execution service
- Show loading spinner during execution
- Implement abort controller for cancellation

### Task 12: Keyboard Shortcuts (Ctrl+Enter)
Implement Ctrl+Enter (Cmd+Enter on Mac) to execute query from editor.
- Add keymap extension to CodeMirror
- Trigger same execution flow as Run button
- Show visual feedback on execution
- Add keyboard shortcut hints to UI

---

## Phase 3: Endpoint Management (Tasks 13-15)

### Task 13: Endpoint Input Component
Create endpoint URL input with validation and Carbon TextInput styling.
- Component: Endpoint/EndpointInput.svelte
- Validate URL format
- Connect to endpoint store
- Show validation errors

### Task 14: Endpoint Catalogue and Autocomplete
Implement endpoint suggestions with Carbon ComboBox showing known endpoints (DBpedia, Wikidata, etc.).
- Use endpoint catalogue from store
- Support adding custom endpoints
- Show endpoint descriptions
- Allow hiding selector when endpoint is fixed

### Task 15: Endpoint Validation
Validate endpoint accessibility and provide helpful error messages.
- Check URL format
- Optional: Test endpoint with HEAD request
- Detect CORS issues
- Show clear error notifications

---

## Phase 4: SPARQL Protocol (Tasks 16-18)

### Task 16: SPARQL Protocol Query Execution
Implement SPARQL 1.2 Protocol compliant query execution with GET/POST support.
- Create services/sparqlService.ts
- Support HTTP GET for small queries
- Support HTTP POST for large queries/updates
- Handle different query types (SELECT, ASK, CONSTRUCT, DESCRIBE)
- Implement request timeout

### Task 17: HTTP Headers and Format Negotiation
Add proper Accept headers and content negotiation for different result formats.
- Set Accept header based on query type and desired format
- Support JSON, XML, CSV, TSV for SELECT/ASK
- Support Turtle, JSON-LD, N-Triples, RDF/XML for CONSTRUCT/DESCRIBE
- Allow custom headers via configuration

### Task 18: Error Handling and Reporting
Comprehensive error handling for network, HTTP, and SPARQL errors.
- Parse SPARQL error responses
- Show user-friendly error notifications using Carbon components
- Log errors for debugging
- Distinguish between network, CORS, timeout, and SPARQL errors

---

## Phase 5: Basic Results Display (Tasks 19-24)

### Task 19: SPARQL JSON Results Parser
Parse SPARQL JSON Results format into table-ready data structure.
- Create utils/resultsParser.ts
- Parse head.vars and results.bindings
- Handle boolean results (ASK queries)
- Support all RDF term types (URI, literal, bnode)
- Extract datatypes and language tags

### Task 20: SVAR DataGrid Integration
Integrate wx-svelte-grid for high-performance table rendering.
- Install and configure SVAR DataGrid
- Create Results/DataTable.svelte
- Connect to parsed results data
- Apply Carbon-compatible styling
- Enable virtual scrolling

### Task 21: Basic Table View with Columns
Render table with columns for each variable and rows for each binding.
- Map variables to columns
- Map bindings to rows
- Handle unbound variables (NULL/empty cells)
- Auto-size columns to content
- Show column headers

### Task 22: IRI Display with Abbreviation
Display IRIs using prefix abbreviations for compact view.
- Use prefixService to abbreviate IRIs
- Render abbreviated form by default
- Cache abbreviations for performance
- Handle IRIs without matching prefixes

### Task 23: Clickable IRI Links
Make IRIs clickable, opening in new tab with security attributes.
- Detect URI term type
- Render as <a> with href
- Add target="_blank" rel="noopener noreferrer"
- Style links using Carbon link styles

### Task 24: Literal Type and Language Display
Display literals with datatype and language tag annotations.
- Show language tags (e.g., "Hello"@en)
- Show datatypes (e.g., 42^^xsd:integer)
- Style type/lang annotations subtly
- Handle rdf:HTML safely (no XSS)

---

## Phase 6: Advanced Table Features (Tasks 25-31)

### Task 25: Column Sorting
Implement client-side column sorting with visual indicators.
- Click column header to sort ascending
- Click again for descending
- Third click clears sort
- Show sort direction icon
- Handle different data types (string, number, date)

### Task 26: Column Filtering
Add per-column filters with text input.
- Toggle filter row visibility
- Text input for each column
- Case-insensitive substring matching
- AND logic for multiple filters
- Clear filter functionality

### Task 27: Column Resizing
Enable column width adjustment by dragging column edges.
- Drag column separator to resize
- Enforce minimum column width
- Persist widths during session
- Double-click to auto-fit content

### Task 28: Column Reordering
Allow drag-and-drop reordering of columns.
- Drag column header to new position
- Show visual indicator during drag
- Update column order
- Persist order during session

### Task 29: Show/Hide Columns
Provide UI to toggle column visibility.
- Add "Columns" menu to toolbar
- Checkboxes for each column
- Hide/show columns without losing data
- Remember visible columns

### Task 30: Simple View vs Full View Toggle
Toggle between abbreviated IRIs (Simple) and full URIs (Full view).
- Add toggle button to toolbar
- Switch between abbreviated and full URIs
- Adjust column widths accordingly
- Store preference in UI state

### Task 31: Cell Ellipsis and Tooltips
Truncate long cell values with ellipsis and show full value on hover.
- Apply text-overflow: ellipsis to cells
- Add title attribute for native tooltip
- Consider custom tooltip component
- Make ellipsis configurable

---

## Phase 7: Large Result Sets (Tasks 32-34)

### Task 32: Virtual Scrolling Implementation
Ensure virtual scrolling works efficiently for 10,000+ rows.
- Configure DataGrid for virtual scrolling
- Test with large result sets
- Optimize rendering performance (target 60 FPS)
- Handle rapid scrolling gracefully

### Task 33: Chunked Data Loading
Implement infinite scroll with dynamic data fetching for very large results.
- Detect scroll near bottom
- Re-query with LIMIT/OFFSET for next chunk
- Append new data to existing results
- Show loading indicator during fetch
- Handle end of results

### Task 34: Result Size Warnings and Limits
Warn users about very large result sets and enforce configurable limits.
- Set default max rows (100,000)
- Show warning when approaching limit
- Option to download full results instead of displaying
- Suggest adding LIMIT to query

---

## Phase 8: Raw View & Downloads (Tasks 35-38)

### Task 35: Raw Response View Component
Display raw query response with syntax highlighting.
- Create Results/RawView.svelte
- Use CodeMirror in read-only mode or <pre> block
- Format JSON/XML with indentation
- Show raw text for RDF formats

### Task 36: View Switching (Table/Raw)
Toggle between table and raw views using Carbon tabs or segmented control.
- Add view switcher to results toolbar
- Maintain view preference per tab
- Default to Table for SELECT, Raw for CONSTRUCT
- Smooth transition between views

### Task 37: Format Switching and Re-querying
Allow changing result format and re-executing query.
- Dropdown for format selection (JSON, XML, CSV, TSV, Turtle, etc.)
- Re-query with new Accept header when format changes
- Update raw view with new format
- Show loading state during re-query

### Task 38: Download Results Feature
Enable downloading results in various formats.
- "Download" button with format dropdown
- Generate filename (results.{format} or query-based name)
- Create Blob and trigger download
- Re-query if format not already fetched
- Warn if downloading very large results

---

## Phase 9: Multiple Tabs (Tasks 39-41)

### Task 39: Multiple Query Tabs Component
Implement tabbed interface for managing multiple queries.
- Create Tabs/QueryTabs.svelte using Carbon Tabs
- "+" button to add new tab
- Close button on each tab
- Default tab names ("Query 1", "Query 2", etc.)
- Switch between tabs

### Task 40: Tab State Management
Maintain separate state for each tab (query, endpoint, results).
- Create tab store with map of tab IDs to tab state
- Switch active tab updates all UI
- Isolate query/results per tab
- Copy endpoint to new tab by default

### Task 41: Tab Persistence (localStorage)
Persist open tabs and their content to localStorage.
- Save tabs to localStorage on change
- Restore tabs on component mount
- Configurable (allow disabling for privacy)
- 30-day expiry similar to YASGUI
- Clear storage option

---

## Phase 10: Accessibility & Polish (Tasks 42-44)

### Task 42: Accessibility Compliance (WCAG AA)
Ensure all UI elements meet WCAG 2.1 AA standards.
- Proper ARIA labels on all interactive elements
- Semantic HTML structure
- Color contrast meets AA standards
- Focus management
- Screen reader testing

### Task 43: Keyboard Navigation
Comprehensive keyboard navigation throughout the application.
- Tab order follows logical flow
- All actions accessible via keyboard
- Keyboard shortcuts documented
- Focus indicators visible
- Escape to close modals/dropdowns

### Task 44: Theme Refinement and Dark Mode
Polish all 4 Carbon themes and ensure perfect dark mode support.
- Test all themes thoroughly
- Ensure DataGrid matches theme
- CodeMirror theme consistency
- High contrast mode support
- Theme-specific color adjustments

---

## Phase 11: Testing & Documentation (Tasks 45-47)

### Task 45: Unit Tests Comprehensive Suite
Complete unit test coverage for all services and utilities.
- Target >80% coverage
- Test all pure functions
- Mock external dependencies (fetch, etc.)
- Test edge cases and error conditions
- Use Vitest for fast execution

### Task 46: Integration Tests
Test component interactions and data flow.
- Query execution flow (editor → execution → results)
- Tab switching with state preservation
- Prefix autocompletion workflow
- View switching
- Use Testing Library for component tests

### Task 47: E2E Tests with Playwright
End-to-end tests for critical user workflows.
- Full query execution workflow
- Multiple tab management
- Endpoint switching
- Download functionality
- Cross-browser testing (Chrome, Firefox, Safari)

---

## Phase 12: Packaging & Deployment (Tasks 48-50)

### Task 48: NPM Package Configuration
Configure project for npm distribution.
- Set up @sveltejs/package
- Define package.json exports
- Generate TypeScript declarations
- Create package README
- Add example usage code

### Task 49: Standalone Application Build
Build standalone HTML page for direct usage.
- Create standalone entry point
- Support URL parameters (?endpoint=...&query=...)
- Deploy demo to GitHub Pages or similar
- Add standalone documentation

### Task 50: Performance Optimization and Bundle Size
Optimize bundle size and runtime performance.
- Analyze bundle with vite-bundle-visualizer
- Code splitting for large dependencies
- Tree shaking verification
- Lazy load non-critical features
- Target <500KB gzipped
- Performance budget enforcement

---

## Completion Checklist

- [ ] All 50 tasks completed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Demo deployed
- [ ] Package published to npm
- [ ] GitHub release created

## Estimated Timeline

- **Foundation**: 1-2 weeks (Tasks 01-05)
- **Editor**: 2-3 weeks (Tasks 06-12)
- **Endpoint & Protocol**: 1-2 weeks (Tasks 13-18)
- **Results Display**: 2-3 weeks (Tasks 19-24)
- **Advanced Features**: 2-3 weeks (Tasks 25-34)
- **Views & Downloads**: 1 week (Tasks 35-38)
- **Tabs & Polish**: 1-2 weeks (Tasks 39-44)
- **Testing**: 1-2 weeks (Tasks 45-47)
- **Packaging**: 1 week (Tasks 48-50)

**Total**: ~12-18 weeks (3-4.5 months) for single developer
**Total**: ~6-9 weeks with 2 developers working in parallel

---

## Notes for AI Agents

When executing these tasks:
1. Always run tests after implementation
2. Ensure TypeScript compiles without errors
3. Follow Svelte 5 best practices (use runes, not legacy reactivity)
4. Use Carbon components consistently
5. Commit after each task with descriptive message
6. Update documentation as you go
7. Consider performance implications
8. Test across different browsers/themes where applicable

## Priority Tasks for MVP

For a minimum viable product, prioritize:
- Tasks 01-08 (Foundation + Basic Editor)
- Tasks 11, 13, 15, 16, 18 (Execution infrastructure)
- Tasks 19-23 (Basic results display)
- Task 35 (Raw view)

This gives a working SPARQL query interface with basic features.
