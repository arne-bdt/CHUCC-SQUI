<script lang="ts">
  import { CodeSnippet, Tag } from 'carbon-components-svelte';
  import type { ExtensionFunction } from '$lib/types';

  interface Props {
    func: ExtensionFunction;
  }

  let { func }: Props = $props();
</script>

<div class="function-details">
  <section>
    <h4>URI</h4>
    <CodeSnippet type="single" code={func.uri} />
  </section>

  {#if func.comment}
    <section>
      <h4>Description</h4>
      <p>{func.comment}</p>
    </section>
  {/if}

  {#if func.parameters && func.parameters.length > 0}
    <section>
      <h4>Parameters</h4>
      <ul class="parameter-list">
        {#each func.parameters as param}
          <li>
            <code>{param.name}</code>
            {#if param.type}
              <Tag size="sm">{param.type}</Tag>
            {/if}
            {#if param.optional}
              <Tag size="sm" type="blue">optional</Tag>
            {/if}
            {#if param.description}
              <p class="param-description">{param.description}</p>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if func.returnType}
    <section>
      <h4>Returns</h4>
      <Tag>{func.returnType}</Tag>
    </section>
  {/if}

  {#if func.examples && func.examples.length > 0}
    <section>
      <h4>Examples</h4>
      {#each func.examples as example}
        <div class="example">
          <CodeSnippet type="multi" code={example} />
        </div>
      {/each}
    </section>
  {/if}

  {#if func.documentationUrl}
    <section>
      <h4>Documentation</h4>
      <a
        href={func.documentationUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="docs-link"
      >
        View official documentation →
      </a>
    </section>
  {/if}
</div>

<style>
  .function-details {
    font-family: var(--cds-body-font-family, 'IBM Plex Sans', sans-serif);
    font-size: var(--cds-body-01);
    line-height: 1.43;
  }

  .function-details section {
    margin-bottom: var(--cds-spacing-06);
  }

  .function-details section:last-child {
    margin-bottom: 0;
  }

  .function-details h4 {
    margin-bottom: var(--cds-spacing-03);
    margin-top: 0;
    font-weight: 600;
    font-size: var(--cds-productive-heading-01);
    line-height: 1.43;
    color: var(--cds-text-primary, #161616);
  }

  .function-details p {
    margin: 0;
    line-height: 1.5;
    color: var(--cds-text-primary, #161616);
  }

  .parameter-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .parameter-list li {
    margin-bottom: var(--cds-spacing-04);
    padding: var(--cds-spacing-04);
    background: var(--cds-layer-01, #f4f4f4);
    border-radius: 4px;
  }

  .parameter-list li:last-child {
    margin-bottom: 0;
  }

  .parameter-list li code {
    font-weight: 600;
    margin-right: var(--cds-spacing-03);
    font-family: var(--cds-code-font-family, 'IBM Plex Mono', monospace);
    font-size: var(--cds-code-02);
    line-height: 1.43;
  }

  .param-description {
    margin-top: var(--cds-spacing-03) !important;
    color: var(--cds-text-secondary, #525252);
    font-size: var(--cds-label-01);
    line-height: 1.34;
  }

  .example {
    margin-bottom: var(--cds-spacing-05);
  }

  .example:last-child {
    margin-bottom: 0;
  }

  .docs-link {
    color: var(--cds-link-primary, #0f62fe);
    text-decoration: none;
  }

  .docs-link:hover {
    text-decoration: underline;
  }

  /* Ensure Tag components have proper spacing */
  .parameter-list li :global(.bx--tag) {
    margin-right: var(--cds-spacing-02);
    vertical-align: middle;
  }

  /* CodeSnippet styling adjustments */
  .function-details :global(.bx--snippet) {
    max-width: 100%;
  }

  .function-details :global(.bx--snippet code) {
    font-size: var(--cds-code-01);
    line-height: 1.34;
  }
</style>
