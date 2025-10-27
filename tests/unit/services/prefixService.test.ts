/**
 * Unit tests for Prefix Management Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PrefixService,
  commonPrefixes,
  prefixService,
} from '../../../src/lib/services/prefixService';
import type { PrefixConfig } from '../../../src/lib/types';

describe('PrefixService', () => {
  describe('commonPrefixes', () => {
    it('should contain standard RDF prefixes', () => {
      expect(commonPrefixes.rdf).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      expect(commonPrefixes.rdfs).toBe('http://www.w3.org/2000/01/rdf-schema#');
      expect(commonPrefixes.owl).toBe('http://www.w3.org/2002/07/owl#');
      expect(commonPrefixes.xsd).toBe('http://www.w3.org/2001/XMLSchema#');
    });

    it('should contain common ontology prefixes', () => {
      expect(commonPrefixes.foaf).toBe('http://xmlns.com/foaf/0.1/');
      expect(commonPrefixes.skos).toBe('http://www.w3.org/2004/02/skos/core#');
      expect(commonPrefixes.dc).toBe('http://purl.org/dc/elements/1.1/');
      expect(commonPrefixes.dcterms).toBe('http://purl.org/dc/terms/');
    });

    it('should contain popular dataset prefixes', () => {
      expect(commonPrefixes.dbo).toBe('http://dbpedia.org/ontology/');
      expect(commonPrefixes.dbr).toBe('http://dbpedia.org/resource/');
      expect(commonPrefixes.wdt).toBe('http://www.wikidata.org/prop/direct/');
      expect(commonPrefixes.wd).toBe('http://www.wikidata.org/entity/');
    });
  });

  describe('constructor', () => {
    it('should create instance without config', () => {
      const service = new PrefixService();
      expect(service).toBeInstanceOf(PrefixService);
      expect(service.getCustomPrefixes()).toEqual({});
    });

    it('should initialize with default prefixes from config', () => {
      const config: PrefixConfig = {
        default: {
          ex: 'http://example.org/',
          custom: 'http://custom.org/',
        },
      };
      const service = new PrefixService(config);
      const customPrefixes = service.getCustomPrefixes();

      expect(customPrefixes.ex).toBe('http://example.org/');
      expect(customPrefixes.custom).toBe('http://custom.org/');
    });

    it('should initialize with discovery hook', async () => {
      const mockHook = vi.fn().mockResolvedValue({ ex: 'http://example.org/' });
      const config: PrefixConfig = { discoveryHook: mockHook };
      const service = new PrefixService(config);

      const result = await service.discoverPrefixes('http://endpoint.example/');
      expect(mockHook).toHaveBeenCalledWith('http://endpoint.example/');
      expect(result).toEqual({ ex: 'http://example.org/' });
    });
  });

  describe('getAllPrefixes', () => {
    it('should return common prefixes when no custom prefixes are set', () => {
      const service = new PrefixService();
      const allPrefixes = service.getAllPrefixes();

      expect(allPrefixes.rdf).toBe(commonPrefixes.rdf);
      expect(allPrefixes.owl).toBe(commonPrefixes.owl);
      expect(Object.keys(allPrefixes).length).toBeGreaterThanOrEqual(
        Object.keys(commonPrefixes).length
      );
    });

    it('should merge custom prefixes with common prefixes', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');

      const allPrefixes = service.getAllPrefixes();
      expect(allPrefixes.ex).toBe('http://example.org/');
      expect(allPrefixes.rdf).toBe(commonPrefixes.rdf);
    });

    it('should allow custom prefixes to override common prefixes', () => {
      const service = new PrefixService();
      service.addPrefix('rdf', 'http://custom-rdf.example/');

      const allPrefixes = service.getAllPrefixes();
      expect(allPrefixes.rdf).toBe('http://custom-rdf.example/');
    });
  });

  describe('parsePrefixesFromQuery', () => {
    it('should parse single PREFIX declaration', () => {
      const service = new PrefixService();
      const query = 'PREFIX ex: <http://example.org/> SELECT * WHERE { ?s ?p ?o }';
      const prefixes = service.parsePrefixesFromQuery(query);

      expect(prefixes.ex).toBe('http://example.org/');
    });

    it('should parse multiple PREFIX declarations', () => {
      const service = new PrefixService();
      const query = `
        PREFIX ex: <http://example.org/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        SELECT * WHERE { ?s ?p ?o }
      `;
      const prefixes = service.parsePrefixesFromQuery(query);

      expect(prefixes.ex).toBe('http://example.org/');
      expect(prefixes.foaf).toBe('http://xmlns.com/foaf/0.1/');
      expect(prefixes.dbo).toBe('http://dbpedia.org/ontology/');
    });

    it('should handle case-insensitive PREFIX keyword', () => {
      const service = new PrefixService();
      const query = `
        prefix ex: <http://example.org/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PrEfIx dbo: <http://dbpedia.org/ontology/>
        SELECT * WHERE { ?s ?p ?o }
      `;
      const prefixes = service.parsePrefixesFromQuery(query);

      expect(prefixes.ex).toBe('http://example.org/');
      expect(prefixes.foaf).toBe('http://xmlns.com/foaf/0.1/');
      expect(prefixes.dbo).toBe('http://dbpedia.org/ontology/');
    });

    it('should handle prefixes with varying whitespace', () => {
      const service = new PrefixService();
      const query = 'PREFIX  ex:   <http://example.org/>  SELECT * WHERE { ?s ?p ?o }';
      const prefixes = service.parsePrefixesFromQuery(query);

      expect(prefixes.ex).toBe('http://example.org/');
    });

    it('should return empty object when no prefixes found', () => {
      const service = new PrefixService();
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const prefixes = service.parsePrefixesFromQuery(query);

      expect(prefixes).toEqual({});
    });

    it('should handle queries with special characters in URIs', () => {
      const service = new PrefixService();
      const query = 'PREFIX ex: <http://example.org/data#> SELECT * WHERE { ?s ?p ?o }';
      const prefixes = service.parsePrefixesFromQuery(query);

      expect(prefixes.ex).toBe('http://example.org/data#');
    });
  });

  describe('abbreviateIRI', () => {
    it('should abbreviate IRI using common prefix', () => {
      const service = new PrefixService();
      const abbreviated = service.abbreviateIRI('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

      expect(abbreviated).toBe('rdf:type');
    });

    it('should abbreviate IRI using custom prefix', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');

      const abbreviated = service.abbreviateIRI('http://example.org/Person');
      expect(abbreviated).toBe('ex:Person');
    });

    it('should use longest matching prefix', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');
      service.addPrefix('exdata', 'http://example.org/data/');

      const abbreviated = service.abbreviateIRI('http://example.org/data/item123');
      expect(abbreviated).toBe('exdata:item123');
    });

    it('should return full IRI when no prefix matches', () => {
      const service = new PrefixService();
      const iri = 'http://unknown.example/resource';
      const abbreviated = service.abbreviateIRI(iri);

      expect(abbreviated).toBe(iri);
    });

    it('should abbreviate using provided custom prefixes', () => {
      const service = new PrefixService();
      const customPrefixes = { custom: 'http://custom.org/' };

      const abbreviated = service.abbreviateIRI('http://custom.org/Resource', customPrefixes);
      expect(abbreviated).toBe('custom:Resource');
    });

    it('should handle IRIs with fragments', () => {
      const service = new PrefixService();
      const abbreviated = service.abbreviateIRI('http://xmlns.com/foaf/0.1/Person');

      expect(abbreviated).toBe('foaf:Person');
    });
  });

  describe('expandIRI', () => {
    it('should expand abbreviated IRI using common prefix', () => {
      const service = new PrefixService();
      const expanded = service.expandIRI('rdf:type');

      expect(expanded).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    });

    it('should expand abbreviated IRI using custom prefix', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');

      const expanded = service.expandIRI('ex:Person');
      expect(expanded).toBe('http://example.org/Person');
    });

    it('should return original string when prefix not found', () => {
      const service = new PrefixService();
      const abbreviated = 'unknown:Resource';
      const expanded = service.expandIRI(abbreviated);

      expect(expanded).toBe(abbreviated);
    });

    it('should return original string when no colon present', () => {
      const service = new PrefixService();
      const iri = 'http://example.org/Resource';
      const expanded = service.expandIRI(iri);

      expect(expanded).toBe(iri);
    });

    it('should expand using provided custom prefixes', () => {
      const service = new PrefixService();
      const customPrefixes = { custom: 'http://custom.org/' };

      const expanded = service.expandIRI('custom:Resource', customPrefixes);
      expect(expanded).toBe('http://custom.org/Resource');
    });

    it('should handle empty local part', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');

      const expanded = service.expandIRI('ex:');
      expect(expanded).toBe('http://example.org/');
    });
  });

  describe('searchPrefixes', () => {
    beforeEach(() => {
      // Reset fetch mock before each test
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch prefix suggestions from prefix.cc', async () => {
      const service = new PrefixService();
      const mockResponse = {
        foaf: 'http://xmlns.com/foaf/0.1/',
        dc: 'http://purl.org/dc/elements/1.1/',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const suggestions = await service.searchPrefixes('foaf');

      expect(global.fetch).toHaveBeenCalledWith('https://prefix.cc/foaf.file.json', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({ prefix: 'foaf', uri: 'http://xmlns.com/foaf/0.1/' });
    });

    it('should handle fetch errors gracefully', async () => {
      const service = new PrefixService();
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      // Suppress expected console.warn
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const suggestions = await service.searchPrefixes('test');

      expect(suggestions).toEqual([]);

      consoleWarnSpy.mockRestore();
    });

    it('should handle non-ok responses', async () => {
      const service = new PrefixService();
      global.fetch = vi.fn().mockResolvedValue({ ok: false });

      const suggestions = await service.searchPrefixes('test');

      expect(suggestions).toEqual([]);
    });

    it('should encode query parameter', async () => {
      const service = new PrefixService();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await service.searchPrefixes('test query');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://prefix.cc/test%20query.file.json',
        expect.any(Object)
      );
    });
  });

  describe('discoverPrefixes', () => {
    it('should return empty object when no discovery hook is set', async () => {
      const service = new PrefixService();
      const result = await service.discoverPrefixes('http://endpoint.example/');

      expect(result).toEqual({});
    });

    it('should call discovery hook with endpoint URL', async () => {
      const mockHook = vi.fn().mockResolvedValue({ ex: 'http://example.org/' });
      const service = new PrefixService({ discoveryHook: mockHook });

      const result = await service.discoverPrefixes('http://endpoint.example/sparql');

      expect(mockHook).toHaveBeenCalledWith('http://endpoint.example/sparql');
      expect(result).toEqual({ ex: 'http://example.org/' });
    });

    it('should handle discovery hook errors gracefully', async () => {
      const mockHook = vi.fn().mockRejectedValue(new Error('Discovery failed'));
      const service = new PrefixService({ discoveryHook: mockHook });

      // Suppress expected console.warn
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await service.discoverPrefixes('http://endpoint.example/');

      expect(result).toEqual({});

      consoleWarnSpy.mockRestore();
    });
  });

  describe('addPrefix', () => {
    it('should add new custom prefix', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');

      const customPrefixes = service.getCustomPrefixes();
      expect(customPrefixes.ex).toBe('http://example.org/');
    });

    it('should override existing custom prefix', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');
      service.addPrefix('ex', 'http://new.example.org/');

      const customPrefixes = service.getCustomPrefixes();
      expect(customPrefixes.ex).toBe('http://new.example.org/');
    });
  });

  describe('removePrefix', () => {
    it('should remove custom prefix', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');
      service.removePrefix('ex');

      const customPrefixes = service.getCustomPrefixes();
      expect(customPrefixes.ex).toBeUndefined();
    });

    it('should not affect common prefixes', () => {
      const service = new PrefixService();
      service.removePrefix('rdf');

      const allPrefixes = service.getAllPrefixes();
      expect(allPrefixes.rdf).toBe(commonPrefixes.rdf);
    });
  });

  describe('generatePrefixDeclarations', () => {
    it('should generate single PREFIX declaration', () => {
      const service = new PrefixService();
      const prefixes = { ex: 'http://example.org/' };
      const declarations = service.generatePrefixDeclarations(prefixes);

      expect(declarations).toBe('PREFIX ex: <http://example.org/>');
    });

    it('should generate multiple PREFIX declarations', () => {
      const service = new PrefixService();
      const prefixes = {
        ex: 'http://example.org/',
        foaf: 'http://xmlns.com/foaf/0.1/',
        dbo: 'http://dbpedia.org/ontology/',
      };
      const declarations = service.generatePrefixDeclarations(prefixes);

      expect(declarations).toContain('PREFIX ex: <http://example.org/>');
      expect(declarations).toContain('PREFIX foaf: <http://xmlns.com/foaf/0.1/>');
      expect(declarations).toContain('PREFIX dbo: <http://dbpedia.org/ontology/>');
      expect(declarations.split('\n')).toHaveLength(3);
    });

    it('should return empty string for empty prefix map', () => {
      const service = new PrefixService();
      const declarations = service.generatePrefixDeclarations({});

      expect(declarations).toBe('');
    });
  });

  describe('getCustomPrefixes', () => {
    it('should return only custom prefixes', () => {
      const service = new PrefixService();
      service.addPrefix('ex', 'http://example.org/');
      service.addPrefix('custom', 'http://custom.org/');

      const customPrefixes = service.getCustomPrefixes();

      expect(customPrefixes).toEqual({
        ex: 'http://example.org/',
        custom: 'http://custom.org/',
      });
      expect(customPrefixes.rdf).toBeUndefined();
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton prefixService instance', () => {
      expect(prefixService).toBeInstanceOf(PrefixService);
    });

    it('should be usable without creating new instance', () => {
      const allPrefixes = prefixService.getAllPrefixes();
      expect(allPrefixes.rdf).toBe(commonPrefixes.rdf);
    });
  });

  describe('integration tests', () => {
    it('should parse, abbreviate, and expand IRIs consistently', () => {
      const service = new PrefixService();
      const query = 'PREFIX ex: <http://example.org/> SELECT * WHERE { ?s ?p ?o }';
      const prefixes = service.parsePrefixesFromQuery(query);

      const abbreviated = service.abbreviateIRI('http://example.org/Person', prefixes);
      expect(abbreviated).toBe('ex:Person');

      const expanded = service.expandIRI(abbreviated, prefixes);
      expect(expanded).toBe('http://example.org/Person');
    });

    it('should generate declarations that can be parsed back', () => {
      const service = new PrefixService();
      const originalPrefixes = {
        ex: 'http://example.org/',
        foaf: 'http://xmlns.com/foaf/0.1/',
      };

      const declarations = service.generatePrefixDeclarations(originalPrefixes);
      const parsedPrefixes = service.parsePrefixesFromQuery(declarations);

      expect(parsedPrefixes).toEqual(originalPrefixes);
    });
  });
});
