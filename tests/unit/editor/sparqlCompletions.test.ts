/**
 * Tests for SPARQL autocompletion
 */

import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import type { CompletionContext } from '@codemirror/autocomplete';
import { sparqlCompletions, sparqlCompletion } from '../../../src/lib/editor/sparqlCompletions';

describe('SPARQL Completions', () => {
  describe('Completion list', () => {
    it('should have completions', () => {
      expect(sparqlCompletions).toBeDefined();
      expect(sparqlCompletions.length).toBeGreaterThan(0);
    });

    it('should have at least 80 completions', () => {
      // We have a comprehensive list of keywords and functions
      expect(sparqlCompletions.length).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Query form keywords', () => {
    it('should include SELECT', () => {
      const select = sparqlCompletions.find((c) => c.label === 'SELECT');
      expect(select).toBeDefined();
      expect(select?.type).toBe('keyword');
      expect(select?.info).toBeTruthy();
    });

    it('should include CONSTRUCT', () => {
      const construct = sparqlCompletions.find((c) => c.label === 'CONSTRUCT');
      expect(construct).toBeDefined();
      expect(construct?.type).toBe('keyword');
    });

    it('should include ASK', () => {
      const ask = sparqlCompletions.find((c) => c.label === 'ASK');
      expect(ask).toBeDefined();
      expect(ask?.type).toBe('keyword');
    });

    it('should include DESCRIBE', () => {
      const describe = sparqlCompletions.find((c) => c.label === 'DESCRIBE');
      expect(describe).toBeDefined();
      expect(describe?.type).toBe('keyword');
    });
  });

  describe('Clause keywords', () => {
    it('should include WHERE', () => {
      const where = sparqlCompletions.find((c) => c.label === 'WHERE');
      expect(where).toBeDefined();
      expect(where?.type).toBe('keyword');
    });

    it('should include FROM', () => {
      const from = sparqlCompletions.find((c) => c.label === 'FROM');
      expect(from).toBeDefined();
      expect(from?.type).toBe('keyword');
    });

    it('should include ORDER BY', () => {
      const orderBy = sparqlCompletions.find((c) => c.label === 'ORDER BY');
      expect(orderBy).toBeDefined();
      expect(orderBy?.type).toBe('keyword');
    });

    it('should include GROUP BY', () => {
      const groupBy = sparqlCompletions.find((c) => c.label === 'GROUP BY');
      expect(groupBy).toBeDefined();
      expect(groupBy?.type).toBe('keyword');
    });

    it('should include LIMIT', () => {
      const limit = sparqlCompletions.find((c) => c.label === 'LIMIT');
      expect(limit).toBeDefined();
      expect(limit?.type).toBe('keyword');
    });

    it('should include OFFSET', () => {
      const offset = sparqlCompletions.find((c) => c.label === 'OFFSET');
      expect(offset).toBeDefined();
      expect(offset?.type).toBe('keyword');
    });

    it('should include DISTINCT', () => {
      const distinct = sparqlCompletions.find((c) => c.label === 'DISTINCT');
      expect(distinct).toBeDefined();
      expect(distinct?.type).toBe('keyword');
    });
  });

  describe('Pattern keywords', () => {
    it('should include OPTIONAL', () => {
      const optional = sparqlCompletions.find((c) => c.label === 'OPTIONAL');
      expect(optional).toBeDefined();
      expect(optional?.type).toBe('keyword');
    });

    it('should include UNION', () => {
      const union = sparqlCompletions.find((c) => c.label === 'UNION');
      expect(union).toBeDefined();
      expect(union?.type).toBe('keyword');
    });

    it('should include FILTER', () => {
      const filter = sparqlCompletions.find((c) => c.label === 'FILTER');
      expect(filter).toBeDefined();
      expect(filter?.type).toBe('keyword');
    });

    it('should include BIND', () => {
      const bind = sparqlCompletions.find((c) => c.label === 'BIND');
      expect(bind).toBeDefined();
      expect(bind?.type).toBe('keyword');
    });

    it('should include GRAPH', () => {
      const graph = sparqlCompletions.find((c) => c.label === 'GRAPH');
      expect(graph).toBeDefined();
      expect(graph?.type).toBe('keyword');
    });

    it('should include MINUS', () => {
      const minus = sparqlCompletions.find((c) => c.label === 'MINUS');
      expect(minus).toBeDefined();
      expect(minus?.type).toBe('keyword');
    });

    it('should include EXISTS', () => {
      const exists = sparqlCompletions.find((c) => c.label === 'EXISTS');
      expect(exists).toBeDefined();
      expect(exists?.type).toBe('keyword');
    });
  });

  describe('Prefix keywords', () => {
    it('should include PREFIX', () => {
      const prefix = sparqlCompletions.find((c) => c.label === 'PREFIX');
      expect(prefix).toBeDefined();
      expect(prefix?.type).toBe('keyword');
    });

    it('should include BASE', () => {
      const base = sparqlCompletions.find((c) => c.label === 'BASE');
      expect(base).toBeDefined();
      expect(base?.type).toBe('keyword');
    });
  });

  describe('String functions', () => {
    it('should include STR', () => {
      const str = sparqlCompletions.find((c) => c.label === 'STR()');
      expect(str).toBeDefined();
      expect(str?.type).toBe('function');
      expect(str?.info).toBeTruthy();
    });

    it('should include CONCAT', () => {
      const concat = sparqlCompletions.find((c) => c.label === 'CONCAT()');
      expect(concat).toBeDefined();
      expect(concat?.type).toBe('function');
    });

    it('should include STRLEN', () => {
      const strlen = sparqlCompletions.find((c) => c.label === 'STRLEN()');
      expect(strlen).toBeDefined();
      expect(strlen?.type).toBe('function');
    });

    it('should include UCASE', () => {
      const ucase = sparqlCompletions.find((c) => c.label === 'UCASE()');
      expect(ucase).toBeDefined();
      expect(ucase?.type).toBe('function');
    });

    it('should include LCASE', () => {
      const lcase = sparqlCompletions.find((c) => c.label === 'LCASE()');
      expect(lcase).toBeDefined();
      expect(lcase?.type).toBe('function');
    });

    it('should include CONTAINS', () => {
      const contains = sparqlCompletions.find((c) => c.label === 'CONTAINS()');
      expect(contains).toBeDefined();
      expect(contains?.type).toBe('function');
    });

    it('should include REGEX', () => {
      const regex = sparqlCompletions.find((c) => c.label === 'REGEX()');
      expect(regex).toBeDefined();
      expect(regex?.type).toBe('function');
    });
  });

  describe('Numeric functions', () => {
    it('should include ABS', () => {
      const abs = sparqlCompletions.find((c) => c.label === 'ABS()');
      expect(abs).toBeDefined();
      expect(abs?.type).toBe('function');
    });

    it('should include ROUND', () => {
      const round = sparqlCompletions.find((c) => c.label === 'ROUND()');
      expect(round).toBeDefined();
      expect(round?.type).toBe('function');
    });

    it('should include CEIL', () => {
      const ceil = sparqlCompletions.find((c) => c.label === 'CEIL()');
      expect(ceil).toBeDefined();
      expect(ceil?.type).toBe('function');
    });

    it('should include FLOOR', () => {
      const floor = sparqlCompletions.find((c) => c.label === 'FLOOR()');
      expect(floor).toBeDefined();
      expect(floor?.type).toBe('function');
    });

    it('should include RAND', () => {
      const rand = sparqlCompletions.find((c) => c.label === 'RAND()');
      expect(rand).toBeDefined();
      expect(rand?.type).toBe('function');
    });
  });

  describe('Date/Time functions', () => {
    it('should include NOW', () => {
      const now = sparqlCompletions.find((c) => c.label === 'NOW()');
      expect(now).toBeDefined();
      expect(now?.type).toBe('function');
    });

    it('should include YEAR', () => {
      const year = sparqlCompletions.find((c) => c.label === 'YEAR()');
      expect(year).toBeDefined();
      expect(year?.type).toBe('function');
    });

    it('should include MONTH', () => {
      const month = sparqlCompletions.find((c) => c.label === 'MONTH()');
      expect(month).toBeDefined();
      expect(month?.type).toBe('function');
    });

    it('should include DAY', () => {
      const day = sparqlCompletions.find((c) => c.label === 'DAY()');
      expect(day).toBeDefined();
      expect(day?.type).toBe('function');
    });
  });

  describe('Aggregate functions', () => {
    it('should include COUNT', () => {
      const count = sparqlCompletions.find((c) => c.label === 'COUNT()');
      expect(count).toBeDefined();
      expect(count?.type).toBe('function');
    });

    it('should include SUM', () => {
      const sum = sparqlCompletions.find((c) => c.label === 'SUM()');
      expect(sum).toBeDefined();
      expect(sum?.type).toBe('function');
    });

    it('should include MIN', () => {
      const min = sparqlCompletions.find((c) => c.label === 'MIN()');
      expect(min).toBeDefined();
      expect(min?.type).toBe('function');
    });

    it('should include MAX', () => {
      const max = sparqlCompletions.find((c) => c.label === 'MAX()');
      expect(max).toBeDefined();
      expect(max?.type).toBe('function');
    });

    it('should include AVG', () => {
      const avg = sparqlCompletions.find((c) => c.label === 'AVG()');
      expect(avg).toBeDefined();
      expect(avg?.type).toBe('function');
    });

    it('should include GROUP_CONCAT', () => {
      const groupConcat = sparqlCompletions.find((c) => c.label === 'GROUP_CONCAT()');
      expect(groupConcat).toBeDefined();
      expect(groupConcat?.type).toBe('function');
    });
  });

  describe('Type checking functions', () => {
    it('should include isIRI', () => {
      const isIRI = sparqlCompletions.find((c) => c.label === 'isIRI()');
      expect(isIRI).toBeDefined();
      expect(isIRI?.type).toBe('function');
    });

    it('should include isBlank', () => {
      const isBlank = sparqlCompletions.find((c) => c.label === 'isBlank()');
      expect(isBlank).toBeDefined();
      expect(isBlank?.type).toBe('function');
    });

    it('should include isLiteral', () => {
      const isLiteral = sparqlCompletions.find((c) => c.label === 'isLiteral()');
      expect(isLiteral).toBeDefined();
      expect(isLiteral?.type).toBe('function');
    });

    it('should include isNumeric', () => {
      const isNumeric = sparqlCompletions.find((c) => c.label === 'isNumeric()');
      expect(isNumeric).toBeDefined();
      expect(isNumeric?.type).toBe('function');
    });
  });

  describe('Conversion functions', () => {
    it('should include LANG', () => {
      const lang = sparqlCompletions.find((c) => c.label === 'LANG()');
      expect(lang).toBeDefined();
      expect(lang?.type).toBe('function');
    });

    it('should include DATATYPE', () => {
      const datatype = sparqlCompletions.find((c) => c.label === 'DATATYPE()');
      expect(datatype).toBeDefined();
      expect(datatype?.type).toBe('function');
    });

    it('should include IRI', () => {
      const iri = sparqlCompletions.find((c) => c.label === 'IRI()');
      expect(iri).toBeDefined();
      expect(iri?.type).toBe('function');
    });

    it('should include BNODE', () => {
      const bnode = sparqlCompletions.find((c) => c.label === 'BNODE()');
      expect(bnode).toBeDefined();
      expect(bnode?.type).toBe('function');
    });
  });

  describe('Completion info', () => {
    it('should have info text for all completions', () => {
      const missingInfo = sparqlCompletions.filter((c) => !c.info);
      expect(missingInfo).toHaveLength(0);
    });

    it('should have type for all completions', () => {
      const missingType = sparqlCompletions.filter((c) => !c.type);
      expect(missingType).toHaveLength(0);
    });

    it('should only have keyword or function types', () => {
      const invalidTypes = sparqlCompletions.filter(
        (c) => c.type !== 'keyword' && c.type !== 'function'
      );
      expect(invalidTypes).toHaveLength(0);
    });
  });

  describe('Completion function', () => {
    it('should return null when no word is being typed', () => {
      const state = EditorState.create({
        doc: '  ',
        selection: { anchor: 0 },
      });

      const context = {
        state,
        pos: 0,
        explicit: false,
        matchBefore: () => null,
      } as unknown as CompletionContext;

      const result = sparqlCompletion(context);
      expect(result).toBeNull();
    });

    it('should return completions when explicitly requested', () => {
      const state = EditorState.create({
        doc: '',
        selection: { anchor: 0 },
      });

      const context = {
        state,
        pos: 0,
        explicit: true,
        matchBefore: () => ({ from: 0, to: 0, text: '' }),
      } as unknown as CompletionContext;

      const result = sparqlCompletion(context);
      expect(result).not.toBeNull();
      expect(result?.options).toBe(sparqlCompletions);
    });

    it('should return completions when typing a word', () => {
      const state = EditorState.create({
        doc: 'SEL',
        selection: { anchor: 3 },
      });

      const context = {
        state,
        pos: 3,
        explicit: false,
        matchBefore: () => ({ from: 0, to: 3, text: 'SEL' }),
      } as unknown as CompletionContext;

      const result = sparqlCompletion(context);
      expect(result).not.toBeNull();
      expect(result?.from).toBe(0);
      expect(result?.options).toBe(sparqlCompletions);
      expect(result?.filter).toBe(true);
    });

    it('should use filter mode for client-side filtering', () => {
      const state = EditorState.create({
        doc: 'WHER',
        selection: { anchor: 4 },
      });

      const context = {
        state,
        pos: 4,
        explicit: false,
        matchBefore: () => ({ from: 0, to: 4, text: 'WHER' }),
      } as unknown as CompletionContext;

      const result = sparqlCompletion(context);
      expect(result).not.toBeNull();
      expect(result?.filter).toBe(true); // CodeMirror will filter
    });
  });

  describe('Completions coverage', () => {
    it('should include common query patterns', () => {
      const commonKeywords = ['SELECT', 'WHERE', 'FILTER', 'OPTIONAL', 'UNION'];
      commonKeywords.forEach((keyword) => {
        const found = sparqlCompletions.some((c) => c.label === keyword);
        expect(found).toBe(true);
      });
    });

    it('should include common functions', () => {
      const commonFunctions = ['COUNT()', 'STR()', 'CONCAT()', 'FILTER', 'BOUND'];
      commonFunctions.forEach((func) => {
        const found = sparqlCompletions.some((c) => c.label === func);
        expect(found).toBe(true);
      });
    });

    it('should include hash functions', () => {
      const hashFunctions = ['MD5()', 'SHA1()', 'SHA256()', 'SHA384()', 'SHA512()'];
      hashFunctions.forEach((func) => {
        const found = sparqlCompletions.some((c) => c.label === func);
        expect(found).toBe(true);
      });
    });
  });
});
