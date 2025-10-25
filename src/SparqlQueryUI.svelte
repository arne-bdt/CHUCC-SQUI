<script lang="ts">
  import type { SquiConfig } from './lib/types/config';
  import type { CarbonTheme } from './lib/stores';
  import { themeStore } from './lib/stores';
  import Toolbar from './lib/components/Toolbar/Toolbar.svelte';
  import SplitPane from './lib/components/Layout/SplitPane.svelte';
  import EditorPlaceholder from './lib/components/Editor/EditorPlaceholder.svelte';
  import ResultsPlaceholder from './lib/components/Results/ResultsPlaceholder.svelte';

  interface Props extends SquiConfig {
    endpoint?: string;
    theme?: CarbonTheme;
    showEndpointSelector?: boolean;
    defaultPrefixes?: Record<string, string>;
    maxRows?: number;
  }

  // Destructure props with defaults
  let {
    endpoint = '',
    theme = 'white',
    defaultPrefixes = {},
    maxRows = 100000,
    showEndpointSelector = true,
  }: Props = $props();

  // Component state - will be used in implementation
  let _query = $state('');
  let _results = $state(null);
  let _isExecuting = $state(false);

  // Initialize theme from props
  $effect(() => {
    themeStore.setTheme(theme);
  });

  // Prevent unused variable warnings - these will be used once we implement
  $effect(() => {
    if (endpoint || defaultPrefixes || maxRows || showEndpointSelector) {
      // Props are available for implementation
    }
  });
</script>

<div class="squi-container theme-{theme}">
  <!-- Top toolbar for controls and endpoint selector -->
  <Toolbar>
    <div class="toolbar-placeholder">
      <span>Endpoint: {endpoint || 'Not configured'}</span>
      <span class="separator">|</span>
      <span>Theme: {theme}</span>
    </div>
  </Toolbar>

  <!-- Main content area with resizable editor and results panes -->
  <div class="squi-main">
    <SplitPane initialSplit={0.5} minTopHeight={200} minBottomHeight={150}>
      <EditorPlaceholder slot="top" />
      <ResultsPlaceholder slot="bottom" />
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
</style>
