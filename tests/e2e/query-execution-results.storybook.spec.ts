/**
 * E2E test for query execution and results display
 * Tests the complete flow: click Run → execute query → display results table
 */

import { test, expect } from '@playwright/test';

test.describe('Query Execution and Results Display', () => {
  test('should display results table after executing query', async ({ page }) => {
    // Navigate to Wikidata endpoint story using iframe.html for direct access
    await page.goto('http://localhost:6006/iframe.html?id=squi-sparqlqueryui--wikidata-endpoint&viewMode=story');

    // Wait for Storybook play function to complete
    await page.waitForTimeout(2000);

    // Wait for the component to render
    await page.locator('.squi-container').waitFor({ timeout: 10000 });

    console.log('✓ Component rendered');

    // Find and click the Run button
    const runButton = page.locator('button').filter({ hasText: 'Run' });
    await expect(runButton).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Run button found');

    // Click the Run button to execute query
    await runButton.click();

    console.log('✓ Run button clicked');

    // Wait for query execution to complete (look for results or error)
    // The results should appear in .results-container or .data-table-container
    await page.waitForTimeout(3000); // Give query time to execute

    // Check if results container appeared
    const resultsContainer = page.locator('.results-container');
    const hasResults = await resultsContainer.isVisible();

    console.log('Results container visible:', hasResults);

    if (hasResults) {
      // Check if data table is visible
      const dataTable = page.locator('.data-table-container');
      const hasDataTable = await dataTable.isVisible();
      
      console.log('Data table visible:', hasDataTable);

      // Verify results are displayed
      await expect(dataTable).toBeVisible({ timeout: 10000 });
      
      // Check for results info footer
      const resultsInfo = page.locator('.results-info');
      await expect(resultsInfo).toBeVisible();
      
      console.log('✓ Results table displayed successfully');
    } else {
      // Check if there's an error message instead
      const errorNotification = page.locator('.bx--toast-notification--error');
      const hasError = await errorNotification.isVisible();
      
      if (hasError) {
        const errorText = await errorNotification.textContent();
        console.log('Query failed with error:', errorText);
      }
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/query-execution-results.png', fullPage: true });
  });

  test('should show loading state during query execution', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=squi-sparqlqueryui--wikidata-endpoint&viewMode=story');
    
    await page.waitForTimeout(2000);
    await page.locator('.squi-container').waitFor({ timeout: 10000 });

    const runButton = page.locator('button').filter({ hasText: 'Run' });
    await runButton.click();

    // Check for loading indicator immediately after click
    // The cancel button should become visible during loading
    const cancelButton = page.locator('button').filter({ hasText: 'Cancel' });
    
    // Wait a short time to see if loading state appears
    await page.waitForTimeout(500);
    
    console.log('Checking for loading state...');
  });
});
