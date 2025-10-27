<!--
  ResultsWarning Component (Task 34 - Phase 7)
  Displays warnings for large result sets
  - Shows warning when approaching limit
  - Suggests adding LIMIT to query
  - Option to download results instead
-->
<script lang="ts">
  import { InlineNotification } from 'carbon-components-svelte';

  interface Props {
    /** Current result count */
    resultCount: number;
    /** Maximum allowed results (default: 100,000) */
    maxResults?: number;
    /** Warning threshold as percentage of max (default: 80%) */
    warningThreshold?: number;
    /** Callback to download results */
    onDownload?: () => void;
    /** Whether download is available */
    downloadAvailable?: boolean;
  }

  let {
    resultCount,
    maxResults = 100000,
    warningThreshold = 0.8,
    onDownload,
    downloadAvailable = true,
  }: Props = $props();

  /**
   * Check if we should show a warning
   */
  const shouldWarn = $derived(resultCount >= maxResults * warningThreshold);

  /**
   * Check if we've hit the limit
   */
  const atLimit = $derived(resultCount >= maxResults);

  /**
   * Warning level: 'warning' or 'error'
   */
  const warningKind = $derived(atLimit ? 'error' : 'warning');

  /**
   * Warning title
   */
  const warningTitle = $derived(
    atLimit ? 'Result limit reached' : 'Large result set detected'
  );

  /**
   * Warning subtitle with actionable advice
   */
  const warningSubtitle = $derived.by(() => {
    if (atLimit) {
      return `Displaying ${maxResults.toLocaleString()} of potentially more results. Consider adding a LIMIT clause to your query or downloading the full result set.`;
    } else {
      return `Displaying ${resultCount.toLocaleString()} results (${Math.round((resultCount / maxResults) * 100)}% of ${maxResults.toLocaleString()} limit). For better performance, consider adding a LIMIT clause to your query.`;
    }
  });
</script>

{#if shouldWarn}
  <div class="results-warning">
    <InlineNotification
      kind={warningKind}
      title={warningTitle}
      subtitle={warningSubtitle}
      hideCloseButton={false}
      lowContrast={false}
    >
      <div slot="actions" class="warning-actions">
        {#if downloadAvailable && onDownload}
          <button class="cds--btn cds--btn--sm cds--btn--ghost" onclick={onDownload}>
            Download results
          </button>
        {/if}
      </div>
    </InlineNotification>
  </div>
{/if}

<style>
  .results-warning {
    padding: var(--cds-spacing-05, 1rem);
    background-color: var(--cds-layer-01, #f4f4f4);
  }

  .warning-actions {
    display: flex;
    gap: var(--cds-spacing-03, 0.5rem);
    margin-top: var(--cds-spacing-03, 0.5rem);
  }

  /* Dark theme support */
  :global(.g90) .results-warning,
  :global(.g100) .results-warning {
    background-color: var(--cds-layer-01, #262626);
  }
</style>
