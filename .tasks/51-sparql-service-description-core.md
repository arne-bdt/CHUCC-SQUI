# Task 51: SPARQL Service Description - Core Infrastructure

## Overview

Implement core infrastructure to fetch, parse, cache, and manage SPARQL Service Description metadata from endpoints following the [W3C SPARQL 1.1 Service Description specification](https://www.w3.org/TR/sparql11-service-description/).

## Motivation

SPARQL Service Description provides machine-readable metadata about endpoint capabilities, available datasets, supported features, and more. This metadata enables intelligent auto-completion, query validation, and feature detection in SQUI.

## Requirements

### Service Description Discovery

1. **Endpoint Discovery**
   - Send HTTP GET request to SPARQL endpoint URL
   - Parse RDF response (Turtle, RDF/XML, JSON-LD, etc.)
   - Follow `sd:endpoint` property to discover service metadata
   - Handle endpoints that don't support service descriptions gracefully

2. **Metadata Extraction**
   - Parse `sd:Service` resources
   - Extract `sd:supportedLanguage` (SPARQL 1.0/1.1 Query/Update)
   - Extract `sd:feature` (URI dereferencing, union default graph, etc.)
   - Extract `sd:resultFormat` (XML, JSON, CSV, TSV, Turtle, etc.)
   - Extract `sd:inputFormat` (for RDF data loading)
   - Extract `sd:extensionFunction` and `sd:extensionAggregate`
   - Extract `sd:defaultDataset` and `sd:availableGraphs`

3. **Dataset Information**
   - Parse `sd:Dataset` with default and named graphs
   - Extract `sd:defaultGraph` and `sd:namedGraph` resources
   - Parse `sd:Graph` metadata (entailment regime, statistics)
   - Support multiple datasets per service (if applicable)

### Data Structures

```typescript
// src/lib/types/serviceDescription.ts

export interface ServiceDescription {
  endpoint: string;
  supportedLanguages: SPARQLLanguage[];
  features: ServiceFeature[];
  resultFormats: ResultFormat[];
  inputFormats: InputFormat[];
  extensionFunctions: ExtensionFunction[];
  extensionAggregates: ExtensionAggregate[];
  datasets: Dataset[];
  lastFetched: Date;
  available: boolean; // false if endpoint doesn't support service description
}

export enum SPARQLLanguage {
  SPARQL10Query = 'http://www.w3.org/ns/sparql-service-description#SPARQL10Query',
  SPARQL11Query = 'http://www.w3.org/ns/sparql-service-description#SPARQL11Query',
  SPARQL11Update = 'http://www.w3.org/ns/sparql-service-description#SPARQL11Update',
}

export enum ServiceFeature {
  DereferencesURIs = 'http://www.w3.org/ns/sparql-service-description#DereferencesURIs',
  UnionDefaultGraph = 'http://www.w3.org/ns/sparql-service-description#UnionDefaultGraph',
  RequiresDataset = 'http://www.w3.org/ns/sparql-service-description#RequiresDataset',
  EmptyGraphs = 'http://www.w3.org/ns/sparql-service-description#EmptyGraphs',
  BasicFederatedQuery = 'http://www.w3.org/ns/sparql-service-description#BasicFederatedQuery',
}

export interface Dataset {
  uri?: string;
  defaultGraphs: GraphDescription[];
  namedGraphs: NamedGraph[];
}

export interface GraphDescription {
  uri?: string;
  entailmentRegime?: string;
  metadata?: Record<string, unknown>; // Additional voiD/other vocabulary metadata
}

export interface NamedGraph extends GraphDescription {
  name: string; // Graph IRI
}

export interface ExtensionFunction {
  uri: string;
  label?: string;
  comment?: string;
}

export interface ExtensionAggregate extends ExtensionFunction {}

export type ResultFormat = string; // MIME type
export type InputFormat = string; // MIME type
```

### Service Description Service

```typescript
// src/lib/services/serviceDescriptionService.ts

export class ServiceDescriptionService {
  /**
   * Fetch and parse service description from endpoint
   * @param endpointUrl SPARQL endpoint URL
   * @returns Service description or null if not available
   */
  async fetchServiceDescription(endpointUrl: string): Promise<ServiceDescription | null>;

  /**
   * Check if endpoint supports service description
   * Performs lightweight check before full fetch
   */
  async supportsServiceDescription(endpointUrl: string): Promise<boolean>;

  /**
   * Parse RDF service description from response
   * Supports Turtle, RDF/XML, JSON-LD
   */
  parseServiceDescription(rdfData: string, format: string): ServiceDescription;
}
```

### Caching Layer

1. **In-Memory Cache**
   - Cache service descriptions per endpoint
   - Configurable TTL (default: 1 hour)
   - LRU eviction for memory management

2. **LocalStorage Persistence**
   - Persist cached descriptions to localStorage
   - Restore on page load
   - Store last fetch timestamp for expiration

3. **Cache Invalidation**
   - Manual refresh button in UI
   - Auto-refresh on TTL expiration
   - Clear cache on endpoint URL change

### Svelte Store Integration

```typescript
// src/lib/stores/serviceDescriptionStore.ts

interface ServiceDescriptionState {
  descriptions: Map<string, ServiceDescription>;
  loading: boolean;
  error: string | null;
  currentEndpoint: string | null;
}

export const serviceDescriptionStore = createServiceDescriptionStore();

// Actions
serviceDescriptionStore.fetchForEndpoint(url: string);
serviceDescriptionStore.clearCache();
serviceDescriptionStore.refreshCurrent();
```

## Implementation Steps

1. **Create Type Definitions**
   - Define all TypeScript interfaces in `src/lib/types/serviceDescription.ts`
   - Export from `src/lib/types/index.ts`

2. **Implement RDF Parser**
   - Use lightweight RDF parsing library (e.g., `n3.js`, `rdflib.js`)
   - Check license compatibility (must be Apache 2.0 compatible)
   - Parse Turtle, RDF/XML, and JSON-LD formats
   - Extract service description vocabulary terms

3. **Implement Service Description Service**
   - Create `src/lib/services/serviceDescriptionService.ts`
   - Implement fetch with proper error handling
   - Implement parsing logic
   - Add unit tests with mock RDF responses

4. **Implement Caching**
   - Create cache manager with TTL support
   - Implement localStorage persistence
   - Add cache configuration options

5. **Create Svelte Store**
   - Implement reactive store for service descriptions
   - Integrate with endpoint configuration store
   - Add loading/error states

6. **Testing**
   - Unit tests for RDF parsing with real-world examples
   - Unit tests for cache behavior (TTL, eviction)
   - Integration tests with mock SPARQL endpoints
   - Test graceful degradation when service description unavailable

## Acceptance Criteria

- ✅ Service description can be fetched from compliant endpoints
- ✅ RDF parsing supports Turtle, RDF/XML, and JSON-LD
- ✅ All metadata fields extracted correctly (languages, features, formats, graphs)
- ✅ Caching works with configurable TTL
- ✅ LocalStorage persistence survives page reloads
- ✅ Graceful handling of endpoints without service description
- ✅ Svelte store provides reactive access to descriptions
- ✅ All tests pass (`npm test`)
- ✅ Build succeeds with no warnings (`npm run build`)
- ✅ TypeScript strict mode compliance

## Dependencies

- RDF parsing library (e.g., `n3` - MIT license ✅)
- No breaking changes to existing code

## Future Enhancements

- Support for additional RDF formats (N-Triples, N-Quads)
- Integration with voiD vocabulary for dataset statistics
- Support for SPARQL 1.2 Protocol extensions
- Performance monitoring for large service descriptions

## References

- [SPARQL 1.1 Service Description](https://www.w3.org/TR/sparql11-service-description/)
- [Service Description Vocabulary Namespace](http://www.w3.org/ns/sparql-service-description)
- [voiD Vocabulary](https://www.w3.org/TR/void/)
