<script lang="ts">
  /**
   * Demo component for StoreProvider stories
   * Shows how to use StoreProvider with context stores
   */
  import StoreProvider from './StoreProvider.svelte';
  import StoreDisplay from './StoreProvider.demo.display.svelte';

  interface Props {
    initialQuery?: string;
    initialEndpoint?: string;
    showMultiple?: boolean;
  }

  let { initialQuery = '', initialEndpoint = '', showMultiple = false }: Props = $props();
</script>

<div style="padding: 16px; font-family: 'IBM Plex Sans', sans-serif;">
  {#if !showMultiple}
    <h3 style="margin-bottom: 16px;">StoreProvider Demo</h3>
    <StoreProvider {initialQuery} {initialEndpoint}>
      {#snippet children()}
        <div
          style="border: 1px solid #e0e0e0; padding: 16px; border-radius: 4px; background: #f4f4f4;"
        >
          <h4 style="margin-top: 0;">Store Values</h4>
          <StoreDisplay />
        </div>
      {/snippet}
    </StoreProvider>
  {:else}
    <h3 style="margin-bottom: 16px;">Multiple Isolated Instances</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <!-- Instance 1 -->
      <div>
        <h4 style="margin-bottom: 8px;">Instance 1</h4>
        <StoreProvider
          initialQuery="SELECT * WHERE {'{ ?s ?p ?o }'} LIMIT 10"
          initialEndpoint="https://dbpedia.org/sparql"
        >
          {#snippet children()}
            <div
              style="border: 1px solid #0f62fe; padding: 12px; border-radius: 4px; background: #e8f4ff;"
            >
              <StoreDisplay compact={true} />
            </div>
          {/snippet}
        </StoreProvider>
      </div>

      <!-- Instance 2 -->
      <div>
        <h4 style="margin-bottom: 8px;">Instance 2</h4>
        <StoreProvider
          initialQuery="PREFIX wd: <http://www.wikidata.org/entity/>\nSELECT * WHERE {'{ ?s ?p ?o }'}"
          initialEndpoint="https://query.wikidata.org/sparql"
        >
          {#snippet children()}
            <div
              style="border: 1px solid #198038; padding: 12px; border-radius: 4px; background: #e8f5e9;"
            >
              <StoreDisplay compact={true} />
            </div>
          {/snippet}
        </StoreProvider>
      </div>
    </div>

    <div
      style="margin-top: 16px; padding: 12px; background: #fff8e1; border: 1px solid #ffd600; border-radius: 4px;"
    >
      <strong>Notice:</strong> Each instance has completely independent state. Changing one does not
      affect the other.
    </div>
  {/if}
</div>
