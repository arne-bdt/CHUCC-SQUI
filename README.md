# SQUI - SPARQL Query UI Web Component

A modern, full-featured SPARQL query interface built with Svelte 5 and IBM Carbon Design System. Inspired by YASGUI, SQUI provides a powerful and accessible web component for executing SPARQL queries against any SPARQL 1.2 compatible endpoint.

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-orange.svg)](https://svelte.dev/)

## Features

### 🎯 Core Functionality
- **SPARQL 1.2 Protocol Support** - Full compliance with SPARQL 1.2 query protocol
- **Multiple Query Types** - SELECT, ASK, CONSTRUCT, DESCRIBE
- **Smart Editor** - CodeMirror 6 with syntax highlighting and autocomplete
- **Results Display** - High-performance table view with virtual scrolling (10,000+ rows)
- **Multiple Tabs** - Manage multiple queries simultaneously
- **Multiple Formats** - JSON and XML in-app display with syntax highlighting; all formats (CSV, TSV, Turtle, JSON-LD, N-Triples, RDF/XML) viewable as text and available for download

### 🎨 User Experience
- **Carbon Design System** - Professional UI with 4 theme options (White, G10, G90, G100)
- **Prefix Management** - Automatic IRI abbreviation and prefix.cc integration
- **Keyboard Shortcuts** - Ctrl+Enter to execute, comprehensive keyboard navigation
- **Responsive Design** - Works on desktop and tablet
- **Accessibility** - WCAG 2.1 AA target with comprehensive ARIA support

### ⚡ Performance
- **Virtual Scrolling** - Handle massive result sets efficiently
- **Code Splitting** - Optimized bundle size (<500KB gzipped)
- **Progressive Loading** - Chunked data fetching for large results

### 🔧 Developer Experience
- **TypeScript First** - Full type definitions included
- **Framework Agnostic** - Use with any framework or vanilla JS
- **Configurable** - Extensive configuration options
- **Extensible** - Export stores and services for custom integrations

## Installation

> **Note**: This package is currently in pre-release (v0.1.0). The API may change before the 1.0 release.

```bash
npm install sparql-query-ui
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install svelte carbon-components-svelte carbon-icons-svelte
```

## Quick Start

### Svelte

```svelte
<script>
  import { SparqlQueryUI } from 'sparql-query-ui';
</script>

<SparqlQueryUI
  config={{
    endpoint: {
      url: 'https://dbpedia.org/sparql'
    }
  }}
/>
```

### React

```jsx
import { SparqlQueryUI } from 'sparql-query-ui';

function App() {
  return (
    <SparqlQueryUI
      config={{
        endpoint: {
          url: 'https://query.wikidata.org/sparql'
        },
        theme: {
          theme: 'g90'
        }
      }}
    />
  );
}
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/carbon-components-svelte/css/all.css">
</head>
<body>
  <div id="squi"></div>

  <script type="module">
    import { SparqlQueryUI } from 'sparql-query-ui';

    new SparqlQueryUI({
      target: document.getElementById('squi'),
      props: {
        config: {
          endpoint: {
            url: 'https://dbpedia.org/sparql'
          }
        }
      }
    });
  </script>
</body>
</html>
```

## Configuration

### Complete Configuration Example

```typescript
import type { SquiConfig } from 'sparql-query-ui';

const config: SquiConfig = {
  // Endpoint configuration
  endpoint: {
    url: 'https://dbpedia.org/sparql',
    catalogue: [
      {
        name: 'DBpedia',
        url: 'https://dbpedia.org/sparql',
        description: 'DBpedia SPARQL endpoint'
      },
      {
        name: 'Wikidata',
        url: 'https://query.wikidata.org/sparql',
        description: 'Wikidata Query Service'
      }
    ],
    hideSelector: false
  },

  // Prefix configuration
  prefixes: {
    default: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
      xsd: 'http://www.w3.org/2001/XMLSchema#'
    }
  },

  // Query template configuration
  templates: {
    default: \`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object .
}
LIMIT 10\`
  },

  // Theme configuration
  theme: {
    theme: 'g10' // 'white' | 'g10' | 'g90' | 'g100'
  },

  // Feature flags
  features: {
    enableTabs: true,
    enableFilters: true,
    enableDownloads: true,
    enableSharing: false,
    enableHistory: false
  },

  // Limits configuration
  limits: {
    maxRows: 100000,
    chunkSize: 1000,
    timeout: 30000
  },

  // Instance ID for multiple instances on same page
  instanceId: 'my-sparql-ui',

  // Disable localStorage persistence
  disablePersistence: false
};
```

### Configuration Options

#### `endpoint` (EndpointConfig)
- `url` (string): Default SPARQL endpoint URL
- `catalogue` (Endpoint[]): List of known endpoints for selection
- `hideSelector` (boolean): Hide the endpoint selector UI

#### `prefixes` (PrefixConfig)
- `default` (Record<string, string>): Default prefix declarations
- `discoveryHook` (function): Custom function to discover prefixes from endpoint

#### `templates` (TemplateConfig)
- `default` (string): Default query template for new tabs
- `custom` (QueryTemplate[]): Custom query templates

#### `theme` (ThemeConfig)
- `theme` (CarbonTheme): Carbon theme - `'white'`, `'g10'`, `'g90'`, or `'g100'`

#### `features` (FeatureFlags)
- `enableTabs` (boolean): Enable multiple query tabs
- `enableFilters` (boolean): Enable result filtering
- `enableDownloads` (boolean): Enable result downloads
- `enableSharing` (boolean): Enable query sharing (future)
- `enableHistory` (boolean): Enable query history (future)

#### `limits` (LimitsConfig)
- `maxRows` (number): Maximum result rows to display (default: 100000)
- `chunkSize` (number): Chunk size for progressive loading (default: 1000)
- `timeout` (number): Query execution timeout in ms (default: 30000)

## Advanced Usage

### Accessing Stores

For advanced integrations, you can access the internal stores:

```typescript
import {
  queryStore,
  resultsStore,
  endpointCatalogue,
  defaultEndpoint,
  tabStore
} from 'sparql-query-ui';

// Subscribe to query state changes
queryStore.subscribe(state => {
  console.log('Query state:', state);
});

// Subscribe to results
resultsStore.subscribe(state => {
  console.log('Results:', state);
});

// Access endpoint catalogue
endpointCatalogue.subscribe(catalogue => {
  console.log('Available endpoints:', catalogue);
});
```

### Using Services Directly

```typescript
import {
  sparqlService,
  prefixService,
  queryExecutionService,
  templateService
} from 'sparql-query-ui';

// Execute a query programmatically
const result = await sparqlService.executeQuery(
  'SELECT * WHERE { ?s ?p ?o } LIMIT 10',
  { endpoint: 'https://dbpedia.org/sparql' }
);

// Abbreviate an IRI
const abbreviated = prefixService.abbreviateIRI(
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
);
// Returns: 'rdf:type'

// Get default query templates
const templates = templateService.getDefaultTemplates();
```

## TypeScript Support

Full TypeScript definitions are included. Import types as needed:

```typescript
import type {
  SquiConfig,
  QueryType,
  ResultFormat,
  SparqlJsonResults,
  SparqlBinding,
  SparqlTerm,
  QueryState,
  ResultsState,
  Tab
} from 'sparql-query-ui';
```

## Keyboard Shortcuts

- **Ctrl+Enter** (Cmd+Enter on Mac): Execute query
- **Ctrl+Space**: Trigger autocomplete
- **Ctrl+F**: Find in editor
- **Ctrl+H**: Find and replace
- **Tab**: Indent / Next field
- **Shift+Tab**: Dedent / Previous field
- **Escape**: Close modals/dropdowns

## Examples

### Fixed Endpoint

```svelte
<SparqlQueryUI
  config={{
    endpoint: {
      url: 'https://dbpedia.org/sparql',
      hideSelector: true
    }
  }}
/>
```

### Custom Prefixes

```svelte
<SparqlQueryUI
  config={{
    prefixes: {
      default: {
        dbo: 'http://dbpedia.org/ontology/',
        dbr: 'http://dbpedia.org/resource/',
        foaf: 'http://xmlns.com/foaf/0.1/'
      }
    }
  }}
/>
```

### Dark Theme

```svelte
<SparqlQueryUI
  config={{
    theme: {
      theme: 'g100'
    }
  }}
/>
```

### Multiple Instances

```svelte
<SparqlQueryUI
  config={{
    instanceId: 'instance-1',
    endpoint: { url: 'https://dbpedia.org/sparql' }
  }}
/>

<SparqlQueryUI
  config={{
    instanceId: 'instance-2',
    endpoint: { url: 'https://query.wikidata.org/sparql' }
  }}
/>
```

## Current Limitations

While SQUI provides comprehensive SPARQL query functionality, please note the following current limitations:

- **Result Formats**: Table view is available for JSON results only. Other formats (XML, CSV, TSV, Turtle, JSON-LD, N-Triples, RDF/XML) are viewable as raw text and can be downloaded.
- **Package Status**: This package is in pre-release (v0.1.0). The API may change before the 1.0 release.
- **SPARQL UPDATE**: UPDATE queries are not yet supported (coming soon).

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e:storybook

# Build package
npm run package

# Build Storybook
npm run build-storybook

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Architecture

SQUI is built with:

- **Svelte 5** - Modern reactive framework with runes
- **CodeMirror 6** - Extensible code editor
- **IBM Carbon Design System** - Enterprise-grade UI components
- **SVAR DataGrid** - High-performance virtualized table
- **TypeScript** - Type-safe development
- **Vitest** - Fast unit testing
- **Playwright** - Reliable E2E testing

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.

## Credits

Inspired by [YASGUI](https://yasgui.triply.cc/) - the original SPARQL GUI by Triply.

## Support

- 📖 [Documentation](https://github.com/yourusername/sparql-query-ui/wiki)
- 🐛 [Issue Tracker](https://github.com/yourusername/sparql-query-ui/issues)
- 💬 [Discussions](https://github.com/yourusername/sparql-query-ui/discussions)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
