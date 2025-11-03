/**
 * Integration tests for query warning system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import QueryWarningDialog from '../../src/lib/components/Query/QueryWarningDialog.svelte';
import TruncationWarning from '../../src/lib/components/Results/TruncationWarning.svelte';
import { analyzeQuery } from '../../src/lib/utils/queryAnalyzer';
import type { ParsedTableData } from '../../src/lib/utils/resultsParser';

describe('QueryWarningDialog', () => {
  it('should render warning dialog for large queries', async () => {
    const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 75000';
    const analysis = analyzeQuery(query);

    const mockCancel = vi.fn();
    const mockDownload = vi.fn();
    const mockExecute = vi.fn();

    const { container } = render(QueryWarningDialog, {
      props: {
        open: true,
        analysis,
        onCancel: mockCancel,
        onDownloadCSV: mockDownload,
        onExecuteAnyway: mockExecute,
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Large Result Set');
    });
  });

  it('should show critical warning for queries without LIMIT', async () => {
    const query = 'SELECT * WHERE { ?s ?p ?o }';
    const analysis = analyzeQuery(query);

    const mockCancel = vi.fn();
    const mockDownload = vi.fn();
    const mockExecute = vi.fn();

    const { container } = render(QueryWarningDialog, {
      props: {
        open: true,
        analysis,
        onCancel: mockCancel,
        onDownloadCSV: mockDownload,
        onExecuteAnyway: mockExecute,
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Download Recommended');
      expect(container.textContent).toContain('Critical');
    });
  });

  it('should show medium warning for queries with moderate LIMIT', async () => {
    const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 25000';
    const analysis = analyzeQuery(query);

    const mockCancel = vi.fn();
    const mockDownload = vi.fn();
    const mockExecute = vi.fn();

    const { container } = render(QueryWarningDialog, {
      props: {
        open: true,
        analysis,
        onCancel: mockCancel,
        onDownloadCSV: mockDownload,
        onExecuteAnyway: mockExecute,
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Large Result Set Warning');
      expect(container.textContent).toContain('Medium');
    });
  });

  it('should display analysis information', async () => {
    const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100000';
    const analysis = analyzeQuery(query);

    const mockCancel = vi.fn();
    const mockDownload = vi.fn();
    const mockExecute = vi.fn();

    const { container } = render(QueryWarningDialog, {
      props: {
        open: true,
        analysis,
        onCancel: mockCancel,
        onDownloadCSV: mockDownload,
        onExecuteAnyway: mockExecute,
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Analysis:');
      expect(container.textContent).toContain('Estimated memory:');
      expect(container.textContent).toContain('Risk level:');
    });
  });

  it('should display recommendations', async () => {
    const query = 'SELECT * WHERE { ?s ?p ?o }';
    const analysis = analyzeQuery(query);

    const mockCancel = vi.fn();
    const mockDownload = vi.fn();
    const mockExecute = vi.fn();

    const { container } = render(QueryWarningDialog, {
      props: {
        open: true,
        analysis,
        onCancel: mockCancel,
        onDownloadCSV: mockDownload,
        onExecuteAnyway: mockExecute,
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Recommendations:');
      expect(container.textContent).toContain('Download results as CSV');
      expect(container.textContent).toContain('LIMIT clause');
    });
  });

  it('should call onDownloadCSV when Download CSV button is clicked', async () => {
    const user = userEvent.setup();
    const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 100000';
    const analysis = analyzeQuery(query);

    const mockCancel = vi.fn();
    const mockDownload = vi.fn();
    const mockExecute = vi.fn();

    render(QueryWarningDialog, {
      props: {
        open: true,
        analysis,
        onCancel: mockCancel,
        onDownloadCSV: mockDownload,
        onExecuteAnyway: mockExecute,
      },
    });

    const downloadButton = await screen.findByText('Download CSV');
    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledTimes(1);
    });
  });

  it('should show different button text based on recommendation', async () => {
    // Test "download-instead" recommendation
    const criticalQuery = 'SELECT * WHERE { ?s ?p ?o }';
    const criticalAnalysis = analyzeQuery(criticalQuery);

    const { container: criticalContainer } = render(QueryWarningDialog, {
      props: {
        open: true,
        analysis: criticalAnalysis,
        onCancel: vi.fn(),
        onDownloadCSV: vi.fn(),
        onExecuteAnyway: vi.fn(),
      },
    });

    await waitFor(() => {
      // For critical queries, secondary button should be "Cancel"
      expect(criticalContainer.textContent).toContain('Cancel');
    });
  });
});

describe('TruncationWarning', () => {
  let mockData: ParsedTableData;

  beforeEach(() => {
    mockData = {
      columns: ['s', 'p', 'o'],
      rows: Array.from({ length: 10000 }, (_, i) => ({
        s: { type: 'uri', value: `http://example.org/s${i}` },
        p: { type: 'uri', value: 'http://example.org/predicate' },
        o: { type: 'literal', value: `Object ${i}` },
      })),
      rowCount: 10000,
      vars: ['s', 'p', 'o'],
      totalRows: 47532,
      isTruncated: true,
    };
  });

  it('should render truncation warning when results are truncated', async () => {
    const mockDownload = vi.fn();
    const mockRefine = vi.fn();

    const { container } = render(TruncationWarning, {
      props: {
        data: mockData,
        onDownloadFull: mockDownload,
        onRefineQuery: mockRefine,
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Results Truncated');
      expect(container.textContent).toContain('10,000');
      expect(container.textContent).toContain('47,532');
    });
  });

  it('should show number of hidden rows', async () => {
    const mockDownload = vi.fn();
    const mockRefine = vi.fn();

    const { container } = render(TruncationWarning, {
      props: {
        data: mockData,
        onDownloadFull: mockDownload,
        onRefineQuery: mockRefine,
      },
    });

    await waitFor(() => {
      // 47532 - 10000 = 37532 hidden rows
      expect(container.textContent).toContain('37,532 rows not displayed');
    });
  });

  it('should not render when results are not truncated', () => {
    const nonTruncatedData: ParsedTableData = {
      ...mockData,
      rowCount: 100,
      totalRows: 100,
      isTruncated: false,
    };

    const { container } = render(TruncationWarning, {
      props: {
        data: nonTruncatedData,
        onDownloadFull: vi.fn(),
        onRefineQuery: vi.fn(),
      },
    });

    expect(container.textContent).not.toContain('Results Truncated');
  });

  it('should call onDownloadFull when Download button is clicked', async () => {
    const user = userEvent.setup();
    const mockDownload = vi.fn();
    const mockRefine = vi.fn();

    render(TruncationWarning, {
      props: {
        data: mockData,
        onDownloadFull: mockDownload,
        onRefineQuery: mockRefine,
      },
    });

    const downloadButton = await screen.findByText('Download Full Results');
    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onRefineQuery when Refine Query button is clicked', async () => {
    const user = userEvent.setup();
    const mockDownload = vi.fn();
    const mockRefine = vi.fn();

    render(TruncationWarning, {
      props: {
        data: mockData,
        onDownloadFull: mockDownload,
        onRefineQuery: mockRefine,
      },
    });

    const refineButton = await screen.findByText('Refine Query');
    await user.click(refineButton);

    await waitFor(() => {
      expect(mockRefine).toHaveBeenCalledTimes(1);
    });
  });

  it('should display helpful options in details', async () => {
    const mockDownload = vi.fn();
    const mockRefine = vi.fn();

    const { container } = render(TruncationWarning, {
      props: {
        data: mockData,
        onDownloadFull: mockDownload,
        onRefineQuery: mockRefine,
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Options:');
      expect(container.textContent).toContain('Download all');
      expect(container.textContent).toContain('LIMIT or WHERE clause');
      expect(container.textContent).toContain('maxRows setting');
    });
  });

  it('should format large numbers with locale separators', async () => {
    const largeData: ParsedTableData = {
      ...mockData,
      rowCount: 10000,
      totalRows: 1234567,
      isTruncated: true,
    };

    const { container } = render(TruncationWarning, {
      props: {
        data: largeData,
        onDownloadFull: vi.fn(),
        onRefineQuery: vi.fn(),
      },
    });

    await waitFor(() => {
      expect(container.textContent).toContain('1,234,567');
    });
  });
});

describe('Query Analysis Integration', () => {
  it('should correctly analyze and warn about various query patterns', () => {
    const testCases = [
      {
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 100',
        expectedRecommendation: 'safe',
        expectedWarnings: 0,
      },
      {
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 15000',
        expectedRecommendation: 'warn',
        expectedWarnings: 1,
      },
      {
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 100000',
        expectedRecommendation: 'download-instead',
        expectedWarnings: 1,
      },
      {
        query: 'SELECT * WHERE { ?s ?p ?o }',
        expectedRecommendation: 'download-instead',
        expectedWarnings: 1,
      },
      {
        query: 'SELECT * WHERE { ?s ?p ?o } LIMIT 100 OFFSET 50000',
        expectedRecommendation: 'safe',
        expectedWarnings: 1, // Warn about large OFFSET
      },
    ];

    testCases.forEach(({ query, expectedRecommendation, expectedWarnings }) => {
      const analysis = analyzeQuery(query);
      expect(analysis.recommendation).toBe(expectedRecommendation);
      expect(analysis.warnings).toHaveLength(expectedWarnings);
    });
  });
});
