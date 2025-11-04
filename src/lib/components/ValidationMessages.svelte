<!--
  ValidationMessages Component
  Displays query validation issues and suggestions
  Shows warnings and info messages from capability linter
-->
<script lang="ts">
  import { InlineNotification } from 'carbon-components-svelte';
  import type { ValidationIssue } from '$lib/editor/utils/queryValidation';

  interface Props {
    /** Array of validation issues to display */
    diagnostics?: ValidationIssue[];
    /** Show close button */
    hideCloseButton?: boolean;
  }

  let { diagnostics = [], hideCloseButton = false }: Props = $props();

  // Filter diagnostics by severity
  const warnings = $derived(diagnostics.filter((d) => d.severity === 'warning'));
  const infos = $derived(diagnostics.filter((d) => d.severity === 'info'));
  const errors = $derived(diagnostics.filter((d) => d.severity === 'error'));

  /**
   * Handle action click
   */
  function handleAction(issue: ValidationIssue) {
    if (issue.actionUrl) {
      window.open(issue.actionUrl, '_blank');
    }
  }
</script>

{#if errors.length > 0}
  <InlineNotification
    kind="error"
    title="Query Errors"
    subtitle={`${errors.length} error(s) detected`}
    {hideCloseButton}
  >
    <ul class="validation-list">
      {#each errors as error}
        <li>
          {error.message}
          {#if error.actionLabel}
            <button
              class="action-link"
              onclick={() => handleAction(error)}
              aria-label={error.actionLabel}
            >
              {error.actionLabel}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  </InlineNotification>
{/if}

{#if warnings.length > 0}
  <InlineNotification
    kind="warning"
    title="Query Compatibility Issues"
    subtitle={`${warnings.length} potential issue(s) detected`}
    {hideCloseButton}
  >
    <ul class="validation-list">
      {#each warnings as warning}
        <li>
          {warning.message}
          {#if warning.actionLabel}
            <button
              class="action-link"
              onclick={() => handleAction(warning)}
              aria-label={warning.actionLabel}
            >
              {warning.actionLabel}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  </InlineNotification>
{/if}

{#if infos.length > 0}
  <InlineNotification
    kind="info"
    title="Query Suggestions"
    subtitle={`${infos.length} suggestion(s)`}
    {hideCloseButton}
  >
    <ul class="validation-list">
      {#each infos as info}
        <li>
          {info.message}
          {#if info.actionLabel}
            <button
              class="action-link"
              onclick={() => handleAction(info)}
              aria-label={info.actionLabel}
            >
              {info.actionLabel}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  </InlineNotification>
{/if}

<style>
  .validation-list {
    margin: 0;
    padding-left: 1.25rem;
    list-style-type: disc;
  }

  .validation-list li {
    margin-bottom: 0.25rem;
  }

  .validation-list li:last-child {
    margin-bottom: 0;
  }

  .action-link {
    background: none;
    border: none;
    color: var(--cds-link-primary, #0f62fe);
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    margin-left: 0.5rem;
    font-size: inherit;
    font-family: inherit;
  }

  .action-link:hover {
    color: var(--cds-link-primary-hover, #0043ce);
  }

  .action-link:focus {
    outline: 2px solid var(--cds-focus, #0f62fe);
    outline-offset: 2px;
  }
</style>
