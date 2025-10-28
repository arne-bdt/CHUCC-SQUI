# Task: TAB-REBUILD-02 - Add Toolbar Integration

## Objective

Add a **simple toolbar** to each tab panel. This verifies that we can add interactive components to tabs without breaking the tab switching functionality established in Task 01.

## Prerequisite

✅ **TAB-REBUILD-01** must be complete with all tests passing

## Acceptance Criteria

- ✅ Each tab has a toolbar with a counter button
- ✅ Counter state is **independent per tab**
- ✅ Switching tabs preserves each tab's counter value
- ✅ Toolbar actions don't interfere with tab switching
- ✅ **ALL TESTS PASS**: Integration + E2E
- ✅ Build succeeds with zero errors/warnings

## Implementation Steps

### Step 1: Extend Tab State

Modify the component from Task 01 to store per-tab data:

```typescript
// Add to MinimalTabs.svelte or create TabsWithToolbar.svelte
interface TabData {
  id: string;
  name: string;
  counter: number; // Per-tab state
}

let tabDataMap = $state<Map<string, TabData>>(new Map());

// When creating/switching tabs
function initializeTabData(tabId: string, tabName: string) {
  if (!tabDataMap.has(tabId)) {
    tabDataMap.set(tabId, {
      id: tabId,
      name: tabName,
      counter: 0,
    });
  }
}

function incrementCounter(tabId: string) {
  const tabData = tabDataMap.get(tabId);
  if (tabData) {
    tabData.counter += 1;
    tabDataMap = new Map(tabDataMap); // Trigger reactivity
  }
}
```

### Step 2: Add Toolbar Component

Create simple toolbar in the tab content:

```svelte
{#if tabsState.activeTabId}
  {@const activeTabData = tabDataMap.get(tabsState.activeTabId)}
  <div class="tab-content" data-testid="tab-content">
    <div class="toolbar">
      <Button
        kind="tertiary"
        size="small"
        on:click={() => incrementCounter(tabsState.activeTabId)}
        data-testid="increment-button"
      >
        Counter: {activeTabData?.counter || 0}
      </Button>
    </div>

    <h3>Active Tab: {activeTabData?.name}</h3>
    <p class="tab-id" data-testid="active-tab-id">Tab ID: {tabsState.activeTabId}</p>
    <p data-testid="counter-value">Counter value: {activeTabData?.counter || 0}</p>
  </div>
{/if}
```

### Step 3: Write Integration Tests

Add to `tests/integration/MinimalTabs.test.ts`:

```typescript
describe('MinimalTabs with Toolbar', () => {
  it('should preserve counter state when switching tabs', async () => {
    const user = userEvent.setup();
    render(MinimalTabs, { props: { instanceId: 'test-toolbar-1' } });

    await waitFor(() => {
      expect(screen.getByText('Query 1')).toBeInTheDocument();
    });

    // Increment counter in tab 1
    const incrementButton = screen.getByTestId('increment-button');
    await user.click(incrementButton);
    await user.click(incrementButton);

    await waitFor(() => {
      expect(screen.getByTestId('counter-value')).toHaveTextContent('Counter value: 2');
    });

    // Add and switch to tab 2
    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Query 2')).toBeInTheDocument();
    });

    // Tab 2 should have counter = 0
    await waitFor(() => {
      expect(screen.getByTestId('counter-value')).toHaveTextContent('Counter value: 0');
    });

    // Increment tab 2's counter once
    await user.click(screen.getByTestId('increment-button'));

    await waitFor(() => {
      expect(screen.getByTestId('counter-value')).toHaveTextContent('Counter value: 1');
    });

    // CRITICAL TEST: Switch back to tab 1
    const tab1Button = screen.getByText('Query 1');
    await user.click(tab1Button);

    // Tab 1 should STILL have counter = 2 (preserved!)
    await waitFor(() => {
      expect(screen.getByTestId('counter-value')).toHaveTextContent('Counter value: 2');
    });
  });
});
```

### Step 4: Write E2E Test

Add to `tests/e2e/minimal-tabs.storybook.spec.ts`:

```typescript
test('should preserve toolbar state when switching tabs', async ({ page }) => {
  const storyFrame = page.frameLocator('#storybook-preview-iframe');

  // Increment counter in tab 1
  const incrementButton = storyFrame.locator('[data-testid="increment-button"]');
  await incrementButton.click();
  await incrementButton.click();

  let counterValue = await storyFrame.locator('[data-testid="counter-value"]').textContent();
  expect(counterValue).toContain('2');

  // Add tab 2
  await storyFrame.locator('[aria-label="Add new tab"]').click();
  await page.waitForTimeout(200);

  // Tab 2 should start at 0
  counterValue = await storyFrame.locator('[data-testid="counter-value"]').textContent();
  expect(counterValue).toContain('0');

  // Click back to tab 1
  await storyFrame.locator('.tab-name').first().click();
  await page.waitForTimeout(200);

  // CRITICAL: Tab 1's counter should still be 2
  counterValue = await storyFrame.locator('[data-testid="counter-value"]').textContent();
  expect(counterValue).toContain('2');
});
```

## Testing Checklist

- [ ] Counter increments when clicked
- [ ] Each tab has independent counter state
- [ ] Switching tabs preserves counter values
- [ ] Adding new tabs starts counter at 0
- [ ] All integration tests pass
- [ ] E2E test passes
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm test`

## Success Metrics

If this task completes successfully with ALL tests passing, it proves:

✅ **Per-tab state management works**
✅ **Tab switching doesn't lose component state**
✅ **Ready to add CodeMirror editor** (the critical layer)

## Next Task

If all tests pass → **TAB-REBUILD-03-ADD-EDITOR.md** (The critical test!)

If toolbar state is lost → Bug is in tab state management, not editor-specific
