<script lang="ts">
  /**
   * ResultsPlaceholder component - Shows query results or errors
   * Displays error notifications when queries fail
   */

  import { resultsStore } from '../../stores/resultsStore';
  import ErrorNotification from './ErrorNotification.svelte';
  import type { QueryError } from '../../types';

  interface Props {
    /** CSS class for the placeholder */
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  // Subscribe to results store
  const state = $derived(resultsStore);

  // Convert error string to QueryError object
  const errorObject = $derived<QueryError | null>(() => {
    if (!state.error) return null;
    if (typeof state.error === 'string') {
      return { message: state.error };
    }
    return state.error as QueryError;
  });

  // Handle error notification close
  function handleCloseError(): void {
    resultsStore.clearError();
  }
</script>

<div class="results-placeholder {className}">
  <!-- Show error notification if there's an error -->
  {#if errorObject()}
    <ErrorNotification error={errorObject()} onClose={handleCloseError} />
  {/if}

  <!-- Show placeholder content when no error -->
  {#if !state.error}
    <div class="placeholder-content">
      <h3>Query Results</h3>
      {#if state.loading}
        <p>Executing query...</p>
      {:else if state.data}
        <p>Query executed successfully in {state.executionTime}ms</p>
        <p class="hint">Table view will be displayed here in future tasks</p>
      {:else}
        <p>Results will be displayed here after query execution</p>
        <p class="hint">
          Future implementation will include table view, raw view, and visualizations
        </p>
      {/if}
    </div>
  {/if}
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

  /* Dark theme text colors - ensure high contrast */
  :global(.g90) .placeholder-content,
  :global(.g100) .placeholder-content {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90) .placeholder-content h3,
  :global(.g100) .placeholder-content h3 {
    color: var(--cds-text-primary, #f4f4f4);
  }

  :global(.g90) .placeholder-content .hint,
  :global(.g100) .placeholder-content .hint {
    color: var(--cds-text-helper, #a8a8a8);
  }
</style>
