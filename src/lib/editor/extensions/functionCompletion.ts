/**
 * Extension Function Auto-completion for CodeMirror 6
 * Provides intelligent function suggestions in SPARQL queries
 * based on SPARQL Service Description metadata
 */

import { autocompletion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { ExtensionFunction, ExtensionAggregate } from '../../types';
import {
  buildFunctionCall,
  getFunctionName,
  isInFunctionContext,
  formatFunctionSignature,
} from '../utils/functionFormatting';

/**
 * Create extension function auto-completion extension
 *
 * @param getFunctions - Function to retrieve current extension functions and aggregates
 * @returns CodeMirror extension for function completion
 *
 * @example
 * ```typescript
 * import { extensionFunctionCompletion } from './functionCompletion';
 *
 * const extensions = [
 *   extensionFunctionCompletion(() => {
 *     const desc = serviceDescriptionStore.getForEndpoint(currentEndpoint);
 *     return [...(desc?.extensionFunctions ?? []), ...(desc?.extensionAggregates ?? [])];
 *   })
 * ];
 * ```
 */
export function extensionFunctionCompletion(
  getFunctions: () => (ExtensionFunction | ExtensionAggregate)[]
): Extension {
  return autocompletion({
    override: [
      async (context: CompletionContext): Promise<CompletionResult | null> => {
        const { state, pos } = context;

        // Get text before cursor to determine context
        const textBefore = state.sliceDoc(Math.max(0, pos - 100), pos);

        // Only provide completions in function contexts
        if (!isInFunctionContext(textBefore)) {
          return null;
        }

        // Get available functions
        const functions = getFunctions();
        if (functions.length === 0) {
          return null;
        }

        // Build completion items
        const completions = buildFunctionCompletions(functions, context);

        if (completions.length === 0) {
          return null;
        }

        // Return completion result
        return {
          from: getCompletionStart(context),
          options: completions,
          filter: true, // Let CodeMirror filter based on partial input
        };
      },
    ],
  });
}

/**
 * Build completion items from extension functions
 *
 * @param functions - Array of extension functions and aggregates
 * @param context - Completion context
 * @returns Array of completion items
 */
function buildFunctionCompletions(
  functions: (ExtensionFunction | ExtensionAggregate)[],
  context: CompletionContext
): Completion[] {
  return functions.map((func) => {
    const functionName = getFunctionName(func.uri);
    const signature = formatFunctionSignature(func, true);

    return {
      label: functionName,
      type: func.parameters && func.parameters.length > 0 ? 'function' : 'constant',
      detail: signature,
      info: func.comment || undefined,
      apply: (view, completion, from, to) => {
        // Build function call with parameter placeholders
        const functionCall = buildFunctionCall(func, true);

        // Insert function call
        view.dispatch({
          changes: { from, to, insert: functionCall },
          // Position cursor after opening parenthesis for easy parameter editing
          selection: {
            anchor: from + functionCall.indexOf('(') + 1,
          },
        });
      },
    };
  });
}

/**
 * Get the start position for completion
 * Handles partial function names typed by user
 *
 * @param context - Completion context
 * @returns Start position for completion
 */
function getCompletionStart(context: CompletionContext): number {
  const { state, pos } = context;

  // Look backwards for the start of the current word
  let start = pos;
  const textBefore = state.sliceDoc(Math.max(0, pos - 50), pos);

  // Find start of current identifier (alphanumeric, underscore, hyphen)
  const match = textBefore.match(/[\w-]+$/);
  if (match) {
    start = pos - match[0].length;
  }

  return start;
}
