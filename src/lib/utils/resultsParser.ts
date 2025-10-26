/**
 * SPARQL Results Parser
 * Parses SPARQL JSON Results format into table-ready data structures
 * @see https://www.w3.org/TR/sparql11-results-json/
 */

import type { SparqlJsonResults, SparqlBinding, SparqlTerm } from '../types';

/**
 * Parsed table cell with display value and metadata
 */
export interface ParsedCell {
  /** Display value (string representation) */
  value: string;
  /** Original term type */
  type: 'uri' | 'literal' | 'bnode' | 'unbound';
  /** Datatype URI for typed literals */
  datatype?: string;
  /** Language tag for language-tagged literals */
  lang?: string;
  /** Raw value for URIs (for linking) */
  rawValue?: string;
}

/**
 * Parsed table row
 */
export interface ParsedRow {
  /** Row cells indexed by variable name */
  [variable: string]: ParsedCell;
}

/**
 * Parsed table data ready for display
 */
export interface ParsedTableData {
  /** Column names (variable names) */
  columns: string[];
  /** Table rows with parsed cells */
  rows: ParsedRow[];
  /** Total number of rows */
  rowCount: number;
  /** Variable names from query head */
  vars: string[];
}

/**
 * Parsed ASK query result
 */
export interface ParsedAskResult {
  /** Boolean result */
  value: boolean;
  /** Result type marker */
  type: 'boolean';
}

/**
 * Union type for all parsed results
 */
export type ParsedResults = ParsedTableData | ParsedAskResult;

/**
 * Parse SPARQL JSON Results into table-ready format
 * Handles both SELECT and ASK queries
 *
 * @param results Raw SPARQL JSON results
 * @returns Parsed results ready for display
 */
export function parseResults(results: SparqlJsonResults): ParsedResults {
  // ASK query - return boolean result
  if (results.boolean !== undefined) {
    return {
      value: results.boolean,
      type: 'boolean',
    };
  }

  // SELECT query - parse table data
  if (results.results && results.results.bindings) {
    return parseTableResults(results);
  }

  // Empty results
  return {
    columns: results.head.vars || [],
    rows: [],
    rowCount: 0,
    vars: results.head.vars || [],
  };
}

/**
 * Parse SELECT query results into table format
 *
 * @param results SPARQL JSON results with bindings
 * @returns Parsed table data
 */
export function parseTableResults(results: SparqlJsonResults): ParsedTableData {
  const vars = results.head.vars || [];
  const bindings = results.results?.bindings || [];

  const rows: ParsedRow[] = bindings.map((binding) => {
    const row: ParsedRow = {};

    // Create a cell for each variable
    for (const varName of vars) {
      const term = binding[varName];
      row[varName] = term ? parseTerm(term) : createUnboundCell();
    }

    return row;
  });

  return {
    columns: vars,
    rows,
    rowCount: rows.length,
    vars,
  };
}

/**
 * Parse a single SPARQL term into a cell
 *
 * @param term SPARQL term (uri, literal, or bnode)
 * @returns Parsed cell with display value and metadata
 */
export function parseTerm(term: SparqlTerm): ParsedCell {
  const { type, value } = term;

  switch (type) {
    case 'uri':
      return {
        value: value,
        type: 'uri',
        rawValue: value,
      };

    case 'literal':
      return parseLiteral(term);

    case 'bnode':
      return {
        value: value,
        type: 'bnode',
        rawValue: value,
      };

    default:
      // Fallback for unknown types
      return {
        value: String(value),
        type: 'literal',
      };
  }
}

/**
 * Parse a literal term with datatype and language tag handling
 *
 * @param term Literal SPARQL term
 * @returns Parsed cell with literal metadata
 */
export function parseLiteral(term: SparqlTerm): ParsedCell {
  const { value } = term;
  const datatype = term.datatype;
  const lang = term['xml:lang'];

  const cell: ParsedCell = {
    value: value,
    type: 'literal',
  };

  // Add language tag if present
  if (lang) {
    cell.lang = lang;
  }

  // Add datatype if present
  if (datatype) {
    cell.datatype = datatype;
  }

  return cell;
}

/**
 * Create an unbound cell (for variables without bindings)
 *
 * @returns Unbound cell marker
 */
export function createUnboundCell(): ParsedCell {
  return {
    value: '',
    type: 'unbound',
  };
}

/**
 * Check if results are from an ASK query
 *
 * @param results SPARQL JSON results
 * @returns True if ASK query results
 */
export function isAskResult(results: SparqlJsonResults): boolean {
  return results.boolean !== undefined;
}

/**
 * Check if results are from a SELECT query
 *
 * @param results SPARQL JSON results
 * @returns True if SELECT query results
 */
export function isSelectResult(results: SparqlJsonResults): boolean {
  return results.results !== undefined && results.results.bindings !== undefined;
}

/**
 * Get display value for a cell
 * Formats the value based on type with appropriate decorations
 *
 * @param cell Parsed cell
 * @param options Display options
 * @returns Formatted display string
 */
export function getCellDisplayValue(
  cell: ParsedCell,
  options: {
    showDatatype?: boolean;
    showLang?: boolean;
    abbreviateUri?: boolean;
  } = {}
): string {
  const { showDatatype = true, showLang = true, abbreviateUri = false } = options;

  let displayValue = cell.value;

  // For unbound cells, return empty or placeholder
  if (cell.type === 'unbound') {
    return '';
  }

  // For URIs, optionally abbreviate (will be handled by prefix service later)
  if (cell.type === 'uri' && abbreviateUri) {
    // Abbreviation will be handled by prefixService in later tasks
    displayValue = cell.value;
  }

  // Add language tag for literals
  if (cell.type === 'literal' && cell.lang && showLang) {
    displayValue = `"${cell.value}"@${cell.lang}`;
  }

  // Add datatype for literals (if not a plain literal)
  if (
    cell.type === 'literal' &&
    cell.datatype &&
    showDatatype &&
    !cell.lang // Don't show both lang and datatype
  ) {
    // Abbreviate common XSD datatypes
    const datatypeAbbrev = abbreviateDatatype(cell.datatype);
    displayValue = `"${cell.value}"^^${datatypeAbbrev}`;
  }

  // For blank nodes, keep as-is
  if (cell.type === 'bnode') {
    displayValue = cell.value;
  }

  return displayValue;
}

/**
 * Abbreviate common datatype URIs for compact display
 *
 * @param datatype Full datatype URI
 * @returns Abbreviated datatype or full URI
 */
export function abbreviateDatatype(datatype: string): string {
  const xsdPrefix = 'http://www.w3.org/2001/XMLSchema#';
  const rdfPrefix = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

  if (datatype.startsWith(xsdPrefix)) {
    return `xsd:${datatype.substring(xsdPrefix.length)}`;
  }

  if (datatype.startsWith(rdfPrefix)) {
    return `rdf:${datatype.substring(rdfPrefix.length)}`;
  }

  return datatype;
}

/**
 * Get statistics about parsed results
 *
 * @param results Parsed results
 * @returns Statistics object
 */
export function getResultStats(results: ParsedResults): {
  type: 'select' | 'ask';
  rowCount?: number;
  columnCount?: number;
  booleanValue?: boolean;
} {
  if ('type' in results && results.type === 'boolean') {
    return {
      type: 'ask',
      booleanValue: results.value,
    };
  }

  // TypeScript type narrowing: if not ASK result, must be table data
  const tableData = results as ParsedTableData;
  return {
    type: 'select',
    rowCount: tableData.rowCount,
    columnCount: tableData.columns.length,
  };
}
