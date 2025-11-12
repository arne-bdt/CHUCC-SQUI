<script lang="ts">
  /**
   * SPARQL Query UI Component
   *
   * A modern, web-based SPARQL query interface built with Svelte 5 and Carbon Design System.
   * Provides a complete interface for composing, executing, and visualizing SPARQL queries.
   *
   * This is a wrapper component that provides isolated store context via StoreProvider,
   * making it a true drop-in component that can be used without manual store setup.
   *
   * @component
   * @example
   * ```svelte
   * <SparqlQueryUI
   *   endpoint={{ url: "https://dbpedia.org/sparql" }}
   *   theme={{ theme: "g90" }}
   *   limits={{ maxRows: 10000 }}
   * />
   * ```
   */

  import type { SquiConfig } from './lib/types';
  import StoreProvider from './lib/components/StoreProvider.svelte';
  import SparqlQueryUIInner from './SparqlQueryUI.inner.svelte';

  /**
   * Component props interface
   * All configuration options are optional with sensible defaults
   */
  interface Props extends SquiConfig {}

  // Accept all props and forward them to the inner component
  let props: Props = $props();

  // Extract initial values for StoreProvider
  const initialEndpoint = props.endpoint?.url || '';
  const initialQuery = ''; // Empty - tabs will load from storage if enabled
</script>

<!--
  Wrap the inner component in StoreProvider to provide isolated store context.
  Each instance of SparqlQueryUI gets its own independent store instances,
  ensuring proper isolation between multiple components on the same page.
-->
<StoreProvider {initialEndpoint} {initialQuery}>
  <SparqlQueryUIInner {...props} />
</StoreProvider>
