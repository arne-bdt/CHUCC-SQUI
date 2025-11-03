/**
 * Query Analyzer - Analyzes SPARQL queries for performance and memory implications
 *
 * This module provides functionality to analyze SPARQL queries before execution
 * to detect potential performance issues and provide proactive warnings.
 */

export interface QueryAnalysis {
  /** Whether the query has a LIMIT clause */
  hasLimit: boolean;
  /** The LIMIT value if present */
  limitValue?: number;
  /** Whether the query has an OFFSET clause */
  hasOffset: boolean;
  /** The OFFSET value if present */
  offsetValue?: number;
  /** Estimated result size category */
  estimatedRowCount: 'small' | 'medium' | 'large' | 'unbounded';
  /** Estimated memory usage in MB (rough approximation) */
  estimatedMemoryMB?: number;
  /** Recommendation for how to handle this query */
  recommendation: 'safe' | 'warn' | 'download-instead';
  /** List of warnings about this query */
  warnings: string[];
}

/**
 * Analyzes a SPARQL query to determine potential performance and memory issues
 *
 * @param query - The SPARQL query string to analyze
 * @returns QueryAnalysis object with recommendations and warnings
 *
 * @example
 * ```typescript
 * const analysis = analyzeQuery('SELECT * WHERE { ?s ?p ?o } LIMIT 100000');
 * if (analysis.recommendation === 'download-instead') {
 *   showWarningDialog();
 * }
 * ```
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const normalized = query.toUpperCase();

  // Check for LIMIT clause
  const limitMatch = normalized.match(/LIMIT\s+(\d+)/);
  const hasLimit = !!limitMatch;
  const limitValue = limitMatch ? parseInt(limitMatch[1], 10) : undefined;

  // Check for OFFSET clause
  const offsetMatch = normalized.match(/OFFSET\s+(\d+)/);
  const hasOffset = !!offsetMatch;
  const offsetValue = offsetMatch ? parseInt(offsetMatch[1], 10) : undefined;

  // Estimate result size
  let estimatedRowCount: QueryAnalysis['estimatedRowCount'];
  let estimatedMemoryMB: number | undefined;

  if (!hasLimit) {
    estimatedRowCount = 'unbounded';
  } else if (limitValue! < 1000) {
    estimatedRowCount = 'small';
    estimatedMemoryMB = limitValue! * 0.001; // ~1 KB per row
  } else if (limitValue! < 10000) {
    estimatedRowCount = 'medium';
    estimatedMemoryMB = limitValue! * 0.001;
  } else {
    estimatedRowCount = 'large';
    estimatedMemoryMB = limitValue! * 0.001;
  }

  // Determine recommendation
  let recommendation: QueryAnalysis['recommendation'];
  const warnings: string[] = [];

  if (!hasLimit) {
    recommendation = 'download-instead';
    warnings.push('Query has no LIMIT clause - may return millions of results');
  } else if (limitValue! > 50000) {
    recommendation = 'download-instead';
    warnings.push(`Large LIMIT (${limitValue!.toLocaleString('en-US')}) - may exhaust browser memory`);
  } else if (limitValue! >= 10000) {
    recommendation = 'warn';
    warnings.push(`Medium LIMIT (${limitValue!.toLocaleString('en-US')}) - may be slow`);
  } else {
    recommendation = 'safe';
  }

  // Warn about OFFSET usage
  if (hasOffset && offsetValue! > 10000) {
    warnings.push(`Large OFFSET (${offsetValue!.toLocaleString('en-US')}) - query may be slow`);
  }

  return {
    hasLimit,
    limitValue,
    hasOffset,
    offsetValue,
    estimatedRowCount,
    estimatedMemoryMB,
    recommendation,
    warnings,
  };
}

/**
 * Gets configurable thresholds for query analysis
 * Can be extended to read from settings store
 */
export interface QueryThresholds {
  /** Threshold for warning about query size */
  warnThreshold: number;
  /** Threshold for recommending download instead of view */
  downloadThreshold: number;
  /** Maximum rows to display in browser */
  maxRows: number;
}

/**
 * Default thresholds for query analysis
 */
export const DEFAULT_THRESHOLDS: QueryThresholds = {
  warnThreshold: 10000,
  downloadThreshold: 50000,
  maxRows: 10000,
};
