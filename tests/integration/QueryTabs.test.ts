import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import QueryTabs from '../../src/lib/components/Tabs/QueryTabs.svelte';
import { tabStore } from '../../src/lib/stores/tabStore';
import { get } from 'svelte/store';

describe('QueryTabs Integration', () => {
  beforeEach(() => {
    // Clear localStorage and reset tab store
    localStorage.clear();
    tabStore.reset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('should render initial tab', async () => {
      const { container } = render(QueryTabs);

      await waitFor(() => {
        // Check that the tab is visible
        const tabButtons = container.querySelectorAll('.bx--tabs__nav-link');
        expect(tabButtons.length).toBeGreaterThan(0);
      });
    });

    it('should render add tab button', async () => {
      render(QueryTabs);

      await waitFor(() => {
        const addButton = screen.getByLabelText(/add new tab/i);
        expect(addButton).toBeInTheDocument();
      });
    });

    it('should render tab with correct name', async () => {
      const { container } = render(QueryTabs);

      await waitFor(() => {
        const tabName = container.querySelector('.tab-name');
        expect(tabName?.textContent).toBe('Query 1');
      });
    });

    it('should not show close button on single tab', async () => {
      const { container } = render(QueryTabs);

      await waitFor(() => {
        const closeButtons = container.querySelectorAll('.close-button');
        expect(closeButtons).toHaveLength(0);
      });
    });
  });

  describe('adding tabs', () => {
    it('should add new tab when clicking add button', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      await waitFor(() => {
        const state = get(tabStore);
        expect(state.tabs).toHaveLength(2);
      });
    });

    it('should show new tab name', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      await waitFor(() => {
        const tabNames = container.querySelectorAll('.tab-name');
        const names = Array.from(tabNames).map((el) => el.textContent);
        expect(names).toContain('Query 2');
      });
    });

    it('should show close buttons when multiple tabs exist', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      await waitFor(() => {
        const closeButtons = container.querySelectorAll('.close-button');
        expect(closeButtons.length).toBe(2);
      });
    });

    it('should auto-switch to new tab', async () => {
      const user = userEvent.setup();
      render(QueryTabs);

      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      await waitFor(() => {
        const state = get(tabStore);
        const newTab = state.tabs[1];
        expect(state.activeTabId).toBe(newTab.id);
      });
    });
  });

  describe('closing tabs', () => {
    it('should close tab when clicking close button', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      // Add a second tab
      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      // Wait for close buttons to appear
      const closeButtons = await waitFor(() => {
        const buttons = container.querySelectorAll('.close-button');
        expect(buttons.length).toBe(2);
        return buttons;
      });

      // Click first close button
      await user.click(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        const state = get(tabStore);
        expect(state.tabs).toHaveLength(1);
      });
    });

    it('should not close last tab', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      // Add second tab
      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      // Close both tabs (should only close one)
      const closeButtons = await waitFor(() => {
        const buttons = container.querySelectorAll('.close-button');
        return buttons;
      });

      await user.click(closeButtons[0] as HTMLElement);
      await waitFor(() => {
        expect(get(tabStore).tabs).toHaveLength(1);
      });

      // Try to close last tab - close button should be gone
      await waitFor(() => {
        const remainingCloseButtons = container.querySelectorAll('.close-button');
        expect(remainingCloseButtons).toHaveLength(0);
      });
    });

    it('should switch to adjacent tab when closing active tab', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      // Add two more tabs
      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);
      await user.click(addButton);

      const state1 = get(tabStore);
      const tab2Id = state1.tabs[1].id;

      // Switch to tab 2
      tabStore.switchTab(tab2Id);

      // Close tab 2
      await waitFor(() => {
        const closeButtons = container.querySelectorAll('.close-button');
        expect(closeButtons.length).toBe(3);
      });

      const closeButtons = container.querySelectorAll('.close-button');
      await user.click(closeButtons[1] as HTMLElement);

      await waitFor(() => {
        const state2 = get(tabStore);
        expect(state2.activeTabId).not.toBe(tab2Id);
        expect(state2.tabs).toHaveLength(2);
      });
    });
  });

  describe('tab switching', () => {
    it('should switch tabs programmatically', async () => {
      const user = userEvent.setup();
      render(QueryTabs);

      // Get first tab ID before adding second tab
      const state0 = get(tabStore);
      const firstTabId = state0.tabs[0].id;

      // Add second tab (this will auto-switch to the new tab)
      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      // Wait for second tab to be added and become active
      await waitFor(() => {
        const state1 = get(tabStore);
        expect(state1.tabs).toHaveLength(2);
        // Active tab should now be the second tab (new tabs auto-activate)
        expect(state1.activeTabId).not.toBe(firstTabId);
      });

      // Switch back to first tab programmatically
      tabStore.switchTab(firstTabId);

      // Verify that first tab is now active
      await waitFor(() => {
        const state2 = get(tabStore);
        expect(state2.activeTabId).toBe(firstTabId);
      });
    });

    it('should update UI when active tab changes', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      // Add second tab
      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      // Click first tab
      const tabButtons = await waitFor(() => {
        const buttons = container.querySelectorAll('.bx--tabs__nav-link');
        return buttons;
      });

      await user.click(tabButtons[0] as HTMLElement);

      await waitFor(() => {
        // Check that first tab is selected
        const selectedTab = container.querySelector('.bx--tabs__nav-item--selected');
        expect(selectedTab).toBeInTheDocument();
      });
    });
  });

  describe('localStorage persistence', () => {
    it('should save tabs to localStorage when adding tab', async () => {
      const user = userEvent.setup();
      render(QueryTabs);

      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      await waitFor(() => {
        const stored = localStorage.getItem('squi-tabs');
        expect(stored).toBeTruthy();

        const data = JSON.parse(stored!);
        expect(data.tabs).toHaveLength(2);
      });
    });

    it('should save tabs to localStorage when closing tab', async () => {
      const user = userEvent.setup();
      const { container } = render(QueryTabs);

      // Add two tabs
      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);
      await user.click(addButton);

      // Close one tab
      const closeButtons = await waitFor(() => {
        const buttons = container.querySelectorAll('.close-button');
        return buttons;
      });

      await user.click(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        const stored = localStorage.getItem('squi-tabs');
        const data = JSON.parse(stored!);
        expect(data.tabs).toHaveLength(2);
      });
    });
  });

  describe('endpoint copying', () => {
    it('should copy endpoint to new tab', async () => {
      const user = userEvent.setup();
      render(QueryTabs);

      // Set endpoint on first tab
      const state1 = get(tabStore);
      const firstTabId = state1.tabs[0].id;
      tabStore.updateTabQuery(firstTabId, { endpoint: 'https://dbpedia.org/sparql' });

      // Add new tab
      const addButton = await waitFor(() => screen.getByLabelText(/add new tab/i));
      await user.click(addButton);

      await waitFor(() => {
        const state2 = get(tabStore);
        const newTab = state2.tabs[1];
        expect(newTab.query.endpoint).toBe('https://dbpedia.org/sparql');
      });
    });
  });
});
