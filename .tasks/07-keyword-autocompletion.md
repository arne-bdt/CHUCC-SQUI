# Task 07: SPARQL Keyword Autocompletion

**Phase:** SPARQL Editor
**Status:** TODO
**Dependencies:** 06
**Estimated Effort:** 2-3 hours

## Objective

Implement autocompletion for SPARQL keywords, functions, and syntax hints in the editor.

## Requirements

Per specification section 1.2:
- Autocomplete SPARQL keywords (SELECT, WHERE, FILTER, etc.)
- Autocomplete SPARQL functions
- Keyboard shortcut (Ctrl+Space) to trigger suggestions
- Context-aware suggestions where possible

## Implementation Steps

1. Create `src/lib/editor/sparqlCompletions.ts`:
   ```typescript
   import { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';

   export const sparqlKeywords: Completion[] = [
     { label: 'SELECT', type: 'keyword', info: 'Select variables' },
     { label: 'WHERE', type: 'keyword', info: 'Where clause' },
     { label: 'FILTER', type: 'keyword', info: 'Filter results' },
     { label: 'OPTIONAL', type: 'keyword', info: 'Optional pattern' },
     { label: 'UNION', type: 'keyword', info: 'Union of patterns' },
     { label: 'GRAPH', type: 'keyword', info: 'Named graph' },
     { label: 'CONSTRUCT', type: 'keyword', info: 'Construct graph' },
     { label: 'ASK', type: 'keyword', info: 'Ask query' },
     { label: 'DESCRIBE', type: 'keyword', info: 'Describe resource' },
     { label: 'LIMIT', type: 'keyword', info: 'Limit results' },
     { label: 'OFFSET', type: 'keyword', info: 'Offset results' },
     { label: 'ORDER BY', type: 'keyword', info: 'Order results' },
     { label: 'GROUP BY', type: 'keyword', info: 'Group results' },
     { label: 'HAVING', type: 'keyword', info: 'Having clause' },
     { label: 'DISTINCT', type: 'keyword', info: 'Distinct results' },
     { label: 'REDUCED', type: 'keyword', info: 'Reduced results' },
     { label: 'FROM', type: 'keyword', info: 'From graph' },
     { label: 'FROM NAMED', type: 'keyword', info: 'From named graph' },
     { label: 'BIND', type: 'keyword', info: 'Bind expression' },
     { label: 'VALUES', type: 'keyword', info: 'Inline data' },
     { label: 'SERVICE', type: 'keyword', info: 'Federated query' },
     { label: 'MINUS', type: 'keyword', info: 'Minus pattern' },
     { label: 'EXISTS', type: 'keyword', info: 'Exists pattern' },
     { label: 'NOT EXISTS', type: 'keyword', info: 'Not exists pattern' }
   ];

   export const sparqlFunctions: Completion[] = [
     { label: 'STR()', type: 'function', info: 'Convert to string' },
     { label: 'LANG()', type: 'function', info: 'Get language tag' },
     { label: 'DATATYPE()', type: 'function', info: 'Get datatype' },
     { label: 'IRI()', type: 'function', info: 'Create IRI' },
     { label: 'BNODE()', type: 'function', info: 'Create blank node' },
     { label: 'RAND()', type: 'function', info: 'Random number' },
     { label: 'ABS()', type: 'function', info: 'Absolute value' },
     { label: 'CEIL()', type: 'function', info: 'Ceiling' },
     { label: 'FLOOR()', type: 'function', info: 'Floor' },
     { label: 'ROUND()', type: 'function', info: 'Round' },
     { label: 'CONCAT()', type: 'function', info: 'Concatenate strings' },
     { label: 'STRLEN()', type: 'function', info: 'String length' },
     { label: 'UCASE()', type: 'function', info: 'Uppercase' },
     { label: 'LCASE()', type: 'function', info: 'Lowercase' },
     { label: 'SUBSTR()', type: 'function', info: 'Substring' },
     { label: 'STRSTARTS()', type: 'function', info: 'String starts with' },
     { label: 'STRENDS()', type: 'function', info: 'String ends with' },
     { label: 'CONTAINS()', type: 'function', info: 'String contains' },
     { label: 'REGEX()', type: 'function', info: 'Regular expression match' },
     { label: 'REPLACE()', type: 'function', info: 'Replace string' },
     { label: 'NOW()', type: 'function', info: 'Current datetime' },
     { label: 'YEAR()', type: 'function', info: 'Year from datetime' },
     { label: 'MONTH()', type: 'function', info: 'Month from datetime' },
     { label: 'DAY()', type: 'function', info: 'Day from datetime' },
     { label: 'HOURS()', type: 'function', info: 'Hours from datetime' },
     { label: 'MINUTES()', type: 'function', info: 'Minutes from datetime' },
     { label: 'SECONDS()', type: 'function', info: 'Seconds from datetime' },
     { label: 'COUNT()', type: 'function', info: 'Count aggregation' },
     { label: 'SUM()', type: 'function', info: 'Sum aggregation' },
     { label: 'MIN()', type: 'function', info: 'Minimum aggregation' },
     { label: 'MAX()', type: 'function', info: 'Maximum aggregation' },
     { label: 'AVG()', type: 'function', info: 'Average aggregation' },
     { label: 'SAMPLE()', type: 'function', info: 'Sample aggregation' },
     { label: 'GROUP_CONCAT()', type: 'function', info: 'Group concatenation' }
   ];

   export function sparqlCompletion(context: CompletionContext): CompletionResult | null {
     const word = context.matchBefore(/\\w*/);
     if (!word || (word.from === word.to && !context.explicit)) {
       return null;
     }

     return {
       from: word.from,
       options: [...sparqlKeywords, ...sparqlFunctions],
       filter: true
     };
   }
   ```

2. Update `src/lib/editor/sparqlLanguage.ts`:
   - Add autocompletion extension

3. Update `src/lib/components/Editor/SparqlEditor.svelte`:
   ```typescript
   import { autocompletion } from '@codemirror/autocomplete';
   import { sparqlCompletion } from '../../editor/sparqlCompletions';

   // In extensions array:
   extensions: [
     // ... existing extensions
     autocompletion({
       override: [sparqlCompletion],
       activateOnTyping: true,
       maxRenderedOptions: 20
     })
   ]
   ```

## Acceptance Criteria

- [ ] Autocompletion triggers on typing
- [ ] Ctrl+Space explicitly triggers completion
- [ ] SPARQL keywords appear in completion list
- [ ] SPARQL functions appear in completion list
- [ ] Completions show info/documentation
- [ ] Completions filter as user types
- [ ] Tab or Enter accepts completion

## Testing

1. Create `tests/unit/editor/sparqlCompletions.test.ts`:
   - Test completion list contains expected keywords
   - Test completion list contains expected functions
   - Test filtering logic

2. Add to `tests/integration/editor/SparqlEditor.test.ts`:
   - Test autocompletion triggers on typing
   - Test Ctrl+Space triggers completion
   - Test accepting a completion

## Files to Create/Modify

- `src/lib/editor/sparqlCompletions.ts` (create)
- `src/lib/editor/sparqlLanguage.ts` (modify)
- `src/lib/components/Editor/SparqlEditor.svelte` (modify)
- `tests/unit/editor/sparqlCompletions.test.ts` (create)
- `tests/integration/editor/SparqlEditor.test.ts` (modify)

## Commit Message

```
feat: add SPARQL keyword and function autocompletion

- Implement completion provider for SPARQL keywords
- Add SPARQL function completions with documentation
- Enable Ctrl+Space to trigger completions
- Add filtering and info display
- Add completion tests
```

## Notes

- CodeMirror autocomplete extension handles UI and interaction
- Can extend with context-aware completions in future (e.g., suggest SELECT after PREFIX)
- Function completions could include parameter hints
- Consider adding snippets for common patterns (e.g., PREFIX template)
