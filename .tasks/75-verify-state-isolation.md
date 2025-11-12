# Task 75: Verify State Isolation with Tests

## Overview

Create comprehensive tests to verify that the context-based store implementation provides proper state isolation. Focus on testing the ONE pattern (context-based), not backward compatibility.

## Motivation

### Testing Goals

1. **Prove Isolation**: Verify that multiple StoreProvider instances don't share state
2. **Storybook Validation**: Confirm stories no longer leak state
3. **Regression Prevention**: Catch any future state isolation issues
4. **Documentation**: Tests serve as usage examples

## Requirements

### 1. Unit Tests for StoreProvider

**File**: `tests/unit/components/StoreProvider.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import StoreProvider from '$lib/components/StoreProvider.svelte';
import TestComponent from './TestComponent.svelte'; // Helper component

describe('StoreProvider', () => {
  describe('State Isolation', () => {
    it('creates independent store instances for each provider', () => {
      // Render two separate StoreProviders with different initial values
      const { container: container1 } = render(StoreProvider, {
        props: {
          initialQuery: 'Query 1',
          initialEndpoint: 'http://endpoint1.org/sparql',
        },
      });

      const { container: container2 } = render(StoreProvider, {
        props: {
          initialQuery: 'Query 2',
          initialEndpoint: 'http://endpoint2.org/sparql',
        },
      });

      // Verify they are separate DOM trees
      expect(container1).not.toBe(container2);

      // Would need test component to verify store values are different
    });

    it('does not share state between instances', async () => {
      // Create test component that displays query from store
      const TestDisplay = {
        render: () => {
          const queryStore = getQueryStore();
          const query = get(queryStore).text;
          return `<div data-testid="query">${query}</div>`;
        },
      };

      const { getByTestId: getByTestId1 } = render(StoreProvider, {
        props: {
          initialQuery: 'Query 1',
          children: TestDisplay,
        },
      });

      const { getByTestId: getByTestId2 } = render(StoreProvider, {
        props: {
          initialQuery: 'Query 2',
          children: TestDisplay,
        },
      });

      // Each instance should have its own query
      expect(getByTestId1('query').textContent).toBe('Query 1');
      expect(getByTestId2('query').textContent).toBe('Query 2');
    });
  });

  describe('Initial Values', () => {
    it('initializes queryStore with initialQuery prop', () => {
      // Test that stores are initialized correctly
      render(StoreProvider, {
        props: {
          initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        },
      });

      // Would verify via test component that reads from store
    });

    it('initializes endpointStore with initialEndpoint prop', () => {
      render(StoreProvider, {
        props: {
          initialEndpoint: 'http://example.org/sparql',
        },
      });

      // Would verify via test component
    });
  });

  describe('Error Handling', () => {
    it('components throw error without StoreProvider', () => {
      // Component that uses getQueryStore()
      const ComponentWithoutProvider = {
        render: () => {
          expect(() => {
            getQueryStore(); // Should throw
          }).toThrow('[SQUI] queryStore not found in context');
        },
      };

      render(ComponentWithoutProvider);
    });
  });
});
```

### 2. Integration Tests for Component State Isolation

**File**: `tests/integration/StoreIsolation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import StoreProvider from '$lib/components/StoreProvider.svelte';
import RunButton from '$lib/components/Toolbar/RunButton.svelte';
import SparqlEditor from '$lib/components/Editor/SparqlEditor.svelte';

describe('Component State Isolation', () => {
  it('RunButton: multiple instances with different states', async () => {
    // Instance 1: Has query and endpoint (should be enabled)
    render(StoreProvider, {
      props: {
        initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        initialEndpoint: 'http://example.org/sparql',
        children: RunButton,
      },
    });

    // Instance 2: Empty query (should be disabled)
    render(StoreProvider, {
      props: {
        initialQuery: '',
        initialEndpoint: '',
        children: RunButton,
      },
    });

    const buttons = await screen.findAllByRole('button', { name: /run/i });
    expect(buttons).toHaveLength(2);

    // First button should be enabled
    await waitFor(() => {
      expect(buttons[0]).not.toBeDisabled();
    });

    // Second button should be disabled
    await waitFor(() => {
      expect(buttons[1]).toBeDisabled();
    });
  });

  it('SparqlEditor: multiple instances with different queries', async () => {
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

    // Verify different DOM trees
    expect(container1).not.toBe(container2);

    // Would need to query CodeMirror content to verify different queries
  });

  it('Multiple components share same StoreProvider instance', async () => {
    // When multiple components are under ONE StoreProvider,
    // they should share the same stores

    const App = {
      render: () => `
        <div>
          <SparqlEditor />
          <RunButton />
        </div>
      `,
    };

    render(StoreProvider, {
      props: {
        initialQuery: 'SELECT * WHERE { ?s ?p ?o }',
        initialEndpoint: 'http://example.org/sparql',
        children: App,
      },
    });

    // Editor and button should share the same store state
    const button = await screen.findByRole('button', { name: /run/i });
    await waitFor(() => {
      expect(button).not.toBeDisabled(); // Has query from shared store
    });
  });
});
```

### 3. Storybook E2E Tests

**File**: `tests/e2e/storybook-state-isolation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Storybook State Isolation', () => {
  test('RunButton stories show independent states', async ({ page }) => {
    // Navigate to RunButton stories in Docs view (shows all stories)
    await page.goto(`${STORYBOOK_URL}/?path=/docs/toolbar-runbutton--docs`);
    await page.waitForLoadState('networkidle');

    // Wait for stories to render
    await page.waitForTimeout(2000);

    // Verify "Default" story shows enabled button
    const defaultCanvas = page.locator('[id*="story--toolbar-runbutton--default"]');
    const defaultButton = defaultCanvas.getByRole('button', { name: /run/i });
    await expect(defaultButton).toBeVisible();
    await expect(defaultButton).not.toBeDisabled();

    // Verify "Disabled" story shows disabled button
    const disabledCanvas = page.locator('[id*="story--toolbar-runbutton--disabled"]');
    const disabledButton = disabledCanvas.getByRole('button', { name: /run/i });
    await expect(disabledButton).toBeVisible();
    await expect(disabledButton).toBeDisabled();
  });

  test('Multiple StoreProvider instances in same story', async ({ page }) => {
    // Navigate to StoreProvider demonstration story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=internal-storeprovider--state-isolation&viewMode=story`
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Verify two independent instances exist
    const buttons = page.getByRole('button', { name: /run/i });
    await expect(buttons).toHaveCount(2);

    // First instance (has query) should be enabled
    await expect(buttons.nth(0)).not.toBeDisabled();

    // Second instance (empty) should be disabled
    await expect(buttons.nth(1)).toBeDisabled();
  });

  test('Story state does not leak between navigation', async ({ page }) => {
    // Navigate to "Disabled" story
    await page.goto(
      `${STORYBOOK_URL}/?path=/story/toolbar-runbutton--disabled&viewMode=story`
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const disabledButton = page.getByRole('button', { name: /run/i });
    await expect(disabledButton).toBeDisabled();

    // Navigate to "Default" story
    await page.goto(
      `${STORYBOOK_URL}/?path=/story/toolbar-runbutton--default&viewMode=story`
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const defaultButton = page.getByRole('button', { name: /run/i });
    // Should be enabled, not affected by previous "Disabled" story
    await expect(defaultButton).not.toBeDisabled();
  });
});
```

### 4. Store Context Tests

**File**: `tests/unit/stores/storeContext.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getQueryStore, getResultsStore, getUIStore } from '$lib/stores/storeContext';

describe('storeContext utilities', () => {
  describe('Error handling without StoreProvider', () => {
    it('getQueryStore throws without context', () => {
      expect(() => {
        getQueryStore();
      }).toThrow('[SQUI] queryStore not found in context');
    });

    it('getResultsStore throws without context', () => {
      expect(() => {
        getResultsStore();
      }).toThrow('[SQUI] resultsStore not found in context');
    });

    it('getUIStore throws without context', () => {
      expect(() => {
        getUIStore();
      }).toThrow('[SQUI] uiStore not found in context');
    });
  });

  describe('With StoreProvider context', () => {
    // Would need to set up Svelte context for these tests
    // Or test via integration tests with actual component rendering
  });
});
```

## Implementation Steps

### Step 1: Create Unit Tests
1. Create `tests/unit/components/StoreProvider.test.ts`
2. Test store instance isolation
3. Test initial value props
4. Test error handling
5. Achieve >90% coverage

### Step 2: Create Integration Tests
1. Create `tests/integration/StoreIsolation.test.ts`
2. Test RunButton with different states
3. Test SparqlEditor with different queries
4. Test component interactions

### Step 3: Create E2E Tests
1. Create or update `tests/e2e/storybook-state-isolation.spec.ts`
2. Test Storybook Docs view (all stories at once)
3. Test individual story isolation
4. Test no state leakage between stories

### Step 4: Create Context Tests
1. Create `tests/unit/stores/storeContext.test.ts`
2. Test error throwing without context
3. Test successful access with context

### Step 5: Run All Tests
```bash
npm test                    # Unit + integration tests
npm run test:e2e:storybook  # E2E tests (Storybook must be running)
npm run build               # Verify build
```

### Step 6: Manual Verification
1. Start Storybook: `npm run storybook`
2. Navigate to RunButton stories
3. Switch between stories
4. Verify Docs view shows all stories correctly
5. Check StoreProvider demonstration story

## Acceptance Criteria

### Unit Tests
- ✅ StoreProvider creates independent instances
- ✅ Initial values work correctly
- ✅ Error throwing works without context
- ✅ Coverage >80% for StoreProvider
- ✅ All tests pass

### Integration Tests
- ✅ Components with different StoreProviders are isolated
- ✅ Multiple instances of same component work independently
- ✅ Components under same StoreProvider share stores
- ✅ All tests pass

### E2E Tests
- ✅ Storybook Docs view shows correct state for all stories
- ✅ Individual stories work in isolation
- ✅ No state leakage between stories
- ✅ Multiple StoreProvider instances in same story work
- ✅ All E2E tests pass

### Manual Verification
- ✅ RunButton stories all show correct state in Docs view
- ✅ Default story: button enabled
- ✅ Disabled story: button disabled
- ✅ NoQuery story: button disabled
- ✅ No console errors or warnings

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
| StoreProvider.svelte | >80% |
| storeContext.ts | >90% |
| Updated components | Maintain >80% |

## Success Metrics

### Before Migration
- ❌ RunButton disabled in all Storybook overview stories
- ❌ State leaks between stories
- ❌ Cannot have multiple independent instances
- ❌ Global stores shared everywhere

### After Migration
- ✅ Each story shows correct independent state
- ✅ No state leakage in Storybook
- ✅ Multiple StoreProvider instances work independently
- ✅ All tests pass (unit + integration + E2E)
- ✅ Zero build errors or warnings
- ✅ Clean, maintainable architecture

## Dependencies

**Prerequisite Tasks:**
- Task 70: Create StoreProvider Component
- Task 71: Update Store Factory Functions
- Task 72: Refactor Components to Use Context
- Task 73: Update Storybook Configuration
- Task 74: Finalization

**This is the FINAL task** - verifies all previous work.

## Troubleshooting

### Common Issues

**Issue**: E2E tests fail because Storybook not running
**Solution**: Start Storybook first: `npm run storybook`

**Issue**: Tests timeout waiting for elements
**Solution**: Increase timeout or add more explicit waits

**Issue**: Stories still share state
**Solution**: Verify StoreProvider decorator is configured correctly

**Issue**: Components can't find stores
**Solution**: Verify StoreProvider wraps components in tests

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

**Previous Task**: [Task 74: Finalization](./74-finalization.md)

**🎉 This completes the Context-Based Store Migration!**
