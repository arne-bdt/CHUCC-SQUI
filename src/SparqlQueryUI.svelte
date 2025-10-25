<script lang="ts">
  import type { SquiConfig } from './lib/types/config';

  interface Props extends SquiConfig {
    endpoint?: string;
    theme?: 'white' | 'g10' | 'g90' | 'g100';
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

  // Prevent unused variable warnings - these will be used once we implement
  $effect(() => {
    if (endpoint || theme || defaultPrefixes || maxRows || showEndpointSelector) {
      // Props are available for implementation
    }
  });
</script>

<div class="squi-container theme-{theme}">
  <div class="placeholder">
    <h1>SPARQL Query UI</h1>
    <p>Component will be implemented following the tasks.</p>
    <p>Endpoint: {endpoint || 'Not configured'}</p>
    <p>Theme: {theme}</p>
  </div>
</div>

<style>
  .squi-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .placeholder {
    padding: 2rem;
    text-align: center;
  }
</style>
