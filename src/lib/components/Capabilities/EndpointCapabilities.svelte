<!--
  Endpoint Capabilities Panel
  Displays SPARQL endpoint capabilities and features based on Service Description
-->
<script lang="ts">
  import { SkeletonText, Button, ExpandableTile } from 'carbon-components-svelte';
  import { Renew } from 'carbon-icons-svelte';
  import { serviceDescriptionStore } from '../../stores/serviceDescriptionStore';

  import LanguageSupport from './LanguageSupport.svelte';
  import FeatureList from './FeatureList.svelte';
  import FormatList from './FormatList.svelte';
  import ExtensionList from './ExtensionList.svelte';
  import DatasetInfo from './DatasetInfo.svelte';
  import FunctionLibrary from '../Functions/FunctionLibrary.svelte';

  interface Props {
    /** SPARQL endpoint URL to show capabilities for */
    endpointUrl?: string;
    /** Callback to insert function text into editor */
    onInsertFunction?: (functionCall: string) => void;
  }

  let { endpointUrl, onInsertFunction }: Props = $props();

  const state = $derived($serviceDescriptionStore);
  const loading = $derived(state.loading);
  const error = $derived(state.error);

  // Get service description for the provided endpoint or current endpoint
  const currentEndpoint = $derived(endpointUrl || state.currentEndpoint);
  const serviceDesc = $derived.by(() => {
    if (currentEndpoint) {
      return state.descriptions.get(currentEndpoint);
    }
    return undefined;
  });

  function refreshCapabilities() {
    if (currentEndpoint) {
      serviceDescriptionStore.fetchForEndpoint(currentEndpoint, true);
    }
  }

  function tryFetch() {
    if (currentEndpoint) {
      serviceDescriptionStore.fetchForEndpoint(currentEndpoint, false);
    }
  }
</script>

<div class="capabilities-panel">
  {#if loading}
    <div class="loading-state">
      <SkeletonText paragraph lines={4} />
    </div>
  {:else if serviceDesc && serviceDesc.available}
    <!-- Header with refresh button -->
    <div class="panel-header">
      <h3 class="panel-title">Endpoint Capabilities</h3>
      <Button
        kind="ghost"
        size="small"
        iconDescription="Refresh capabilities"
        icon={Renew}
        onclick={refreshCapabilities}
      />
    </div>

    <!-- SPARQL Language Support -->
    <section class="capability-section">
      <h4 class="section-title">SPARQL Support</h4>
      <LanguageSupport languages={serviceDesc.supportedLanguages} />
    </section>

    <!-- Service Features -->
    <section class="capability-section">
      <h4 class="section-title">Features</h4>
      <FeatureList features={serviceDesc.features} />
    </section>

    <!-- Result Formats -->
    <section class="capability-section">
      <h4 class="section-title">Result Formats</h4>
      <FormatList formats={serviceDesc.resultFormats} />
    </section>

    <!-- Input Formats -->
    {#if serviceDesc.inputFormats.length > 0}
      <section class="capability-section">
        <h4 class="section-title">Input Formats</h4>
        <FormatList formats={serviceDesc.inputFormats} />
      </section>
    {/if}

    <!-- Extension Functions & Aggregates Library -->
    {#if serviceDesc.extensionFunctions.length > 0 || serviceDesc.extensionAggregates.length > 0}
      <section class="capability-section function-library-section">
        <FunctionLibrary currentEndpoint={currentEndpoint} {onInsertFunction} />
      </section>
    {/if}

    <!-- Dataset Information -->
    {#if serviceDesc.datasets.length > 0}
      <section class="capability-section">
        <h4 class="section-title">Datasets</h4>
        <DatasetInfo datasets={serviceDesc.datasets} />
      </section>
    {/if}

    <!-- Last Updated -->
    <div class="metadata">
      <span class="metadata-label">Last updated:</span>
      <span class="metadata-value">
        {new Date(serviceDesc.lastFetched).toLocaleString()}
      </span>
    </div>
  {:else if error}
    <div class="error-state">
      <p class="error-message">{error}</p>
      <Button kind="tertiary" size="small" onclick={tryFetch}>Try Again</Button>
    </div>
  {:else}
    <div class="no-service-description">
      <p class="empty-message">Service description not available for this endpoint.</p>
      <p class="empty-hint">
        The endpoint may not support SPARQL Service Description or may be unreachable.
      </p>
      <Button kind="tertiary" size="small" onclick={tryFetch}>Try to Fetch</Button>
    </div>
  {/if}
</div>

<style>
  .capabilities-panel {
    padding: var(--cds-spacing-05);
    font-size: 0.875rem;
  }

  .loading-state {
    padding: var(--cds-spacing-05) 0;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--cds-spacing-06);
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--cds-text-primary);
    margin: 0;
  }

  .capability-section {
    margin-bottom: var(--cds-spacing-06);
    padding-bottom: var(--cds-spacing-05);
    border-bottom: 1px solid var(--cds-border-subtle-01);
  }

  .capability-section:last-of-type {
    border-bottom: none;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--cds-text-primary);
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .expandable-header {
    font-weight: 500;
    color: var(--cds-text-primary);
  }

  .expandable-content {
    padding-top: var(--cds-spacing-05);
  }

  .metadata {
    margin-top: var(--cds-spacing-06);
    padding-top: var(--cds-spacing-05);
    border-top: 1px solid var(--cds-border-subtle-01);
    font-size: 0.75rem;
    color: var(--cds-text-secondary);
  }

  .metadata-label {
    font-weight: 600;
  }

  .metadata-value {
    margin-left: var(--cds-spacing-03);
  }

  .error-state,
  .no-service-description {
    padding: var(--cds-spacing-07) var(--cds-spacing-05);
    text-align: center;
  }

  .error-message,
  .empty-message {
    color: var(--cds-text-primary);
    font-weight: 500;
    margin: 0 0 var(--cds-spacing-03) 0;
  }

  .empty-hint {
    color: var(--cds-text-secondary);
    font-size: 0.8125rem;
    margin: 0 0 var(--cds-spacing-05) 0;
  }

  .error-state .error-message {
    color: var(--cds-text-error);
  }

  /* Function library section - remove default padding since FunctionLibrary has its own */
  .function-library-section {
    padding: 0;
    border-bottom: none;
  }
</style>
