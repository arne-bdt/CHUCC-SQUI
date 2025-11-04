# Getting Started with SQUI Tasks

## Overview

This directory contains incremental implementation tasks for the SPARQL Query UI Web Component (SQUI). Each task is designed to be self-contained and builds upon previous tasks.

## Task Organization

Tasks are numbered sequentially (`01-`, `02-`, etc.) and organized by feature area:

### Core Features (Tasks 1-50)
- Component architecture
- Query editor
- Results display
- Endpoint management
- Query history
- Export functionality
- Accessibility

### SPARQL Service Description Support (Tasks 51-55+)

**NEW: SPARQL Service Description Integration**

These tasks implement support for [W3C SPARQL 1.1 Service Description](https://www.w3.org/TR/sparql11-service-description/), enabling intelligent query assistance based on endpoint capabilities.

- **Task 51**: Core service description infrastructure (fetch, parse, cache)
- **Task 52**: Graph name auto-completion for FROM/FROM NAMED clauses
- **Task 53**: Endpoint feature detection and capabilities display
- **Task 54**: Query validation based on endpoint capabilities
- **Task 55**: Extension function/aggregate discovery and documentation

## How to Use These Tasks

### 1. Read the Task

Each task file contains:
- **Overview**: High-level description
- **Motivation**: Why this feature matters
- **Requirements**: Detailed functional and technical requirements
- **Implementation Steps**: Suggested approach
- **Acceptance Criteria**: Definition of "done"
- **Dependencies**: Related tasks
- **References**: External documentation

### 2. Check Dependencies

Before starting a task, ensure all prerequisite tasks are completed. Dependencies are listed at the bottom of each task file.

### 3. Follow Project Guidelines

All tasks must follow guidelines in `.claude/CLAUDE.md`:

- ✅ **TypeScript only** - No vanilla JavaScript
- ✅ **Svelte 5 patterns** - Use runes (`$state`, `$derived`, `$effect`)
- ✅ **Carbon Design System** - Use Svelte Carbon components
- ✅ **Test coverage** - Unit + integration + E2E tests
- ✅ **Build verification** - Run `npm run build && npm test` before commit
- ✅ **Accessibility** - Follow WCAG 2.1 AA standards

### 4. Implementation Workflow

For each task:

```bash
# 1. Create feature branch
git checkout -b task-51-service-description-core

# 2. Implement feature with tests
# - Write TypeScript interfaces
# - Implement service logic
# - Create Svelte components
# - Write unit tests
# - Write integration tests
# - Create Storybook stories
# - Write E2E tests (if applicable)

# 3. Run quality checks (MANDATORY)
npm run build              # Must pass with zero errors/warnings
npm test                   # All tests must pass
npm run test:e2e:storybook # E2E tests must pass (for UI components)

# 4. Commit only if all checks pass
git add .
git commit -m "feat: Add SPARQL Service Description core infrastructure (Task 51)"

# 5. Create pull request
gh pr create --title "Task 51: SPARQL Service Description Core" \
             --body "Implements core infrastructure for fetching and parsing service descriptions..."
```

### 5. Testing Requirements

Every task must include:

- **Unit Tests**: Test services, utilities, and pure functions in isolation
- **Integration Tests**: Test component rendering and interactions
- **Storybook Stories**: Visual documentation for all UI components
- **E2E Tests**: Test critical user workflows in real browser (when applicable)

See `.claude/CLAUDE.md` for detailed testing guidelines.

## SPARQL Service Description Benefits

The new service description tasks (51-55) enable:

### For Users:
- ✅ **Auto-complete graph names** - No need to guess available graphs
- ✅ **See endpoint capabilities** - Know what SPARQL features are supported
- ✅ **Get early warnings** - Validate queries before sending to endpoint
- ✅ **Discover custom functions** - Learn about available extension functions
- ✅ **Write compatible queries** - Avoid using unsupported features

### For SQUI:
- ✅ **Intelligent query assistance** - Context-aware auto-completion
- ✅ **Better error messages** - Explain why queries might fail
- ✅ **Endpoint interoperability** - Adapt UI based on capabilities
- ✅ **Enhanced UX** - Guide users with available options
- ✅ **Standards compliance** - Follow W3C recommendations

## Example: Task 52 (Graph Auto-completion)

**User types:**
```sparql
SELECT * FROM NAMED <|>
```

**SQUI shows:**
```
📊 http://example.org/products    1,024,332 triples • RDFS
📊 http://example.org/customers   45,231 triples
📊 http://example.org/orders      523,442 triples
```

**User selects, query becomes:**
```sparql
SELECT * FROM NAMED <http://example.org/products>
WHERE { ?s ?p ?o }
```

## Task Status Tracking

Create a `TASK_STATUS.md` file to track progress:

```markdown
# Task Status

## ✅ Completed
- [ ] Task 01: ...
- [ ] Task 02: ...

## 🚧 In Progress
- [ ] Task 51: Service Description Core

## 📋 Planned
- [ ] Task 52: Graph Auto-completion
- [ ] Task 53: Feature Detection
- [ ] Task 54: Query Validation
- [ ] Task 55: Function Discovery
```

## Getting Help

- **Project Guidelines**: See `.claude/CLAUDE.md`
- **SQUI Specification**: See `docs/SPARQL Query UI Web Component Specification.pdf`
- **Carbon Components**: https://svelte.carbondesignsystem.com/
- **Svelte 5 Docs**: https://svelte.dev/docs/svelte/overview
- **SPARQL 1.1 Service Description**: https://www.w3.org/TR/sparql11-service-description/

## Next Steps

1. **Start with Task 51** if implementing service description features
2. **Read the full specification** in the task file
3. **Check license compatibility** for any new dependencies (must be Apache 2.0 compatible)
4. **Follow TDD approach** - write tests during implementation, not after
5. **Run all checks** before committing - `npm run build && npm test && npm run test:e2e:storybook`

Happy coding! 🚀
