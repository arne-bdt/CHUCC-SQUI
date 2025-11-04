# Task 55: Extension Function and Aggregate Discovery

## Overview

Provide auto-completion, documentation, and discovery UI for custom extension functions and aggregates available at SPARQL endpoints.

## Motivation

SPARQL endpoints often provide custom extension functions (e.g., ARQ functions, geo functions, full-text search). Users don't know these exist or how to use them. Service Description lists these in `sd:extensionFunction` and `sd:extensionAggregate`, which we can surface in:
- Auto-completion while typing queries
- Searchable function library panel
- Inline documentation tooltips

## Requirements

### Function/Aggregate Data Model

```typescript
// src/lib/types/serviceDescription.ts (extend existing)

export interface ExtensionFunction {
  uri: string;
  label?: string;
  comment?: string; // Description of what the function does
  parameters?: FunctionParameter[];
  returnType?: string;
  examples?: string[]; // SPARQL query examples
  documentationUrl?: string;
}

export interface FunctionParameter {
  name: string;
  type?: string; // XSD datatype
  optional?: boolean;
  description?: string;
}

export interface ExtensionAggregate extends ExtensionFunction {
  // Aggregates have same structure but used in GROUP BY context
}
```

### Function Library Panel

```typescript
// src/lib/components/FunctionLibrary.svelte

<script lang="ts">
  import {
    Search,
    DataTable,
    Link,
    Tag,
    Modal,
    CodeSnippet
  } from 'carbon-components-svelte';
  import { serviceDescriptionStore } from '$lib/stores/serviceDescriptionStore';

  let searchTerm = $state('');

  const functions = $derived(
    $serviceDescriptionStore.descriptions.get(currentEndpoint)?.extensionFunctions ?? []
  );

  const aggregates = $derived(
    $serviceDescriptionStore.descriptions.get(currentEndpoint)?.extensionAggregates ?? []
  );

  const filteredFunctions = $derived(
    functions.filter(f =>
      f.uri.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  let selectedFunction = $state<ExtensionFunction | null>(null);

  function showDetails(func: ExtensionFunction) {
    selectedFunction = func;
  }

  function insertFunction(func: ExtensionFunction) {
    // Insert function call at cursor position in editor
    const functionCall = buildFunctionCall(func);
    // Dispatch event to editor to insert text
    dispatchInsertText(functionCall);
  }

  function buildFunctionCall(func: ExtensionFunction): string {
    if (!func.parameters || func.parameters.length === 0) {
      return `<${func.uri}>()`;
    }

    const params = func.parameters
      .map(p => p.optional ? `?${p.name}` : `?${p.name}`)
      .join(', ');

    return `<${func.uri}>(${params})`;
  }
</script>

<div class="function-library">
  <div class="header">
    <h3>Extension Functions</h3>
    <Search bind:value={searchTerm} placeholder="Search functions..." />
  </div>

  <div class="tabs">
    <button class:active={currentTab === 'functions'}>
      Functions ({functions.length})
    </button>
    <button class:active={currentTab === 'aggregates'}>
      Aggregates ({aggregates.length})
    </button>
  </div>

  {#if currentTab === 'functions'}
    <div class="function-list">
      {#each filteredFunctions as func}
        <div class="function-item">
          <div class="function-header">
            <code class="function-uri">{getFunctionName(func.uri)}</code>
            {#if func.label}
              <span class="function-label">{func.label}</span>
            {/if}
          </div>

          {#if func.comment}
            <p class="function-description">{func.comment}</p>
          {/if}

          <div class="function-actions">
            <button onclick={() => showDetails(func)}>Details</button>
            <button onclick={() => insertFunction(func)}>Insert</button>
            {#if func.documentationUrl}
              <Link href={func.documentationUrl} target="_blank">Docs</Link>
            {/if}
          </div>
        </div>
      {/each}

      {#if filteredFunctions.length === 0}
        <p class="empty-state">
          {searchTerm ? 'No functions match your search' : 'No extension functions available'}
        </p>
      {/if}
    </div>
  {/if}
</div>

{#if selectedFunction}
  <Modal
    open={true}
    modalHeading={selectedFunction.label || getFunctionName(selectedFunction.uri)}
    passiveModal
    on:close={() => selectedFunction = null}
  >
    <FunctionDetails function={selectedFunction} />
  </Modal>
{/if}
```

### Function Details Modal

```typescript
// src/lib/components/FunctionDetails.svelte

<script lang="ts">
  import { CodeSnippet, Tag } from 'carbon-components-svelte';
  import type { ExtensionFunction } from '$lib/types/serviceDescription';

  interface Props {
    function: ExtensionFunction;
  }

  let { function: func }: Props = $props();
</script>

<div class="function-details">
  <section>
    <h4>URI</h4>
    <CodeSnippet type="single" code={func.uri} />
  </section>

  {#if func.comment}
    <section>
      <h4>Description</h4>
      <p>{func.comment}</p>
    </section>
  {/if}

  {#if func.parameters && func.parameters.length > 0}
    <section>
      <h4>Parameters</h4>
      <ul class="parameter-list">
        {#each func.parameters as param}
          <li>
            <code>{param.name}</code>
            {#if param.type}
              <Tag size="sm">{param.type}</Tag>
            {/if}
            {#if param.optional}
              <Tag size="sm" type="blue">optional</Tag>
            {/if}
            {#if param.description}
              <p>{param.description}</p>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if func.returnType}
    <section>
      <h4>Returns</h4>
      <Tag>{func.returnType}</Tag>
    </section>
  {/if}

  {#if func.examples && func.examples.length > 0}
    <section>
      <h4>Examples</h4>
      {#each func.examples as example}
        <CodeSnippet type="multi" code={example} />
      {/each}
    </section>
  {/if}

  {#if func.documentationUrl}
    <section>
      <h4>Documentation</h4>
      <a href={func.documentationUrl} target="_blank" rel="noopener noreferrer">
        View official documentation →
      </a>
    </section>
  {/if}
</div>

<style>
  .function-details section {
    margin-bottom: 1.5rem;
  }

  .function-details h4 {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .parameter-list {
    list-style: none;
    padding: 0;
  }

  .parameter-list li {
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    background: var(--cds-layer-01);
    border-radius: 4px;
  }

  .parameter-list li code {
    font-weight: 600;
    margin-right: 0.5rem;
  }

  .parameter-list li p {
    margin-top: 0.25rem;
    color: var(--cds-text-secondary);
    font-size: 0.875rem;
  }
</style>
```

### Auto-completion Integration

```typescript
// src/lib/editor/extensions/functionCompletion.ts

import { autocompletion, type CompletionContext, type Completion } from '@codemirror/autocomplete';
import type { ExtensionFunction, ExtensionAggregate } from '$lib/types/serviceDescription';

export function extensionFunctionCompletion(
  getFunctions: () => (ExtensionFunction | ExtensionAggregate)[],
): Extension {
  return autocompletion({
    override: [
      (context: CompletionContext) => {
        const { state, pos } = context;
        const textBefore = state.sliceDoc(Math.max(0, pos - 50), pos);

        // Trigger in function call context (FILTER, BIND, SELECT expressions)
        if (!isInFunctionContext(textBefore)) {
          return null;
        }

        const functions = getFunctions();
        if (functions.length === 0) {
          return null;
        }

        return {
          from: pos,
          options: functions.map(func => ({
            label: func.label || getFunctionName(func.uri),
            type: func.parameters ? 'function' : 'constant',
            detail: func.uri,
            info: func.comment,
            apply: (view, completion, from, to) => {
              const functionCall = buildFunctionCall(func);
              view.dispatch({
                changes: { from, to, insert: functionCall },
                selection: { anchor: from + functionCall.indexOf('(') + 1 },
              });
            },
          })),
        };
      },
    ],
  });
}

function isInFunctionContext(text: string): boolean {
  // Check if we're in a context where functions are allowed
  return (
    /FILTER\s*\([^)]*$/i.test(text) ||
    /BIND\s*\([^)]*$/i.test(text) ||
    /SELECT\s+[^{]*$/i.test(text) ||
    /ORDER\s+BY\s+[^{]*$/i.test(text) ||
    /HAVING\s*\([^)]*$/i.test(text)
  );
}

function getFunctionName(uri: string): string {
  const parts = uri.split(/[#\/]/);
  return parts[parts.length - 1] || uri;
}

function buildFunctionCall(func: ExtensionFunction | ExtensionAggregate): string {
  if (!func.parameters || func.parameters.length === 0) {
    return `<${func.uri}>()`;
  }

  const params = func.parameters
    .map(p => p.name)
    .join(', ');

  return `<${func.uri}>(${params})`;
}
```

### Function Signature Tooltip

```typescript
// src/lib/editor/extensions/functionSignature.ts

import { hoverTooltip } from '@codemirror/view';
import type { EditorView, Tooltip } from '@codemirror/view';
import type { ExtensionFunction } from '$lib/types/serviceDescription';

export function functionSignatureTooltip(
  getFunctions: () => (ExtensionFunction | ExtensionAggregate)[],
): Extension {
  return hoverTooltip((view: EditorView, pos: number): Tooltip | null => {
    const { from, to, text } = view.state.doc.lineAt(pos);

    // Check if hovering over function URI
    const match = text.match(/<([^>]+)>\s*\(/);
    if (!match) {
      return null;
    }

    const functionUri = match[1];
    const functions = getFunctions();
    const func = functions.find(f => f.uri === functionUri);

    if (!func) {
      return null;
    }

    return {
      pos: from + text.indexOf(match[0]),
      above: true,
      create: () => {
        const dom = document.createElement('div');
        dom.className = 'function-signature-tooltip';
        dom.innerHTML = formatFunctionTooltip(func);
        return { dom };
      },
    };
  });
}

function formatFunctionTooltip(func: ExtensionFunction): string {
  let html = `<div class="tooltip-content">`;

  if (func.label) {
    html += `<div class="tooltip-title">${func.label}</div>`;
  }

  html += `<div class="tooltip-signature">`;
  html += `<code>${getFunctionName(func.uri)}(`;

  if (func.parameters && func.parameters.length > 0) {
    const params = func.parameters
      .map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type || 'any'}`)
      .join(', ');
    html += params;
  }

  html += `)</code>`;

  if (func.returnType) {
    html += ` → <code>${func.returnType}</code>`;
  }

  html += `</div>`;

  if (func.comment) {
    html += `<div class="tooltip-description">${func.comment}</div>`;
  }

  html += `</div>`;

  return html;
}
```

## Implementation Steps

1. **Extend Service Description Types**
   - Add detailed function/aggregate interfaces
   - Add parameter and example structures

2. **Create Function Library Component**
   - Implement `FunctionLibrary.svelte`
   - Add search and filtering
   - Add tabs for functions vs aggregates

3. **Create Function Details Component**
   - Implement `FunctionDetails.svelte` modal
   - Display parameters, return type, examples
   - Add "Insert" functionality

4. **Implement Auto-completion**
   - Create `functionCompletion.ts` extension
   - Integrate with service description store
   - Build function call templates with parameters

5. **Implement Hover Tooltips**
   - Create `functionSignatureTooltip.ts` extension
   - Show function signature and docs on hover
   - Style tooltips with Carbon Design System

6. **Integrate with UI**
   - Add Function Library panel to sidebar
   - Add editor extensions to QueryEditor
   - Connect to service description store

7. **Testing**
   - Unit tests for function formatting utilities
   - Integration tests for auto-completion
   - Integration tests for hover tooltips
   - Storybook stories for Function Library component
   - E2E tests for function discovery workflow

## Acceptance Criteria

- ✅ Function library panel displays all extension functions
- ✅ Search filters functions by URI, label, or description
- ✅ Separate tabs for functions and aggregates
- ✅ Function details modal shows full documentation
- ✅ "Insert" button adds function call to editor at cursor
- ✅ Auto-completion suggests functions in appropriate contexts
- ✅ Hover tooltips show function signatures and descriptions
- ✅ Function calls inserted with parameter placeholders
- ✅ Links to external documentation work
- ✅ Graceful handling when no functions available
- ✅ Carbon Design System styling throughout
- ✅ All tests pass (`npm test`)
- ✅ Build succeeds with no warnings (`npm run build`)
- ✅ E2E tests verify function discovery UI (`npm run test:e2e:storybook`)

## User Experience

**Discovery Workflow:**
1. User connects to endpoint with custom functions
2. Opens "Function Library" in sidebar
3. Browses available functions (e.g., `geo:distance`, `text:query`)
4. Clicks "Details" to see parameters and examples
5. Clicks "Insert" to add function to query at cursor

**Auto-completion Workflow:**
1. User types `FILTER(` in query
2. Auto-complete popup shows extension functions
3. User selects `geo:distance` from suggestions
4. Function inserted: `<http://jena.apache.org/geo#distance>(?point1, ?point2)`
5. Cursor positioned at first parameter

**Hover Workflow:**
1. User hovers over function URI in query
2. Tooltip shows: `distance(point1: geo:Point, point2: geo:Point) → xsd:double`
3. Shows description: "Calculate distance between two geographic points"

## Dependencies

- Task 51 (Service Description Core) must be completed first
- CodeMirror 6 autocompletion and hover APIs
- Carbon Components Svelte (already integrated)

## Future Enhancements

- Fetch extended function metadata from external ontologies
- Category-based browsing (geo functions, text functions, etc.)
- User-contributed function examples
- Function usage statistics (most popular functions)
- Generate function documentation from service description
- Support for function overloading (multiple signatures)

## References

- [SPARQL 1.1 Service Description - Extension Functions](https://www.w3.org/TR/sparql11-service-description/#sd-extensionFunction)
- [Apache Jena ARQ Functions](https://jena.apache.org/documentation/query/library-function.html)
- [CodeMirror Autocompletion](https://codemirror.net/docs/ref/#autocomplete)
- [CodeMirror Hover Tooltips](https://codemirror.net/docs/ref/#view.hoverTooltip)
