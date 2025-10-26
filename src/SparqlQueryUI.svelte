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
  import type { CarbonTheme } from './lib/types';
  import { themeStore } from './lib/stores';
  import Toolbar from './lib/components/Toolbar/Toolbar.svelte';
  import SplitPane from './lib/components/Layout/SplitPane.svelte';
  import SparqlEditor from './lib/components/Editor/SparqlEditor.svelte';
  import ResultsPlaceholder from './lib/components/Results/ResultsPlaceholder.svelte';

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

  // Prevent unused variable warnings - these will be used in future tasks
  $effect(() => {
    if (endpoint || prefixes || localization || features || limits) {
      // Props are available for implementation
    }
  });
</script>

<!--
  Main component structure:
  - Toolbar: Top bar with endpoint selector and controls
  - SplitPane: Resizable container with editor and results
-->
<div class="squi-container theme-{currentTheme}">
  <!-- Top toolbar for controls and endpoint selector -->
  <Toolbar>
    {#snippet children()}
      <div class="toolbar-placeholder">
        <span>Endpoint: {endpoint?.url || 'Not configured'}</span>
        <span class="separator">|</span>
        <span>Theme: {currentTheme}</span>
        <span class="separator">|</span>
        <span>Max Rows: {limits?.maxRows?.toLocaleString() || 'N/A'}</span>
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

  .toolbar-placeholder {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03, 0.5rem);
    font-size: 0.875rem;
    color: var(--cds-text-secondary, #525252);
  }

  .separator {
    color: var(--cds-border-subtle-01, #e0e0e0);
  }

  /* Dark theme text colors - ensure high contrast */
  :global(.g90) .toolbar-placeholder,
  :global(.g100) .toolbar-placeholder {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90) .separator,
  :global(.g100) .separator {
    color: var(--cds-border-subtle-01, #6f6f6f);
  }
</style>
