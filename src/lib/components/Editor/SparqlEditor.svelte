<script lang="ts">
  /**
   * SPARQL Query Editor Component
   * CodeMirror 6-based editor with SPARQL syntax highlighting
   */

  import { onMount, onDestroy } from 'svelte';
  import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLine,
    placeholder as placeholderExtension,
  } from '@codemirror/view';
  import { EditorState, Compartment } from '@codemirror/state';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
  import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
  import { closeBrackets, closeBracketsKeymap, autocompletion } from '@codemirror/autocomplete';
  import { sparql } from '../../editor/sparqlLanguage';
  import { createCarbonTheme } from '../../editor/carbonTheme';
  import { sparqlCompletion } from '../../editor/sparqlCompletions';
  import { prefixCompletion } from '../../editor/prefixCompletions';
  import { templateService } from '../../services/templateService';
  import { queryStore } from '../../stores';
  import { resultsStore } from '../../stores/resultsStore';
  import { defaultEndpoint } from '../../stores/endpointStore';
  import { queryExecutionService } from '../../services/queryExecutionService';
  import { themeStore } from '../../stores/theme';
  import { t } from '../../localization';
  import type { CarbonTheme } from '../../types';

  /**
   * Component props
   */
  interface Props {
    /** Initial query text */
    initialValue?: string;
    /** Read-only mode */
    readonly?: boolean;
    /** Placeholder text when editor is empty */
    placeholder?: string;
    /** Additional CSS class */
    class?: string;
  }

  let {
    initialValue = templateService.getDefaultTemplate(),
    readonly = false,
    placeholder,
    class: className = '',
  }: Props = $props();

  // Component state
  let editorElement: HTMLDivElement | null = $state(null);
  let editorView: EditorView | null = $state(null);
  let currentTheme = $state<CarbonTheme>('white');

  // Store subscriptions for query execution
  // Use $state with manual subscription to ensure reactivity
  let queryState = $state($queryStore);
  let resultsState = $state($resultsStore);
  let endpoint = $state($defaultEndpoint);

  // Manually subscribe to stores to ensure editor updates when store changes
  $effect(() => {
    const unsubscribe = queryStore.subscribe((value) => {
      queryState = value;
    });
    return unsubscribe;
  });

  $effect(() => {
    const unsubscribe = resultsStore.subscribe((value) => {
      resultsState = value;
    });
    return unsubscribe;
  });

  $effect(() => {
    const unsubscribe = defaultEndpoint.subscribe((value) => {
      endpoint = value;
    });
    return unsubscribe;
  });

  // Computed state for execution
  const hasQuery = $derived(queryState.text.trim().length > 0);
  const hasEndpoint = $derived(endpoint.trim().length > 0);
  const isLoading = $derived(resultsState.loading);
  const canExecute = $derived(hasQuery && hasEndpoint && !isLoading && !readonly);

  // Theme compartment for dynamic theme switching
  const themeCompartment = new Compartment();
  const readOnlyCompartment = new Compartment();

  /**
   * Execute the current query (triggered by Ctrl+Enter / Cmd+Enter)
   */
  async function executeQuery(): Promise<boolean> {
    if (!canExecute) return false;

    try {
      await queryExecutionService.executeQuery({
        query: queryState.text,
        endpoint: endpoint,
      });
      return true;
    } catch (error) {
      // Error is already handled by the service and set in resultsStore
      console.error('Query execution error:', error);
      return false;
    }
  }

  /**
   * Initialize CodeMirror editor
   */
  function initializeEditor() {
    if (!editorElement) return;

    // Initialize query store with initial value
    // This ensures RunButton has access to query text immediately
    if (initialValue) {
      queryStore.setText(initialValue);
    }

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        // Line numbers and gutters
        lineNumbers(),
        highlightActiveLine(),
        foldGutter(),

        // Editing enhancements
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightSelectionMatches(),

        // SPARQL language support
        sparql(),

        // Autocompletion
        autocompletion({
          override: [prefixCompletion, sparqlCompletion],
          activateOnTyping: true,
          maxRenderedOptions: 20,
        }),

        // Theme (dynamic)
        themeCompartment.of(createCarbonTheme(currentTheme)),

        // Read-only mode (dynamic)
        readOnlyCompartment.of(EditorView.editable.of(!readonly)),

        // Keymaps
        keymap.of([
          // Custom keyboard shortcuts
          {
            key: 'Mod-Enter',
            run: () => {
              executeQuery();
              return true;
            },
          },
          // Standard keymaps
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
        ]),

        // Update listener - sync with store
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newText = update.state.doc.toString();
            queryStore.setText(newText);
          }
        }),

        // Placeholder
        placeholderExtension($t('editor.placeholder')),

        // Accessibility
        EditorView.contentAttributes.of({
          'aria-label': $t('a11y.editor'),
          role: 'textbox',
        }),
      ],
    });

    editorView = new EditorView({
      state,
      parent: editorElement,
    });
  }

  /**
   * Update editor content programmatically
   */
  export function setValue(newValue: string): void {
    if (!editorView) return;

    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newValue,
      },
    });
  }

  /**
   * Get current editor content
   */
  export function getValue(): string {
    return editorView?.state.doc.toString() || '';
  }

  /**
   * Focus the editor
   */
  export function focus(): void {
    editorView?.focus();
  }

  /**
   * Sync store changes back to editor (for tab switching)
   * Only updates if the store content differs from editor content
   */
  $effect(() => {
    if (!editorView) return;

    const storeText = queryState.text;
    const editorText = editorView.state.doc.toString();

    console.log('[SparqlEditor] $effect - checking if editor needs update:', {
      storeText: storeText.substring(0, 50),
      editorText: editorText.substring(0, 50),
      needsUpdate: storeText !== editorText,
    });

    // Only update if content actually differs (prevents infinite loops)
    if (storeText !== editorText) {
      console.log('[SparqlEditor] Updating editor to:', storeText.substring(0, 50));
      setValue(storeText);
    }
  });

  /**
   * Update theme when theme store changes
   */
  $effect(() => {
    const theme = $themeStore.current;
    if (theme !== currentTheme) {
      currentTheme = theme;
      if (editorView) {
        editorView.dispatch({
          effects: themeCompartment.reconfigure(createCarbonTheme(currentTheme)),
        });
      }
    }
  });

  /**
   * Update read-only mode
   */
  $effect(() => {
    if (editorView && readonly !== undefined) {
      editorView.dispatch({
        effects: readOnlyCompartment.reconfigure(EditorView.editable.of(!readonly)),
      });
    }
  });

  // Lifecycle
  onMount(() => {
    initializeEditor();
  });

  onDestroy(() => {
    editorView?.destroy();
  });
</script>

<div class="sparql-editor-container {currentTheme} {className}">
  <div class="sparql-editor" bind:this={editorElement}></div>
</div>

<style>
  .sparql-editor-container {
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sparql-editor {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  /* Ensure CodeMirror fills the container */
  .sparql-editor :global(.cm-editor) {
    height: 100%;
  }

  .sparql-editor :global(.cm-scroller) {
    overflow: auto;
  }

  /* Match Carbon spacing */
  .sparql-editor :global(.cm-content) {
    padding: var(--cds-spacing-03, 0.5rem) 0;
  }

  /* Improve focus visibility */
  .sparql-editor :global(.cm-focused) {
    outline: none;
  }

  /* Adjust gutter padding */
  .sparql-editor :global(.cm-gutters) {
    padding-right: var(--cds-spacing-03, 0.5rem);
  }
</style>
