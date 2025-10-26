/**
 * Utility functions for SPARQL query manipulation
 * Provides helpers for query parsing, modification, and analysis
 */

import type { QueryType } from '../types';

/**
 * Detect query type from SPARQL query text
 * @param query SPARQL query text
 * @returns Detected query type
 */
export function detectQueryType(query: string): QueryType {
  const normalized = query.trim().toUpperCase();

  if (normalized.startsWith('SELECT')) return 'SELECT';
  if (normalized.startsWith('ASK')) return 'ASK';
  if (normalized.startsWith('CONSTRUCT')) return 'CONSTRUCT';
  if (normalized.startsWith('DESCRIBE')) return 'DESCRIBE';
  if (normalized.match(/^(INSERT|DELETE)/)) return 'UPDATE';

  // Default to SELECT for unknown queries
  return 'SELECT';
}

/**
 * Add LIMIT and OFFSET clauses to a SPARQL query
 * Only adds if not already present in the query
 * @param query SPARQL query text
 * @param limit Maximum number of results
 * @param offset Number of results to skip
 * @returns Modified query with LIMIT and/or OFFSET
 */
export function addLimitOffset(query: string, limit: number, offset: number = 0): string {
  // Check if query already has LIMIT/OFFSET
  const hasLimit = /LIMIT\s+\d+/i.test(query);
  const hasOffset = /OFFSET\s+\d+/i.test(query);

  let modifiedQuery = query.trim();

  // Add LIMIT if not present
  if (!hasLimit) {
    modifiedQuery += `\nLIMIT ${limit}`;
  }

  // Add OFFSET if not present and offset > 0
  if (!hasOffset && offset > 0) {
    modifiedQuery += `\nOFFSET ${offset}`;
  }

  return modifiedQuery;
}

/**
 * Extract PREFIX declarations from a SPARQL query
 * @param query SPARQL query text
 * @returns Map of prefix names to namespace URIs
 */
export function extractPrefixesFromQuery(query: string): Record<string, string> {
  const prefixes: Record<string, string> = {};
  const prefixRegex = /PREFIX\s+(\w+):\s*<([^>]+)>/gi;

  let match: RegExpExecArray | null;
  while ((match = prefixRegex.exec(query)) !== null) {
    const [, prefix, namespace] = match;
    prefixes[prefix] = namespace;
  }

  return prefixes;
}

/**
 * Add PREFIX declarations to a SPARQL query
 * Only adds prefixes that are not already present
 * @param query SPARQL query text
 * @param prefixes Map of prefix names to namespace URIs
 * @returns Query with added PREFIX declarations
 */
export function addPrefixesToQuery(query: string, prefixes: Record<string, string>): string {
  const existingPrefixes = extractPrefixesFromQuery(query);
  const newPrefixes: string[] = [];

  for (const [prefix, namespace] of Object.entries(prefixes)) {
    if (!existingPrefixes[prefix]) {
      newPrefixes.push(`PREFIX ${prefix}: <${namespace}>`);
    }
  }

  if (newPrefixes.length === 0) {
    return query;
  }

  // Add new prefixes at the beginning of the query
  return newPrefixes.join('\n') + '\n\n' + query;
}

/**
 * Remove all PREFIX declarations from a SPARQL query
 * @param query SPARQL query text
 * @returns Query without PREFIX declarations
 */
export function removePrefixesFromQuery(query: string): string {
  return query.replace(/PREFIX\s+\w+:\s*<[^>]+>\s*/gi, '').trim();
}

/**
 * Check if a query contains a specific variable
 * @param query SPARQL query text
 * @param variableName Variable name (without the ? or $ prefix)
 * @returns True if the variable is used in the query
 */
export function queryContainsVariable(query: string, variableName: string): boolean {
  const variablePattern = new RegExp(`[?$]${variableName}\\b`, 'i');
  return variablePattern.test(query);
}

/**
 * Extract all variables used in a SELECT query
 * @param query SPARQL query text
 * @returns Array of variable names (without ? or $ prefix)
 */
export function extractSelectVariables(query: string): string[] {
  const selectMatch = query.match(/SELECT\s+(?:DISTINCT\s+)?(.+?)\s+WHERE/is);
  if (!selectMatch) {
    return [];
  }

  const selectClause = selectMatch[1];

  // Handle SELECT *
  if (selectClause.trim() === '*') {
    return ['*'];
  }

  // Extract individual variables
  const variablePattern = /[?$](\w+)/g;
  const variables: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = variablePattern.exec(selectClause)) !== null) {
    variables.push(match[1]);
  }

  return variables;
}

/**
 * Validate basic SPARQL query syntax
 * @param query SPARQL query text
 * @returns Object with validation result and error message if invalid
 */
export function validateQuerySyntax(query: string): { valid: boolean; error?: string } {
  const trimmed = query.trim();

  if (!trimmed) {
    return { valid: false, error: 'Query is empty' };
  }

  // Check for basic query type keyword
  const queryTypes = ['SELECT', 'ASK', 'CONSTRUCT', 'DESCRIBE', 'INSERT', 'DELETE'];
  const startsWithQueryType = queryTypes.some((type) => trimmed.toUpperCase().startsWith(type));

  if (!startsWithQueryType) {
    return {
      valid: false,
      error: 'Query must start with SELECT, ASK, CONSTRUCT, DESCRIBE, INSERT, or DELETE',
    };
  }

  // Check for balanced braces
  const openBraces = (trimmed.match(/{/g) || []).length;
  const closeBraces = (trimmed.match(/}/g) || []).length;

  if (openBraces !== closeBraces) {
    return {
      valid: false,
      error: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`,
    };
  }

  // Basic validation passed
  return { valid: true };
}

/**
 * Count the approximate number of result bindings a query might return
 * Based on LIMIT clause if present
 * @param query SPARQL query text
 * @returns Expected result count or undefined if no LIMIT
 */
export function getQueryResultLimit(query: string): number | undefined {
  const limitMatch = query.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    return parseInt(limitMatch[1], 10);
  }
  return undefined;
}

/**
 * Check if query is a read-only query (SELECT, ASK, CONSTRUCT, DESCRIBE)
 * @param query SPARQL query text
 * @returns True if query is read-only
 */
export function isReadOnlyQuery(query: string): boolean {
  const queryType = detectQueryType(query);
  return queryType !== 'UPDATE';
}
