<script lang="ts">
  /**
   * Run Query Button Component
   * Executes SPARQL queries with loading state and cancellation support
   */

  import { Button, InlineLoading } from 'carbon-components-svelte';
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

{#if isLoading}
  <!-- Cancel button with loading indicator -->
  <Button
    kind="danger"
    size="field"
    icon={StopOutline}
    on:click={handleCancelQuery}
    class={className}
  >
    <InlineLoading description={$t('toolbar.cancelling')} />
  </Button>
{:else}
  <!-- Run button -->
  <Button
    kind="primary"
    size="field"
    icon={Play}
    on:click={handleRunQuery}
    disabled={!canExecute}
    class={className}
    title={!hasQuery
      ? $t('toolbar.runTooltipNoQuery')
      : !hasEndpoint
        ? $t('toolbar.runTooltipNoEndpoint')
        : $t('toolbar.runTooltip')}
  >
    {$t('toolbar.run')}
  </Button>
{/if}

<style>
  /* Component-specific styles if needed */
  :global(.run-button-loading) {
    display: inline-flex;
    align-items: center;
    gap: var(--cds-spacing-03, 0.5rem);
  }
</style>
