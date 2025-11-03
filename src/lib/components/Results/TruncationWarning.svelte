<script lang="ts">
  import { InlineNotification, Button } from 'carbon-components-svelte';
  import { Download, Edit } from 'carbon-icons-svelte';
  import type { ParsedTableData } from '$lib/utils/resultsParser';

  interface Props {
    data: ParsedTableData;
    onDownloadFull: () => void;
    onRefineQuery: () => void;
  }

  let { data, onDownloadFull, onRefineQuery }: Props = $props();

  const hiddenRows = $derived((data.totalRows || 0) - data.rowCount);
  const subtitle = $derived(
    `Showing ${data.rowCount.toLocaleString('en-US')} of ${data.totalRows?.toLocaleString('en-US') || data.rowCount.toLocaleString('en-US')} results` +
    (hiddenRows > 0 ? ` (${hiddenRows.toLocaleString('en-US')} rows not displayed)` : '')
  );
</script>

{#if data.isTruncated && hiddenRows > 0}
  <InlineNotification
    kind="warning"
    title="Results Truncated"
    {subtitle}
    hideCloseButton
    lowContrast
  >
    <svelte:fragment slot="actions">
      <Button
        size="small"
        kind="tertiary"
        icon={Download}
        on:click={onDownloadFull}
      >
        Download Full Results
      </Button>
      <Button
        size="small"
        kind="ghost"
        icon={Edit}
        on:click={onRefineQuery}
      >
        Refine Query
      </Button>
    </svelte:fragment>
  </InlineNotification>

  <div class="truncation-details">
    <p>
      The full result set was too large to display safely in your browser.
    </p>
    <p class="options-label">Options:</p>
    <ul>
      <li>Download all {data.totalRows?.toLocaleString('en-US')} rows as CSV</li>
      <li>Add LIMIT or WHERE clause to reduce result size</li>
      <li>Adjust maxRows setting (may affect performance)</li>
    </ul>
  </div>
{/if}

<style>
  .truncation-details {
    margin-top: 0.5rem;
    padding: 1rem;
    background: var(--cds-notification-background-warning);
    border-left: 3px solid var(--cds-support-warning);
    font-size: 0.875rem;
  }

  .truncation-details p {
    margin: 0 0 0.5rem 0;
  }

  .options-label {
    font-weight: 600;
    margin-top: 1rem !important;
  }

  .truncation-details ul {
    margin: 0.5rem 0 0 1.25rem;
    padding: 0;
  }

  .truncation-details li {
    margin: 0.25rem 0;
  }
</style>
