<script lang="ts">
  /**
   * Test consumer component for StoreProvider tests
   * Accesses stores from context and exposes their values
   */
  import { getQueryStore, getResultsStore, getUIStore, getEndpointStore } from '../../../src/lib/stores';

  const queryStore = getQueryStore();
  const resultsStore = getResultsStore();
  const uiStore = getUIStore();
  const endpointStore = getEndpointStore();

  const queryState = $derived($queryStore);
  const resultsState = $derived($resultsStore);
  const uiState = $derived($uiStore);
  const endpoint = $derived($endpointStore);
</script>

<div data-testid="store-consumer">
  <div data-testid="query-text">{queryState.text}</div>
  <div data-testid="endpoint">{endpoint}</div>
  <div data-testid="active-tab">{uiState.activeTab}</div>
  <div data-testid="loading">{resultsState.loading ? 'true' : 'false'}</div>
</div>
