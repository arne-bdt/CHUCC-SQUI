<script lang="ts">
  import StoreProvider from '../../../src/lib/components/StoreProvider.svelte';
  import ResultsPlaceholder from '../../../src/lib/components/Results/ResultsPlaceholder.svelte';

  interface Props {
    initialEndpoint?: string;
    initialQuery?: string;
    class?: string;
    maxResults?: number;
    warningThreshold?: number;
    onDownloadResults?: () => void;
  }

  let {
    initialEndpoint = '',
    initialQuery = '',
    class: className = '',
    maxResults = 100000,
    warningThreshold = 0.8,
    onDownloadResults,
  }: Props = $props();
</script>

<StoreProvider {initialEndpoint} {initialQuery}>
  <ResultsPlaceholder class={className} {maxResults} {warningThreshold} {onDownloadResults} />
</StoreProvider>
