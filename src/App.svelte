<script lang="ts">
  import SparqlQueryUI from './SparqlQueryUI.svelte';
</script>

<main>
  <SparqlQueryUI
    endpoint={{ url: 'https://dbpedia.org/sparql', hideSelector: false }}
    theme={{ theme: 'g90' }}
    limits={{ maxRows: 10000 }}
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
