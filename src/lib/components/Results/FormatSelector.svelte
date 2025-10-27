<script lang="ts">
  /**
   * FormatSelector Component - Task 37
   * Dropdown for selecting result format
   * Allows changing format and re-executing query with new Accept header
   *
   * @component
   */

  import { Select, SelectItem } from 'carbon-components-svelte';
  import type { ResultFormat } from '../../types';

  interface Props {
    /** Currently selected format */
    value: ResultFormat;
    /** Callback when format changes */
    onchange?: (format: ResultFormat) => void;
    /** Query type to determine available formats */
    queryType?: 'SELECT' | 'ASK' | 'CONSTRUCT' | 'DESCRIBE';
    /** Disabled state */
    disabled?: boolean;
    /** CSS class */
    class?: string;
  }

  let {
    value = 'json',
    onchange,
    queryType = 'SELECT',
    disabled = false,
    class: className = '',
  }: Props = $props();

  // Format options based on query type
  const formatOptions = $derived(() => {
    if (queryType === 'SELECT' || queryType === 'ASK') {
      return [
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML' },
        { value: 'csv', label: 'CSV' },
        { value: 'tsv', label: 'TSV' },
      ];
    } else {
      // CONSTRUCT, DESCRIBE - RDF formats
      return [
        { value: 'turtle', label: 'Turtle' },
        { value: 'jsonld', label: 'JSON-LD' },
        { value: 'rdfxml', label: 'RDF/XML' },
        { value: 'ntriples', label: 'N-Triples' },
      ];
    }
  });

  // Handle format change
  function handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newFormat = target.value as ResultFormat;
    if (onchange) {
      onchange(newFormat);
    }
  }
</script>

<div class="format-selector {className}">
  <Select
    labelText="Format"
    selected={value}
    on:change={handleChange}
    disabled={disabled}
    size="sm"
  >
    {#each formatOptions() as option}
      <SelectItem value={option.value} text={option.label} />
    {/each}
  </Select>
</div>

<style>
  .format-selector {
    min-width: 120px;
  }

  .format-selector :global(.bx--select) {
    margin-bottom: 0;
  }

  .format-selector :global(.bx--label) {
    font-size: 0.75rem;
    margin-bottom: var(--cds-spacing-02, 0.25rem);
  }
</style>
