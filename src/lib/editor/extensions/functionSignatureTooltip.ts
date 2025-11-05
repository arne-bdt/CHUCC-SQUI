/**
 * Function Signature Hover Tooltip for CodeMirror 6
 * Shows function signature and documentation on hover
 */

import { hoverTooltip } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import type { EditorView, Tooltip } from '@codemirror/view';
import type { ExtensionFunction, ExtensionAggregate } from '../../types';
import { formatFunctionTooltip, getFunctionName } from '../utils/functionFormatting';

/**
 * Create function signature tooltip extension
 * Shows function signature and documentation when hovering over function URIs
 *
 * @param getFunctions - Function to retrieve current extension functions and aggregates
 * @returns CodeMirror extension for hover tooltips
 *
 * @example
 * ```typescript
 * import { functionSignatureTooltip } from './functionSignatureTooltip';
 *
 * const extensions = [
 *   functionSignatureTooltip(() => {
 *     const desc = serviceDescriptionStore.getForEndpoint(currentEndpoint);
 *     return [...(desc?.extensionFunctions ?? []), ...(desc?.extensionAggregates ?? [])];
 *   })
 * ];
 * ```
 */
export function functionSignatureTooltip(
  getFunctions: () => (ExtensionFunction | ExtensionAggregate)[]
): Extension {
  return hoverTooltip(
    (view: EditorView, pos: number, side: number): Tooltip | null => {
      const { from, to, text } = view.state.doc.lineAt(pos);

      // Extract the word/URI at the cursor position
      const wordMatch = extractWordAtPosition(text, pos - from);
      if (!wordMatch) {
        return null;
      }

      // Get available functions
      const functions = getFunctions();
      if (functions.length === 0) {
        return null;
      }

      // Try to find matching function by URI or name
      const func = findFunction(functions, wordMatch);
      if (!func) {
        return null;
      }

      // Create tooltip
      return {
        pos: from + wordMatch.start,
        end: from + wordMatch.end,
        above: true,
        create: () => {
          const dom = document.createElement('div');
          dom.className = 'cm-function-tooltip';
          dom.innerHTML = formatFunctionTooltip(func);
          return { dom };
        },
      };
    },
    {
      // Hover delay in milliseconds
      hoverTime: 300,
    }
  );
}

/**
 * Extract word/URI at position in text
 *
 * @param text - Line text
 * @param pos - Position within line
 * @returns Match with start/end positions and matched text, or null
 */
function extractWordAtPosition(
  text: string,
  pos: number
): { start: number; end: number; text: string } | null {
  // Try to match function URI in angle brackets: <http://...>
  const uriMatch = text.match(/<([^>]+)>/g);
  if (uriMatch) {
    for (const match of uriMatch) {
      const start = text.indexOf(match);
      const end = start + match.length;
      if (pos >= start && pos <= end) {
        // Extract URI without angle brackets
        const uri = match.slice(1, -1);
        return { start, end, text: uri };
      }
    }
  }

  // Try to match function name (identifier)
  // Look for word boundaries around cursor position
  let start = pos;
  let end = pos;

  // Move start backwards to word boundary
  while (start > 0 && /[\w-]/.test(text[start - 1])) {
    start--;
  }

  // Move end forwards to word boundary
  while (end < text.length && /[\w-]/.test(text[end])) {
    end++;
  }

  if (start < end) {
    const word = text.slice(start, end);
    return { start, end, text: word };
  }

  return null;
}

/**
 * Find function matching the given word/URI
 *
 * @param functions - Array of extension functions
 * @param match - Matched word/URI with position info
 * @returns Matching function or null
 */
function findFunction(
  functions: (ExtensionFunction | ExtensionAggregate)[],
  match: { start: number; end: number; text: string }
): (ExtensionFunction | ExtensionAggregate) | null {
  const searchText = match.text.toLowerCase();

  // Try exact URI match first
  let func = functions.find((f) => f.uri === match.text);
  if (func) {
    return func;
  }

  // Try case-insensitive URI match
  func = functions.find((f) => f.uri.toLowerCase() === searchText);
  if (func) {
    return func;
  }

  // Try function name match (local name from URI)
  func = functions.find((f) => {
    const name = getFunctionName(f.uri).toLowerCase();
    return name === searchText;
  });
  if (func) {
    return func;
  }

  // Try label match
  func = functions.find((f) => f.label?.toLowerCase() === searchText);
  if (func) {
    return func;
  }

  return null;
}
