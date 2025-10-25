# SPARQL Query UI (SQUI)

Modern SPARQL query interface built with Svelte 5, inspired by YASGUI.

## Features

- **Syntax-Highlighted Editor**: CodeMirror 6 with SPARQL syntax highlighting
- **Intelligent Autocompletion**: Prefix, IRI, and keyword suggestions
- **High-Performance Results**: SVAR DataGrid with virtual scrolling for 10,000+ rows
- **Multiple Endpoints**: Easy switching between SPARQL endpoints
- **Multiple Formats**: Download results as JSON, CSV, TSV, or raw RDF
- **Beautiful UI**: IBM Carbon Design System with 4 theme support
- **Fully Accessible**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Usage

### Basic Example

```svelte
<script>
  import SparqlQueryUI from './SparqlQueryUI.svelte';
</script>

<SparqlQueryUI 
  endpoint="https://dbpedia.org/sparql"
  theme="g90"
/>
```

### With Configuration

```svelte
<SparqlQueryUI
  endpoint="https://query.wikidata.org/sparql"
  defaultPrefixes={{
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    wd: 'http://www.wikidata.org/entity/',
    wdt: 'http://www.wikidata.org/prop/direct/'
  }}
  showEndpointSelector={true}
  theme="white"
  maxRows={100000}
/>
```

## Technology Stack

- **Framework**: Svelte 5
- **Design System**: IBM Carbon Design System
- **Data Grid**: SVAR Svelte DataGrid v2
- **Code Editor**: CodeMirror 6
- **Build Tool**: Vite
- **Testing**: Vitest, Playwright
- **Protocol**: SPARQL 1.2

## Project Structure

```
src/
├── lib/
│   ├── components/       # Svelte 5 components
│   │   ├── Editor/       # SPARQL editor
│   │   ├── Endpoint/     # Endpoint selector
│   │   ├── Results/      # Results display
│   │   ├── Tabs/         # Query tabs
│   │   └── Toolbar/      # Action buttons
│   ├── stores/           # State management
│   ├── services/         # SPARQL protocol, parsing
│   ├── utils/            # Utilities
│   └── types/            # TypeScript definitions
└── SparqlQueryUI.svelte  # Main component
```

## Development

### Code Quality

- Modular architecture
- TypeScript for type safety
- >80% test coverage target
- JSDoc documentation
- ESLint + Prettier

### Testing

```bash
# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

### Agents

This project includes specialized Claude Code agents for development assistance:

- `/component-dev` - Svelte 5 component development
- `/testing` - Testing guidance
- `/sparql-protocol` - SPARQL protocol help
- `/ui-ux` - Carbon Design & accessibility
- `/datagrid` - DataGrid integration
- `/docs` - Documentation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Documentation

- [CLAUDE.md](.claude/CLAUDE.md) - Comprehensive project documentation
- [Specification PDF](docs/SPARQL%20Query%20UI%20Web%20Component%20Specification.pdf) - Full specification
- [Agent Documentation](.claude/agents/) - Specialized development agents

## Inspiration

This project is inspired by [YASGUI](https://triply.cc/docs/yasgui) (Yet Another SPARQL GUI) and aims to provide a modern, high-performance alternative built with Svelte 5.

## License

Apache License 2.0

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see the agent documentation for development guidelines.

## Acknowledgments

- [YASGUI](https://github.com/TriplyDB/Yasgui) - Inspiration and reference
- [IBM Carbon Design System](https://carbondesignsystem.com/)
- [SVAR DataGrid](https://svar.dev/svelte/datagrid/)
- [CodeMirror 6](https://codemirror.net/)
