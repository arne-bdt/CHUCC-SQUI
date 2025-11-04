/**
 * Query analysis utilities for CodeMirror completions
 * Provides context detection for graph name auto-completion
 */

import type { CompletionContext } from '@codemirror/autocomplete';

/**
 * Detect if cursor is within a FROM or FROM NAMED clause
 *
 * This function checks if the text before the cursor indicates we're in a position
 * where a graph IRI could be entered after FROM or FROM NAMED keywords.
 *
 * @param textBefore - Text content before the cursor position
 * @returns true if cursor is in a FROM clause context
 *
 * @example
 * ```typescript
 * isInFromClause("SELECT * FROM ") // true
 * isInFromClause("SELECT * FROM NAMED ") // true
 * isInFromClause("SELECT * FROM <http://ex") // true
 * isInFromClause("SELECT * WHERE {") // false
 * ```
 */
export function isInFromClause(textBefore: string): boolean {
  // Look for FROM or FROM NAMED followed by optional whitespace/IRIs
  // This pattern matches:
  // - FROM followed by whitespace
  // - FROM NAMED followed by whitespace
  // - Partial IRIs in angle brackets like <http://example.org
  // - Complete IRIs followed by whitespace (for multiple FROMs)
  // - Prefixed names like ex:dataset
  const fromPattern = /\bFROM\s+(NAMED\s+)?(?:<[^>]*>?|\w+:\w*|\s+)*$/i;
  return fromPattern.test(textBefore);
}

/**
 * Check if we're specifically in a FROM NAMED clause (not just FROM)
 *
 * FROM NAMED specifies named graphs, while standalone FROM can specify
 * either default graphs or named graphs depending on the endpoint configuration.
 *
 * @param textBefore - Text content before the cursor position
 * @returns true if cursor is specifically after FROM NAMED
 *
 * @example
 * ```typescript
 * isFromNamed("SELECT * FROM NAMED ") // true
 * isFromNamed("SELECT * FROM NAMED <http://ex") // true
 * isFromNamed("SELECT * FROM ") // false
 * ```
 */
export function isFromNamed(textBefore: string): boolean {
  const fromNamedPattern = /\bFROM\s+NAMED\s+(?:<[^>]*>?|\w+:\w*|\s+)*$/i;
  return fromNamedPattern.test(textBefore);
}

/**
 * Find the start position for completion
 * Handles partial IRIs and prefixed names
 *
 * This function determines where the completion should start replacing text.
 * It handles two cases:
 * 1. Partial IRI in angle brackets: `<http://example.org/dat|`
 * 2. Prefixed name: `ex:data|`
 *
 * @param context - CodeMirror completion context
 * @returns Position where completion text should begin
 *
 * @example
 * ```typescript
 * // For text "FROM <http://ex|"
 * getCompletionStart(context) // returns position after '<'
 *
 * // For text "FROM ex:dat|"
 * getCompletionStart(context) // returns position at start of 'ex:'
 *
 * // For text "FROM |"
 * getCompletionStart(context) // returns current position
 * ```
 */
export function getCompletionStart(context: CompletionContext): number {
  const { state, pos } = context;
  const textBefore = state.sliceDoc(0, pos);

  // Check for partial IRI in angle brackets
  // Example: "FROM <http://example.org/dat"
  const angleMatch = textBefore.match(/<([^>]*)$/);
  if (angleMatch) {
    // Return position after '<' to replace the partial IRI
    return pos - angleMatch[1].length;
  }

  // Check for prefixed name
  // Example: "FROM ex:dataset"
  const prefixMatch = textBefore.match(/\b(\w+:\w*)$/);
  if (prefixMatch) {
    return pos - prefixMatch[1].length;
  }

  // Default: start at current position
  return pos;
}

/**
 * Extract the partial text being typed for filtering completions
 *
 * @param context - CodeMirror completion context
 * @returns The partial text being typed (without angle brackets or prefix)
 *
 * @example
 * ```typescript
 * // For text "FROM <http://ex|"
 * getPartialText(context) // returns "http://ex"
 *
 * // For text "FROM ex:dat|"
 * getPartialText(context) // returns "ex:dat"
 * ```
 */
export function getPartialText(context: CompletionContext): string {
  const { state, pos } = context;
  const textBefore = state.sliceDoc(0, pos);

  // Check for partial IRI in angle brackets
  const angleMatch = textBefore.match(/<([^>]*)$/);
  if (angleMatch) {
    return angleMatch[1];
  }

  // Check for prefixed name
  const prefixMatch = textBefore.match(/\b(\w+:\w*)$/);
  if (prefixMatch) {
    return prefixMatch[1];
  }

  return '';
}
