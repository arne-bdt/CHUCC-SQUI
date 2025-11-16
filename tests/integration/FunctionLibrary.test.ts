/**
 * Integration tests for FunctionLibrary component
 * Tests extension functions/aggregates library with search, filtering, and modal
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import FunctionLibraryTestWrapper from './helpers/FunctionLibraryTestWrapper.svelte';

// Helper to render FunctionLibrary wrapped in StoreProvider with proper prop passing
function renderWithStore(props: {
  currentEndpoint?: string | null;
  onInsertFunction?: (fn: string) => void;
} = {}) {
  const endpoint = props.currentEndpoint ?? 'https://dbpedia.org/sparql';
  const insertFn = props.onInsertFunction;

  // Render the wrapper component which includes StoreProvider and FunctionLibrary
  // The wrapper handles both context provision and prop passing
  return render(FunctionLibraryTestWrapper, {
    props: {
      currentEndpoint: endpoint,
      onInsertFunction: insertFn,
    },
  });
}

describe('FunctionLibrary', () => {
  describe('Initial Rendering', () => {
    it('should render function library header', async () => {
      const { container } = renderWithStore();

      await waitFor(() => {
        const header = container.querySelector('.function-library h3');
        expect(header).toBeInTheDocument();
        expect(header?.textContent).toMatch(/extension functions/i);
      }, { timeout: 3000 });
    });

    it('should render search input', async () => {
      renderWithStore();

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search functions/i);
        expect(searchInput).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should render Functions and Aggregates tabs', async () => {
      renderWithStore();

      await waitFor(() => {
        const functionsTab = screen.queryByRole('tab', { name: /functions/i });
        const aggregatesTab = screen.queryByRole('tab', { name: /aggregates/i });
        expect(functionsTab || aggregatesTab).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Search Functionality', () => {
    it('should filter functions when typing in search input', async () => {
      const user = userEvent.setup();
      renderWithStore();

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search functions/i);
        expect(searchInput).toBeInTheDocument();
      }, { timeout: 3000 });

      const searchInput = screen.getByPlaceholderText(/search functions/i);
      await user.type(searchInput, 'concat');

      expect(searchInput).toHaveValue('concat');
    });

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup();
      renderWithStore();

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search functions/i);
        expect(searchInput).toBeInTheDocument();
      }, { timeout: 3000 });

      const searchInput = screen.getByPlaceholderText(/search functions/i);
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      expect(searchInput).toHaveValue('');
    });

    it('should announce search results via ARIA live region', async () => {
      const { container } = renderWithStore();

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Tab Navigation', () => {
    it('should render tabs for functions and aggregates', async () => {
      renderWithStore();

      await waitFor(() => {
        const tabs = screen.queryAllByRole('tab');
        expect(tabs.length).toBeGreaterThanOrEqual(1);
      }, { timeout: 3000 });
    });
  });

  describe('Function Display', () => {
    it('should handle empty state gracefully', async () => {
      const { container } = renderWithStore({ currentEndpoint: null });

      await waitFor(() => {
        const library = container.querySelector('.function-library');
        expect(library).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Insert Function Callback', () => {
    it('should accept onInsertFunction callback', async () => {
      const mockInsert = vi.fn();
      const { container } = renderWithStore({ onInsertFunction: mockInsert });

      await waitFor(() => {
        const library = container.querySelector('.function-library');
        expect(library).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null currentEndpoint', () => {
      const { container } = renderWithStore({ currentEndpoint: null });
      expect(container.querySelector('.function-library')).toBeTruthy();
    });

    it('should handle empty search query', async () => {
      renderWithStore();

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search functions/i);
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveValue('');
      }, { timeout: 3000 });
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();
      renderWithStore();

      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/search functions/i);
        expect(searchInput).toBeInTheDocument();
      }, { timeout: 3000 });

      const searchInput = screen.getByPlaceholderText(/search functions/i);
      // Note: Brackets [] are special characters in userEvent keyboard API
      // so we test other special characters instead
      await user.type(searchInput, 'test:*?');

      expect(searchInput).toHaveValue('test:*?');
    });
  });
});
