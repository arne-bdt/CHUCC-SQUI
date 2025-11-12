<script lang="ts">
  /**
   * Store Provider Component
   *
   * Creates fresh instances of all application stores and provides them
   * via Svelte context to child components.
   *
   * This ensures state isolation between:
   * - Storybook stories
   * - Multiple tabs
   * - Multiple component instances
   *
   * @component
   */

  import { setContext } from 'svelte';
  import { createQueryStore } from '../stores/queryStore';
  import { createResultsStore } from '../stores/resultsStore';
  import { createUIStore } from '../stores/uiStore';
  import { writable } from 'svelte/store';

  /**
   * Component props
   */
  interface Props {
    /** Initial endpoint URL */
    initialEndpoint?: string;
    /** Initial query text */
    initialQuery?: string;
    /** Children components */
    children?: any;
  }

  let { initialEndpoint = '', initialQuery = '', children }: Props = $props();

  // Create fresh store instances for this component tree
  const queryStore = createQueryStore();
  const resultsStore = createResultsStore();
  const uiStore = createUIStore();
  const endpointStore = writable(initialEndpoint);

  // Initialize with props if provided
  if (initialQuery) {
    queryStore.setText(initialQuery);
  }
  if (initialEndpoint) {
    endpointStore.set(initialEndpoint);
  }

  // Provide stores to child components via context
  setContext('queryStore', queryStore);
  setContext('resultsStore', resultsStore);
  setContext('uiStore', uiStore);
  setContext('endpointStore', endpointStore);
</script>

{@render children?.()}
