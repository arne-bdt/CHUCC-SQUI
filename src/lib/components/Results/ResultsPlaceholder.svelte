<script lang="ts">
  /**
   * ResultsPlaceholder component - Temporary placeholder for query results
   * Will be replaced by DataGrid and other result views in later tasks
   */

  interface Props {
    /** CSS class for the placeholder */
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div class="results-placeholder {className}">
  <div class="placeholder-content">
    <h3>Query Results</h3>
    <p>Results will be displayed here after query execution</p>
    <p class="hint">Future implementation will include table view, raw view, and visualizations</p>
  </div>
</div>

<style>
  .results-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cds-layer-01, #f4f4f4);
    border: 1px dashed var(--cds-border-subtle-01, #e0e0e0);
    padding: var(--cds-spacing-05, 1rem);
  }

  .placeholder-content {
    text-align: center;
    color: var(--cds-text-secondary, #525252);
  }

  .placeholder-content h3 {
    margin: 0 0 var(--cds-spacing-03, 0.5rem) 0;
    color: var(--cds-text-primary, #161616);
    font-size: 1.25rem;
    font-weight: 400;
  }

  .placeholder-content p {
    margin: var(--cds-spacing-02, 0.25rem) 0;
    font-size: 0.875rem;
  }

  .placeholder-content .hint {
    font-style: italic;
    color: var(--cds-text-helper, #6f6f6f);
  }

  /* Dark theme support */
  :global(.g90) .results-placeholder,
  :global(.g100) .results-placeholder {
    background-color: var(--cds-layer-01, #262626);
    border-color: var(--cds-border-subtle-01, #393939);
  }
</style>
