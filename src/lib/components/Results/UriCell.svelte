<script lang="ts">
  /**
   * UriCell Component
   * Custom cell renderer for wx-svelte-grid that makes URIs clickable
   *
   * Implements Task 23: Clickable IRI Links
   * - Renders URIs as clickable links
   * - Opens links in new tab with security attributes
   * - Applies Carbon Design System link styles
   * - Falls back to plain text for non-URI values
   *
   * @component
   */

  import type { ParsedCell } from '../../utils/resultsParser';

  interface Props {
    /** Row data from wx-svelte-grid */
    row: Record<string, any>;
    /** Column configuration from wx-svelte-grid */
    column: {
      id: string;
      [key: string]: any;
    };
    /** Grid API (not used but required by wx-svelte-grid) */
    api?: any;
  }

  let { row, column }: Props = $props();

  /**
   * Get original ParsedCell from __cellData__ property
   * Falls back to direct row access for backward compatibility with tests
   */
  const cellData = $derived(
    row.__cellData__ && row.__cellData__[column.id]
      ? row.__cellData__[column.id]
      : row[column.id]
  );

  /**
   * Check if this cell contains a URI that should be rendered as a link
   */
  const isUri = $derived(
    cellData &&
    typeof cellData === 'object' &&
    'type' in cellData &&
    cellData.type === 'uri'
  );

  /**
   * Get the href for the link (raw IRI value)
   */
  const href = $derived(
    isUri && cellData && typeof cellData === 'object' && cellData.rawValue
      ? cellData.rawValue
      : (typeof cellData === 'object' && cellData?.value) || ''
  );

  /**
   * Get the display text
   * If row has __cellData__, use row[column.id] which is the display string
   * Otherwise (tests), extract from cellData.displayValue or cellData.value
   */
  const displayText = $derived.by(() => {
    const directValue = row[column.id];

    // If row uses __cellData__ structure, row[column.id] is the display string
    if (row.__cellData__) {
      return typeof directValue === 'string' ? directValue : '';
    }

    // Backward compatibility: extract display value from cell data
    if (cellData && typeof cellData === 'object') {
      if ('displayValue' in cellData && cellData.displayValue) {
        return cellData.displayValue;
      }
      return cellData.value || '';
    }

    return typeof directValue === 'string' ? directValue : '';
  });
</script>

{#if isUri}
  <!-- Clickable URI link with security attributes -->
  <a
    class="uri-link"
    {href}
    target="_blank"
    rel="noopener noreferrer"
    title={href}
  >
    {displayText}
  </a>
{:else}
  <!-- Plain text for non-URI values -->
  {displayText}
{/if}

<style>
  /**
   * Carbon Design System link styles
   * Using Carbon CSS custom properties for theme compatibility
   */
  .uri-link {
    color: var(--cds-link-primary, #0f62fe);
    text-decoration: none;
    cursor: pointer;

    /* Ensure link text doesn't wrap */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
  }

  .uri-link:hover {
    text-decoration: underline;
    color: var(--cds-link-primary-hover, #0043ce);
  }

  .uri-link:visited {
    color: var(--cds-link-visited, #8a3ffc);
  }

  .uri-link:active {
    color: var(--cds-link-primary, #0f62fe);
  }

  .uri-link:focus {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: 2px;
  }

  /* Dark theme support (g90, g100) */
  :global(.g90) .uri-link,
  :global(.g100) .uri-link {
    color: var(--cds-link-primary, #78a9ff);
  }

  :global(.g90) .uri-link:hover,
  :global(.g100) .uri-link:hover {
    color: var(--cds-link-primary-hover, #a6c8ff);
  }

  :global(.g90) .uri-link:visited,
  :global(.g100) .uri-link:visited {
    color: var(--cds-link-visited, #be95ff);
  }

  :global(.g90) .uri-link:active,
  :global(.g100) .uri-link:active {
    color: var(--cds-link-primary, #78a9ff);
  }
</style>
