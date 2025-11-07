<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { Download, TrashCan } from 'carbon-icons-svelte';
  import { performanceService } from '$lib/services/performanceService';
  import type { QueryPerformanceMetrics, PerformanceStats } from '$lib/services/performanceService';

  /**
   * Performance metrics panel for query profiling
   * Displays recent query metrics and aggregated statistics
   */

  // Reactive state
  let metrics = $state<QueryPerformanceMetrics[]>([]);
  let stats = $state<PerformanceStats | null>(null);

  // Update metrics periodically
  $effect(() => {
    const updateMetrics = () => {
      metrics = performanceService.getMetrics();
      stats = performanceService.getStats();
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  });

  /**
   * Export metrics as CSV
   */
  function exportMetrics() {
    const csv = performanceService.exportMetrics();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sparql-performance-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all metrics
   */
  function clearMetrics() {
    performanceService.clearMetrics();
    metrics = [];
    stats = null;
  }

  /**
   * Format time in milliseconds
   */
  function formatTime(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Format bytes
   */
  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  /**
   * Format memory in MB
   */
  function formatMemory(mb: number | undefined): string {
    if (mb === undefined) return '-';
    return `${mb.toFixed(1)}MB`;
  }
</script>

<div class="performance-panel">
  <header class="performance-panel__header">
    <h2>Query Performance</h2>
    <div class="performance-panel__actions">
      <Button
        kind="ghost"
        size="small"
        icon={Download}
        on:click={exportMetrics}
        disabled={metrics.length === 0}
      >
        Export CSV
      </Button>
      <Button
        kind="danger-ghost"
        size="small"
        icon={TrashCan}
        on:click={clearMetrics}
        disabled={metrics.length === 0}
      >
        Clear
      </Button>
    </div>
  </header>

  {#if stats}
    <section class="performance-panel__stats">
      <h3>Aggregated Statistics ({stats.count} queries)</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Time</div>
          <div class="stat-value">{formatTime(stats.totalTime.median)}</div>
          <div class="stat-detail">
            avg: {formatTime(stats.totalTime.avg)} | p95: {formatTime(stats.totalTime.p95)}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Parse Time</div>
          <div class="stat-value">{formatTime(stats.parseTime.median)}</div>
          <div class="stat-detail">
            avg: {formatTime(stats.parseTime.avg)} | p95: {formatTime(stats.parseTime.p95)}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Network Time</div>
          <div class="stat-value">{formatTime(stats.networkTime.median)}</div>
          <div class="stat-detail">avg: {formatTime(stats.networkTime.avg)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Row Count</div>
          <div class="stat-value">{stats.rowCount.median.toFixed(0)}</div>
          <div class="stat-detail">avg: {stats.rowCount.avg.toFixed(0)}</div>
        </div>
        {#if stats.memoryUsageMB}
          <div class="stat-card">
            <div class="stat-label">Memory Usage</div>
            <div class="stat-value">{formatMemory(stats.memoryUsageMB.median)}</div>
            <div class="stat-detail">avg: {formatMemory(stats.memoryUsageMB.avg)}</div>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  <section class="performance-panel__metrics">
    <h3>Recent Queries</h3>
    {#if metrics.length === 0}
      <p class="empty-state">No queries executed yet. Run a query to see performance metrics.</p>
    {:else}
      <div class="metrics-table-container">
        <table class="metrics-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Endpoint</th>
              <th>Type</th>
              <th>Total</th>
              <th>Network</th>
              <th>Download</th>
              <th>Parse</th>
              <th>Render</th>
              <th>Size</th>
              <th>Rows</th>
              <th>Cols</th>
              <th>Memory</th>
            </tr>
          </thead>
          <tbody>
            {#each metrics.slice().reverse() as metric}
              <tr>
                <td>{metric.timestamp.toLocaleTimeString()}</td>
                <td class="endpoint-cell" title={metric.endpoint}>
                  {new URL(metric.endpoint).hostname}
                </td>
                <td>{metric.queryType}</td>
                <td class="time-cell">{formatTime(metric.totalTime)}</td>
                <td class="time-cell">{formatTime(metric.networkTime)}</td>
                <td class="time-cell">{formatTime(metric.downloadTime)}</td>
                <td class="time-cell">{formatTime(metric.parseTime)}</td>
                <td class="time-cell">{formatTime(metric.renderTime)}</td>
                <td class="size-cell">{formatBytes(metric.responseBytes)}</td>
                <td class="number-cell">{metric.rowCount}</td>
                <td class="number-cell">{metric.columnCount}</td>
                <td class="memory-cell">{formatMemory(metric.peakMemoryMB)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>

<style>
  .performance-panel {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-06);
    padding: var(--cds-spacing-05);
    background: var(--cds-background);
    color: var(--cds-text-primary);
    height: 100%;
    overflow: auto;
  }

  .performance-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--cds-border-subtle);
    padding-bottom: var(--cds-spacing-04);
  }

  .performance-panel__header h2 {
    font-size: var(--cds-productive-heading-02);
    font-weight: 600;
    line-height: 1.5;
    margin: 0;
  }

  .performance-panel__actions {
    display: flex;
    gap: var(--cds-spacing-03);
  }

  .performance-panel__stats h3,
  .performance-panel__metrics h3 {
    font-size: var(--cds-productive-heading-01);
    font-weight: 600;
    line-height: 1.43;
    margin: 0 0 var(--cds-spacing-05) 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--cds-spacing-05);
  }

  .stat-card {
    padding: var(--cds-spacing-05);
    background: var(--cds-layer-01);
    border: 1px solid var(--cds-border-subtle);
    border-radius: 4px;
  }

  .stat-label {
    font-size: var(--cds-label-01);
    line-height: 1.34;
    color: var(--cds-text-secondary);
    text-transform: uppercase;
    margin-bottom: var(--cds-spacing-02);
  }

  .stat-value {
    font-size: var(--cds-productive-heading-04);
    font-weight: 600;
    line-height: 1.29;
    color: var(--cds-text-primary);
    margin-bottom: var(--cds-spacing-02);
  }

  .stat-detail {
    font-size: var(--cds-label-01);
    line-height: 1.34;
    color: var(--cds-text-secondary);
  }

  .empty-state {
    padding: var(--cds-spacing-07);
    text-align: center;
    color: var(--cds-text-secondary);
    font-style: italic;
  }

  .metrics-table-container {
    overflow-x: auto;
    border: 1px solid var(--cds-border-subtle);
    border-radius: 4px;
  }

  .metrics-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--cds-body-compact-01);
    line-height: 1.43;
  }

  .metrics-table th {
    background: var(--cds-layer-01);
    padding: var(--cds-spacing-03);
    text-align: left;
    font-weight: 600;
    border-bottom: 1px solid var(--cds-border-subtle);
    white-space: nowrap;
  }

  .metrics-table td {
    padding: var(--cds-spacing-03);
    border-bottom: 1px solid var(--cds-border-subtle-01);
  }

  .metrics-table tbody tr:hover {
    background: var(--cds-layer-hover);
  }

  .endpoint-cell {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .time-cell,
  .size-cell,
  .number-cell,
  .memory-cell {
    font-family: 'IBM Plex Mono', monospace;
    text-align: right;
  }
</style>
