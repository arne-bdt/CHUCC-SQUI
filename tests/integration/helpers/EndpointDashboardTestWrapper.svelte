<script lang="ts">
  import EndpointDashboard from '../../../src/lib/components/Endpoint/EndpointDashboard.svelte';
  import StoreProvider from '../../../src/lib/components/StoreProvider.svelte';

  interface Props {
    currentEndpoint: string | null;
    onInsertFunction?: (functionCall: string) => void;
    compact?: boolean;
  }

  let { currentEndpoint, onInsertFunction, compact = false }: Props = $props();
</script>

<StoreProvider initialEndpoint={currentEndpoint || ''}>
  {#snippet children()}
    <EndpointDashboard {currentEndpoint} {onInsertFunction} {compact} />
  {/snippet}
</StoreProvider>
