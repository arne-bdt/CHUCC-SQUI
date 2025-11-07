<script lang="ts">
  /**
   * Result Format Selector Component
   * Allows users to select SPARQL result format with intelligent format suggestions
   * based on Service Description and query type
   */

  import { Select, SelectItem, Tag } from 'carbon-components-svelte';
  import { serviceDescriptionStore } from '../../stores/serviceDescriptionStore.js';
  import { queryStore } from '../../stores/queryStore.js';
  import { detectQueryType } from '../../utils/queryTypeDetection.js';
  import {
    getAvailableFormats,
    getBestFormat,
    getFormatLabel,
    getFormatDescription,
  } from '../../utils/formatUtils.js';
  import type { QueryType } from '../../types/index.js';

  /**
   * Props
   */
  interface Props {
    /** Currently selected format (MIME type) */
    selected?: string;
    /** Callback when format changes */
    onchange?: (format: string) => void;
    /** Endpoint URL to get service description for */
    endpoint?: string;
    /** Query text to detect query type from */
    query?: string;
    /** Disable the selector */
    disabled?: boolean;
  }

  let {
    selected = $bindable('application/sparql-results+json'),
    onchange,
    endpoint,
    query,
    disabled = false,
  }: Props = $props();

  // Get service description state
  const serviceDescState = $derived($serviceDescriptionStore);

  // Determine current endpoint (from prop or store)
  const currentEndpoint = $derived(endpoint || $queryStore.endpoint || serviceDescState.currentEndpoint || '');

  // Get service description for current endpoint
  const serviceDesc = $derived(
    currentEndpoint ? serviceDescState.descriptions.get(currentEndpoint) : undefined
  );

  // Detect query type from query text (from prop or store)
  const queryText = $derived(query || $queryStore.text);
  const queryType: QueryType = $derived(detectQueryType(queryText));

  // Get available formats for current query type
  const availableFormats = $derived.by(() => {
    return getAvailableFormats(serviceDesc, queryType);
  });

  // Auto-select best format when query type or available formats change
  $effect(() => {
    if (availableFormats.length > 0 && !availableFormats.includes(selected)) {
      const bestFormat = getBestFormat(availableFormats, queryType);
      selected = bestFormat;
      onchange?.(bestFormat);
    }
  });

  // Handle format selection
  function handleChange(event: CustomEvent<string>) {
    const newFormat = event.detail;
    selected = newFormat;
    onchange?.(newFormat);
  }
</script>

<div class="format-selector">
  <Select
    labelText="Result Format"
    bind:selected
    on:change={handleChange}
    disabled={disabled || availableFormats.length === 0}
  >
    {#each availableFormats as format}
      <SelectItem value={format} text={getFormatLabel(format)} />
    {/each}
  </Select>

  {#if !serviceDesc || !serviceDesc.available}
    <p class="helper-text">
      Showing default formats (service description not available)
    </p>
  {/if}

  {#if selected}
    <div class="format-info">
      <Tag type="blue" size="sm">{getFormatLabel(selected)}</Tag>
      <p class="format-description">
        {getFormatDescription(selected)}
      </p>
    </div>
  {/if}
</div>

<style>
  .format-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .helper-text {
    font-size: var(--cds-body-compact-01);
    line-height: 1.43;
    color: var(--cds-text-secondary);
    font-style: italic;
    margin: 0;
  }

  .format-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--cds-layer-01);
    border-radius: 4px;
  }

  .format-description {
    font-size: var(--cds-body-compact-01);
    line-height: 1.43;
    color: var(--cds-text-secondary);
    margin: 0;
  }
</style>
