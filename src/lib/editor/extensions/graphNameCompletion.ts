/**
 * Graph Name Auto-completion Extension for CodeMirror 6
 * Provides intelligent graph IRI suggestions for FROM and FROM NAMED clauses
 * using SPARQL Service Description metadata
 */

import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { ServiceDescription, NamedGraph, GraphDescription } from '../../types';
import { isInFromClause, isFromNamed, getCompletionStart, getPartialText } from '../utils/queryAnalysis';

/**
 * Graph name completion function
 * Provides context-aware graph IRI completions based on service description
 *
 * @param getServiceDescription - Function to retrieve current service description
 * @returns Async completion function for CodeMirror
 *
 * @example
 * ```typescript
 * import { autocompletion } from '@codemirror/autocomplete';
 * import { graphNameCompletion } from './graphNameCompletion';
 *
 * const extensions = [
 *   autocompletion({
 *     override: [graphNameCompletion(() => currentServiceDesc)],
 *   })
 * ];
 * ```
 */
export function graphNameCompletion(
  getServiceDescription: () => ServiceDescription | null
): (context: CompletionContext) => Promise<CompletionResult | null> {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    const { state, pos } = context;
    const textBefore = state.sliceDoc(0, pos);

    // Check if we're in a FROM or FROM NAMED clause
    if (!isInFromClause(textBefore)) {
      return null;
    }

    // Get service description
    const serviceDesc = getServiceDescription();
    if (!serviceDesc || !serviceDesc.available) {
      return null;
    }

    // Determine if we're in FROM NAMED (named graphs only) or FROM (all graphs)
    const namedOnly = isFromNamed(textBefore);

    // Build completion items from service description
    const completions = buildGraphCompletions(serviceDesc, namedOnly, context);

    if (completions.length === 0) {
      return null;
    }

    return {
      from: getCompletionStart(context),
      options: completions,
      filter: true, // Let CodeMirror filter based on partial input
    };
  };
}

/**
 * Build completion items from service description datasets
 *
 * @param serviceDesc - Service description containing dataset information
 * @param namedOnly - If true, only include named graphs; if false, include both default and named graphs
 * @param context - Completion context for filtering
 * @returns Array of completion items
 */
function buildGraphCompletions(
  serviceDesc: ServiceDescription,
  namedOnly: boolean,
  context: CompletionContext
): Completion[] {
  const graphs: Array<NamedGraph | GraphDescription> = [];

  // Collect graphs from all datasets
  for (const dataset of serviceDesc.datasets) {
    if (namedOnly) {
      // Only named graphs for FROM NAMED
      graphs.push(...dataset.namedGraphs);
    } else {
      // Both default and named graphs for FROM
      graphs.push(...dataset.defaultGraphs, ...dataset.namedGraphs);
    }
  }

  // Get partial text for filtering
  const partial = getPartialText(context);

  // Convert graphs to completion items
  const completions = graphs
    .filter((graph) => {
      // Filter out graphs without a name/URI
      const graphIri = getGraphIri(graph);
      if (!graphIri) return false;

      // Filter based on partial input (case-insensitive)
      if (partial) {
        return graphIri.toLowerCase().includes(partial.toLowerCase());
      }

      return true;
    })
    .map((graph) => graphToCompletion(graph));

  // Remove duplicates (same IRI may appear in multiple datasets)
  const seen = new Set<string>();
  return completions.filter((completion) => {
    if (seen.has(completion.label)) {
      return false;
    }
    seen.add(completion.label);
    return true;
  });
}

/**
 * Convert a graph description to a CodeMirror completion item
 *
 * @param graph - Graph description from service description
 * @returns Completion item with label, detail, and apply logic
 */
function graphToCompletion(graph: NamedGraph | GraphDescription): Completion {
  const graphIri = getGraphIri(graph);
  const metadata = formatGraphMetadata(graph);
  const info = formatGraphInfo(graph);

  return {
    label: graphIri,
    type: 'constant',
    detail: metadata || undefined,
    info: info || undefined,
    apply: (view, completion, from, to) => {
      // Insert graph IRI with angle brackets
      // Remove existing '<' if present
      const textBefore = view.state.sliceDoc(Math.max(0, from - 1), from);
      const hasOpenBracket = textBefore === '<';

      const insert = hasOpenBracket ? `${graphIri}>` : `<${graphIri}>`;

      view.dispatch({
        changes: { from, to, insert },
      });
    },
  };
}

/**
 * Extract graph IRI from graph description
 * Handles both NamedGraph (with .name) and GraphDescription (with .uri)
 *
 * @param graph - Graph description
 * @returns Graph IRI or empty string if not available
 */
function getGraphIri(graph: NamedGraph | GraphDescription): string {
  // NamedGraph has 'name' property
  if ('name' in graph && graph.name) {
    return graph.name;
  }
  // GraphDescription has 'uri' property
  if (graph.uri) {
    return graph.uri;
  }
  return '';
}

/**
 * Format graph metadata for display in completion detail
 * Shows triple count, entailment regime, etc.
 *
 * @param graph - Graph description
 * @returns Formatted metadata string
 *
 * @example
 * ```typescript
 * formatGraphMetadata(graph) // "10,245 triples • RDFS"
 * ```
 */
function formatGraphMetadata(graph: NamedGraph | GraphDescription): string {
  const parts: string[] = [];

  // Triple count (from voiD vocabulary)
  if (graph.metadata?.triples) {
    const tripleCount = graph.metadata.triples as number;
    parts.push(`${formatNumber(tripleCount)} triples`);
  }

  // Entailment regime
  if (graph.entailmentRegime) {
    const regime = extractLocalName(graph.entailmentRegime);
    if (regime) {
      parts.push(regime);
    }
  }

  return parts.join(' • ');
}

/**
 * Format detailed graph information for hover/info display
 *
 * @param graph - Graph description
 * @returns Formatted info string
 */
function formatGraphInfo(graph: NamedGraph | GraphDescription): string {
  const lines: string[] = [];

  const graphIri = getGraphIri(graph);
  if (graphIri) {
    lines.push(`**Graph IRI:** ${graphIri}`);
  }

  // Triple count
  if (graph.metadata?.triples) {
    const tripleCount = graph.metadata.triples as number;
    lines.push(`**Triples:** ${formatNumber(tripleCount)}`);
  }

  // Entailment regime
  if (graph.entailmentRegime) {
    lines.push(`**Entailment:** ${graph.entailmentRegime}`);
  }

  // Additional metadata
  if (graph.metadata) {
    const { triples, ...otherMetadata } = graph.metadata;
    if (Object.keys(otherMetadata).length > 0) {
      lines.push('');
      lines.push('**Additional Metadata:**');
      for (const [key, value] of Object.entries(otherMetadata)) {
        lines.push(`- ${key}: ${JSON.stringify(value)}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Format number with thousands separator
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1000) // "1,000"
 * formatNumber(1234567) // "1,234,567"
 * ```
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Extract local name from IRI (part after last # or /)
 *
 * @param iri - Full IRI
 * @returns Local name or empty string
 *
 * @example
 * ```typescript
 * extractLocalName("http://www.w3.org/ns/entailment/RDFS") // "RDFS"
 * extractLocalName("http://www.w3.org/2002/07/owl#Thing") // "Thing"
 * ```
 */
function extractLocalName(iri: string): string {
  const match = iri.match(/[#/]([^#/]+)$/);
  return match ? match[1] : '';
}
