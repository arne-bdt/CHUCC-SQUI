# SPARQL Query UI Web Component (SQUI) Project

## Project Overview

SQUI is a modern SPARQL Query Web Component inspired by YASGUI (Yet Another SPARQL GUI). It provides a web-based interface for composing and executing SPARQL queries against any SPARQL endpoint, and for visualizing the results.

### Key Technologies

- **Framework**: Svelte 5 (v5.41.x+) - leveraging reactivity and compile-time optimizations
- **Design System**: IBM Carbon Design System (Svelte Carbon components)
- **Data Grid**: SVAR Svelte DataGrid v2 (`wx-svelte-grid`) - for high-performance tabular results
- **Code Editor**: CodeMirror 6 - for SPARQL syntax highlighting and editing
- **Build Tool**: Vite
- **Testing**: Vitest/Jest for unit tests, Playwright/Cypress for E2E tests
- **Protocol**: SPARQL 1.2 Protocol compliant

## Core Features Summary

### 1. SPARQL Editor
- Syntax highlighting for SPARQL
- Autocompletion (prefixes, IRIs, keywords)
- Query templates and prefix management
- Multiple query tabs
- Ctrl+Enter to execute

### 2. Endpoint Management
- Endpoint URL input with catalogue
- Default endpoint configuration
- Validation and CORS handling

### 3. Tabular Results (SVAR DataGrid)
- Virtual scrolling (infinite scroll, no pagination)
- Chunked data loading
- Column sorting, filtering, resizing, reordering
- IRI abbreviation (simple/full view toggle)
- Clickable IRI links
- Handle 10,000+ rows smoothly

### 4. Raw View & Downloads
- Raw response viewer (JSON, XML, CSV, TSV, Turtle, etc.)
- Format switching
- Download results in multiple formats

### 5. UI/UX
- IBM Carbon Design System
- 4 theme support (White, Gray 10, Gray 90, Gray 100)
- Accessibility (WAI-ARIA, keyboard navigation)
- Localization support

## Architecture

See full architecture details in the specification PDF at:
`docs/SPARQL Query UI Web Component Specification.pdf`

### Key Directories

- `src/lib/components/` - Svelte 5 components
- `src/lib/stores/` - State management
- `src/lib/services/` - SPARQL protocol, parsing, prefixes
- `src/lib/utils/` - Formatting, download, validation
- `src/lib/types/` - TypeScript definitions

## Development Guidelines

### Svelte 5 Patterns
- Use `$effect` and `$trigger` (not old reactivity)
- Use `bind:this` for component references
- Follow runes-based reactive declarations

### Code Quality
- Modularity: separate UI from logic
- Pure functions for testability
- TypeScript for public APIs
- JSDoc for documentation
- >80% test coverage target

### Performance
- Virtual scrolling for 60 FPS
- Efficient JSON parsing
- Memory cleanup for closed tabs
- Throttled chunk loading
- Max 100,000 rows (configurable)

### Security
- XSS prevention (sanitize HTML literals)
- Link safety (`rel="noopener noreferrer"`)
- CORS for endpoint security
- No SPARQL injection

## Testing

- **Unit**: Pure functions, services, stores
- **Integration**: Query flow, autocompletion, result parsing
- **E2E**: Full workflow, cross-browser, accessibility

## Browser Support

Chrome, Firefox, Safari, Edge (latest versions)

## References

- Full Specification: `docs/SPARQL Query UI Web Component Specification.pdf`
- [YASGUI Documentation](https://triply.cc/docs/yasgui)
- [SPARQL 1.2 Protocol](https://www.w3.org/TR/sparql12-protocol/)
- [SVAR Svelte DataGrid](https://svar.dev/svelte/datagrid/)
- [IBM Carbon Design System](https://carbondesignsystem.com/)
- [Svelte 5 Documentation](https://svelte.dev/)

## Quick Start

```bash
npm install
npm run dev
npm test
npm run build
```

## Agents

Specialized agents are available in `.claude/agents/`:
- `component-dev` - Svelte 5 component development
- `testing` - Test creation and execution
- `sparql-protocol` - SPARQL protocol implementation
- `ui-ux` - Carbon Design System and accessibility
- `datagrid` - SVAR DataGrid integration
- `docs` - Documentation maintenance
