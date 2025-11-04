# Task 54: Query Validation Based on Endpoint Capabilities

## Overview

Implement query validation that warns users when their query uses features not supported by the current SPARQL endpoint, based on Service Description metadata.

## Motivation

Users waste time writing queries that will fail at the endpoint because they use unsupported features. By validating queries against endpoint capabilities, SQUI can provide early feedback and suggest alternatives.

## Requirements

### Validation Rules

1. **Language Version Validation**
   - Warn if using SPARQL 1.1 syntax on 1.0-only endpoint
   - Examples:
     - `BIND` clause (1.1 only)
     - Property paths (1.1 only)
     - `GROUP_CONCAT` separator (1.1 only)
     - Subqueries (1.1 only)
     - Aggregates in `SELECT` (1.1 only)

2. **Feature Validation**
   - Warn if using `FROM`/`FROM NAMED` when `DereferencesURIs` not supported
   - Warn if using `SERVICE` when `BasicFederatedQuery` not supported
   - Warn if query requires dataset but `RequiresDataset` indicates endpoint won't accept it

3. **Extension Function Validation**
   - Warn if using functions not in standard SPARQL and not in `sd:extensionFunction` list
   - Suggest standard alternatives if available
   - Example: `afn:localname()` (ARQ) → suggest `REPLACE()` + `STRAFTER()`

4. **Result Format Validation**
   - Warn if selected result format not in `sd:resultFormat` list
   - Auto-switch to supported format or show format picker

5. **Graph Existence Validation**
   - Warn if using graph IRI not in `sd:namedGraph` list (soft warning)
   - Suggest available graphs from service description

### CodeMirror Linter Integration

```typescript
// src/lib/editor/extensions/capabilityLinter.ts

import { linter, type Diagnostic } from '@codemirror/lint';
import type { EditorView } from '@codemirror/view';
import type { ServiceDescription } from '$lib/types/serviceDescription';

export function capabilityLinter(
  getServiceDescription: () => ServiceDescription | null
): Extension {
  return linter((view: EditorView) => {
    const serviceDesc = getServiceDescription();
    if (!serviceDesc) {
      return []; // No validation without service description
    }

    const diagnostics: Diagnostic[] = [];
    const query = view.state.doc.toString();

    // Run all validation checks
    diagnostics.push(...validateLanguageVersion(query, serviceDesc));
    diagnostics.push(...validateFeatures(query, serviceDesc));
    diagnostics.push(...validateExtensionFunctions(query, serviceDesc));
    diagnostics.push(...validateGraphs(query, serviceDesc));

    return diagnostics;
  });
}

function validateLanguageVersion(
  query: string,
  serviceDesc: ServiceDescription
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Check if endpoint supports SPARQL 1.1
  const supports11 = serviceDesc.supportedLanguages.includes(
    SPARQLLanguage.SPARQL11Query
  );

  if (!supports11) {
    // Check for SPARQL 1.1 features
    const features11 = [
      { pattern: /\bBIND\s*\(/i, feature: 'BIND clause', from: 'SPARQL 1.1' },
      { pattern: /\bSERVICE\s+/i, feature: 'SERVICE (federated query)', from: 'SPARQL 1.1' },
      { pattern: /\w+[\*\+\?\/\|]+/i, feature: 'Property paths', from: 'SPARQL 1.1' },
      { pattern: /\bMINUS\s*{/i, feature: 'MINUS', from: 'SPARQL 1.1' },
      { pattern: /\bVALUES\s+/i, feature: 'VALUES', from: 'SPARQL 1.1' },
    ];

    for (const { pattern, feature, from } of features11) {
      const match = query.match(pattern);
      if (match && match.index !== undefined) {
        diagnostics.push({
          from: match.index,
          to: match.index + match[0].length,
          severity: 'warning',
          message: `${feature} is from ${from} but endpoint only supports SPARQL 1.0`,
          actions: [
            {
              name: 'Learn more',
              apply: () => {
                window.open('https://www.w3.org/TR/sparql11-query/', '_blank');
              },
            },
          ],
        });
      }
    }
  }

  return diagnostics;
}

function validateFeatures(
  query: string,
  serviceDesc: ServiceDescription
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const features = serviceDesc.features;

  // Check FROM/FROM NAMED with URI dereferencing
  if (!features.includes(ServiceFeature.DereferencesURIs)) {
    const fromPattern = /\bFROM\s+(NAMED\s+)?<([^>]+)>/gi;
    let match;
    while ((match = fromPattern.exec(query)) !== null) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: 'Endpoint does not support URI dereferencing in FROM clauses',
      });
    }
  }

  // Check SERVICE with federated query
  if (!features.includes(ServiceFeature.BasicFederatedQuery)) {
    const servicePattern = /\bSERVICE\s+/gi;
    let match;
    while ((match = servicePattern.exec(query)) !== null) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: 'Endpoint does not support federated queries (SERVICE)',
      });
    }
  }

  return diagnostics;
}

function validateExtensionFunctions(
  query: string,
  serviceDesc: ServiceDescription
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Extract function calls from query
  const functionPattern = /<([^>]+)>\s*\(/g;
  const extensionFunctions = new Set(
    serviceDesc.extensionFunctions.map(f => f.uri)
  );

  let match;
  while ((match = functionPattern.exec(query)) !== null) {
    const functionUri = match[1];

    // Check if it's a standard SPARQL function
    if (isStandardFunction(functionUri)) {
      continue;
    }

    // Check if it's in extension functions
    if (!extensionFunctions.has(functionUri)) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'info',
        message: `Custom function <${functionUri}> not listed in endpoint capabilities`,
      });
    }
  }

  return diagnostics;
}

function validateGraphs(
  query: string,
  serviceDesc: ServiceDescription
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Get all available graph IRIs
  const availableGraphs = new Set(
    serviceDesc.datasets.flatMap(ds => ds.namedGraphs.map(g => g.name))
  );

  if (availableGraphs.size === 0) {
    return diagnostics; // No graph info available
  }

  // Check FROM NAMED clauses
  const fromNamedPattern = /\bFROM\s+NAMED\s+<([^>]+)>/gi;
  let match;
  while ((match = fromNamedPattern.exec(query)) !== null) {
    const graphIri = match[1];

    if (!availableGraphs.has(graphIri)) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'info',
        message: `Graph <${graphIri}> not in endpoint's named graphs list`,
        actions: [
          {
            name: 'See available graphs',
            apply: () => {
              // Show graph picker or capabilities panel
              // This would trigger UI action
            },
          },
        ],
      });
    }
  }

  return diagnostics;
}

function isStandardFunction(uri: string): boolean {
  const standardFunctions = [
    'http://www.w3.org/2001/XMLSchema#string',
    'http://www.w3.org/2001/XMLSchema#integer',
    // ... all standard SPARQL functions
  ];

  return (
    standardFunctions.includes(uri) ||
    uri.startsWith('http://www.w3.org/2001/XMLSchema#')
  );
}
```

### Validation Messages

```typescript
// src/lib/components/ValidationMessages.svelte

<script lang="ts">
  import { InlineNotification } from 'carbon-components-svelte';
  import type { Diagnostic } from '@codemirror/lint';

  interface Props {
    diagnostics: Diagnostic[];
  }

  let { diagnostics }: Props = $props();

  const warnings = $derived(diagnostics.filter(d => d.severity === 'warning'));
  const infos = $derived(diagnostics.filter(d => d.severity === 'info'));
</script>

{#if warnings.length > 0}
  <InlineNotification
    kind="warning"
    title="Query Compatibility Issues"
    subtitle={`${warnings.length} potential issue(s) detected`}
    hideCloseButton
  >
    <ul>
      {#each warnings as warning}
        <li>{warning.message}</li>
      {/each}
    </ul>
  </InlineNotification>
{/if}

{#if infos.length > 0}
  <InlineNotification
    kind="info"
    title="Query Suggestions"
    subtitle={`${infos.length} suggestion(s)`}
    hideCloseButton
  >
    <ul>
      {#each infos as info}
        <li>{info.message}</li>
      {/each}
    </ul>
  </InlineNotification>
{/if}
```

### Validation Settings

```typescript
// src/lib/stores/settingsStore.ts

interface ValidationSettings {
  enableCapabilityValidation: boolean;
  warnOnUnsupportedFeatures: boolean;
  warnOnUnknownFunctions: boolean;
  warnOnUnknownGraphs: boolean;
}

// Add to settings store
export const settingsStore = createSettingsStore({
  // ... existing settings
  validation: {
    enableCapabilityValidation: true,
    warnOnUnsupportedFeatures: true,
    warnOnUnknownFunctions: false, // May be too noisy
    warnOnUnknownGraphs: false, // May be too noisy
  },
});
```

## Implementation Steps

1. **Create Validation Utils**
   - Implement language version detection
   - Implement feature usage detection
   - Implement function extraction and validation
   - Add unit tests for each validator

2. **Create CodeMirror Linter Extension**
   - Implement `capabilityLinter()` extension
   - Integrate with service description store
   - Add diagnostic messages and actions
   - Test with various query patterns

3. **Create Validation Messages Component**
   - Implement `ValidationMessages.svelte`
   - Style with Carbon components
   - Show summary of issues

4. **Add Validation Settings**
   - Add settings UI for validation options
   - Allow users to enable/disable validation categories
   - Persist settings to localStorage

5. **Integrate with Editor**
   - Add linter extension to QueryEditor
   - Connect to serviceDescriptionStore
   - Show validation messages below editor

6. **Testing**
   - Unit tests for all validation functions
   - Integration tests for linter extension
   - Test with endpoints with different capabilities
   - Test performance with large queries
   - E2E tests for validation UI

## Acceptance Criteria

- ✅ Warns when using SPARQL 1.1 features on 1.0 endpoints
- ✅ Warns when using unsupported SERVICE keyword
- ✅ Warns when using FROM/FROM NAMED without URI dereferencing
- ✅ Warns about custom functions not in extension list (optional)
- ✅ Suggests available graphs when using unknown graph IRI (optional)
- ✅ Validation runs in real-time as user types
- ✅ Validation can be disabled in settings
- ✅ Warnings displayed in editor with squiggly underlines
- ✅ Summary message shown above/below editor
- ✅ "Learn more" actions link to relevant documentation
- ✅ No validation when service description unavailable
- ✅ Performance: validation completes in <100ms for typical queries
- ✅ All tests pass (`npm test`)
- ✅ Build succeeds with no warnings (`npm run build`)
- ✅ E2E tests verify validation warnings appear (`npm run test:e2e:storybook`)

## User Experience

**Example 1: SPARQL 1.0 Endpoint**
```sparql
SELECT ?s ?label WHERE {
  ?s ?p ?o .
  BIND(STR(?o) AS ?label)  # ⚠️ Warning: BIND clause is from SPARQL 1.1
                           #    but endpoint only supports SPARQL 1.0
}
```

**Example 2: No Federated Query Support**
```sparql
SELECT * WHERE {
  ?s ?p ?o .
  SERVICE <http://dbpedia.org/sparql> {  # ⚠️ Warning: Endpoint does not
    ?s rdfs:label ?label .               #    support federated queries (SERVICE)
  }
}
```

**Example 3: Unknown Graph**
```sparql
SELECT * FROM NAMED <http://example.org/unknown> {  # ℹ️ Info: Graph not in
  GRAPH ?g { ?s ?p ?o }                             #   endpoint's named graphs list
}                                                   #   [See available graphs]
```

## Dependencies

- Task 51 (Service Description Core) must be completed first
- CodeMirror 6 linter API
- Carbon Components Svelte (already integrated)

## Future Enhancements

- Auto-fix suggestions (e.g., rewrite property path as verbose query)
- Validation for UPDATE queries
- Check result size limits from service description
- Suggest query optimization based on endpoint features
- Validate prefixes against service description vocabularies

## References

- [CodeMirror Linter](https://codemirror.net/docs/ref/#lint)
- [SPARQL 1.1 Query Features](https://www.w3.org/TR/sparql11-query/)
- [SPARQL 1.1 Service Description](https://www.w3.org/TR/sparql11-service-description/)
