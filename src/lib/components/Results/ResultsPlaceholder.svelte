<script lang="ts">
  /**
   * ResultsPlaceholder component - Shows query results or errors
   * Displays DataTable for SELECT queries, boolean for ASK queries, and errors when queries fail
   */

  import { resultsStore } from '../../stores/resultsStore';
  import ErrorNotification from './ErrorNotification.svelte';
  import DataTable from './DataTable.svelte';
  import { parseResults, isAskResult, isSelectResult } from '../../utils/resultsParser';
  import type { QueryError, SparqlJsonResults } from '../../types';
  import type { ParsedTableData, ParsedAskResult } from '../../utils/resultsParser';

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

  // Parse results when available
  const parsedResults = $derived(() => {
    if (!state.data) return null;
    try {
      return parseResults(state.data as SparqlJsonResults);
    } catch (error) {
      console.error('Error parsing results:', error);
      return null;
    }
  });

  // Check if results are from SELECT query
  const isTable = $derived(() => {
    return parsedResults() && 'columns' in parsedResults()!;
  });

  // Check if results are from ASK query
  const isBoolean = $derived(() => {
    return parsedResults() && 'type' in parsedResults()! && parsedResults()!.type === 'boolean';
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

  <!-- Show results when no error -->
  {#if !state.error}
    <!-- Loading state -->
    {#if state.loading}
      <div class="placeholder-content">
        <h3>Executing Query</h3>
        <p>Please wait...</p>
      </div>

    <!-- SELECT query results - show DataTable -->
    {:else if isTable() && parsedResults()}
      <DataTable data={parsedResults() as ParsedTableData} />

    <!-- ASK query results - show boolean -->
    {:else if isBoolean() && parsedResults()}
      <div class="placeholder-content">
        <h3>ASK Query Result</h3>
        <p class="ask-result {(parsedResults() as ParsedAskResult).value ? 'true' : 'false'}">
          {(parsedResults() as ParsedAskResult).value ? 'TRUE' : 'FALSE'}
        </p>
        {#if state.executionTime}
          <p class="execution-time">Executed in {state.executionTime}ms</p>
        {/if}
      </div>

    <!-- No results yet -->
    {:else}
      <div class="placeholder-content">
        <h3>Query Results</h3>
        <p>Results will be displayed here after query execution</p>
        <p class="hint">
          SELECT queries will show a table view, ASK queries will show boolean results
        </p>
      </div>
    {/if}
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

  /* ASK result display */
  .ask-result {
    font-size: 3rem;
    font-weight: 600;
    margin: var(--cds-spacing-06, 1.5rem) 0;
    padding: var(--cds-spacing-05, 1rem);
    border-radius: 4px;
  }

  .ask-result.true {
    color: var(--cds-support-success, #24a148);
    background-color: rgba(36, 161, 72, 0.1);
  }

  .ask-result.false {
    color: var(--cds-support-error, #da1e28);
    background-color: rgba(218, 30, 40, 0.1);
  }

  .execution-time {
    font-size: 0.75rem;
    color: var(--cds-text-helper, #6f6f6f);
    font-style: italic;
  }

  /* DataTable fills container */
  :global(.results-placeholder:has(.data-table-container)) {
    padding: 0;
    border: none;
    display: block;
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

  :global(.g90) .execution-time,
  :global(.g100) .execution-time {
    color: var(--cds-text-helper, #a8a8a8);
  }
</style>
