# Task 56: Smart Result Format Negotiation

## Overview

Implement intelligent result format selection based on Service Description's `sd:resultFormat` list, with automatic fallback and format capability detection.

## Motivation

SPARQL endpoints support different result formats (JSON, XML, CSV, TSV, Turtle, RDF/XML, etc.). Service Description lists supported formats in `sd:resultFormat`. SQUI should:
- Only show formats the endpoint actually supports
- Auto-select best available format
- Provide fallback when requested format unavailable
- Show format capabilities (e.g., which formats support variables vs. graphs)

## Requirements

### Format Detection

1. **Parse Result Formats from Service Description**
   - Extract `sd:resultFormat` MIME types
   - Map to human-readable format names
   - Categorize by result type (SELECT/ASK vs. CONSTRUCT/DESCRIBE)

2. **Format Categories**

   **SELECT/ASK Results:**
   - `application/sparql-results+json` (SPARQL JSON Results)
   - `application/sparql-results+xml` (SPARQL XML Results)
   - `text/csv` (CSV)
   - `text/tab-separated-values` (TSV)

   **CONSTRUCT/DESCRIBE Results:**
   - `text/turtle` (Turtle)
   - `application/rdf+xml` (RDF/XML)
   - `application/n-triples` (N-Triples)
   - `application/ld+json` (JSON-LD)

### Format Selector UI

```typescript
// src/lib/components/ResultFormatSelector.svelte

<script lang="ts">
  import { Select, SelectItem, Tag, Tooltip } from 'carbon-components-svelte';
  import { serviceDescriptionStore } from '$lib/stores/serviceDescriptionStore';
  import { resultsStore } from '$lib/stores/resultsStore';
  import { queryStore } from '$lib/stores/queryStore';

  const currentEndpoint = $derived($endpointStore.url);
  const serviceDesc = $derived(
    $serviceDescriptionStore.descriptions.get(currentEndpoint)
  );

  // Detect query type (SELECT/ASK vs CONSTRUCT/DESCRIBE)
  const queryType = $derived(detectQueryType($queryStore.query));

  // Get available formats for current query type
  const availableFormats = $derived(
    getAvailableFormats(serviceDesc, queryType)
  );

  // Selected format
  let selectedFormat = $state('application/sparql-results+json');

  // Auto-select best format when formats change
  $effect(() => {
    if (availableFormats.length > 0 && !availableFormats.includes(selectedFormat)) {
      selectedFormat = getBestFormat(availableFormats, queryType);
    }
  });

  function getAvailableFormats(
    desc: ServiceDescription | undefined,
    type: QueryType
  ): string[] {
    if (!desc) {
      return getDefaultFormats(type);
    }

    const formats = desc.resultFormats;

    if (type === 'SELECT' || type === 'ASK') {
      return formats.filter(f =>
        f.includes('sparql-results') || f.includes('csv') || f.includes('tsv')
      );
    } else {
      return formats.filter(f =>
        f.includes('turtle') || f.includes('rdf') || f.includes('n-triples') || f.includes('ld+json')
      );
    }
  }

  function getBestFormat(formats: string[], type: QueryType): string {
    // Preference order for SELECT/ASK
    if (type === 'SELECT' || type === 'ASK') {
      const preference = [
        'application/sparql-results+json',
        'application/sparql-results+xml',
        'text/csv',
        'text/tab-separated-values',
      ];

      for (const format of preference) {
        if (formats.includes(format)) {
          return format;
        }
      }
    }

    // Preference order for CONSTRUCT/DESCRIBE
    const preference = [
      'text/turtle',
      'application/rdf+xml',
      'application/ld+json',
      'application/n-triples',
    ];

    for (const format of preference) {
      if (formats.includes(format)) {
        return format;
      }
    }

    return formats[0] || 'application/sparql-results+json';
  }

  function getFormatLabel(mimeType: string): string {
    const labels: Record<string, string> = {
      'application/sparql-results+json': 'JSON',
      'application/sparql-results+xml': 'XML',
      'text/csv': 'CSV',
      'text/tab-separated-values': 'TSV',
      'text/turtle': 'Turtle',
      'application/rdf+xml': 'RDF/XML',
      'application/n-triples': 'N-Triples',
      'application/ld+json': 'JSON-LD',
    };

    return labels[mimeType] || mimeType;
  }

  function getFormatDescription(mimeType: string): string {
    const descriptions: Record<string, string> = {
      'application/sparql-results+json': 'SPARQL JSON Results - Best for web applications',
      'application/sparql-results+xml': 'SPARQL XML Results - Standard format',
      'text/csv': 'Comma-Separated Values - Easy to import in Excel',
      'text/tab-separated-values': 'Tab-Separated Values - Alternative to CSV',
      'text/turtle': 'Turtle - Human-readable RDF',
      'application/rdf+xml': 'RDF/XML - Standard RDF format',
      'application/n-triples': 'N-Triples - Simple line-based RDF',
      'application/ld+json': 'JSON-LD - JSON-based RDF',
    };

    return descriptions[mimeType] || '';
  }
</script>

<div class="format-selector">
  <Select
    labelText="Result Format"
    bind:selected={selectedFormat}
    disabled={availableFormats.length === 0}
  >
    {#each availableFormats as format}
      <SelectItem value={format} text={getFormatLabel(format)} />
    {/each}
  </Select>

  {#if !serviceDesc}
    <p class="helper-text">
      Showing default formats (service description not available)
    </p>
  {/if}

  {#if selectedFormat}
    <div class="format-info">
      <Tag type="blue" size="sm">{getFormatLabel(selectedFormat)}</Tag>
      <p class="format-description">
        {getFormatDescription(selectedFormat)}
      </p>
    </div>
  {/if}
</div>

<style>
  .format-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .helper-text {
    font-size: 0.875rem;
    color: var(--cds-text-secondary);
    font-style: italic;
  }

  .format-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--cds-layer-01);
    border-radius: 4px;
  }

  .format-description {
    font-size: 0.875rem;
    color: var(--cds-text-secondary);
    margin: 0;
  }
</style>
```

### Query Type Detection

```typescript
// src/lib/utils/queryAnalysis.ts

export type QueryType = 'SELECT' | 'ASK' | 'CONSTRUCT' | 'DESCRIBE';

/**
 * Detect SPARQL query type from query string
 */
export function detectQueryType(query: string): QueryType {
  const normalizedQuery = query.trim().toUpperCase();

  if (normalizedQuery.startsWith('SELECT')) {
    return 'SELECT';
  } else if (normalizedQuery.startsWith('ASK')) {
    return 'ASK';
  } else if (normalizedQuery.startsWith('CONSTRUCT')) {
    return 'CONSTRUCT';
  } else if (normalizedQuery.startsWith('DESCRIBE')) {
    return 'DESCRIBE';
  }

  // Default to SELECT if cannot determine
  return 'SELECT';
}

/**
 * Get default formats for query type (when service description unavailable)
 */
export function getDefaultFormats(queryType: QueryType): string[] {
  if (queryType === 'SELECT' || queryType === 'ASK') {
    return [
      'application/sparql-results+json',
      'application/sparql-results+xml',
      'text/csv',
      'text/tab-separated-values',
    ];
  } else {
    return [
      'text/turtle',
      'application/rdf+xml',
      'application/ld+json',
      'application/n-triples',
    ];
  }
}
```

### Content Negotiation

```typescript
// src/lib/services/sparqlService.ts (extend existing)

interface QueryOptions {
  endpoint: string;
  query: string;
  acceptFormat?: string; // MIME type from format selector
  timeout?: number;
}

export async function executeQuery(options: QueryOptions): Promise<QueryResults> {
  const { endpoint, query, acceptFormat, timeout } = options;

  // Build Accept header
  const accept = acceptFormat || 'application/sparql-results+json';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': accept,
    },
    body: new URLSearchParams({ query }),
    signal: timeout ? AbortSignal.timeout(timeout) : undefined,
  });

  if (!response.ok) {
    // Check if format negotiation failed
    if (response.status === 406) {
      throw new Error(
        `Endpoint does not support requested format: ${accept}. ` +
        `Try a different format or check endpoint capabilities.`
      );
    }

    throw new Error(`Query failed: ${response.statusText}`);
  }

  // Parse response based on Content-Type
  const contentType = response.headers.get('Content-Type') || '';
  return parseQueryResults(await response.text(), contentType);
}
```

### Format Validation

```typescript
// src/lib/services/formatValidator.ts

/**
 * Validate that requested format is supported by endpoint
 */
export function validateFormat(
  requestedFormat: string,
  serviceDesc: ServiceDescription | null
): { valid: boolean; message?: string; suggestedFormat?: string } {
  // If no service description, assume format is valid
  if (!serviceDesc) {
    return { valid: true };
  }

  // Check if format is in supported list
  const supported = serviceDesc.resultFormats.includes(requestedFormat);

  if (supported) {
    return { valid: true };
  }

  // Find best alternative format
  const queryType = detectQueryType(/* current query */);
  const availableFormats = getAvailableFormats(serviceDesc, queryType);
  const suggestedFormat = availableFormats[0];

  return {
    valid: false,
    message: `Format ${requestedFormat} not supported by this endpoint`,
    suggestedFormat,
  };
}
```

### Format Auto-Fallback

```typescript
// src/lib/stores/resultsStore.ts (extend existing)

export const resultsStore = createResultsStore({
  // ... existing state

  /**
   * Execute query with automatic format fallback
   */
  async executeQueryWithFallback(
    endpoint: string,
    query: string,
    preferredFormat: string
  ) {
    const serviceDesc = serviceDescriptionStore.getForEndpoint(endpoint);

    // Try preferred format first
    try {
      return await executeQuery({ endpoint, query, acceptFormat: preferredFormat });
    } catch (error) {
      if (error.status === 406) {
        // Format not accepted, try fallback
        const fallbackFormat = getBestFormat(
          serviceDesc?.resultFormats || [],
          detectQueryType(query)
        );

        console.warn(
          `Format ${preferredFormat} not accepted, falling back to ${fallbackFormat}`
        );

        return await executeQuery({ endpoint, query, acceptFormat: fallbackFormat });
      }

      throw error;
    }
  },
});
```

### Format Preference Storage

```typescript
// src/lib/stores/settingsStore.ts (extend existing)

interface FormatPreferences {
  select: string; // Preferred format for SELECT queries
  ask: string;    // Preferred format for ASK queries
  construct: string; // Preferred format for CONSTRUCT queries
  describe: string;  // Preferred format for DESCRIBE queries
}

export const settingsStore = createSettingsStore({
  // ... existing settings

  formatPreferences: {
    select: 'application/sparql-results+json',
    ask: 'application/sparql-results+json',
    construct: 'text/turtle',
    describe: 'text/turtle',
  },
});
```

## Implementation Steps

1. **Create Query Type Detection**
   - Implement `detectQueryType()` utility
   - Add unit tests for various query formats
   - Handle edge cases (comments, prefixes, base declarations)

2. **Create Format Utilities**
   - Implement format label/description mappings
   - Implement `getAvailableFormats()` filtering
   - Implement `getBestFormat()` selection logic
   - Add unit tests for format utilities

3. **Create Format Selector Component**
   - Implement `ResultFormatSelector.svelte`
   - Connect to service description store
   - Add reactive format selection based on query type
   - Add format descriptions and tooltips

4. **Extend SPARQL Service**
   - Update `executeQuery()` to accept format parameter
   - Implement content negotiation (Accept header)
   - Handle 406 Not Acceptable responses
   - Add format fallback logic

5. **Create Format Validator**
   - Implement `validateFormat()` function
   - Suggest alternative formats
   - Add validation warnings in UI

6. **Integrate with UI**
   - Add format selector to query interface
   - Show format validation messages
   - Update results display based on format
   - Store format preferences in settings

7. **Testing**
   - Unit tests for query type detection
   - Unit tests for format selection logic
   - Integration tests for format selector component
   - Integration tests for content negotiation
   - E2E tests for format switching workflow
   - Test fallback behavior with mock 406 responses

## Acceptance Criteria

- ✅ Format selector only shows formats supported by endpoint
- ✅ Formats filtered by query type (SELECT/ASK vs CONSTRUCT/DESCRIBE)
- ✅ Auto-selects best format when formats change
- ✅ Query execution uses selected format in Accept header
- ✅ Handles 406 Not Acceptable with automatic fallback
- ✅ Format preferences saved per query type
- ✅ Format descriptions shown in UI
- ✅ Graceful handling when service description unavailable (shows defaults)
- ✅ Validation warnings when unsupported format selected
- ✅ Format switches when query type changes (SELECT → CONSTRUCT)
- ✅ Carbon Design System styling applied
- ✅ All tests pass (`npm test`)
- ✅ Build succeeds with no warnings (`npm run build`)
- ✅ E2E tests verify format selection (`npm run test:e2e:storybook`)

## User Experience

**Scenario 1: Format Auto-Selection**
1. User connects to endpoint with service description
2. Format selector shows: JSON, XML, CSV (TSV not supported)
3. JSON auto-selected as best format
4. User writes CONSTRUCT query
5. Format selector switches to: Turtle, RDF/XML, N-Triples
6. Turtle auto-selected

**Scenario 2: Fallback Handling**
1. User selects TSV format (from preferences)
2. Endpoint doesn't support TSV (service description shows JSON, XML, CSV)
3. Format selector shows warning: "TSV not supported, using CSV"
4. Query executes with CSV format automatically

**Scenario 3: No Service Description**
1. User connects to endpoint without service description
2. Format selector shows all standard formats with note:
   "Showing default formats (service description not available)"
3. User selects XML
4. If endpoint returns 406, automatic fallback to JSON with notification

## Dependencies

- Task 51 (Service Description Core) must be completed first
- Existing `sparqlService.ts` (to extend)
- Carbon Components Svelte (already integrated)

## Future Enhancements

- Format preview (show sample output before executing)
- Custom format registration (user-defined formats)
- Format conversion on client side (JSON → CSV, etc.)
- Format preference per endpoint (remember per-endpoint choices)
- Show format file size estimates
- Support for custom media type parameters (e.g., charset)

## References

- [SPARQL 1.1 Service Description - Result Formats](https://www.w3.org/TR/sparql11-service-description/#sd-resultFormat)
- [SPARQL 1.1 Protocol - Content Negotiation](https://www.w3.org/TR/sparql11-protocol/#query-success)
- [SPARQL 1.1 Results Formats](https://www.w3.org/TR/sparql11-results-json/)
- [HTTP Content Negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation)
