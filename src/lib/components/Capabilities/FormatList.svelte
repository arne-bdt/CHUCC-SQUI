<!--
  Format List Component
  Displays supported result formats as tags
-->
<script lang="ts">
  import { Tag } from 'carbon-components-svelte';

  interface Props {
    formats: string[];
  }

  let { formats }: Props = $props();

  /**
   * Extract format name from MIME type
   * e.g., "application/sparql-results+json" -> "JSON"
   */
  function getFormatLabel(mimeType: string): string {
    // Common SPARQL result formats
    const formatMap: Record<string, string> = {
      'application/sparql-results+json': 'JSON',
      'application/sparql-results+xml': 'XML',
      'text/csv': 'CSV',
      'text/tab-separated-values': 'TSV',
      'application/json': 'JSON',
      'text/turtle': 'Turtle',
      'application/rdf+xml': 'RDF/XML',
      'application/n-triples': 'N-Triples',
      'application/n-quads': 'N-Quads',
      'application/ld+json': 'JSON-LD',
      'text/html': 'HTML',
    };

    const label = formatMap[mimeType];
    if (label) {
      return label;
    }

    // Try to extract from MIME type
    if (mimeType.includes('json')) return 'JSON';
    if (mimeType.includes('xml')) return 'XML';
    if (mimeType.includes('csv')) return 'CSV';
    if (mimeType.includes('tsv') || mimeType.includes('tab-separated')) return 'TSV';
    if (mimeType.includes('turtle')) return 'Turtle';
    if (mimeType.includes('html')) return 'HTML';

    // Fall back to MIME type
    return mimeType;
  }

  /**
   * Get tag type based on format popularity
   */
  function getTagType(mimeType: string): 'blue' | 'gray' | 'green' {
    // Primary formats
    if (
      mimeType.includes('json') ||
      mimeType.includes('csv') ||
      mimeType.includes('xml')
    ) {
      return 'blue';
    }

    // RDF formats
    if (
      mimeType.includes('turtle') ||
      mimeType.includes('rdf') ||
      mimeType.includes('n-triples')
    ) {
      return 'green';
    }

    return 'gray';
  }
</script>

<div class="format-list">
  {#if formats.length === 0}
    <p class="empty-state">No result formats reported</p>
  {:else}
    {#each formats as format}
      <Tag type={getTagType(format)} size="sm" title={format}>
        {getFormatLabel(format)}
      </Tag>
    {/each}
  {/if}
</div>

<style>
  .format-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cds-spacing-03);
  }

  .empty-state {
    color: var(--cds-text-secondary);
    font-style: italic;
    font-size: 0.875rem;
    margin: 0;
  }
</style>
