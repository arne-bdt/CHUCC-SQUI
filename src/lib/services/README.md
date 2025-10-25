# Services

Business logic and external communication services.

## Modules

- **sparql.ts** - SPARQL protocol implementation (query execution)
- **parser.ts** - Result parsing (JSON, XML, CSV, TSV)
- **prefixes.ts** - Prefix management and lookup (prefix.cc integration)
- **autocomplete.ts** - Autocompletion logic (keywords, prefixes, IRIs)

## Guidelines

- Pure functions where possible
- Comprehensive error handling
- Unit test coverage >80%
- TypeScript types for all public APIs
