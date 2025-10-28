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

  // In Svelte 5 runes mode, access stores directly for proper reactivity
  // Don't wrap in $derived - that creates a snapshot, not a reactive binding

  // Convert error string to QueryError object
  const errorObject = $derived<QueryError | null>(() => {
    if (!$resultsStore.error) return null;
    if (typeof $resultsStore.error === 'string') {
      return { message: $resultsStore.error };
    }
    return $resultsStore.error as QueryError;
  });

  // Parse results when available
  const parsedResults = $derived(() => {
    if (!$resultsStore.data) return null;
    try {
      return parseResults($resultsStore.data as SparqlJsonResults);
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
    return $resultsStore.data !== null && !$resultsStore.loading;
  });

  // Task 36: Extract view for proper reactivity
  const currentView = $derived($resultsStore.view);

  // Task 36: View switcher state (0 = Table, 1 = Raw)
  // Derived directly from store state for reactive sync
  const viewIndex = $derived(currentView === 'raw' ? 1 : 0);

  // Handle view switching
  function handleViewChange(event: CustomEvent): void {
    const newIndex = event.detail.index;

    // Guard: Ignore events with undefined index (fired by ContentSwitcher during initialization)
    if (newIndex === undefined || newIndex === null) {
      return;
    }

    const newView = newIndex === 0 ? 'table' : 'raw';

    // Only update if the view actually changed (prevent circular updates)
    if ($resultsStore.view !== newView) {
      resultsStore.setView(newView);
    }
  }

  // Direct handlers for switch buttons
  function handleTableClick(): void {
    if ($resultsStore.view !== 'table') {
      resultsStore.setView('table');
    }
  }

  function handleRawClick(): void {
    if ($resultsStore.view !== 'raw') {
      resultsStore.setView('raw');
    }
  }

  // Task 38: Handle download
  function handleDownload(format: ResultFormat): void {
    if ($resultsStore.rawData) {
      try {
        downloadResults($resultsStore.rawData, format);
      } catch (error) {
        console.error('Download failed:', error);
      }
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
  {#if !$resultsStore.error}
    <!-- Loading state -->
    {#if $resultsStore.loading}
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
            <ContentSwitcher selectedIndex={viewIndex} on:change={handleViewChange}>
              <Switch text="Table" on:click={handleTableClick} />
              <Switch text="Raw" on:click={handleRawClick} />
            </ContentSwitcher>
          </div>

          <div class="toolbar-right">
            {#if $resultsStore.executionTime}
              <span class="execution-time-badge">
                Executed in {$resultsStore.executionTime}ms
              </span>
            {/if}

            <!-- Task 38: Download button -->
            <DownloadButton
              currentFormat={$resultsStore.format}
              ondownload={handleDownload}
              disabled={$resultsStore.loading || !$resultsStore.rawData}
            />
          </div>
        </div>

        <!-- Task 34: Show warning for large result sets (only in table view) -->
        {#if currentView === 'table' && isTable()}
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
          {#if currentView === 'table'}
            <!-- Table view - show DataTable -->
            {#if isTable()}
              <DataTable data={parsedResults() as ParsedTableData} prefixes={$resultsStore.prefixes} />
            {:else}
              <div class="placeholder-content">
                <p>No tabular data available for this query result.</p>
                <p class="hint">Switch to Raw view to see the response.</p>
              </div>
            {/if}
          {:else if currentView === 'raw'}
            <!-- Raw view - show raw response -->
            {#if $resultsStore.rawData}
              <RawView
                data={$resultsStore.rawData}
                contentType={$resultsStore.contentType}
                theme={$themeStore.current}
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
        {#if $resultsStore.executionTime}
          <p class="execution-time">Executed in {$resultsStore.executionTime}ms</p>
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

  /* Fix ContentSwitcher button width - prevent truncation but keep reasonable size */
  .toolbar-left :global(.bx--content-switcher) {
    width: auto;
  }

  .toolbar-left :global(.bx--content-switcher-btn) {
    min-width: 60px;
    padding: 0 var(--cds-spacing-04, 0.75rem);
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
