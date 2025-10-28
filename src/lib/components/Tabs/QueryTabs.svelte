<script lang="ts">
  /**
   * Query Tabs Component
   *
   * Provides tabbed interface for managing multiple SPARQL queries.
   * Each tab has isolated state for query text, endpoint, and results.
   *
   * Features:
   * - Add new tabs with "+" button
   * - Close tabs with close button (minimum 1 tab)
   * - Switch between tabs
   * - Auto-persists to localStorage
   *
   * @component
   */

  import { Tabs, Tab, TabContent, Button } from 'carbon-components-svelte';
  import { Add, Close } from 'carbon-icons-svelte';
  import { tabStore } from '../../stores';
  import type { TabsState } from '../../types';

  // Subscribe to tab store - use $state to track the store value
  let tabsState: TabsState = $state({
    tabs: [],
    activeTabId: null,
  });

  // Subscribe to tab store updates
  $effect(() => {
    const unsubscribe = tabStore.subscribe((state) => {
      tabsState = state;
    });
    return unsubscribe;
  });

  /**
   * Handle tab selection change
   */
  function handleTabChange(event: CustomEvent<{ selectedIndex: number }>): void {
    const selectedIndex = event.detail.selectedIndex;
    const selectedTab = tabsState.tabs[selectedIndex];
    if (selectedTab) {
      tabStore.switchTab(selectedTab.id);
    }
  }

  /**
   * Add a new tab
   */
  function handleAddTab(): void {
    tabStore.addTab();
  }

  /**
   * Close a tab
   */
  function handleCloseTab(tabId: string, event: MouseEvent): void {
    // Prevent tab switch when clicking close button
    event.stopPropagation();
    event.preventDefault();
    tabStore.removeTab(tabId);
  }

  /**
   * Get the index of the active tab
   */
  const selectedIndex = $derived(
    tabsState.activeTabId
      ? tabsState.tabs.findIndex((tab) => tab.id === tabsState.activeTabId)
      : 0
  );
</script>

<div class="query-tabs-container">
  <div class="tabs-header">
    <Tabs type="container" selected={selectedIndex} on:change={handleTabChange}>
      {#each tabsState.tabs as tab (tab.id)}
        <Tab label={tab.name}>
          <div class="tab-label">
            <span class="tab-name">{tab.name}</span>
            {#if tabsState.tabs.length > 1}
              <button
                class="close-button"
                type="button"
                aria-label="Close tab {tab.name}"
                onclick={(e) => handleCloseTab(tab.id, e)}
              >
                <Close size={16} />
              </button>
            {/if}
          </div>
        </Tab>
      {/each}
    </Tabs>

    <!-- Add tab button -->
    <div class="add-tab-button">
      <Button
        kind="ghost"
        size="small"
        icon={Add}
        iconDescription="Add new tab"
        tooltipPosition="bottom"
        onclick={handleAddTab}
      />
    </div>
  </div>

  <!-- Tab content is rendered by parent component (SparqlQueryUI) -->
  <!-- This component only handles tab navigation -->
</div>

<style>
  .query-tabs-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tabs-header {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03, 0.5rem);
    background-color: var(--cds-layer-01, #f4f4f4);
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03, 0.5rem);
  }

  .tab-name {
    font-size: 0.875rem;
    font-weight: 400;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.125rem;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 2px;
    color: var(--cds-text-secondary, #525252);
    transition: all 0.11s cubic-bezier(0.2, 0, 0.38, 0.9);
  }

  .close-button:hover {
    background-color: var(--cds-layer-hover-01, #e8e8e8);
    color: var(--cds-text-primary, #161616);
  }

  .close-button:focus {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: -2px;
  }

  .add-tab-button {
    display: flex;
    align-items: center;
    padding: 0 var(--cds-spacing-03, 0.5rem);
  }

  /* Dark theme support */
  :global(.g90) .tabs-header,
  :global(.g100) .tabs-header {
    background-color: var(--cds-layer-01, #262626);
    border-bottom-color: var(--cds-border-subtle-01, #393939);
  }

  :global(.g90) .close-button,
  :global(.g100) .close-button {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90) .close-button:hover,
  :global(.g100) .close-button:hover {
    background-color: var(--cds-layer-hover-01, #353535);
    color: var(--cds-text-primary, #f4f4f4);
  }
</style>
