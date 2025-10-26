# Task 09: Prefix Autocompletion in Editor

**Phase:** SPARQL Editor
**Status:** COMPLETED
**Dependencies:** 06, 08
**Estimated Effort:** 3-4 hours

## Objective

Implement PREFIX autocompletion in the editor with suggestions from common prefixes and prefix.cc.

## Requirements

Per specification section 1.2:
- Suggest common prefixes when typing prefix declarations
- Autocomplete PREFIX URIs from prefix.cc
- Automatically insert PREFIX declaration when using an unknown prefix
- Autocomplete terms after known prefix (e.g., rdf:type)

## Implementation Steps

1. Create `src/lib/editor/prefixCompletions.ts`:
   ```typescript
   import { CompletionContext } from '@codemirror/autocomplete';
   import { prefixService } from '../services/prefixService';

   export async function prefixCompletion(context: CompletionContext) {
     const { state, pos } = context;
     const line = state.doc.lineAt(pos);
     const textBefore = line.text.slice(0, pos - line.from);

     // Check if we're in a PREFIX declaration
     const prefixDeclMatch = textBefore.match(/PREFIX\\s+(\\w*)$/);
     if (prefixDeclMatch) {
       // Suggest prefix names
       const allPrefixes = prefixService.getAllPrefixes();
       return {
         from: pos - prefixDeclMatch[1].length,
         options: Object.keys(allPrefixes).map(prefix => ({
           label: `${prefix}:`,
           apply: `${prefix}: <${allPrefixes[prefix]}>`,
           type: 'namespace',
           info: allPrefixes[prefix]
         })),
         filter: true
       };
     }

     // Check if we're completing after a prefix colon
     const prefixUseMatch = textBefore.match(/(\\w+):(\\w*)$/);
     if (prefixUseMatch) {
       const [, prefixName, partialTerm] = prefixUseMatch;
       const allPrefixes = prefixService.getAllPrefixes();

       if (allPrefixes[prefixName]) {
         // Suggest common terms for this prefix
         const suggestions = await getTermSuggestions(prefixName, partialTerm);
         return {
           from: pos - partialTerm.length,
           options: suggestions,
           filter: true
         };
       }
     }

     return null;
   }

   async function getTermSuggestions(prefix: string, partial: string) {
     // For common prefixes, provide well-known terms
     const commonTerms: Record<string, string[]> = {
       rdf: ['type', 'Property', 'Statement', 'subject', 'predicate', 'object'],
       rdfs: ['label', 'comment', 'subClassOf', 'subPropertyOf', 'domain', 'range', 'Class'],
       owl: ['Class', 'ObjectProperty', 'DatatypeProperty', 'Thing', 'sameAs', 'inverseOf'],
       xsd: ['string', 'integer', 'decimal', 'boolean', 'date', 'dateTime', 'float', 'double'],
       foaf: ['name', 'Person', 'knows', 'homepage', 'mbox', 'depiction', 'Organization'],
       skos: ['Concept', 'prefLabel', 'altLabel', 'broader', 'narrower', 'related']
     };

     const terms = commonTerms[prefix] || [];
     return terms
       .filter(term => term.toLowerCase().startsWith(partial.toLowerCase()))
       .map(term => ({
         label: term,
         type: 'property',
         info: `${prefix}:${term}`
       }));
   }
   ```

2. Update `src/lib/components/Editor/SparqlEditor.svelte`:
   - Add prefixCompletion to autocomplete sources
   - Configure async completions

3. Integrate with query store:
   - When user selects a prefix completion, add PREFIX declaration to top of query if not present
   - Update query store with merged prefixes

## Acceptance Criteria

- [x] Typing "PREFIX " suggests common prefix names
- [x] Selecting a prefix auto-completes with full URI
- [x] Typing "prefix:" suggests terms for that prefix
- [x] Common terms for rdf, rdfs, owl, xsd, foaf, skos are available
- [x] PREFIX declaration is auto-inserted if using new prefix
- [x] Completions work asynchronously without blocking editor

## Testing

1. Create `tests/unit/editor/prefixCompletions.test.ts`:
   - Test prefix name suggestions
   - Test PREFIX declaration generation
   - Test term suggestions for common prefixes
   - Test async completion handling

2. Add integration tests:
   - Test typing "PREFIX r" suggests "rdf:"
   - Test typing "rdf:t" suggests "type"
   - Test auto-insertion of PREFIX declarations

## Files to Create/Modify

- `src/lib/editor/prefixCompletions.ts` (create)
- `src/lib/components/Editor/SparqlEditor.svelte` (modify)
- `tests/unit/editor/prefixCompletions.test.ts` (create)

## Commit Message

```
feat: add PREFIX and term autocompletion in editor

- Implement PREFIX declaration autocompletion
- Add term suggestions for common prefixes
- Auto-insert PREFIX declarations when needed
- Support async completions for prefix.cc integration
- Add comprehensive prefix completion tests
```

## Notes

- Prefix.cc integration can be added later for dynamic prefix lookups
- Consider caching term suggestions for performance
- LOV (Linked Open Vocabularies) API could be used for more comprehensive term suggestions
- May need to debounce prefix.cc requests to avoid rate limiting
