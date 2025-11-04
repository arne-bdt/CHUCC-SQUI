/**
 * Unit tests for query validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateLanguageVersion,
  validateFeatures,
  validateExtensionFunctions,
  validateGraphs,
  validateQuery,
  isStandardFunction,
  type ValidationIssue,
} from '../../../../src/lib/editor/utils/queryValidation.js';
import { SPARQLLanguage, ServiceFeature, type ServiceDescription } from '../../../../src/lib/types/index.js';

/**
 * Create a mock service description for testing
 */
function createMockServiceDescription(
  overrides: Partial<ServiceDescription> = {}
): ServiceDescription {
  return {
    endpoint: 'http://example.org/sparql',
    supportedLanguages: [SPARQLLanguage.SPARQL11Query],
    features: [ServiceFeature.DereferencesURIs],
    resultFormats: ['application/sparql-results+json'],
    inputFormats: ['text/turtle'],
    extensionFunctions: [],
    extensionAggregates: [],
    datasets: [],
    lastFetched: new Date(),
    available: true,
    ...overrides,
  };
}

describe('queryValidation', () => {
  describe('validateLanguageVersion', () => {
    it('should not warn when endpoint supports SPARQL 1.1', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL11Query],
      });

      const query = `
        SELECT * WHERE {
          ?s ?p ?o .
          BIND(STR(?o) AS ?label)
        }
      `;

      const issues = validateLanguageVersion(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });

    it('should warn when using BIND on SPARQL 1.0 endpoint', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL10Query],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o . BIND(STR(?o) AS ?label) }';

      const issues = validateLanguageVersion(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('warning');
      expect(issues[0].message).toContain('BIND clause');
      expect(issues[0].message).toContain('SPARQL 1.1');
      expect(issues[0].actionUrl).toBeDefined();
    });

    it('should warn when using MINUS on SPARQL 1.0 endpoint', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL10Query],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o . MINUS { ?s a :Excluded } }';

      const issues = validateLanguageVersion(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('MINUS');
    });

    it('should warn when using VALUES on SPARQL 1.0 endpoint', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL10Query],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o } VALUES ?s { :a :b :c }';

      const issues = validateLanguageVersion(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('VALUES');
    });

    it('should warn when using SPARQL 1.1 functions on 1.0 endpoint', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL10Query],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o . FILTER(CONTAINS(?o, "test")) }';

      const issues = validateLanguageVersion(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('CONTAINS');
    });

    it('should handle multiple SPARQL 1.1 features', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL10Query],
      });

      const query = `
        SELECT * WHERE {
          ?s ?p ?o .
          BIND(STR(?o) AS ?label)
          MINUS { ?s a :Excluded }
          FILTER(CONTAINS(?label, "test"))
        }
      `;

      const issues = validateLanguageVersion(query, serviceDesc);
      expect(issues.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validateFeatures', () => {
    it('should warn when using FROM without URI dereferencing support', () => {
      const serviceDesc = createMockServiceDescription({
        features: [], // No DereferencesURIs feature
      });

      const query = 'SELECT * FROM <http://example.org/data> WHERE { ?s ?p ?o }';

      const issues = validateFeatures(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('warning');
      expect(issues[0].message).toContain('URI dereferencing');
    });

    it('should warn when using FROM NAMED without URI dereferencing support', () => {
      const serviceDesc = createMockServiceDescription({
        features: [],
      });

      const query = 'SELECT * FROM NAMED <http://example.org/graph> WHERE { GRAPH ?g { ?s ?p ?o } }';

      const issues = validateFeatures(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('URI dereferencing');
    });

    it('should not warn when FROM is used with URI dereferencing support', () => {
      const serviceDesc = createMockServiceDescription({
        features: [ServiceFeature.DereferencesURIs],
      });

      const query = 'SELECT * FROM <http://example.org/data> WHERE { ?s ?p ?o }';

      const issues = validateFeatures(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });

    it('should warn when using SERVICE without federated query support', () => {
      const serviceDesc = createMockServiceDescription({
        features: [], // No BasicFederatedQuery feature
      });

      const query = `
        SELECT * WHERE {
          ?s ?p ?o .
          SERVICE <http://dbpedia.org/sparql> {
            ?s rdfs:label ?label .
          }
        }
      `;

      const issues = validateFeatures(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('federated queries');
    });

    it('should not warn when SERVICE is used with federated query support', () => {
      const serviceDesc = createMockServiceDescription({
        features: [ServiceFeature.BasicFederatedQuery],
      });

      const query = 'SELECT * WHERE { SERVICE <http://dbpedia.org/sparql> { ?s ?p ?o } }';

      const issues = validateFeatures(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });

    it('should warn when dataset is required but not specified', () => {
      const serviceDesc = createMockServiceDescription({
        features: [ServiceFeature.RequiresDataset],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o }';

      const issues = validateFeatures(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('requires dataset specification');
    });

    it('should not warn when dataset is required and specified', () => {
      const serviceDesc = createMockServiceDescription({
        features: [ServiceFeature.RequiresDataset, ServiceFeature.DereferencesURIs],
      });

      const query = 'SELECT * FROM <http://example.org/data> WHERE { ?s ?p ?o }';

      const issues = validateFeatures(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });
  });

  describe('isStandardFunction', () => {
    it('should recognize XML Schema functions as standard', () => {
      expect(isStandardFunction('http://www.w3.org/2001/XMLSchema#string')).toBe(true);
      expect(isStandardFunction('http://www.w3.org/2001/XMLSchema#integer')).toBe(true);
      expect(isStandardFunction('http://www.w3.org/2001/XMLSchema#dateTime')).toBe(true);
    });

    it('should recognize XPath functions as standard', () => {
      expect(isStandardFunction('http://www.w3.org/2005/xpath-functions#concat')).toBe(true);
    });

    it('should recognize SPARQL functions as standard', () => {
      expect(isStandardFunction('http://www.w3.org/ns/sparql#str')).toBe(true);
    });

    it('should not recognize custom functions as standard', () => {
      expect(isStandardFunction('http://example.org/custom#myFunction')).toBe(false);
      expect(isStandardFunction('http://jena.apache.org/ARQ/function#localname')).toBe(false);
    });
  });

  describe('validateExtensionFunctions', () => {
    it('should not warn about standard SPARQL functions', () => {
      const serviceDesc = createMockServiceDescription({
        extensionFunctions: [],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o . FILTER(<http://www.w3.org/2001/XMLSchema#string>(?o)) }';

      const issues = validateExtensionFunctions(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });

    it('should warn about unknown custom functions', () => {
      const serviceDesc = createMockServiceDescription({
        extensionFunctions: [],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o . FILTER(<http://example.org/custom#myFunc>(?o)) }';

      const issues = validateExtensionFunctions(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('info');
      expect(issues[0].message).toContain('not listed in endpoint capabilities');
    });

    it('should not warn about registered extension functions', () => {
      const serviceDesc = createMockServiceDescription({
        extensionFunctions: [
          {
            uri: 'http://example.org/custom#myFunc',
            label: 'My Custom Function',
          },
        ],
      });

      const query = 'SELECT * WHERE { ?s ?p ?o . FILTER(<http://example.org/custom#myFunc>(?o)) }';

      const issues = validateExtensionFunctions(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });
  });

  describe('validateGraphs', () => {
    it('should not warn when no graph information is available', () => {
      const serviceDesc = createMockServiceDescription({
        datasets: [],
      });

      const query = 'SELECT * FROM NAMED <http://example.org/unknown> WHERE { GRAPH ?g { ?s ?p ?o } }';

      const issues = validateGraphs(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });

    it('should warn when graph is not in available graphs list', () => {
      const serviceDesc = createMockServiceDescription({
        datasets: [
          {
            defaultGraphs: [],
            namedGraphs: [
              { name: 'http://example.org/graph1' },
              { name: 'http://example.org/graph2' },
            ],
          },
        ],
      });

      const query = 'SELECT * FROM NAMED <http://example.org/unknown> WHERE { GRAPH ?g { ?s ?p ?o } }';

      const issues = validateGraphs(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('info');
      expect(issues[0].message).toContain('not in endpoint\'s named graphs list');
    });

    it('should not warn when graph is in available graphs list', () => {
      const serviceDesc = createMockServiceDescription({
        datasets: [
          {
            defaultGraphs: [],
            namedGraphs: [
              { name: 'http://example.org/graph1' },
              { name: 'http://example.org/graph2' },
            ],
          },
        ],
      });

      const query = 'SELECT * FROM NAMED <http://example.org/graph1> WHERE { GRAPH ?g { ?s ?p ?o } }';

      const issues = validateGraphs(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });

    it('should warn about unknown graphs in GRAPH clause', () => {
      const serviceDesc = createMockServiceDescription({
        datasets: [
          {
            defaultGraphs: [],
            namedGraphs: [{ name: 'http://example.org/graph1' }],
          },
        ],
      });

      const query = 'SELECT * WHERE { GRAPH <http://example.org/unknown> { ?s ?p ?o } }';

      const issues = validateGraphs(query, serviceDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('not in endpoint\'s named graphs list');
    });
  });

  describe('validateQuery', () => {
    it('should return empty array when service description is null', () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const issues = validateQuery(query, null);
      expect(issues).toHaveLength(0);
    });

    it('should return empty array when service description is not available', () => {
      const serviceDesc = createMockServiceDescription({
        available: false,
      });

      const query = 'SELECT * WHERE { ?s ?p ?o }';
      const issues = validateQuery(query, serviceDesc);
      expect(issues).toHaveLength(0);
    });

    it('should run all enabled checks by default', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL10Query],
        features: [],
      });

      const query = `
        SELECT * FROM <http://example.org/data> WHERE {
          ?s ?p ?o .
          BIND(STR(?o) AS ?label)
        }
      `;

      const issues = validateQuery(query, serviceDesc);
      expect(issues.length).toBeGreaterThan(0);

      // Should have warnings about BIND (language version) and FROM (features)
      const bindWarnings = issues.filter((i) => i.message.includes('BIND'));
      const fromWarnings = issues.filter((i) => i.message.includes('URI dereferencing'));
      expect(bindWarnings.length).toBeGreaterThan(0);
      expect(fromWarnings.length).toBeGreaterThan(0);
    });

    it('should respect enabled checks configuration', () => {
      const serviceDesc = createMockServiceDescription({
        supportedLanguages: [SPARQLLanguage.SPARQL10Query],
        features: [],
      });

      const query = 'SELECT * FROM <http://example.org/data> WHERE { BIND(STR(?o) AS ?label) }';

      // Only check language version
      const issues = validateQuery(query, serviceDesc, {
        languageVersion: true,
        features: false,
      });

      // Should only have BIND warning, not FROM warning
      expect(issues.some((i) => i.message.includes('BIND'))).toBe(true);
      expect(issues.some((i) => i.message.includes('URI dereferencing'))).toBe(false);
    });

    it('should disable extension function and graph checks by default', () => {
      const serviceDesc = createMockServiceDescription({
        extensionFunctions: [],
        datasets: [
          {
            defaultGraphs: [],
            namedGraphs: [{ name: 'http://example.org/graph1' }],
          },
        ],
      });

      const query = `
        SELECT * WHERE {
          GRAPH <http://example.org/unknown> { ?s ?p ?o }
          FILTER(<http://example.org/custom#func>(?o))
        }
      `;

      const issues = validateQuery(query, serviceDesc);

      // Should not have warnings about graphs or extension functions (disabled by default)
      expect(issues.some((i) => i.message.includes('not in endpoint'))).toBe(false);
      expect(issues.some((i) => i.message.includes('not listed in endpoint'))).toBe(false);
    });
  });
});
