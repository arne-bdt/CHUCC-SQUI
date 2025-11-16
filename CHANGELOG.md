# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Endpoint Dashboard feature (Tasks 77-80)
  - EndpointInfoSummary component with collapsible summary bar
  - EndpointDashboard component with tabbed interface (Capabilities, Datasets, Functions)
  - Auto-fetch service description when endpoint changes
  - Function library with search and one-click insertion into queries
  - 12 comprehensive E2E tests for endpoint dashboard features
- Initial NPM package configuration
- Comprehensive README with usage examples
- TypeScript type definitions export
- Main library entry point with component and type exports
- Service and store exports for advanced usage

## [0.1.0] - 2025-11-01

### Added
- Initial release of SQUI (SPARQL Query UI Web Component)
- SPARQL 1.2 Protocol support with GET/POST
- CodeMirror 6 editor with SPARQL syntax highlighting
- SPARQL keyword and prefix autocompletion
- Prefix management with prefix.cc integration
- High-performance results table with SVAR DataGrid
- Virtual scrolling for 10,000+ rows
- Multiple query tabs with localStorage persistence
- IBM Carbon Design System integration (4 themes)
- Result format support (JSON, XML, CSV, TSV, Turtle, JSON-LD, N-Triples, RDF/XML)
- Raw results view with syntax highlighting
- Download results in multiple formats
- IRI abbreviation with prefix handling
- Keyboard shortcuts (Ctrl+Enter to execute)
- WCAG 2.1 AA accessibility compliance
- Comprehensive test suite (>89% coverage)
- Storybook documentation
- E2E tests with Playwright

### Features
- **Editor**: Syntax highlighting, autocompletion, keyboard shortcuts
- **Execution**: Query execution with loading states and error handling
- **Results**: Table view, raw view, sorting, filtering, column management
- **Tabs**: Multiple query tabs with state persistence
- **Endpoint**: Endpoint selector with catalogue of known endpoints
- **Theming**: 4 Carbon themes (White, G10, G90, G100)
- **Accessibility**: Full keyboard navigation, ARIA labels, screen reader support
- **Performance**: Virtual scrolling, optimized bundle size, code splitting

### Technical
- Built with Svelte 5 (runes mode)
- TypeScript with strict mode
- ESLint + Prettier for code quality
- Vitest for unit/integration testing
- Playwright for E2E testing
- Vite for building and bundling

[Unreleased]: https://github.com/yourusername/sparql-query-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/sparql-query-ui/releases/tag/v0.1.0
