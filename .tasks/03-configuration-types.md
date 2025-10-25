# Task 03: Configuration Types and Component Props

**Phase:** Foundation
**Status:** DONE
**Completed:** 2025-10-25
**Dependencies:** 01
**Estimated Effort:** 2 hours

## Objective

Define comprehensive TypeScript types for component configuration, SPARQL data structures, and establish the public API for the SQUI component.

## Requirements

Per specification sections on Integration (6.1) and throughout:
- Component should accept configuration props
- Type definitions for all SPARQL-related data structures
- Configuration for endpoint, prefixes, themes, localization, etc.
- Well-documented public API

## Implementation Steps

1. Expand `src/lib/types/config.ts`:
   ```typescript
   // Component configuration
   export interface SquiConfig {
     endpoint?: EndpointConfig;
     prefixes?: PrefixConfig;
     theme?: ThemeConfig;
     localization?: LocalizationConfig;
     features?: FeatureFlags;
     limits?: LimitsConfig;
   }

   export interface EndpointConfig {
     url?: string;
     catalogue?: Endpoint[];
     hideSelector?: boolean;
   }

   export interface Endpoint {
     url: string;
     name: string;
     description?: string;
   }

   export interface PrefixConfig {
     default?: Record<string, string>;
     discoveryHook?: (endpoint: string) => Promise<Record<string, string>>;
   }

   export interface ThemeConfig {
     theme?: 'white' | 'g10' | 'g90' | 'g100';
   }

   export interface LocalizationConfig {
     locale?: string;
     strings?: Record<string, string>;
   }

   export interface FeatureFlags {
     enableTabs?: boolean;
     enableFilters?: boolean;
     enableDownloads?: boolean;
   }

   export interface LimitsConfig {
     maxRows?: number;
     chunkSize?: number;
     timeout?: number;
   }
   ```

2. Expand `src/lib/types/sparql.ts`:
   ```typescript
   // SPARQL query types
   export type QueryType = 'SELECT' | 'ASK' | 'CONSTRUCT' | 'DESCRIBE' | 'UPDATE';

   // SPARQL result formats
   export type ResultFormat = 'json' | 'xml' | 'csv' | 'tsv' | 'turtle' | 'jsonld' | 'ntriples' | 'rdfxml';

   // SPARQL JSON Results format
   export interface SparqlJsonResults {
     head: {
       vars: string[];
       link?: string[];
     };
     results: {
       bindings: SparqlBinding[];
     };
     boolean?: boolean; // for ASK queries
   }

   export interface SparqlBinding {
     [variable: string]: SparqlTerm;
   }

   export interface SparqlTerm {
     type: 'uri' | 'literal' | 'bnode';
     value: string;
     'xml:lang'?: string;
     datatype?: string;
   }

   // Query state
   export interface QueryState {
     text: string;
     endpoint: string;
     type?: QueryType;
     prefixes: Record<string, string>;
   }

   // Results state
   export interface ResultsState {
     data: SparqlJsonResults | null;
     format: ResultFormat;
     view: 'table' | 'raw';
     loading: boolean;
     error: string | null;
   }
   ```

3. Create `src/lib/types/index.ts`:
   - Export all types from a central location

4. Update `src/SparqlQueryUI.svelte`:
   - Add props with proper types from SquiConfig
   - Add JSDoc comments for public API
   - Provide sensible defaults

## Acceptance Criteria

- [ ] All configuration types are properly defined
- [ ] SPARQL data structures match W3C SPARQL JSON Results format
- [ ] Component props are typed and documented
- [ ] Default values are provided for all optional configuration
- [ ] Types are exported from a central index file
- [ ] No TypeScript errors

## Testing

1. Create `tests/unit/types/config.test.ts`:
   - Test type assertions for valid configurations
   - Test that invalid configurations are caught by TypeScript

2. Update documentation:
   - Add JSDoc comments to all exported types
   - Document expected values and constraints

## Files to Create/Modify

- `src/lib/types/config.ts` (expand)
- `src/lib/types/sparql.ts` (expand)
- `src/lib/types/index.ts` (create)
- `src/SparqlQueryUI.svelte` (modify - add typed props)
- `tests/unit/types/config.test.ts` (create)

## Commit Message

```
feat: define comprehensive TypeScript types and configuration

- Expand config types with all component options
- Define SPARQL data structures (JSON Results format)
- Add query and results state types
- Export types from central index
- Document public API with JSDoc
- Add type tests
```

## Notes

- Follow W3C SPARQL 1.2 JSON Results format specification
- Use TypeScript 5+ features where appropriate
- All public API should have JSDoc documentation
- Consider using branded types for URLs and other validated strings
