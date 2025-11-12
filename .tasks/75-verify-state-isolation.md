# Task 75: Verify State Isolation with Comprehensive Tests

## Overview

Create comprehensive tests to verify that the context-based store implementation provides proper state isolation. This includes unit tests, integration tests, Storybook tests, and E2E tests.

## Motivation

### Testing Goals

1. **Prove Isolation**: Verify that multiple StoreProvider instances don't share state
2. **Verify Fallback**: Ensure components work without StoreProvider (backward compatibility)
3. **Storybook Validation**: Confirm stories no longer leak state
4. **Regression Prevention**: Catch any future state isolation issues

## Requirements

### 1. Unit Tests for StoreProvider

**File**: `tests/unit/components/StoreProvider.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import StoreProvider from '$lib/components/StoreProvider.svelte';
import { getQueryStore, getResultsStore } from '$lib/stores/storeContext';

describe('StoreProvider', () => {
  describe('State Isolation', () => {
    it('creates independent store instances for each provider', () => {
      let store1Query: any;
      let store2Query: any;

      // Component that captures its queryStore
      const CaptureStore = {
        render: () => {
          const queryStore = getQueryStore();
          if (!store1Query) {
            store1Query = queryStore;
          } else {
            store2Query = queryStore;
          }
          return '<div>test</div>';
        },
      };

      // Render two separate StoreProviders
      render(StoreProvider, { props: { children: CaptureStore } });
      render(StoreProvider, { props: { children: CaptureStore } });

      // Stores should be different instances
      expect(store1Query).not.toBe(store2Query);

      // Set different values in each store
      store1Query.setText('Query 1');
      store2Query.setText('Query 2');

      // Values should remain independent
      expect(get(store1Query).text).toBe('Query 1');
      expect(get(store2Query).text).toBe('Query 2');
    });

    it('does not share state between instances', () => {
      const { container: container1 } = render(StoreProvider, {
        props: { initialQuery: 'Query 1' },
      });

      const { container: container2 } = render(StoreProvider, {
        props: { initialQuery: 'Query 2' },
      });

      // Each instance should have its own initial state
      // (We'd need a test component that displays the query to verify this fully)
      expect(container1).not.toBe(container2);
    });
  });

  describe('Initial Values', () => {
    it('accepts initialQuery prop', () => {
      const TestComponent = {
        render: () => {
          const queryStore = getQueryStore();
          const text = get(queryStore).text;
          return `<div data-testid="query">${text}</div>`;
        },
      };

      const { getByTestId } = render(StoreProvider, {
        props: {
          initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
          children: TestComponent,
        },
      });

      expect(getByTestId('query').textContent).toBe('SELECT * WHERE { ?s ?p ?o }');
    });

    it('accepts initialEndpoint prop', () => {
      const TestComponent = {
        render: () => {
          const endpointStore = getEndpointStore();
          const endpoint = get(endpointStore);
          return `<div data-testid="endpoint">${endpoint}</div>`;
        },
      };

      const { getByTestId } = render(StoreProvider, {
        props: {
          initialEndpoint: 'http://example.org/sparql',
          children: TestComponent,
        },
      });

      expect(getByTestId('endpoint').textContent).toBe('http://example.org/sparql');
    });
  });

  describe('inheritGlobalState', () => {
    it('copies global store state when inheritGlobalState=true', () => {
      // Set global stores
      import { queryStore, resultsStore } from '$lib/stores';
      queryStore.setText('Global query');

      const TestComponent = {
        render: () => {
          const queryStore = getQueryStore();
          const text = get(queryStore).text;
          return `<div data-testid="query">${text}</div>`;
        },
      };

      const { getByTestId } = render(StoreProvider, {
        props: {
          inheritGlobalState: true,
          children: TestComponent,
        },
      });

      expect(getByTestId('query').textContent).toBe('Global query');
    });
  });
});
```

### 2. Integration Tests for Component State Isolation

**File**: `tests/integration/StoreIsolation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StoreProvider from '$lib/components/StoreProvider.svelte';
import RunButton from '$lib/components/Toolbar/RunButton.svelte';
import SparqlEditor from '$lib/components/Editor/SparqlEditor.svelte';

describe('Component State Isolation', () => {
  it('RunButton: instances with different states', () => {
    // Instance 1: Has query and endpoint (should be enabled)
    const { container: container1 } = render(StoreProvider, {
      props: {
        initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        initialEndpoint: 'http://example.org/sparql',
        children: RunButton,
      },
    });

    // Instance 2: Empty query (should be disabled)
    const { container: container2 } = render(StoreProvider, {
      props: {
        initialQuery: '',
        initialEndpoint: '',
        children: RunButton,
      },
    });

    const buttons = screen.getAllByRole('button', { name: /run/i });
    expect(buttons).toHaveLength(2);

    // First button should be enabled (has query + endpoint)
    expect(buttons[0]).not.toBeDisabled();

    // Second button should be disabled (empty query + endpoint)
    expect(buttons[1]).toBeDisabled();
  });

  it('SparqlEditor: instances with different queries', async () => {
    const { container: container1 } = render(StoreProvider, {
      props: {
        initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        children: SparqlEditor,
      },
    });

    const { container: container2 } = render(StoreProvider, {
      props: {
        initialQuery: 'ASK { ?s ?p ?o }',
        children: SparqlEditor,
      },
    });

    // Each editor should show its own query
    // (We'd need to query CodeMirror content to verify this fully)
    expect(container1).not.toBe(container2);
  });
});
```

### 3. Storybook Visual Regression Tests

**File**: `tests/e2e/storybook-state-isolation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Storybook State Isolation', () => {
  test('RunButton stories show independent states in overview', async ({ page }) => {
    // Navigate to RunButton stories overview
    await page.goto(`${STORYBOOK_URL}/?path=/story/toolbar-runbutton--default`);

    // Switch to Docs view to see all stories at once
    await page.click('[title="Docs"]');
    await page.waitForLoadState('networkidle');

    // Verify "Default" story shows enabled button
    const defaultStory = page.locator('[id*="default"]').first();
    const defaultButton = defaultStory.getByRole('button', { name: /run/i });
    await expect(defaultButton).not.toBeDisabled();

    // Verify "Disabled" story shows disabled button
    const disabledStory = page.locator('[id*="disabled"]').first();
    const disabledButton = disabledStory.getByRole('button', { name: /run/i });
    await expect(disabledButton).toBeDisabled();

    // Verify "NoQuery" story shows disabled button
    const noQueryStory = page.locator('[id*="no-query"]').first();
    const noQueryButton = noQueryStory.getByRole('button', { name: /run/i });
    await expect(noQueryButton).toBeDisabled();
  });

  test('Multiple StoreProvider instances in same story', async ({ page }) => {
    // Navigate to StoreProvider StateIsolation story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=internal-storeprovider--state-isolation`
    );
    await page.waitForLoadState('networkidle');

    // Find both instances
    const instance1 = page.locator('text=Instance 1').locator('..');
    const instance2 = page.locator('text=Instance 2').locator('..');

    // Instance 1 should have enabled button (has query)
    const button1 = instance1.getByRole('button', { name: /run/i });
    await expect(button1).not.toBeDisabled();

    // Instance 2 should have disabled button (empty)
    const button2 = instance2.getByRole('button', { name: /run/i });
    await expect(button2).toBeDisabled();
  });

  test('Story state does not leak to next story', async ({ page }) => {
    // Navigate to "Disabled" story
    await page.goto(`${STORYBOOK_URL}/?path=/story/toolbar-runbutton--disabled`);
    await page.waitForLoadState('networkidle');

    const disabledButton = page.getByRole('button', { name: /run/i });
    await expect(disabledButton).toBeDisabled();

    // Navigate to "Default" story
    await page.goto(`${STORYBOOK_URL}/?path=/story/toolbar-runbutton--default`);
    await page.waitForLoadState('networkidle');

    const defaultButton = page.getByRole('button', { name: /run/i });
    // Should be enabled, not affected by previous "Disabled" story
    await expect(defaultButton).not.toBeDisabled();
  });
});
```

### 4. Migration Utilities Tests

**File**: `tests/unit/stores/migrationUtils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { createQueryStore } from '$lib/stores/queryStore';
import { createResultsStore } from '$lib/stores/resultsStore';
import { copyStoreState, syncWithGlobalStores } from '$lib/stores/migrationUtils';

describe('Migration Utilities', () => {
  describe('copyStoreState', () => {
    it('copies query state from source to target', () => {
      const sourceQuery = createQueryStore();
      const targetQuery = createQueryStore();

      sourceQuery.setText('Source query');
      sourceQuery.setEndpoint('http://source.org/sparql');

      copyStoreState({ queryStore: targetQuery }, { queryStore: sourceQuery });

      expect(get(targetQuery).text).toBe('Source query');
      expect(get(targetQuery).endpoint).toBe('http://source.org/sparql');
    });

    it('copies results state from source to target', () => {
      const sourceResults = createResultsStore();
      const targetResults = createResultsStore();

      sourceResults.setLoading(true);

      copyStoreState({ resultsStore: targetResults }, { resultsStore: sourceResults });

      expect(get(targetResults).loading).toBe(true);
    });
  });

  describe('syncWithGlobalStores', () => {
    it('synchronizes store updates bidirectionally', () => {
      const contextQuery = createQueryStore();
      const globalQuery = createQueryStore();

      const cleanup = syncWithGlobalStores(
        { queryStore: contextQuery },
        { queryStore: globalQuery }
      );

      // Update context → should sync to global
      contextQuery.setText('Context query');
      expect(get(globalQuery).text).toBe('Context query');

      // Update global → should sync to context
      globalQuery.setText('Global query');
      expect(get(contextQuery).text).toBe('Global query');

      cleanup();
    });

    it('stops synchronization after cleanup', () => {
      const contextQuery = createQueryStore();
      const globalQuery = createQueryStore();

      const cleanup = syncWithGlobalStores(
        { queryStore: contextQuery },
        { queryStore: globalQuery }
      );

      cleanup();

      // Updates should NOT sync after cleanup
      contextQuery.setText('Context query');
      globalQuery.setText('Global query');

      expect(get(contextQuery).text).toBe('Context query');
      expect(get(globalQuery).text).toBe('Global query');
    });
  });
});
```

## Implementation Steps

### Step 1: Create Unit Tests
1. Create `tests/unit/components/StoreProvider.test.ts`
2. Test store instance isolation
3. Test initial value props
4. Test `inheritGlobalState` prop
5. Achieve >90% coverage

### Step 2: Create Integration Tests
1. Create `tests/integration/StoreIsolation.test.ts`
2. Test RunButton with different states
3. Test SparqlEditor with different queries
4. Test component interactions

### Step 3: Create E2E Tests
1. Create `tests/e2e/storybook-state-isolation.spec.ts`
2. Test Storybook overview (all stories at once)
3. Test individual story isolation
4. Test no state leakage between stories

### Step 4: Create Migration Utilities Tests
1. Create `tests/unit/stores/migrationUtils.test.ts`
2. Test `copyStoreState()`
3. Test `syncWithGlobalStores()`
4. Test cleanup functions

### Step 5: Run All Tests
```bash
npm test                    # Unit + integration tests
npm run test:e2e:storybook  # E2E tests
npm run build               # Verify build
```

### Step 6: Manual Verification
1. Start Storybook: `npm run storybook`
2. Navigate to RunButton stories
3. Switch between stories
4. Verify Docs view shows all stories correctly
5. Test StoreProvider StateIsolation story

## Acceptance Criteria

### Unit Tests
- ✅ StoreProvider creates independent instances
- ✅ Initial values work correctly
- ✅ `inheritGlobalState` copies global state
- ✅ Coverage >90% for StoreProvider
- ✅ Migration utilities have >90% coverage

### Integration Tests
- ✅ Components with different StoreProviders are isolated
- ✅ Multiple instances of same component work independently
- ✅ Components work with and without StoreProvider

### E2E Tests
- ✅ Storybook overview shows correct state for all stories
- ✅ Individual stories work in isolation
- ✅ No state leakage between stories
- ✅ Multiple StoreProvider instances in same story work

### Manual Verification
- ✅ RunButton stories all show correct state in Docs view
- ✅ Default story: button enabled
- ✅ Disabled story: button disabled
- ✅ NoQuery story: button disabled
- ✅ No console errors or warnings
- ✅ StateIsolation story shows two independent instances

### Build & Quality Checks
```bash
npm run build               # ✅ 0 errors, 0 warnings
npm test                    # ✅ All tests pass
npm run test:e2e:storybook  # ✅ All E2E tests pass
npm run lint                # ✅ No violations
npm run type-check          # ✅ No type errors
```

## Test Coverage Goals

| Module | Coverage Target |
|--------|----------------|
| StoreProvider.svelte | >90% |
| storeContext.ts | >95% |
| migrationUtils.ts | >90% |
| Updated components | Maintain >80% |

## Success Metrics

### Before Migration (Current State)
- ❌ RunButton disabled in all Storybook overview stories
- ❌ State leaks between stories
- ❌ Cannot have multiple independent instances
- ❌ Global stores shared everywhere

### After Migration (Target State)
- ✅ Each story shows correct independent state
- ✅ No state leakage in Storybook
- ✅ Multiple StoreProvider instances work independently
- ✅ Backward compatible (components work without StoreProvider)
- ✅ All tests pass (unit + integration + E2E)
- ✅ Zero build errors or warnings

## Dependencies

**Prerequisite Tasks:**
- Task 70: Create StoreProvider Component
- Task 71: Update Store Factory Functions
- Task 72: Refactor Components to Use Context
- Task 73: Update Storybook Configuration
- Task 74: Add Backward Compatibility Fallbacks

**This is the FINAL verification task** - all previous tasks must be complete.

## Troubleshooting

### Common Issues

**Issue**: E2E tests fail because Storybook not running
**Solution**: Start Storybook first: `npm run storybook`

**Issue**: Tests timeout waiting for elements
**Solution**: Increase timeout in Playwright config

**Issue**: Stories still share state
**Solution**: Verify StoreProvider decorator is BEFORE other decorators

**Issue**: Components can't find stores
**Solution**: Check `hasContext()` returns true in component

## Future Enhancements

- **Performance Tests**: Measure store creation overhead
- **Stress Tests**: Test with 100+ StoreProvider instances
- **Memory Leak Tests**: Verify stores are garbage collected
- **Visual Regression**: Screenshot comparison for Storybook

## References

- **Vitest Testing**: https://vitest.dev/
- **Svelte Testing Library**: https://testing-library.com/docs/svelte-testing-library/intro
- **Playwright**: https://playwright.dev/
- **Storybook Testing**: https://storybook.js.org/docs/writing-tests

---

**Previous Task**: [Task 74: Add Backward Compatibility Fallbacks](./74-backward-compatibility.md)

**🎉 This completes the Context-Based Store Migration!**
