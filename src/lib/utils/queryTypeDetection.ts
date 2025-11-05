/**
 * Query Type Detection Utilities
 * Detects SPARQL query types and provides default format mappings
 */

import type { QueryType } from '../types';

/**
 * Detect SPARQL query type from query string
 * Handles queries with PREFIX and BASE declarations
 * @param query SPARQL query text
 * @returns Detected query type
 */
export function detectQueryType(query: string): QueryType {
  const normalized = query.trim().toUpperCase();

  // Skip PREFIX and BASE declarations to find the actual query operation
  // Match PREFIX/BASE followed by declarations until we hit the query keyword
  // Handle multiple PREFIX/BASE declarations across multiple lines
  let withoutPrefixes = normalized;

  // Remove all PREFIX and BASE declarations
  withoutPrefixes = withoutPrefixes.replace(/PREFIX\s+\S+\s*<[^>]+>\s*/gi, '');
  withoutPrefixes = withoutPrefixes.replace(/BASE\s*<[^>]+>\s*/gi, '');
  withoutPrefixes = withoutPrefixes.trim();

  // Check for query types
  if (withoutPrefixes.startsWith('SELECT')) return 'SELECT';
  if (withoutPrefixes.startsWith('ASK')) return 'ASK';
  if (withoutPrefixes.startsWith('CONSTRUCT')) return 'CONSTRUCT';
  if (withoutPrefixes.startsWith('DESCRIBE')) return 'DESCRIBE';

  // SPARQL 1.2 UPDATE operations
  const updateOperations = /^(INSERT|DELETE|LOAD|CLEAR|CREATE|DROP|COPY|MOVE|ADD)/;
  if (updateOperations.test(withoutPrefixes)) return 'UPDATE';

  // Default to SELECT for unknown queries
  return 'SELECT';
}

/**
 * Get default result formats for query type
 * Used when service description is unavailable
 * @param queryType Type of SPARQL query
 * @returns Array of default MIME type formats
 */
export function getDefaultFormats(queryType: QueryType): string[] {
  if (queryType === 'SELECT' || queryType === 'ASK') {
    // Variable binding formats for SELECT/ASK
    return [
      'application/sparql-results+json',
      'application/sparql-results+xml',
      'text/csv',
      'text/tab-separated-values',
    ];
  } else {
    // RDF formats for CONSTRUCT/DESCRIBE/UPDATE
    return [
      'text/turtle',
      'application/rdf+xml',
      'application/ld+json',
      'application/n-triples',
    ];
  }
}

/**
 * Check if query type produces variable bindings (SELECT/ASK)
 * @param queryType Type of SPARQL query
 * @returns True if query produces variable bindings
 */
export function producesBindings(queryType: QueryType): boolean {
  return queryType === 'SELECT' || queryType === 'ASK';
}

/**
 * Check if query type produces RDF graph (CONSTRUCT/DESCRIBE)
 * @param queryType Type of SPARQL query
 * @returns True if query produces RDF graph
 */
export function producesGraph(queryType: QueryType): boolean {
  return queryType === 'CONSTRUCT' || queryType === 'DESCRIBE';
}
