<!--
  Feature List Component
  Displays service features supported by the endpoint
-->
<script lang="ts">
  import { ServiceFeature } from '../../types/serviceDescription';
  import { Tag } from 'carbon-components-svelte';

  interface Props {
    features: string[];
  }

  let { features }: Props = $props();

  const featureLabels: Record<string, string> = {
    DereferencesURIs: 'URI Dereferencing',
    UnionDefaultGraph: 'Union Default Graph',
    RequiresDataset: 'Requires Dataset',
    EmptyGraphs: 'Empty Graphs',
    BasicFederatedQuery: 'Federated Query (SERVICE)',
  };

  function getFeatureLabel(feature: string): string {
    const key = feature.split('#').pop() || '';
    return featureLabels[key] || key;
  }
</script>

<div class="feature-list">
  {#if features.length === 0}
    <p class="empty-state">No special features reported</p>
  {:else}
    {#each features as feature}
      <Tag type="blue" size="sm">{getFeatureLabel(feature)}</Tag>
    {/each}
  {/if}
</div>

<style>
  .feature-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .empty-state {
    color: var(--cds-text-secondary);
    font-style: italic;
    font-size: 0.875rem;
    margin: 0;
  }
</style>
