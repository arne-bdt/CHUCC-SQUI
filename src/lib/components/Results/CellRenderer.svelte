<script lang="ts">
  /**
   * CellRenderer - Minimal cell component for SVAR Grid
   *
   * NO REACTIVE COMPUTATIONS - all data is pre-computed in DataTable
   * Just renders pre-computed metadata as fast as possible
   *
   * @component
   */
  import type { ICellProps } from 'wx-svelte-grid';

  interface Props extends ICellProps {}

  let { row, column, api: _api, onaction: _onaction }: Props = $props();

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
    <span class="literal-value" title={meta.displayText}>{meta.literalValue}</span><span
      class="literal-annotation {meta.annotationType}"
      title="Language or datatype annotation"
      >{meta.annotation}</span
    >
  {:else}
    <!-- Plain text with tooltip - Task 31 -->
    <span title={meta.displayText}>
      {meta.displayText}
    </span>
  {/if}
{:else}
  <!-- Fallback for rows without metadata -->
  {row[column.id]}
{/if}
