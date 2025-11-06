<script lang="ts">
  /**
   * Standalone Wrapper Component for SQUI Library
   *
   * This wrapper component enables proper standalone HTML usage by providing
   * a Svelte component that can be compiled for library mode and mounted
   * using Svelte's mount() function.
   */
  import SparqlQueryUI from './SparqlQueryUI.svelte';
  import type { SquiConfig } from './lib/types';

  // Accept all props and forward them to the main component
  let props: SquiConfig = $props();
</script>

<SparqlQueryUI {...props} />
