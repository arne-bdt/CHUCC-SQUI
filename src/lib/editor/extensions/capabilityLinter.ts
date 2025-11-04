/**
 * CodeMirror linter extension for SPARQL query validation
 * Validates queries against endpoint capabilities from Service Description
 */

import { linter, type Diagnostic } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { ServiceDescription } from '../../types/serviceDescription.js';
import { validateQuery } from '../utils/queryValidation.js';

/**
 * Validation settings
 */
export interface ValidationSettings {
  /** Enable/disable capability validation */
  enabled: boolean;
  /** Warn on unsupported SPARQL version features */
  warnOnUnsupportedFeatures: boolean;
  /** Warn on unknown extension functions */
  warnOnUnknownFunctions: boolean;
  /** Warn on unknown graph IRIs */
  warnOnUnknownGraphs: boolean;
}

/**
 * Default validation settings
 */
const DEFAULT_SETTINGS: ValidationSettings = {
  enabled: true,
  warnOnUnsupportedFeatures: true,
  warnOnUnknownFunctions: false, // May be too noisy
  warnOnUnknownGraphs: false, // May be too noisy
};

/**
 * Create capability linter extension
 *
 * This linter validates SPARQL queries against endpoint capabilities
 * obtained from Service Description metadata.
 *
 * @param getServiceDescription - Function to get current service description
 * @param getSettings - Function to get current validation settings
 * @returns CodeMirror linter extension
 *
 * @example
 * ```typescript
 * const linter = capabilityLinter(
 *   () => serviceDescriptionStore.getCurrentDescription(),
 *   () => settingsStore.getValidationSettings()
 * );
 * ```
 */
export function capabilityLinter(
  getServiceDescription: () => ServiceDescription | null,
  getSettings: () => ValidationSettings = () => DEFAULT_SETTINGS
): Extension {
  return linter((view: EditorView): Diagnostic[] => {
    const settings = getSettings();

    // Skip validation if disabled
    if (!settings.enabled) {
      return [];
    }

    const serviceDesc = getServiceDescription();

    // No validation without service description
    if (!serviceDesc || !serviceDesc.available) {
      return [];
    }

    const query = view.state.doc.toString();

    // Run all enabled validation checks
    const issues = validateQuery(query, serviceDesc, {
      languageVersion: settings.warnOnUnsupportedFeatures,
      features: settings.warnOnUnsupportedFeatures,
      extensionFunctions: settings.warnOnUnknownFunctions,
      graphs: settings.warnOnUnknownGraphs,
    });

    // Convert validation issues to CodeMirror diagnostics
    const diagnostics: Diagnostic[] = issues.map((issue) => {
      const diagnostic: Diagnostic = {
        from: issue.from,
        to: issue.to,
        severity: issue.severity,
        message: issue.message,
      };

      // Add action if available
      if (issue.actionLabel && issue.actionUrl) {
        diagnostic.actions = [
          {
            name: issue.actionLabel,
            apply: () => {
              window.open(issue.actionUrl, '_blank');
            },
          },
        ];
      }

      return diagnostic;
    });

    return diagnostics;
  });
}

/**
 * Create simple capability linter with default settings
 *
 * @param getServiceDescription - Function to get current service description
 * @returns CodeMirror linter extension
 */
export function createCapabilityLinter(
  getServiceDescription: () => ServiceDescription | null
): Extension {
  return capabilityLinter(getServiceDescription, () => DEFAULT_SETTINGS);
}
