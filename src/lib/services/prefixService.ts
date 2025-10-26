/**
 * Prefix Management Service
 * Handles SPARQL prefix management including common prefixes, parsing, abbreviation, and discovery
 */

import type { PrefixConfig } from '../types';

/**
 * Common RDF/SPARQL prefixes
 * These are widely-used prefixes that are included by default
 */
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
  geo: 'http://www.opengis.net/ont/geosparql#',
};

/**
 * Prefix suggestion result from prefix.cc
 */
export interface PrefixSuggestion {
  prefix: string;
  uri: string;
}

/**
 * Prefix Management Service
 * Provides functionality for managing SPARQL prefixes
 */
export class PrefixService {
  private customPrefixes: Record<string, string> = {};
  private discoveryHook?: (endpoint: string) => Promise<Record<string, string>>;

  /**
   * Create a new PrefixService instance
   * @param config - Optional prefix configuration
   */
  constructor(config?: PrefixConfig) {
    if (config?.default) {
      this.customPrefixes = { ...config.default };
    }
    this.discoveryHook = config?.discoveryHook;
  }

  /**
   * Get all known prefixes (common + custom)
   * Custom prefixes override common prefixes with the same name
   * @returns Combined prefix mapping
   */
  getAllPrefixes(): Record<string, string> {
    return { ...commonPrefixes, ...this.customPrefixes };
  }

  /**
   * Parse PREFIX declarations from query text
   * Supports both PREFIX and @prefix (Turtle-style) declarations
   * @param queryText - The SPARQL query text to parse
   * @returns Mapping of prefix names to URIs found in the query
   */
  parsePrefixesFromQuery(queryText: string): Record<string, string> {
    const prefixes: Record<string, string> = {};
    // Match PREFIX declarations (case-insensitive)
    const prefixRegex = /PREFIX\s+(\w+):\s*<([^>]+)>/gi;
    let match;

    while ((match = prefixRegex.exec(queryText)) !== null) {
      prefixes[match[1]] = match[2];
    }

    return prefixes;
  }

  /**
   * Abbreviate IRI using known prefixes
   * Uses the longest matching prefix for accurate abbreviation
   * @param iri - The full IRI to abbreviate
   * @param prefixes - Optional custom prefix mapping (defaults to all known prefixes)
   * @returns Abbreviated IRI (prefix:localName) or original IRI if no match found
   */
  abbreviateIRI(iri: string, prefixes?: Record<string, string>): string {
    const allPrefixes = prefixes || this.getAllPrefixes();

    // Sort by URI length (descending) to match longest prefix first
    const sortedPrefixes = Object.entries(allPrefixes).sort(
      (a, b) => b[1].length - a[1].length
    );

    for (const [prefix, uri] of sortedPrefixes) {
      if (iri.startsWith(uri)) {
        return `${prefix}:${iri.substring(uri.length)}`;
      }
    }

    return iri; // Return full IRI if no prefix matches
  }

  /**
   * Expand abbreviated IRI to full IRI
   * @param abbreviated - The abbreviated IRI (prefix:localName)
   * @param prefixes - Optional custom prefix mapping (defaults to all known prefixes)
   * @returns Full IRI or original string if prefix not found
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
   * @param query - Search query (prefix name or URI fragment)
   * @returns Array of prefix suggestions
   */
  async searchPrefixes(query: string): Promise<PrefixSuggestion[]> {
    try {
      // Search prefix.cc API
      const response = await fetch(
        `https://prefix.cc/${encodeURIComponent(query)}.file.json`,
        { method: 'GET', headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return Object.entries(data).map(([prefix, uri]) => ({
        prefix,
        uri: uri as string,
      }));
    } catch (error) {
      console.warn('Failed to fetch prefix suggestions:', error);
      return [];
    }
  }

  /**
   * Discover prefixes from endpoint (if hook provided)
   * @param endpoint - The SPARQL endpoint URL
   * @returns Discovered prefix mapping
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
   * @param prefix - The prefix name
   * @param uri - The URI that the prefix represents
   */
  addPrefix(prefix: string, uri: string): void {
    this.customPrefixes[prefix] = uri;
  }

  /**
   * Remove custom prefix
   * @param prefix - The prefix name to remove
   */
  removePrefix(prefix: string): void {
    delete this.customPrefixes[prefix];
  }

  /**
   * Generate PREFIX declarations for query
   * @param prefixes - Mapping of prefix names to URIs
   * @returns String containing all PREFIX declarations
   */
  generatePrefixDeclarations(prefixes: Record<string, string>): string {
    return Object.entries(prefixes)
      .map(([prefix, uri]) => `PREFIX ${prefix}: <${uri}>`)
      .join('\n');
  }

  /**
   * Get custom prefixes only
   * @returns Custom prefix mapping
   */
  getCustomPrefixes(): Record<string, string> {
    return { ...this.customPrefixes };
  }
}

/**
 * Singleton instance for global use
 */
export const prefixService = new PrefixService();
