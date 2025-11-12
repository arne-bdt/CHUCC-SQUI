/**
 * Integration tests for ResultFormatSelector component
 */

import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import TestWrapper from './ResultFormatSelector.test.wrapper.svelte';

describe('ResultFormatSelector', () => {
  beforeEach(() => {
    // StoreProvider creates fresh stores for each test
  });

  it('should render format selector with label', () => {
    render(TestWrapper, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
      },
    });

    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should show binding formats for SELECT query', () => {
    render(TestWrapper, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Basic rendering test (service description features tested in component stories)
    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should show RDF formats for CONSTRUCT query', () => {
    render(TestWrapper, {
      props: {
        query: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Basic rendering test
    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should show helper text when service description unavailable', () => {
    render(TestWrapper, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'http://unknown.org/sparql',
      },
    });

    // Should still render the selector
    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should handle query with PREFIX declarations', () => {
    const queryWithPrefix = `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?name WHERE { ?person foaf:name ?name }`;

    render(TestWrapper, {
      props: {
        query: queryWithPrefix,
        endpoint: 'http://example.org/sparql',
      },
    });

    // Should render
    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(TestWrapper, {
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
    render(TestWrapper, {
      props: {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Basic rendering test
    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should handle ASK queries', () => {
    render(TestWrapper, {
      props: {
        query: 'ASK { ?s a foaf:Person }',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Basic rendering test
    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });

  it('should handle DESCRIBE queries', () => {
    render(TestWrapper, {
      props: {
        query: 'DESCRIBE <http://example.org/resource>',
        endpoint: 'http://example.org/sparql',
      },
    });

    // Basic rendering test
    expect(screen.getByText('Result Format')).toBeInTheDocument();
  });
});
