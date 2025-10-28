<script lang="ts">
  /**
   * SPARQL Query UI Component
   *
   * A modern, web-based SPARQL query interface built with Svelte 5 and Carbon Design System.
   * Provides a complete interface for composing, executing, and visualizing SPARQL queries.
   *
   * @component
   * @example
   * ```svelte
   * <SparqlQueryUI
   *   endpoint={{ url: "https://dbpedia.org/sparql" }}
   *   theme={{ theme: "g90" }}
   *   limits={{ maxRows: 10000 }}
   * />
   * ```
   */

  import type { SquiConfig } from './lib/types';
  import type { CarbonTheme, ResultFormat } from './lib/types';
  import { themeStore, queryStore, resultsStore } from './lib/stores';
  import { createTabStore } from './lib/stores/tabStore';
  import { defaultEndpoint } from './lib/stores/endpointStore';
  import Toolbar from './lib/components/Toolbar/Toolbar.svelte';
  import RunButton from './lib/components/Toolbar/RunButton.svelte';
  import EndpointSelector from './lib/components/Endpoint/EndpointSelector.svelte';
  import FormatSelector from './lib/components/Results/FormatSelector.svelte';
  import SplitPane from './lib/components/Layout/SplitPane.svelte';
  import SparqlEditor from './lib/components/Editor/SparqlEditor.svelte';
  import ResultsPlaceholder from './lib/components/Results/ResultsPlaceholder.svelte';
  import QueryTabs from './lib/components/Tabs/QueryTabs.svelte';
  import { setContext } from 'svelte';

  /**
   * Component props interface
   * All configuration options are optional with sensible defaults
   */
  interface Props extends SquiConfig {}

  // Destructure props with defaults
  let {
    endpoint = { url: '', hideSelector: false },
    prefixes = { default: {} },
    theme = { theme: 'white' },
    localization = { locale: 'en' },
    instanceId,
    disablePersistence = false,
    features = {
      enableTabs: true,
      enableFilters: true,
      enableDownloads: true,
      enableSharing: false,
      enableHistory: true,
    },
    limits = {
      maxRows: 100000,
      chunkSize: 1000,
      timeout: 30000,
    },
  }: Props = $props();

  // Component internal state
  let _query = $state('');
  let _results = $state(null);
  let _isExecuting = $state(false);

  // Read current theme from store (reactive)
  // This ensures the component always displays the current global theme
  const themeState = $derived(themeStore);
  const currentTheme = $derived(themeState ? themeState.current : 'white');

  // Tab management - Create instance-specific tab store
  // Each component instance gets its own tab store to prevent sharing across instances
  const instanceTabStore = createTabStore({
    instanceId,
    disablePersistence,
  });
  setContext('tabStore', instanceTabStore);

  let tabsInitialized = false;
  let currentActiveTabId: string | null = null;
  let isSwitching = false; // Guard against re-entrant calls from updateTabQuery

  // Initialize tabs from localStorage on mount
  if (features.enableTabs !== false) {
    instanceTabStore.loadFromStorage();
    const initialTab = instanceTabStore.getActiveTab();
    if (initialTab) {
      currentActiveTabId = initialTab.id;
      queryStore.setState(initialTab.query);
      resultsStore.setState(initialTab.results);
      if (initialTab.query.endpoint) {
        defaultEndpoint.set(initialTab.query.endpoint);
        _currentEndpoint = initialTab.query.endpoint;
      }
    }
    tabsInitialized = true;
  }

  // Watch for tab switches and load new tab state
  // This effect ONLY reads from instanceTabStore and writes to queryStore/resultsStore
  // It never writes back to tabStore, preventing circular updates
  $effect(() => {
    if (!tabsInitialized) return;

    const unsubscribe = instanceTabStore.subscribe((state) => {
      // Guard against re-entrant calls (updateTabQuery triggers subscription)
      if (isSwitching) {
        console.log('[SparqlQueryUI] Ignoring re-entrant subscription call');
        return;
      }

      // Check if active tab changed
      console.log('[SparqlQueryUI] Tab store subscription triggered:', {
        activeTabId: state.activeTabId,
        currentActiveTabId,
        tabCount: state.tabs.length,
      });
      if (state.activeTabId && state.activeTabId !== currentActiveTabId) {
        isSwitching = true; // Set guard

        // CRITICAL: Save current tab's state before switching
        if (currentActiveTabId) {
          const oldTab = state.tabs.find((t) => t.id === currentActiveTabId);
          if (oldTab) {
            console.log('[SparqlQueryUI] Saving old tab before switch:', {
              tabId: oldTab.id,
              queryText: $queryStore.text.substring(0, 50),
            });
            instanceTabStore.updateTabQuery(oldTab.id, $queryStore);
            instanceTabStore.updateTabResults(oldTab.id, $resultsStore);
          }
        }

        currentActiveTabId = state.activeTabId;

        // Find and load the new active tab
        const newActiveTab = state.tabs.find((t) => t.id === state.activeTabId);
        console.log('[SparqlQueryUI] Switching to tab:', {
          tabId: newActiveTab?.id,
          tabName: newActiveTab?.name,
          queryText: newActiveTab?.query.text.substring(0, 50),
        });
        if (newActiveTab) {
          // Load tab state into global stores (but don't save back)
          queryStore.setState(newActiveTab.query);
          resultsStore.setState(newActiveTab.results);
          if (newActiveTab.query.endpoint) {
            defaultEndpoint.set(newActiveTab.query.endpoint);
            _currentEndpoint = newActiveTab.query.endpoint;
          }
        }

        isSwitching = false; // Clear guard
      }
    });

    return unsubscribe;
  });

  // Initialize theme from props on mount (if provided)
  // This runs once and only if a theme prop was explicitly passed
  // After initialization, external theme changes (e.g., Storybook toolbar) take precedence
  let themeInitialized = false;
  $effect(() => {
    if (!themeInitialized && theme?.theme) {
      themeStore.setTheme(theme.theme);
      themeInitialized = true;
    }
  });

  // Initialize endpoint store from props
  // This ensures RunButton has access to endpoint on mount
  let _currentEndpoint = $state(endpoint?.url || '');
  $effect(() => {
    if (endpoint?.url) {
      _currentEndpoint = endpoint.url;
      defaultEndpoint.set(endpoint.url);
    }
  });

  // Handle endpoint changes from selector
  function handleEndpointChange(newUrl: string): void {
    _currentEndpoint = newUrl;
    defaultEndpoint.set(newUrl);
  }

  // Handle format changes from selector
  async function handleFormatChange(newFormat: ResultFormat): Promise<void> {
    // Update format in store
    resultsStore.setFormat(newFormat);

    // Re-execute query with new format if we have query and endpoint
    const currentQuery = $queryStore.text;
    if (currentQuery && _currentEndpoint) {
      await resultsStore.executeQuery({
        query: currentQuery,
        endpoint: _currentEndpoint,
        format: newFormat,
      });
    }
  }

  // Prevent unused variable warnings - these will be used in future tasks
  $effect(() => {
    if (prefixes || localization || features || limits) {
      // Props are available for implementation
    }
  });
</script>

<!--
  Main component structure:
  - QueryTabs: Tabbed interface for multiple queries (if enabled)
  - Toolbar: Top bar with endpoint selector and controls
  - SplitPane: Resizable container with editor and results
-->
<div class="squi-container theme-{currentTheme}">
  <!-- Query Tabs (if enabled) -->
  {#if features.enableTabs !== false}
    <QueryTabs />
  {/if}

  <!-- Top toolbar for controls and endpoint selector -->
  <Toolbar>
    {#snippet children()}
      <div class="toolbar-content">
        <!-- Run Query Button -->
        <RunButton />

        <!-- Endpoint Selector or Info -->
        {#if endpoint?.hideSelector}
          <!-- Show static endpoint info when selector is hidden -->
          <div class="toolbar-info">
            <span class="endpoint-info">
              <strong>Endpoint:</strong>
              {_currentEndpoint || 'Not configured'}
            </span>
          </div>
        {:else}
          <!-- Show endpoint selector for choosing/entering endpoints -->
          <div class="endpoint-selector-wrapper">
            <EndpointSelector
              bind:value={_currentEndpoint}
              onchange={handleEndpointChange}
              label=""
              placeholder="Select or enter SPARQL endpoint"
            />
          </div>
        {/if}

        <!-- Format Selector - controls Accept header for queries -->
        <div class="format-selector-wrapper">
          <FormatSelector
            value={$resultsStore.format}
            queryType={$queryStore.type}
            onchange={handleFormatChange}
            disabled={$resultsStore.loading}
          />
        </div>
      </div>
    {/snippet}
  </Toolbar>

  <!-- Main content area with resizable editor and results panes -->
  <div class="squi-main">
    <SplitPane initialSplit={0.5} minTopHeight={200} minBottomHeight={150}>
      {#snippet top()}
        <SparqlEditor />
      {/snippet}
      {#snippet bottom()}
        <ResultsPlaceholder />
      {/snippet}
    </SplitPane>
  </div>
</div>

<style>
  .squi-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .squi-main {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .toolbar-content {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-05, 1rem);
    width: 100%;
  }

  .endpoint-selector-wrapper {
    flex: 1;
    min-width: 300px;
    max-width: 600px;
  }

  .format-selector-wrapper {
    min-width: 140px;
  }

  .toolbar-info {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03, 0.5rem);
    flex: 1;
    min-width: 0;
  }

  .endpoint-info {
    font-size: 0.875rem;
    color: var(--cds-text-secondary, #525252);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .endpoint-info strong {
    font-weight: 600;
    color: var(--cds-text-primary, #161616);
  }

  /* Dark theme text colors - ensure high contrast */
  :global(.g90) .endpoint-info,
  :global(.g100) .endpoint-info {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90) .endpoint-info strong,
  :global(.g100) .endpoint-info strong {
    color: var(--cds-text-primary, #f4f4f4);
  }
</style>
