# Task: TAB-REBUILD-01 - Minimal Tabs Component

## Objective

Create a **minimal, isolated tabs component** that ONLY handles tab state - no editor, no toolbar, no results. This establishes the foundation and verifies that basic tab switching works with Carbon Tabs and our tabStore.

## Acceptance Criteria

- ✅ Component renders with Carbon Tabs
- ✅ Displays tab name in each tab panel
- ✅ Can add new tabs via button
- ✅ Can close tabs (minimum 1 tab always exists)
- ✅ Clicking tabs changes activeTabId in store
- ✅ Each tab panel shows its unique tab ID to verify switching works
- ✅ **ALL TESTS PASS**: Unit tests + E2E tests
- ✅ Build succeeds with zero errors/warnings

## Implementation Steps

### Step 1: Create Minimal Component

Create `src/lib/components/Tabs/MinimalTabs.svelte`:

```svelte
<script lang="ts">
  import { Tabs, Tab, Button } from 'carbon-components-svelte';
  import { Add, Close } from 'carbon-icons-svelte';
  import { createTabStore } from '$lib/stores/tabStore';
  import { onMount } from 'svelte';

  interface Props {
    instanceId?: string;
  }

  let { instanceId = 'minimal-tabs' }: Props = $props();

  // Create instance-specific tab store
  const tabStore = createTabStore({
    instanceId,
    disablePersistence: false
  });

  let tabsState = $state({ tabs: [], activeTabId: null });
  let selectedIndex = $state(0);

  onMount(() => {
    // Initialize with one tab
    tabStore.createTab();

    // Subscribe to tab changes
    const unsubscribe = tabStore.subscribe((state) => {
      tabsState = state;

      // Update selectedIndex to match activeTabId
      const newIndex = state.tabs.findIndex(t => t.id === state.activeTabId);
      if (newIndex !== -1) {
        selectedIndex = newIndex;
      }
    });

    return unsubscribe;
  });

  function handleTabChange(event: CustomEvent<{ selectedIndex: number }>) {
    const newIndex = event.detail.selectedIndex;
    const newTab = tabsState.tabs[newIndex];
    if (newTab) {
      tabStore.setActiveTab(newTab.id);
    }
  }

  function handleAddTab() {
    tabStore.createTab();
  }

  function handleCloseTab(tabId: string, event: Event) {
    event.stopPropagation();
    tabStore.deleteTab(tabId);
  }
</script>

<div class="minimal-tabs-container">
  <div class="tabs-header">
    <Button
      kind="ghost"
      size="small"
      iconDescription="Add new tab"
      icon={Add}
      on:click={handleAddTab}
    />
  </div>

  <Tabs
    type="container"
    selected={selectedIndex}
    on:change={handleTabChange}
  >
    {#each tabsState.tabs as tab (tab.id)}
      <Tab label={tab.name}>
        <div class="tab-label">
          <span class="tab-name">{tab.name}</span>
          {#if tabsState.tabs.length > 1}
            <button
              class="close-button"
              onclick={(e) => handleCloseTab(tab.id, e)}
              aria-label="Close tab"
            >
              <Close size={16} />
            </button>
          {/if}
        </div>
      </Tab>
    {/each}
  </Tabs>

  {#if tabsState.activeTabId}
    <div class="tab-content" data-testid="tab-content">
      <h3>Active Tab: {tabsState.tabs.find(t => t.id === tabsState.activeTabId)?.name}</h3>
      <p class="tab-id" data-testid="active-tab-id">Tab ID: {tabsState.activeTabId}</p>
      <p>This is the content area for the active tab.</p>
    </div>
  {/if}
</div>

<style>
  .minimal-tabs-container {
    padding: 1rem;
    border: 1px solid var(--cds-border-subtle);
  }

  .tabs-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
  }

  .tab-content {
    padding: 1rem;
    background: var(--cds-layer-01);
  }

  .tab-id {
    font-family: monospace;
    font-size: 0.875rem;
    color: var(--cds-text-secondary);
  }
</style>
```

### Step 2: Create Storybook Story

Create `src/lib/components/Tabs/MinimalTabs.stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/svelte';
import MinimalTabs from './MinimalTabs.svelte';

const meta = {
  title: 'TabRebuild/01-MinimalTabs',
  component: MinimalTabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<MinimalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    instanceId: 'story-default',
  },
};

export const MultipleInstances: Story = {
  render: () => ({
    Component: MinimalTabs,
    props: {},
  }),
  decorators: [
    () => ({
      template: `
        <div style="display: flex; gap: 2rem; flex-direction: column;">
          <div>
            <h3>Instance 1</h3>
            <MinimalTabs instanceId="instance-1" />
          </div>
          <div>
            <h3>Instance 2</h3>
            <MinimalTabs instanceId="instance-2" />
          </div>
        </div>
      `,
    }),
  ],
};
```

### Step 3: Write Integration Tests

Create `tests/integration/MinimalTabs.test.ts`:

```typescript
import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import MinimalTabs from '$lib/components/Tabs/MinimalTabs.svelte';

describe('MinimalTabs', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render with one initial tab', async () => {
    render(MinimalTabs, { props: { instanceId: 'test-1' } });

    await waitFor(() => {
      expect(screen.getByText('Query 1')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });
  });

  it('should add a new tab when clicking add button', async () => {
    const user = userEvent.setup();
    render(MinimalTabs, { props: { instanceId: 'test-2' } });

    await waitFor(() => {
      expect(screen.getByText('Query 1')).toBeInTheDocument();
    });

    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Query 2')).toBeInTheDocument();
    });
  });

  it('should switch active tab ID when clicking tabs', async () => {
    const user = userEvent.setup();
    const { container } = render(MinimalTabs, { props: { instanceId: 'test-3' } });

    // Wait for initial tab
    await waitFor(() => {
      expect(screen.getByText('Query 1')).toBeInTheDocument();
    });

    // Get initial tab ID
    const initialTabId = screen.getByTestId('active-tab-id').textContent;
    expect(initialTabId).toContain('tab-');

    // Add second tab
    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Query 2')).toBeInTheDocument();
    });

    // Tab 2 should now be active (different ID)
    const tab2Id = screen.getByTestId('active-tab-id').textContent;
    expect(tab2Id).not.toBe(initialTabId);

    // Click back to tab 1
    const tab1Button = screen.getByText('Query 1');
    await user.click(tab1Button);

    // CRITICAL TEST: Active tab ID should switch back to tab 1's ID
    await waitFor(() => {
      const activeTabId = screen.getByTestId('active-tab-id').textContent;
      expect(activeTabId).toBe(initialTabId);
    });
  });

  it('should close tabs when clicking close button', async () => {
    const user = userEvent.setup();
    render(MinimalTabs, { props: { instanceId: 'test-4' } });

    await waitFor(() => {
      expect(screen.getByText('Query 1')).toBeInTheDocument();
    });

    // Add second tab
    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Query 2')).toBeInTheDocument();
    });

    // Close tab 2
    const closeButtons = screen.getAllByLabelText('Close tab');
    await user.click(closeButtons[1]);

    await waitFor(() => {
      expect(screen.queryByText('Query 2')).not.toBeInTheDocument();
      expect(screen.getByText('Query 1')).toBeInTheDocument();
    });
  });

  it('should not show close button when only one tab exists', async () => {
    render(MinimalTabs, { props: { instanceId: 'test-5' } });

    await waitFor(() => {
      expect(screen.getByText('Query 1')).toBeInTheDocument();
    });

    // Should not have close button
    expect(screen.queryByLabelText('Close tab')).not.toBeInTheDocument();
  });

  it('should isolate tabs across multiple instances', async () => {
    const user = userEvent.setup();

    const { container: container1 } = render(MinimalTabs, {
      props: { instanceId: 'instance-1' },
      target: document.body,
    });

    const { container: container2 } = render(MinimalTabs, {
      props: { instanceId: 'instance-2' },
      target: document.body,
    });

    await waitFor(() => {
      const tabs = screen.getAllByText('Query 1');
      expect(tabs).toHaveLength(2); // One per instance
    });

    // Add tab to instance 1 only
    const addButtons = screen.getAllByLabelText('Add new tab');
    await user.click(addButtons[0]);

    await waitFor(() => {
      // Instance 1 should have 2 tabs
      const query2Tabs = screen.getAllByText('Query 2');
      expect(query2Tabs).toHaveLength(1); // Only in instance 1
    });
  });
});
```

### Step 4: Write E2E Tests

Create `tests/e2e/minimal-tabs.storybook.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('MinimalTabs E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/tabrebuild-01-minimaltabs--default');
    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.tab-name').first().waitFor({ timeout: 10000 });
  });

  test('should switch tab content when clicking tabs', async ({ page }) => {
    const storyFrame = page.frameLocator('#storybook-preview-iframe');

    // Get initial tab ID
    const initialTabId = await storyFrame.locator('[data-testid="active-tab-id"]').textContent();
    expect(initialTabId).toContain('tab-');

    // Add second tab
    const addButton = storyFrame.locator('[aria-label="Add new tab"]');
    await addButton.click();
    await page.waitForTimeout(200);

    // Tab 2 should be active (different ID)
    const tab2Id = await storyFrame.locator('[data-testid="active-tab-id"]').textContent();
    expect(tab2Id).not.toBe(initialTabId);

    // Click back to tab 1
    const tabs = storyFrame.locator('.tab-name');
    await tabs.first().click();
    await page.waitForTimeout(200);

    // CRITICAL TEST: Active tab ID should switch back
    const switchedTabId = await storyFrame.locator('[data-testid="active-tab-id"]').textContent();
    expect(switchedTabId).toBe(initialTabId);
  });
});
```

## Testing Checklist

- [ ] Component renders in Storybook
- [ ] Can add tabs
- [ ] Can close tabs (except last one)
- [ ] Tab names display correctly
- [ ] Active tab ID changes when clicking tabs
- [ ] Multiple instances are isolated
- [ ] All integration tests pass
- [ ] E2E test passes
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm test`

## Success Metrics

If this task completes successfully with ALL tests passing, it proves:

✅ **Basic tab switching works** with Carbon Tabs + tabStore
✅ **Tab state isolation works** between instances
✅ **Foundation is solid** for adding editor in next task

## Next Task

If all tests pass → **TAB-REBUILD-02-ADD-TOOLBAR.md**

If tab switching fails → We've found the bug is in the tabStore or Carbon Tabs integration itself!
