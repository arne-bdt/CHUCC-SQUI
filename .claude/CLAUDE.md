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

**⚠️ MANDATORY PRE-COMMIT CHECK ⚠️**

**BEFORE EVERY COMMIT, YOU MUST RUN:**
```bash
npm run build           # MANDATORY - Catches runtime errors, naming conflicts, type issues, AND warnings
```

**BUILD MUST COMPLETE WITH:**
- ✅ Zero errors
- ✅ Zero warnings (Svelte deprecations, a11y, etc.)
- ✅ Successful bundle generation

**IF BUILD FAILS OR HAS WARNINGS:**
- ❌ DO NOT COMMIT
- Fix ALL errors AND warnings
- Run build again to verify clean output
- Only commit when build has ZERO errors and ZERO warnings

**Common build issues to fix:**
- **Errors:**
  - Naming conflicts (imported names vs local variables)
  - Missing imports
  - TypeScript type errors
  - CodeMirror API usage errors
  - Component prop/slot errors

- **Warnings:**
  - Svelte 5 slot deprecations (`<slot>` → `{@render ...}`)
  - A11y warnings (accessibility issues)
  - Unused variables
  - TypeScript strict mode warnings
  - Vite/build configuration warnings

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

# Storybook Build (Visual Component Documentation)
npm run build-storybook # Must build successfully
                        # Verifies all stories are valid
                        # Catches component prop/type errors
                        # Ensures visual documentation is deployable
\`\`\`

**Alternatively, run all checks at once:**
\`\`\`bash
npm run check           # Runs: type-check, lint, format:check, test:unit, build-storybook
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

### License Compatibility

**CRITICAL: Check license compatibility when adding dependencies**

This project is licensed under **Apache License 2.0**. When adding new dependencies:

- ✅ **Compatible licenses**: Apache 2.0, MIT, BSD (2-clause, 3-clause), ISC, Public Domain, Unlicense
- ⚠️ **Check carefully**: LGPL (may be compatible in specific use cases)
- ❌ **Incompatible licenses**: GPL, AGPL, proprietary licenses with restrictive terms
- 🔍 **Always verify**: Check `package.json` or repository LICENSE file
- 📝 **Document**: Note any licensing concerns in PR descriptions

**Before adding any dependency:**
1. Check the dependency's license using `npm view <package> license`
2. Verify compatibility with Apache License 2.0
3. Reject or find alternatives for incompatible licenses
4. Document the license check in your commit/PR

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
