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

  let editorContainer: HTMLDivElement;
  let editorView: EditorView | null = null;

  // Determine if we should use dark theme
  const isDarkTheme = $derived(theme === 'g90' || theme === 'g100');

  // Determine language mode based on content type
  const languageExtension = $derived(() => {
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

  // Initialize editor on mount
  onMount(() => {
    initializeEditor();

    // Cleanup on unmount
    return () => {
      if (editorView) {
        editorView.destroy();
        editorView = null;
      }
    };
  });

  // Re-initialize editor when data, contentType, or theme changes
  $effect(() => {
    if (data !== undefined || contentType !== undefined || theme !== undefined) {
      initializeEditor();
    }
  });
</script>

<div class="raw-view {className}">
  <div class="raw-view-editor" bind:this={editorContainer}></div>
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
    font-size: 0.875rem;
    line-height: 1.5;
  }

  /* CodeMirror container styling */
  .raw-view-editor :global(.cm-editor) {
    height: 100%;
    font-family: 'IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
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
