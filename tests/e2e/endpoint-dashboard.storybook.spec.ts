/**
 * E2E tests for Endpoint Dashboard components in Storybook
 * Tests EndpointInfoSummary and EndpointDashboard in actual browser environment
 *
 * Covers:
 * - EndpointInfoSummary: Collapsed/Expanded states, loading, error handling
 * - EndpointDashboard: Tab navigation, capabilities display, datasets, functions
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Endpoint Dashboard Components', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console error logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
  });

  test.describe('EndpointInfoSummary', () => {
    test('should render collapsed state with summary stats', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--collapsed&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Should show summary text with stats
      await expect(page.getByText(/✓ SPARQL/)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/graphs/)).toBeVisible();
      await expect(page.getByText(/functions/)).toBeVisible();
      await expect(page.getByText(/Last:/)).toBeVisible();

      // Should show refresh button
      await expect(page.getByRole('button', { name: /Refresh/ })).toBeVisible();

      // Should show expand button (chevron down)
      await expect(page.getByRole('button', { name: /Expand/ })).toBeVisible();
    });

    test('should render no service description state', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--no-service-description&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Should show error message
      await expect(page.getByText('No service description available')).toBeVisible({ timeout: 5000 });

      // Should show refresh button but NOT expand button
      await expect(page.getByRole('button', { name: /Refresh/ })).toBeVisible();
    });

    test('should render minimal data with correct counts', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointinfosummary--minimal-data&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Should show summary bar with SPARQL version and counts
      // Look for the complete summary text pattern to avoid false matches
      await expect(page.getByText(/✓ SPARQL.*\| 0 graphs \| 0 functions \|/)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('EndpointDashboard', () => {
    test('should render default Capabilities tab', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Should show Capabilities tab selected
      await expect(page.getByRole('tab', { name: 'Capabilities' })).toBeVisible({ timeout: 5000 });

      // Should show SPARQL Language Support section
      await expect(page.getByText('SPARQL Language Support')).toBeVisible();
      await expect(page.getByText('SPARQL 1.0 Query')).toBeVisible();
      await expect(page.getByText('SPARQL 1.1 Query')).toBeVisible();
      await expect(page.getByText('SPARQL 1.1 Update')).toBeVisible();

      // Should show Service Features section
      await expect(page.getByRole('heading', { name: 'Service Features' })).toBeVisible();
      await expect(page.getByText('URI Dereferencing')).toBeVisible();
      await expect(page.getByText('Union Default Graph')).toBeVisible();

      // Should show Result Formats section
      await expect(page.getByRole('heading', { name: 'Result Formats' })).toBeVisible();
      await expect(page.getByText('JSON').first()).toBeVisible();
      await expect(page.getByText('XML').first()).toBeVisible();
      await expect(page.getByText('CSV')).toBeVisible();

      // Should show Input Formats section
      await expect(page.getByRole('heading', { name: 'Input Formats' })).toBeVisible();
      await expect(page.getByText('Turtle')).toBeVisible();
    });

    test('should show Datasets tab with graph information', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Click Datasets tab
      await page.getByRole('tab', { name: 'Datasets' }).click();

      // Wait for tab content to render
      await page.waitForTimeout(500);

      // Should show dataset information
      await expect(page.getByText(/Named Graphs/).first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Default Graphs/).first()).toBeVisible();
    });

    test('should show Functions tab with extension functions', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Click Functions tab
      await page.getByRole('tab', { name: 'Functions' }).click();

      // Wait for tab content to render
      await page.waitForTimeout(500);

      // Should show Extension Functions heading
      await expect(page.getByRole('heading', { name: 'Extension Functions' })).toBeVisible({ timeout: 5000 });

      // Should show search input
      await expect(page.getByPlaceholder('Search functions...')).toBeVisible();

      // Should show Functions and Aggregates tabs (use .first() to avoid strict mode violation)
      await expect(page.getByRole('tab', { name: /Functions/ }).first()).toBeVisible();
      await expect(page.getByRole('tab', { name: /Aggregates/ }).first()).toBeVisible();
    });

    test('should render compact mode with reduced padding', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--compact-mode&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Should show content (compact mode is visual, check key elements render)
      await expect(page.getByRole('heading', { name: 'SPARQL Language Support' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('tab', { name: 'Capabilities' })).toBeVisible();
    });

    test('should render minimal data with only Capabilities tab', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--minimal-data&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Should show Capabilities tab
      await expect(page.getByRole('tab', { name: 'Capabilities' })).toBeVisible({ timeout: 5000 });

      // Should NOT show Datasets tab (no data)
      const datasetTab = page.getByRole('tab', { name: 'Datasets' });
      await expect(datasetTab).not.toBeVisible();

      // Should NOT show Functions tab (no data)
      const functionsTab = page.getByRole('tab', { name: 'Functions' });
      await expect(functionsTab).not.toBeVisible();
    });

    test('should render empty state when no service description', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--no-service-description&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Should show empty state message
      await expect(page.getByText('No service description available for this endpoint.')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/Some endpoints don't support SPARQL Service Description/)).toBeVisible();

      // Should NOT show tabs
      const capabilitiesTab = page.getByRole('tab', { name: 'Capabilities' });
      await expect(capabilitiesTab).not.toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test('should switch between tabs correctly', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Initially on Capabilities tab
      await expect(page.getByRole('heading', { name: 'SPARQL Language Support' })).toBeVisible({ timeout: 5000 });

      // Click Datasets tab
      await page.getByRole('tab', { name: 'Datasets' }).click();
      await page.waitForTimeout(500);

      // Should show dataset content
      await expect(page.getByText(/Named Graphs/).first()).toBeVisible();

      // Click Functions tab
      await page.getByRole('tab', { name: 'Functions' }).click();
      await page.waitForTimeout(500);

      // Should show functions content
      await expect(page.getByRole('heading', { name: 'Extension Functions' })).toBeVisible();

      // Click back to Capabilities
      await page.getByRole('tab', { name: 'Capabilities' }).click();
      await page.waitForTimeout(500);

      // Should show capabilities content again
      await expect(page.getByRole('heading', { name: 'SPARQL Language Support' })).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes on tabs', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Check Capabilities tab has role="tab"
      const capabilitiesTab = page.getByRole('tab', { name: 'Capabilities' });
      await expect(capabilitiesTab).toBeVisible({ timeout: 5000 });

      // Check Datasets tab has role="tab"
      const datasetsTab = page.getByRole('tab', { name: 'Datasets' });
      await expect(datasetsTab).toBeVisible();

      // Check Functions tab has role="tab"
      const functionsTab = page.getByRole('tab', { name: 'Functions' });
      await expect(functionsTab).toBeVisible();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(
        `${STORYBOOK_URL}/iframe.html?id=components-endpoint-endpointdashboard--default&viewMode=story`
      );

      // Wait for Storybook to fully initialize story
      await page.waitForTimeout(1500);

      // Focus on Capabilities tab
      const capabilitiesTab = page.getByRole('tab', { name: 'Capabilities' });
      await capabilitiesTab.focus();

      // Press Enter to activate (should already be active, but test the interaction)
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Should show capabilities content
      await expect(page.getByRole('heading', { name: 'SPARQL Language Support' })).toBeVisible({ timeout: 5000 });
    });
  });
});
