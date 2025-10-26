<script lang="ts">
  /**
   * DataTable Component
   * High-performance SPARQL results table using SVAR DataGrid (wx-svelte-grid)
   * Displays query results with virtual scrolling for large datasets
   *
   * @component
   */

  import { Grid } from 'wx-svelte-grid';
  import type { ParsedTableData, ParsedCell } from '../../utils/resultsParser';
  import { getCellDisplayValue } from '../../utils/resultsParser';

  interface Props {
    /** Parsed table data from resultsParser */
    data: ParsedTableData;
    /** Enable virtual scrolling (default: true) */
    virtualScroll?: boolean;
    /** Row height in pixels (default: 32) */
    rowHeight?: number;
    /** CSS class for the table container */
    class?: string;
  }

  let { data, virtualScroll = true, rowHeight = 32, class: className = '' }: Props = $props();

  /**
   * Convert ParsedTableData to wx-svelte-grid column format
   */
  const columns = $derived(
    data.columns.map((varName) => ({
      id: varName,
      label: varName,
      width: 200,
      sort: true,
      editor: false,
      resizable: true,
    }))
  );

  /**
   * Convert ParsedTableData rows to wx-svelte-grid data format
   * Each row is an object with variable names as keys
   */
  const gridData = $derived.by(() => {
    return data.rows.map((row, index) => {
      const gridRow: Record<string, any> = {
        id: index, // Grid requires unique id
      };

      // Convert each cell to display value
      for (const varName of data.columns) {
        const cell = row[varName];
        gridRow[varName] = getCellDisplayValue(cell, {
          showDatatype: true,
          showLang: true,
          abbreviateUri: false,
        });
      }

      return gridRow;
    });
  });

  /**
   * Grid configuration
   */
  const gridConfig = $derived({
    columns: columns,
    data: gridData,
    autoWidth: false,
    rowHeight: rowHeight,
    headerRowHeight: 40,
    virtual: virtualScroll,
    selection: true,
    sort: true,
    filter: false, // Will be enabled in Task 26
    resize: true,
  });
</script>

<div class="data-table-container {className}">
  {#if data.rowCount === 0}
    <!-- Empty state -->
    <div class="empty-state">
      <p>No results found</p>
      <p class="hint">Try modifying your query</p>
    </div>
  {:else}
    <!-- SVAR DataGrid -->
    <div class="grid-wrapper">
      <Grid
        columns={gridConfig.columns}
        data={gridConfig.data}
        autoWidth={gridConfig.autoWidth}
        rowHeight={gridConfig.rowHeight}
        headerRowHeight={gridConfig.headerRowHeight}
        virtual={gridConfig.virtual}
        selection={gridConfig.selection}
        sort={gridConfig.sort}
        filter={gridConfig.filter}
        resize={gridConfig.resize}
      />
    </div>

    <!-- Results info footer -->
    <div class="results-info">
      <span>{data.rowCount} {data.rowCount === 1 ? 'result' : 'results'}</span>
      <span>•</span>
      <span>{data.columns.length} {data.columns.length === 1 ? 'variable' : 'variables'}</span>
    </div>
  {/if}
</div>

<style>
  .data-table-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--cds-layer-01, #f4f4f4);
  }

  .grid-wrapper {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  /* Carbon-compatible styling for wx-svelte-grid */
  :global(.wx-grid) {
    font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.875rem;
    color: var(--cds-text-primary, #161616);
    background-color: var(--cds-layer-01, #f4f4f4);
  }

  /* Header styling */
  :global(.wx-grid .wx-header) {
    background-color: var(--cds-layer-02, #ffffff);
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    font-weight: 600;
    color: var(--cds-text-primary, #161616);
  }

  :global(.wx-grid .wx-header-cell) {
    border-right: 1px solid var(--cds-border-subtle-00, #e0e0e0);
    padding: var(--cds-spacing-03, 0.5rem) var(--cds-spacing-05, 1rem);
    display: flex;
    align-items: center;
  }

  /* Cell styling */
  :global(.wx-grid .wx-cell) {
    border-right: 1px solid var(--cds-border-subtle-00, #e0e0e0);
    border-bottom: 1px solid var(--cds-border-subtle-00, #e0e0e0);
    padding: var(--cds-spacing-03, 0.5rem) var(--cds-spacing-05, 1rem);
    display: flex;
    align-items: center;
  }

  /* Row styling */
  :global(.wx-grid .wx-row) {
    background-color: var(--cds-layer-01, #f4f4f4);
  }

  :global(.wx-grid .wx-row:hover) {
    background-color: var(--cds-layer-hover-01, #e5e5e5);
  }

  :global(.wx-grid .wx-row.wx-selected) {
    background-color: var(--cds-layer-selected-01, #e0e0e0);
  }

  /* Scrollbar styling */
  :global(.wx-grid .wx-scroll-y),
  :global(.wx-grid .wx-scroll-x) {
    background-color: var(--cds-layer-02, #ffffff);
  }

  /* Dark theme support */
  :global(.g90) .data-table-container,
  :global(.g100) .data-table-container {
    background-color: var(--cds-layer-01, #262626);
  }

  :global(.g90 .wx-grid),
  :global(.g100 .wx-grid) {
    color: var(--cds-text-primary, #f4f4f4);
    background-color: var(--cds-layer-01, #262626);
  }

  :global(.g90 .wx-grid .wx-header),
  :global(.g100 .wx-grid .wx-header) {
    background-color: var(--cds-layer-02, #393939);
    border-bottom-color: var(--cds-border-subtle-01, #525252);
    color: var(--cds-text-primary, #f4f4f4);
  }

  :global(.g90 .wx-grid .wx-header-cell),
  :global(.g100 .wx-grid .wx-header-cell) {
    border-right-color: var(--cds-border-subtle-00, #525252);
  }

  :global(.g90 .wx-grid .wx-cell),
  :global(.g100 .wx-grid .wx-cell) {
    border-right-color: var(--cds-border-subtle-00, #393939);
    border-bottom-color: var(--cds-border-subtle-00, #393939);
  }

  :global(.g90 .wx-grid .wx-row),
  :global(.g100 .wx-grid .wx-row) {
    background-color: var(--cds-layer-01, #262626);
  }

  :global(.g90 .wx-grid .wx-row:hover),
  :global(.g100 .wx-grid .wx-row:hover) {
    background-color: var(--cds-layer-hover-01, #353535);
  }

  :global(.g90 .wx-grid .wx-row.wx-selected),
  :global(.g100 .wx-grid .wx-row.wx-selected) {
    background-color: var(--cds-layer-selected-01, #393939);
  }

  /* Empty state */
  .empty-state {
    padding: var(--cds-spacing-09, 3rem);
    text-align: center;
    color: var(--cds-text-secondary, #525252);
  }

  .empty-state p {
    margin: var(--cds-spacing-03, 0.5rem) 0;
  }

  .empty-state .hint {
    font-size: 0.875rem;
    font-style: italic;
    color: var(--cds-text-helper, #6f6f6f);
  }

  :global(.g90) .empty-state,
  :global(.g100) .empty-state {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90) .empty-state .hint,
  :global(.g100) .empty-state .hint {
    color: var(--cds-text-helper, #a8a8a8);
  }

  /* Results info footer */
  .results-info {
    padding: var(--cds-spacing-03, 0.5rem) var(--cds-spacing-05, 1rem);
    border-top: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    background-color: var(--cds-layer-02, #ffffff);
    font-size: 0.75rem;
    color: var(--cds-text-secondary, #525252);
    display: flex;
    gap: var(--cds-spacing-03, 0.5rem);
  }

  :global(.g90) .results-info,
  :global(.g100) .results-info {
    background-color: var(--cds-layer-02, #393939);
    border-top-color: var(--cds-border-subtle-01, #525252);
    color: var(--cds-text-secondary, #c6c6c6);
  }
</style>
