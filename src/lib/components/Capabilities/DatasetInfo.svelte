<!--
  Dataset Info Component
  Displays dataset information including named graphs and metadata
-->
<script lang="ts">
  import type { Dataset } from '../../types/serviceDescription';
  import { Link, Tag } from 'carbon-components-svelte';
  import { Cube } from 'carbon-icons-svelte';

  interface Props {
    datasets: Dataset[];
  }

  let { datasets }: Props = $props();

  /**
   * Count total named graphs across all datasets
   */
  const totalNamedGraphs = $derived(
    datasets.reduce((sum, dataset) => sum + dataset.namedGraphs.length, 0)
  );

  /**
   * Count total default graphs across all datasets
   */
  const totalDefaultGraphs = $derived(
    datasets.reduce((sum, dataset) => sum + dataset.defaultGraphs.length, 0)
  );

  /**
   * Extract all unique entailment regimes
   */
  const entailmentRegimes = $derived.by(() => {
    const regimes = new Set<string>();
    datasets.forEach((dataset) => {
      dataset.defaultGraphs.forEach((graph) => {
        if (graph.entailmentRegime) {
          regimes.add(graph.entailmentRegime);
        }
      });
      dataset.namedGraphs.forEach((graph) => {
        if (graph.entailmentRegime) {
          regimes.add(graph.entailmentRegime);
        }
      });
    });
    return Array.from(regimes);
  });

  /**
   * Get short label for entailment regime
   */
  function getEntailmentLabel(uri: string): string {
    const labels: Record<string, string> = {
      'http://www.w3.org/ns/entailment/RDF': 'RDF',
      'http://www.w3.org/ns/entailment/RDFS': 'RDFS',
      'http://www.w3.org/ns/entailment/OWL-RDF-Based': 'OWL RDF-Based',
      'http://www.w3.org/ns/entailment/OWL-Direct': 'OWL Direct',
      'http://www.w3.org/ns/entailment/D': 'D-Entailment',
    };
    return labels[uri] || uri.split(/[#/]/).pop() || uri;
  }
</script>

<div class="dataset-info">
  {#if datasets.length === 0}
    <p class="empty-state">No dataset information available</p>
  {:else}
    <!-- Summary Statistics -->
    <div class="dataset-summary">
      <div class="stat-item">
        <Cube size={20} />
        <div class="stat-content">
          <div class="stat-value">{totalNamedGraphs}</div>
          <div class="stat-label">Named Graphs</div>
        </div>
      </div>

      {#if totalDefaultGraphs > 0}
        <div class="stat-item">
          <Cube size={20} />
          <div class="stat-content">
            <div class="stat-value">{totalDefaultGraphs}</div>
            <div class="stat-label">Default Graphs</div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Entailment Regimes -->
    {#if entailmentRegimes.length > 0}
      <div class="entailment-section">
        <h5 class="section-title">Entailment Regimes</h5>
        <div class="entailment-list">
          {#each entailmentRegimes as regime}
            <Tag type="purple" size="sm">{getEntailmentLabel(regime)}</Tag>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Dataset Details -->
    {#if datasets.length > 0}
      <div class="dataset-details">
        <h5 class="section-title">Datasets</h5>
        {#each datasets as dataset, index}
          <div class="dataset-item">
            {#if dataset.uri}
              <div class="dataset-uri">
                <Link href={dataset.uri} target="_blank" size="sm">
                  Dataset {index + 1}
                </Link>
              </div>
            {:else}
              <div class="dataset-label">Dataset {index + 1}</div>
            {/if}

            <div class="graph-counts">
              {#if dataset.namedGraphs.length > 0}
                <span class="graph-count">
                  {dataset.namedGraphs.length} named graph{dataset.namedGraphs.length === 1
                    ? ''
                    : 's'}
                </span>
              {/if}
              {#if dataset.defaultGraphs.length > 0}
                <span class="graph-count">
                  {dataset.defaultGraphs.length} default graph{dataset.defaultGraphs.length === 1
                    ? ''
                    : 's'}
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .dataset-info {
    font-size: 0.875rem;
  }

  .empty-state {
    color: var(--cds-text-secondary);
    font-style: italic;
    font-size: 0.875rem;
    margin: 0;
  }

  .dataset-summary {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--cds-layer-01);
    border-radius: 4px;
    flex: 1;
    min-width: 120px;
  }

  .stat-item :global(svg) {
    fill: var(--cds-icon-secondary);
    flex-shrink: 0;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--cds-text-primary);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--cds-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--cds-text-primary);
    margin: 1rem 0 0.5rem 0;
  }

  .entailment-section {
    margin-bottom: 1rem;
  }

  .entailment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .dataset-details {
    margin-top: 1rem;
  }

  .dataset-item {
    padding: 0.75rem;
    background: var(--cds-layer-01);
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }

  .dataset-item:last-child {
    margin-bottom: 0;
  }

  .dataset-uri,
  .dataset-label {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .dataset-label {
    color: var(--cds-text-primary);
  }

  .graph-counts {
    display: flex;
    gap: 1rem;
    font-size: 0.8125rem;
    color: var(--cds-text-secondary);
  }

  .graph-count {
    display: flex;
    align-items: center;
  }
</style>
