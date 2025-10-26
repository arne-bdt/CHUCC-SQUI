# Task 08: Prefix Management Service

**Phase:** SPARQL Editor
**Status:** COMPLETED
**Dependencies:** 04
**Estimated Effort:** 3-4 hours

## Objective

Implement prefix management service including common prefixes, prefix detection in queries, and integration with prefix.cc for prefix suggestions.

## Requirements

Per specification sections 1.2 and 1.4:
- Manage common default prefixes (rdf, rdfs, owl, xsd, foaf, skos, etc.)
- Parse PREFIX declarations from query text
- Fetch prefix suggestions from prefix.cc
- Extension hook for custom prefix discovery
- Abbreviate IRIs using known prefixes

## Implementation Steps

1. Create `src/lib/services/prefixService.ts`:
   ```typescript
   import type { PrefixConfig } from '../types';

   export const commonPrefixes: Record<string, string> = {
     rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
     rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
     owl: 'http://www.w3.org/2002/07/owl#',
     xsd: 'http://www.w3.org/2001/XMLSchema#',
     foaf: 'http://xmlns.com/foaf/0.1/',
     skos: 'http://www.w3.org/2004/02/skos/core#',
     dc: 'http://purl.org/dc/elements/1.1/',
     dcterms: 'http://purl.org/dc/terms/',
     schema: 'http://schema.org/',
     dbo: 'http://dbpedia.org/ontology/',
     dbr: 'http://dbpedia.org/resource/',
     wdt: 'http://www.wikidata.org/prop/direct/',
     wd: 'http://www.wikidata.org/entity/',
     geo: 'http://www.opengis.net/ont/geosparql#'
   };

   export class PrefixService {
     private customPrefixes: Record<string, string> = {};
     private discoveryHook?: (endpoint: string) => Promise<Record<string, string>>;

     constructor(config?: PrefixConfig) {
       if (config?.default) {
         this.customPrefixes = { ...config.default };
       }
       this.discoveryHook = config?.discoveryHook;
     }

     /**
      * Get all known prefixes (common + custom)
      */
     getAllPrefixes(): Record<string, string> {
       return { ...commonPrefixes, ...this.customPrefixes };
     }

     /**
      * Parse PREFIX declarations from query text
      */
     parsePrefixesFromQuery(queryText: string): Record<string, string> {
       const prefixes: Record<string, string> = {};
       const prefixRegex = /PREFIX\\s+(\\w+):\\s*<([^>]+)>/gi;
       let match;

       while ((match = prefixRegex.exec(queryText)) !== null) {
         prefixes[match[1]] = match[2];
       }

       return prefixes;
     }

     /**
      * Abbreviate IRI using known prefixes
      */
     abbreviateIRI(iri: string, prefixes?: Record<string, string>): string {
       const allPrefixes = prefixes || this.getAllPrefixes();

       for (const [prefix, uri] of Object.entries(allPrefixes)) {
         if (iri.startsWith(uri)) {
           return `${prefix}:${iri.substring(uri.length)}`;
         }
       }

       return iri; // Return full IRI if no prefix matches
     }

     /**
      * Expand abbreviated IRI to full IRI
      */
     expandIRI(abbreviated: string, prefixes?: Record<string, string>): string {
       const allPrefixes = prefixes || this.getAllPrefixes();
       const colonIndex = abbreviated.indexOf(':');

       if (colonIndex === -1) {
         return abbreviated;
       }

       const prefix = abbreviated.substring(0, colonIndex);
       const localPart = abbreviated.substring(colonIndex + 1);
       const uri = allPrefixes[prefix];

       return uri ? `${uri}${localPart}` : abbreviated;
     }

     /**
      * Search for prefix suggestions from prefix.cc
      */
     async searchPrefixes(query: string): Promise<Array<{ prefix: string; uri: string }>> {
       try {
         // Search prefix.cc API
         const response = await fetch(
           `https://prefix.cc/${encodeURIComponent(query)}.file.json`,
           { method: 'GET', headers: { 'Accept': 'application/json' } }
         );

         if (!response.ok) {
           return [];
         }

         const data = await response.json();
         return Object.entries(data).map(([prefix, uri]) => ({
           prefix,
           uri: uri as string
         }));
       } catch (error) {
         console.warn('Failed to fetch prefix suggestions:', error);
         return [];
       }
     }

     /**
      * Discover prefixes from endpoint (if hook provided)
      */
     async discoverPrefixes(endpoint: string): Promise<Record<string, string>> {
       if (!this.discoveryHook) {
         return {};
       }

       try {
         return await this.discoveryHook(endpoint);
       } catch (error) {
         console.warn('Prefix discovery failed:', error);
         return {};
       }
     }

     /**
      * Add custom prefix
      */
     addPrefix(prefix: string, uri: string) {
       this.customPrefixes[prefix] = uri;
     }

     /**
      * Generate PREFIX declarations for query
      */
     generatePrefixDeclarations(prefixes: Record<string, string>): string {
       return Object.entries(prefixes)
         .map(([prefix, uri]) => `PREFIX ${prefix}: <${uri}>`)
         .join('\\n');
     }
   }

   // Singleton instance
   export const prefixService = new PrefixService();
   ```

## Acceptance Criteria

- [x] Common prefixes are predefined
- [x] PREFIX declarations can be parsed from query text
- [x] IRIs can be abbreviated using known prefixes
- [x] Abbreviated IRIs can be expanded to full IRIs
- [x] Prefix search queries prefix.cc
- [x] Custom prefixes can be added
- [x] PREFIX declarations can be generated
- [x] Discovery hook can be configured for custom prefix fetching

## Testing

1. Create `tests/unit/services/prefixService.test.ts`:
   - Test common prefixes are available
   - Test parsing PREFIX declarations from query
   - Test IRI abbreviation with various prefixes
   - Test IRI expansion
   - Test adding custom prefixes
   - Test generating PREFIX declarations
   - Mock prefix.cc API calls and test search
   - Test discovery hook integration

## Files to Create/Modify

- `src/lib/services/prefixService.ts` (create)
- `tests/unit/services/prefixService.test.ts` (create)

## Commit Message

```
feat: implement prefix management service

- Add common RDF prefix definitions
- Implement PREFIX declaration parsing from queries
- Add IRI abbreviation and expansion
- Integrate prefix.cc search API
- Support custom prefix discovery hooks
- Add comprehensive prefix tests
```

## Notes

- prefix.cc API may have rate limits; consider caching results
- For offline/testing, provide fallback to common prefixes only
- Discovery hook allows integrators to fetch prefixes from their specific endpoints (e.g., Fuseki config)
- IRI abbreviation should use longest matching prefix
- Consider adding more common prefixes based on user feedback
