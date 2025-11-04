/**
 * Unit tests for ServiceDescriptionService
 * Tests RDF parsing, service description extraction, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceDescriptionService, ServiceDescriptionError } from '../../src/lib/services/serviceDescriptionService';
import { SPARQLLanguage, ServiceFeature } from '../../src/lib/types';

describe('ServiceDescriptionService', () => {
  let service: ServiceDescriptionService;

  beforeEach(() => {
    service = new ServiceDescriptionService();
    // Reset fetch mocks
    vi.restoreAllMocks();
  });

  describe('parseServiceDescription', () => {
    it('should parse Turtle format with basic service description', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

        <http://example.org/sparql> a sd:Service ;
          sd:supportedLanguage sd:SPARQL11Query ;
          sd:resultFormat <http://www.w3.org/ns/formats/SPARQL_Results_JSON> ;
          sd:feature sd:DereferencesURIs .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description).toBeDefined();
      expect(description.endpoint).toBe('http://example.org/sparql');
      expect(description.available).toBe(true);
      expect(description.supportedLanguages).toContain(SPARQLLanguage.SPARQL11Query);
      expect(description.features).toContain(ServiceFeature.DereferencesURIs);
      expect(description.resultFormats).toContain('http://www.w3.org/ns/formats/SPARQL_Results_JSON');
    });

    it('should parse service description with multiple languages', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

        <http://example.org/sparql> a sd:Service ;
          sd:supportedLanguage sd:SPARQL10Query ;
          sd:supportedLanguage sd:SPARQL11Query ;
          sd:supportedLanguage sd:SPARQL11Update .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description.supportedLanguages).toHaveLength(3);
      expect(description.supportedLanguages).toContain(SPARQLLanguage.SPARQL10Query);
      expect(description.supportedLanguages).toContain(SPARQLLanguage.SPARQL11Query);
      expect(description.supportedLanguages).toContain(SPARQLLanguage.SPARQL11Update);
    });

    it('should parse service description with multiple features', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

        <http://example.org/sparql> a sd:Service ;
          sd:feature sd:DereferencesURIs ;
          sd:feature sd:UnionDefaultGraph ;
          sd:feature sd:BasicFederatedQuery .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description.features).toHaveLength(3);
      expect(description.features).toContain(ServiceFeature.DereferencesURIs);
      expect(description.features).toContain(ServiceFeature.UnionDefaultGraph);
      expect(description.features).toContain(ServiceFeature.BasicFederatedQuery);
    });

    it('should parse service description with result formats', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix formats: <http://www.w3.org/ns/formats/> .

        <http://example.org/sparql> a sd:Service ;
          sd:resultFormat formats:SPARQL_Results_JSON ;
          sd:resultFormat formats:SPARQL_Results_XML ;
          sd:resultFormat formats:SPARQL_Results_CSV .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description.resultFormats).toHaveLength(3);
      expect(description.resultFormats).toContain('http://www.w3.org/ns/formats/SPARQL_Results_JSON');
      expect(description.resultFormats).toContain('http://www.w3.org/ns/formats/SPARQL_Results_XML');
      expect(description.resultFormats).toContain('http://www.w3.org/ns/formats/SPARQL_Results_CSV');
    });

    it('should parse service description with extension functions', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix ex: <http://example.org/function/> .

        <http://example.org/sparql> a sd:Service ;
          sd:extensionFunction ex:distance ;
          sd:extensionFunction ex:contains .

        ex:distance rdfs:label "Distance Function" ;
          rdfs:comment "Calculates distance between two points" .

        ex:contains rdfs:label "Contains Function" .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description.extensionFunctions).toHaveLength(2);

      const distanceFunc = description.extensionFunctions.find(
        f => f.uri === 'http://example.org/function/distance'
      );
      expect(distanceFunc).toBeDefined();
      expect(distanceFunc?.label).toBe('Distance Function');
      expect(distanceFunc?.comment).toBe('Calculates distance between two points');

      const containsFunc = description.extensionFunctions.find(
        f => f.uri === 'http://example.org/function/contains'
      );
      expect(containsFunc).toBeDefined();
      expect(containsFunc?.label).toBe('Contains Function');
    });

    it('should parse service description with datasets', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix ex: <http://example.org/> .

        <http://example.org/sparql> a sd:Service ;
          sd:defaultDataset [
            a sd:Dataset ;
            sd:defaultGraph [
              a sd:Graph ;
              sd:name ex:default
            ] ;
            sd:namedGraph [
              a sd:NamedGraph ;
              sd:name ex:graph1
            ] ;
            sd:namedGraph [
              a sd:NamedGraph ;
              sd:name ex:graph2
            ]
          ] .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description.datasets).toHaveLength(1);
      const dataset = description.datasets[0];

      expect(dataset.defaultGraphs).toHaveLength(1);
      expect(dataset.namedGraphs).toHaveLength(2);
      expect(dataset.namedGraphs[0].name).toBe('http://example.org/graph1');
      expect(dataset.namedGraphs[1].name).toBe('http://example.org/graph2');
    });

    it('should parse DBpedia-like service description', async () => {
      // Real-world example based on DBpedia service description
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix void: <http://rdfs.org/ns/void#> .
        @prefix formats: <http://www.w3.org/ns/formats/> .

        <http://dbpedia.org/sparql> a sd:Service ;
          sd:supportedLanguage sd:SPARQL11Query ;
          sd:resultFormat formats:SPARQL_Results_JSON ;
          sd:resultFormat formats:SPARQL_Results_XML ;
          sd:resultFormat formats:SPARQL_Results_CSV ;
          sd:resultFormat formats:SPARQL_Results_TSV ;
          sd:feature sd:DereferencesURIs ;
          sd:feature sd:UnionDefaultGraph ;
          sd:defaultDataset [
            a sd:Dataset ;
            sd:defaultGraph [
              a sd:Graph ;
              void:triples 1000000000
            ]
          ] .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://dbpedia.org/sparql'
      );

      expect(description.endpoint).toBe('http://dbpedia.org/sparql');
      expect(description.supportedLanguages).toContain(SPARQLLanguage.SPARQL11Query);
      expect(description.resultFormats).toHaveLength(4);
      expect(description.features).toHaveLength(2);
      expect(description.datasets).toHaveLength(1);
    });

    it('should handle empty service description', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

        <http://example.org/sparql> a sd:Service .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description.endpoint).toBe('http://example.org/sparql');
      expect(description.supportedLanguages).toHaveLength(0);
      expect(description.features).toHaveLength(0);
      expect(description.resultFormats).toHaveLength(0);
      expect(description.datasets).toHaveLength(0);
    });

    it('should throw error on invalid RDF', async () => {
      const invalidRdf = 'This is not valid RDF';

      await expect(
        service.parseServiceDescription(invalidRdf, 'text/turtle', 'http://example.org/sparql')
      ).rejects.toThrow(ServiceDescriptionError);
    });
  });

  describe('fetchServiceDescription', () => {
    it('should fetch and parse service description from endpoint', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

        <http://example.org/sparql> a sd:Service ;
          sd:supportedLanguage sd:SPARQL11Query .
      `;

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => turtle,
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          headers: new Map([['content-type', 'text/turtle']]),
          text: async () => turtle,
        } as any);

      const description = await service.fetchServiceDescription('http://example.org/sparql');

      expect(description).toBeDefined();
      expect(description?.endpoint).toBe('http://example.org/sparql');
      expect(description?.available).toBe(true);
    });

    it('should return unavailable description when endpoint does not support service description', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as any);

      const description = await service.fetchServiceDescription('http://example.org/sparql');

      expect(description).toBeDefined();
      expect(description?.available).toBe(false);
      expect(description?.endpoint).toBe('http://example.org/sparql');
    });

    it('should return unavailable description on network failure', async () => {
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'));

      const description = await service.fetchServiceDescription('http://example.org/sparql');

      expect(description).toBeDefined();
      expect(description?.available).toBe(false);
      expect(description?.endpoint).toBe('http://example.org/sparql');
    });
  });

  describe('supportsServiceDescription', () => {
    it('should return true when endpoint returns RDF content', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/turtle']]),
      } as any);

      const supported = await service.supportsServiceDescription('http://example.org/sparql');
      expect(supported).toBe(true);
    });

    it('should return false when endpoint returns non-RDF content', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
      } as any);

      const supported = await service.supportsServiceDescription('http://example.org/sparql');
      expect(supported).toBe(false);
    });

    it('should return false when endpoint returns error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as any);

      const supported = await service.supportsServiceDescription('http://example.org/sparql');
      expect(supported).toBe(false);
    });

    it('should return false on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const supported = await service.supportsServiceDescription('http://example.org/sparql');
      expect(supported).toBe(false);
    });
  });

  describe('RDF format detection', () => {
    it('should detect Turtle format', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        <http://example.org/sparql> a sd:Service .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description).toBeDefined();
    });

    it('should detect N-Triples format', async () => {
      const ntriples = `
        <http://example.org/sparql> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/sparql-service-description#Service> .
        <http://example.org/sparql> <http://www.w3.org/ns/sparql-service-description#supportedLanguage> <http://www.w3.org/ns/sparql-service-description#SPARQL11Query> .
      `;

      const description = await service.parseServiceDescription(
        ntriples,
        'application/n-triples',
        'http://example.org/sparql'
      );

      expect(description).toBeDefined();
      expect(description.supportedLanguages).toContain(SPARQLLanguage.SPARQL11Query);
    });
  });

  describe('Edge cases', () => {
    it('should handle service description without explicit sd:Service type', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .

        <http://example.org/sparql>
          sd:supportedLanguage sd:SPARQL11Query .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description).toBeDefined();
      expect(description.supportedLanguages).toContain(SPARQLLanguage.SPARQL11Query);
    });

    it('should handle extension functions without labels or comments', async () => {
      const turtle = `
        @prefix sd: <http://www.w3.org/ns/sparql-service-description#> .
        @prefix ex: <http://example.org/function/> .

        <http://example.org/sparql> a sd:Service ;
          sd:extensionFunction ex:customFunction .
      `;

      const description = await service.parseServiceDescription(
        turtle,
        'text/turtle',
        'http://example.org/sparql'
      );

      expect(description.extensionFunctions).toHaveLength(1);
      expect(description.extensionFunctions[0].uri).toBe('http://example.org/function/customFunction');
      expect(description.extensionFunctions[0].label).toBeUndefined();
      expect(description.extensionFunctions[0].comment).toBeUndefined();
    });
  });
});
