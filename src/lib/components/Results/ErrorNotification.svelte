<script lang="ts">
  /**
   * Error Notification Component
   * Displays user-friendly error messages for SPARQL query failures
   * Uses Carbon Design System InlineNotification
   *
   * @component
   */

  import { InlineNotification } from 'carbon-components-svelte';
  import type { QueryError } from '../../types';

  interface Props {
    /** Error object with message and details */
    error: QueryError | string | null;
    /** Callback when notification is closed */
    onClose?: () => void;
  }

  let { error = null, onClose }: Props = $props();

  // Derived error properties
  const errorData = $derived.by(() => {
    if (!error) return null;

    if (typeof error === 'string') {
      return {
        title: 'Query Error',
        message: error,
        details: undefined,
        kind: 'error' as const,
      };
    }

    // Categorize error by type
    const message = error.message || 'An unknown error occurred';
    let title = 'Query Error';
    let kind: 'error' | 'warning' = 'error';

    // Network errors
    if (message.includes('Network error') || message.includes('Unable to reach endpoint')) {
      title = 'Network Error';
      kind = 'error';
    }
    // CORS errors
    else if (message.includes('CORS') || error.details?.includes('CORS')) {
      title = 'CORS Error';
      kind = 'error';
    }
    // Timeout errors
    else if (
      message.includes('timeout') ||
      message.includes('cancelled') ||
      error.status === 408
    ) {
      title = 'Request Timeout';
      kind = 'warning';
    }
    // HTTP errors
    else if (error.status) {
      if (error.status >= 400 && error.status < 500) {
        title = `Client Error (${error.status})`;
        kind = 'error';
      } else if (error.status >= 500) {
        title = `Server Error (${error.status})`;
        kind = 'error';
      }
    }
    // SPARQL syntax errors
    else if (
      message.includes('syntax') ||
      message.includes('parse') ||
      error.details?.toLowerCase().includes('syntax')
    ) {
      title = 'SPARQL Syntax Error';
      kind = 'error';
    }

    return {
      title,
      message,
      details: error.details,
      kind,
    };
  });

  // Handle close action
  function handleClose(): void {
    onClose?.();
  }
</script>

{#if errorData}
  <div class="error-notification-wrapper">
    <InlineNotification
      kind={errorData.kind}
      title={errorData.title}
      subtitle={errorData.message}
      hideCloseButton={false}
      on:close={handleClose}
      lowContrast
    />

    <!-- Show detailed error information if available -->
    {#if errorData.details}
      <details class="error-details">
        <summary>Error Details</summary>
        <pre class="error-details-content">{errorData.details}</pre>
      </details>
    {/if}
  </div>
{/if}

<style>
  .error-notification-wrapper {
    margin: var(--cds-spacing-05, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-03, 0.5rem);
  }

  .error-details {
    margin-top: var(--cds-spacing-03, 0.5rem);
    padding: var(--cds-spacing-03, 0.5rem);
    background-color: var(--cds-layer-01, #f4f4f4);
    border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    border-radius: 4px;
    cursor: pointer;
  }

  .error-details summary {
    font-size: var(--cds-body-compact-01);
    font-weight: 600;
    line-height: 1.43;
    color: var(--cds-text-secondary, #525252);
    user-select: none;
  }

  .error-details-content {
    margin-top: var(--cds-spacing-03, 0.5rem);
    padding: var(--cds-spacing-03, 0.5rem);
    background-color: var(--cds-layer-02, #ffffff);
    border: 1px solid var(--cds-border-subtle-00, #e0e0e0);
    border-radius: 4px;
    font-family: 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono',
      Courier, monospace;
    font-size: var(--cds-code-01);
    line-height: 1.34;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* Dark theme styles */
  :global(.g90) .error-details,
  :global(.g100) .error-details {
    background-color: var(--cds-layer-01, #262626);
    border-color: var(--cds-border-subtle-01, #393939);
  }

  :global(.g90) .error-details summary,
  :global(.g100) .error-details summary {
    color: var(--cds-text-secondary, #c6c6c6);
  }

  :global(.g90) .error-details-content,
  :global(.g100) .error-details-content {
    background-color: var(--cds-layer-02, #393939);
    border-color: var(--cds-border-subtle-00, #525252);
    color: var(--cds-text-primary, #f4f4f4);
  }
</style>
