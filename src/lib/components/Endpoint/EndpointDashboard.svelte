<!--
  Endpoint Dashboard Component
  Tabbed interface displaying endpoint capabilities, datasets, and functions
-->
<script lang="ts">
  import { Tabs, Tab, TabContent } from 'carbon-components-svelte';
  import { getServiceDescriptionStore } from '../../stores/storeContext';
  import LanguageSupport from '../Capabilities/LanguageSupport.svelte';
  import FeatureList from '../Capabilities/FeatureList.svelte';
  import FormatList from '../Capabilities/FormatList.svelte';
  import DatasetInfo from '../Capabilities/DatasetInfo.svelte';
  import FunctionLibrary from '../Functions/FunctionLibrary.svelte';

  interface Props {
    /** Currently active endpoint URL */
    currentEndpoint: string | null;
    /** Callback to insert function at cursor position in editor */
    onInsertFunction?: (functionCall: string) => void;
    /** Compact mode for smaller displays */
    compact?: boolean;
  }

  let { currentEndpoint = null, onInsertFunction, compact = false }: Props = $props();

  // Get store from context
  const serviceDescriptionStore = getServiceDescriptionStore();

  // Subscribe to store
  const storeState = $derived($serviceDescriptionStore);

  // Get service description for current endpoint
  const serviceDesc = $derived.by(() => {
    if (!currentEndpoint) return null;
    return storeState.descriptions.get(currentEndpoint) || null;
  });

  // Tab selection state
  let selectedTab = $state(0);

  // Check if datasets tab should be shown
  const showDatasetsTab = $derived.by(() => {
    if (!serviceDesc) return false;
    const hasDatasets = serviceDesc.datasets && serviceDesc.datasets.length > 0;
    if (!hasDatasets) return false;

    // Check if any dataset has meaningful data
    const dataset = serviceDesc.datasets[0];
    const hasDefaultGraphs = dataset.defaultGraphs && dataset.defaultGraphs.length > 0;
    const hasNamedGraphs = dataset.namedGraphs && dataset.namedGraphs.length > 0;

    return hasDefaultGraphs || hasNamedGraphs;
  });

  // Check if functions tab should be shown
  const showFunctionsTab = $derived.by(() => {
    if (!serviceDesc) return false;
    const hasFunctions = serviceDesc.extensionFunctions && serviceDesc.extensionFunctions.length > 0;
    const hasAggregates = serviceDesc.extensionAggregates && serviceDesc.extensionAggregates.length > 0;
    return hasFunctions || hasAggregates;
  });

  // Build tab count dynamically
  const tabCount = $derived.by(() => {
    let count = 1; // Capabilities tab always shown
    if (showDatasetsTab) count++;
    if (showFunctionsTab) count++;
    return count;
  });

  // Map selected tab index to actual tab (accounting for hidden tabs)
  function getTabLabel(index: number): string {
    if (index === 0) return 'Capabilities';

    let tabIndex = 1;
    if (showDatasetsTab) {
      if (tabIndex === index) return 'Datasets';
      tabIndex++;
    }
    if (showFunctionsTab) {
      if (tabIndex === index) return 'Functions';
      tabIndex++;
    }

    return 'Unknown';
  }
</script>

<div class="endpoint-dashboard" class:compact>
  {#if !serviceDesc || !serviceDesc.available}
    <div class="empty-state">
      <p>No service description available for this endpoint.</p>
      <p class="hint">Some endpoints don't support SPARQL Service Description.</p>
    </div>
  {:else}
    <Tabs bind:selected={selectedTab} class="dashboard-tabs">
      <!-- Capabilities Tab (always shown) -->
      <Tab label="Capabilities" />

      <!-- Datasets Tab (shown if datasets exist) -->
      {#if showDatasetsTab}
        <Tab label="Datasets" />
      {/if}

      <!-- Functions Tab (shown if extension functions exist) -->
      {#if showFunctionsTab}
        <Tab label="Functions" />
      {/if}

      <svelte:fragment slot="content">
        <!-- Capabilities Tab Content -->
        <TabContent>
          <div class="tab-section">
            <h4>SPARQL Language Support</h4>
            <LanguageSupport languages={serviceDesc.supportedLanguages} />
          </div>

          {#if serviceDesc.features && serviceDesc.features.length > 0}
            <div class="tab-section">
              <h4>Service Features</h4>
              <FeatureList features={serviceDesc.features} />
            </div>
          {/if}

          {#if serviceDesc.resultFormats && serviceDesc.resultFormats.length > 0}
            <div class="tab-section">
              <h4>Result Formats</h4>
              <FormatList formats={serviceDesc.resultFormats} />
            </div>
          {/if}

          {#if serviceDesc.inputFormats && serviceDesc.inputFormats.length > 0}
            <div class="tab-section">
              <h4>Input Formats</h4>
              <FormatList formats={serviceDesc.inputFormats} />
            </div>
          {/if}
        </TabContent>

        <!-- Datasets Tab Content -->
        {#if showDatasetsTab}
          <TabContent>
            <div class="tab-section">
              <DatasetInfo datasets={serviceDesc.datasets} />
            </div>
          </TabContent>
        {/if}

        <!-- Functions Tab Content -->
        {#if showFunctionsTab}
          <TabContent>
            <div class="tab-section functions-tab">
              <FunctionLibrary
                {currentEndpoint}
                {onInsertFunction}
              />
            </div>
          </TabContent>
        {/if}
      </svelte:fragment>
    </Tabs>
  {/if}
</div>

<style>
  .endpoint-dashboard {
    background: var(--cds-layer-01, #f4f4f4);
    font-family: var(--cds-body-font-family, 'IBM Plex Sans', sans-serif);
    min-height: 200px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--cds-spacing-09) var(--cds-spacing-05);
    text-align: center;
    min-height: 200px;
  }

  .empty-state p {
    margin: 0 0 var(--cds-spacing-03) 0;
    font-size: var(--cds-body-01);
    line-height: 1.43;
    color: var(--cds-text-primary, #161616);
  }

  .empty-state .hint {
    font-size: var(--cds-body-compact-01);
    line-height: 1.29;
    color: var(--cds-text-secondary, #525252);
  }

  .tab-section {
    padding: var(--cds-spacing-05);
  }

  .tab-section h4 {
    margin: 0 0 var(--cds-spacing-04) 0;
    font-size: var(--cds-productive-heading-01);
    font-weight: 600;
    line-height: 1.29;
    color: var(--cds-text-primary, #161616);
  }

  .tab-section:not(:last-child) {
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  }

  /* Functions tab takes full height */
  .functions-tab {
    padding: 0;
    height: 100%;
  }

  /* Compact mode for smaller displays */
  .endpoint-dashboard.compact .tab-section {
    padding: var(--cds-spacing-04);
  }

  .endpoint-dashboard.compact .tab-section h4 {
    font-size: var(--cds-productive-heading-01);
    margin-bottom: var(--cds-spacing-03);
  }

  /* Tab styling adjustments */
  .endpoint-dashboard :global(.bx--tabs) {
    background: var(--cds-layer-01, #f4f4f4);
  }

  .endpoint-dashboard :global(.bx--tab-content) {
    padding: 0;
    background: var(--cds-layer-02, #ffffff);
  }

  /* Responsive adjustments */
  @media (max-width: 672px) {
    .endpoint-dashboard {
      font-size: var(--cds-body-compact-01);
    }

    .tab-section {
      padding: var(--cds-spacing-04);
    }

    .tab-section h4 {
      font-size: var(--cds-label-01);
    }
  }
</style>
