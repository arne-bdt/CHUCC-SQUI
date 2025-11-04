/**
 * Unit tests for query analysis utilities
 * Tests context detection for graph name auto-completion
 */

import { describe, it, expect } from 'vitest';
import {
  isInFromClause,
  isFromNamed,
  getCompletionStart,
  getPartialText,
} from '../../src/lib/editor/utils/queryAnalysis';
import { EditorState } from '@codemirror/state';

/**
 * Helper to create a mock CompletionContext
 */
function createMockContext(text: string, cursorPos?: number) {
  const state = EditorState.create({ doc: text });
  const pos = cursorPos !== undefined ? cursorPos : text.length;

  return {
    state,
    pos,
    explicit: false,
    // Mock methods required by CompletionContext
    matchBefore: () => null,
    aborted: false,
    addEventListener: () => {},
  } as any;
}

describe('isInFromClause', () => {
  it('should return true for FROM clause', () => {
    expect(isInFromClause('SELECT * FROM ')).toBe(true);
    expect(isInFromClause('SELECT * FROM  ')).toBe(true);
    expect(isInFromClause('select * from ')).toBe(true);
  });

  it('should return true for FROM NAMED clause', () => {
    expect(isInFromClause('SELECT * FROM NAMED ')).toBe(true);
    expect(isInFromClause('SELECT * FROM named ')).toBe(true);
    expect(isInFromClause('select * from named ')).toBe(true);
  });

  it('should return true with partial IRI', () => {
    expect(isInFromClause('SELECT * FROM <http://ex')).toBe(true);
    expect(isInFromClause('SELECT * FROM NAMED <http://example.org')).toBe(true);
  });

  it('should return true with complete IRIs (multiple FROMs)', () => {
    expect(isInFromClause('SELECT * FROM <http://example.org/graph1> FROM ')).toBe(true);
    expect(isInFromClause('SELECT * FROM NAMED <http://example.org/g1> FROM NAMED ')).toBe(true);
  });

  it('should return true with prefixed names', () => {
    expect(isInFromClause('SELECT * FROM ex:graph ')).toBe(true);
    expect(isInFromClause('SELECT * FROM NAMED ex:dat')).toBe(true);
  });

  it('should return false for non-FROM contexts', () => {
    expect(isInFromClause('SELECT * WHERE {')).toBe(false);
    expect(isInFromClause('SELECT * WHERE { ?s ?p ?o }')).toBe(false);
    expect(isInFromClause('PREFIX ex: <http://example.org/>')).toBe(false);
    expect(isInFromClause('SELECT ')).toBe(false);
    expect(isInFromClause('')).toBe(false);
  });

  it('should return false when FROM is part of another word', () => {
    expect(isInFromClause('SELECT * WHERE { ?fromDate ')).toBe(false);
    expect(isInFromClause('# Comment about FROM')).toBe(false);
  });

  it('should handle multiline queries', () => {
    const multiline = `
      PREFIX ex: <http://example.org/>
      SELECT *
      FROM
    `;
    expect(isInFromClause(multiline)).toBe(true);
  });
});

describe('isFromNamed', () => {
  it('should return true for FROM NAMED clause', () => {
    expect(isFromNamed('SELECT * FROM NAMED ')).toBe(true);
    expect(isFromNamed('SELECT * FROM named ')).toBe(true);
    expect(isFromNamed('select * from NAMED ')).toBe(true);
  });

  it('should return true for FROM NAMED with partial IRI', () => {
    expect(isFromNamed('SELECT * FROM NAMED <http://ex')).toBe(true);
    expect(isFromNamed('SELECT * FROM NAMED <http://example.org/graph')).toBe(true);
  });

  it('should return true for FROM NAMED with prefixed name', () => {
    expect(isFromNamed('SELECT * FROM NAMED ex:graph')).toBe(true);
    expect(isFromNamed('SELECT * FROM NAMED ex:dat')).toBe(true);
  });

  it('should return true for multiple FROM NAMED clauses', () => {
    expect(isFromNamed('SELECT * FROM NAMED <http://ex.org/g1> FROM NAMED ')).toBe(true);
  });

  it('should return false for FROM (not FROM NAMED)', () => {
    expect(isFromNamed('SELECT * FROM ')).toBe(false);
    expect(isFromNamed('SELECT * FROM <http://example.org>')).toBe(false);
  });

  it('should return false for non-FROM contexts', () => {
    expect(isFromNamed('SELECT * WHERE {')).toBe(false);
    expect(isFromNamed('PREFIX ex: <http://example.org/>')).toBe(false);
    expect(isFromNamed('')).toBe(false);
  });

  it('should handle multiline queries', () => {
    const multiline = `
      PREFIX ex: <http://example.org/>
      SELECT *
      FROM NAMED
    `;
    expect(isFromNamed(multiline)).toBe(true);
  });
});

describe('getCompletionStart', () => {
  it('should return position after < for partial IRI', () => {
    const text = 'SELECT * FROM <http://ex';
    const context = createMockContext(text);
    const start = getCompletionStart(context);
    // Should start at 'h' of 'http'
    expect(start).toBe(text.indexOf('http'));
  });

  it('should handle empty IRI', () => {
    const text = 'SELECT * FROM <';
    const context = createMockContext(text);
    const start = getCompletionStart(context);
    // Should start right after '<'
    expect(start).toBe(text.length);
  });

  it('should handle prefixed name', () => {
    const text = 'SELECT * FROM ex:dat';
    const context = createMockContext(text);
    const start = getCompletionStart(context);
    // Should start at 'e' of 'ex:'
    expect(start).toBe(text.indexOf('ex:'));
  });

  it('should handle partial prefix', () => {
    const text = 'SELECT * FROM e';
    const context = createMockContext(text);
    const start = getCompletionStart(context);
    // No prefix pattern match, should return current position
    expect(start).toBe(text.length);
  });

  it('should return current position when no partial IRI or prefix', () => {
    const text = 'SELECT * FROM ';
    const context = createMockContext(text);
    const start = getCompletionStart(context);
    expect(start).toBe(text.length);
  });

  it('should handle FROM NAMED with partial IRI', () => {
    const text = 'SELECT * FROM NAMED <http://example.org/dat';
    const context = createMockContext(text);
    const start = getCompletionStart(context);
    expect(start).toBe(text.indexOf('http'));
  });
});

describe('getPartialText', () => {
  it('should extract partial IRI (without angle bracket)', () => {
    const text = 'SELECT * FROM <http://ex';
    const context = createMockContext(text);
    const partial = getPartialText(context);
    expect(partial).toBe('http://ex');
  });

  it('should handle empty IRI', () => {
    const text = 'SELECT * FROM <';
    const context = createMockContext(text);
    const partial = getPartialText(context);
    expect(partial).toBe('');
  });

  it('should extract prefixed name', () => {
    const text = 'SELECT * FROM ex:dat';
    const context = createMockContext(text);
    const partial = getPartialText(context);
    expect(partial).toBe('ex:dat');
  });

  it('should handle partial prefix', () => {
    const text = 'SELECT * FROM ex:';
    const context = createMockContext(text);
    const partial = getPartialText(context);
    expect(partial).toBe('ex:');
  });

  it('should return empty string when no partial text', () => {
    const text = 'SELECT * FROM ';
    const context = createMockContext(text);
    const partial = getPartialText(context);
    expect(partial).toBe('');
  });

  it('should handle FROM NAMED with partial IRI', () => {
    const text = 'SELECT * FROM NAMED <http://example.org/graph';
    const context = createMockContext(text);
    const partial = getPartialText(context);
    expect(partial).toBe('http://example.org/graph');
  });

  it('should handle complex IRIs', () => {
    const text = 'SELECT * FROM <http://example.org/dataset/v1/';
    const context = createMockContext(text);
    const partial = getPartialText(context);
    expect(partial).toBe('http://example.org/dataset/v1/');
  });
});

describe('edge cases', () => {
  it('should handle queries with comments', () => {
    const text = `
      # This is a comment about FROM
      SELECT * FROM
    `;
    expect(isInFromClause(text)).toBe(true);
  });

  it('should handle queries with strings containing FROM', () => {
    // Note: This is a limitation - the regex doesn't distinguish strings
    // In practice, CodeMirror provides more context, so this is acceptable
    const text = 'SELECT "FROM" FROM ';
    expect(isInFromClause(text)).toBe(true);
  });

  it('should handle multiple whitespace', () => {
    expect(isInFromClause('SELECT * FROM   ')).toBe(true);
    expect(isFromNamed('SELECT * FROM   NAMED   ')).toBe(true);
  });

  it('should handle tabs and newlines', () => {
    expect(isInFromClause('SELECT * FROM\t')).toBe(true);
    expect(isInFromClause('SELECT * FROM\n')).toBe(true);
  });

  it('should handle mixed case', () => {
    expect(isInFromClause('SELECT * FrOm ')).toBe(true);
    expect(isFromNamed('SELECT * FrOm NaMeD ')).toBe(true);
  });
});
