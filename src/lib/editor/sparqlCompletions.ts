/**
 * SPARQL autocompletion for CodeMirror 6
 * Provides keyword and function completions with documentation
 */

import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';

/**
 * SPARQL query form keywords with documentation
 */
const queryFormCompletions: Completion[] = [
  { label: 'SELECT', type: 'keyword', info: 'Select specified variables from the query results' },
  {
    label: 'CONSTRUCT',
    type: 'keyword',
    info: 'Construct an RDF graph from the query results',
  },
  { label: 'ASK', type: 'keyword', info: 'Return a boolean indicating if results exist' },
  { label: 'DESCRIBE', type: 'keyword', info: 'Return an RDF graph describing the resources' },
];

/**
 * SPARQL clause and pattern keywords
 */
const clauseCompletions: Completion[] = [
  { label: 'WHERE', type: 'keyword', info: 'Specify the graph pattern to match' },
  { label: 'FROM', type: 'keyword', info: 'Specify the default graph for the query' },
  { label: 'FROM NAMED', type: 'keyword', info: 'Specify a named graph for the query' },
  { label: 'ORDER BY', type: 'keyword', info: 'Order the query results' },
  { label: 'GROUP BY', type: 'keyword', info: 'Group query results by expression' },
  { label: 'HAVING', type: 'keyword', info: 'Filter grouped results' },
  { label: 'LIMIT', type: 'keyword', info: 'Limit the number of results returned' },
  { label: 'OFFSET', type: 'keyword', info: 'Skip the first N results' },
  { label: 'DISTINCT', type: 'keyword', info: 'Remove duplicate results' },
  { label: 'REDUCED', type: 'keyword', info: 'Permit elimination of some non-distinct results' },
];

/**
 * SPARQL pattern keywords
 */
const patternCompletions: Completion[] = [
  { label: 'OPTIONAL', type: 'keyword', info: 'Match optional graph pattern' },
  { label: 'UNION', type: 'keyword', info: 'Union of two graph patterns' },
  { label: 'MINUS', type: 'keyword', info: 'Remove matches from results' },
  { label: 'GRAPH', type: 'keyword', info: 'Match a named graph' },
  { label: 'SERVICE', type: 'keyword', info: 'Execute a federated query' },
  { label: 'FILTER', type: 'keyword', info: 'Filter results by expression' },
  { label: 'BIND', type: 'keyword', info: 'Bind a value to a variable' },
  { label: 'VALUES', type: 'keyword', info: 'Provide inline data' },
  { label: 'EXISTS', type: 'keyword', info: 'Test if pattern exists' },
  { label: 'NOT EXISTS', type: 'keyword', info: 'Test if pattern does not exist' },
];

/**
 * SPARQL prefix and base keywords
 */
const prefixCompletions: Completion[] = [
  { label: 'PREFIX', type: 'keyword', info: 'Define a namespace prefix' },
  { label: 'BASE', type: 'keyword', info: 'Define base IRI for relative IRIs' },
];

/**
 * SPARQL modifier keywords
 */
const modifierCompletions: Completion[] = [
  { label: 'AS', type: 'keyword', info: 'Assign an expression to a variable' },
  { label: 'ASC', type: 'keyword', info: 'Sort in ascending order' },
  { label: 'DESC', type: 'keyword', info: 'Sort in descending order' },
  { label: 'SEPARATOR', type: 'keyword', info: 'Specify separator for GROUP_CONCAT' },
];

/**
 * SPARQL boolean and comparison operators
 */
const operatorCompletions: Completion[] = [
  { label: 'IN', type: 'keyword', info: 'Test if value is in a set' },
  { label: 'NOT IN', type: 'keyword', info: 'Test if value is not in a set' },
  { label: 'BOUND', type: 'function', info: 'Test if variable is bound' },
  { label: 'IF', type: 'function', info: 'Conditional expression' },
  { label: 'COALESCE', type: 'function', info: 'Return first non-error value' },
];

/**
 * SPARQL casting and conversion functions
 */
const conversionFunctions: Completion[] = [
  { label: 'STR()', type: 'function', info: 'Convert value to string' },
  { label: 'LANG()', type: 'function', info: 'Get language tag of literal' },
  { label: 'DATATYPE()', type: 'function', info: 'Get datatype IRI of literal' },
  { label: 'IRI()', type: 'function', info: 'Create IRI from string' },
  { label: 'URI()', type: 'function', info: 'Create URI from string (alias for IRI)' },
  { label: 'BNODE()', type: 'function', info: 'Create or get blank node' },
  { label: 'STRDT()', type: 'function', info: 'Create typed literal from string and datatype' },
  { label: 'STRLANG()', type: 'function', info: 'Create language-tagged literal' },
  { label: 'UUID()', type: 'function', info: 'Generate a UUID IRI' },
  { label: 'STRUUID()', type: 'function', info: 'Generate a UUID string' },
];

/**
 * SPARQL type checking functions
 */
const typeFunctions: Completion[] = [
  { label: 'isIRI()', type: 'function', info: 'Test if value is an IRI' },
  { label: 'isURI()', type: 'function', info: 'Test if value is a URI (alias for isIRI)' },
  { label: 'isBlank()', type: 'function', info: 'Test if value is a blank node' },
  { label: 'isLiteral()', type: 'function', info: 'Test if value is a literal' },
  { label: 'isNumeric()', type: 'function', info: 'Test if value is numeric' },
];

/**
 * SPARQL string functions
 */
const stringFunctions: Completion[] = [
  { label: 'STRLEN()', type: 'function', info: 'Get string length' },
  { label: 'SUBSTR()', type: 'function', info: 'Get substring' },
  { label: 'UCASE()', type: 'function', info: 'Convert to uppercase' },
  { label: 'LCASE()', type: 'function', info: 'Convert to lowercase' },
  { label: 'STRSTARTS()', type: 'function', info: 'Test if string starts with substring' },
  { label: 'STRENDS()', type: 'function', info: 'Test if string ends with substring' },
  { label: 'CONTAINS()', type: 'function', info: 'Test if string contains substring' },
  { label: 'STRBEFORE()', type: 'function', info: 'Get substring before match' },
  { label: 'STRAFTER()', type: 'function', info: 'Get substring after match' },
  { label: 'ENCODE_FOR_URI()', type: 'function', info: 'Encode string for use in URI' },
  { label: 'CONCAT()', type: 'function', info: 'Concatenate strings' },
  { label: 'LANGMATCHES()', type: 'function', info: 'Test if language tag matches' },
  { label: 'REGEX()', type: 'function', info: 'Test if string matches regular expression' },
  { label: 'REPLACE()', type: 'function', info: 'Replace substring with regex' },
];

/**
 * SPARQL numeric functions
 */
const numericFunctions: Completion[] = [
  { label: 'ABS()', type: 'function', info: 'Get absolute value' },
  { label: 'ROUND()', type: 'function', info: 'Round to nearest integer' },
  { label: 'CEIL()', type: 'function', info: 'Round up to integer' },
  { label: 'FLOOR()', type: 'function', info: 'Round down to integer' },
  { label: 'RAND()', type: 'function', info: 'Generate random number between 0 and 1' },
];

/**
 * SPARQL date/time functions
 */
const dateFunctions: Completion[] = [
  { label: 'NOW()', type: 'function', info: 'Get current datetime' },
  { label: 'YEAR()', type: 'function', info: 'Extract year from datetime' },
  { label: 'MONTH()', type: 'function', info: 'Extract month from datetime' },
  { label: 'DAY()', type: 'function', info: 'Extract day from datetime' },
  { label: 'HOURS()', type: 'function', info: 'Extract hours from datetime' },
  { label: 'MINUTES()', type: 'function', info: 'Extract minutes from datetime' },
  { label: 'SECONDS()', type: 'function', info: 'Extract seconds from datetime' },
  { label: 'TIMEZONE()', type: 'function', info: 'Get timezone from datetime' },
  { label: 'TZ()', type: 'function', info: 'Get timezone string from datetime' },
];

/**
 * SPARQL aggregate functions
 */
const aggregateFunctions: Completion[] = [
  { label: 'COUNT()', type: 'function', info: 'Count the number of values' },
  { label: 'SUM()', type: 'function', info: 'Sum numeric values' },
  { label: 'MIN()', type: 'function', info: 'Get minimum value' },
  { label: 'MAX()', type: 'function', info: 'Get maximum value' },
  { label: 'AVG()', type: 'function', info: 'Calculate average of numeric values' },
  {
    label: 'SAMPLE()',
    type: 'function',
    info: 'Get an arbitrary value from the group',
  },
  {
    label: 'GROUP_CONCAT()',
    type: 'function',
    info: 'Concatenate strings from a group',
  },
];

/**
 * SPARQL hash functions
 */
const hashFunctions: Completion[] = [
  { label: 'MD5()', type: 'function', info: 'Calculate MD5 hash' },
  { label: 'SHA1()', type: 'function', info: 'Calculate SHA1 hash' },
  { label: 'SHA256()', type: 'function', info: 'Calculate SHA256 hash' },
  { label: 'SHA384()', type: 'function', info: 'Calculate SHA384 hash' },
  { label: 'SHA512()', type: 'function', info: 'Calculate SHA512 hash' },
];

/**
 * All SPARQL completions combined
 */
export const sparqlCompletions: Completion[] = [
  ...queryFormCompletions,
  ...clauseCompletions,
  ...patternCompletions,
  ...prefixCompletions,
  ...modifierCompletions,
  ...operatorCompletions,
  ...conversionFunctions,
  ...typeFunctions,
  ...stringFunctions,
  ...numericFunctions,
  ...dateFunctions,
  ...aggregateFunctions,
  ...hashFunctions,
];

/**
 * Completion function for SPARQL
 * Provides context-aware completions for CodeMirror
 *
 * @param context - CodeMirror completion context
 * @returns Completion result or null
 */
export function sparqlCompletion(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\w*/);

  // Don't show completions if:
  // - No word is being typed
  // - Word hasn't started and completion wasn't explicitly requested (Ctrl+Space)
  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }

  return {
    from: word.from,
    options: sparqlCompletions,
    filter: true, // Let CodeMirror handle filtering
  };
}
