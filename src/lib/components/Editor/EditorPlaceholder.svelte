<script lang="ts">
  /**
   * EditorPlaceholder component - Temporary placeholder for the SPARQL editor
   * Will be replaced by CodeMirror editor in Task 06
   */

  interface Props {
    /** CSS class for the placeholder */
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div class="editor-placeholder {className}">
  <div class="placeholder-content">
    <h3>SPARQL Query Editor</h3>
    <p>CodeMirror editor will be integrated in Task 06</p>
    <p class="hint">
      This area will contain the query editor with syntax highlighting and autocompletion
    </p>
  </div>
</div>

<style>
  .editor-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--cds-field-01, #ffffff);
    border: 1px dashed var(--cds-border-subtle-01, #e0e0e0);
    padding: var(--cds-spacing-05, 1rem);
  }

  .placeholder-content {
    text-align: center;
    color: var(--cds-text-secondary, #525252);
  }

  .placeholder-content h3 {
    margin: 0 0 var(--cds-spacing-03, 0.5rem) 0;
    color: var(--cds-text-primary, #161616);
    font-size: var(--cds-productive-heading-02);
    font-weight: 400;
    line-height: 1.5;
  }

  .placeholder-content p {
    margin: var(--cds-spacing-02, 0.25rem) 0;
    font-size: var(--cds-body-compact-01);
    line-height: 1.43;
  }

  .placeholder-content .hint {
    font-style: italic;
    color: var(--cds-text-helper, #6f6f6f);
  }

  /* Dark theme support */
  :global(.g90) .editor-placeholder,
  :global(.g100) .editor-placeholder {
    background-color: var(--cds-field-01, #262626);
    border-color: var(--cds-border-subtle-01, #393939);
  }
</style>
