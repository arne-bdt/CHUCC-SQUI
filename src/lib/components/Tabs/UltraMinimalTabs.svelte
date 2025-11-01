<script lang="ts">
  import { Tabs, Tab } from 'carbon-components-svelte';

  // Ultra-minimal: just 3 hardcoded tabs, no add/close, no store
  let tabs = [
    { id: 'tab-1', name: 'Tab 1' },
    { id: 'tab-2', name: 'Tab 2' },
    { id: 'tab-3', name: 'Tab 3' },
  ];

  let activeTabId = $state('tab-1');
  let selectedIndex = $state(0);

  // When selectedIndex changes, update activeTabId
  $effect(() => {
    const newTab = tabs[selectedIndex];
    if (newTab && newTab.id !== activeTabId) {
      console.log('selectedIndex changed to:', selectedIndex, 'updating activeTabId to:', newTab.id);
      activeTabId = newTab.id;
    }
  });
</script>

<div class="ultra-minimal-container">
  <h2>Ultra Minimal Tabs Test</h2>
  <p>No add/close buttons, no store, just pure tab switching</p>

  <div class="status">
    <strong>selectedIndex:</strong> {selectedIndex} |
    <strong>activeTabId:</strong> {activeTabId}
  </div>

  <Tabs
    type="container"
    bind:selected={selectedIndex}
  >
    {#each tabs as tab (tab.id)}
      <Tab label={tab.name}>
        <span>{tab.name}</span>
      </Tab>
    {/each}
  </Tabs>

  <div class="content" data-testid="tab-content">
    <h3>Active Tab: {tabs.find(t => t.id === activeTabId)?.name}</h3>
    <p data-testid="active-tab-id">Tab ID: {activeTabId}</p>
    <p>If tab switching works, clicking a tab should update this content.</p>
  </div>
</div>

<style>
  .ultra-minimal-container {
    padding: 2rem;
    border: 2px solid var(--cds-border-strong);
  }

  .status {
    padding: 1rem;
    background: var(--cds-layer-02);
    margin-bottom: 1rem;
    font-family: monospace;
  }

  .content {
    padding: 1rem;
    margin-top: 1rem;
    background: var(--cds-layer-01);
    border: 1px solid var(--cds-border-subtle);
  }

  .content h3 {
    margin-top: 0;
  }
</style>
