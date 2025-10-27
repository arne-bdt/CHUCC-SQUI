<script lang="ts">
  /**
   * DownloadButton Component - Task 38
   * Button with dropdown for downloading query results in various formats
   *
   * @component
   */

  import { Button } from 'carbon-components-svelte';
  import { Download } from 'carbon-icons-svelte';
  import type { ResultFormat } from '../../types';

  interface Props {
    /** Current result format */
    currentFormat: ResultFormat;
    /** Callback when download is triggered */
    ondownload: (format: ResultFormat) => void;
    /** Disabled state */
    disabled?: boolean;
    /** CSS class */
    class?: string;
  }

  let {
    currentFormat,
    ondownload,
    disabled = false,
    class: className = '',
  }: Props = $props();

  // Handle download click
  function handleDownload(): void {
    if (ondownload) {
      ondownload(currentFormat);
    }
  }
</script>

<div class="download-button {className}">
  <Button
    kind="ghost"
    size="sm"
    icon={Download}
    iconDescription="Download results"
    tooltipPosition="bottom"
    on:click={handleDownload}
    disabled={disabled}
  >
    Download
  </Button>
</div>

<style>
  .download-button {
    display: inline-flex;
  }
</style>
