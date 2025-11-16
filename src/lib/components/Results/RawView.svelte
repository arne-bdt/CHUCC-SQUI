<script lang="ts">
  /**
   * RawView Component - Task 35
   * Displays raw query response with syntax highlighting
   * Supports JSON, XML, CSV, TSV, and other text formats
   *
   * @component
   */

  import { onMount } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { EditorState } from '@codemirror/state';
  import { json } from '@codemirror/lang-json';
  import { xml } from '@codemirror/lang-xml';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { logger } from '../../utils/logger';

  interface Props {
    /** Raw response data to display */
    data: string;
    /** Content type for syntax highlighting */
    contentType?: string;
    /** Current theme (for matching CodeMirror theme) */
    theme?: 'white' | 'g10' | 'g90' | 'g100';
    /** CSS class for the container */
    class?: string;
  }

  let {
    data,
    contentType = 'text/plain',
    theme = 'white',
    class: className = '',
  }: Props = $props();

  let editorContainer = $state<HTMLDivElement | undefined>();
  let editorView: EditorView | null = null;

  // Track previous values to detect actual changes
  let previousData = $state<string | undefined>(undefined);
  let previousContentType = $state<string | undefined>(undefined);
  let previousTheme = $state<string | undefined>(undefined);

  // Determine if we should use dark theme
  const isDarkTheme = $derived(theme === 'g90' || theme === 'g100');

  // Determine language mode based on content type
  const languageExtension = $derived.by(() => {
    const type = contentType.toLowerCase();
    if (type.includes('json')) {
      return json();
    } else if (type.includes('xml')) {
      return xml();
    }
    return []; // Plain text, no highlighting
  });

  // Create or update CodeMirror editor
  function initializeEditor(): void {
    if (!editorContainer) return;

    // Clean up existing editor
    if (editorView) {
      editorView.destroy();
      editorView = null;
    }

    // Create new editor state
    const extensions = [
      basicSetup,
      languageExtension(),
      EditorView.editable.of(false), // Read-only
      EditorView.lineWrapping, // Wrap long lines
    ];

    // Add dark theme if needed
    if (isDarkTheme) {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: data,
      extensions,
    });

    // Create editor view
    editorView = new EditorView({
      state,
      parent: editorContainer,
    });
  }

  // Detect if we're in a test environment (JSDOM doesn't support all DOM APIs)
  const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

  // Initialize editor on mount
  onMount(() => {
    // Skip CodeMirror initialization in test environment
    if (isTestEnv) {
      return;
    }

    try {
      initializeEditor();
      // Track initial values after first render
      previousData = data;
      previousContentType = contentType;
      previousTheme = theme;
    } catch (error) {
      logger.error('RawView: Failed to initialize CodeMirror', error);
    }

    // Cleanup on unmount
    return () => {
      if (editorView) {
        editorView.destroy();
        editorView = null;
      }
    };
  });

  // Re-initialize editor ONLY when data, contentType, or theme ACTUALLY changes
  $effect(() => {
    // Skip if in test environment
    if (isTestEnv) {
      return;
    }

    // Skip if editor hasn't been initialized yet (onMount handles first init)
    if (previousData === undefined) {
      return;
    }

    // Only reinitialize if values have actually changed
    const dataChanged = data !== previousData;
    const contentTypeChanged = contentType !== previousContentType;
    const themeChanged = theme !== previousTheme;

    if (dataChanged || contentTypeChanged || themeChanged) {
      try {
        initializeEditor();
        // Update tracked values
        previousData = data;
        previousContentType = contentType;
        previousTheme = theme;
      } catch (error) {
        logger.error('RawView: Failed to re-initialize CodeMirror', error);
      }
    }
  });
</script>

<div class="raw-view {className}">
  {#if isTestEnv}
    <!-- Fallback for test environment without CodeMirror -->
    <pre class="raw-view-fallback">{data}</pre>
  {:else}
    <div class="raw-view-editor" bind:this={editorContainer}></div>
  {/if}
</div>

<style>
  .raw-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--cds-layer-01, #f4f4f4);
  }

  .raw-view-editor {
    flex: 1;
    overflow: auto;
    font-family: 'IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: var(--cds-code-02);
    line-height: 1.5;
  }

  /* Fallback for test environment */
  .raw-view-fallback {
    flex: 1;
    overflow: auto;
    font-family: 'IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: var(--cds-code-02);
    line-height: 1.5;
    padding: var(--cds-spacing-05, 1rem);
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* CodeMirror container styling */
  .raw-view-editor :global(.cm-editor) {
    height: 100%;
    font-family: 'IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: var(--cds-code-02);
    line-height: 1.43;
  }

  .raw-view-editor :global(.cm-scroller) {
    overflow: auto;
  }

  .raw-view-editor :global(.cm-content) {
    padding: var(--cds-spacing-05, 1rem);
  }

  /* Dark theme support */
  :global(.g90) .raw-view,
  :global(.g100) .raw-view {
    background-color: var(--cds-layer-01, #262626);
  }
</style>
