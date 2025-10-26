<script lang="ts">
  /**
   * Toolbar component - Top toolbar for SQUI component
   * Contains endpoint selector, query execution controls, and other actions
   */

  import type { Snippet } from 'svelte';

  interface Props {
    /** CSS class for the toolbar */
    class?: string;
    /** Toolbar content */
    children?: Snippet;
  }

  let { class: className = '', children }: Props = $props();
</script>

<div class="squi-toolbar {className}" role="toolbar" aria-label="SPARQL Query Controls">
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .squi-toolbar {
    display: flex;
    align-items: center;
    gap: var(--cds-spacing-05, 1rem);
    padding: var(--cds-spacing-05, 1rem);
    background-color: var(--cds-layer-01, #f4f4f4);
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    min-height: 3rem;
    flex-shrink: 0;
  }

  /* Support for Carbon theme variables */
  :global(.g10) .squi-toolbar {
    background-color: var(--cds-layer-01, #f4f4f4);
  }

  :global(.g90) .squi-toolbar,
  :global(.g100) .squi-toolbar {
    background-color: var(--cds-layer-01, #262626);
    border-bottom-color: var(--cds-border-subtle-01, #393939);
  }
</style>
