/**
 * Utility functions for formatting extension functions
 * Used by function library UI, auto-completion, and tooltips
 */

import type { ExtensionFunction, ExtensionAggregate } from '../../types';

/**
 * Extract local name from function URI
 * Returns the part after the last # or /
 *
 * @param uri - Function URI
 * @returns Local name or full URI if no separator found
 *
 * @example
 * ```typescript
 * getFunctionName("http://jena.apache.org/ARQ/function#now") // "now"
 * getFunctionName("http://example.org/fn/distance") // "distance"
 * ```
 */
export function getFunctionName(uri: string): string {
  const match = uri.match(/[#/]([^#/]+)$/);
  return match ? match[1] : uri;
}

/**
 * Build a function call template with parameter placeholders
 * Used for inserting functions into the query editor
 *
 * @param func - Extension function
 * @param useAngleBrackets - Whether to use <uri>() syntax (default: true)
 * @returns Function call template string
 *
 * @example
 * ```typescript
 * buildFunctionCall({ uri: "http://example.org/fn/add", parameters: [
 *   { name: "x", type: "xsd:integer" },
 *   { name: "y", type: "xsd:integer" }
 * ]})
 * // Returns: "<http://example.org/fn/add>(?x, ?y)"
 * ```
 */
export function buildFunctionCall(
  func: ExtensionFunction | ExtensionAggregate,
  useAngleBrackets = true
): string {
  // Build function name part
  const functionName = useAngleBrackets ? `<${func.uri}>` : getFunctionName(func.uri);

  // No parameters - just return function()
  if (!func.parameters || func.parameters.length === 0) {
    return `${functionName}()`;
  }

  // Build parameter list with variable placeholders
  const params = func.parameters.map((p) => `?${p.name}`).join(', ');

  return `${functionName}(${params})`;
}

/**
 * Format function signature for display
 * Shows function name with typed parameters and return type
 *
 * @param func - Extension function
 * @param useShortNames - Use short names instead of full URIs (default: true)
 * @returns Formatted signature string
 *
 * @example
 * ```typescript
 * formatFunctionSignature({
 *   uri: "http://example.org/fn/distance",
 *   parameters: [
 *     { name: "point1", type: "geo:Point" },
 *     { name: "point2", type: "geo:Point" }
 *   ],
 *   returnType: "xsd:double"
 * })
 * // Returns: "distance(point1: geo:Point, point2: geo:Point): xsd:double"
 * ```
 */
export function formatFunctionSignature(
  func: ExtensionFunction | ExtensionAggregate,
  useShortNames = true
): string {
  const functionName = useShortNames ? getFunctionName(func.uri) : func.uri;

  // Build parameter list with types
  let paramStr = '';
  if (func.parameters && func.parameters.length > 0) {
    const params = func.parameters.map((p) => {
      const optional = p.optional ? '?' : '';
      const type = p.type ? `: ${p.type}` : '';
      return `${p.name}${optional}${type}`;
    });
    paramStr = params.join(', ');
  }

  // Build full signature
  let signature = `${functionName}(${paramStr})`;

  // Add return type if available
  if (func.returnType) {
    signature += `: ${func.returnType}`;
  }

  return signature;
}

/**
 * Format function tooltip HTML for CodeMirror hover
 * Creates a rich HTML tooltip with signature, description, and metadata
 *
 * @param func - Extension function
 * @returns HTML string for tooltip
 */
export function formatFunctionTooltip(func: ExtensionFunction | ExtensionAggregate): string {
  let html = '<div class="function-signature-tooltip">';

  // Title (label or function name)
  if (func.label) {
    html += `<div class="tooltip-title">${escapeHtml(func.label)}</div>`;
  }

  // Signature
  html += '<div class="tooltip-signature">';
  html += `<code>${escapeHtml(formatFunctionSignature(func))}</code>`;
  html += '</div>';

  // Description
  if (func.comment) {
    html += `<div class="tooltip-description">${escapeHtml(func.comment)}</div>`;
  }

  // Parameters detail
  if (func.parameters && func.parameters.length > 0) {
    html += '<div class="tooltip-parameters">';
    html += '<strong>Parameters:</strong>';
    html += '<ul>';
    for (const param of func.parameters) {
      html += '<li>';
      html += `<code>${escapeHtml(param.name)}</code>`;
      if (param.type) {
        html += ` <span class="param-type">${escapeHtml(param.type)}</span>`;
      }
      if (param.optional) {
        html += ' <span class="param-optional">(optional)</span>';
      }
      if (param.description) {
        html += ` - ${escapeHtml(param.description)}`;
      }
      html += '</li>';
    }
    html += '</ul>';
    html += '</div>';
  }

  html += '</div>';

  return html;
}

/**
 * Check if we're in a context where function calls are allowed
 * Used by auto-completion to determine when to suggest functions
 *
 * @param textBefore - Text before cursor position
 * @returns True if in function context
 *
 * @example
 * ```typescript
 * isInFunctionContext("FILTER (") // true
 * isInFunctionContext("BIND (") // true
 * isInFunctionContext("SELECT ?x ") // false
 * ```
 */
export function isInFunctionContext(textBefore: string): boolean {
  // Remove string literals and comments to avoid false positives
  const cleaned = textBefore.replace(/"[^"]*"/g, '').replace(/'[^']*'/g, '').replace(/#[^\n]*/g, '');

  // Check if we're in a context where functions are allowed
  return (
    // FILTER clause
    /FILTER\s*\([^)]*$/i.test(cleaned) ||
    // BIND clause
    /BIND\s*\([^)]*$/i.test(cleaned) ||
    // SELECT expression (but not followed by WHERE without a closing brace)
    (/SELECT\s+(?:DISTINCT\s+|REDUCED\s+)?(?:\([^)]*|[^{(]*\([^)]*)$/i.test(cleaned) &&
      !(/SELECT\s+[^{]*WHERE/i.test(cleaned) && !/\{/.test(cleaned))) ||
    // ORDER BY expression (but not WHERE clause)
    (/ORDER\s+BY\s+(?:\([^)]*|[^{(]*\([^)]*)$/i.test(cleaned) && !/WHERE/.test(cleaned)) ||
    // HAVING clause
    /HAVING\s*\([^)]*$/i.test(cleaned) ||
    // GROUP BY with aggregates (inside parentheses)
    (/GROUP\s+BY\s+[^{]*\([^)]*$/i.test(cleaned))
  );
}

/**
 * Extract namespace prefix from URI
 * Used for displaying compact function names with prefixes
 *
 * @param uri - Full URI
 * @returns Namespace prefix or null if none found
 *
 * @example
 * ```typescript
 * extractNamespace("http://jena.apache.org/ARQ/function#now")
 * // Returns: "http://jena.apache.org/ARQ/function#"
 * ```
 */
export function extractNamespace(uri: string): string | null {
  const match = uri.match(/^(.+[#/])[^#/]+$/);
  return match ? match[1] : null;
}

/**
 * Group functions by namespace for organized display
 *
 * @param functions - Array of extension functions
 * @returns Map of namespace to functions
 */
export function groupByNamespace(
  functions: (ExtensionFunction | ExtensionAggregate)[]
): Map<string, (ExtensionFunction | ExtensionAggregate)[]> {
  const grouped = new Map<string, (ExtensionFunction | ExtensionAggregate)[]>();

  for (const func of functions) {
    const namespace = extractNamespace(func.uri) || 'Other';
    const existing = grouped.get(namespace) || [];
    existing.push(func);
    grouped.set(namespace, existing);
  }

  return grouped;
}

/**
 * Filter functions by search term
 * Searches in URI, label, and comment fields
 *
 * @param functions - Array of extension functions
 * @param searchTerm - Search term (case-insensitive)
 * @returns Filtered array of functions
 */
export function filterFunctions(
  functions: (ExtensionFunction | ExtensionAggregate)[],
  searchTerm: string
): (ExtensionFunction | ExtensionAggregate)[] {
  if (!searchTerm) {
    return functions;
  }

  const term = searchTerm.toLowerCase();

  return functions.filter((func) => {
    return (
      func.uri.toLowerCase().includes(term) ||
      func.label?.toLowerCase().includes(term) ||
      func.comment?.toLowerCase().includes(term) ||
      getFunctionName(func.uri).toLowerCase().includes(term)
    );
  });
}

/**
 * Escape HTML special characters
 * Prevents XSS in tooltip and UI display
 *
 * @param text - Text to escape
 * @returns HTML-safe text
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
