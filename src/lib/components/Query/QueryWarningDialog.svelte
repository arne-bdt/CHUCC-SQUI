<script lang="ts">
  import { Modal, Button } from 'carbon-components-svelte';
  import type { QueryAnalysis } from '$lib/utils/queryAnalyzer';

  interface Props {
    open: boolean;
    analysis: QueryAnalysis;
    onCancel: () => void;
    onDownloadCSV: () => void;
    onExecuteAnyway: () => void;
  }

  let { open = $bindable(), analysis, onCancel, onDownloadCSV, onExecuteAnyway }: Props = $props();

  const title = $derived(
    analysis.recommendation === 'download-instead'
      ? 'Large Result Set - Download Recommended'
      : 'Large Result Set Warning'
  );

  const riskLevel = $derived.by(() => {
    if (analysis.estimatedRowCount === 'unbounded') return 'Critical';
    if (analysis.estimatedRowCount === 'large') return 'High';
    return 'Medium';
  });

  const isDangerous = $derived(analysis.recommendation === 'download-instead');
</script>

<Modal
  bind:open
  modalHeading={title}
  primaryButtonText="Download CSV"
  secondaryButtonText={isDangerous ? 'Cancel' : 'Execute Anyway'}
  on:click:button--primary={onDownloadCSV}
  on:click:button--secondary={() => {
    if (isDangerous) {
      onCancel();
    } else {
      onExecuteAnyway();
    }
  }}
  on:close={onCancel}
  danger={isDangerous}
  size="md"
>
  <div class="warning-content">
    <p class="intro">
      {#if isDangerous}
        This query may return a very large result set that could freeze or crash your browser.
      {:else}
        This query may return a large result set that could slow down your browser.
      {/if}
    </p>

    <section>
      <h4>Analysis:</h4>
      <ul class="analysis-list">
        {#each analysis.warnings as warning}
          <li>{warning}</li>
        {/each}
        {#if analysis.estimatedMemoryMB}
          <li>Estimated memory: ~{Math.ceil(analysis.estimatedMemoryMB)} MB</li>
        {/if}
        <li>Risk level: <strong>{riskLevel}</strong></li>
      </ul>
    </section>

    <section>
      <h4>Recommendations:</h4>
      <ul class="recommendations-list">
        <li>✅ Download results as CSV file (memory-efficient)</li>
        {#if !analysis.hasLimit}
          <li>✅ Add LIMIT clause (e.g., <code>LIMIT 1000</code>)</li>
        {:else if analysis.limitValue && analysis.limitValue > 10000}
          <li>✅ Reduce LIMIT value (e.g., <code>LIMIT 1000</code>)</li>
        {/if}
        <li>✅ Use more specific WHERE conditions</li>
        <li>✅ Execute in smaller batches with OFFSET</li>
      </ul>
    </section>
  </div>
</Modal>

<style>
  .warning-content {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-05);
  }

  .intro {
    margin: 0 0 var(--cds-spacing-03) 0;
    font-size: 1rem;
    line-height: 1.5;
  }

  section {
    margin: var(--cds-spacing-03) 0;
  }

  h4 {
    margin: 0 0 var(--cds-spacing-03) 0;
    font-weight: 600;
    font-size: 0.875rem;
  }

  ul {
    margin: 0;
    padding-left: var(--cds-spacing-06);
  }

  .analysis-list,
  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-03);
  }

  li {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  code {
    background: var(--cds-field);
    padding: var(--cds-spacing-01) var(--cds-spacing-03);
    border-radius: 2px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.875rem;
  }

  strong {
    font-weight: 600;
  }
</style>
