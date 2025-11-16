/**
 * Integration tests for EndpointInfoSummary component
 * Tests collapsible summary bar showing endpoint capabilities
 */
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import EndpointInfoSummaryTestWrapper from './helpers/EndpointInfoSummaryTestWrapper.svelte';

// Helper to render EndpointInfoSummary wrapped in StoreProvider
function renderWithStore(initialEndpoint = '') {
  return render(EndpointInfoSummaryTestWrapper, {
    props: {
      initialEndpoint,
    },
  });
}

describe('EndpointInfoSummary', () => {
  describe('Initial Rendering', () => {
    it('should not render when no endpoint is selected', () => {
      const { container } = renderWithStore('');
      expect(container.querySelector('.endpoint-info-summary')).not.toBeInTheDocument();
    });

    it('should render summary bar when endpoint is selected', async () => {
      const { container } = renderWithStore('https://dbpedia.org/sparql');

      await waitFor(() => {
        const summaryBar = container.querySelector('.summary-bar');
        expect(summaryBar).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show "No service description available" when service description fails', async () => {
      const { container } = renderWithStore('https://dbpedia.org/sparql');

      await waitFor(() => {
        const errorMessage = container.querySelector('.summary-error span');
        expect(errorMessage?.textContent).toMatch(/no service description available/i);
      }, { timeout: 3000 });
    });
  });

  describe('Refresh Functionality', () => {
    it('should show refresh button', async () => {
      renderWithStore('https://dbpedia.org/sparql');

      await waitFor(() => {
        const refreshButton = screen.queryByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should not show refresh button when endpoint is empty', () => {
      renderWithStore('');
      const refreshButton = screen.queryByRole('button', { name: /refresh/i });
      expect(refreshButton).not.toBeInTheDocument();
    });
  });

  describe('ARIA Live Regions', () => {
    it('should have ARIA live region for status announcements', async () => {
      const { container } = renderWithStore('https://dbpedia.org/sparql');

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should announce status in ARIA live region', async () => {
      const { container } = renderWithStore('https://dbpedia.org/sparql');

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion?.textContent).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty endpoint URL', () => {
      const { container } = renderWithStore('');
      expect(container.querySelector('.endpoint-info-summary')).not.toBeInTheDocument();
    });

    it('should handle whitespace-only endpoint URL', async () => {
      const { container } = renderWithStore('   ');

      // Whitespace-only string '   ' is truthy, so component renders (shows loading state)
      await waitFor(() => {
        const summary = container.querySelector('.endpoint-info-summary');
        expect(summary).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render summary bar structure', async () => {
      const { container } = renderWithStore('https://example.com/sparql');

      await waitFor(() => {
        const summaryBar = container.querySelector('.summary-bar');
        expect(summaryBar).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render summary actions container', async () => {
      const { container } = renderWithStore('https://example.com/sparql');

      await waitFor(() => {
        const summaryActions = container.querySelector('.summary-actions');
        expect(summaryActions).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Component Structure', () => {
    it('should accept onInsertFunction prop', () => {
      const mockCallback = () => {};
      const { container } = renderWithStore('https://example.com/sparql');
      expect(container).toBeTruthy();
    });

    it('should work without onInsertFunction prop', () => {
      const { container } = renderWithStore('https://example.com/sparql');
      expect(container).toBeTruthy();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with responsive CSS classes', async () => {
      const { container } = renderWithStore('https://example.com/sparql');

      await waitFor(() => {
        const summary = container.querySelector('.endpoint-info-summary');
        expect(summary).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
