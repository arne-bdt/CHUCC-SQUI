<script lang="ts">
  import { Search, Button, Modal, Tabs, Tab, TabContent, Link } from 'carbon-components-svelte';
  import { Document } from 'carbon-icons-svelte';
  import FunctionDetails from './FunctionDetails.svelte';
  import { serviceDescriptionStore } from '$lib/stores/serviceDescriptionStore';
  import { buildFunctionCall, getFunctionName, filterFunctions } from '$lib/editor/utils/functionFormatting';
  import type { ExtensionFunction, ExtensionAggregate } from '$lib/types';

  interface Props {
    /** Currently active endpoint URL */
    currentEndpoint: string | null;
    /** Callback to insert function at cursor position in editor */
    onInsertFunction?: (functionCall: string) => void;
  }

  let { currentEndpoint = null, onInsertFunction }: Props = $props();

  // Subscribe to service description store
  const storeState = $derived($serviceDescriptionStore);

  // Get service description for current endpoint
  const serviceDesc = $derived(
    currentEndpoint ? storeState.descriptions.get(currentEndpoint) : null
  );

  // Get extension functions and aggregates
  const functions = $derived(serviceDesc?.extensionFunctions ?? []);
  const aggregates = $derived(serviceDesc?.extensionAggregates ?? []);

  // Search state
  let searchTerm = $state('');

  // Tab state (0 = functions, 1 = aggregates)
  let selectedTab = $state(0);

  // Modal state
  let selectedFunction = $state<ExtensionFunction | ExtensionAggregate | null>(null);
  let showModal = $state(false);

  // Filtered lists
  const filteredFunctions = $derived(filterFunctions(functions, searchTerm));
  const filteredAggregates = $derived(filterFunctions(aggregates, searchTerm));

  // Current list based on tab
  const currentList = $derived(selectedTab === 0 ? filteredFunctions : filteredAggregates);

  function showDetails(func: ExtensionFunction | ExtensionAggregate) {
    selectedFunction = func;
    showModal = true;
  }

  function insertFunction(func: ExtensionFunction | ExtensionAggregate) {
    const functionCall = buildFunctionCall(func);
    if (onInsertFunction) {
      onInsertFunction(functionCall);
    }
  }

  function closeModal() {
    showModal = false;
    selectedFunction = null;
  }
</script>

<div class="function-library">
  <div class="header">
    <h3>Extension Functions</h3>
    <Search
      bind:value={searchTerm}
      placeholder="Search functions..."
      size="sm"
      class="search-input"
    />
  </div>

  <Tabs bind:selected={selectedTab}>
    <Tab label="Functions ({functions.length})" />
    <Tab label="Aggregates ({aggregates.length})" />
    <svelte:fragment slot="content">
      <TabContent>
        <div class="function-list">
          {#if currentList.length > 0}
            {#each currentList as func (func.uri)}
              <div class="function-item">
                <div class="function-header">
                  <code class="function-uri">{getFunctionName(func.uri)}</code>
                  {#if func.label}
                    <span class="function-label">{func.label}</span>
                  {/if}
                </div>

                {#if func.comment}
                  <p class="function-description">{func.comment}</p>
                {/if}

                <div class="function-actions">
                  <Button size="sm" kind="tertiary" onclick={() => showDetails(func)}>
                    Details
                  </Button>
                  <Button
                    size="sm"
                    kind="primary"
                    onclick={() => insertFunction(func)}
                    disabled={!onInsertFunction}
                  >
                    Insert
                  </Button>
                  {#if func.documentationUrl}
                    <Link
                      href={func.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      icon={Document}
                      size="sm"
                    >
                      Docs
                    </Link>
                  {/if}
                </div>
              </div>
            {/each}
          {:else}
            <div class="empty-state">
              <p>
                {#if searchTerm}
                  No functions match your search
                {:else if selectedTab === 0}
                  No extension functions available
                {:else}
                  No extension aggregates available
                {/if}
              </p>
            </div>
          {/if}
        </div>
      </TabContent>
    </svelte:fragment>
  </Tabs>
</div>

{#if selectedFunction && showModal}
  <Modal
    open={showModal}
    modalHeading={selectedFunction.label || getFunctionName(selectedFunction.uri)}
    passiveModal
    on:close={closeModal}
    on:click:button--secondary={closeModal}
  >
    <FunctionDetails func={selectedFunction} />
  </Modal>
{/if}

<style>
  .function-library {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--cds-layer-01, #f4f4f4);
    font-family: var(--cds-body-font-family, 'IBM Plex Sans', sans-serif);
  }

  .header {
    padding: var(--cds-spacing-05);
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  }

  .header h3 {
    margin: 0 0 var(--cds-spacing-04) 0;
    font-size: var(--cds-productive-heading-02);
    font-weight: 600;
    line-height: 1.5;
    color: var(--cds-text-primary, #161616);
  }

  .function-list {
    padding: var(--cds-spacing-05);
    overflow-y: auto;
    max-height: calc(100vh - 250px);
  }

  .function-item {
    background: var(--cds-layer-02, #ffffff);
    border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    border-radius: 4px;
    padding: var(--cds-spacing-05);
    margin-bottom: var(--cds-spacing-04);
  }

  .function-item:last-child {
    margin-bottom: 0;
  }

  .function-header {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03);
    margin-bottom: var(--cds-spacing-03);
    flex-wrap: wrap;
  }

  .function-uri {
    font-family: var(--cds-code-font-family, 'IBM Plex Mono', monospace);
    font-size: var(--cds-code-02);
    font-weight: 600;
    line-height: 1.43;
    color: var(--cds-text-primary, #161616);
    background: var(--cds-layer-01, #f4f4f4);
    padding: var(--cds-spacing-01) var(--cds-spacing-03);
    border-radius: 3px;
  }

  .function-label {
    font-size: var(--cds-body-01);
    line-height: 1.43;
    color: var(--cds-text-secondary, #525252);
    font-style: italic;
  }

  .function-description {
    font-size: var(--cds-body-01);
    line-height: 1.43;
    color: var(--cds-text-primary, #161616);
    margin: 0 0 var(--cds-spacing-04) 0;
  }

  .function-actions {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-03);
    flex-wrap: wrap;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--cds-spacing-09) var(--cds-spacing-05);
    text-align: center;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--cds-body-01);
    line-height: 1.43;
    color: var(--cds-text-secondary, #525252);
  }

  /* Tabs styling adjustments */
  .function-library :global(.bx--tabs) {
    background: var(--cds-layer-01, #f4f4f4);
  }

  .function-library :global(.bx--tab-content) {
    padding: 0;
  }

  /* Search input adjustments */
  .function-library :global(.bx--search-input) {
    background: var(--cds-field-01, #ffffff);
  }

  /* Link styling */
  .function-actions :global(.bx--link) {
    display: inline-flex;
    align-items: center;
    font-size: var(--cds-body-01);
    line-height: 1.43;
  }

  /* Responsive adjustments */
  @media (max-width: 672px) {
    .function-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .function-actions {
      width: 100%;
    }

    .function-actions :global(.bx--btn) {
      flex: 1;
    }
  }
</style>
