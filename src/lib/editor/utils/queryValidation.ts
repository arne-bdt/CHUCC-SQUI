/**
 * Query validation utilities
 * Validates SPARQL queries against endpoint capabilities
 */

import type { ServiceDescription } from '../../types/serviceDescription.js';
import { SPARQLLanguage, ServiceFeature } from '../../types/serviceDescription.js';

/**
 * Validation result with position and message
 */
export interface ValidationIssue {
  /** Start position in query string */
  from: number;
  /** End position in query string */
  to: number;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
  /** Issue message */
  message: string;
  /** Optional action label */
  actionLabel?: string;
  /** Optional action URL */
  actionUrl?: string;
}

/**
 * SPARQL 1.1 feature patterns
 * Each pattern identifies a specific SPARQL 1.1 feature
 */
const SPARQL_11_FEATURES = [
  {
    pattern: /\bBIND\s*\(/i,
    feature: 'BIND clause',
    description: 'BIND is a SPARQL 1.1 feature for assigning values to variables',
  },
  {
    pattern: /\bSERVICE\s+/i,
    feature: 'SERVICE (federated query)',
    description: 'SERVICE keyword enables federated queries across multiple endpoints',
  },
  {
    pattern: /\bMINUS\s*\{/i,
    feature: 'MINUS',
    description: 'MINUS is a SPARQL 1.1 feature for set difference',
  },
  {
    pattern: /\bVALUES\s+/i,
    feature: 'VALUES',
    description: 'VALUES clause provides inline data',
  },
  {
    pattern: /\bEXISTS\s*\(/i,
    feature: 'EXISTS',
    description: 'EXISTS tests whether a pattern has a solution',
  },
  {
    pattern: /\bNOT\s+EXISTS\s*\(/i,
    feature: 'NOT EXISTS',
    description: 'NOT EXISTS tests whether a pattern has no solution',
  },
  {
    pattern: /\bGROUP_CONCAT\s*\(/i,
    feature: 'GROUP_CONCAT aggregate',
    description: 'GROUP_CONCAT is a SPARQL 1.1 aggregate function',
  },
  {
    pattern: /\b(SAMPLE|COUNT|SUM|MIN|MAX|AVG|GROUP_CONCAT)\s*\(/i,
    feature: 'Aggregates',
    description: 'Aggregate functions in SELECT require SPARQL 1.1',
  },
  {
    pattern: /\bSUBSTR\s*\(/i,
    feature: 'SUBSTR function',
    description: 'SUBSTR is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bREPLACE\s*\(/i,
    feature: 'REPLACE function',
    description: 'REPLACE is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bUUID\s*\(/i,
    feature: 'UUID function',
    description: 'UUID is a SPARQL 1.1 function for generating unique identifiers',
  },
  {
    pattern: /\bSTRUUID\s*\(/i,
    feature: 'STRUUID function',
    description: 'STRUUID is a SPARQL 1.1 function for generating UUID strings',
  },
  {
    pattern: /\bCONCAT\s*\(/i,
    feature: 'CONCAT function',
    description: 'CONCAT is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bCONTAINS\s*\(/i,
    feature: 'CONTAINS function',
    description: 'CONTAINS is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bSTRSTARTS\s*\(/i,
    feature: 'STRSTARTS function',
    description: 'STRSTARTS is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bSTRENDS\s*\(/i,
    feature: 'STRENDS function',
    description: 'STRENDS is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bSTRBEFORE\s*\(/i,
    feature: 'STRBEFORE function',
    description: 'STRBEFORE is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bSTRAFTER\s*\(/i,
    feature: 'STRAFTER function',
    description: 'STRAFTER is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bENCODE_FOR_URI\s*\(/i,
    feature: 'ENCODE_FOR_URI function',
    description: 'ENCODE_FOR_URI is a SPARQL 1.1 string function',
  },
  {
    pattern: /\bABS\s*\(/i,
    feature: 'ABS function',
    description: 'ABS is a SPARQL 1.1 numeric function',
  },
  {
    pattern: /\bROUND\s*\(/i,
    feature: 'ROUND function',
    description: 'ROUND is a SPARQL 1.1 numeric function',
  },
  {
    pattern: /\bCEIL\s*\(/i,
    feature: 'CEIL function',
    description: 'CEIL is a SPARQL 1.1 numeric function',
  },
  {
    pattern: /\bFLOOR\s*\(/i,
    feature: 'FLOOR function',
    description: 'FLOOR is a SPARQL 1.1 numeric function',
  },
  {
    pattern: /\bMD5\s*\(/i,
    feature: 'MD5 function',
    description: 'MD5 is a SPARQL 1.1 hash function',
  },
  {
    pattern: /\bSHA1\s*\(/i,
    feature: 'SHA1 function',
    description: 'SHA1 is a SPARQL 1.1 hash function',
  },
  {
    pattern: /\bSHA256\s*\(/i,
    feature: 'SHA256 function',
    description: 'SHA256 is a SPARQL 1.1 hash function',
  },
  {
    pattern: /\bSHA384\s*\(/i,
    feature: 'SHA384 function',
    description: 'SHA384 is a SPARQL 1.1 hash function',
  },
  {
    pattern: /\bSHA512\s*\(/i,
    feature: 'SHA512 function',
    description: 'SHA512 is a SPARQL 1.1 hash function',
  },
  {
    pattern: /\bIN\s*\(/i,
    feature: 'IN operator',
    description: 'IN operator is a SPARQL 1.1 feature',
  },
  {
    pattern: /\bNOT\s+IN\s*\(/i,
    feature: 'NOT IN operator',
    description: 'NOT IN operator is a SPARQL 1.1 feature',
  },
];

/**
 * Validate query against SPARQL language version
 * Checks if query uses features not supported by endpoint
 *
 * @param query - SPARQL query string
 * @param serviceDesc - Service description with supported languages
 * @returns Array of validation issues
 */
export function validateLanguageVersion(
  query: string,
  serviceDesc: ServiceDescription
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check if endpoint supports SPARQL 1.1
  const supports11 = serviceDesc.supportedLanguages.includes(SPARQLLanguage.SPARQL11Query);

  if (!supports11) {
    // Check for SPARQL 1.1 features
    for (const { pattern, feature } of SPARQL_11_FEATURES) {
      const match = query.match(pattern);
      if (match && match.index !== undefined) {
        issues.push({
          from: match.index,
          to: match.index + match[0].length,
          severity: 'warning',
          message: `${feature} is from SPARQL 1.1 but endpoint only supports SPARQL 1.0`,
          actionLabel: 'Learn more',
          actionUrl: 'https://www.w3.org/TR/sparql11-query/',
        });
      }
    }
  }

  return issues;
}

/**
 * Validate query against endpoint features
 * Checks if query uses features not supported by endpoint
 *
 * @param query - SPARQL query string
 * @param serviceDesc - Service description with supported features
 * @returns Array of validation issues
 */
export function validateFeatures(
  query: string,
  serviceDesc: ServiceDescription
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const features = serviceDesc.features;

  // Check FROM/FROM NAMED with URI dereferencing
  if (!features.includes(ServiceFeature.DereferencesURIs)) {
    const fromPattern = /\bFROM\s+(NAMED\s+)?<[^>]+>/gi;
    let match;
    while ((match = fromPattern.exec(query)) !== null) {
      issues.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: 'Endpoint does not support URI dereferencing in FROM clauses',
      });
    }
  }

  // Check SERVICE with federated query
  if (!features.includes(ServiceFeature.BasicFederatedQuery)) {
    const servicePattern = /\bSERVICE\s+/gi;
    let match;
    while ((match = servicePattern.exec(query)) !== null) {
      issues.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'warning',
        message: 'Endpoint does not support federated queries (SERVICE keyword)',
      });
    }
  }

  // Check if endpoint requires dataset specification
  if (features.includes(ServiceFeature.RequiresDataset)) {
    const hasFrom = /\bFROM\s+(NAMED\s+)?/i.test(query);
    if (!hasFrom) {
      issues.push({
        from: 0,
        to: 0,
        severity: 'warning',
        message: 'Endpoint requires dataset specification (FROM or FROM NAMED clause)',
      });
    }
  }

  return issues;
}

/**
 * Check if a URI is a standard SPARQL function
 *
 * @param uri - Function URI
 * @returns true if standard SPARQL function
 */
export function isStandardFunction(uri: string): boolean {
  // Standard SPARQL namespaces
  const standardNamespaces = [
    'http://www.w3.org/2001/XMLSchema#',
    'http://www.w3.org/2005/xpath-functions#',
    'http://www.w3.org/ns/sparql#',
  ];

  return standardNamespaces.some((ns) => uri.startsWith(ns));
}

/**
 * Validate extension functions used in query
 * Checks if custom functions are supported by endpoint
 *
 * @param query - SPARQL query string
 * @param serviceDesc - Service description with extension functions
 * @returns Array of validation issues
 */
export function validateExtensionFunctions(
  query: string,
  serviceDesc: ServiceDescription
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Extract function calls with full URIs
  const functionPattern = /<([^>]+)>\s*\(/g;
  const extensionFunctions = new Set(serviceDesc.extensionFunctions.map((f) => f.uri));

  let match;
  while ((match = functionPattern.exec(query)) !== null) {
    const functionUri = match[1];

    // Check if it's a standard SPARQL function
    if (isStandardFunction(functionUri)) {
      continue;
    }

    // Check if it's in extension functions
    if (!extensionFunctions.has(functionUri)) {
      issues.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'info',
        message: `Custom function <${functionUri}> not listed in endpoint capabilities`,
      });
    }
  }

  return issues;
}

/**
 * Validate graphs used in query
 * Checks if named graphs exist in endpoint
 *
 * @param query - SPARQL query string
 * @param serviceDesc - Service description with available graphs
 * @returns Array of validation issues
 */
export function validateGraphs(
  query: string,
  serviceDesc: ServiceDescription
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Get all available graph IRIs
  const availableGraphs = new Set(
    serviceDesc.datasets.flatMap((ds) => ds.namedGraphs.map((g) => g.name))
  );

  if (availableGraphs.size === 0) {
    return issues; // No graph info available
  }

  // Check FROM NAMED clauses
  const fromNamedPattern = /\bFROM\s+NAMED\s+<([^>]+)>/gi;
  let match;
  while ((match = fromNamedPattern.exec(query)) !== null) {
    const graphIri = match[1];

    if (!availableGraphs.has(graphIri)) {
      issues.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'info',
        message: `Graph <${graphIri}> not in endpoint's named graphs list`,
        actionLabel: 'See available graphs',
      });
    }
  }

  // Check GRAPH clauses
  const graphPattern = /\bGRAPH\s+<([^>]+)>/gi;
  while ((match = graphPattern.exec(query)) !== null) {
    const graphIri = match[1];

    if (!availableGraphs.has(graphIri)) {
      issues.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'info',
        message: `Graph <${graphIri}> not in endpoint's named graphs list`,
        actionLabel: 'See available graphs',
      });
    }
  }

  return issues;
}

/**
 * Validate entire query against service description
 * Runs all validation checks
 *
 * @param query - SPARQL query string
 * @param serviceDesc - Service description
 * @param enabledChecks - Which validation checks to run
 * @returns Array of all validation issues
 */
export function validateQuery(
  query: string,
  serviceDesc: ServiceDescription | null,
  enabledChecks: {
    languageVersion?: boolean;
    features?: boolean;
    extensionFunctions?: boolean;
    graphs?: boolean;
  } = {}
): ValidationIssue[] {
  // Default: all checks enabled
  const checks = {
    languageVersion: true,
    features: true,
    extensionFunctions: false, // Disabled by default (may be noisy)
    graphs: false, // Disabled by default (may be noisy)
    ...enabledChecks,
  };

  const issues: ValidationIssue[] = [];

  // No validation without service description
  if (!serviceDesc || !serviceDesc.available) {
    return issues;
  }

  // Run enabled validation checks
  if (checks.languageVersion) {
    issues.push(...validateLanguageVersion(query, serviceDesc));
  }

  if (checks.features) {
    issues.push(...validateFeatures(query, serviceDesc));
  }

  if (checks.extensionFunctions) {
    issues.push(...validateExtensionFunctions(query, serviceDesc));
  }

  if (checks.graphs) {
    issues.push(...validateGraphs(query, serviceDesc));
  }

  return issues;
}
