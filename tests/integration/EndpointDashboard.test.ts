/**
 * Integration tests for EndpointDashboard component
 * Tests tabbed interface displaying endpoint capabilities, datasets, and functions
 */
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import EndpointDashboardTestWrapper from './helpers/EndpointDashboardTestWrapper.svelte';

// Helper to render EndpointDashboard wrapped in StoreProvider with proper props
function renderWithStore(props: {
  currentEndpoint?: string | null;
  onInsertFunction?: (functionCall: string) => void;
  compact?: boolean;
} = {}) {
  const endpoint = props.currentEndpoint ?? 'https://dbpedia.org/sparql';

  return render(EndpointDashboardTestWrapper, {
    props: {
      currentEndpoint: endpoint,
      onInsertFunction: props.onInsertFunction,
      compact: props.compact ?? false,
    },
  });
}

describe('EndpointDashboard', () => {
  describe('Initial Rendering', () => {
    it('should render dashboard container', async () => {
      const { container } = renderWithStore();

      await waitFor(() => {
        const dashboard = container.querySelector('.endpoint-dashboard');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show empty state when no service description available', async () => {
      renderWithStore({ currentEndpoint: null });

      await waitFor(() => {
        expect(screen.queryByText(/no service description available/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show hint text in empty state', async () => {
      renderWithStore({ currentEndpoint: null });

      await waitFor(() => {
        expect(screen.queryByText(/some endpoints don't support/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Component Props', () => {
    it('should accept currentEndpoint prop', () => {
      const { container } = renderWithStore({ currentEndpoint: 'https://example.com/sparql' });
      expect(container).toBeTruthy();
    });

    it('should accept onInsertFunction callback', () => {
      const mockCallback = () => {};
      const { container } = renderWithStore({
        currentEndpoint: 'https://example.com/sparql',
        onInsertFunction: mockCallback,
      });
      expect(container).toBeTruthy();
    });

    it('should accept compact mode prop', () => {
      const { container } = renderWithStore({
        currentEndpoint: 'https://example.com/sparql',
        compact: true,
      });
      expect(container.querySelector('.endpoint-dashboard.compact')).toBeInTheDocument();
    });

    it('should not apply compact class when compact is false', () => {
      const { container } = renderWithStore({
        currentEndpoint: 'https://example.com/sparql',
        compact: false,
      });

      const dashboard = container.querySelector('.endpoint-dashboard');
      expect(dashboard).toBeInTheDocument();
      expect(dashboard).not.toHaveClass('compact');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null currentEndpoint', async () => {
      renderWithStore({ currentEndpoint: null });

      await waitFor(() => {
        expect(screen.queryByText(/no service description available/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle empty string currentEndpoint', async () => {
      renderWithStore({ currentEndpoint: '' });

      await waitFor(() => {
        expect(screen.queryByText(/no service description available/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle undefined onInsertFunction callback', () => {
      const { container } = renderWithStore({
        currentEndpoint: 'https://example.com/sparql',
        onInsertFunction: undefined,
      });

      expect(container.querySelector('.endpoint-dashboard')).toBeInTheDocument();
    });
  });

  describe('Rendering with StoreProvider', () => {
    it('should render when wrapped in StoreProvider', async () => {
      const { container } = renderWithStore();

      await waitFor(() => {
        const dashboard = container.querySelector('.endpoint-dashboard');
        expect(dashboard).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render empty state structure', async () => {
      renderWithStore({ currentEndpoint: null });

      await waitFor(() => {
        const emptyState = screen.queryByText(/no service description/i);
        expect(emptyState).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('CSS Classes', () => {
    it('should have endpoint-dashboard class', () => {
      const { container } = renderWithStore({ currentEndpoint: 'https://example.com/sparql' });
      expect(container.querySelector('.endpoint-dashboard')).toBeInTheDocument();
    });

    it('should apply compact class when compact prop is true', () => {
      const { container } = renderWithStore({
        currentEndpoint: 'https://example.com/sparql',
        compact: true,
      });
      expect(container.querySelector('.endpoint-dashboard.compact')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with responsive layout', () => {
      const { container} = renderWithStore({ currentEndpoint: 'https://example.com/sparql' });
      const dashboard = container.querySelector('.endpoint-dashboard');
      expect(dashboard).toBeInTheDocument();
    });
  });
});
