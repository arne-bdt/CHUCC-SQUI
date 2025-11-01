<script lang="ts">
  /**
   * KeyboardShortcuts Component
   * Displays available keyboard shortcuts in a modal/panel
   *
   * @component
   */

  import { Modal } from 'carbon-components-svelte';
  import { t } from '../../localization';

  interface Props {
    /** Whether the modal is open */
    open?: boolean;
    /** Callback when modal closes */
    onclose?: () => void;
    /** Additional CSS class */
    class?: string;
  }

  let { open = $bindable(false), onclose, class: className = '' }: Props = $props();

  // Detect OS for platform-specific shortcuts
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  // Keyboard shortcuts organized by category
  const shortcuts = [
    {
      category: 'Query Execution',
      items: [
        { keys: [`${modKey}+Enter`], description: $t('shortcuts.executeQuery') },
        { keys: ['Escape'], description: 'Cancel running query' },
      ],
    },
    {
      category: 'Editor',
      items: [
        { keys: [`${modKey}+Space`], description: 'Trigger autocomplete' },
        { keys: [`${modKey}+/`], description: 'Toggle line comment' },
        { keys: [`${modKey}+F`], description: 'Find' },
        { keys: [`${modKey}+H`], description: 'Find and replace' },
        { keys: [`${modKey}+Z`], description: 'Undo' },
        { keys: [`${modKey}+Shift+Z`], description: 'Redo' },
        { keys: ['Tab'], description: 'Indent selection' },
        { keys: ['Shift+Tab'], description: 'Dedent selection' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['Tab'], description: 'Move to next element' },
        { keys: ['Shift+Tab'], description: 'Move to previous element' },
        { keys: ['Escape'], description: 'Close dropdown/modal' },
        { keys: ['Enter'], description: 'Activate button/link' },
        { keys: ['Space'], description: 'Toggle checkbox/radio' },
        { keys: ['Arrow keys'], description: 'Navigate within components' },
      ],
    },
    {
      category: 'Results Table',
      items: [
        { keys: ['Arrow keys'], description: 'Navigate table cells' },
        { keys: ['Home'], description: 'Go to first cell in row' },
        { keys: ['End'], description: 'Go to last cell in row' },
        { keys: [`${modKey}+Home`], description: 'Go to first row' },
        { keys: [`${modKey}+End`], description: 'Go to last row' },
      ],
    },
  ];

  function handleClose(): void {
    open = false;
    if (onclose) {
      onclose();
    }
  }
</script>

<Modal
  bind:open
  modalHeading="Keyboard Shortcuts"
  passiveModal
  on:close={handleClose}
  class="keyboard-shortcuts-modal {className}"
  size="lg"
>
  <div class="shortcuts-container">
    {#each shortcuts as section}
      <div class="shortcut-section">
        <h3 class="section-title">{section.category}</h3>
        <div class="shortcuts-list">
          {#each section.items as shortcut}
            <div class="shortcut-item">
              <div class="shortcut-keys">
                {#each shortcut.keys as key}
                  <kbd class="key">{key}</kbd>
                {/each}
              </div>
              <div class="shortcut-description">{shortcut.description}</div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</Modal>

<style>
  .shortcuts-container {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-06, 1.5rem);
    padding: var(--cds-spacing-05, 1rem);
  }

  .shortcut-section {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-04, 0.75rem);
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--cds-text-primary, #161616);
    margin: 0;
    padding-bottom: var(--cds-spacing-03, 0.5rem);
    border-bottom: 1px solid var(--cds-border-subtle-01, #e0e0e0);
  }

  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: var(--cds-spacing-03, 0.5rem);
  }

  .shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--cds-spacing-03, 0.5rem);
    border-radius: 4px;
  }

  .shortcut-item:hover {
    background-color: var(--cds-layer-hover-01, #e5e5e5);
  }

  .shortcut-keys {
    display: flex;
    gap: var(--cds-spacing-02, 0.25rem);
    align-items: center;
    min-width: 150px;
  }

  .key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--cds-spacing-02, 0.25rem) var(--cds-spacing-03, 0.5rem);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    background-color: var(--cds-layer-02, #ffffff);
    border: 1px solid var(--cds-border-subtle-01, #e0e0e0);
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    color: var(--cds-text-primary, #161616);
    min-width: 24px;
    text-align: center;
  }

  .shortcut-description {
    flex: 1;
    font-size: 0.875rem;
    color: var(--cds-text-secondary, #525252);
    text-align: right;
  }

  /* Dark theme support */
  :global(.g90) .section-title,
  :global(.g100) .section-title {
    color: var(--cds-text-primary, #f4f4f4);
    border-bottom-color: var(--cds-border-subtle-01, #525252);
  }

  :global(.g90) .shortcut-item:hover,
  :global(.g100) .shortcut-item:hover {
    background-color: var(--cds-layer-hover-01, #353535);
  }

  :global(.g90) .key,
  :global(.g100) .key {
    background-color: var(--cds-layer-02, #393939);
    border-color: var(--cds-border-subtle-01, #525252);
    color: var(--cds-text-primary, #f4f4f4);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  :global(.g90) .shortcut-description,
  :global(.g100) .shortcut-description {
    color: var(--cds-text-secondary, #c6c6c6);
  }
</style>
