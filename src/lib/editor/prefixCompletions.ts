/**
 * PREFIX autocompletion for CodeMirror 6
 * Provides PREFIX declaration and term completions with async support
 */

import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { prefixService } from '../services/prefixService';

/**
 * Common terms for well-known prefixes
 * Provides term suggestions when typing after a prefix colon (e.g., rdf:type)
 */
const commonTerms: Record<string, string[]> = {
  rdf: [
    'type',
    'Property',
    'Statement',
    'subject',
    'predicate',
    'object',
    'List',
    'nil',
    'first',
    'rest',
  ],
  rdfs: [
    'label',
    'comment',
    'subClassOf',
    'subPropertyOf',
    'domain',
    'range',
    'Class',
    'Resource',
    'Literal',
    'Datatype',
    'seeAlso',
    'isDefinedBy',
  ],
  owl: [
    'Class',
    'ObjectProperty',
    'DatatypeProperty',
    'Thing',
    'sameAs',
    'inverseOf',
    'TransitiveProperty',
    'SymmetricProperty',
    'FunctionalProperty',
    'InverseFunctionalProperty',
  ],
  xsd: [
    'string',
    'integer',
    'decimal',
    'boolean',
    'date',
    'dateTime',
    'float',
    'double',
    'long',
    'int',
    'short',
    'byte',
    'nonNegativeInteger',
    'positiveInteger',
    'anyURI',
  ],
  foaf: [
    'name',
    'Person',
    'knows',
    'homepage',
    'mbox',
    'depiction',
    'Organization',
    'Agent',
    'Document',
    'Image',
    'givenName',
    'familyName',
    'nick',
    'title',
  ],
  skos: [
    'Concept',
    'prefLabel',
    'altLabel',
    'broader',
    'narrower',
    'related',
    'ConceptScheme',
    'notation',
    'note',
    'definition',
    'example',
    'hiddenLabel',
  ],
  dc: [
    'title',
    'creator',
    'subject',
    'description',
    'publisher',
    'contributor',
    'date',
    'type',
    'format',
    'identifier',
    'source',
    'language',
    'relation',
    'coverage',
    'rights',
  ],
  dcterms: [
    'title',
    'creator',
    'subject',
    'description',
    'publisher',
    'contributor',
    'date',
    'type',
    'format',
    'identifier',
    'source',
    'language',
    'relation',
    'coverage',
    'rights',
    'license',
    'created',
    'modified',
  ],
  schema: [
    'name',
    'description',
    'url',
    'image',
    'Person',
    'Organization',
    'Thing',
    'Product',
    'Event',
    'Place',
    'CreativeWork',
    'author',
    'datePublished',
  ],
  dbo: [
    'abstract',
    'birthDate',
    'deathDate',
    'Person',
    'Place',
    'Organization',
    'Work',
    'Species',
    'wikiPageID',
    'thumbnail',
  ],
  geo: ['Feature', 'Geometry', 'asWKT', 'hasGeometry', 'sfWithin', 'sfContains', 'sfIntersects'],
};

/**
 * Get term suggestions for a given prefix
 * @param prefix - The prefix name (e.g., 'rdf')
 * @param partial - The partial term being typed
 * @returns Array of completion suggestions
 */
function getTermSuggestions(prefix: string, partial: string): Completion[] {
  const terms = commonTerms[prefix] || [];
  const lowerPartial = partial.toLowerCase();

  return terms
    .filter((term) => term.toLowerCase().startsWith(lowerPartial))
    .map((term) => ({
      label: term,
      type: 'property',
      info: `${prefix}:${term}`,
      apply: term,
    }));
}

/**
 * Get PREFIX declaration completions
 * Suggests known prefix names with their URIs
 * @param prefixName - Partial prefix name being typed
 * @param fromPos - Position where completion should start
 * @returns Array of completion suggestions
 */
function getPrefixDeclarationCompletions(prefixName: string, fromPos: number): CompletionResult {
  const allPrefixes = prefixService.getAllPrefixes();
  const lowerPrefixName = prefixName.toLowerCase();

  const options = Object.entries(allPrefixes)
    .filter(([prefix]) => prefix.toLowerCase().startsWith(lowerPrefixName))
    .map(([prefix, uri]) => ({
      label: `${prefix}:`,
      apply: `${prefix}: <${uri}>`,
      type: 'namespace' as const,
      info: uri,
      detail: 'PREFIX declaration',
    }));

  return {
    from: fromPos,
    options,
    filter: false, // We've already filtered
  };
}

/**
 * PREFIX and term autocompletion function
 * Provides context-aware completions for:
 * 1. PREFIX declarations (PREFIX rdf: <...>)
 * 2. Term usage after prefix colon (rdf:type)
 *
 * @param context - CodeMirror completion context
 * @returns Completion result or null
 */
export async function prefixCompletion(
  context: CompletionContext
): Promise<CompletionResult | null> {
  const { state, pos } = context;
  const line = state.doc.lineAt(pos);
  const textBefore = line.text.slice(0, pos - line.from);

  // Check if we're in a PREFIX declaration
  // Match: PREFIX <partial-name>
  const prefixDeclMatch = textBefore.match(/PREFIX\s+(\w*)$/i);
  if (prefixDeclMatch) {
    const partialName = prefixDeclMatch[1];
    const from = pos - partialName.length;
    return getPrefixDeclarationCompletions(partialName, from);
  }

  // Check if we're completing after a prefix colon
  // Match: prefix:<partial-term>
  const prefixUseMatch = textBefore.match(/(\w+):([\w]*)$/);
  if (prefixUseMatch) {
    const [, prefixName, partialTerm] = prefixUseMatch;
    const allPrefixes = prefixService.getAllPrefixes();

    // Only provide completions if the prefix is known
    if (allPrefixes[prefixName]) {
      const suggestions = getTermSuggestions(prefixName, partialTerm);

      if (suggestions.length > 0) {
        return {
          from: pos - partialTerm.length,
          options: suggestions,
          filter: false, // We've already filtered
        };
      }
    }
  }

  return null;
}

/**
 * Synchronous version of prefix completion
 * For use in environments that don't support async completions
 * @param context - CodeMirror completion context
 * @returns Completion result or null
 */
export function prefixCompletionSync(context: CompletionContext): CompletionResult | null {
  const { state, pos } = context;
  const line = state.doc.lineAt(pos);
  const textBefore = line.text.slice(0, pos - line.from);

  // Check if we're in a PREFIX declaration
  const prefixDeclMatch = textBefore.match(/PREFIX\s+(\w*)$/i);
  if (prefixDeclMatch) {
    const partialName = prefixDeclMatch[1];
    const from = pos - partialName.length;
    return getPrefixDeclarationCompletions(partialName, from);
  }

  // Check if we're completing after a prefix colon
  const prefixUseMatch = textBefore.match(/(\w+):([\w]*)$/);
  if (prefixUseMatch) {
    const [, prefixName, partialTerm] = prefixUseMatch;
    const allPrefixes = prefixService.getAllPrefixes();

    if (allPrefixes[prefixName]) {
      const suggestions = getTermSuggestions(prefixName, partialTerm);

      if (suggestions.length > 0) {
        return {
          from: pos - partialTerm.length,
          options: suggestions,
          filter: false,
        };
      }
    }
  }

  return null;
}
