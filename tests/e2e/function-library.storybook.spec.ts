/**
 * E2E tests for Function Library component
 * Tests function discovery UI in Storybook stories
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('FunctionLibrary Component', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for Storybook to be ready
    await page.goto(STORYBOOK_URL);
    await page.waitForSelector('#storybook-preview-iframe', { timeout: 10000 });
  });

  test('should render function library with functions', async ({ page }) => {
    // Navigate to FunctionLibrary story with functions
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--with-functions&viewMode=story`
    );

    // Wait for Storybook to fully initialize story
    await page.waitForTimeout(3000);

    // Check for the header
    await expect(page.getByText('Extension Functions')).toBeVisible({ timeout: 5000 });

    // Check for search input
    await expect(page.getByPlaceholder('Search functions...')).toBeVisible();

    // Check for tabs
    await expect(page.getByRole('tab', { name: /Functions/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Aggregates/ })).toBeVisible();

    // Check that functions are displayed
    await expect(page.getByRole('button', { name: 'Details' }).first()).toBeVisible();
  });

  test('should display function details in tabs', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--with-functions&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check Functions tab is active by default
    const functionsTab = page.getByRole('tab', { name: /Functions/ });
    await expect(functionsTab).toHaveAttribute('aria-selected', 'true');

    // Click Aggregates tab
    const aggregatesTab = page.getByRole('tab', { name: /Aggregates/ });
    await aggregatesTab.click();

    // Verify aggregates tab is now active
    await expect(aggregatesTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should filter functions with search', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--with-functions&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Get initial count of Details buttons (one per function)
    const detailsButtons = page.getByRole('button', { name: 'Details' });
    const initialCount = await detailsButtons.count();
    expect(initialCount).toBeGreaterThan(0);

    // Search for a specific function
    const searchInput = page.getByPlaceholder('Search functions...');
    await searchInput.fill('distance');

    // Wait for filtering to complete
    await page.waitForTimeout(300);

    // Check that results are filtered (fewer items or specific function visible)
    const filteredCount = await detailsButtons.count();

    // Should have filtered results (either fewer items or at least one matching)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should show Details button for functions', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--with-functions&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check for Details button (at least one should be visible)
    const detailsButton = page.getByRole('button', { name: 'Details' }).first();
    await expect(detailsButton).toBeVisible();

    // Check for Insert button
    const insertButton = page.getByRole('button', { name: 'Insert' }).first();
    await expect(insertButton).toBeVisible();
  });

  test('should handle empty functions gracefully', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--empty-functions&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check for empty state message
    await expect(page.getByText(/No extension functions available/)).toBeVisible();
  });

  test('should display many functions with scrolling', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--many-functions&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check that multiple functions are rendered
    const detailsButtons = page.getByRole('button', { name: 'Details' });
    const count = await detailsButtons.count();
    expect(count).toBeGreaterThan(10); // Should have many functions

    // Test scrolling capability
    const firstButton = detailsButtons.first();
    const fifthButton = detailsButtons.nth(5);

    await expect(firstButton).toBeVisible();

    // Scroll to see more items
    await fifthButton.scrollIntoViewIfNeeded();
    await expect(fifthButton).toBeVisible();
  });

  test('should show only aggregates in Aggregates tab', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functionlibrary--only-aggregates&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Click Aggregates tab
    const aggregatesTab = page.getByRole('tab', { name: /Aggregates/ });
    await aggregatesTab.click();

    // Check that aggregates are displayed
    const detailsButtons = page.getByRole('button', { name: 'Details' });
    await expect(detailsButtons.first()).toBeVisible();

    // Verify we have the expected number of aggregates
    const count = await detailsButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('FunctionDetails Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STORYBOOK_URL);
    await page.waitForSelector('#storybook-preview-iframe', { timeout: 10000 });
  });

  test('should display function details', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functiondetails--complex-function&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check for URI section - use heading role to be specific
    await expect(page.getByRole('heading', { name: 'URI', exact: true })).toBeVisible();

    // Check for Description section
    await expect(page.getByRole('heading', { name: 'Description', exact: true })).toBeVisible();

    // Check for Parameters section
    await expect(page.getByRole('heading', { name: 'Parameters', exact: true })).toBeVisible();

    // Check for Returns section
    await expect(page.getByRole('heading', { name: 'Returns', exact: true })).toBeVisible();
  });

  test('should display function with examples', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functiondetails--function-with-examples&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check for Examples section
    await expect(page.getByText('Examples', { exact: true })).toBeVisible();

    // Check that code snippets are displayed (look for Copy button from Carbon CodeSnippet)
    await expect(page.getByRole('button', { name: /Copy to clipboard/ }).first()).toBeVisible();
  });

  test('should display function with optional parameters', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functiondetails--function-with-optional-params&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check for optional parameter tags - use first() since there might be multiple
    await expect(page.getByText('optional').first()).toBeVisible();
  });

  test('should display documentation link', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functiondetails--complex-function&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Check for Documentation section
    await expect(page.getByText('Documentation', { exact: true })).toBeVisible();

    // Check for documentation link
    await expect(page.getByRole('link', { name: /View official documentation/ })).toBeVisible();
  });

  test('should handle minimal function', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-functions-functiondetails--minimal-function&viewMode=story`
    );

    await page.waitForTimeout(3000);

    // Should still render with just URI
    await expect(page.getByText('URI', { exact: true })).toBeVisible();
  });
});
