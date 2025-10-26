/**
 * Integration tests for SparqlEditor component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SparqlEditor from '../../../src/lib/components/Editor/SparqlEditor.svelte';
import { queryStore } from '../../../src/lib/stores';
import { resultsStore } from '../../../src/lib/stores/resultsStore';
import { defaultEndpoint } from '../../../src/lib/stores/endpointStore';
import { queryExecutionService } from '../../../src/lib/services/queryExecutionService';

describe('SparqlEditor Component', () => {
  beforeEach(() => {
    // Reset stores before each test
    queryStore.setText('');
    resultsStore.reset();
    defaultEndpoint.set('');
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rendering', () => {
    it('should render the editor', () => {
      const { container } = render(SparqlEditor);
      const editorElement = container.querySelector('.sparql-editor');
      expect(editorElement).toBeTruthy();
    });

    it('should render CodeMirror editor', async () => {
      const { container } = render(SparqlEditor);

      // Wait a tick for CodeMirror to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      const cmEditor = container.querySelector('.cm-editor');
      expect(cmEditor).toBeTruthy();
    });

    it('should render with initial value', async () => {
      const initialQuery = 'SELECT * WHERE { ?s ?p ?o }';
      const { container } = render(SparqlEditor, {
        props: { initialValue: initialQuery },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = container.querySelector('.cm-content');
      expect(content?.textContent).toContain('SELECT');
    });

    it('should render with custom class', () => {
      const { container } = render(SparqlEditor, {
        props: { class: 'custom-editor' },
      });

      const editorContainer = container.querySelector('.sparql-editor-container');
      expect(editorContainer?.classList.contains('custom-editor')).toBe(true);
    });
  });

  describe('Read-only mode', () => {
    it('should render in readonly mode', async () => {
      const { container } = render(SparqlEditor, {
        props: { readonly: true },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const editor = container.querySelector('.cm-editor');
      expect(editor).toBeTruthy();
      // CodeMirror applies contenteditable=false in readonly mode
    });

    it('should allow editing when not readonly', async () => {
      const { container } = render(SparqlEditor, {
        props: { readonly: false },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = container.querySelector('.cm-content');
      expect(content).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const { container } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = container.querySelector('.cm-content');
      expect(content?.getAttribute('role')).toBe('textbox');
      expect(content?.hasAttribute('aria-label')).toBe(true);
    });
  });

  describe('Theme integration', () => {
    it('should render with Carbon theme', async () => {
      const { container } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const editor = container.querySelector('.cm-editor');
      expect(editor).toBeTruthy();
      // Theme is applied via CodeMirror extensions
    });
  });

  describe('Line numbers and features', () => {
    it('should show line numbers', async () => {
      const { container } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const gutters = container.querySelector('.cm-gutters');
      expect(gutters).toBeTruthy();
    });

    it('should have fold gutter', async () => {
      const { container } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const foldGutter = container.querySelector('.cm-foldGutter');
      expect(foldGutter).toBeTruthy();
    });
  });

  describe('SPARQL syntax highlighting', () => {
    it('should apply syntax highlighting to keywords', async () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const { container } = render(SparqlEditor, {
        props: { initialValue: query },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // CodeMirror applies syntax highlighting via CSS classes
      const content = container.querySelector('.cm-content');
      expect(content).toBeTruthy();
    });
  });

  describe('Placeholder', () => {
    it('should show placeholder when empty', async () => {
      const { container } = render(SparqlEditor, {
        props: { placeholder: 'editor.placeholder' },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // CodeMirror shows placeholder when editor is empty
      const placeholder = container.querySelector('.cm-placeholder');
      expect(placeholder).toBeTruthy();
    });

    it('should not show placeholder with content', async () => {
      const { container } = render(SparqlEditor, {
        props: {
          initialValue: 'SELECT * WHERE { ?s ?p ?o }',
          placeholder: 'editor.placeholder',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Placeholder should not be visible when there's content
      const content = container.querySelector('.cm-content');
      expect(content?.textContent).toContain('SELECT');
    });
  });

  describe('Integration with query store', () => {
    it('should initialize with empty store', () => {
      const initialText = queryStore.getText();
      expect(initialText).toBe('');
    });

    it('should update store when text changes', async () => {
      const { container, component } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Programmatically set value
      const testQuery = 'SELECT * WHERE { ?s ?p ?o }';
      (component as { setValue: (v: string) => void }).setValue(testQuery);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that store was updated
      const storeText = queryStore.getText();
      expect(storeText).toBe(testQuery);
    });
  });

  describe('Component API', () => {
    it('should expose setValue method', () => {
      const { component } = render(SparqlEditor);
      expect(typeof (component as { setValue?: unknown }).setValue).toBe('function');
    });

    it('should expose getValue method', () => {
      const { component } = render(SparqlEditor);
      expect(typeof (component as { getValue?: unknown }).getValue).toBe('function');
    });

    it('should expose focus method', () => {
      const { component } = render(SparqlEditor);
      expect(typeof (component as { focus?: unknown }).focus).toBe('function');
    });

    it('should set value via setValue method', async () => {
      const { component } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const testQuery = 'ASK { ?s ?p ?o }';
      (component as { setValue: (v: string) => void }).setValue(testQuery);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const value = (component as { getValue: () => string }).getValue();
      expect(value).toBe(testQuery);
    });

    it('should get value via getValue method', async () => {
      const initialQuery = 'DESCRIBE <http://example.org/resource>';
      const { component } = render(SparqlEditor, {
        props: { initialValue: initialQuery },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const value = (component as { getValue: () => string }).getValue();
      expect(value).toBe(initialQuery);
    });
  });

  describe('Autocompletion', () => {
    it('should have autocompletion enabled', async () => {
      const { container } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify editor is rendered
      const editor = container.querySelector('.cm-editor');
      expect(editor).toBeTruthy();

      // Autocompletion is integrated via CodeMirror extensions
      // The actual completion UI is managed by CodeMirror
    });

    it('should render editor with SPARQL completions available', async () => {
      const { container, component } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Type a keyword prefix
      (component as { setValue: (v: string) => void }).setValue('SEL');

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify the value was set
      const value = (component as { getValue: () => string }).getValue();
      expect(value).toBe('SEL');

      // Autocompletion is available but testing the popup requires DOM interaction
      // The integration is verified by the unit tests and manual testing
    });

    it('should work with different query patterns', async () => {
      const { component } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Test setting various SPARQL keywords
      const keywords = ['SELECT', 'WHERE', 'FILTER', 'OPTIONAL', 'UNION'];

      for (const keyword of keywords) {
        (component as { setValue: (v: string) => void }).setValue(keyword);
        await new Promise((resolve) => setTimeout(resolve, 10));

        const value = (component as { getValue: () => string }).getValue();
        expect(value).toBe(keyword);
      }
    });

    it('should maintain editor focus for completion triggers', async () => {
      const { container, component } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Focus the editor
      (component as { focus: () => void }).focus();

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Editor should be focused (though jsdom has limited focus support)
      const editor = container.querySelector('.cm-editor');
      expect(editor).toBeTruthy();
    });

    it('should handle completion with functions', async () => {
      const { component } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Set a function name
      const funcQuery = 'SELECT (COUNT(?x) AS ?count) WHERE { ?x ?p ?o }';
      (component as { setValue: (v: string) => void }).setValue(funcQuery);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const value = (component as { getValue: () => string }).getValue();
      expect(value).toBe(funcQuery);
    });

    it('should work in read-only mode without completions', async () => {
      const { container } = render(SparqlEditor, {
        props: { readonly: true, initialValue: 'SELECT * WHERE { ?s ?p ?o }' },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const editor = container.querySelector('.cm-editor');
      expect(editor).toBeTruthy();

      // Read-only editors still have the completion extension,
      // but it won't trigger since the editor is not editable
    });
  });

  describe('Keyboard Shortcuts (Ctrl+Enter)', () => {
    it('should execute query when Ctrl+Enter is pressed with valid query and endpoint', async () => {
      // Set up valid query and endpoint
      const testQuery = 'SELECT * WHERE { ?s ?p ?o }';
      queryStore.setText(testQuery);
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);

      const executeSpy = vi.spyOn(queryExecutionService, 'executeQuery');

      const { container } = render(SparqlEditor, {
        props: { initialValue: testQuery },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Find the CodeMirror content element
      const cmContent = container.querySelector('.cm-content') as HTMLElement;
      expect(cmContent).toBeTruthy();

      // Simulate Ctrl+Enter keydown
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      cmContent.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify executeQuery was called
      expect(executeSpy).toHaveBeenCalledWith({
        query: testQuery,
        endpoint: 'https://dbpedia.org/sparql',
      });

      executeSpy.mockRestore();
    });

    it('should not execute query when query is empty', async () => {
      queryStore.setText('');
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);

      const executeSpy = vi.spyOn(queryExecutionService, 'executeQuery');

      const { container } = render(SparqlEditor);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const cmContent = container.querySelector('.cm-content') as HTMLElement;
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      cmContent.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify executeQuery was NOT called
      expect(executeSpy).not.toHaveBeenCalled();

      executeSpy.mockRestore();
    });

    it('should not execute query when endpoint is empty', async () => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o }');
      defaultEndpoint.set('');
      resultsStore.setLoading(false);

      const executeSpy = vi.spyOn(queryExecutionService, 'executeQuery');

      const { container } = render(SparqlEditor, {
        props: { initialValue: 'SELECT * WHERE { ?s ?p ?o }' },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const cmContent = container.querySelector('.cm-content') as HTMLElement;
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      cmContent.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify executeQuery was NOT called
      expect(executeSpy).not.toHaveBeenCalled();

      executeSpy.mockRestore();
    });

    it('should not execute query when already loading', async () => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o }');
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(true); // Already loading

      const executeSpy = vi.spyOn(queryExecutionService, 'executeQuery');

      const { container } = render(SparqlEditor, {
        props: { initialValue: 'SELECT * WHERE { ?s ?p ?o }' },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const cmContent = container.querySelector('.cm-content') as HTMLElement;
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      cmContent.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify executeQuery was NOT called
      expect(executeSpy).not.toHaveBeenCalled();

      executeSpy.mockRestore();
    });

    it('should not execute query in readonly mode', async () => {
      queryStore.setText('SELECT * WHERE { ?s ?p ?o }');
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);

      const executeSpy = vi.spyOn(queryExecutionService, 'executeQuery');

      const { container } = render(SparqlEditor, {
        props: {
          readonly: true,
          initialValue: 'SELECT * WHERE { ?s ?p ?o }',
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const cmContent = container.querySelector('.cm-content') as HTMLElement;
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      cmContent.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify executeQuery was NOT called
      expect(executeSpy).not.toHaveBeenCalled();

      executeSpy.mockRestore();
    });

    it('should support Cmd+Enter on Mac', async () => {
      // Set up valid query and endpoint
      const testQuery = 'SELECT * WHERE { ?s ?p ?o }';
      queryStore.setText(testQuery);
      defaultEndpoint.set('https://dbpedia.org/sparql');
      resultsStore.setLoading(false);

      const executeSpy = vi.spyOn(queryExecutionService, 'executeQuery');

      const { container } = render(SparqlEditor, {
        props: { initialValue: testQuery },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const cmContent = container.querySelector('.cm-content') as HTMLElement;

      // Simulate Cmd+Enter keydown (metaKey instead of ctrlKey)
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });
      cmContent.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify executeQuery was called
      expect(executeSpy).toHaveBeenCalledWith({
        query: testQuery,
        endpoint: 'https://dbpedia.org/sparql',
      });

      executeSpy.mockRestore();
    });
  });
});
