# SQUI Implementation Guide for AI Agents

## Quick Start

This directory contains a comprehensive breakdown of 50 tasks to implement the SPARQL Query UI Web Component per the specification in `docs/SPARQL Query UI Web Component Specification.pdf`.

## File Structure

- **README.md**: Overview and task organization
- **task-index.md**: Quick reference table of all tasks with dependencies
- **MASTER-TASKS.md**: Concise descriptions of all 50 tasks
- **IMPLEMENTATION-GUIDE.md**: This file - how to execute tasks
- **01-XX.md through 09-XX.md**: Detailed task specifications for foundation and editor phases
- Additional detailed tasks will be created as needed

## How to Execute Tasks

### For AI Agents

When assigned a task (e.g., "Implement Task 05"):

1. **Read the task file**: Open the corresponding markdown file (e.g., `05-localization-setup.md`)

2. **Check dependencies**: Ensure all dependent tasks are completed
   - If dependencies are missing, complete those first
   - Dependencies are listed at the top of each task file

3. **Review requirements**: Understand the specification requirements referenced

4. **Implement step-by-step**: Follow the implementation steps provided
   - Create/modify files as specified
   - Use the code templates and structure provided
   - Follow TypeScript and Svelte 5 best practices

5. **Write tests**: Implement all tests specified in the Testing section
   - Aim for >80% coverage for new code
   - Ensure all existing tests still pass

6. **Verify acceptance criteria**: Check off each criterion
   - All criteria must be met before task is complete

7. **Run the test suite**:
   ```bash
   npm test          # Run all tests
   npm run lint      # Check code quality
   npm run build     # Ensure build succeeds
   ```

8. **Commit changes**: Use the provided commit message template
   - Follow conventional commits format
   - Include task number in commit

9. **Update task status**: Mark the task file status as "DONE" and add completion date

### Task Execution Order

**Recommended order**:

1. **Sequential for phases 1-3** (Tasks 01-15): These build the foundation
2. **Parallel possible for phase 4-5** (Tasks 16-24): If multiple agents available
3. **Sequential for phase 6** (Tasks 25-31): Builds on basic results
4. **Parallel possible for phases 7-8** (Tasks 32-38): Independent features
5. **Sequential for phase 9** (Tasks 39-41): Tab feature depends on prior work
6. **Parallel possible for phase 10** (Tasks 42-44): Polish tasks
7. **Parallel recommended for phase 11** (Tasks 45-47): Different test types
8. **Sequential for phase 12** (Tasks 48-50): Deployment builds on everything

## MVP (Minimum Viable Product)

For quickest path to working prototype, execute in this order:

1. Tasks 01-04 (Foundation)
2. Task 06 (Editor)
3. Task 08 (Prefixes)
4. Tasks 11, 13, 16 (Execution)
5. Tasks 19-21 (Basic Results)
6. Task 35 (Raw View)

This delivers a functional SPARQL query interface in ~2-3 weeks.

## Full Implementation

For complete feature set per specification:

- Execute all 50 tasks sequentially or with parallelization where noted
- Estimated timeline: 12-18 weeks single developer, 6-9 weeks with 2 developers
- **Total estimated effort**: 120-160 developer hours

## Quality Standards

Every task must meet these standards before completion:

### Code Quality
- ✅ TypeScript compiles without errors
- ✅ No ESLint warnings
- ✅ Prettier formatting applied
- ✅ JSDoc comments on public APIs
- ✅ No console.log in production code (use proper logging)

### Testing
- ✅ Unit tests for pure functions/services (>80% coverage target)
- ✅ Component tests for UI components
- ✅ Integration tests for feature workflows
- ✅ All tests passing (`npm test`)

### Svelte 5 Best Practices
- ✅ Use `$state`, `$derived`, `$effect` runes (not legacy reactivity)
- ✅ Use `bind:this` for component references
- ✅ Proper cleanup in `$effect` (return cleanup function)
- ✅ No memory leaks (verify in browser dev tools)

### Carbon Design System
- ✅ Use Carbon components where available
- ✅ Follow Carbon spacing/layout guidelines
- ✅ Works in all 4 Carbon themes
- ✅ Consistent with Carbon visual language

### Accessibility
- ✅ Proper ARIA labels
- ✅ Keyboard navigation works
- ✅ Color contrast meets WCAG AA
- ✅ Focus indicators visible

### Performance
- ✅ No blocking operations on main thread
- ✅ Large operations use requestAnimationFrame or web workers
- ✅ Virtual scrolling for large datasets
- ✅ Lazy loading where appropriate

## Commit Message Format

Use this format for all commits:

```
<type>(<task>): <subject>

<body>

Task: #<number>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`

**Example**:
```
feat(task-06): integrate CodeMirror 6 with SPARQL syntax

- Add CodeMirror 6 editor component
- Implement SPARQL syntax highlighting
- Create Carbon-compatible editor theme
- Connect editor to query store
- Add basic error indication
- Add editor tests

Task: #06
```

## Testing Strategy

### Unit Tests (Vitest)
- Location: `tests/unit/`
- Target: Services, utilities, pure functions
- Run: `npm run test:unit`

### Integration Tests (Vitest + Testing Library)
- Location: `tests/integration/`
- Target: Component interactions, data flow
- Run: `npm run test:integration`

### E2E Tests (Playwright)
- Location: `tests/e2e/`
- Target: Complete user workflows
- Run: `npm run test:e2e`

## Common Patterns

### Creating a new component

```typescript
// src/lib/components/Category/ComponentName.svelte
<script lang="ts">
  import { t } from '$lib/localization';

  interface Props {
    propName: string;
  }

  let { propName }: Props = $props();
  let internalState = $state(initialValue);

  // Lifecycle and effects
  $effect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  });
</script>

<div class="component-name">
  <!-- Template -->
</div>

<style>
  /* Scoped styles */
</style>
```

### Creating a new service

```typescript
// src/lib/services/serviceName.ts
import type { ServiceConfig } from '../types';

export class ServiceName {
  private config: ServiceConfig;

  constructor(config?: ServiceConfig) {
    this.config = config || {};
  }

  async performAction(): Promise<Result> {
    // Implementation
  }
}

export const serviceNameInstance = new ServiceName();
```

### Creating a new store

```typescript
// src/lib/stores/storeName.ts
import { writable, derived } from 'svelte/store';
import type { StoreState } from '../types';

export function createStoreName() {
  const { subscribe, set, update } = writable<StoreState>(initialState);

  return {
    subscribe,
    action: (param: string) => update(s => ({ ...s, field: param })),
    reset: () => set(initialState)
  };
}

export const storeNameInstance = createStoreName();
```

## Troubleshooting

### Build Errors
- Run `npm install` to ensure dependencies are current
- Clear `.svelte-kit` and `node_modules/.vite` caches
- Check TypeScript errors with `npx tsc --noEmit`

### Test Failures
- Run tests in watch mode: `npm test -- --watch`
- Check test isolation (each test should be independent)
- Verify mocks are properly configured

### Performance Issues
- Use Chrome DevTools Performance profiler
- Check for memory leaks in Heap Snapshot
- Verify virtual scrolling is working (check DOM node count)

## Getting Help

If you encounter issues:

1. Check the specification PDF for clarification
2. Review similar code in YASGUI source (for inspiration, not copying)
3. Consult relevant documentation:
   - [Svelte 5 Docs](https://svelte.dev/)
   - [Carbon Design System](https://carbondesignsystem.com/)
   - [SVAR DataGrid](https://svar.dev/svelte/datagrid/)
   - [CodeMirror 6](https://codemirror.net/)
   - [SPARQL 1.2 Protocol](https://www.w3.org/TR/sparql12-protocol/)

## Progress Tracking

Update this section as tasks are completed:

- [ ] Phase 1: Foundation (Tasks 01-05)
- [ ] Phase 2: SPARQL Editor (Tasks 06-12)
- [ ] Phase 3: Endpoint Management (Tasks 13-15)
- [ ] Phase 4: SPARQL Protocol (Tasks 16-18)
- [ ] Phase 5: Basic Results (Tasks 19-24)
- [ ] Phase 6: Advanced Table Features (Tasks 25-31)
- [ ] Phase 7: Large Result Sets (Tasks 32-34)
- [ ] Phase 8: Raw View & Downloads (Tasks 35-38)
- [ ] Phase 9: Multiple Tabs (Tasks 39-41)
- [ ] Phase 10: Accessibility & Polish (Tasks 42-44)
- [ ] Phase 11: Testing & Documentation (Tasks 45-47)
- [ ] Phase 12: Packaging & Deployment (Tasks 48-50)

---

**Current Status**: All tasks defined and ready for execution
**Last Updated**: 2025-10-25
