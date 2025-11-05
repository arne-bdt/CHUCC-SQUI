/**
 * Integration tests for ResultFormatSelector component
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import ResultFormatSelector from '../../src/lib/components/Query/ResultFormatSelector.svelte';
import { serviceDescriptionStore } from '../../src/lib/stores/serviceDescriptionStore.js';
import { queryStore } from '../../src/lib/stores/queryStore.js';
import type { ServiceDescription } from '../../src/lib/types/index.js';

// Mock service descriptions
const mockServiceDescWithAllFormats: ServiceDescription = {
  endpoint: 'http://example.org/sparql',
  supportedLanguages: [],
  features: [],
  resultFormats: [
    'application/sparql-results+json',
    'application/sparql-results+xml',
    'text/csv',
    'text/tab-separated-values',
    'text/turtle',
    'application/rdf+xml',
    'application/ld+json',
    'application/n-triples',
  ],
  inputFormats: [],
  extensionFunctions: [],
  extensionAggregates: [],
  datasets: [],
  lastFetched: new Date(),
  available: true,
};

describe('ResultFormatSelector', () => {
  beforeEach(() => {
    // Reset stores before each test
    serviceDescriptionStore.reset();
    queryStore.reset();
  });

  it('should render format selector with label', () => {
    render(ResultFormatSelector, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
      },
    });

    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should show binding formats for SELECT query', () => {
    // Set up service description
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    render(ResultFormatSelector, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Should show format description for JSON
    expect(screen.getByText(/JSON Results/i)).toBeInTheDocument();
  });

  it('should show RDF formats for CONSTRUCT query', () => {
    // Set up service description
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    render(ResultFormatSelector, {
      props: {
        query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Should show format info with description for Turtle (best RDF format)
    expect(screen.getByText('Turtle - Human-readable RDF')).toBeInTheDocument();
  });

  it('should show helper text when service description unavailable', () => {
    render(ResultFormatSelector, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'http://unknown.org/sparql',
      },
    });

    expect(screen.getByText(/service description not available/i)).toBeInTheDocument();
  });

  it('should handle query with PREFIX declarations', () => {
    const queryWithPrefix = `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?name WHERE { ?person foaf:name ?name }`;

    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    render(ResultFormatSelector, {
      props: {
        query: queryWithPrefix,
        endpoint: 'http://example.org/sparql',
      },
    });

    // Should still detect SELECT and show JSON description
    expect(screen.getByText(/JSON Results/i)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(ResultFormatSelector, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        disabled: true,
      },
    });

    // Check if select is disabled (carbon select has disabled attribute)
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should show format description', () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    render(ResultFormatSelector, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Should show JSON description
    expect(screen.getByText(/JSON Results/i)).toBeInTheDocument();
  });

  it('should handle ASK queries', () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    render(ResultFormatSelector, {
      props: {
        query: 'ASK { ?s a foaf:Person }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Should show JSON description (best format for ASK)
    expect(screen.getByText(/JSON Results/i)).toBeInTheDocument();
  });

  it('should handle DESCRIBE queries', () => {
    serviceDescriptionStore.update((state) => {
      const descriptions = new Map(state.descriptions);
      descriptions.set('http://example.org/sparql', mockServiceDescWithAllFormats);
      return {
        ...state,
        descriptions,
        currentEndpoint: 'http://example.org/sparql',
      };
    });

    render(ResultFormatSelector, {
      props: {
        query: 'DESCRIBE <http://example.org/resource>',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Should show Turtle description (best format for DESCRIBE)
    expect(screen.getByText('Turtle - Human-readable RDF')).toBeInTheDocument();
  });
});
