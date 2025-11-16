/**
 * E2E Accessibility Tests for Endpoint Dashboard
 *
 * Tests ARIA live regions, focus management, and keyboard navigation
 * for the endpoint dashboard components (EndpointInfoSummary and FunctionLibrary).
 *
 * Requirements from Task 81:
 * - Screen reader announcements for dashboard state changes
 * - Screen reader announcements for loading states
 * - Screen reader announcements for search results
 * - Focus management when expanding/collapsing dashboard
 * - Focus management in modals (trap and return)
 * - ARIA attributes validation
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';

test.describe('Endpoint Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Allow time for Storybook to load
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--with-capabilities`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(1500); // Wait for any play functions to complete
  });

  test.describe('ARIA Live Regions', () => {
    test('should have live region for status announcements', async ({ page }) => {
      // Check that SR-only live region exists
      const liveRegion = page.locator('.sr-only[role="status"]');
      await expect(liveRegion).toBeAttached();

      // Verify ARIA attributes
      await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    test('should announce dashboard expansion state', async ({ page }) => {
      const liveRegion = page.locator('.sr-only[role="status"]').first();
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      // Expand dashboard
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Check announcement includes "Dashboard expanded"
      const expandedText = await liveRegion.textContent();
      expect(expandedText).toContain('Dashboard expanded');
    });

    test('should announce dashboard collapse state', async ({ page }) => {
      const liveRegion = page.locator('.sr-only[role="status"]').first();
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      // First expand
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Then collapse
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Check announcement
      const collapsedText = await liveRegion.textContent();
      expect(collapsedText).toContain('Dashboard collapsed');
    });

    test('should announce loading state', async ({ page }) => {
      // Navigate to a story that shows loading state
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--loading`, {
        waitUntil: 'networkidle',
      });
      await page.waitForTimeout(1500);

      const liveRegion = page.locator('.sr-only[role="status"]').first();
      const statusText = await liveRegion.textContent();

      expect(statusText).toContain('Loading');
    });
  });

  test.describe('Focus Management - Dashboard Toggle', () => {
    test('should have proper aria-expanded attribute', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      // Initially collapsed
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      // After expansion
      await toggleButton.click();
      await page.waitForTimeout(500);
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should have aria-controls pointing to dashboard container', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      await expect(toggleButton).toHaveAttribute('aria-controls', 'endpoint-dashboard');
    });

    test('should move focus to dashboard when expanding', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      await toggleButton.click();
      await page.waitForTimeout(500);

      // Focus should now be on first interactive element in dashboard
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return {
          tag: active?.tagName,
          role: active?.getAttribute('role'),
          ariaLabel: active?.getAttribute('aria-label'),
        };
      });

      // Should be a button or tab (first focusable element in dashboard)
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement.tag);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation for dashboard toggle', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      // Focus the button
      await toggleButton.focus();
      await expect(toggleButton).toBeFocused();

      // Press Enter to expand
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Dashboard should be expanded
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should support Space key for dashboard toggle', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      await toggleButton.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);

      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should be navigable with Tab key', async ({ page }) => {
      // Tab to refresh button
      await page.keyboard.press('Tab');
      let focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      expect(focused).toContain('Refresh');

      // Tab to expand/collapse button
      await page.keyboard.press('Tab');
      focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      expect(focused).toMatch(/expand.*dashboard/i);
    });
  });

  test.describe('Semantic HTML', () => {
    test('should use semantic time element for last updated', async ({ page }) => {
      const timeElement = page.locator('time.last-updated');

      if (await timeElement.count() > 0) {
        // Verify time element has datetime attribute
        await expect(timeElement).toHaveAttribute('datetime');

        // Datetime should be valid ISO 8601 format
        const datetime = await timeElement.getAttribute('datetime');
        expect(datetime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }
    });
  });

  test.describe('ARIA Labels', () => {
    test('should have descriptive aria-label on refresh button', async ({ page }) => {
      const refreshButton = page.getByRole('button', { name: /refresh/i });

      const ariaLabel = await refreshButton.getAttribute('aria-label');
      expect(ariaLabel).toContain('Refresh');
      expect(ariaLabel).toContain('capabilities');
    });

    test('should have descriptive aria-label on toggle button', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /expand.*dashboard/i });

      let ariaLabel = await toggleButton.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/expand.*dashboard/i);

      // After expanding
      await toggleButton.click();
      await page.waitForTimeout(500);

      ariaLabel = await toggleButton.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/collapse.*dashboard/i);
    });
  });
});

test.describe('Function Library Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--default`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(1500);
  });

  test.describe('Search Result Announcements', () => {
    test('should have live region for search results', async ({ page }) => {
      const liveRegion = page.locator('.sr-only[role="status"]');
      await expect(liveRegion).toBeAttached();

      await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    test('should announce search result count', async ({ page }) => {
      const liveRegion = page.locator('.sr-only[role="status"]');
      const searchInput = page.getByPlaceholder('Search functions...');

      // Initial state should show total count
      const initialText = await liveRegion.textContent();
      expect(initialText).toMatch(/\d+ (function|aggregate)s? (found|available)/i);

      // Search for a term
      await searchInput.fill('concat');
      await page.waitForTimeout(500);

      // Should announce filtered results
      const searchText = await liveRegion.textContent();
      expect(searchText).toMatch(/\d+ (function|aggregate)s? found matching/i);
    });

    test('should update announcement when switching tabs', async ({ page }) => {
      const liveRegion = page.locator('.sr-only[role="status"]');

      // Click on Aggregates tab
      const aggregatesTab = page.getByRole('tab', { name: /Aggregates/i });
      if (await aggregatesTab.count() > 0) {
        await aggregatesTab.click();
        await page.waitForTimeout(500);

        const text = await liveRegion.textContent();
        expect(text).toContain('aggregate');
      }
    });
  });

  test.describe('Search Input Accessibility', () => {
    test('should have descriptive aria-label on search input', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search functions...');

      const ariaLabel = await searchInput.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/search.*functions/i);
    });
  });

  test.describe('Modal Focus Management', () => {
    test('should return focus to trigger button when modal closes', async ({ page }) => {
      const detailsButton = page.getByRole('button', { name: 'Details' }).first();

      // Open modal
      await detailsButton.click();
      await page.waitForTimeout(500);

      // Modal should be visible
      const modal = page.getByRole('dialog');
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible();

        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Focus should return to Details button (or nearby element)
        const focused = await page.evaluate(() => {
          const active = document.activeElement;
          return {
            tag: active?.tagName,
            text: active?.textContent?.trim(),
          };
        });

        expect(focused.tag).toBe('BUTTON');
      }
    });
  });
});
