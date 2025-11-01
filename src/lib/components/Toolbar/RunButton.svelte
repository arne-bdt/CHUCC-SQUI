<script lang="ts">
  /**
   * Run Query Button Component
   * Executes SPARQL queries with loading state and cancellation support
   */

  import { Button, ButtonSet, InlineLoading } from 'carbon-components-svelte';
  import { Play, StopOutline } from 'carbon-icons-svelte';
  import { queryStore } from '../../stores/queryStore';
  import { resultsStore } from '../../stores/resultsStore';
  import { defaultEndpoint } from '../../stores/endpointStore';
  import { queryExecutionService } from '../../services/queryExecutionService';
  import { t } from '../../localization';

  /**
   * Component props
   */
  interface Props {
    /** Additional CSS class */
    class?: string;
    /** Disabled state */
    disabled?: boolean;
  }

  let { class: className = '', disabled = false }: Props = $props();

  // Subscribe to stores
  let queryState = $state($queryStore);
  let resultsState = $state($resultsStore);
  let endpoint = $state($defaultEndpoint);

  $effect(() => {
    queryState = $queryStore;
  });

  $effect(() => {
    resultsState = $resultsStore;
  });

  $effect(() => {
    endpoint = $defaultEndpoint;
  });

  // Computed state
  const isLoading = $derived(resultsState.loading);
  const hasQuery = $derived(queryState.text.trim().length > 0);
  const hasEndpoint = $derived(endpoint.trim().length > 0);
  const canExecute = $derived(hasQuery && hasEndpoint && !disabled);

  /**
   * Execute the query
   */
  async function handleRunQuery(): Promise<void> {
    if (!canExecute) return;

    try {
      await queryExecutionService.executeQuery({
        query: queryState.text,
        endpoint: endpoint,
      });
    } catch (error) {
      // Error is already handled by the service and set in resultsStore
      console.error('Query execution error:', error);
    }
  }

  /**
   * Cancel the running query
   */
  function handleCancelQuery(): void {
    queryExecutionService.cancelQuery();
  }
</script>

<ButtonSet class="run-button-container {className}" role="group" aria-label={$t('a11y.toolbar')}>
  <!-- Run button -->
  <Button
    kind="primary"
    size="field"
    icon={Play}
    on:click={handleRunQuery}
    disabled={!canExecute || isLoading}
    title={!hasQuery
      ? $t('toolbar.runTooltipNoQuery')
      : !hasEndpoint
        ? $t('toolbar.runTooltipNoEndpoint')
        : $t('toolbar.runTooltip')}
    aria-label={$t('a11y.runQuery')}
  >
    {$t('toolbar.run')}
  </Button>

  <!-- Cancel button -->
  <Button
    kind="danger"
    size="field"
    icon={StopOutline}
    on:click={handleCancelQuery}
    disabled={!isLoading}
    aria-label={$t('a11y.cancelQuery')}
  >
    {#if isLoading}
      <InlineLoading description={$t('toolbar.cancelling')} />
    {:else}
      {$t('toolbar.cancel')}
    {/if}
  </Button>
</ButtonSet>

<style>
  /* Ensure loading indicator is centered */
  :global(.run-button-container .bx--inline-loading) {
    min-height: unset;
  }

  /* Compact button sizing to prevent toolbar overflow */
  :global(.run-button-container .bx--btn) {
    min-width: 60px;
    padding-left: var(--cds-spacing-04, 0.75rem);
    padding-right: var(--cds-spacing-04, 0.75rem);
  }
</style>
