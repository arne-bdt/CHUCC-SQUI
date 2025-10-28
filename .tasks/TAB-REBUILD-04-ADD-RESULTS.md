# Task: TAB-REBUILD-04 - Add Results Table

## Objective

Add the **results table** (DataTable) to complete the tab component. This verifies that the solution from Task 03 works with additional complexity (large datasets, virtual scrolling).

## Prerequisite

✅ **TAB-REBUILD-03** must be complete with tab switching working
✅ **Root cause documented** in `TAB-SWITCHING-ROOT-CAUSE.md`

## Acceptance Criteria

- ✅ Each tab can display query results independently
- ✅ Switching tabs preserves results (doesn't clear or mix data)
- ✅ Large datasets (10,000+ rows) render without freezing
- ✅ DataTable doesn't interfere with tab switching
- ✅ **ALL TESTS PASS**: Integration + E2E
- ✅ Build succeeds with zero errors/warnings

## Implementation Steps

### Step 1: Extend Tab Data with Results

```typescript
import type { SparqlResults } from '$lib/types';

interface TabData {
  id: string;
  name: string;
  editorText: string;
  results: SparqlResults | null; // Add results
  isExecuting: boolean;
}

let tabDataMap = $state<Map<string, TabData>>(new Map());

function initializeTabData(tabId: string, tabName: string): TabData {
  return {
    id: tabId,
    name: tabName,
    editorText: '',
    results: null,
    isExecuting: false,
  };
}
```

### Step 2: Add Mock Query Execution

```typescript
// Mock execution for testing (real SPARQL execution in Task 05)
async function executeQuery(tabId: string, query: string) {
  const tabData = tabDataMap.get(tabId);
  if (!tabData) return;

  tabData.isExecuting = true;
  tabDataMap = new Map(tabDataMap);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock results
  const mockResults: SparqlResults = {
    head: { vars: ['s', 'p', 'o'] },
    results: {
      bindings: [
        { s: { type: 'uri', value: 'http://example.org/subject1' }, /* ... */ },
        { s: { type: 'uri', value: 'http://example.org/subject2' }, /* ... */ },
      ],
    },
  };

  tabData.results = mockResults;
  tabData.isExecuting = false;
  tabDataMap = new Map(tabDataMap);
}
```

### Step 3: Add Results Display

```svelte
{#if tabsState.activeTabId}
  {@const activeTabData = tabDataMap.get(tabsState.activeTabId)}

  <div class="tab-content">
    <!-- Editor (from Task 03) -->
    <div class="editor-section">
      <div bind:this={editorElement} class="codemirror-container"></div>
      <Button
        kind="primary"
        size="small"
        on:click={() => executeQuery(tabsState.activeTabId, activeTabData.editorText)}
        disabled={activeTabData.isExecuting || !activeTabData.editorText}
        data-testid="run-query-button"
      >
        {activeTabData.isExecuting ? 'Executing...' : 'Run Query'}
      </Button>
    </div>

    <!-- Results Section -->
    <div class="results-section" data-testid="results-section">
      {#if activeTabData.isExecuting}
        <div class="loading">
          <InlineLoading description="Executing query..." />
        </div>
      {:else if activeTabData.results}
        <DataTable
          data={activeTabData.results}
          instanceId={`results-${tabsState.activeTabId}`}
        />
      {:else}
        <div class="empty-results" data-testid="empty-results">
          <p>No results yet. Run a query to see results.</p>
        </div>
      {/if}
    </div>
  </div>
{/if}
```

### Step 4: Write Integration Tests

Create `tests/integration/TabsWithResults.test.ts`:

```typescript
import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import TabsWithResults from '$lib/components/Tabs/TabsWithResults.svelte';

describe('TabsWithResults', () => {
  it('should preserve results when switching tabs', async () => {
    const user = userEvent.setup();
    const { container } = render(TabsWithResults, { props: { instanceId: 'results-test-1' } });

    await waitFor(() => {
      expect(container.querySelector('.cm-content')).toBeInTheDocument();
    });

    const editor = container.querySelector('.cm-content') as HTMLElement;

    // Tab 1: Type query and execute
    await user.click(editor);
    await user.keyboard('SELECT * FROM tab1');

    const runButton = screen.getByTestId('run-query-button');
    await user.click(runButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.queryByText('Executing...')).not.toBeInTheDocument();
      expect(container.querySelector('.data-table')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Add tab 2
    await user.click(screen.getByLabelText('Add new tab'));
    await waitFor(() => expect(screen.getByText('Query 2')).toBeInTheDocument());

    // Tab 2 should show empty results
    await waitFor(() => {
      expect(screen.getByTestId('empty-results')).toBeInTheDocument();
    });

    // Tab 2: Execute different query
    await user.click(editor);
    await user.keyboard('SELECT * FROM tab2');
    await user.click(screen.getByTestId('run-query-button'));

    await waitFor(() => {
      expect(screen.queryByText('Executing...')).not.toBeInTheDocument();
      expect(container.querySelector('.data-table')).toBeInTheDocument();
    }, { timeout: 2000 });

    // CRITICAL TEST: Switch back to tab 1
    await user.click(screen.getByText('Query 1'));

    // Tab 1 should show its original results (not tab 2's, not empty)
    await waitFor(() => {
      expect(editor.textContent).toBe('SELECT * FROM tab1');
      expect(container.querySelector('.data-table')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-results')).not.toBeInTheDocument();
    });
  });

  it('should handle large datasets without freezing', async () => {
    const user = userEvent.setup();
    const { container } = render(TabsWithResults, { props: { instanceId: 'large-data-test' } });

    await waitFor(() => {
      expect(container.querySelector('.cm-content')).toBeInTheDocument();
    });

    // Mock large dataset (10,000 rows)
    const largeMockResults = {
      head: { vars: ['s', 'p', 'o'] },
      results: {
        bindings: Array.from({ length: 10000 }, (_, i) => ({
          s: { type: 'uri', value: `http://example.org/subject${i}` },
          p: { type: 'uri', value: `http://example.org/predicate${i}` },
          o: { type: 'literal', value: `Object ${i}` },
        })),
      },
    };

    // Override mock to return large dataset
    // ... (implementation-specific)

    const editor = container.querySelector('.cm-content') as HTMLElement;
    await user.click(editor);
    await user.keyboard('SELECT * FROM large');

    const runButton = screen.getByTestId('run-query-button');
    await user.click(runButton);

    // Should render without freezing (timeout = 5 seconds max)
    await waitFor(() => {
      expect(container.querySelector('.data-table')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Switch tabs and back (should not freeze)
    await user.click(screen.getByLabelText('Add new tab'));
    await waitFor(() => expect(screen.getByText('Query 2')).toBeInTheDocument());

    await user.click(screen.getByText('Query 1'));
    await waitFor(() => {
      expect(editor.textContent).toBe('SELECT * FROM large');
      expect(container.querySelector('.data-table')).toBeInTheDocument();
    });
  });
});
```

### Step 5: Write E2E Test

Create `tests/e2e/tabs-with-results.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('TabsWithResults E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/tabrebuild-04-tabswithresults--default');
    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.cm-content').first().waitFor({ timeout: 10000 });
  });

  test('should preserve results when switching tabs', async ({ page }) => {
    const storyFrame = page.frameLocator('#storybook-preview-iframe');

    // Execute query in tab 1
    const editor = storyFrame.locator('.cm-content');
    await editor.click();
    await editor.fill('SELECT * FROM tab1');

    await storyFrame.locator('[data-testid="run-query-button"]').click();

    // Wait for results
    await storyFrame.locator('.data-table').waitFor({ timeout: 3000 });

    // Add tab 2
    await storyFrame.locator('[aria-label="Add new tab"]').click();
    await page.waitForTimeout(200);

    // Tab 2 should be empty
    await expect(storyFrame.locator('[data-testid="empty-results"]')).toBeVisible();

    // Execute in tab 2
    await editor.click();
    await editor.fill('SELECT * FROM tab2');
    await storyFrame.locator('[data-testid="run-query-button"]').click();
    await storyFrame.locator('.data-table').waitFor({ timeout: 3000 });

    // Switch back to tab 1
    await storyFrame.locator('.tab-name').first().click();
    await page.waitForTimeout(300);

    // CRITICAL: Tab 1 should show results (not empty)
    await expect(storyFrame.locator('.data-table')).toBeVisible();
    await expect(storyFrame.locator('[data-testid="empty-results"]')).not.toBeVisible();

    // Verify editor content is also preserved
    expect(await editor.textContent()).toBe('SELECT * FROM tab1');
  });
});
```

## Testing Checklist

- [ ] Results display after query execution
- [ ] Results are independent per tab
- [ ] Switching tabs preserves results
- [ ] Large datasets (10K+ rows) render without freezing
- [ ] DataTable doesn't break tab switching
- [ ] All integration tests pass
- [ ] E2E test passes
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm test`

## Success Metrics

If this task completes successfully with ALL tests passing, it proves:

✅ **Solution from Task 03 scales** to complex components (DataTable)
✅ **Tab switching is robust** under real-world load (large datasets)
✅ **Component is nearly feature-complete**

## Next Task

→ **TAB-REBUILD-05-INTEGRATION.md** (Wire up real SPARQL, migrate to main app)

## Notes

- Use the **SAME approach** that worked in Task 03 (A, B, or C)
- Don't add new reactive patterns - keep it consistent
- Mock results for testing; real SPARQL execution in Task 05
