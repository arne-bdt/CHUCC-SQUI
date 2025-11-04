/**
 * Integration tests for graph name auto-completion
 * Tests the completion extension with mock service descriptions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EditorState } from '@codemirror/state';
import { autocompletion } from '@codemirror/autocomplete';
import { graphNameCompletion } from '../../src/lib/editor/extensions/graphNameCompletion';
import type { ServiceDescription, NamedGraph } from '../../src/lib/types';

/**
 * Create a mock service description with test data
 */
function createMockServiceDescription(): ServiceDescription {
  const namedGraphs: NamedGraph[] = [
    {
      name: 'http://example.org/graph1',
      entailmentRegime: 'http://www.w3.org/ns/entailment/RDFS',
      metadata: {
        triples: 10245,
      },
    },
    {
      name: 'http://example.org/graph2',
      metadata: {
        triples: 523,
      },
    },
    {
      name: 'http://example.org/products',
      entailmentRegime: 'http://www.w3.org/ns/entailment/OWL-DL',
      metadata: {
        triples: 1024332,
      },
    },
  ];

  return {
    endpoint: 'http://example.org/sparql',
    supportedLanguages: [],
    features: [],
    resultFormats: [],
    inputFormats: [],
    extensionFunctions: [],
    extensionAggregates: [],
    datasets: [
      {
        defaultGraphs: [
          {
            uri: 'http://example.org/default',
            metadata: { triples: 1000 },
          },
        ],
        namedGraphs,
      },
    ],
    lastFetched: new Date(),
    available: true,
  };
}

/**
 * Helper to trigger completion at a specific position
 */
async function getCompletions(text: string, cursorPos?: number, serviceDesc?: ServiceDescription | null) {
  const pos = cursorPos !== undefined ? cursorPos : text.length;

  const state = EditorState.create({
    doc: text,
    extensions: [
      autocompletion({
        override: [graphNameCompletion(() => serviceDesc || null)],
      }),
    ],
  });

  // Create a completion context
  const context = {
    state,
    pos,
    explicit: true,
    matchBefore: () => null,
    aborted: false,
    addEventListener: () => {},
  } as any;

  // Get the completion function
  const completionFn = graphNameCompletion(() => serviceDesc || null);

  // Call it
  return await completionFn(context);
}

describe('graphNameCompletion', () => {
  let mockServiceDesc: ServiceDescription;

  beforeEach(() => {
    mockServiceDesc = createMockServiceDescription();
  });

  describe('FROM clause', () => {
    it('should provide completions for FROM clause', async () => {
      const result = await getCompletions('SELECT * FROM ', undefined, mockServiceDesc);

      expect(result).not.toBeNull();
      expect(result?.options).toBeDefined();
      expect(result?.options.length).toBeGreaterThan(0);
    });

    it('should include both default and named graphs for FROM', async () => {
      const result = await getCompletions('SELECT * FROM ', undefined, mockServiceDesc);

      expect(result?.options).toBeDefined();
      // Should have 4 graphs (1 default + 3 named)
      expect(result?.options.length).toBe(4);

      const labels = result?.options.map((opt) => opt.label) || [];
      expect(labels).toContain('http://example.org/default');
      expect(labels).toContain('http://example.org/graph1');
      expect(labels).toContain('http://example.org/graph2');
      expect(labels).toContain('http://example.org/products');
    });

    it('should include metadata in detail field', async () => {
      const result = await getCompletions('SELECT * FROM ', undefined, mockServiceDesc);

      const graph1 = result?.options.find((opt) => opt.label === 'http://example.org/graph1');
      expect(graph1).toBeDefined();
      expect(graph1?.detail).toContain('10,245 triples');
      expect(graph1?.detail).toContain('RDFS');
    });

    it('should filter completions based on partial input', async () => {
      const result = await getCompletions(
        'SELECT * FROM <http://example.org/graph',
        undefined,
        mockServiceDesc
      );

      expect(result?.options).toBeDefined();
      // Should only match graphs starting with 'http://example.org/graph'
      const labels = result?.options.map((opt) => opt.label) || [];
      expect(labels).toContain('http://example.org/graph1');
      expect(labels).toContain('http://example.org/graph2');
      expect(labels).not.toContain('http://example.org/products');
      expect(labels).not.toContain('http://example.org/default');
    });
  });

  describe('FROM NAMED clause', () => {
    it('should provide completions for FROM NAMED clause', async () => {
      const result = await getCompletions('SELECT * FROM NAMED ', undefined, mockServiceDesc);

      expect(result).not.toBeNull();
      expect(result?.options).toBeDefined();
      expect(result?.options.length).toBeGreaterThan(0);
    });

    it('should only include named graphs for FROM NAMED', async () => {
      const result = await getCompletions('SELECT * FROM NAMED ', undefined, mockServiceDesc);

      expect(result?.options).toBeDefined();
      // Should have 3 named graphs (no default graph)
      expect(result?.options.length).toBe(3);

      const labels = result?.options.map((opt) => opt.label) || [];
      expect(labels).toContain('http://example.org/graph1');
      expect(labels).toContain('http://example.org/graph2');
      expect(labels).toContain('http://example.org/products');
      expect(labels).not.toContain('http://example.org/default');
    });

    it('should filter named graph completions', async () => {
      const result = await getCompletions(
        'SELECT * FROM NAMED <http://example.org/prod',
        undefined,
        mockServiceDesc
      );

      expect(result?.options).toBeDefined();
      expect(result?.options.length).toBe(1);
      expect(result?.options[0].label).toBe('http://example.org/products');
    });
  });

  describe('completion metadata', () => {
    it('should format triple count with thousands separator', async () => {
      const result = await getCompletions('SELECT * FROM NAMED ', undefined, mockServiceDesc);

      const products = result?.options.find((opt) => opt.label === 'http://example.org/products');
      expect(products?.detail).toContain('1,024,332 triples');
    });

    it('should extract entailment regime local name', async () => {
      const result = await getCompletions('SELECT * FROM NAMED ', undefined, mockServiceDesc);

      const graph1 = result?.options.find((opt) => opt.label === 'http://example.org/graph1');
      expect(graph1?.detail).toContain('RDFS');

      const products = result?.options.find((opt) => opt.label === 'http://example.org/products');
      expect(products?.detail).toContain('OWL-DL');
    });

    it('should provide info with full details', async () => {
      const result = await getCompletions('SELECT * FROM NAMED ', undefined, mockServiceDesc);

      const graph1 = result?.options.find((opt) => opt.label === 'http://example.org/graph1');
      expect(graph1?.info).toContain('**Graph IRI:**');
      expect(graph1?.info).toContain('http://example.org/graph1');
      expect(graph1?.info).toContain('**Triples:**');
      expect(graph1?.info).toContain('**Entailment:**');
    });
  });

  describe('edge cases', () => {
    it('should return null when not in FROM clause', async () => {
      const result = await getCompletions('SELECT * WHERE { ', undefined, mockServiceDesc);
      expect(result).toBeNull();
    });

    it('should return null when service description is null', async () => {
      const result = await getCompletions('SELECT * FROM ', undefined, null);
      expect(result).toBeNull();
    });

    it('should return null when service description is unavailable', async () => {
      const unavailableDesc = { ...mockServiceDesc, available: false };
      const result = await getCompletions('SELECT * FROM ', undefined, unavailableDesc);
      expect(result).toBeNull();
    });

    it('should handle empty datasets', async () => {
      const emptyDesc = { ...mockServiceDesc, datasets: [] };
      const result = await getCompletions('SELECT * FROM ', undefined, emptyDesc);
      expect(result).toBeNull();
    });

    it('should remove duplicate graph IRIs', async () => {
      const descWithDuplicates: ServiceDescription = {
        ...mockServiceDesc,
        datasets: [
          {
            defaultGraphs: [],
            namedGraphs: [
              { name: 'http://example.org/graph1' },
              { name: 'http://example.org/graph1' }, // Duplicate
              { name: 'http://example.org/graph2' },
            ],
          },
          {
            defaultGraphs: [],
            namedGraphs: [
              { name: 'http://example.org/graph1' }, // Duplicate in another dataset
              { name: 'http://example.org/graph3' },
            ],
          },
        ],
      };

      const result = await getCompletions('SELECT * FROM NAMED ', undefined, descWithDuplicates);

      expect(result?.options).toBeDefined();
      // Should have 3 unique graphs
      expect(result?.options.length).toBe(3);

      const labels = result?.options.map((opt) => opt.label) || [];
      expect(labels.filter((l) => l === 'http://example.org/graph1').length).toBe(1);
    });

    it('should handle graphs without metadata', async () => {
      const descNoMetadata: ServiceDescription = {
        ...mockServiceDesc,
        datasets: [
          {
            defaultGraphs: [],
            namedGraphs: [{ name: 'http://example.org/simple' }],
          },
        ],
      };

      const result = await getCompletions('SELECT * FROM NAMED ', undefined, descNoMetadata);

      expect(result?.options).toBeDefined();
      expect(result?.options.length).toBe(1);
      expect(result?.options[0].label).toBe('http://example.org/simple');
      // No metadata means detail is undefined
      expect(result?.options[0].detail).toBeUndefined();
    });
  });

  describe('completion behavior', () => {
    it('should set completion type to "constant"', async () => {
      const result = await getCompletions('SELECT * FROM ', undefined, mockServiceDesc);

      expect(result?.options[0].type).toBe('constant');
    });

    it('should enable filtering', async () => {
      const result = await getCompletions('SELECT * FROM ', undefined, mockServiceDesc);

      expect(result?.filter).toBe(true);
    });

    it('should calculate correct completion start position', async () => {
      const text = 'SELECT * FROM <http://ex';
      const result = await getCompletions(text, undefined, mockServiceDesc);

      expect(result?.from).toBe(text.indexOf('http://ex'));
    });
  });

  describe('multiline queries', () => {
    it('should handle multiline queries with FROM', async () => {
      const query = `
        PREFIX ex: <http://example.org/>
        SELECT *
        FROM
      `;
      const result = await getCompletions(query, undefined, mockServiceDesc);

      expect(result).not.toBeNull();
      expect(result?.options.length).toBeGreaterThan(0);
    });

    it('should handle multiline queries with FROM NAMED', async () => {
      const query = `
        PREFIX ex: <http://example.org/>
        SELECT *
        FROM NAMED
      `;
      const result = await getCompletions(query, undefined, mockServiceDesc);

      expect(result).not.toBeNull();
      expect(result?.options.length).toBe(3);
    });
  });
});
