<script lang="ts">
  /**
   * UriCell Component
   * Custom cell renderer for wx-svelte-grid that handles URIs and literals
   *
   * Implements Task 23: Clickable IRI Links
   * - Renders URIs as clickable links
   * - Opens links in new tab with security attributes
   * - Applies Carbon Design System link styles
   *
   * Implements Task 24: Literal Type and Language Display
   * - Styles language tags (@en) and datatypes (^^xsd:integer) subtly
   * - Protects against XSS in rdf:HTML literals
   * - Renders literals with styled annotations
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

  /**
   * Check if this is a literal with annotations (language tag or datatype)
   */
  const isLiteralWithAnnotation = $derived(
    cellData &&
    typeof cellData === 'object' &&
    'type' in cellData &&
    cellData.type === 'literal' &&
    (cellData.lang || cellData.datatype)
  );

  /**
   * Parse literal display text to separate value from annotation
   * Returns object with { value, annotation, annotationType }
   */
  interface LiteralParts {
    value: string;
    annotation: string;
    annotationType: 'lang' | 'datatype' | null;
  }

  const literalParts = $derived.by((): LiteralParts => {
    if (!isLiteralWithAnnotation) {
      return { value: displayText, annotation: '', annotationType: null };
    }

    // Match pattern: "value"@lang or "value"^^datatype
    const langMatch = displayText.match(/^"(.+)"@([a-zA-Z\-]+)$/);
    if (langMatch) {
      return {
        value: `"${langMatch[1]}"`,
        annotation: `@${langMatch[2]}`,
        annotationType: 'lang',
      };
    }

    const datatypeMatch = displayText.match(/^"(.+)"\^\^(.+)$/);
    if (datatypeMatch) {
      return {
        value: `"${datatypeMatch[1]}"`,
        annotation: `^^${datatypeMatch[2]}`,
        annotationType: 'datatype',
      };
    }

    // No match, return as-is
    return { value: displayText, annotation: '', annotationType: null };
  });

  /**
   * Check for potential XSS in rdf:HTML literals
   * Sanitize HTML content to prevent script injection
   */
  const isRdfHtml = $derived(
    cellData &&
    typeof cellData === 'object' &&
    'datatype' in cellData &&
    (cellData.datatype === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML' ||
      cellData.datatype === 'rdf:HTML')
  );
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
{:else if isRdfHtml}
  <!-- XSS protection: Display rdf:HTML as plain text, never render as HTML (Task 24) -->
  <span class="rdf-html-literal" title="HTML content (rendered as text for security)">
    {displayText}
  </span>
{:else if isLiteralWithAnnotation && literalParts.annotation}
  <!-- Literal with styled annotation (Task 24) -->
  <span class="literal-cell">
    <span class="literal-value">{literalParts.value}</span><span
      class="literal-annotation {literalParts.annotationType}"
      >{literalParts.annotation}</span
    >
  </span>
{:else}
  <!-- Plain text for other values -->
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

  /**
   * Literal cell styles (Task 24)
   * Subtle styling for language tags and datatypes
   */
  .literal-cell {
    display: inline;
    white-space: nowrap;
  }

  .literal-value {
    color: var(--cds-text-primary, #161616);
  }

  .literal-annotation {
    font-size: 0.875em;
    font-style: italic;
    color: var(--cds-text-secondary, #525252);
    opacity: 0.85;
  }

  .literal-annotation.lang {
    color: var(--cds-support-info, #0043ce);
  }

  .literal-annotation.datatype {
    color: var(--cds-support-warning, #f1c21b);
    /* Override dark text color for better visibility */
    filter: brightness(0.7);
  }

  /* Dark theme support for literals */
  :global(.g90) .literal-value,
  :global(.g100) .literal-value {
    color: var(--cds-text-primary, #f4f4f4);
  }

  :global(.g90) .literal-annotation,
  :global(.g100) .literal-annotation {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90) .literal-annotation.lang,
  :global(.g100) .literal-annotation.lang {
    color: var(--cds-support-info, #78a9ff);
  }

  :global(.g90) .literal-annotation.datatype,
  :global(.g100) .literal-annotation.datatype {
    color: var(--cds-support-warning, #f1c21b);
    filter: none; /* Remove brightness filter in dark mode */
  }

  /* rdf:HTML literal warning style */
  .rdf-html-literal {
    color: var(--cds-text-error, #da1e28);
    font-style: italic;
    cursor: help;
  }

  :global(.g90) .rdf-html-literal,
  :global(.g100) .rdf-html-literal {
    color: var(--cds-support-error, #ff8389);
  }
</style>
