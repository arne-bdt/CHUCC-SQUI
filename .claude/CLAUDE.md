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

### Component Documentation - Consult First!

**CRITICAL: ALWAYS consult official documentation BEFORE implementing or debugging components**

**⚠️ MANDATORY: Check Documentation First ⚠️**

Before using any third-party component or library:

1. **Read the official documentation** for usage patterns and best practices
2. **Check for examples** in the documentation that match your use case
3. **Review API reference** for props, events, and bindings
4. **Look for common patterns** (e.g., controlled vs uncontrolled components)

**Carbon Design System Components:**
- 📚 **Always check**: https://svelte.carbondesignsystem.com/components/
- ⚠️ **Pay special attention to**:
  - Reactive examples (often show `bind:` directives)
  - Event handling patterns
  - Two-way binding recommendations
  - Component-specific quirks and best practices
- 🔍 **Example**: Carbon Tabs requires `bind:selected` for two-way binding, NOT `selected={value}` + `on:change`

**Other Libraries:**
- **wx-svelte-grid**: Check https://svar.dev/svelte/grid/
- **CodeMirror 6**: Check https://codemirror.net/docs/
- **Svelte 5**: Check https://svelte.dev/docs/svelte/overview

**Why This Matters:**
- Prevents hours of debugging by using correct patterns from the start
- Ensures compatibility with library expectations
- Avoids fighting against the library's design
- Saves time by learning from official examples

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
npm test                # MANDATORY - All tests must pass
```

**BUILD AND TESTS MUST COMPLETE WITH:**
- ✅ Zero build errors
- ✅ Zero build warnings (Svelte deprecations, a11y, etc.)
- ✅ Successful bundle generation
- ✅ **ALL tests passing (unit + integration)**

**❌ NEVER COMMIT IF:**
- Build fails or has warnings
- **ANY test is failing (even if it was failing before)**
- TypeScript type errors exist
- Linting errors exist

**IF BUILD OR TESTS FAIL:**
- ❌ **DO NOT COMMIT UNDER ANY CIRCUMSTANCES**
- Fix ALL errors AND warnings
- Fix ALL failing tests
- Run build and tests again to verify clean output
- Only commit when build AND tests have ZERO errors/warnings and ALL tests pass

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

**⚠️ CRITICAL: ALWAYS run E2E tests before completing any task that modifies components**

Every build must pass these checks:

\`\`\`bash
# Type checking
npm run type-check      # Must pass with 0 errors

# Linting
npm run lint            # Must pass with 0 errors/warnings

# Formatting
npm run format:check    # Must pass (or auto-fix with npm run format)

# Unit + Integration Tests
npm test                # All tests must pass (unit + integration)

# Build
npm run build           # Must build successfully

# Storybook Build (Visual Component Documentation)
npm run build-storybook # Must build successfully
                        # Verifies all stories are valid
                        # Catches component prop/type errors
                        # Ensures visual documentation is deployable

# E2E Tests (CRITICAL - NEVER SKIP)
npm run test:e2e:storybook  # Must pass ALL E2E tests
                            # Tests real user interactions in browser
                            # Catches UI bugs that unit tests miss
                            # REQUIRED before completing component tasks
\`\`\`

**Alternatively, run all checks at once:**
\`\`\`bash
npm run check           # Runs: type-check, lint, format:check, test:unit, build-storybook
                        # NOTE: Does NOT include E2E tests - run separately!
\`\`\`

**Complete pre-commit checklist:**
\`\`\`bash
npm run build && npm test && npm run test:e2e:storybook
# ALL THREE must pass before committing component changes
\`\`\`

### Testing Requirements

**CRITICAL: Tests are part of EVERY task, not separate**

Each feature implementation task must include:

1. **Unit Tests** (for services, utilities, pure functions)
2. **Integration Tests** (for component interactions and rendering)
3. **Storybook Stories** (for ALL UI components - REQUIRED)
4. **E2E Tests** (for ALL UI components and critical workflows - REQUIRED, not optional)

**Test-Driven Development Approach:**
- Write tests DURING feature implementation
- All tests must pass before task is considered complete
- No separate "testing phase" - testing is integral to each task
- Target >80% code coverage for new code

**Test Coverage Requirements:**

1. **Unit Tests** (`tests/unit/`):
   - Test service logic in isolation
   - Mock external dependencies
   - Fast execution (<1ms per test)
   - Example: `sparqlService.test.ts`, `resultsParser.test.ts`

2. **Integration Tests** (`tests/integration/`):
   - Test component rendering with real stores
   - Test component interactions and reactivity
   - Verify DOM updates after state changes
   - Use `@testing-library/svelte` with `waitFor()` for async updates
   - Mock browser APIs (ResizeObserver, IntersectionObserver) in `tests/setup.ts`
   - Example: `ResultsPlaceholder.test.ts` (23 tests)

3. **Storybook Stories** (`src/lib/components/*/*.stories.ts`):
   - Create stories for ALL UI components (REQUIRED)
   - Add `play` functions to critical stories for interaction testing
   - Test component behavior in visual context
   - Catch rendering bugs and infinite loops
   - Cover all component states: default, loading, error, empty, edge cases
   - Example: `DataTable.stories.ts` LargeDataset10000 story
   - Run with: `npm run storybook` (manual) or `npm run test-storybook` (CI)

4. **E2E Tests** (`tests/e2e/*.storybook.spec.ts`):
   - Create E2E tests for ALL UI components (REQUIRED, not optional)
   - Test in actual browser environment using Playwright
   - Navigate to Storybook stories and verify rendering
   - Test user interactions, keyboard navigation, accessibility
   - Catch issues that unit/integration tests miss
   - Example: `endpoint-capabilities.storybook.spec.ts`, `graph-name-completion.storybook.spec.ts`
   - Run with: `npm run test:e2e:storybook` (requires Storybook to be running)
   - **CRITICAL**: Must pass before completing any UI component task

5. **Critical Integration Test Patterns:**

   ```typescript
   // ✅ DO: Wait for store updates to propagate to DOM
   resultsStore.setData(mockData);
   await waitFor(() => {
     expect(screen.getByText('2 results')).toBeInTheDocument();
   });

   // ❌ DON'T: Expect immediate DOM updates
   resultsStore.setData(mockData);
   expect(screen.getByText('2 results')).toBeInTheDocument(); // May fail!

   // ✅ DO: Test large datasets for performance
   const largeData = generateData(10000);
   await waitFor(() => {
     expect(container.querySelector('.data-table')).toBeInTheDocument();
   }, { timeout: 5000 }); // Catches infinite loops/freezes

   // ✅ DO: Test store reactivity
   const { container } = render(Component);
   resultsStore.setLoading(true);
   await waitFor(() => expect(screen.getByText('Loading')).toBeInTheDocument());
   resultsStore.setData(mockData);
   await waitFor(() => expect(container.querySelector('.results')).toBeInTheDocument());
   ```

6. **What Tests Must Catch:**

   - ❌ Store subscription bugs (`$derived($store)` not `$derived(store)`)
   - ❌ Infinite reactivity loops (`$derived.by()` not `$derived(() => {})`)
   - ❌ Browser freezes with large datasets (10,000+ rows)
   - ❌ Missing DOM updates after store changes
   - ❌ Component rendering errors with real data
   - ❌ Edge cases (empty results, unbound variables, errors)

**Test Setup:**

- Global mocks in `tests/setup.ts`:
  - `ResizeObserver` (required by wx-svelte-grid)
  - `IntersectionObserver` (required by Carbon components)
  - `@testing-library/jest-dom` matchers

**Running Tests:**

```bash
npm test                    # All tests (unit + integration)
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run storybook           # Manual visual testing
npm run test:storybook      # Automated Storybook tests
npm run test:e2e:storybook  # E2E tests for Storybook stories (REQUIRED for UI components)
```

**CRITICAL: E2E Testing is MANDATORY for UI Components**

- E2E tests are NOT optional for UI components
- Every Svelte component must have corresponding E2E tests
- E2E tests must pass before completing the task
- Include E2E test results in "Build & Tests Status" section

### E2E Testing Workflow

**CRITICAL: Use E2E tests to verify fixes, especially for Storybook/rendering issues**

**When to Run E2E Tests:**
- After modifying component rendering logic
- After changing Storybook story configuration
- When investigating "works in tests but fails in browser" issues
- Before claiming a fix is complete (NEVER skip verification!)

**E2E Test Execution Workflow:**

```bash
# Step 1: Start Storybook in background
npm run storybook &

# Step 2: Wait for Storybook to be ready (automated)
timeout 30 bash -c 'until curl -s http://localhost:6006 > /dev/null; do sleep 1; done && echo "Storybook ready"'

# Step 3: Run E2E tests
npm run test:e2e:storybook

# Step 4: Review results
# - Check test output for passes/failures
# - Examine error context files in test-results/ directory
# - Review screenshots and videos for visual confirmation
```

**What E2E Tests Catch (That Other Tests Don't):**
- ✅ Storybook configuration errors (decorator issues, story setup problems)
- ✅ Component rendering failures in real browser environment
- ✅ Store initialization issues in Storybook context
- ✅ Custom render function incompatibilities
- ✅ Browser-specific reactivity bugs
- ✅ Visual regression issues

**E2E Test Debugging:**
- Error context files contain full page snapshots (`.md` files in `test-results/`)
- Screenshots show actual rendering state (`test-failed-1.png`)
- Videos capture interaction flow (`video.webm`)
- Console logs show runtime errors that don't appear in unit tests

**Key Lesson:**
❌ **NEVER** claim a fix is complete without E2E verification
✅ **ALWAYS** run E2E tests when modifying components or stories
✅ **VERIFY** the fix works in the actual browser, not just in unit tests

### Playwright E2E Testing Best Practices

**CRITICAL: Use semantic selectors for robust, maintainable tests**

**Recommended Selector Patterns:**

```typescript
// ✅ BEST: Use semantic locators (getByRole, getByText, getByPlaceholder)
await expect(page.getByRole('heading', { name: 'Extension Functions' })).toBeVisible();
await expect(page.getByText('Search functions...')).toBeVisible();
await expect(page.getByPlaceholder('Enter query...')).toBeVisible();
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
await expect(page.getByRole('tab', { name: /Functions/ })).toBeVisible();

// ✅ GOOD: Use getByLabel for form fields
await expect(page.getByLabel('Endpoint URL')).toBeVisible();

// ⚠️ AVOID: CSS class selectors (brittle, implementation-dependent)
await expect(page.locator('.function-library')).toBeVisible();
await expect(page.locator('.search-input')).toBeVisible();

// ❌ WRONG: Complex CSS selectors (very brittle)
await expect(page.locator('div.container > div.panel > input.search')).toBeVisible();
```

**Storybook iframe Access:**

```typescript
// ✅ CORRECT: Direct page access to Storybook iframe content
test('should render component', async ({ page }) => {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-mycomponent--default&viewMode=story`);

  // Wait for Storybook play functions to complete
  await page.waitForTimeout(1500);

  // Access elements directly without frame locator
  await expect(page.getByText('My Component')).toBeVisible({ timeout: 5000 });
});

// ❌ WRONG: Explicit frame locator (unnecessary for Storybook)
const frame = page.frameLocator('#storybook-preview-iframe');
await frame.locator('.my-component').waitFor();
```

**Handling Multiple Elements (Strict Mode):**

```typescript
// ❌ FAILS: Playwright strict mode violation when multiple elements match
await expect(page.getByText('Description')).toBeVisible();
// Error: "strict mode violation: resolved to 2 elements"

// ✅ FIX 1: Use more specific selector (getByRole)
await expect(page.getByRole('heading', { name: 'Description', exact: true })).toBeVisible();

// ✅ FIX 2: Use .first() or .nth() to select specific element
await expect(page.getByText('optional').first()).toBeVisible();
await expect(page.getByRole('button', { name: 'Details' }).nth(2)).toBeVisible();

// ✅ FIX 3: Use count() to assert on multiple elements
const count = await page.getByText('Description').count();
expect(count).toBeGreaterThan(0);
```

**Incremental Test Development:**

```typescript
// ✅ RECOMMENDED: Fix tests incrementally, one at a time
// Run single test to verify fix:
npx playwright test --config=playwright-storybook.config.js tests/e2e/my-component.spec.ts -g "should render component"

// Then run all tests in file:
npx playwright test --config=playwright-storybook.config.js tests/e2e/my-component.spec.ts

// ❌ AVOID: Fixing all tests at once without verification
// This makes it harder to identify which fix resolved which issue
```

**Common Patterns:**

```typescript
// ✅ Wait for component to render and play function to complete
await page.waitForTimeout(1500);

// ✅ Use appropriate timeouts for slow operations
await expect(page.getByText('Loading complete')).toBeVisible({ timeout: 10000 });

// ✅ Test user interactions with semantic selectors
await page.getByPlaceholder('Search...').fill('query');
await page.getByRole('button', { name: 'Search' }).click();

// ✅ Verify state changes after interactions
await expect(page.getByText('5 results')).toBeVisible();

// ✅ Test keyboard navigation
await page.getByRole('tab', { name: 'Settings' }).press('Enter');
await expect(page.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
```

**Why Semantic Selectors Matter:**

1. **Accessibility**: Tests that use semantic selectors (role, label, text) verify accessibility
2. **Maintainability**: Semantic selectors don't break when CSS classes change
3. **Readability**: `getByRole('button', { name: 'Submit' })` is clearer than `.locator('.btn-submit')`
4. **Resilience**: Text-based selectors work across theme changes and styling updates
5. **Documentation**: Tests serve as documentation of user-facing behavior

**Key Learnings from Task 55:**

- Playwright can access Storybook iframe content directly without explicit `frameLocator()`
- Use semantic locators (`getByRole`, `getByText`) instead of CSS class selectors
- Fix tests incrementally (one at a time) to identify root causes faster
- Handle strict mode violations with specific selectors or `.first()`/`.nth()`
- Wait for Storybook play functions to complete before making assertions

### Storybook Story Configuration

**CRITICAL: Use correct story patterns for Svelte components**

**Standard Story Pattern (RECOMMENDED):**

```typescript
import type { Meta, StoryObj } from '@storybook/svelte';
import MyComponent from './MyComponent.svelte';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ✅ CORRECT: Use args for prop-based components
export const Default: Story = {
  args: {
    data: mockData,
    disabled: false,
  },
};

// ✅ CORRECT: Use args with play functions for store-based components
export const WithStoreData: Story = {
  args: {},  // Empty args for components that read from stores
  play: async () => {
    // Set up store state AFTER component renders
    resultsStore.setData(mockData);
  },
};
```

**Patterns to AVOID:**

```typescript
// ❌ WRONG: Custom render function (causes Storybook integration issues)
export const MyStory: Story = {
  render: () => ({
    Component: MyComponent,
  }),
  // This pattern fails in Storybook's Svelte decorator chain!
};

// ❌ WRONG: Setting up stores in render function
export const MyStory: Story = {
  render: () => {
    resultsStore.setData(mockData);  // TOO EARLY - component not rendered yet!
    return { Component: MyComponent };
  },
};
```

**Key Rules:**
1. Always use `args: {}` or `args: { prop: value }` - let Storybook handle rendering
2. Never use custom `render: () => ({ Component: ... })` functions
3. Use `play` functions for post-render setup (store initialization, interactions)
4. Use decorators (in `preview.ts`) for global setup that applies to all stories
5. For store-based components, use `args: {}` + `play` function pattern

**Why This Matters:**
- Custom render functions bypass Storybook's Svelte integration layer
- Causes errors like "Cannot convert undefined or null to object"
- Breaks decorator chain (DecoratorHandler, PreviewRender)
- Makes debugging extremely difficult (error appears in Storybook infrastructure, not your code)

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
- ✅ Use `$derived.by()` for complex computations
- ✅ Use `$effect` for side effects
- ✅ Use `$props` for component props
- ✅ Use `bind:this` for component references
- ❌ NO `$:` reactive declarations (legacy)
- ❌ NO `export let` for props
- ❌ NO `beforeUpdate`/`afterUpdate`

**Svelte 5 Reactivity Gotchas:**

```typescript
// ❌ WRONG: Creates a derived FUNCTION, not a derived VALUE
const data = $derived(() => {
  return items.map(item => process(item));
});
// Usage: data() - calling as function causes infinite loops!

// ✅ CORRECT: Simple derived value
const data = $derived(items.map(item => process(item)));
// Usage: data - direct access

// ✅ CORRECT: Complex derived with function body
const data = $derived.by(() => {
  return items.map(item => process(item));
});
// Usage: data - direct access

// ❌ WRONG: Accessing store object instead of value
const state = $derived(resultsStore);
// state = { subscribe, set, update } - the store object!

// ✅ CORRECT: Auto-subscribe to store value
const state = $derived($resultsStore);
// state = { loading: false, data: [...] } - the actual value!
```

**Key Rules:**
1. `$derived(expression)` - for simple expressions
2. `$derived.by(() => { ... })` - for complex logic with statements
3. `$store` syntax auto-subscribes to stores in runes mode
4. Never call derived values as functions unless explicitly created as functions

**CRITICAL: Avoiding Reactive Loops with Carbon Components**

```typescript
// ❌ DANGEROUS: $effect + bind: creates infinite loop (browser freeze!)
let inputText = $state('');
$effect(() => {
  inputText = computedValue;  // Updates bound value
});
<ComboBox bind:value={inputText} />  // Re-triggers effect = LOOP!

// ✅ CORRECT: Use one-way binding or {#key} for re-render
const displayText = $derived(computedValue);
<ComboBox value={displayText} />  // One-way, no loop

// ✅ CORRECT: Force re-render when data loads
const key = $derived(items.length);
{#key key}
  <ComboBox selectedId={value} {items} />
{/key}
```

**Async Data Loading Pattern (Carbon ComboBox/Dropdowns):**

When items load asynchronously AFTER initial render:

```typescript
// Problem: Items array empty initially, loads later from subscription
let _catalogue = $state<Endpoint[]>([]);  // Empty!
$effect(() => {
  endpointCatalogue.subscribe((catalogue) => {
    _catalogue = catalogue;  // Loads AFTER ComboBox renders
  });
});

const items = $derived(_catalogue.map(...));
// ComboBox renders with items=[], selectedId doesn't match anything
// When items load, ComboBox doesn't re-sync automatically

// ✅ Solution: Use {#key} to force re-render when items load
const comboBoxKey = $derived(items.length);
{#key comboBoxKey}
  <ComboBox
    selectedId={value}
    {items}
  />
{/key}
// When items.length changes (0 → 4), Svelte destroys old ComboBox
// and creates new one with items populated, correctly showing selected item
```

**Key Lessons:**
1. **Never combine `$effect` with `bind:`** - creates reactive loops
2. **Use `{#key}` for forcing re-renders** - simpler than manual state sync
3. **Test async timing** - components often render before data loads
4. **Consult Carbon docs** - understand prop requirements (selectedId vs value)

See full specification at: `docs/SPARQL Query UI Web Component Specification.pdf`

**Implementation tasks**: See `.tasks/` directory (50 incremental tasks)
**Start here**: `.tasks/00-GETTING-STARTED.md`
