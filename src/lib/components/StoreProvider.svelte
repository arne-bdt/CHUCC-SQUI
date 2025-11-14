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
  import { createServiceDescriptionStore } from '../stores/serviceDescriptionStore';
  import { createSettingsStore } from '../stores/settingsStore';
  import { createThemeStore } from '../stores/theme';
  import { writable } from 'svelte/store';
  import type { SparqlJsonResults, ServiceDescription } from '../types';

  /**
   * Component props
   */
  interface Props {
    /** Initial endpoint URL */
    initialEndpoint?: string;
    /** Initial query text */
    initialQuery?: string;
    /** Initial results loading state (for Storybook stories) */
    initialResultsLoading?: boolean;
    /** Initial results error (for Storybook stories) */
    initialResultsError?: string | { message: string; type?: string; details?: string };
    /** Initial results data (for Storybook stories) */
    initialResultsData?: SparqlJsonResults;
    /** Initial results execution time in ms (for Storybook stories) */
    initialResultsExecutionTime?: number;
    /** Initial service description (for Storybook stories) */
    initialServiceDescription?: ServiceDescription;
    /** Initial service description loading state (for Storybook stories) */
    initialServiceDescriptionLoading?: boolean;
    /** Initial service description error (for Storybook stories) */
    initialServiceDescriptionError?: string;
    /** Children components */
    children?: any;
  }

  let {
    initialEndpoint = '',
    initialQuery = '',
    initialResultsLoading,
    initialResultsError,
    initialResultsData,
    initialResultsExecutionTime,
    initialServiceDescription,
    initialServiceDescriptionLoading,
    initialServiceDescriptionError,
    children,
  }: Props = $props();

  // Create fresh store instances for this component tree
  const queryStore = createQueryStore();
  const resultsStore = createResultsStore();
  const uiStore = createUIStore();
  const serviceDescriptionStore = createServiceDescriptionStore();
  const settingsStore = createSettingsStore();
  const themeStore = createThemeStore();
  const endpointStore = writable(initialEndpoint);

  // Initialize with props if provided
  if (initialQuery) {
    queryStore.setText(initialQuery);
  }
  if (initialEndpoint) {
    endpointStore.set(initialEndpoint);
  }

  // Initialize resultsStore state (for Storybook stories)
  if (initialResultsLoading !== undefined) {
    resultsStore.setLoading(initialResultsLoading);
  }
  if (initialResultsError !== undefined) {
    resultsStore.setError(initialResultsError);
  }
  if (initialResultsData !== undefined) {
    resultsStore.setData(initialResultsData, initialResultsExecutionTime);
  }

  // Initialize serviceDescriptionStore (for Storybook stories)
  if (initialServiceDescription !== undefined && initialEndpoint) {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set(initialEndpoint, initialServiceDescription);
      return {
        ...state,
        descriptions,
        currentEndpoint: initialEndpoint,
        loading: false,
        error: null,
      };
    });
  } else if (initialServiceDescriptionLoading !== undefined && initialEndpoint) {
    serviceDescriptionStore.update((state) => ({
      ...state,
      currentEndpoint: initialEndpoint,
      loading: initialServiceDescriptionLoading,
      error: null,
    }));
  } else if (initialServiceDescriptionError !== undefined && initialEndpoint) {
    serviceDescriptionStore.update((state) => ({
      ...state,
      currentEndpoint: initialEndpoint,
      loading: false,
      error: initialServiceDescriptionError,
    }));
  }

  // Provide stores to child components via context
  setContext('queryStore', queryStore);
  setContext('resultsStore', resultsStore);
  setContext('uiStore', uiStore);
  setContext('serviceDescriptionStore', serviceDescriptionStore);
  setContext('settingsStore', settingsStore);
  setContext('themeStore', themeStore);
  setContext('endpointStore', endpointStore);
</script>

{@render children?.()}
