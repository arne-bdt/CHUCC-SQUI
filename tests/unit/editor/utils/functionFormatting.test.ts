/**
 * Unit tests for function formatting utilities
 */

import { describe, it, expect } from 'vitest';
import {
  getFunctionName,
  buildFunctionCall,
  formatFunctionSignature,
  isInFunctionContext,
  extractNamespace,
  groupByNamespace,
  filterFunctions,
} from '../../../../src/lib/editor/utils/functionFormatting';
import type { ExtensionFunction, FunctionParameter } from '../../../../src/lib/types';

describe('functionFormatting', () => {
  describe('getFunctionName', () => {
    it('should extract local name from URI with hash', () => {
      expect(getFunctionName('http://jena.apache.org/ARQ/function#now')).toBe('now');
      expect(getFunctionName('http://example.org/functions#distance')).toBe('distance');
    });

    it('should extract local name from URI with slash', () => {
      expect(getFunctionName('http://example.org/functions/distance')).toBe('distance');
      expect(getFunctionName('http://example.org/fn/add')).toBe('add');
    });

    it('should return full URI if no separator found', () => {
      expect(getFunctionName('customFunction')).toBe('customFunction');
    });
  });

  describe('buildFunctionCall', () => {
    it('should build function call without parameters', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/now',
        label: 'Current Time',
      };

      expect(buildFunctionCall(func)).toBe('<http://example.org/fn/now>()');
    });

    it('should build function call with single parameter', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/uppercase',
        parameters: [{ name: 'str' }],
      };

      expect(buildFunctionCall(func)).toBe('<http://example.org/fn/uppercase>(?str)');
    });

    it('should build function call with multiple parameters', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/distance',
        parameters: [{ name: 'point1' }, { name: 'point2' }],
      };

      expect(buildFunctionCall(func)).toBe(
        '<http://example.org/fn/distance>(?point1, ?point2)'
      );
    });

    it('should build function call with optional parameters', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/format',
        parameters: [
          { name: 'value' },
          { name: 'format', optional: true },
        ],
      };

      expect(buildFunctionCall(func)).toBe(
        '<http://example.org/fn/format>(?value, ?format)'
      );
    });

    it('should build function call without angle brackets when specified', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/add',
        parameters: [{ name: 'x' }, { name: 'y' }],
      };

      expect(buildFunctionCall(func, false)).toBe('add(?x, ?y)');
    });
  });

  describe('formatFunctionSignature', () => {
    it('should format signature without parameters', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/now',
      };

      expect(formatFunctionSignature(func)).toBe('now()');
    });

    it('should format signature with untyped parameters', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/add',
        parameters: [{ name: 'x' }, { name: 'y' }],
      };

      expect(formatFunctionSignature(func)).toBe('add(x, y)');
    });

    it('should format signature with typed parameters', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/distance',
        parameters: [
          { name: 'point1', type: 'geo:Point' },
          { name: 'point2', type: 'geo:Point' },
        ],
      };

      expect(formatFunctionSignature(func)).toBe(
        'distance(point1: geo:Point, point2: geo:Point)'
      );
    });

    it('should format signature with optional parameters', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/format',
        parameters: [
          { name: 'value', type: 'xsd:string' },
          { name: 'format', type: 'xsd:string', optional: true },
        ],
      };

      expect(formatFunctionSignature(func)).toBe(
        'format(value: xsd:string, format?: xsd:string)'
      );
    });

    it('should format signature with return type', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/distance',
        parameters: [
          { name: 'point1', type: 'geo:Point' },
          { name: 'point2', type: 'geo:Point' },
        ],
        returnType: 'xsd:double',
      };

      expect(formatFunctionSignature(func)).toBe(
        'distance(point1: geo:Point, point2: geo:Point): xsd:double'
      );
    });

    it('should use full URI when useShortNames is false', () => {
      const func: ExtensionFunction = {
        uri: 'http://example.org/fn/now',
      };

      expect(formatFunctionSignature(func, false)).toBe('http://example.org/fn/now()');
    });
  });

  describe('isInFunctionContext', () => {
    it('should detect FILTER context', () => {
      expect(isInFunctionContext('SELECT * WHERE { FILTER (')).toBe(true);
      expect(isInFunctionContext('FILTER( ')).toBe(true);
    });

    it('should detect BIND context', () => {
      expect(isInFunctionContext('BIND (')).toBe(true);
      expect(isInFunctionContext('BIND( ')).toBe(true);
    });

    it('should detect SELECT expression context', () => {
      expect(isInFunctionContext('SELECT (')).toBe(true);
      expect(isInFunctionContext('SELECT DISTINCT (')).toBe(true);
      expect(isInFunctionContext('SELECT (<http://fn#test>(')).toBe(true);
    });

    it('should detect ORDER BY context', () => {
      expect(isInFunctionContext('ORDER BY (')).toBe(true);
      expect(isInFunctionContext('} ORDER BY (')).toBe(true);
    });

    it('should detect HAVING context', () => {
      expect(isInFunctionContext('HAVING (')).toBe(true);
    });

    it('should detect GROUP BY context', () => {
      expect(isInFunctionContext('GROUP BY (')).toBe(true);
      expect(isInFunctionContext('GROUP BY (<http://fn#aggregate>(')).toBe(true);
    });

    it('should detect nested function context', () => {
      expect(isInFunctionContext('FILTER (<http://fn#add>(')).toBe(true);
    });

    it('should not detect outside function context', () => {
      expect(isInFunctionContext('SELECT ?x ?y WHERE')).toBe(false);
      expect(isInFunctionContext('PREFIX ex: <http://example.org/>')).toBe(false);
    });

    it('should ignore string literals', () => {
      expect(isInFunctionContext('SELECT "FILTER (" WHERE')).toBe(false);
    });
  });

  describe('extractNamespace', () => {
    it('should extract namespace from URI with hash', () => {
      expect(extractNamespace('http://jena.apache.org/ARQ/function#now')).toBe(
        'http://jena.apache.org/ARQ/function#'
      );
    });

    it('should extract namespace from URI with slash', () => {
      expect(extractNamespace('http://example.org/functions/distance')).toBe(
        'http://example.org/functions/'
      );
    });

    it('should return null for URIs without separators', () => {
      expect(extractNamespace('customFunction')).toBeNull();
    });
  });

  describe('groupByNamespace', () => {
    it('should group functions by namespace', () => {
      const functions: ExtensionFunction[] = [
        { uri: 'http://jena.apache.org/ARQ/function#now' },
        { uri: 'http://jena.apache.org/ARQ/function#version' },
        { uri: 'http://example.org/geo#distance' },
        { uri: 'customFunction' },
      ];

      const grouped = groupByNamespace(functions);

      expect(grouped.size).toBe(3);
      expect(grouped.get('http://jena.apache.org/ARQ/function#')).toHaveLength(2);
      expect(grouped.get('http://example.org/geo#')).toHaveLength(1);
      expect(grouped.get('Other')).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const grouped = groupByNamespace([]);
      expect(grouped.size).toBe(0);
    });
  });

  describe('filterFunctions', () => {
    const functions: ExtensionFunction[] = [
      {
        uri: 'http://jena.apache.org/ARQ/function#now',
        label: 'Current Time',
        comment: 'Returns the current date and time',
      },
      {
        uri: 'http://example.org/geo#distance',
        label: 'Distance',
        comment: 'Calculates distance between two points',
      },
      {
        uri: 'http://example.org/text#search',
        label: 'Text Search',
        comment: 'Performs full-text search',
      },
    ];

    it('should return all functions with empty search term', () => {
      expect(filterFunctions(functions, '')).toHaveLength(3);
    });

    it('should filter by URI', () => {
      const result = filterFunctions(functions, 'geo');
      expect(result).toHaveLength(1);
      expect(result[0].uri).toContain('geo');
    });

    it('should filter by label', () => {
      const result = filterFunctions(functions, 'distance');
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Distance');
    });

    it('should filter by comment', () => {
      const result = filterFunctions(functions, 'full-text');
      expect(result).toHaveLength(1);
      expect(result[0].comment).toContain('full-text');
    });

    it('should filter by function name', () => {
      const result = filterFunctions(functions, 'now');
      expect(result).toHaveLength(1);
      expect(result[0].uri).toContain('now');
    });

    it('should be case-insensitive', () => {
      const result = filterFunctions(functions, 'DISTANCE');
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Distance');
    });

    it('should return empty array when no matches', () => {
      const result = filterFunctions(functions, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should match multiple functions', () => {
      const result = filterFunctions(functions, 'example');
      expect(result).toHaveLength(2); // geo and text
    });
  });
});
