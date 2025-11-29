# SQUI API Reference

This document provides comprehensive API documentation for SQUI (SPARQL Query UI) components, services, and stores.

## Table of Contents

- [Components](#components)
  - [SparqlQueryUI](#sparqlqueryui)
- [Services](#services)
  - [sparqlService](#sparqlservice)
  - [prefixService](#prefixservice)
  - [templateService](#templateservice)
- [Stores](#stores)
  - [queryStore](#querystore)
  - [resultsStore](#resultsstore)
  - [tabStore](#tabstore)
  - [serviceDescriptionStore](#servicedescriptionstore)
  - [settingsStore](#settingsstore)
  - [themeStore](#themestore)
  - [endpointStore](#endpointstore)
- [Types](#types)
- [Integration Examples](#integration-examples)

---

## Components

### SparqlQueryUI

Main component providing a complete SPARQL query interface.

#### Import

```typescript
import { SparqlQueryUI } from 'sparql-query-ui';
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `config` | `SquiConfig` | No | `{}` | Configuration object for customizing behavior |
| `class` | `string` | No | `''` | Additional CSS class for styling |

#### Configuration

```typescript
interface SquiConfig {
  endpoint?: EndpointConfig;     // Endpoint settings
  prefixes?: PrefixConfig;       // Prefix configuration
  templates?: TemplateConfig;    // Query templates
  theme?: ThemeConfig;           // Theme settings
  localization?: LocalizationConfig;  // i18n settings
  features?: FeatureFlags;       // Feature toggles
  limits?: LimitsConfig;         // Execution limits
  instanceId?: string;           // Unique ID for localStorage isolation
  disablePersistence?: boolean;  // Disable localStorage (default: false)
}
```

#### Endpoint Configuration

```typescript
interface EndpointConfig {
  url?: string;              // Default endpoint URL
  catalogue?: Endpoint[];    // List of known endpoints
  hideSelector?: boolean;    // Hide the endpoint dropdown
}

interface Endpoint {
  url: string;         // Endpoint URL (required)
  name: string;        // Display name
  description?: string; // Optional description
}
```

#### Prefix Configuration

```typescript
interface PrefixConfig {
  default?: Record<string, string>;  // Default prefixes
  discoveryHook?: (endpoint: string) => Promise<Record<string, string>>;
  enablePrefixLookup?: boolean;      // Enable prefix.cc lookup (default: true)
}
```

#### Feature Flags

```typescript
interface FeatureFlags {
  enableTabs?: boolean;      // Multiple query tabs (default: true)
  enableFilters?: boolean;   // Result filtering
  enableDownloads?: boolean; // Result downloads (default: true)
  enableSharing?: boolean;   // Query sharing
  enableHistory?: boolean;   // Query history
}
```

#### Limits Configuration

```typescript
interface LimitsConfig {
  maxRows?: number;    // Max result rows to display (default: 10000)
  chunkSize?: number;  // Progressive loading chunk size (default: 1000)
  timeout?: number;    // Query timeout in ms (default: 60000)
}
```

#### Usage Examples

**Basic Usage:**

```svelte
<script>
  import { SparqlQueryUI } from 'sparql-query-ui';
</script>

<SparqlQueryUI />
```

**With Configuration:**

```svelte
<script>
  import { SparqlQueryUI } from 'sparql-query-ui';

  const config = {
    endpoint: {
      url: 'https://dbpedia.org/sparql',
      catalogue: [
        { url: 'https://dbpedia.org/sparql', name: 'DBpedia' },
        { url: 'https://query.wikidata.org/sparql', name: 'Wikidata' }
      ]
    },
    theme: { theme: 'g90' },  // Dark theme
    limits: {
      maxRows: 5000,
      timeout: 30000
    }
  };
</script>

<SparqlQueryUI {config} />
```

**With Custom Prefixes:**

```svelte
<script>
  import { SparqlQueryUI } from 'sparql-query-ui';

  const config = {
    prefixes: {
      default: {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        ex: 'http://example.org/'
      },
      enablePrefixLookup: false  // Disable external lookups
    }
  };
</script>

<SparqlQueryUI {config} />
```

**Multiple Instances:**

```svelte
<script>
  import { SparqlQueryUI } from 'sparql-query-ui';
</script>

<!-- Each instance has isolated state -->
<SparqlQueryUI config={{ instanceId: 'editor-1' }} />
<SparqlQueryUI config={{ instanceId: 'editor-2' }} />
```

---

## Services

### sparqlService

Execute SPARQL queries against endpoints with SPARQL 1.2 Protocol compliance.

#### Import

```typescript
import { sparqlService } from 'sparql-query-ui';
```

#### Methods

##### `executeQuery(options: ExtendedQueryOptions): Promise<QueryResult>`

Execute a SPARQL query with automatic method selection (GET/POST).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.endpoint` | `string` | Yes | SPARQL endpoint URL |
| `options.query` | `string` | Yes | SPARQL query text |
| `options.format` | `ResultFormat` | No | Result format (default: `'json'`) |
| `options.method` | `'GET' \| 'POST'` | No | HTTP method (auto-selected if not specified) |
| `options.timeout` | `number` | No | Timeout in ms (default: 60000) |
| `options.headers` | `Record<string, string>` | No | Custom HTTP headers |
| `options.signal` | `AbortSignal` | No | Cancellation signal |
| `options.onProgress` | `(progress: ProgressState) => void` | No | Progress callback |

**Returns:**

```typescript
interface QueryResult {
  raw: string;                        // Raw response text
  data: SparqlJsonResults | string;   // Parsed data
  contentType: string;                // Response Content-Type
  status: number;                     // HTTP status code
  headers: Record<string, string>;    // Response headers
  executionTime: number;              // Execution time in ms
}
```

**Throws:**

| Error Type | Description |
|------------|-------------|
| `network` | Network connection failure |
| `cors` | CORS policy violation |
| `timeout` | Request timeout or cancellation |
| `http` | HTTP error (4xx/5xx status) |
| `sparql` | SPARQL syntax error |
| `parse` | Response parsing error |

**Example:**

```typescript
import { sparqlService } from 'sparql-query-ui';

try {
  const result = await sparqlService.executeQuery({
    endpoint: 'https://dbpedia.org/sparql',
    query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
    format: 'json',
    timeout: 30000
  });

  console.log('Results:', result.data);
  console.log('Execution time:', result.executionTime, 'ms');
} catch (error) {
  if (error.type === 'cors') {
    console.error('CORS error - use proxy or contact endpoint admin');
  } else if (error.type === 'sparql') {
    console.error('SPARQL syntax error:', error.details);
  } else {
    console.error('Query failed:', error.message);
  }
}
```

**With Progress Tracking:**

```typescript
const result = await sparqlService.executeQuery({
  endpoint: 'https://dbpedia.org/sparql',
  query: largeQuery,
  onProgress: (progress) => {
    switch (progress.phase) {
      case 'executing':
        console.log('Sending query...');
        break;
      case 'downloading':
        const pct = progress.totalBytes
          ? Math.round(progress.bytesReceived / progress.totalBytes * 100)
          : '?';
        console.log(`Downloading: ${pct}%`);
        break;
      case 'parsing':
        console.log('Parsing results...');
        break;
      case 'rendering':
        console.log('Rendering...');
        break;
    }
  }
});
```

##### `cancelQuery(): void`

Cancel an ongoing query execution.

```typescript
// Start query
const queryPromise = sparqlService.executeQuery({ endpoint, query });

// Cancel after 5 seconds
setTimeout(() => {
  sparqlService.cancelQuery();
}, 5000);
```

---

### prefixService

Manage SPARQL namespace prefixes with common RDF prefixes and custom additions.

#### Import

```typescript
import { prefixService } from 'sparql-query-ui';
```

#### Methods

##### `getCommonPrefixes(): Record<string, string>`

Get all common RDF prefixes (rdf, rdfs, owl, xsd, foaf, skos, etc.).

```typescript
const prefixes = prefixService.getCommonPrefixes();
// { rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: '...', ... }
```

##### `addCustomPrefix(prefix: string, uri: string): void`

Add a custom prefix.

```typescript
prefixService.addCustomPrefix('ex', 'http://example.org/');
```

##### `abbreviateIRI(iri: string, prefixes?: Record<string, string>): string`

Abbreviate an IRI using known prefixes.

```typescript
const abbreviated = prefixService.abbreviateIRI(
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
);
// Returns: 'rdf:type'
```

##### `expandPrefix(prefixedIRI: string): string | null`

Expand a prefixed IRI to its full form.

```typescript
const full = prefixService.expandPrefix('rdf:type');
// Returns: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
```

##### `parsePrefixesFromQuery(query: string): Record<string, string>`

Extract PREFIX declarations from a SPARQL query.

```typescript
const query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT * WHERE { ?s foaf:name ?n }';
const prefixes = prefixService.parsePrefixesFromQuery(query);
// { foaf: 'http://xmlns.com/foaf/0.1/' }
```

##### `lookupPrefix(prefix: string): Promise<string | null>`

Look up a prefix via prefix.cc API (if enabled).

```typescript
const uri = await prefixService.lookupPrefix('schema');
// Returns: 'http://schema.org/'
```

---

### templateService

Manage SPARQL query templates.

#### Import

```typescript
import { templateService } from 'sparql-query-ui';
```

#### Methods

##### `getTemplates(): QueryTemplate[]`

Get all available templates.

```typescript
const templates = templateService.getTemplates();
```

##### `getTemplate(name: string): QueryTemplate | undefined`

Get a specific template by name.

```typescript
const template = templateService.getTemplate('default');
console.log(template?.query);
```

##### `addTemplate(template: QueryTemplate): void`

Add a custom template.

```typescript
templateService.addTemplate({
  name: 'Find Labels',
  description: 'Find all labeled resources',
  query: `SELECT ?s ?label WHERE {
  ?s rdfs:label ?label
} LIMIT 100`
});
```

---

## Stores

SQUI uses Svelte stores for state management. All stores provide factory functions for creating isolated instances.

### queryStore

Manages SPARQL query state including text, endpoint, prefixes, and query type.

#### Import

```typescript
import { createQueryStore, queryStore } from 'sparql-query-ui';
```

#### Factory Function

```typescript
const queryStore = createQueryStore();
```

#### State Shape

```typescript
interface QueryState {
  text: string;                      // Query text
  endpoint: string;                  // Endpoint URL
  prefixes: Record<string, string>;  // PREFIX declarations
  type: QueryType | undefined;       // Query type (SELECT, ASK, etc.)
}
```

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `subscribe` | `(callback: (state: QueryState) => void) => () => void` | Subscribe to state changes |
| `setText` | `(text: string) => void` | Set query text |
| `setEndpoint` | `(endpoint: string) => void` | Set endpoint URL |
| `setPrefixes` | `(prefixes: Record<string, string>) => void` | Set all prefixes |
| `updatePrefix` | `(prefix: string, uri: string) => void` | Add/update a prefix |
| `removePrefix` | `(prefix: string) => void` | Remove a prefix |
| `setType` | `(type: QueryType \| undefined) => void` | Set query type |
| `setState` | `(newState: Partial<QueryState>) => void` | Update multiple fields |
| `reset` | `() => void` | Reset to initial state |

#### Usage

```typescript
import { createQueryStore } from 'sparql-query-ui';

const queryStore = createQueryStore();

// Subscribe to changes
const unsubscribe = queryStore.subscribe((state) => {
  console.log('Query:', state.text);
  console.log('Endpoint:', state.endpoint);
});

// Update state
queryStore.setText('SELECT * WHERE { ?s ?p ?o } LIMIT 10');
queryStore.setEndpoint('https://dbpedia.org/sparql');
queryStore.updatePrefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');

// Clean up
unsubscribe();
```

---

### resultsStore

Manages query results, loading state, errors, and execution progress.

#### Import

```typescript
import { createResultsStore, resultsStore } from 'sparql-query-ui';
```

#### State Shape

```typescript
interface ResultsState {
  data: SparqlJsonResults | null;  // Query results
  format: ResultFormat;            // Result format
  view: 'table' | 'raw' | 'graph'; // Current view mode
  loading: boolean;                // Loading state
  error: string | QueryError | null; // Error state
  executionTime?: number;          // Execution time in ms
  prefixes?: Record<string, string>; // Prefixes for IRI abbreviation
  rawData?: string;                // Raw response text
  contentType?: string;            // Response content type
  progress?: ProgressState;        // Execution progress
  chunkedLoading?: ChunkedLoadingState; // Infinite scroll state
}
```

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `subscribe` | `(callback) => () => void` | Subscribe to state changes |
| `setData` | `(data, executionTime?, prefixes?) => void` | Set query results |
| `setLoading` | `(loading: boolean) => void` | Set loading state |
| `setError` | `(error: string \| QueryError) => void` | Set error state |
| `clearError` | `() => void` | Clear error |
| `setView` | `(view: 'table' \| 'raw' \| 'graph') => void` | Set view mode |
| `setFormat` | `(format: ResultFormat) => void` | Set result format |
| `executeQuery` | `(options: ExtendedQueryOptions) => Promise<void>` | Execute query |
| `cancelQuery` | `() => void` | Cancel ongoing query |
| `enableChunkedLoading` | `(chunkSize?: number) => void` | Enable infinite scroll |
| `loadNextChunk` | `(query, endpoint) => Promise<void>` | Load next chunk |
| `setProgress` | `(progress: ProgressState) => void` | Set progress state |
| `reset` | `() => void` | Reset to initial state |

#### Usage

```typescript
import { createResultsStore } from 'sparql-query-ui';

const resultsStore = createResultsStore();

// Subscribe to changes
const unsubscribe = resultsStore.subscribe((state) => {
  if (state.loading) {
    console.log('Query executing...');
  } else if (state.error) {
    console.log('Error:', state.error);
  } else if (state.data) {
    console.log('Results:', state.data.results?.bindings.length, 'rows');
  }
});

// Execute query
await resultsStore.executeQuery({
  endpoint: 'https://dbpedia.org/sparql',
  query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10'
});

// Clean up
unsubscribe();
```

---

### tabStore

Manages multiple query tabs with isolated state per tab.

#### Import

```typescript
import { createTabStore } from 'sparql-query-ui';
```

#### Factory Function

```typescript
const tabStore = createTabStore(instanceId?: string);
```

#### State Shape

```typescript
interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
}

interface Tab {
  id: string;
  name: string;
  query: QueryState;
  results: ResultsState;
  lastModified: number;
}
```

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `subscribe` | `(callback) => () => void` | Subscribe to state changes |
| `addTab` | `(name?: string) => string` | Add new tab, returns tab ID |
| `removeTab` | `(id: string) => void` | Remove a tab |
| `switchTab` | `(id: string) => void` | Switch to a tab |
| `renameTab` | `(id: string, name: string) => void` | Rename a tab |
| `updateTabQuery` | `(id: string, query: Partial<QueryState>) => void` | Update tab query |
| `updateTabResults` | `(id: string, results: Partial<ResultsState>) => void` | Update tab results |
| `getActiveTab` | `() => Tab \| undefined` | Get current active tab |

#### Usage

```typescript
import { createTabStore } from 'sparql-query-ui';

const tabStore = createTabStore('my-instance');

// Add a new tab
const tabId = tabStore.addTab('My Query');

// Update tab query
tabStore.updateTabQuery(tabId, {
  text: 'SELECT * WHERE { ?s ?p ?o }',
  endpoint: 'https://dbpedia.org/sparql'
});

// Switch tabs
tabStore.switchTab(tabId);

// Get active tab
const activeTab = tabStore.getActiveTab();
console.log(activeTab?.name); // 'My Query'
```

---

### serviceDescriptionStore

Manages endpoint service descriptions (capabilities, datasets, functions).

#### Import

```typescript
import { createServiceDescriptionStore } from 'sparql-query-ui';
```

#### State Shape

```typescript
interface ServiceDescriptionState {
  descriptions: Map<string, ServiceDescription>;
  loading: Map<string, boolean>;
  errors: Map<string, string>;
}
```

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `subscribe` | `(callback) => () => void` | Subscribe to state changes |
| `fetchDescription` | `(url: string) => Promise<void>` | Fetch service description |
| `getDescription` | `(url: string) => ServiceDescription \| undefined` | Get cached description |
| `clearCache` | `(url?: string) => void` | Clear cache (all or specific) |

#### ServiceDescription Type

```typescript
interface ServiceDescription {
  endpoint: string;
  supportedLanguages: SPARQLLanguage[];
  features: ServiceFeature[];
  resultFormats: string[];
  inputFormats: string[];
  extensionFunctions: ExtensionFunction[];
  extensionAggregates: ExtensionAggregate[];
  datasets: Dataset;
}
```

---

### settingsStore

Manages user preferences and validation settings.

#### Import

```typescript
import { createSettingsStore } from 'sparql-query-ui';
```

#### State Shape

```typescript
interface Settings {
  maxRows: number;        // Maximum rows to display
  chunkSize: number;      // Chunk size for progressive loading
  timeout: number;        // Query timeout in ms
  warnOnLargeQueries: boolean;
  largeQueryThreshold: number;
  // Additional validation settings...
}
```

---

### themeStore

Manages Carbon Design System theme.

#### Import

```typescript
import { createThemeStore, themeStore } from 'sparql-query-ui';
```

#### State Shape

```typescript
interface ThemeState {
  current: CarbonTheme;  // 'white' | 'g10' | 'g90' | 'g100'
}
```

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `setTheme` | `(theme: CarbonTheme) => void` | Set the theme |
| `toggleTheme` | `() => void` | Toggle between light/dark |

---

### endpointStore

Manages the endpoint catalogue (shared globally).

#### Import

```typescript
import { endpointCatalogue, defaultEndpoint } from 'sparql-query-ui';
```

These are global Svelte stores that can be used directly:

```typescript
import { endpointCatalogue } from 'sparql-query-ui';

// Add endpoints to catalogue
endpointCatalogue.set([
  { url: 'https://dbpedia.org/sparql', name: 'DBpedia' },
  { url: 'https://query.wikidata.org/sparql', name: 'Wikidata' }
]);
```

---

## Types

### Query Types

```typescript
type QueryType = 'SELECT' | 'ASK' | 'CONSTRUCT' | 'DESCRIBE' | 'UPDATE';

type ResultFormat =
  | 'json' | 'xml' | 'csv' | 'tsv'
  | 'turtle' | 'jsonld' | 'ntriples' | 'rdfxml';
```

### SPARQL JSON Results (W3C Standard)

```typescript
interface SparqlJsonResults {
  head: {
    vars: string[];
    link?: string[];
  };
  results?: {
    bindings: SparqlBinding[];
  };
  boolean?: boolean;  // For ASK queries
}

interface SparqlBinding {
  [variable: string]: SparqlTerm;
}

interface SparqlTerm {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  'xml:lang'?: string;
  datatype?: string;
}
```

### Error Types

```typescript
type QueryErrorType =
  | 'network'   // Network failure
  | 'cors'      // CORS policy violation
  | 'timeout'   // Request timeout
  | 'http'      // HTTP error (4xx/5xx)
  | 'sparql'    // SPARQL syntax error
  | 'parse'     // Response parsing error
  | 'unknown';  // Unknown error

interface QueryError {
  message: string;
  type?: QueryErrorType;
  status?: number;
  details?: string;
  originalError?: Error;
}
```

### Progress State

```typescript
interface ProgressState {
  phase: 'executing' | 'downloading' | 'parsing' | 'rendering';
  startTime: number;
  bytesReceived?: number;
  totalBytes?: number;
  downloadSpeed?: number;
  rowsParsed?: number;
  totalRows?: number;
  memoryUsageMB?: number;
}
```

---

## Integration Examples

### React Integration

```jsx
import { useEffect, useRef } from 'react';

function SparqlEditor() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Dynamically import the Svelte component
    import('sparql-query-ui').then(({ SparqlQueryUI }) => {
      const component = new SparqlQueryUI({
        target: containerRef.current,
        props: {
          config: {
            endpoint: {
              url: 'https://dbpedia.org/sparql'
            }
          }
        }
      });

      return () => component.$destroy();
    });
  }, []);

  return <div ref={containerRef} />;
}
```

### Vue Integration

```vue
<template>
  <div ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const container = ref(null);
let component = null;

onMounted(async () => {
  const { SparqlQueryUI } = await import('sparql-query-ui');
  component = new SparqlQueryUI({
    target: container.value,
    props: {
      config: {
        endpoint: { url: 'https://dbpedia.org/sparql' }
      }
    }
  });
});

onUnmounted(() => {
  component?.$destroy();
});
</script>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/sparql-query-ui/dist/style.css">
</head>
<body>
  <div id="sparql-editor"></div>

  <script type="module">
    import { SparqlQueryUI } from 'sparql-query-ui';

    const app = new SparqlQueryUI({
      target: document.getElementById('sparql-editor'),
      props: {
        config: {
          endpoint: {
            url: 'https://dbpedia.org/sparql',
            catalogue: [
              { url: 'https://dbpedia.org/sparql', name: 'DBpedia' },
              { url: 'https://query.wikidata.org/sparql', name: 'Wikidata' }
            ]
          },
          theme: { theme: 'g90' }
        }
      }
    });

    // Cleanup when needed
    // app.$destroy();
  </script>
</body>
</html>
```

### Programmatic Query Execution

```typescript
import { sparqlService, createResultsStore } from 'sparql-query-ui';

// Option 1: Direct service usage
async function executeQuery(endpoint: string, query: string) {
  try {
    const result = await sparqlService.executeQuery({
      endpoint,
      query,
      format: 'json',
      timeout: 30000
    });

    return result.data;
  } catch (error) {
    console.error('Query failed:', error.message);
    throw error;
  }
}

// Option 2: Using results store for state management
const resultsStore = createResultsStore();

resultsStore.subscribe((state) => {
  if (state.loading) {
    console.log('Executing...');
  } else if (state.error) {
    console.log('Error:', state.error);
  } else if (state.data) {
    console.log('Results ready');
  }
});

await resultsStore.executeQuery({
  endpoint: 'https://dbpedia.org/sparql',
  query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 10'
});
```

---

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design and data flow
- [Security Guide](./SECURITY.md) - Security considerations and CSP
- [README](../README.md) - Getting started
