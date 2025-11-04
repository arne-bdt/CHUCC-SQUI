# Task 52: Graph Name Auto-completion for FROM/FROM NAMED

## Overview

Implement intelligent auto-completion for graph names in `FROM` and `FROM NAMED` clauses using SPARQL Service Description metadata.

## Motivation

Users often don't know which named graphs are available in an endpoint. Service Description provides `sd:namedGraph` information that can be used to suggest available graphs, making query composition faster and more accurate.

## Requirements

### CodeMirror Integration

1. **Auto-completion Provider**
   - Detect when user is typing in `FROM` or `FROM NAMED` clause
   - Trigger completion when typing after `FROM NAMED` or `FROM` keywords
   - Show list of available named graphs from service description

2. **Completion Items**
   - Display graph IRI as primary text
   - Show graph metadata as secondary text (if available):
     - Triple count (from voiD vocabulary)
     - Graph description/label
     - Entailment regime
   - Highlight matching text based on user input

3. **Context-Aware Completion**
   - Only suggest `FROM NAMED` graphs when cursor is after `FROM NAMED`
   - Suggest both default and named graphs after standalone `FROM`
   - Filter suggestions based on partial IRI input
   - Handle prefix declarations (suggest both prefixed and full IRIs)

### UI/UX Design

1. **Completion Popup**
   - Use Carbon Design System styling for consistency
   - Show graph icon or indicator
   - Display metadata in secondary text (muted color)
   - Keyboard navigation (arrow keys, Enter to accept)
   - Mouse hover and click to select

2. **Loading States**
   - Show "Loading graphs..." message if service description not yet fetched
   - Display "(Service description unavailable)" if endpoint doesn't support it
   - Gracefully degrade to no suggestions if metadata missing

3. **Graph Information Panel (Optional)**
   - On hover, show detailed graph information:
     - Full IRI
     - Triple count
     - Example triples (if available)
     - Last modified date (from metadata)
   - Use Carbon tooltip or popover component

### CodeMirror Extension

```typescript
// src/lib/editor/extensions/graphNameCompletion.ts

export function graphNameCompletion(
  getServiceDescription: () => ServiceDescription | null
): Extension {
  return autocompletion({
    override: [
      async (context: CompletionContext) => {
        // Detect if cursor is in FROM/FROM NAMED clause
        const { state, pos } = context;
        const textBefore = state.sliceDoc(0, pos);

        if (!isInFromClause(textBefore)) {
          return null;
        }

        const serviceDesc = getServiceDescription();
        if (!serviceDesc) {
          return null;
        }

        // Build completion items from named graphs
        const completions = buildGraphCompletions(
          serviceDesc,
          isFromNamed(textBefore)
        );

        return {
          from: getCompletionStart(context),
          options: completions,
        };
      },
    ],
  });
}

function buildGraphCompletions(
  serviceDesc: ServiceDescription,
  namedOnly: boolean
): Completion[] {
  const graphs = namedOnly
    ? serviceDesc.datasets.flatMap(ds => ds.namedGraphs)
    : [
        ...serviceDesc.datasets.flatMap(ds => ds.defaultGraphs),
        ...serviceDesc.datasets.flatMap(ds => ds.namedGraphs),
      ];

  return graphs.map(graph => ({
    label: graph.name || graph.uri || 'unnamed',
    type: 'constant',
    detail: formatGraphMetadata(graph),
    info: formatGraphInfo(graph),
    apply: (view, completion, from, to) => {
      // Insert <graph-iri> with angle brackets
      view.dispatch({
        changes: { from, to, insert: `<${graph.name}>` },
      });
    },
  }));
}

function formatGraphMetadata(graph: GraphDescription): string {
  const parts: string[] = [];

  if (graph.metadata?.triples) {
    parts.push(`${formatNumber(graph.metadata.triples)} triples`);
  }

  if (graph.entailmentRegime) {
    const regime = graph.entailmentRegime.split('#').pop();
    parts.push(regime || 'entailed');
  }

  return parts.join(' • ');
}
```

### Query Analysis

```typescript
// src/lib/editor/utils/queryAnalysis.ts

/**
 * Detect if cursor is within a FROM or FROM NAMED clause
 */
export function isInFromClause(textBefore: string): boolean {
  // Simple regex-based detection
  // Look for FROM or FROM NAMED followed by optional whitespace/IRIs
  const fromPattern = /\bFROM\s+(NAMED\s+)?(?:<[^>]*>|\w+:\w+\s+)*$/i;
  return fromPattern.test(textBefore);
}

/**
 * Check if we're specifically in a FROM NAMED clause
 */
export function isFromNamed(textBefore: string): boolean {
  const fromNamedPattern = /\bFROM\s+NAMED\s+(?:<[^>]*>|\w+:\w+\s+)*$/i;
  return fromNamedPattern.test(textBefore);
}

/**
 * Find the start position for completion
 * Handles partial IRIs like "<http://ex" or "ex:"
 */
export function getCompletionStart(context: CompletionContext): number {
  const { state, pos } = context;
  const textBefore = state.sliceDoc(0, pos);

  // Check for partial IRI in angle brackets
  const angleMatch = textBefore.match(/<[^>]*$/);
  if (angleMatch) {
    return pos - angleMatch[0].length + 1; // +1 to skip '<'
  }

  // Check for prefixed name
  const prefixMatch = textBefore.match(/\b(\w+:\w*)$/);
  if (prefixMatch) {
    return pos - prefixMatch[1].length;
  }

  return pos;
}
```

### Integration with Service Description Store

```typescript
// src/lib/components/QueryEditor.svelte

<script lang="ts">
  import { serviceDescriptionStore } from '$lib/stores/serviceDescriptionStore';
  import { graphNameCompletion } from '$lib/editor/extensions/graphNameCompletion';

  const serviceDesc = $derived($serviceDescriptionStore.descriptions.get(currentEndpoint));

  const editorExtensions = $derived([
    // ... other extensions
    graphNameCompletion(() => serviceDesc),
  ]);
</script>
```

## Implementation Steps

1. **Create Query Analysis Utils**
   - Implement `isInFromClause()`, `isFromNamed()`, `getCompletionStart()`
   - Add unit tests for various query patterns
   - Handle edge cases (comments, strings, nested queries)

2. **Implement Completion Extension**
   - Create `graphNameCompletion()` CodeMirror extension
   - Build completion items from service description
   - Format graph metadata for display
   - Add keyboard and mouse interaction

3. **Style Completion Popup**
   - Create custom CSS for Carbon-style completion
   - Style graph icons/indicators
   - Style metadata text (muted color, smaller font)

4. **Integrate with Editor**
   - Add extension to QueryEditor component
   - Connect to serviceDescriptionStore
   - Handle loading and error states

5. **Testing**
   - Unit tests for query analysis functions
   - Integration tests for completion behavior
   - Test with various graph IRI formats (full IRIs, prefixed names)
   - Test edge cases (no service description, empty graph list)

6. **Documentation**
   - Add user-facing docs explaining graph auto-completion
   - Add JSDoc comments for all public functions

## Acceptance Criteria

- ✅ Graph names auto-complete after `FROM` and `FROM NAMED` keywords
- ✅ Completion shows graph metadata (triple count, entailment regime)
- ✅ Keyboard navigation works (arrow keys, Enter)
- ✅ Mouse selection works
- ✅ Graceful handling when service description unavailable
- ✅ Works with partial IRI input (filters suggestions)
- ✅ Handles prefixed names correctly
- ✅ Carbon Design System styling applied
- ✅ All tests pass (`npm test`)
- ✅ Build succeeds with no warnings (`npm run build`)
- ✅ E2E tests verify completion in Storybook (`npm run test:e2e:storybook`)

## User Experience

**Before:**
```sparql
SELECT * FROM <|>  # User types, no suggestions
```

**After:**
```sparql
SELECT * FROM <|>
# Popup shows:
# 📊 http://example.org/dataset1    10,245 triples • RDFS
# 📊 http://example.org/dataset2    523 triples
# 📊 http://example.org/products    1,024,332 triples • OWL-DL
```

## Dependencies

- Task 51 (Service Description Core) must be completed first
- CodeMirror 6 autocompletion API
- Carbon Design System (already integrated)

## Future Enhancements

- Fuzzy search for graph IRIs
- Recently used graphs shown first
- Graph preview on hover (sample triples)
- Support for GRAPH clause auto-completion
- Support for SERVICE endpoint auto-completion (federated queries)

## References

- [CodeMirror Autocompletion](https://codemirror.net/docs/ref/#autocomplete)
- [SPARQL 1.1 Service Description - Datasets](https://www.w3.org/TR/sparql11-service-description/#datasets)
