<script lang="ts">
  import StoreProvider from '../../../src/lib/components/StoreProvider.svelte';
  import SparqlEditor from '../../../src/lib/components/Editor/SparqlEditor.svelte';

  interface Props {
    initialEndpoint?: string;
    initialQuery?: string;
    initialValue?: string;
    readonly?: boolean;
    placeholder?: string;
    class?: string;
  }

  let {
    initialEndpoint = '',
    initialQuery = '',
    initialValue = '',
    readonly = false,
    placeholder = '',
    class: className = '',
  }: Props = $props();
</script>

<StoreProvider {initialEndpoint} {initialQuery}>
  <SparqlEditor {initialValue} {readonly} {placeholder} class={className} />
</StoreProvider>
