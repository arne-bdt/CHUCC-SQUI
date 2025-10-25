<script lang="ts">
  import SparqlQueryUI from './SparqlQueryUI.svelte';
</script>

<main>
  <SparqlQueryUI 
    endpoint="https://dbpedia.org/sparql"
    theme="g90"
    showEndpointSelector={true}
  />
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
</style>
