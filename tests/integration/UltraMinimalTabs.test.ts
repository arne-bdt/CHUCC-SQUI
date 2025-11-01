import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import UltraMinimalTabs from '../../src/lib/components/Tabs/UltraMinimalTabs.svelte';

describe('UltraMinimalTabs', () => {
  it('should render three tabs', async () => {
    render(UltraMinimalTabs);

    await waitFor(() => {
      expect(screen.getAllByText('Tab 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tab 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tab 3').length).toBeGreaterThan(0);
    });
  });

  it('should show Tab 1 as initially active', async () => {
    render(UltraMinimalTabs);

    await waitFor(() => {
      expect(screen.getByText('Active Tab: Tab 1')).toBeInTheDocument();
      expect(screen.getByTestId('active-tab-id').textContent).toBe('Tab ID: tab-1');
    });
  });

  it('should switch to Tab 2 when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(UltraMinimalTabs);

    // Verify Tab 1 is initially active
    await waitFor(() => {
      expect(screen.getByText('Active Tab: Tab 1')).toBeInTheDocument();
    });

    // Click Tab 2
    const tabLinks = container.querySelectorAll('[role="tab"]');
    expect(tabLinks.length).toBe(3);

    await user.click(tabLinks[1] as HTMLElement);

    // CRITICAL TEST: Tab 2 should become active
    await waitFor(() => {
      expect(screen.getByText('Active Tab: Tab 2')).toBeInTheDocument();
      expect(screen.getByTestId('active-tab-id').textContent).toBe('Tab ID: tab-2');
    }, { timeout: 3000 });
  });

  it('should switch to Tab 3 when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(UltraMinimalTabs);

    // Verify Tab 1 is initially active
    await waitFor(() => {
      expect(screen.getByText('Active Tab: Tab 1')).toBeInTheDocument();
    });

    // Click Tab 3
    const tabLinks = container.querySelectorAll('[role="tab"]');
    await user.click(tabLinks[2] as HTMLElement);

    // CRITICAL TEST: Tab 3 should become active
    await waitFor(() => {
      expect(screen.getByText('Active Tab: Tab 3')).toBeInTheDocument();
      expect(screen.getByTestId('active-tab-id').textContent).toBe('Tab ID: tab-3');
    }, { timeout: 3000 });
  });

  it('should switch back to Tab 1 after clicking Tab 2', async () => {
    const user = userEvent.setup();
    const { container } = render(UltraMinimalTabs);

    // Click Tab 2
    const tabLinks = container.querySelectorAll('[role="tab"]');
    await user.click(tabLinks[1] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Active Tab: Tab 2')).toBeInTheDocument();
    });

    // Click back to Tab 1
    await user.click(tabLinks[0] as HTMLElement);

    // CRITICAL TEST: Should switch back to Tab 1
    await waitFor(() => {
      expect(screen.getByText('Active Tab: Tab 1')).toBeInTheDocument();
      expect(screen.getByTestId('active-tab-id').textContent).toBe('Tab ID: tab-1');
    }, { timeout: 3000 });
  });
});
