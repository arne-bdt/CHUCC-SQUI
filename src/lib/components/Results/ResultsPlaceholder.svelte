<script lang="ts">
  /**
   * ResultsPlaceholder component - Shows query results or errors
   * Displays DataTable for SELECT queries, boolean for ASK queries, and errors when queries fail
   * Task 36: Added view switching between Table and Raw views
   */

  import { resultsStore } from '../../stores/resultsStore';
  import { queryStore } from '../../stores/queryStore';
  import { themeStore } from '../../stores/theme';
  import ErrorNotification from './ErrorNotification.svelte';
  import DataTable from './DataTable.svelte';
  import RawView from './RawView.svelte';
  import ResultsWarning from './ResultsWarning.svelte';
  import FormatSelector from './FormatSelector.svelte';
  import DownloadButton from './DownloadButton.svelte';
  import { ContentSwitcher, Switch } from 'carbon-components-svelte';
  import { parseResults, isAskResult, isSelectResult } from '../../utils/resultsParser';
  import { downloadResults } from '../../utils/download';
  import type { QueryError, SparqlJsonResults, ResultFormat } from '../../types';
  import type { ParsedTableData, ParsedAskResult } from '../../utils/resultsParser';

  interface Props {
    /** CSS class for the placeholder */
    class?: string;
    /** Task 34: Maximum allowed results (default: 100,000) */
    maxResults?: number;
    /** Task 34: Warning threshold percentage (default: 80%) */
    warningThreshold?: number;
    /** Task 34: Callback for downloading results */
    onDownloadResults?: () => void;
  }

  let {
    class: className = '',
    maxResults = 100000,
    warningThreshold = 0.8,
    onDownloadResults,
  }: Props = $props();

  // Subscribe to results store (use $ prefix to auto-subscribe)
  const state = $derived($resultsStore);

  // Subscribe to query store to get current query for re-execution
  const queryState = $derived($queryStore);

  // Get current theme for RawView
  const currentTheme = $derived($themeStore.current);

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

  // Check if we have results to display (not just the placeholder)
  const hasResults = $derived(() => {
    return state.data !== null && !state.loading;
  });

  // Task 36: Ensure SELECT queries default to table view
  $effect(() => {
    if (state.data && !state.loading && isTable()) {
      // For SELECT query results, ensure we start in table view
      if (state.view !== 'table') {
        resultsStore.setView('table');
      }
    }
  });

  // Task 36: View switcher state (0 = Table, 1 = Raw)
  // Use state variable for two-way binding with ContentSwitcher
  let viewIndex = $state(0);

  // Sync viewIndex with store view state
  $effect(() => {
    viewIndex = state.view === 'raw' ? 1 : 0;
  });

  // Handle view switching
  function handleViewChange(event: CustomEvent): void {
    const newIndex = event.detail.index;
    const newView = newIndex === 0 ? 'table' : 'raw';

    // Log for debugging in Storybook
    console.log('View switching:', { oldView: state.view, newView, newIndex });

    resultsStore.setView(newView);
  }

  // Task 37: Handle format change and re-query
  async function handleFormatChange(newFormat: ResultFormat): Promise<void> {
    // Update format in store
    resultsStore.setFormat(newFormat);

    // Re-execute query with new format if we have query and endpoint
    if (queryState.text && queryState.endpoint) {
      await resultsStore.executeQuery({
        query: queryState.text,
        endpoint: queryState.endpoint,
        format: newFormat,
      });
    }
  }

  // Task 38: Handle download
  function handleDownload(format: ResultFormat): void {
    console.log('Download clicked:', { format, hasRawData: !!state.rawData });

    if (state.rawData) {
      try {
        downloadResults(state.rawData, format);
        console.log('Download initiated successfully');
      } catch (error) {
        console.error('Download failed:', error);
      }
    } else {
      console.warn('No raw data available for download');
    }
  }

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

    <!-- Task 36: View switcher and results display for SELECT queries ONLY -->
    {:else if isTable() && parsedResults()}
      <div class="results-container">
        <!-- View switcher toolbar -->
        <div class="results-toolbar">
          <div class="toolbar-left">
            <ContentSwitcher bind:selectedIndex={viewIndex} on:change={handleViewChange}>
              <Switch text="Table" />
              <Switch text="Raw" />
            </ContentSwitcher>

            <!-- Task 37: Format selector (shown only in raw view) -->
            {#if state.view === 'raw'}
              <FormatSelector
                value={state.format}
                queryType={queryState.type}
                onchange={handleFormatChange}
                disabled={state.loading}
              />
            {/if}
          </div>

          <div class="toolbar-right">
            {#if state.executionTime}
              <span class="execution-time-badge">
                Executed in {state.executionTime}ms
              </span>
            {/if}

            <!-- Task 38: Download button -->
            <DownloadButton
              currentFormat={state.format}
              ondownload={handleDownload}
              disabled={state.loading || !state.rawData}
            />
          </div>
        </div>

        <!-- Task 34: Show warning for large result sets (only in table view) -->
        {#if state.view === 'table' && isTable()}
          <ResultsWarning
            resultCount={(parsedResults() as ParsedTableData).rowCount}
            maxResults={maxResults}
            warningThreshold={warningThreshold}
            onDownload={onDownloadResults}
            downloadAvailable={!!onDownloadResults}
          />
        {/if}

        <!-- Results content area -->
        <div class="results-content">
          {#if state.view === 'table'}
            <!-- Table view - show DataTable -->
            {#if isTable()}
              <DataTable data={parsedResults() as ParsedTableData} prefixes={state.prefixes} />
            {:else}
              <div class="placeholder-content">
                <p>No tabular data available for this query result.</p>
                <p class="hint">Switch to Raw view to see the response.</p>
              </div>
            {/if}
          {:else if state.view === 'raw'}
            <!-- Raw view - show raw response -->
            {#if state.rawData}
              <RawView
                data={state.rawData}
                contentType={state.contentType}
                theme={currentTheme}
              />
            {:else}
              <div class="placeholder-content">
                <p>No raw data available.</p>
              </div>
            {/if}
          {/if}
        </div>
      </div>

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

  /* Task 36: Results container with view switcher */
  .results-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Task 36: Toolbar with view switcher */
  .results-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--cds-spacing-05, 1rem);
    padding: var(--cds-spacing-03, 0.5rem) var(--cds-spacing-05, 1rem);
    background-color: var(--cds-layer-01, #f4f4f4);
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  }

  /* Task 37: Toolbar sections */
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-05, 1rem);
    flex: 1;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-05, 1rem);
  }

  /* Fix ContentSwitcher button width - prevent truncation */
  .toolbar-left :global(.bx--content-switcher) {
    min-width: max-content;
  }

  .toolbar-left :global(.bx--content-switcher-btn) {
    min-width: 80px;
    white-space: nowrap;
  }

  .execution-time-badge {
    font-size: 0.75rem;
    color: var(--cds-text-helper, #6f6f6f);
    font-style: italic;
  }

  /* Task 36: Results content fills remaining space */
  .results-content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* When results-container is present, reset placeholder styles */
  .results-placeholder:has(.results-container) {
    padding: 0;
    border: none;
    display: block;
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

  :global(.g90) .results-toolbar,
  :global(.g100) .results-toolbar {
    background-color: var(--cds-layer-01, #262626);
    border-bottom-color: var(--cds-border-subtle-01, #393939);
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
  :global(.g100) .execution-time,
  :global(.g90) .execution-time-badge,
  :global(.g100) .execution-time-badge {
    color: var(--cds-text-helper, #a8a8a8);
  }
</style>
