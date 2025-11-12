<script lang="ts">
  /**
   * Display component for showing store values in StoreProvider demo
   * This component accesses stores from context and displays their values
   */
  import { getQueryStore, getResultsStore, getUIStore, getEndpointStore } from '../stores';

  interface Props {
    compact?: boolean;
  }

  let { compact = false }: Props = $props();

  const queryStore = getQueryStore();
  const resultsStore = getResultsStore();
  const uiStore = getUIStore();
  const endpointStore = getEndpointStore();

  const queryState = $derived($queryStore);
  const resultsState = $derived($resultsStore);
  const uiState = $derived($uiStore);
  const endpoint = $derived($endpointStore);
</script>

<div style="display: flex; flex-direction: column; gap: 8px; {compact ? 'font-size: 14px;' : ''}">
  <div>
    <strong>Query Text:</strong>
    <pre
      style="background: white; padding: 8px; border-radius: 2px; margin: 4px 0; overflow-x: auto; {compact
        ? 'font-size: 12px;'
        : ''}">{queryState.text || '(empty)'}</pre>
  </div>
  <div>
    <strong>Endpoint:</strong>
    <code
      style="background: white; padding: 4px 8px; border-radius: 2px; display: inline-block; {compact
        ? 'font-size: 12px;'
        : ''}">{endpoint || '(empty)'}</code>
  </div>
  {#if !compact}
    <div>
      <strong>Active Tab:</strong>
      <code style="background: white; padding: 4px 8px; border-radius: 2px; display: inline-block;"
        >{uiState.activeTab}</code>
    </div>
    <div>
      <strong>Loading:</strong>
      <code style="background: white; padding: 4px 8px; border-radius: 2px; display: inline-block;"
        >{resultsState.loading ? 'true' : 'false'}</code>
    </div>
  {/if}
</div>
