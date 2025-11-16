<script lang="ts">
  import EndpointInfoSummary from '../../../src/lib/components/Endpoint/EndpointInfoSummary.svelte';
  import StoreProvider from '../../../src/lib/components/StoreProvider.svelte';

  interface Props {
    initialEndpoint: string;
  }

  let { initialEndpoint }: Props = $props();
</script>

<StoreProvider {initialEndpoint}>
  {#snippet children()}
    <EndpointInfoSummary />
  {/snippet}
</StoreProvider>
