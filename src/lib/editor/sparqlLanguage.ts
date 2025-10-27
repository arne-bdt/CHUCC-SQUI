/**
 * SPARQL language support for CodeMirror 6
 * Provides syntax highlighting for SPARQL queries
 */

import { StreamLanguage } from '@codemirror/language';
import type { StreamParser } from '@codemirror/language';

/**
 * SPARQL keywords (case-insensitive)
 */
const sparqlKeywords = new Set([
  'SELECT',
  'CONSTRUCT',
  'ASK',
  'DESCRIBE',
  'WHERE',
  'FILTER',
  'OPTIONAL',
  'UNION',
  'PREFIX',
  'BASE',
  'DISTINCT',
  'REDUCED',
  'LIMIT',
  'OFFSET',
  'ORDER',
  'BY',
  'ASC',
  'DESC',
  'FROM',
  'NAMED',
  'GRAPH',
  'BIND',
  'SERVICE',
  'VALUES',
  'GROUP',
  'HAVING',
  'MINUS',
  'EXISTS',
  'NOT',
  'AS',
  'IN',
  'SAMPLE',
  'COUNT',
  'SUM',
  'MIN',
  'MAX',
  'AVG',
  'STR',
  'LANG',
  'LANGMATCHES',
  'DATATYPE',
  'BOUND',
  'IRI',
  'URI',
  'BNODE',
  'RAND',
  'ABS',
  'CEIL',
  'FLOOR',
  'ROUND',
  'CONCAT',
  'STRLEN',
  'UCASE',
  'LCASE',
  'ENCODE_FOR_URI',
  'CONTAINS',
  'STRSTARTS',
  'STRENDS',
  'STRBEFORE',
  'STRAFTER',
  'YEAR',
  'MONTH',
  'DAY',
  'HOURS',
  'MINUTES',
  'SECONDS',
  'TIMEZONE',
  'TZ',
  'NOW',
  'UUID',
  'STRUUID',
  'MD5',
  'SHA1',
  'SHA256',
  'SHA384',
  'SHA512',
  'COALESCE',
  'IF',
  'STRLANG',
  'STRDT',
  'SAMETERM',
  'ISIRI',
  'ISURI',
  'ISBLANK',
  'ISLITERAL',
  'ISNUMERIC',
  'REGEX',
  'SUBSTR',
  'REPLACE',
  'A',
]);

/**
 * SPARQL built-in functions and operators
 */
const sparqlBuiltins = new Set([
  'true',
  'false',
  'a', // RDF type shorthand
]);

/**
 * SPARQL stream parser for syntax highlighting
 */
const sparqlParser: StreamParser<unknown> = {
  token(stream, _state) {
    // Whitespace
    if (stream.eatSpace()) {
      return null;
    }

    // Comments
    if (stream.match('#')) {
      stream.skipToEnd();
      return 'comment';
    }

    // String literals - double quotes
    if (stream.match('"')) {
      while (!stream.eol()) {
        if (stream.next() === '"') {
          if (stream.peek() !== '"') {
            break;
          }
          stream.next(); // consume escaped quote
        }
      }
      return 'string';
    }

    // String literals - single quotes
    if (stream.match("'")) {
      while (!stream.eol()) {
        if (stream.next() === "'") {
          if (stream.peek() !== "'") {
            break;
          }
          stream.next(); // consume escaped quote
        }
      }
      return 'string';
    }

    // IRIs - <http://example.org/resource>
    if (stream.match('<')) {
      while (!stream.eol()) {
        if (stream.next() === '>') {
          break;
        }
      }
      return 'link';
    }

    // Prefixed names - prefix:localName
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/)) {
      stream.match(/^[a-zA-Z0-9_-]*/);
      return 'propertyName';
    }

    // Variables - ?var or $var
    if (stream.match(/^[?$][a-zA-Z_][a-zA-Z0-9_]*/)) {
      return 'variableName';
    }

    // Numbers
    if (stream.match(/^[0-9]+\.?[0-9]*([eE][+-]?[0-9]+)?/)) {
      return 'number';
    }

    // Operators and punctuation
    if (stream.match(/^[{}[\](),;.]/)) {
      return 'punctuation';
    }

    // Operators
    if (stream.match(/^(<=|>=|!=|&&|\|\||[<>=!+\-*/])/)) {
      return 'operator';
    }

    // Keywords and built-ins
    const wordMatch = stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (wordMatch && Array.isArray(wordMatch)) {
      const word = wordMatch[0];
      const upperWord = word.toUpperCase();
      if (sparqlKeywords.has(upperWord)) {
        return 'keyword';
      }
      if (sparqlBuiltins.has(word.toLowerCase())) {
        return 'atom';
      }
      return null; // No special highlighting for regular words
    }

    // Default: advance one character
    stream.next();
    return null;
  },
};

/**
 * Create SPARQL language support for CodeMirror
 */
export function sparql(): StreamLanguage<unknown> {
  return StreamLanguage.define(sparqlParser);
}

/**
 * Export keyword list for autocomplete
 */
export { sparqlKeywords };
