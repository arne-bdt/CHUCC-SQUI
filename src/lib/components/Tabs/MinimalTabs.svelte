<script lang="ts">
  import { Tabs, Tab, Button } from 'carbon-components-svelte';
  import { Add, Close } from 'carbon-icons-svelte';
  import { createTabStore } from '../../stores/tabStore';
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
    // Subscribe to tab changes
    const unsubscribe = tabStore.subscribe((state) => {
      tabsState = state;

      // Sync selectedIndex with activeTabId when store updates
      const newIndex = state.tabs.findIndex(t => t.id === state.activeTabId);
      if (newIndex !== -1) {
        selectedIndex = newIndex;
      }
    });

    return unsubscribe;
  });

  // When selectedIndex changes (from user clicking tabs), update the store
  $effect(() => {
    const newTab = tabsState.tabs[selectedIndex];
    if (newTab && newTab.id !== tabsState.activeTabId) {
      tabStore.switchTab(newTab.id);
    }
  });

  function handleAddTab() {
    tabStore.addTab();
  }

  function handleCloseTab(tabId: string, event: Event) {
    event.stopPropagation();
    tabStore.removeTab(tabId);
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
    bind:selected={selectedIndex}
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
