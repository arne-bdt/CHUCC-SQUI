<script lang="ts">
  /**
   * CellRenderer - Minimal cell component for SVAR Grid
   *
   * NO REACTIVE COMPUTATIONS - all data is pre-computed in DataTable
   * Just renders pre-computed metadata as fast as possible
   *
   * @component
   */

  interface Props {
    /** Row data from wx-svelte-grid */
    row: Record<string, any>;
    /** Column configuration from wx-svelte-grid */
    column: {
      id: string;
      [key: string]: any;
    };
    /** Grid API (not used) */
    api?: any;
  }

  let { row, column }: Props = $props();

  // Get pre-computed metadata (NO reactive computation here!)
  const meta = row[`__meta_${column.id}`];
</script>

{#if meta}
  {#if meta.isUri}
    <!-- Clickable URI link -->
    <a
      class="uri-link"
      href={meta.href}
      target="_blank"
      rel="noopener noreferrer"
      title={meta.href}
    >
      {meta.displayText}
    </a>
  {:else if meta.isRdfHtml}
    <!-- XSS protection: Display rdf:HTML as plain text -->
    <span class="rdf-html-literal" title="HTML content (rendered as text for security)">
      {meta.displayText}
    </span>
  {:else if meta.annotation && meta.annotationType}
    <!-- Literal with styled annotation -->
    <span class="literal-value">{meta.literalValue}</span><span
      class="literal-annotation {meta.annotationType}"
      >{meta.annotation}</span
    >
  {:else}
    <!-- Plain text -->
    {meta.displayText}
  {/if}
{:else}
  <!-- Fallback for rows without metadata -->
  {row[column.id]}
{/if}
