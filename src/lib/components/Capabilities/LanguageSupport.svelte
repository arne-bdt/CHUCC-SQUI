<!--
  Language Support Component
  Displays supported SPARQL languages with visual indicators
-->
<script lang="ts">
  import { SPARQLLanguage } from '../../types/serviceDescription';
  import { CheckmarkFilled, CloseFilled } from 'carbon-icons-svelte';

  interface Props {
    languages: SPARQLLanguage[];
  }

  let { languages }: Props = $props();

  const allLanguages = [
    { id: SPARQLLanguage.SPARQL10Query, label: 'SPARQL 1.0 Query' },
    { id: SPARQLLanguage.SPARQL11Query, label: 'SPARQL 1.1 Query' },
    { id: SPARQLLanguage.SPARQL11Update, label: 'SPARQL 1.1 Update' },
  ];

  function isSupported(langId: SPARQLLanguage): boolean {
    return languages.includes(langId);
  }
</script>

<ul class="language-support">
  {#each allLanguages as lang}
    <li class:supported={isSupported(lang.id)}>
      {#if isSupported(lang.id)}
        <CheckmarkFilled size={16} />
      {:else}
        <CloseFilled size={16} />
      {/if}
      <span>{lang.label}</span>
    </li>
  {/each}
</ul>

<style>
  .language-support {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .language-support li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    color: var(--cds-text-secondary);
  }

  .language-support li.supported {
    color: var(--cds-text-primary);
  }

  .language-support li :global(svg) {
    flex-shrink: 0;
  }

  .language-support li.supported :global(svg) {
    fill: var(--cds-support-success);
  }

  .language-support li:not(.supported) :global(svg) {
    fill: var(--cds-text-disabled);
  }
</style>
