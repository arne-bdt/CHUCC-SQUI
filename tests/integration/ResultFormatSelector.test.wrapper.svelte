<script lang="ts">
  import StoreProvider from '../../src/lib/components/StoreProvider.svelte';
  import ResultFormatSelector from '../../src/lib/components/Query/ResultFormatSelector.svelte';

  interface Props {
    initialEndpoint?: string;
    initialQuery?: string;
    query?: string;
    endpoint?: string;
    selected?: string;
    disabled?: boolean;
  }

  let {
    initialEndpoint = '',
    initialQuery = '',
    query = '',
    endpoint = '',
    selected = 'application/sparql-results+json',
    disabled = false,
  }: Props = $props();
</script>

<StoreProvider {initialEndpoint} {initialQuery}>
  <ResultFormatSelector {query} {endpoint} {selected} {disabled} />
</StoreProvider>
