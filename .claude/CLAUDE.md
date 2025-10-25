# SPARQL Query UI Web Component (SQUI) Project

## Project Overview

SQUI is a modern SPARQL Query Web Component inspired by YASGUI (Yet Another SPARQL GUI). It provides a web-based interface for composing and executing SPARQL queries against any SPARQL endpoint, and for visualizing the results.

### Key Technologies

- **Framework**: Svelte 5 (v5.41.x+) - leveraging reactivity and compile-time optimizations
- **Language**: **TypeScript** - All code must be written in TypeScript (`.ts` and `.svelte` files)
- **Design System**: IBM Carbon Design System (Svelte Carbon components)
- **Data Grid**: SVAR Svelte DataGrid v2 (`wx-svelte-grid`) - for high-performance tabular results
- **Code Editor**: CodeMirror 6 - for SPARQL syntax highlighting and editing
- **Build Tool**: Vite
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Code Quality**: ESLint + Prettier with strict TypeScript rules
- **Protocol**: SPARQL 1.2 Protocol compliant

## Development Guidelines

### TypeScript Requirements

**CRITICAL: All code must be written in TypeScript**

- ✅ Use `.ts` for all TypeScript files
- ✅ Use `<script lang="ts">` in all Svelte components
- ✅ Define interfaces/types for all data structures
- ✅ Avoid `any` type - use proper typing or `unknown`
- ✅ Enable strict mode in tsconfig.json
- ✅ Use JSDoc comments with proper TypeScript types
- ✅ Export types from `src/lib/types/index.ts`
- ❌ NO vanilla JavaScript files (.js) except config files

### Code Quality Standards

**CRITICAL: Quality checks must pass before any commit**

#### Build Process Requirements

Every build must pass these checks:

\`\`\`bash
# Type checking
npm run type-check      # Must pass with 0 errors

# Linting
npm run lint            # Must pass with 0 errors/warnings

# Formatting
npm run format:check    # Must pass (or auto-fix with npm run format)

# Tests
npm test                # All tests must pass

# Build
npm run build           # Must build successfully
\`\`\`

### Testing Requirements

**CRITICAL: Tests are part of EVERY task, not separate**

Each feature implementation task must include:

1. **Unit Tests** (for services, utilities, pure functions)
2. **Integration Tests** (for component interactions)
3. **E2E Tests** (for critical user workflows - when applicable)

**Test-Driven Development Approach:**
- Write tests DURING feature implementation
- All tests must pass before task is considered complete
- No separate "testing phase" - testing is integral to each task
- Target >80% code coverage for new code

### Svelte 5 Patterns

**CRITICAL: Use Svelte 5 runes, not legacy patterns**

- ✅ Use `$state` for reactive state
- ✅ Use `$derived` for computed values
- ✅ Use `$effect` for side effects
- ✅ Use `$props` for component props
- ✅ Use `bind:this` for component references
- ❌ NO `$:` reactive declarations (legacy)
- ❌ NO `export let` for props
- ❌ NO `beforeUpdate`/`afterUpdate`

See full specification at: `docs/SPARQL Query UI Web Component Specification.pdf`

**Implementation tasks**: See `.tasks/` directory (50 incremental tasks)
**Start here**: `.tasks/00-GETTING-STARTED.md`
