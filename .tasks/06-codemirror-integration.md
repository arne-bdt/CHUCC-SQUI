# Task 06: CodeMirror 6 Integration with SPARQL Syntax

**Phase:** SPARQL Editor
**Status:** TODO
**Dependencies:** 02, 04
**Estimated Effort:** 4-5 hours

## Objective

Integrate CodeMirror 6 as the query editor with SPARQL syntax highlighting and basic error checking.

## Requirements

Per specification section 1.1:
- SPARQL syntax highlighting for keywords, functions, strings, punctuation
- Multi-line editing with proper indentation
- Basic syntax error checking (unclosed braces, quotes)
- Responsive and performant editing experience
- Integration with Svelte 5

## Implementation Steps

1. Install CodeMirror 6 packages (already in package.json):
   - `codemirror`
   - `@codemirror/language`
   - `@codemirror/state`
   - `@codemirror/view`
   - `@codemirror/commands`
   - `@codemirror/search`

2. Create SPARQL language support `src/lib/editor/sparqlLanguage.ts`:
   ```typescript
   import { LRLanguage, LanguageSupport } from '@codemirror/language';
   import { styleTags, tags as t } from '@lezer/highlight';

   // Define SPARQL keywords, functions, etc.
   export const sparqlKeywords = [
     'SELECT', 'CONSTRUCT', 'ASK', 'DESCRIBE',
     'WHERE', 'FILTER', 'OPTIONAL', 'UNION',
     'PREFIX', 'BASE', 'DISTINCT', 'REDUCED',
     'LIMIT', 'OFFSET', 'ORDER', 'BY', 'ASC', 'DESC',
     'FROM', 'NAMED', 'GRAPH', 'BIND', 'SERVICE',
     'VALUES', 'GROUP', 'HAVING', 'MINUS', 'EXISTS', 'NOT'
   ];

   // Create simple SPARQL parser
   // Note: This is a simplified version; consider using or creating a proper Lezer grammar
   export function sparql(): LanguageSupport {
     // Implementation of basic SPARQL syntax highlighting
     // This may require creating a Lezer grammar or using StreamLanguage
   }
   ```

3. Create `src/lib/components/Editor/SparqlEditor.svelte`:
   ```svelte
   <script lang="ts">
     import { onMount, onDestroy } from 'svelte';
     import { EditorView, basicSetup } from 'codemirror';
     import { EditorState } from '@codemirror/state';
     import { sparql } from '../../editor/sparqlLanguage';
     import { queryStore } from '../../stores';

     let editorElement: HTMLDivElement;
     let editorView: EditorView;

     export let value = '';
     export let readonly = false;

     onMount(() => {
       const state = EditorState.create({
         doc: value,
         extensions: [
           basicSetup,
           sparql(),
           EditorView.updateListener.of((update) => {
             if (update.docChanged) {
               queryStore.setText(update.state.doc.toString());
             }
           }),
           EditorView.editable.of(!readonly),
           // Theme integration will come from Carbon theme
         ]
       });

       editorView = new EditorView({
         state,
         parent: editorElement
       });
     });

     onDestroy(() => {
       editorView?.destroy();
     });

     // Method to update editor content programmatically
     export function setValue(newValue: string) {
       if (editorView) {
         editorView.dispatch({
           changes: { from: 0, to: editorView.state.doc.length, insert: newValue }
         });
       }
     }
   </script>

   <div class="sparql-editor" bind:this={editorElement}></div>

   <style>
     .sparql-editor {
       height: 100%;
       overflow: auto;
     }

     :global(.cm-editor) {
       height: 100%;
     }
   </style>
   ```

4. Create editor theme matching Carbon themes `src/lib/editor/carbonTheme.ts`:
   ```typescript
   import { EditorView } from '@codemirror/view';

   export function createCarbonTheme(isDark: boolean) {
     return EditorView.theme({
       '&': {
         backgroundColor: isDark ? '#262626' : '#ffffff',
         color: isDark ? '#f4f4f4' : '#161616',
       },
       '.cm-content': {
         caretColor: isDark ? '#ffffff' : '#0f62fe',
       },
       '.cm-cursor, .cm-dropCursor': {
         borderLeftColor: isDark ? '#ffffff' : '#0f62fe',
       },
       // Add more theme customization
     }, { dark: isDark });
   }
   ```

5. Replace EditorPlaceholder with SparqlEditor in layout

## Acceptance Criteria

- [ ] CodeMirror editor renders in the editor pane
- [ ] SPARQL keywords are highlighted
- [ ] Strings, comments, and punctuation are styled differently
- [ ] Editor supports multi-line input
- [ ] Basic syntax errors are indicated (brackets, quotes)
- [ ] Editor updates query store on changes
- [ ] Editor is themeable (matches Carbon theme)
- [ ] No performance issues with large queries

## Testing

1. Create `tests/unit/editor/sparqlLanguage.test.ts`:
   - Test keyword recognition
   - Test syntax highlighting

2. Create `tests/integration/editor/SparqlEditor.test.ts`:
   - Test editor mounting
   - Test text input and store updates
   - Test programmatic value setting
   - Test readonly mode

## Files to Create/Modify

- `src/lib/editor/sparqlLanguage.ts` (create)
- `src/lib/editor/carbonTheme.ts` (create)
- `src/lib/components/Editor/SparqlEditor.svelte` (create)
- `src/SparqlQueryUI.svelte` (modify - use SparqlEditor)
- `tests/unit/editor/sparqlLanguage.test.ts` (create)
- `tests/integration/editor/SparqlEditor.test.ts` (create)

## Commit Message

```
feat: integrate CodeMirror 6 with SPARQL syntax highlighting

- Add CodeMirror 6 editor component
- Implement SPARQL syntax highlighting
- Create Carbon-compatible editor theme
- Connect editor to query store
- Add basic error indication
- Add editor tests
```

## Notes

- Consider using `@codemirror/lang-sql` as a base if full SPARQL grammar is complex
- StreamLanguage can be used for simpler highlighting
- For full Lezer grammar, may need to create custom parser
- Ensure proper cleanup in onDestroy to prevent memory leaks
- Add line numbers and search/replace support via basic extensions
