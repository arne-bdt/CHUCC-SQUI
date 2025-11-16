/**
 * E2E tests for SparqlQueryUI component using Storybook stories
 * Tests the complete query execution workflow including results display
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';

test.describe('SparqlQueryUI - Query Execution and Results Display', () => {
  test('BUG REPRODUCTION: results table should display after clicking run button', async ({ page }) => {
    // Navigate to Default story (clean slate)
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--default&viewMode=story`);

    // Wait for Storybook to initialize
    await page.waitForTimeout(1500);

    // Verify the editor is visible
    await expect(page.locator('.cm-editor')).toBeVisible({ timeout: 5000 });

    // Enter a simple SELECT query in the editor
    const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 5';
    const editor = page.locator('.cm-content');
    await editor.click();

    // Clear existing content first
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');

    // Type the query
    await page.keyboard.type(query);

    // Verify query was entered
    await expect(page.locator('.cm-content')).toContainText('SELECT');

    // Enter an endpoint URL
    const endpointInput = page.getByPlaceholder('Select or enter SPARQL endpoint');
    await endpointInput.fill('https://dbpedia.org/sparql');

    // Click the Run button (use exact aria-label to avoid matching "Cancel running query")
    const runButton = page.getByRole('button', { name: 'Execute SPARQL query (Ctrl+Enter)' });
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeEnabled();
    await runButton.click();

    // Wait for query execution (this may take a few seconds for real endpoint)
    // The results table should appear after execution completes
    // This is the CRITICAL TEST - results should display immediately after run

    // Option 1: Wait for loading to finish (cancel button should disappear/disable)
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeDisabled({ timeout: 15000 }); // Wait up to 15s for query to complete

    // BUG CHECK: Results table should now be visible
    // If this fails, it confirms the bug exists
    const resultsTable = page.getByRole('region', { name: 'Query results region' });
    await expect(resultsTable).toBeVisible({ timeout: 5000 });

    // Verify table grid is present
    const tableGrid = page.locator('.wx-grid').first();
    await expect(tableGrid).toBeVisible({ timeout: 3000 });
  });

  test('results should remain visible when switching result format', async ({ page }) => {
    // Navigate to Default story
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--default&viewMode=story`);
    await page.waitForTimeout(1500);

    // Enter query and endpoint
    const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 3';
    await page.locator('.cm-content').click();

    // Clear existing content and type query
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type(query);

    const endpointInput = page.getByPlaceholder('Select or enter SPARQL endpoint');
    await endpointInput.fill('https://dbpedia.org/sparql');

    // Execute query
    const runButton = page.getByRole('button', { name: 'Execute SPARQL query (Ctrl+Enter)' });
    await runButton.click();

    // Wait for completion
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeDisabled({ timeout: 15000 });

    // Verify results are visible
    const resultsTable = page.locator('.data-table-container, .data-table, .wx-grid').first();
    await expect(resultsTable).toBeVisible({ timeout: 5000 });

    // Find and change the format selector
    const formatSelector = page.getByRole('combobox', { name: /result format/i });
    if (await formatSelector.isVisible()) {
      // Click to open dropdown
      await formatSelector.click();

      // Select XML format (or another format)
      const xmlOption = page.getByText(/XML/i);
      if (await xmlOption.isVisible()) {
        await xmlOption.click();

        // Wait for re-execution with new format
        await page.waitForTimeout(2000);

        // Results should still be visible (or reappear after re-execution)
        await expect(resultsTable).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should display results in DBpedia endpoint story', async ({ page }) => {
    // Test with a pre-configured story that has an endpoint
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--d-bpedia-endpoint&viewMode=story`);
    await page.waitForTimeout(1500);

    // Verify endpoint is pre-configured
    const endpointCombobox = page.getByRole('combobox').first();
    await expect(endpointCombobox).toHaveValue(/dbpedia/i);

    // Enter a simple query
    const query = 'SELECT * WHERE { ?s a <http://dbpedia.org/ontology/Person> } LIMIT 3';
    const editor = page.locator('.cm-content');
    await editor.click();

    // Clear existing content and type query
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type(query);

    // Run query
    const runButton = page.getByRole('button', { name: 'Execute SPARQL query (Ctrl+Enter)' });
    await runButton.click();

    // Wait for completion
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeDisabled({ timeout: 20000 });

    // Verify results are displayed
    const resultsContainer = page.locator('.results-container, .data-table-container').first();
    await expect(resultsContainer).toBeVisible({ timeout: 5000 });
  });

  test('should show placeholder when no query executed', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--default&viewMode=story`);
    await page.waitForTimeout(1500);

    // Should show the placeholder message
    await expect(page.getByText(/results will be displayed here/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show error when query fails', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--default&viewMode=story`);
    await page.waitForTimeout(1500);

    // Enter an invalid query
    const invalidQuery = 'INVALID QUERY SYNTAX';
    await page.locator('.cm-content').click();
    await page.keyboard.type(invalidQuery);

    // Enter endpoint
    const endpointInput = page.getByPlaceholder('Select or enter SPARQL endpoint');
    await endpointInput.fill('https://dbpedia.org/sparql');

    // Run query
    const runButton = page.getByRole('button', { name: 'Execute SPARQL query (Ctrl+Enter)' });
    await runButton.click();

    // Should show error notification
    // Error might be CORS or syntax error depending on endpoint
    await expect(page.locator('.bx--inline-notification, .error-notification')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('SparqlQueryUI - Keyboard Shortcuts', () => {
  test('should execute query with Ctrl+Enter keyboard shortcut', async ({ page }) => {
    // Navigate to Default story
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--default&viewMode=story`);
    await page.waitForTimeout(1500);

    // Enter a simple SELECT query in the editor
    const query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 3';
    const editor = page.locator('.cm-content');
    await editor.click();

    // Clear existing content and type query
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type(query);

    // Enter an endpoint URL
    const endpointInput = page.getByPlaceholder('Select or enter SPARQL endpoint');
    await endpointInput.fill('https://dbpedia.org/sparql');

    // Close the endpoint dropdown (Escape key) to avoid blocking clicks
    await page.keyboard.press('Escape');

    // Focus back on the editor
    await editor.click();

    // Press Ctrl+Enter to execute query
    await page.keyboard.press('Control+Enter');

    // Wait for query execution to complete
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeDisabled({ timeout: 15000 });

    // Verify results are displayed
    const resultsTable = page.getByRole('region', { name: 'Query results region' });
    await expect(resultsTable).toBeVisible({ timeout: 5000 });

    // Verify table grid is present
    const tableGrid = page.locator('.wx-grid').first();
    await expect(tableGrid).toBeVisible({ timeout: 3000 });
  });

  test('should use Mod-Enter (works with both Ctrl and Cmd)', async ({ page }) => {
    // This test verifies that the keyboard shortcut is platform-agnostic
    // CodeMirror's "Mod-Enter" automatically maps to:
    // - Ctrl+Enter on Windows/Linux
    // - Cmd+Enter on Mac

    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--default&viewMode=story`);
    await page.waitForTimeout(1500);

    // Verify editor is rendered with keyboard shortcut capability
    const editor = page.locator('.cm-editor');
    await expect(editor).toBeVisible({ timeout: 5000 });

    // The actual key combination is tested in the previous test
    // This test documents the cross-platform nature of the shortcut
  });
});

test.describe('SparqlQueryUI - Format Selector Integration', () => {
  test('format selector should be visible and functional', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=squi-sparqlqueryui--default&viewMode=story`);
    await page.waitForTimeout(1500);

    // Format selector should be visible in toolbar
    const formatSelector = page.getByRole('combobox', { name: /select result format/i });
    await expect(formatSelector).toBeVisible({ timeout: 5000 });

    // Should show default format (JSON for SELECT queries)
    await expect(formatSelector).toHaveValue('json');
  });
});
