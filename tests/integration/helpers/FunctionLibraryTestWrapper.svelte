<script lang="ts">
  import FunctionLibrary from '../../../src/lib/components/Functions/FunctionLibrary.svelte';
  import StoreProvider from '../../../src/lib/components/StoreProvider.svelte';

  interface Props {
    currentEndpoint: string | null;
    onInsertFunction?: (fn: string) => void;
  }

  let { currentEndpoint, onInsertFunction }: Props = $props();
</script>

<StoreProvider initialEndpoint={currentEndpoint || ''}>
  {#snippet children()}
    <FunctionLibrary {currentEndpoint} {onInsertFunction} />
  {/snippet}
</StoreProvider>
