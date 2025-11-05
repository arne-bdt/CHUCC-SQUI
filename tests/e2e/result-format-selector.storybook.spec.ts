/**
 * E2E tests for ResultFormatSelector component using Storybook stories
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';

test.describe('ResultFormatSelector', () => {
  test('should render Default story with format selector', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--default&viewMode=story`);

    // Wait for Storybook play function to complete
    await page.waitForTimeout(1500);

    // Check that the format selector is rendered
    await expect(page.getByText('Result Format')).toBeVisible({ timeout: 5000 });

    // Check that JSON format is shown (default for SELECT)
    await expect(page.getByText('SPARQL JSON Results - Best for web applications')).toBeVisible();
  });

  test('should show binding formats for SELECT query', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--select-query&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Should show JSON format description
    await expect(page.getByText(/JSON Results/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show RDF formats for CONSTRUCT query', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--construct-query&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Should show Turtle format (best for CONSTRUCT)
    await expect(page.getByText('Turtle - Human-readable RDF')).toBeVisible({ timeout: 5000 });
  });

  test('should show RDF formats for DESCRIBE query', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--describe-query&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Should show Turtle format
    await expect(page.getByText('Turtle - Human-readable RDF')).toBeVisible({ timeout: 5000 });
  });

  test('should show helper text when service description unavailable', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--no-service-description&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Should show helper text
    await expect(page.getByText(/service description not available/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle queries with PREFIX declarations', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--query-with-prefixes&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Should correctly detect SELECT and show JSON format
    await expect(page.getByText(/JSON Results/i)).toBeVisible({ timeout: 5000 });
  });

  test('should be disabled when disabled prop is true', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--disabled&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Check that the select is disabled
    const select = page.getByRole('combobox');
    await expect(select).toBeDisabled({ timeout: 5000 });
  });

  test('should show pre-selected CSV format', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--pre-selected-csv&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Should show CSV format info
    await expect(page.getByText('Comma-Separated Values')).toBeVisible({ timeout: 5000 });
  });

  test('should show pre-selected Turtle format for CONSTRUCT', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=query-resultformatselector--pre-selected-turtle&viewMode=story`);

    // Wait for Storybook play function
    await page.waitForTimeout(1500);

    // Should show Turtle format info
    await expect(page.getByText('Turtle - Human-readable RDF')).toBeVisible({ timeout: 5000 });
  });
});
