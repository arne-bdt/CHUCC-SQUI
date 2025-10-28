# Task: TAB-REBUILD-03 - Add CodeMirror Editor (CRITICAL LAYER)

## Objective

Add the **CodeMirror editor** to each tab. This is the **CRITICAL LAYER** where we expect the tab switching bug to appear, based on previous debugging. This task will definitively isolate whether the issue is:

1. **Editor's updateListener** conflicting with tab switches
2. **Store subscription timing** issues
3. **Circular reactivity** between editor ↔ store ↔ tab state

## Prerequisite

✅ **TAB-REBUILD-02** must be complete with all tests passing

## Acceptance Criteria

- ✅ Each tab has its own CodeMirror editor instance
- ✅ Typing in tab 1, switching to tab 2, typing different content works
- ✅ Switching back to tab 1 shows tab 1's original content (NOT tab 2's)
- ✅ **THE CRITICAL TEST PASSES**: Editor content switches correctly between tabs
- ✅ **ALL TESTS PASS**: Integration + E2E
- ✅ Build succeeds with zero errors/warnings

## Implementation Approaches

We will try **THREE different approaches** in order, testing after each one:

### Approach A: Simple State (No Store)

**Hypothesis**: The bug is caused by store reactivity, not the editor itself.

Store editor text in component-local state only (no queryStore):

```typescript
// Per-tab data
interface TabData {
  id: string;
  name: string;
  editorText: string; // Stored in component, not store
}

let tabDataMap = $state<Map<string, TabData>>(new Map());

// Editor update listener writes to local state
EditorView.updateListener.of((update) => {
  if (update.docChanged && tabsState.activeTabId) {
    const tabData = tabDataMap.get(tabsState.activeTabId);
    if (tabData) {
      tabData.editorText = update.state.doc.toString();
      tabDataMap = new Map(tabDataMap);
    }
  }
});

// When switching tabs, update editor directly
$effect(() => {
  if (editorView && tabsState.activeTabId) {
    const tabData = tabDataMap.get(tabsState.activeTabId);
    if (tabData) {
      const currentText = editorView.state.doc.toString();
      if (tabData.editorText !== currentText) {
        editorView.dispatch({
          changes: { from: 0, to: currentText.length, insert: tabData.editorText }
        });
      }
    }
  }
});
```

**Test**: If this works, the bug is in the store reactivity layer.

---

### Approach B: Store with Guard Flag (Enhanced)

**Hypothesis**: Store is needed, but we need better circular update prevention.

Use queryStore but with bulletproof guard mechanism:

```typescript
// Triple-guard approach
let isUpdatingFromStore = false;
let isUpdatingFromTab = false;
let pendingTabSwitch: string | null = null;

// Editor update listener
EditorView.updateListener.of((update) => {
  if (update.docChanged && !isUpdatingFromStore && !isUpdatingFromTab) {
    queryStore.setText(update.state.doc.toString());
  }
});

// Tab switch handler
tabStore.subscribe((state) => {
  if (state.activeTabId !== currentActiveTabId) {
    isUpdatingFromTab = true;
    pendingTabSwitch = state.activeTabId;

    // Save current tab
    if (currentActiveTabId) {
      tabStore.updateTabQuery(currentActiveTabId, { text: editorView.state.doc.toString() });
    }

    // Load new tab
    const newTab = tabStore.getTab(state.activeTabId);
    if (newTab) {
      queryStore.setState(newTab.query);
    }

    currentActiveTabId = state.activeTabId;

    // Clear guard after all updates settle
    requestAnimationFrame(() => {
      isUpdatingFromTab = false;
      pendingTabSwitch = null;
    });
  }
});

// Store subscription
queryStore.subscribe((value) => {
  if (!isUpdatingFromTab && editorView) {
    isUpdatingFromStore = true;
    editorView.dispatch({ changes: {...} });
    requestAnimationFrame(() => {
      isUpdatingFromStore = false;
    });
  }
});
```

**Test**: If this works, the bug was in timing/guard implementation.

---

### Approach C: Event-Based (No Reactive Subscriptions)

**Hypothesis**: Svelte 5 subscriptions in `$effect` are the problem.

Use explicit event system instead of reactive subscriptions:

```typescript
// Custom event bus
const tabSwitchEvents = new EventTarget();

// Tab switch triggers event (not subscription)
function handleTabChange(tabId: string) {
  // Save current
  if (editorView && currentTabId) {
    saveTabContent(currentTabId, editorView.state.doc.toString());
  }

  // Switch
  currentTabId = tabId;

  // Load new (via event, not reactivity)
  const content = getTabContent(tabId);
  editorView?.dispatch({ changes: { from: 0, to: editorView.state.doc.length, insert: content } });
}

// No subscriptions, just direct calls
```

**Test**: If this works, the bug is in Svelte 5's reactive subscription system.

## Implementation Steps

### Step 1: Implement Approach A (Simple State)

Create `src/lib/components/Tabs/TabsWithEditor.svelte` using Approach A.

**CRITICAL**: Copy the EXACT editor setup from `SparqlEditor.svelte` but with local state.

### Step 2: Write The Critical Test

Create `tests/integration/TabsWithEditor.test.ts`:

```typescript
import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import TabsWithEditor from '$lib/components/Tabs/TabsWithEditor.svelte';

describe('TabsWithEditor - The Critical Test', () => {
  it('should switch editor content between tabs correctly', async () => {
    const user = userEvent.setup();
    const { container } = render(TabsWithEditor, { props: { instanceId: 'critical-test' } });

    // Wait for editor to load
    await waitFor(() => {
      expect(container.querySelector('.cm-content')).toBeInTheDocument();
    });

    const editor = container.querySelector('.cm-content') as HTMLElement;

    // Tab 1: Type query A
    await user.click(editor);
    await user.keyboard('SELECT * FROM tab1');

    await waitFor(() => {
      expect(editor.textContent).toBe('SELECT * FROM tab1');
    });

    // Add tab 2
    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Query 2')).toBeInTheDocument();
    });

    // Tab 2 should be empty
    await waitFor(() => {
      expect(editor.textContent).toBe('');
    });

    // Tab 2: Type query B
    await user.click(editor);
    await user.keyboard('SELECT * FROM tab2');

    await waitFor(() => {
      expect(editor.textContent).toBe('SELECT * FROM tab2');
    });

    // THE CRITICAL TEST: Click back to tab 1
    const tab1Button = screen.getByText('Query 1');
    await user.click(tab1Button);

    // Tab 1 should show its original query, NOT tab 2's query!
    await waitFor(() => {
      expect(editor.textContent).toBe('SELECT * FROM tab1');
    }, { timeout: 3000 });

    // Switch back to tab 2 to verify
    const tab2Button = screen.getByText('Query 2');
    await user.click(tab2Button);

    await waitFor(() => {
      expect(editor.textContent).toBe('SELECT * FROM tab2');
    });
  });

  it('should handle rapid tab switching without losing content', async () => {
    const user = userEvent.setup();
    const { container } = render(TabsWithEditor, { props: { instanceId: 'rapid-test' } });

    await waitFor(() => {
      expect(container.querySelector('.cm-content')).toBeInTheDocument();
    });

    const editor = container.querySelector('.cm-content') as HTMLElement;

    // Create 3 tabs with different content
    await user.click(editor);
    await user.keyboard('TAB1');

    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);
    await waitFor(() => expect(screen.getByText('Query 2')).toBeInTheDocument());

    await user.click(editor);
    await user.keyboard('TAB2');

    await user.click(addButton);
    await waitFor(() => expect(screen.getByText('Query 3')).toBeInTheDocument());

    await user.click(editor);
    await user.keyboard('TAB3');

    // Rapidly switch: 3 → 1 → 2 → 3
    await user.click(screen.getByText('Query 1'));
    await waitFor(() => expect(editor.textContent).toBe('TAB1'));

    await user.click(screen.getByText('Query 2'));
    await waitFor(() => expect(editor.textContent).toBe('TAB2'));

    await user.click(screen.getByText('Query 3'));
    await waitFor(() => expect(editor.textContent).toBe('TAB3'));

    // Final verification
    await user.click(screen.getByText('Query 1'));
    await waitFor(() => expect(editor.textContent).toBe('TAB1'));
  });
});
```

### Step 3: Write E2E Test

Create `tests/e2e/tabs-with-editor.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('TabsWithEditor E2E - The Critical Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/tabrebuild-03-tabswitheditor--default');
    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.cm-content').first().waitFor({ timeout: 10000 });
  });

  test('should switch editor content when clicking between tabs', async ({ page }) => {
    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    const editor = storyFrame.locator('.cm-content');

    // Type in tab 1
    await editor.click();
    await editor.fill('SELECT * FROM tab1');
    await page.waitForTimeout(200);

    expect(await editor.textContent()).toBe('SELECT * FROM tab1');

    // Add tab 2
    await storyFrame.locator('[aria-label="Add new tab"]').click();
    await page.waitForTimeout(200);

    // Tab 2 should be empty
    expect(await editor.textContent()).toBe('');

    // Type in tab 2
    await editor.click();
    await editor.fill('SELECT * FROM tab2');
    await page.waitForTimeout(200);

    expect(await editor.textContent()).toBe('SELECT * FROM tab2');

    // THE CRITICAL TEST: Switch back to tab 1
    await storyFrame.locator('.tab-name').first().click();
    await page.waitForTimeout(300);

    // Tab 1 MUST show its original content, not tab 2's
    const tab1Content = await editor.textContent();
    console.log('[E2E CRITICAL TEST] Tab 1 content after switch:', tab1Content);

    expect(tab1Content).toBe('SELECT * FROM tab1');
    expect(tab1Content).not.toBe('SELECT * FROM tab2'); // Explicit negative test
  });
});
```

### Step 4: Test Each Approach

1. **Test Approach A**:
   ```bash
   npm test -- TabsWithEditor
   npm run test:e2e -- tabs-with-editor
   ```

2. **If Approach A fails**, implement Approach B and test again

3. **If Approach B fails**, implement Approach C and test again

## Expected Outcomes

### If Approach A succeeds:
✅ **Bug isolated**: The issue is in store reactivity, not the editor
📌 **Fix**: Remove queryStore from tab switching, use direct state management
🎯 **Next**: Apply this pattern to main component

### If only Approach B succeeds:
✅ **Bug isolated**: Store works but needs better guards
📌 **Fix**: Implement triple-guard pattern in main component
🎯 **Next**: Backport Approach B to SparqlQueryUI

### If only Approach C succeeds:
✅ **Bug isolated**: Svelte 5 subscriptions in $effect are broken
📌 **Fix**: Use event system instead of reactive subscriptions
🎯 **Next**: Major refactor of main component

### If ALL approaches fail:
🔴 **Bug is in CodeMirror interaction** itself
📌 **Next**: Deep dive into CodeMirror updateListener and dispatch timing

## Testing Checklist

- [ ] Approach A implemented
- [ ] Approach A tests pass (integration + E2E)
- [ ] If failed: Approach B implemented
- [ ] If failed: Approach B tests pass
- [ ] If failed: Approach C implemented
- [ ] If failed: Approach C tests pass
- [ ] Bug root cause identified and documented
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm test`

## Success Metrics

**This task is successful when:**

✅ **At least ONE approach passes all tests**
✅ **We know EXACTLY why that approach works**
✅ **We can explain WHY the current implementation fails**
✅ **We have a concrete fix strategy**

## Next Task

→ **TAB-REBUILD-04-ADD-RESULTS.md** (Complete the component)

## Documentation

Create `TAB-SWITCHING-ROOT-CAUSE.md` documenting:
- Which approach worked
- Why it worked
- Why the original implementation failed
- Recommended fix for main component
