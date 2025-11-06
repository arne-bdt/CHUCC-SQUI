import { test, expect } from '@playwright/test';

/**
 * E2E Test: Standalone HTML Demo
 *
 * Tests the SQUI component initialization in a standalone HTML page
 * that loads the built library files (dist/sparql-query-ui.js).
 *
 * This test verifies:
 * 1. Component mounts successfully with proper props
 * 2. All required elements render correctly
 * 3. No console errors during initialization
 * 4. Component is interactive and functional
 *
 * Prerequisites:
 * - Run `npm run demo` in a separate terminal to start the HTTP server
 * - Server runs on http://localhost:3030
 */

const DEMO_URL = process.env.DEMO_URL || 'http://localhost:3030';

test.describe('Standalone HTML Demo', () => {
  test('should initialize SQUI successfully', async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the demo page
    await page.goto(DEMO_URL);

    // Wait for component to initialize
    await page.waitForTimeout(2000);

    // Check for console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors);
    }
    expect(consoleErrors).toHaveLength(0);

    // Verify main container exists
    await expect(page.locator('.squi-container')).toBeVisible();

    // Verify toolbar is present
    await expect(page.locator('.bx--toolbar')).toBeVisible();

    // Verify Run button exists
    await expect(page.getByRole('button', { name: /run/i })).toBeVisible();

    // Verify endpoint selector exists
    await expect(page.locator('.bx--combo-box')).toBeVisible();

    // Verify SPARQL editor exists
    await expect(page.locator('.cm-editor')).toBeVisible();

    // Verify results placeholder exists
    await expect(page.locator('.results-placeholder')).toBeVisible();
  });

  test('should display query tabs when enabled', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForTimeout(2000);

    // Verify tabs are present (features.enableTabs = true in demo.html)
    const tabs = page.locator('.bx--tabs');
    await expect(tabs).toBeVisible();

    // Verify at least one tab exists
    const tabButtons = page.locator('.bx--tabs__nav-link');
    await expect(tabButtons.first()).toBeVisible();
  });

  test('should allow typing in the SPARQL editor', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForTimeout(2000);

    // Click on the editor to focus it
    const editor = page.locator('.cm-content');
    await editor.click();

    // Type a simple SPARQL query
    await page.keyboard.type('SELECT * WHERE { ?s ?p ?o } LIMIT 10');

    // Verify the text appears in the editor
    await expect(editor).toContainText('SELECT * WHERE');
  });

  test('should initialize with correct endpoint prop', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForTimeout(2000);

    // Check that the endpoint selector shows the DBpedia endpoint
    // (endpoint.url = 'https://dbpedia.org/sparql' in demo.html)
    const combobox = page.locator('.bx--combo-box input');
    await expect(combobox).toHaveValue('https://dbpedia.org/sparql');
  });

  test('should apply correct theme from props', async ({ page }) => {
    await page.goto(DEMO_URL);
    await page.waitForTimeout(2000);

    // Verify the theme is applied (theme.theme = 'white' in demo.html)
    const container = page.locator('.squi-container');
    await expect(container).toHaveClass(/theme-white/);
  });

  test('should handle missing endpoint gracefully', async ({ page }) => {
    // Create a test HTML page with missing endpoint.url
    const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SQUI - Test (Missing Endpoint)</title>
  <link rel="stylesheet" href="./dist/sparql-query-ui.css" />
  <style>
    #squi-container { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="squi-container"></div>
  <script type="module">
    import SparqlQueryUI from './dist/sparql-query-ui.js';
    try {
      const squi = new SparqlQueryUI({
        target: document.getElementById('squi-container'),
        props: {
          endpoint: {}, // Missing 'url' property - this should trigger the error!
          theme: { theme: 'white' }
        }
      });
      console.log('SQUI initialized');
    } catch (error) {
      console.error('Failed to initialize SQUI:', error);
    }
  </script>
</body>
</html>
    `;

    // Write test HTML to temp file
    const testPath = path.resolve(process.cwd(), 'test-missing-endpoint.html');
    await page.goto(`data:text/html,${encodeURIComponent(testHTML)}`);
    await page.waitForTimeout(2000);

    // The component should still mount, just with empty endpoint
    await expect(page.locator('.squi-container')).toBeVisible();
    await expect(page.locator('.bx--combo-box input')).toHaveValue('');
  });
});
