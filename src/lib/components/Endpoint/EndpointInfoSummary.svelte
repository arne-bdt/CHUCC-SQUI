<!--
  Endpoint Info Summary Component
  Collapsible summary bar showing endpoint capabilities at a glance
  Expands to show detailed EndpointDashboard
-->
<script lang="ts">
  import { Button, SkeletonText } from 'carbon-components-svelte';
  import { ChevronDown, ChevronUp, Renew, InformationFilled } from 'carbon-icons-svelte';
  import { getServiceDescriptionStore, getEndpointStore } from '../../stores/storeContext';
  import { SPARQLLanguage } from '../../types';
  import type { ServiceDescription } from '../../types';
  import EndpointDashboard from './EndpointDashboard.svelte';

  interface Props {
    /** Callback to insert function at cursor position in editor */
    onInsertFunction?: (functionCall: string) => void;
  }

  let { onInsertFunction }: Props = $props();

  // Get stores from context
  const serviceDescriptionStore = getServiceDescriptionStore();
  const endpointStore = getEndpointStore();

  // Subscribe to stores
  const storeState = $derived($serviceDescriptionStore);
  const currentEndpoint = $derived($endpointStore);

  // Get service description for current endpoint
  const serviceDesc = $derived.by(() => {
    if (!currentEndpoint) return null;
    return storeState.descriptions.get(currentEndpoint) || null;
  });

  // Component state
  let expanded = $state(false);

  // Auto-fetch service description when endpoint changes
  $effect(() => {
    if (currentEndpoint) {
      serviceDescriptionStore.fetchForEndpoint(currentEndpoint);
    }
  });

  /**
   * Format time ago from timestamp
   * Examples: "2m ago", "3h ago", "2d ago"
   */
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'just now';
  }

  /**
   * Get SPARQL version string from supported languages
   */
  function getSparqlVersion(desc: ServiceDescription): string {
    if (desc.supportedLanguages.includes(SPARQLLanguage.SPARQL11Query)) {
      return 'SPARQL 1.1';
    }
    if (desc.supportedLanguages.includes(SPARQLLanguage.SPARQL10Query)) {
      return 'SPARQL 1.0';
    }
    return 'Unknown';
  }

  /**
   * Count total graphs (default + named)
   */
  function getGraphCount(desc: ServiceDescription): number {
    if (!desc.datasets || desc.datasets.length === 0) return 0;
    const dataset = desc.datasets[0]; // Use first dataset
    const defaultCount = dataset.defaultGraphs?.length || 0;
    const namedCount = dataset.namedGraphs?.length || 0;
    return defaultCount + namedCount;
  }

  /**
   * Count total extension functions and aggregates
   */
  function getFunctionCount(desc: ServiceDescription): number {
    const funcCount = desc.extensionFunctions?.length || 0;
    const aggCount = desc.extensionAggregates?.length || 0;
    return funcCount + aggCount;
  }

  /**
   * Toggle expanded/collapsed state
   */
  function toggleExpanded() {
    expanded = !expanded;
  }

  /**
   * Refresh service description
   */
  async function handleRefresh() {
    if (currentEndpoint) {
      await serviceDescriptionStore.fetchForEndpoint(currentEndpoint, true);
    }
  }

  // Computed summary text
  const summaryText = $derived.by(() => {
    if (!serviceDesc || !serviceDesc.available) return null;

    const version = getSparqlVersion(serviceDesc);
    const graphCount = getGraphCount(serviceDesc);
    const functionCount = getFunctionCount(serviceDesc);
    const timeAgo = formatTimeAgo(serviceDesc.lastFetched);

    return `✓ ${version} | ${graphCount} graphs | ${functionCount} functions | Last: ${timeAgo}`;
  });

  // Show component only if endpoint is selected
  const shouldShow = $derived(!!currentEndpoint);
</script>

{#if shouldShow}
  <div class="endpoint-info-summary" class:expanded>
    <!-- Collapsed Summary Bar -->
    <div class="summary-bar">
      {#if storeState.loading}
        <div class="summary-loading">
          <SkeletonText width="60%" />
        </div>
      {:else if storeState.error || !serviceDesc || !serviceDesc.available}
        <div class="summary-error">
          <InformationFilled size={16} />
          <span>No service description available</span>
        </div>
      {:else if summaryText}
        <div class="summary-content">
          <span class="summary-text">{summaryText}</span>
        </div>
      {/if}

      <div class="summary-actions">
        <Button
          kind="ghost"
          size="sm"
          icon={Renew}
          iconDescription="Refresh"
          tooltipPosition="left"
          onclick={handleRefresh}
          disabled={!currentEndpoint || storeState.loading}
        />
        {#if serviceDesc && serviceDesc.available}
          <Button
            kind="ghost"
            size="sm"
            icon={expanded ? ChevronUp : ChevronDown}
            iconDescription={expanded ? 'Collapse' : 'Expand'}
            tooltipPosition="left"
            onclick={toggleExpanded}
          />
        {/if}
      </div>
    </div>

    <!-- Expanded Dashboard -->
    {#if expanded && serviceDesc && serviceDesc.available}
      <div class="dashboard-container">
        <EndpointDashboard
          {currentEndpoint}
          {onInsertFunction}
        />
      </div>
    {/if}
  </div>
{/if}

<style>
  .endpoint-info-summary {
    background: var(--cds-layer-01, #f4f4f4);
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    font-family: var(--cds-body-font-family, 'IBM Plex Sans', sans-serif);
  }

  .summary-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--cds-spacing-03) var(--cds-spacing-05);
    min-height: 40px;
  }

  .summary-loading,
  .summary-error,
  .summary-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03);
  }

  .summary-text {
    font-size: var(--cds-body-compact-01);
    line-height: 1.29;
    color: var(--cds-text-secondary, #525252);
    font-family: var(--cds-code-font-family, 'IBM Plex Mono', monospace);
  }

  .summary-error {
    color: var(--cds-text-secondary, #525252);
    font-size: var(--cds-body-compact-01);
    line-height: 1.29;
  }

  .summary-error :global(svg) {
    fill: var(--cds-support-info, #0f62fe);
    flex-shrink: 0;
  }

  .summary-actions {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-02);
    margin-left: var(--cds-spacing-05);
  }

  .dashboard-container {
    border-top: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    background: var(--cds-layer-02, #ffffff);
    max-height: 500px;
    overflow-y: auto;
  }

  /* Responsive adjustments */
  @media (max-width: 672px) {
    .summary-bar {
      flex-wrap: wrap;
      gap: var(--cds-spacing-03);
    }

    .summary-actions {
      margin-left: 0;
    }

    .summary-text {
      font-size: var(--cds-body-compact-01);
      word-break: break-word;
    }
  }
</style>
