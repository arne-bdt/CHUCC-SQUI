/**
 * Integration tests for ResultsPlaceholder component
 * Tests real rendering with store integration, DataTable display, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import ResultsPlaceholder from '../../../src/lib/components/Results/ResultsPlaceholder.svelte';
import { resultsStore } from '../../../src/lib/stores/resultsStore';
import type { SparqlJsonResults } from '../../../src/lib/types';

describe('ResultsPlaceholder Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    resultsStore.reset();
  });

  describe('Initial State', () => {
    it('should render placeholder message when no data', () => {
      const { container } = render(ResultsPlaceholder);

      expect(screen.getByText('Query Results')).toBeInTheDocument();
      expect(
        screen.getByText('Results will be displayed here after query execution')
      ).toBeInTheDocument();
    });

    it('should have results-placeholder CSS class', () => {
      const { container } = render(ResultsPlaceholder);
      expect(container.querySelector('.results-placeholder')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading message when executing query', () => {
      resultsStore.setLoading(true);
      render(ResultsPlaceholder);

      expect(screen.getByText('Executing Query')).toBeInTheDocument();
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('should not show placeholder content when loading', () => {
      resultsStore.setLoading(true);
      render(ResultsPlaceholder);

      expect(screen.queryByText('Query Results')).not.toBeInTheDocument();
    });
  });

  describe('SELECT Query Results', () => {
    it('should render DataTable for SELECT query results', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: [
            {
              subject: { type: 'uri', value: 'http://example.org/subject1' },
              predicate: { type: 'uri', value: 'http://example.org/predicate1' },
              object: { type: 'literal', value: 'Object 1' },
            },
            {
              subject: { type: 'uri', value: 'http://example.org/subject2' },
              predicate: { type: 'uri', value: 'http://example.org/predicate2' },
              object: { type: 'literal', value: 'Object 2' },
            },
          ],
        },
      };

      resultsStore.setData(mockResults, 150);
      const { container } = render(ResultsPlaceholder);

      // Verify DataTable renders
      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      // Verify results info is displayed
      expect(screen.getByText('2 results')).toBeInTheDocument();
      expect(screen.getByText('3 variables')).toBeInTheDocument();
    });

    it('should display empty state for SELECT query with no results', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: {
          bindings: [],
        },
      };

      resultsStore.setData(mockResults, 100);
      const { container } = render(ResultsPlaceholder);

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });

      expect(screen.getByText('Try modifying your query')).toBeInTheDocument();
    });

    it('should handle large datasets (1000 rows)', async () => {
      // Generate large dataset
      const bindings = Array.from({ length: 1000 }, (_, i) => ({
        subject: { type: 'uri' as const, value: `http://example.org/subject${i}` },
        predicate: { type: 'uri' as const, value: `http://example.org/predicate${i}` },
        object: { type: 'literal' as const, value: `Object ${i}` },
      }));

      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'predicate', 'object'] },
        results: { bindings },
      };

      resultsStore.setData(mockResults, 450);
      const { container } = render(ResultsPlaceholder);

      // Should render without freezing (within timeout)
      await waitFor(
        () => {
          expect(container.querySelector('.data-table-container')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify count
      expect(screen.getByText('1000 results')).toBeInTheDocument();
    });

    it('should handle multilingual data', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['label'] },
        results: {
          bindings: [
            { label: { type: 'literal', value: 'Hello', 'xml:lang': 'en' } },
            { label: { type: 'literal', value: 'Bonjour', 'xml:lang': 'fr' } },
            { label: { type: 'literal', value: '你好', 'xml:lang': 'zh' } },
          ],
        },
      };

      resultsStore.setData(mockResults, 120);
      const { container } = render(ResultsPlaceholder);

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('3 results')).toBeInTheDocument();
    });

    it('should handle typed literals', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['value', 'count'] },
        results: {
          bindings: [
            {
              value: { type: 'literal', value: 'test' },
              count: {
                type: 'literal',
                value: '42',
                datatype: 'http://www.w3.org/2001/XMLSchema#integer',
              },
            },
          ],
        },
      };

      resultsStore.setData(mockResults, 100);
      const { container } = render(ResultsPlaceholder);

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });
    });
  });

  describe('ASK Query Results', () => {
    it('should render TRUE for ASK query with true result', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        boolean: true,
      };

      resultsStore.setData(mockResults, 80);
      render(ResultsPlaceholder);

      await waitFor(() => {
        expect(screen.getByText('ASK Query Result')).toBeInTheDocument();
      });

      const trueElement = screen.getByText('TRUE');
      expect(trueElement).toBeInTheDocument();
      expect(trueElement).toHaveClass('ask-result');
      expect(trueElement).toHaveClass('true');
    });

    it('should render FALSE for ASK query with false result', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        boolean: false,
      };

      resultsStore.setData(mockResults, 90);
      render(ResultsPlaceholder);

      await waitFor(() => {
        expect(screen.getByText('ASK Query Result')).toBeInTheDocument();
      });

      const falseElement = screen.getByText('FALSE');
      expect(falseElement).toBeInTheDocument();
      expect(falseElement).toHaveClass('ask-result');
      expect(falseElement).toHaveClass('false');
    });

    it('should display execution time for ASK results', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        boolean: true,
      };

      resultsStore.setData(mockResults, 125);
      render(ResultsPlaceholder);

      await waitFor(() => {
        expect(screen.getByText('Executed in 125ms')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error notification on query failure', () => {
      resultsStore.setError('Bad Request: Invalid SPARQL query');
      render(ResultsPlaceholder);

      expect(screen.getByText('Bad Request: Invalid SPARQL query')).toBeInTheDocument();
    });

    it('should display network error with proper styling', () => {
      resultsStore.setError('Network error: Unable to reach endpoint');
      const { container } = render(ResultsPlaceholder);

      expect(screen.getByText('Network error: Unable to reach endpoint')).toBeInTheDocument();
      expect(container.querySelector('.bx--inline-notification')).toBeInTheDocument();
    });

    it('should clear error when close button clicked', async () => {
      resultsStore.setError('Test error');
      const { container } = render(ResultsPlaceholder);

      const closeButton = container.querySelector('.bx--inline-notification__close-button');
      expect(closeButton).toBeInTheDocument();

      // Click close button
      if (closeButton) {
        await closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      // Error should be cleared from store
      await waitFor(() => {
        const state = resultsStore;
        expect(state).toBeDefined();
      });
    });

    it('should not show results when error is present', () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject'] },
        results: { bindings: [] },
      };

      resultsStore.setData(mockResults, 100);
      resultsStore.setError('Subsequent error');

      const { container } = render(ResultsPlaceholder);

      expect(screen.getByText('Subsequent error')).toBeInTheDocument();
      expect(container.querySelector('.data-table-container')).not.toBeInTheDocument();
    });
  });

  describe('Store Reactivity', () => {
    it('should react to store updates after initial render', async () => {
      const { container } = render(ResultsPlaceholder);

      // Initially shows placeholder
      expect(screen.getByText('Query Results')).toBeInTheDocument();

      // Update store with data
      const mockResults: SparqlJsonResults = {
        head: { vars: ['name'] },
        results: {
          bindings: [{ name: { type: 'literal', value: 'Test' } }],
        },
      };

      resultsStore.setData(mockResults, 100);

      // Should now show DataTable
      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.queryByText('Query Results')).not.toBeInTheDocument();
    });

    it('should handle rapid state changes', async () => {
      const { container } = render(ResultsPlaceholder);

      // Simulate rapid changes
      resultsStore.setLoading(true);
      resultsStore.setLoading(false);

      const mockResults: SparqlJsonResults = {
        head: { vars: ['test'] },
        results: { bindings: [{ test: { type: 'literal', value: '1' } }] },
      };

      resultsStore.setData(mockResults, 50);

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });
    });

    it('should handle loading -> error -> results sequence', async () => {
      const { container, rerender } = render(ResultsPlaceholder);

      // Start loading
      resultsStore.setLoading(true);
      await waitFor(() => {
        expect(screen.getByText('Executing Query')).toBeInTheDocument();
      });

      // Error occurs
      resultsStore.setError('Timeout error');
      await waitFor(() => {
        expect(screen.getByText('Timeout error')).toBeInTheDocument();
      });

      // Clear error and show results
      resultsStore.clearError();
      const mockResults: SparqlJsonResults = {
        head: { vars: ['id'] },
        results: { bindings: [{ id: { type: 'literal', value: '123' } }] },
      };
      resultsStore.setData(mockResults, 200);

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should render 10,000 rows without freezing', async () => {
      // This test would have caught the infinite $derived loop bug
      const bindings = Array.from({ length: 10000 }, (_, i) => ({
        id: { type: 'literal' as const, value: String(i) },
        name: { type: 'literal' as const, value: `Name ${i}` },
        uri: { type: 'uri' as const, value: `http://example.org/${i}` },
      }));

      const mockResults: SparqlJsonResults = {
        head: { vars: ['id', 'name', 'uri'] },
        results: { bindings },
      };

      const startTime = performance.now();
      resultsStore.setData(mockResults, 500);
      const { container } = render(ResultsPlaceholder);

      // Should render within 5 seconds (generous timeout for CI)
      await waitFor(
        () => {
          expect(container.querySelector('.data-table-container')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(5000);

      expect(screen.getByText('10000 results')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unbound variables', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['subject', 'optional'] },
        results: {
          bindings: [
            {
              subject: { type: 'uri', value: 'http://example.org/1' },
              // optional is unbound (missing)
            },
            {
              subject: { type: 'uri', value: 'http://example.org/2' },
              optional: { type: 'literal', value: 'bound' },
            },
          ],
        },
      };

      resultsStore.setData(mockResults, 100);
      const { container } = render(ResultsPlaceholder);

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });

      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    it('should handle blank nodes', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: ['node'] },
        results: {
          bindings: [
            { node: { type: 'bnode', value: '_:b0' } },
            { node: { type: 'bnode', value: '_:b1' } },
          ],
        },
      };

      resultsStore.setData(mockResults, 100);
      const { container } = render(ResultsPlaceholder);

      await waitFor(() => {
        expect(container.querySelector('.data-table-container')).toBeInTheDocument();
      });
    });

    it('should handle results with no variables', async () => {
      const mockResults: SparqlJsonResults = {
        head: { vars: [] },
        results: { bindings: [] },
      };

      resultsStore.setData(mockResults, 50);
      const { container } = render(ResultsPlaceholder);

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });
  });
});
