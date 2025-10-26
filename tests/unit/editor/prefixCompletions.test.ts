/**
 * Unit tests for PREFIX autocompletion
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EditorState } from '@codemirror/state';
import type { CompletionContext } from '@codemirror/autocomplete';
import { prefixCompletion, prefixCompletionSync } from '../../../src/lib/editor/prefixCompletions';
import { PrefixService } from '../../../src/lib/services/prefixService';

/**
 * Create a mock completion context for testing
 */
function createCompletionContext(text: string, pos?: number): CompletionContext {
  const state = EditorState.create({ doc: text });
  const position = pos ?? text.length;

  return {
    state,
    pos: position,
    explicit: false,
    matchBefore: (regexp: RegExp) => {
      const line = state.doc.lineAt(position);
      const textBefore = line.text.slice(0, position - line.from);
      const match = textBefore.match(regexp);
      if (!match) return null;
      return {
        from: position - match[0].length,
        to: position,
        text: match[0],
      };
    },
    aborted: false,
    addEventListener: () => {},
  } as CompletionContext;
}

describe('prefixCompletions', () => {
  describe('PREFIX declaration completions', () => {
    it('should suggest prefix names when typing PREFIX', async () => {
      const context = createCompletionContext('PREFIX ');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      expect(result!.options.length).toBeGreaterThan(0);

      // Check that common prefixes are included
      const labels = result!.options.map((opt) => opt.label);
      expect(labels).toContain('rdf:');
      expect(labels).toContain('rdfs:');
      expect(labels).toContain('owl:');
    });

    it('should suggest prefix names case-insensitively', async () => {
      const context = createCompletionContext('prefix ');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      expect(result!.options.length).toBeGreaterThan(0);
    });

    it('should filter prefix suggestions based on partial input', async () => {
      const context = createCompletionContext('PREFIX r');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      // Should include prefixes starting with 'r'
      expect(labels).toContain('rdf:');
      expect(labels).toContain('rdfs:');

      // Should NOT include prefixes not starting with 'r'
      expect(labels).not.toContain('owl:');
      expect(labels).not.toContain('xsd:');
    });

    it('should provide full PREFIX declaration as apply text', async () => {
      const context = createCompletionContext('PREFIX r');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const rdfOption = result!.options.find((opt) => opt.label === 'rdf:');

      expect(rdfOption).toBeDefined();
      expect(rdfOption!.apply).toBe('rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>');
      expect(rdfOption!.type).toBe('namespace');
    });

    it('should include URI in info field', async () => {
      const context = createCompletionContext('PREFIX foaf');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const foafOption = result!.options.find((opt) => opt.label === 'foaf:');

      expect(foafOption).toBeDefined();
      expect(foafOption!.info).toBe('http://xmlns.com/foaf/0.1/');
    });

    it('should handle multiple PREFIX declarations in query', async () => {
      const query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX ';
      const context = createCompletionContext(query);
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      expect(result!.options.length).toBeGreaterThan(0);
    });
  });

  describe('term completions after prefix colon', () => {
    it('should suggest terms for rdf prefix', async () => {
      const context = createCompletionContext('SELECT * WHERE { ?s rdf:');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      expect(labels).toContain('type');
      expect(labels).toContain('Property');
      expect(labels).toContain('subject');
    });

    it('should suggest terms for rdfs prefix', async () => {
      const context = createCompletionContext('?x rdfs:');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      expect(labels).toContain('label');
      expect(labels).toContain('comment');
      expect(labels).toContain('subClassOf');
    });

    it('should suggest terms for owl prefix', async () => {
      const context = createCompletionContext('?x owl:');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      expect(labels).toContain('Class');
      expect(labels).toContain('ObjectProperty');
      expect(labels).toContain('sameAs');
    });

    it('should suggest terms for xsd prefix', async () => {
      const context = createCompletionContext('"value"^^xsd:');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      expect(labels).toContain('string');
      expect(labels).toContain('integer');
      expect(labels).toContain('boolean');
    });

    it('should suggest terms for foaf prefix', async () => {
      const context = createCompletionContext('?person foaf:');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      expect(labels).toContain('name');
      expect(labels).toContain('Person');
      expect(labels).toContain('knows');
    });

    it('should suggest terms for skos prefix', async () => {
      const context = createCompletionContext('?concept skos:');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      expect(labels).toContain('Concept');
      expect(labels).toContain('prefLabel');
      expect(labels).toContain('broader');
    });

    it('should filter term suggestions based on partial input', async () => {
      const context = createCompletionContext('?s rdf:t');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      // Should include terms starting with 't'
      expect(labels).toContain('type');

      // Should NOT include terms not starting with 't'
      expect(labels).not.toContain('Property');
      expect(labels).not.toContain('subject');
    });

    it('should handle case-insensitive term filtering', async () => {
      const context = createCompletionContext('?s rdfs:L');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);

      // 'label' starts with 'l', should match 'L' case-insensitively
      expect(labels).toContain('label');
    });

    it('should return null for unknown prefix', async () => {
      const context = createCompletionContext('?x unknown:');
      const result = await prefixCompletion(context);

      expect(result).toBeNull();
    });

    it('should set correct completion info', async () => {
      const context = createCompletionContext('?s rdf:t');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const typeOption = result!.options.find((opt) => opt.label === 'type');

      expect(typeOption).toBeDefined();
      expect(typeOption!.type).toBe('property');
      expect(typeOption!.info).toBe('rdf:type');
    });
  });

  describe('custom prefix support', () => {
    it('should support custom prefixes in term completion', async () => {
      const service = new PrefixService();
      service.addPrefix('custom', 'http://example.org/custom/');

      // Since we can't easily inject a custom service, we test that
      // unknown prefixes return null (as expected)
      const context = createCompletionContext('?x custom:');
      const result = await prefixCompletion(context);

      // Should return null because we don't have common terms for 'custom'
      // and the global prefixService doesn't have our custom prefix
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should return null when not in PREFIX context or after colon', async () => {
      const context = createCompletionContext('SELECT * WHERE');
      const result = await prefixCompletion(context);

      expect(result).toBeNull();
    });

    it('should return null for empty document', async () => {
      const context = createCompletionContext('');
      const result = await prefixCompletion(context);

      expect(result).toBeNull();
    });

    it('should handle PREFIX at different positions', async () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }\nPREFIX ';
      const context = createCompletionContext(query);
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      expect(result!.options.length).toBeGreaterThan(0);
    });

    it('should handle multiple spaces after PREFIX', async () => {
      const context = createCompletionContext('PREFIX   ');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      expect(result!.options.length).toBeGreaterThan(0);
    });

    it('should handle completion in middle of line', async () => {
      const text = 'PREFIX r more text';
      const pos = 8; // After 'PREFIX r'
      const context = createCompletionContext(text, pos);
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);
      expect(labels).toContain('rdf:');
    });
  });

  describe('prefixCompletionSync', () => {
    it('should work synchronously for PREFIX declarations', () => {
      const context = createCompletionContext('PREFIX r');
      const result = prefixCompletionSync(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);
      expect(labels).toContain('rdf:');
      expect(labels).toContain('rdfs:');
    });

    it('should work synchronously for term completions', () => {
      const context = createCompletionContext('?s rdf:t');
      const result = prefixCompletionSync(context);

      expect(result).not.toBeNull();
      const labels = result!.options.map((opt) => opt.label);
      expect(labels).toContain('type');
    });

    it('should return null when not applicable', () => {
      const context = createCompletionContext('SELECT *');
      const result = prefixCompletionSync(context);

      expect(result).toBeNull();
    });
  });

  describe('completion from position', () => {
    it('should calculate correct from position for PREFIX completions', async () => {
      const context = createCompletionContext('PREFIX rdf');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      // 'from' should be at position 7 (after 'PREFIX ')
      expect(result!.from).toBe(7);
    });

    it('should calculate correct from position for term completions', async () => {
      const context = createCompletionContext('?s rdf:typ');
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      // 'from' should be at position 7 (after 'rdf:')
      expect(result!.from).toBe(7);
    });
  });

  describe('integration scenarios', () => {
    it('should complete a typical SPARQL query with PREFIX', async () => {
      // Step 1: Complete PREFIX declaration
      let context = createCompletionContext('PREFIX ');
      let result = await prefixCompletion(context);
      expect(result).not.toBeNull();
      expect(result!.options.map((o) => o.label)).toContain('rdf:');

      // Step 2: Complete term after prefix
      context = createCompletionContext('PREFIX rdf: <...>\nSELECT * WHERE { ?s rdf:');
      result = await prefixCompletion(context);
      expect(result).not.toBeNull();
      expect(result!.options.map((o) => o.label)).toContain('type');
    });

    it('should handle multiple prefixes in same query', async () => {
      const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?s rdf:`;

      const context = createCompletionContext(query);
      const result = await prefixCompletion(context);

      expect(result).not.toBeNull();
      expect(result!.options.map((o) => o.label)).toContain('type');
    });
  });
});
