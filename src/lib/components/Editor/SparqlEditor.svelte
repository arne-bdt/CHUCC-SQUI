<script lang="ts">
  /**
   * SPARQL Query Editor Component
   * CodeMirror 6-based editor with SPARQL syntax highlighting
   */

  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
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
  import { lintGutter } from '@codemirror/lint';
  import { sparql } from '../../editor/sparqlLanguage';
  import { createCarbonTheme } from '../../editor/carbonTheme';
  import { sparqlCompletion } from '../../editor/sparqlCompletions';
  import { prefixCompletion } from '../../editor/prefixCompletions';
  import { graphNameCompletion } from '../../editor/extensions/graphNameCompletion';
  import { capabilityLinter } from '../../editor/extensions/capabilityLinter';
  import { extensionFunctionCompletion } from '../../editor/extensions/functionCompletion';
  import { functionSignatureTooltip } from '../../editor/extensions/functionSignatureTooltip';
  import { templateService } from '../../services/templateService';
  import {
    getQueryStore,
    getResultsStore,
    getEndpointStore,
    getServiceDescriptionStore,
    getSettingsStore,
    getThemeStore,
  } from '../../stores/storeContext';
  import { sparqlService } from '../../services/sparqlService';
  import { t } from '../../localization';
  import { logger } from '../../utils/logger';
  import type { CarbonTheme, ServiceDescription } from '../../types';

  // Get stores from context (with fallback to global)
  const queryStore = getQueryStore();
  const resultsStore = getResultsStore();
  const defaultEndpoint = getEndpointStore();
  const serviceDescriptionStore = getServiceDescriptionStore();
  const settingsStore = getSettingsStore();
  const themeStore = getThemeStore();

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
  // Use $state to track current store values
  let queryState = $state($queryStore);
  let resultsState = $state($resultsStore);
  let endpoint = $state($defaultEndpoint);
  let serviceDescState = $state($serviceDescriptionStore);

  // Store unsubscribe functions for cleanup
  let storeUnsubscribers: Array<() => void> = [];

  // Guard flag to prevent circular updates between editor and store
  let isUpdatingFromStore = false;

  // Computed state for execution
  const hasQuery = $derived(queryState.text.trim().length > 0);
  const hasEndpoint = $derived(endpoint.trim().length > 0);
  const isLoading = $derived(resultsState.loading);
  const canExecute = $derived(hasQuery && hasEndpoint && !isLoading && !readonly);

  // Theme compartment for dynamic theme switching
  const themeCompartment = new Compartment();
  const readOnlyCompartment = new Compartment();

  /**
   * Get service description for current endpoint
   * Used by graph name completion to access available graphs
   *
   * IMPORTANT: This function reads directly from the stores using get()
   * to ensure we always have the latest service description data,
   * even when called during editor initialization before subscriptions fire.
   */
  function getServiceDescription(): ServiceDescription | null {
    // Get current endpoint from store
    const currentEndpoint = get(defaultEndpoint);
    if (!currentEndpoint) {
      return null;
    }

    // Get service description state from store
    const serviceDescState = get(serviceDescriptionStore);
    if (!serviceDescState.descriptions) {
      return null;
    }

    return serviceDescState.descriptions.get(currentEndpoint) || null;
  }

  /**
   * Get extension functions for current endpoint
   * Used by function completion and hover tooltips
   */
  function getExtensionFunctions() {
    const serviceDesc = getServiceDescription();
    if (!serviceDesc) {
      return [];
    }
    return [...(serviceDesc.extensionFunctions ?? []), ...(serviceDesc.extensionAggregates ?? [])];
  }

  /**
   * Execute the current query (triggered by Ctrl+Enter / Cmd+Enter)
   * FIX: Use context resultsStore.executeQuery() instead of global queryExecutionService
   * to ensure results are stored in the correct store instance
   */
  async function executeQuery(): Promise<boolean> {
    if (!canExecute) return false;

    try {
      await resultsStore.executeQuery({
        query: queryState.text,
        endpoint: endpoint,
      });
      return true;
    } catch (error) {
      // Error is already handled by the store
      logger.error('Query execution error:', error);
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
        lintGutter(),

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
          override: [
            prefixCompletion,
            sparqlCompletion,
            graphNameCompletion(() => getServiceDescription()),
            extensionFunctionCompletion(() => getExtensionFunctions()),
          ],
          activateOnTyping: true,
          maxRenderedOptions: 20,
        }),

        // Function signature hover tooltips
        functionSignatureTooltip(() => getExtensionFunctions()),

        // Query validation linter
        capabilityLinter(
          () => getServiceDescription(),
          () => {
            const settings = get(settingsStore);
            return {
              enabled: settings.validation.enableCapabilityValidation,
              warnOnUnsupportedFeatures: settings.validation.warnOnUnsupportedFeatures,
              warnOnUnknownFunctions: settings.validation.warnOnUnknownFunctions,
              warnOnUnknownGraphs: settings.validation.warnOnUnknownGraphs,
            };
          }
        ),

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
            // Don't update store if we're currently updating FROM the store (prevents circular updates)
            if (!isUpdatingFromStore) {
              const newText = update.state.doc.toString();
              logger.debug('[SparqlEditor] updateListener - calling queryStore.setText');
              queryStore.setText(newText);
            } else {
              logger.debug('[SparqlEditor] updateListener - SKIPPED (isUpdatingFromStore=true)');
            }
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
   * Insert text at the current cursor position
   * Used by FunctionLibrary to insert function calls
   */
  export function insertText(text: string): void {
    if (!editorView) return;

    const selection = editorView.state.selection.main;
    editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: text,
      },
      selection: {
        anchor: selection.from + text.length,
      },
    });
    editorView.focus();
  }

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

    // CRITICAL: Subscribe to stores AFTER editor is initialized
    // This ensures editorView is available when subscriptions fire
    logger.debug('[SparqlEditor] onMount - Setting up store subscriptions');

    // Subscribe to queryStore and DIRECTLY update editor when it changes
    storeUnsubscribers.push(
      queryStore.subscribe((value) => {
        logger.debug('[SparqlEditor] queryStore subscription fired:', {
          newText: value.text.substring(0, 50),
          currentEditorText: editorView?.state.doc.toString().substring(0, 50) || 'no editor',
          willUpdate: editorView && value.text !== editorView.state.doc.toString(),
        });

        // Update queryState for other derived values
        queryState = value;

        // DIRECTLY update editor if text changed
        if (editorView && value.text !== editorView.state.doc.toString()) {
          logger.debug('[SparqlEditor] DIRECTLY updating editor to:', value.text.substring(0, 50));

          // Set guard flag to prevent updateListener from calling queryStore.setText()
          isUpdatingFromStore = true;

          editorView.dispatch({
            changes: {
              from: 0,
              to: editorView.state.doc.length,
              insert: value.text,
            },
          });

          // Reset guard flag after editor update completes
          // Use setTimeout to ensure updateListener has finished
          setTimeout(() => {
            isUpdatingFromStore = false;
            logger.debug('[SparqlEditor] Guard flag cleared (isUpdatingFromStore=false)');
          }, 0);
        }
      })
    );

    // Subscribe to resultsStore
    storeUnsubscribers.push(
      resultsStore.subscribe((value) => {
        resultsState = value;
      })
    );

    // Subscribe to endpointStore
    storeUnsubscribers.push(
      defaultEndpoint.subscribe((value) => {
        endpoint = value;

        // Fetch service description for new endpoint
        if (value) {
          serviceDescriptionStore.fetchForEndpoint(value).catch((err) => {
            logger.debug('[SparqlEditor] Failed to fetch service description:', err);
          });
        }
      })
    );

    // Subscribe to serviceDescriptionStore
    storeUnsubscribers.push(
      serviceDescriptionStore.subscribe((value) => {
        serviceDescState = value;
      })
    );

    logger.debug('[SparqlEditor] onMount complete - subscriptions active');
  });

  onDestroy(() => {
    // Clean up store subscriptions
    storeUnsubscribers.forEach((unsub) => unsub());
    storeUnsubscribers = [];

    // Destroy editor
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
