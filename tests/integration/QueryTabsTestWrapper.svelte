<script lang="ts">
  /**
   * Test wrapper for QueryTabs that provides the tabStore context
   * This allows us to test QueryTabs in isolation while providing the required context
   */
  import { setContext } from 'svelte';
  import QueryTabs from '../../src/lib/components/Tabs/QueryTabs.svelte';
  import type { createTabStore } from '../../src/lib/stores/tabStore';

  interface Props {
    tabStore: ReturnType<typeof createTabStore>;
  }

  let { tabStore }: Props = $props();

  // Provide the tab store to QueryTabs
  setContext('tabStore', tabStore);
</script>

<QueryTabs />
