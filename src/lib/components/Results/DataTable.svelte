<script lang="ts">
  /**
   * DataTable Component
   * High-performance SPARQL results table using SVAR DataGrid (wx-svelte-grid)
   * Displays query results with virtual scrolling for large datasets
   *
   * @component
   */

  import { Grid, HeaderMenu } from 'wx-svelte-grid';
  import type { IApi } from 'wx-svelte-grid';
  import type { ParsedTableData } from '../../utils/resultsParser';
  import {
    getCellDisplayValue,
    getCellAnnotation,
    getCellAnnotationType,
    isRdfHtmlLiteral,
  } from '../../utils/resultsParser';
  import CellRenderer from './CellRenderer.svelte';

  interface Props {
    /** Parsed table data from resultsParser */
    data: ParsedTableData;
    /** Enable virtual scrolling (default: true) */
    virtualScroll?: boolean;
    /** Row height in pixels (default: 32) */
    rowHeight?: number;
    /** CSS class for the table container */
    class?: string;
    /** Prefixes from the query for IRI abbreviation */
    prefixes?: Record<string, string>;
    /** Enable column filtering (default: false) - Task 26 */
    enableFilter?: boolean;
    /** Show full URIs instead of abbreviated (default: false) - Task 30 */
    showFullUris?: boolean;
    /** Initial column visibility (default: all visible) - Task 29 */
    initialColumnVisibility?: Record<string, boolean>;
    /** Callback when column visibility changes - Task 29 */
    onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
    /** Enable column visibility toolbar (default: false) - Task 29 */
    enableColumnVisibility?: boolean;
  }

  let {
    data,
    virtualScroll = true,
    rowHeight = 32,
    class: className = '',
    prefixes,
    enableFilter = false,
    showFullUris = false,
    initialColumnVisibility,
    onColumnVisibilityChange,
    enableColumnVisibility = false,
  }: Props = $props();

  // Task 29: Grid API for column visibility control (bind:this)
  let gridApi: IApi | undefined = $state();

  // Task 29: Column visibility state (all visible by default)
  let columnVisibility = $state<Record<string, boolean>>(
    initialColumnVisibility ||
      Object.fromEntries(data.columns.map((col) => [col, true]))
  );

  // Task 29: Notify parent of visibility changes
  $effect(() => {
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(columnVisibility);
    }
  });

  /**
   * Convert ParsedTableData to wx-svelte-grid column format
   * Uses minimal CellRenderer component (no reactive overhead, just renders pre-computed data)
   */
  const columns = $derived(
    data.columns.map((varName) => ({
      id: varName,
      label: varName,
      width: 200,
      sort: true, // Task 25: Column sorting enabled
      editor: false,
      resizable: true, // Task 27: Column resizing enabled
      hidden: !columnVisibility[varName], // Task 29: Hide if not visible
      cell: CellRenderer, // Minimal component with ZERO reactive computations
      // Task 26: Column filtering - add filter config when enabled
      header: enableFilter
        ? [
            varName, // Column label
            {
              filter: {
                type: 'text' as const,
                config: {
                  placeholder: `Filter ${varName}...`,
                },
              },
            },
          ]
        : varName,
    }))
  );

  /**
   * Convert ParsedTableData rows to wx-svelte-grid data format
   * Pre-computes ALL display metadata ONCE for maximum performance
   */
  const gridData = $derived.by(() => {
    return data.rows.map((row, index) => {
      const gridRow: Record<string, any> = {
        id: index, // Grid requires unique id
      };

      // Pre-compute display metadata for each cell (happens ONCE, not per render)
      for (const varName of data.columns) {
        const cell = row[varName];

        // Get display value for sorting
        // Task 30: Use showFullUris prop to control IRI abbreviation
        const displayValue = getCellDisplayValue(cell, {
          showDatatype: true,
          showLang: true,
          abbreviateUri: !showFullUris, // Task 30: Toggle between simple/full view
          prefixes: prefixes, // Use prefixes from query
        });

        // Store display string for sorting
        gridRow[varName] = displayValue;

        // Pre-compute all display metadata (no reactive computations later!)
        const annotation = getCellAnnotation(cell, {
          showDatatype: true,
          showLang: true,
          abbreviateDatatype: true,
        });

        gridRow[`__meta_${varName}`] = {
          displayText: displayValue,
          literalValue: cell.value || '', // Raw literal value without quotes/annotations
          isUri: cell.type === 'uri',
          href: cell.rawValue || cell.value || '',
          isRdfHtml: isRdfHtmlLiteral(cell),
          annotation: annotation,
          annotationType: getCellAnnotationType(cell),
        };
      }

      return gridRow;
    });
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
    <!-- SVAR DataGrid with optional HeaderMenu wrapper -->
    <div class="grid-wrapper">
      {#if enableColumnVisibility}
        <!-- Task 29: HeaderMenu wraps Grid for column visibility -->
        <HeaderMenu columns={columnVisibility} api={gridApi}>
          <Grid
            bind:this={gridApi}
            columns={columns}
            data={gridData}
            autoWidth={false}
            rowHeight={rowHeight}
            headerRowHeight={enableFilter ? 80 : 40}
            header={true}
            virtual={virtualScroll}
            selection={true}
            sort={true}
            filter={enableFilter}
            resize={true}
          />
        </HeaderMenu>
      {:else}
        <!-- Grid without column visibility -->
        <Grid
          columns={columns}
          data={gridData}
          autoWidth={false}
          rowHeight={rowHeight}
          headerRowHeight={enableFilter ? 80 : 40}
          header={true}
          virtual={virtualScroll}
          selection={true}
          sort={true}
          filter={enableFilter}
          resize={true}
        />
      {/if}
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

  /* Task 29: HeaderMenu styling (Carbon Design System theme) */

  /* Menu trigger button in header */
  :global(.wx-menu-trigger) {
    background-color: transparent;
    border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    border-radius: 4px;
    padding: var(--cds-spacing-03, 0.5rem);
    cursor: pointer;
    color: var(--cds-text-primary, #161616);
    font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.875rem;
  }

  :global(.wx-menu-trigger:hover) {
    background-color: var(--cds-layer-hover-01, #e5e5e5);
  }

  /* Menu dropdown container */
  :global(.wx-menu),
  :global(.svar-menu) {
    background-color: var(--cds-layer-01, #ffffff);
    border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    padding: var(--cds-spacing-02, 0.25rem) 0;
    min-width: 200px;
    z-index: 1000;
  }

  /* Menu option items */
  :global(.wx-option) {
    padding: var(--cds-spacing-03, 0.5rem) var(--cds-spacing-05, 1rem);
    cursor: pointer;
    color: var(--cds-text-primary, #161616);
    font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03, 0.5rem);
  }

  :global(.wx-option:hover) {
    background-color: var(--cds-layer-hover-01, #e5e5e5);
  }

  /* Checkbox in menu options */
  :global(.wx-option input[type="checkbox"]) {
    margin-right: var(--cds-spacing-03, 0.5rem);
    cursor: pointer;
  }

  /* Menu icon container */
  :global(.wx-icon) {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Icon elements (wxi-* classes) */
  :global(.wx-icon i[class^="wxi-"]),
  :global(.wx-icon .wxi-eye) {
    font-size: 16px;
    color: var(--cds-icon-primary, #161616);
  }

  /* Dark theme support for HeaderMenu */
  :global(.g90 .wx-menu),
  :global(.g100 .wx-menu) {
    background-color: var(--cds-layer-01, #262626);
    border-color: var(--cds-border-subtle-01, #525252);
    color: var(--cds-text-primary, #f4f4f4);
  }

  :global(.g90 .wx-option),
  :global(.g100 .wx-option) {
    color: var(--cds-text-primary, #f4f4f4);
  }

  :global(.g90 .wx-option:hover),
  :global(.g100 .wx-option:hover) {
    background-color: var(--cds-layer-hover-01, #353535);
  }

  :global(.g90 .wx-menu-trigger),
  :global(.g100 .wx-menu-trigger) {
    border-color: var(--cds-border-subtle-01, #525252);
    color: var(--cds-text-primary, #f4f4f4);
  }

  :global(.g90 .wx-menu-trigger:hover),
  :global(.g100 .wx-menu-trigger:hover) {
    background-color: var(--cds-layer-hover-01, #353535);
  }

  :global(.g90 .wx-icon i[class^="wxi-"]),
  :global(.g100 .wx-icon i[class^="wxi-"]) {
    color: var(--cds-icon-primary, #f4f4f4);
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

  /* ============================================
   * Cell Content Styles (from former UriCell component)
   * Rendered via template function for maximum performance
   * ============================================ */

  /**
   * URI Link Styles (Task 23: Clickable IRI Links)
   * Carbon Design System link styles
   */
  :global(.uri-link) {
    color: var(--cds-link-primary, #0f62fe);
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
  }

  :global(.uri-link:hover) {
    text-decoration: underline;
    color: var(--cds-link-primary-hover, #0043ce);
  }

  :global(.uri-link:visited) {
    color: var(--cds-link-visited, #8a3ffc);
  }

  :global(.uri-link:active) {
    color: var(--cds-link-primary, #0f62fe);
  }

  :global(.uri-link:focus) {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: 2px;
  }

  /* Dark theme support for URI links */
  :global(.g90 .uri-link),
  :global(.g100 .uri-link) {
    color: var(--cds-link-primary, #78a9ff);
  }

  :global(.g90 .uri-link:hover),
  :global(.g100 .uri-link:hover) {
    color: var(--cds-link-primary-hover, #a6c8ff);
  }

  :global(.g90 .uri-link:visited),
  :global(.g100 .uri-link:visited) {
    color: var(--cds-link-visited, #be95ff);
  }

  :global(.g90 .uri-link:active),
  :global(.g100 .uri-link:active) {
    color: var(--cds-link-primary, #78a9ff);
  }

  /**
   * Literal Annotation Styles (Task 24: Literal Type and Language Display)
   * Subtle styling for language tags and datatypes
   */
  :global(.literal-value) {
    color: var(--cds-text-primary, #161616);
  }

  :global(.literal-annotation) {
    font-size: 0.875em;
    font-style: italic;
    color: var(--cds-text-secondary, #525252);
    opacity: 0.85;
  }

  :global(.literal-annotation.lang) {
    color: var(--cds-support-info, #0043ce);
  }

  :global(.literal-annotation.datatype) {
    color: var(--cds-support-warning, #f1c21b);
    /* Override dark text color for better visibility */
    filter: brightness(0.7);
  }

  /* Dark theme support for literals */
  :global(.g90 .literal-value),
  :global(.g100 .literal-value) {
    color: var(--cds-text-primary, #f4f4f4);
  }

  :global(.g90 .literal-annotation),
  :global(.g100 .literal-annotation) {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90 .literal-annotation.lang),
  :global(.g100 .literal-annotation.lang) {
    color: var(--cds-support-info, #78a9ff);
  }

  :global(.g90 .literal-annotation.datatype),
  :global(.g100 .literal-annotation.datatype) {
    color: var(--cds-support-warning, #f1c21b);
    filter: none; /* Remove brightness filter in dark mode */
  }

  /**
   * rdf:HTML Literal Warning Style (Task 24)
   * XSS protection: HTML content rendered as text
   */
  :global(.rdf-html-literal) {
    color: var(--cds-text-error, #da1e28);
    font-style: italic;
    cursor: help;
  }

  :global(.g90 .rdf-html-literal),
  :global(.g100 .rdf-html-literal) {
    color: var(--cds-support-error, #ff8389);
  }
</style>
