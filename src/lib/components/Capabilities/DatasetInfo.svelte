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
   * VoID (Vocabulary of Interlinked Datasets) namespace
   * @see http://rdfs.org/ns/void#
   */
  const VOID_TRIPLES_URI = 'http://rdfs.org/ns/void#triples';
  const VOID_TRIPLES_SHORT = 'void:triples';

  /**
   * Extract triple count from graph metadata using VoID vocabulary
   * @see https://www.w3.org/TR/sparql11-service-description/#dataset-descriptions
   */
  function getTripleCount(graph: {
    metadata?: Record<string, unknown>;
  }): number | undefined {
    if (!graph.metadata) return undefined;

    // Try full URI first
    const fullUri = graph.metadata[VOID_TRIPLES_URI];
    if (typeof fullUri === 'number') return fullUri;

    // Try short form
    const shortForm = graph.metadata[VOID_TRIPLES_SHORT];
    if (typeof shortForm === 'number') return shortForm;

    return undefined;
  }

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

            <!-- Named Graphs List -->
            {#if dataset.namedGraphs.length > 0}
              <div class="graph-list">
                <h6 class="graph-list-title">Named Graphs</h6>
                <div class="graph-items">
                  {#each dataset.namedGraphs as graph}
                    {@const tripleCount = getTripleCount(graph)}
                    <div class="graph-entry">
                      <div class="graph-name">{graph.name}</div>
                      {#if tripleCount !== undefined}
                        <div class="graph-triple-count">
                          {tripleCount.toLocaleString()} triple{tripleCount === 1 ? '' : 's'}
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Default Graphs List -->
            {#if dataset.defaultGraphs.length > 0}
              <div class="graph-list">
                <h6 class="graph-list-title">Default Graphs</h6>
                <div class="graph-items">
                  {#each dataset.defaultGraphs as graph}
                    {@const tripleCount = getTripleCount(graph)}
                    <div class="graph-entry">
                      <div class="graph-name">{graph.uri || '(unnamed)'}</div>
                      {#if tripleCount !== undefined}
                        <div class="graph-triple-count">
                          {tripleCount.toLocaleString()} triple{tripleCount === 1 ? '' : 's'}
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .dataset-info {
    font-size: var(--cds-body-compact-01);
    line-height: 1.43;
  }

  .empty-state {
    color: var(--cds-text-secondary);
    font-style: italic;
    font-size: var(--cds-body-compact-01);
    line-height: 1.43;
    margin: 0;
  }

  .dataset-summary {
    display: flex;
    gap: var(--cds-spacing-05);
    flex-wrap: wrap;
    margin-bottom: var(--cds-spacing-05);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-04);
    padding: var(--cds-spacing-04);
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
    font-size: var(--cds-productive-heading-04);
    font-weight: 600;
    color: var(--cds-text-primary);
    line-height: 1.29;
  }

  .stat-label {
    font-size: var(--cds-label-01);
    line-height: 1.34;
    color: var(--cds-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-title {
    font-size: var(--cds-body-compact-01);
    font-weight: 600;
    line-height: 1.43;
    color: var(--cds-text-primary);
    margin: var(--cds-spacing-05) 0 var(--cds-spacing-03) 0;
  }

  .entailment-section {
    margin-bottom: var(--cds-spacing-05);
  }

  .entailment-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cds-spacing-03);
  }

  .dataset-details {
    margin-top: var(--cds-spacing-05);
  }

  .dataset-item {
    padding: var(--cds-spacing-04);
    background: var(--cds-layer-01);
    border-radius: 4px;
    margin-bottom: var(--cds-spacing-03);
  }

  .dataset-item:last-child {
    margin-bottom: 0;
  }

  .dataset-uri,
  .dataset-label {
    font-weight: 500;
    margin-bottom: var(--cds-spacing-02);
  }

  .dataset-label {
    color: var(--cds-text-primary);
  }

  .graph-counts {
    display: flex;
    gap: var(--cds-spacing-05);
    font-size: var(--cds-label-02);
    line-height: 1.38;
    color: var(--cds-text-secondary);
  }

  .graph-count {
    display: flex;
    align-items: center;
  }

  .graph-list {
    margin-top: var(--cds-spacing-05);
    padding-top: var(--cds-spacing-04);
    border-top: 1px solid var(--cds-border-subtle-01);
  }

  .graph-list-title {
    font-size: var(--cds-label-02);
    font-weight: 600;
    line-height: 1.38;
    color: var(--cds-text-secondary);
    margin: 0 0 var(--cds-spacing-03) 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .graph-items {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-03);
  }

  .graph-entry {
    padding: var(--cds-spacing-03);
    background: var(--cds-layer-02);
    border-radius: 4px;
    border-left: 3px solid var(--cds-border-interactive);
  }

  .graph-name {
    font-size: var(--cds-code-01);
    line-height: 1.34;
    color: var(--cds-text-primary);
    word-break: break-all;
    font-family: 'IBM Plex Mono', monospace;
    margin-bottom: var(--cds-spacing-02);
  }

  .graph-triple-count {
    font-size: var(--cds-label-01);
    line-height: 1.34;
    color: var(--cds-text-secondary);
    font-weight: 500;
  }
</style>
