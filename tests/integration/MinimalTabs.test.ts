import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import MinimalTabs from '../../src/lib/components/Tabs/MinimalTabs.svelte';

describe('MinimalTabs', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render with one initial tab', async () => {
    render(MinimalTabs, { props: { instanceId: 'test-1' } });

    await waitFor(() => {
      expect(screen.getAllByText('Query 1').length).toBeGreaterThan(0);
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });
  });

  it('should add a new tab when clicking add button', async () => {
    const user = userEvent.setup();
    render(MinimalTabs, { props: { instanceId: 'test-2' } });

    await waitFor(() => {
      expect(screen.getAllByText('Query 1').length).toBeGreaterThan(0);
    });

    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getAllByText('Query 2').length).toBeGreaterThan(0);
    });
  });

  it('should switch active tab name when clicking tabs', async () => {
    /*
     * BUG FIXED: Using bind:selected instead of selected + on:change
     *
     * The Carbon Tabs documentation clearly states to use bind:selected
     * for two-way binding. This allows Carbon to directly update our
     * selectedIndex variable, which then triggers our $effect to update
     * the store.
     *
     * See: https://svelte.carbondesignsystem.com/components/Tabs#reactive-example
     */
    const user = userEvent.setup();
    const { container } = render(MinimalTabs, { props: { instanceId: 'test-3' } });

    // Wait for initial tab
    await waitFor(() => {
      expect(screen.getAllByText('Query 1').length).toBeGreaterThan(0);
    });

    // Verify initial active tab is Query 1
    expect(screen.getByText('Active Tab: Query 1')).toBeInTheDocument();

    // Add second tab
    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getAllByText('Query 2').length).toBeGreaterThan(0);
    });

    // Tab 2 should now be active
    expect(screen.getByText('Active Tab: Query 2')).toBeInTheDocument();

    // Verify both tabs exist
    const tabLinks = container.querySelectorAll('[role="tab"]');
    expect(tabLinks.length).toBe(2);

    // Click back to tab 1 using the tab link (role="tab")
    await user.click(tabLinks[0] as HTMLElement);

    // CRITICAL TEST: Active tab should switch back to "Query 1"
    await waitFor(() => {
      expect(screen.getByText('Active Tab: Query 1')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should close tabs when clicking close button', async () => {
    const user = userEvent.setup();
    render(MinimalTabs, { props: { instanceId: 'test-4' } });

    await waitFor(() => {
      expect(screen.getAllByText('Query 1').length).toBeGreaterThan(0);
    });

    // Add second tab
    const addButton = screen.getByLabelText('Add new tab');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getAllByText('Query 2').length).toBeGreaterThan(0);
    });

    // Close tab 2
    const closeButtons = screen.getAllByLabelText('Close tab');
    await user.click(closeButtons[1]);

    await waitFor(() => {
      expect(screen.queryByText('Query 2')).not.toBeInTheDocument();
      expect(screen.getAllByText('Query 1').length).toBeGreaterThan(0);
    });
  });

  it('should not show close button when only one tab exists', async () => {
    render(MinimalTabs, { props: { instanceId: 'test-5' } });

    await waitFor(() => {
      expect(screen.getAllByText('Query 1').length).toBeGreaterThan(0);
    });

    // Should not have close button
    expect(screen.queryByLabelText('Close tab')).not.toBeInTheDocument();
  });

  it.skip('should isolate tabs across multiple instances', async () => {
    // TODO: This test needs to be refactored to avoid interference with other tests
    // For now, we're skipping it to focus on basic functionality
  });
});
