# SQUI Implementation Tasks

## Overview

This directory contains detailed implementation tasks for the SPARQL Query UI Web Component (SQUI). Each task provides comprehensive specifications, code examples, and acceptance criteria.

## Task Index

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

- **[Task 53: Feature Detection & Capabilities Display](./53-feature-detection-capabilities.md)**
  - Display endpoint capabilities in sidebar
  - Show supported languages, features, formats
  - Visual indicators for capability status
  - **Depends on**: Task 51

- **[Task 55: Extension Function Discovery](./55-extension-function-discovery.md)**
  - Function library panel with search
  - Auto-completion for custom functions
  - Hover tooltips with function signatures
  - **Depends on**: Task 51

- **[Task 56: Result Format Negotiation](./56-result-format-negotiation.md)**
  - Smart format selection based on supported formats
  - Automatic fallback on 406 responses
  - Format filtering by query type
  - **Depends on**: Task 51

## Implementation Order

**Recommended sequence:**

```
Task 51 (Core) → Task 52 (Graphs) → Task 53 (UI) → Task 54 (Validation) → Task 55 (Functions) → Task 56 (Formats)
```

**Alternative parallel approach:**
- Implement Task 51 first (required by all others)
- Then implement Tasks 52, 53, 54 in parallel (UI-focused)
- Then implement Tasks 55, 56 (advanced features)

## Getting Started

1. **Read [00-GETTING-STARTED.md](./00-GETTING-STARTED.md)** for workflow guidelines
2. **Review project guidelines** in `.claude/CLAUDE.md`
3. **Start with Task 51** for service description support
4. **Follow dependencies** - each task lists prerequisites
5. **Run quality checks** before committing - `npm run build && npm test && npm run test:e2e:storybook`

## Task Template

Each task file includes:

```markdown
# Task N: Title

## Overview
High-level description

## Motivation
Why this feature matters

## Requirements
Detailed functional and technical requirements
- Code examples
- Type definitions
- Component designs

## Implementation Steps
Step-by-step guide

## Acceptance Criteria
Definition of "done"

## Dependencies
Required prerequisite tasks

## Future Enhancements
Ideas for follow-up work

## References
External documentation links
```

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

## Documentation

- **Project Guidelines**: `.claude/CLAUDE.md`
- **SQUI Specification**: `docs/SPARQL Query UI Web Component Specification.pdf`
- **Carbon Components**: https://svelte.carbondesignsystem.com/
- **Svelte 5**: https://svelte.dev/docs/svelte/overview
- **Service Description Spec**: https://www.w3.org/TR/sparql11-service-description/

## Contributing

1. Create feature branch: `git checkout -b task-51-service-description`
2. Implement with tests following task specifications
3. Run quality checks: `npm run build && npm test && npm run test:e2e:storybook`
4. Commit only if all checks pass
5. Create PR with task reference in title

## Questions?

- Check task files for detailed specifications
- Review `.claude/CLAUDE.md` for guidelines
- See `00-GETTING-STARTED.md` for workflow help
- Consult W3C specifications for standards clarification

---

**Ready to start?** Begin with [Task 51: Service Description Core](./51-sparql-service-description-core.md) 🚀
