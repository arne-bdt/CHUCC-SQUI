<script lang="ts">
  /**
   * STREAMING-02: ProgressIndicator component
   * Shows detailed progress during query execution, download, and parsing phases
   * Provides real-time feedback to improve perceived performance
   */

  import { InlineLoading, ProgressBar } from 'carbon-components-svelte';
  import type { ProgressState } from '../../types';

  interface Props {
    /** Current progress state */
    progress: ProgressState;
  }

  let { progress }: Props = $props();

  // Calculate elapsed time since phase started
  const elapsed = $derived.by(() => {
    const now = Date.now();
    const elapsedMs = now - progress.startTime;
    return (elapsedMs / 1000).toFixed(1);
  });

  // Format bytes to human-readable format
  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  // Format speed (bytes/sec) to human-readable format
  function formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
    return `${(bytesPerSec / 1024 / 1024).toFixed(1)} MB/s`;
  }

  // Generate progress message based on phase
  const message = $derived.by(() => {
    switch (progress.phase) {
      case 'executing':
        return `Executing query... ${elapsed}s`;

      case 'downloading': {
        if (progress.totalBytes && progress.bytesReceived !== undefined) {
          const percent = ((progress.bytesReceived / progress.totalBytes) * 100).toFixed(0);
          const received = formatBytes(progress.bytesReceived);
          const total = formatBytes(progress.totalBytes);
          return `Receiving response... ${received} / ${total} (${percent}%)`;
        } else if (progress.bytesReceived !== undefined) {
          const received = formatBytes(progress.bytesReceived);
          return `Receiving response... ${received} received`;
        }
        return 'Receiving response...';
      }

      case 'parsing': {
        if (progress.totalRows && progress.rowsParsed !== undefined) {
          const percent = ((progress.rowsParsed / progress.totalRows) * 100).toFixed(0);
          return `Parsing ${progress.totalRows.toLocaleString('en-US')} results... ${percent}%`;
        }
        return `Parsing results... ${elapsed}s`;
      }

      case 'rendering':
        return 'Rendering results...';

      default:
        return 'Processing...';
    }
  });

  // Show warning if query is taking too long
  const showSlowWarning = $derived(
    progress.phase === 'executing' && parseFloat(elapsed) > 10
  );

  // Calculate download progress percentage (0-100)
  const downloadProgress = $derived.by(() => {
    if (
      progress.phase === 'downloading' &&
      progress.totalBytes &&
      progress.bytesReceived !== undefined
    ) {
      return (progress.bytesReceived / progress.totalBytes) * 100;
    }
    return undefined;
  });
</script>

<div class="progress-indicator" role="status" aria-live="polite" aria-atomic="true">
  <div class="progress-content">
    <InlineLoading description={message} status="active" />

    {#if progress.phase === 'downloading' && downloadProgress !== undefined}
      <div class="progress-bar-container">
        <ProgressBar
          value={downloadProgress}
          helperText={progress.downloadSpeed ? formatSpeed(progress.downloadSpeed) : undefined}
        />
      </div>
    {/if}

    {#if showSlowWarning}
      <div class="warning" role="alert">
        ⚠️ Query is taking longer than usual. This may indicate a complex query or slow endpoint.
      </div>
    {/if}

    {#if progress.phase === 'downloading' && progress.downloadSpeed && downloadProgress === undefined}
      <div class="stats">
        📊 Download speed: {formatSpeed(progress.downloadSpeed)}
      </div>
    {/if}

    {#if progress.memoryUsageMB}
      <div class="stats">
        💾 Memory usage: {progress.memoryUsageMB.toFixed(1)} MB
      </div>
    {/if}
  </div>
</div>

<style>
  .progress-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--cds-spacing-07, 2rem);
    min-height: 200px;
  }

  .progress-content {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-05, 1rem);
    width: 100%;
    max-width: 600px;
  }

  .progress-bar-container {
    width: 100%;
  }

  .warning {
    color: var(--cds-support-warning, #f1c21b);
    background-color: var(--cds-notification-background-warning, rgba(241, 194, 27, 0.1));
    border: 1px solid var(--cds-support-warning, #f1c21b);
    border-radius: 4px;
    padding: var(--cds-spacing-05, 1rem);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .stats {
    color: var(--cds-text-secondary, #525252);
    font-size: 0.875rem;
    font-style: italic;
  }

  /* Dark theme support */
  :global(.g90) .warning,
  :global(.g100) .warning {
    color: var(--cds-support-warning, #f1c21b);
    background-color: rgba(241, 194, 27, 0.15);
  }

  :global(.g90) .stats,
  :global(.g100) .stats {
    color: var(--cds-text-secondary, #c6c6c6);
  }
</style>
