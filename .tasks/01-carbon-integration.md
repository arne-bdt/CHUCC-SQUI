# Task 01: Carbon Design System Integration & Quality Tools Setup

**Phase:** Foundation  
**Status:** TODO  
**Dependencies:** None  
**Estimated Effort:** 3-4 hours

## Objective

Integrate IBM Carbon Design System (Svelte) and configure all quality tools (ESLint, Prettier, TypeScript) as part of the build process.

## Implementation Summary

This task combines Carbon integration with quality tooling setup. Quality checks (linting, type-checking, formatting) are now part of the build process and must pass before any code is committed.

### Part A: Quality Tools (CRITICAL - TypeScript First!)

- ESLint 9 with Svelte 5 + TypeScript support
- Prettier with Svelte plugin
- Type checking integrated into build
- Quality gate script (`npm run check`)

### Part B: Carbon Integration

- Theme store for 4 Carbon themes
- CSS imports
- Theme switching capability

See full details in updated task file.

**Note**: All code must be TypeScript. All tasks include tests. Quality checks must pass.
