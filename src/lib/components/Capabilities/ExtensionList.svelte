<!--
  Extension List Component
  Displays extension functions or aggregates
-->
<script lang="ts">
  import type { ExtensionFunction } from '../../types/serviceDescription';
  import { Link } from 'carbon-components-svelte';

  interface Props {
    items: ExtensionFunction[];
    type?: 'function' | 'aggregate';
  }

  let { items, type = 'function' }: Props = $props();

  /**
   * Extract short name from URI
   * e.g., "http://example.org/fn#customFn" -> "customFn"
   */
  function getShortName(uri: string): string {
    const parts = uri.split(/[#/]/);
    return parts[parts.length - 1] || uri;
  }
</script>

<div class="extension-list">
  {#if items.length === 0}
    <p class="empty-state">
      No extension {type === 'function' ? 'functions' : 'aggregates'} reported
    </p>
  {:else}
    <ul>
      {#each items as item}
        <li>
          <div class="extension-item">
            <div class="extension-header">
              <code class="extension-name">
                {item.label || getShortName(item.uri)}
              </code>
            </div>

            {#if item.comment}
              <p class="extension-description">{item.comment}</p>
            {/if}

            <div class="extension-uri">
              <Link href={item.uri} target="_blank" size="sm">
                {item.uri}
              </Link>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .extension-list {
    font-size: 0.875rem;
  }

  .extension-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .extension-list li {
    margin-bottom: var(--cds-spacing-05);
  }

  .extension-list li:last-child {
    margin-bottom: 0;
  }

  .extension-item {
    padding: var(--cds-spacing-04);
    background: var(--cds-layer-01);
    border-left: 3px solid var(--cds-border-interactive);
    border-radius: 2px;
  }

  .extension-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--cds-spacing-02);
  }

  .extension-name {
    font-family: 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono',
      Courier, monospace;
    font-size: 0.875rem;
    color: var(--cds-text-primary);
    font-weight: 600;
  }

  .extension-description {
    color: var(--cds-text-secondary);
    font-size: 0.8125rem;
    margin: var(--cds-spacing-03) 0;
    line-height: 1.4;
  }

  .extension-uri {
    margin-top: var(--cds-spacing-03);
    font-size: 0.75rem;
  }

  .extension-uri :global(a) {
    word-break: break-all;
  }

  .empty-state {
    color: var(--cds-text-secondary);
    font-style: italic;
    font-size: 0.875rem;
    margin: 0;
  }
</style>
