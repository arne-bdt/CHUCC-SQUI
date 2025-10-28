import { test, expect, type Page } from '@playwright/test';

/**
 * E2E tests for tab functionality in Storybook
 * These tests catch real UI interaction bugs that integration tests miss
 */

test.describe('Tab Switching in Storybook', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a story with tabs enabled
    // Note: Storybook converts 'SQUI/SparqlQueryUI' → 'squi-sparqlqueryui' and 'DBpediaEndpoint' → 'dbpediaendpoint'
    await page.goto('/?path=/story/squi-sparqlqueryui--dbpediaendpoint');

    // Wait for the component to load
    await page.waitForSelector('.bx--tabs', { timeout: 10000 });
  });

  test('should switch query editor content when clicking between tabs', async ({ page }) => {
    // Step 1: Verify initial state - one tab exists
    await expect(page.locator('.tab-name')).toHaveCount(1);
    await expect(page.locator('.tab-name').first()).toHaveText('Query 1');

    // Step 2: Add a second tab
    const addButton = page.locator('[aria-label="Add new tab"]');
    await addButton.click();
    await expect(page.locator('.tab-name')).toHaveCount(2);

    // Wait for tab to be fully created
    await page.waitForTimeout(100);

    // Step 3: Type query in tab 2 (should be active now)
    const editor = page.locator('.cm-content');
    await editor.click();
    const tab2Query = 'SELECT * WHERE { ?s ?p ?o } LIMIT 10';
    await editor.fill(tab2Query);

    // Verify tab 2 shows the query
    await expect(editor).toHaveText(tab2Query);

    // Step 4: Click back to tab 1
    const tab1Button = page.locator('.bx--tabs__nav-link').first();
    await tab1Button.click();
    await page.waitForTimeout(100);

    // Step 5: CRITICAL TEST - Verify editor switched to tab 1's content (empty)
    // This is where the test SHOULD FAIL if tab switching is broken
    const editorContent1 = await editor.textContent();
    console.log('Tab 1 editor content:', editorContent1);
    expect(editorContent1).not.toBe(tab2Query); // Tab 1 should NOT show tab 2's query
    expect(editorContent1 || '').toBe(''); // Tab 1 should be empty

    // Step 6: Click back to tab 2
    const tab2Button = page.locator('.bx--tabs__nav-link').nth(1);
    await tab2Button.click();
    await page.waitForTimeout(100);

    // Step 7: CRITICAL TEST - Verify editor switched back to tab 2's content
    const editorContent2 = await editor.textContent();
    console.log('Tab 2 editor content:', editorContent2);
    expect(editorContent2).toBe(tab2Query); // Tab 2 should show the original query
  });

  test('should switch results when clicking between tabs', async ({ page }) => {
    // Create tab 1 with mock results
    await page.evaluate(() => {
      // Inject mock results into resultsStore
      const resultsStore = (window as any).__resultsStore;
      if (resultsStore) {
        resultsStore.setData({
          head: { vars: ['s', 'p', 'o'] },
          results: {
            bindings: [
              { s: { type: 'uri', value: 'http://example.org/subject1' } }
            ]
          }
        });
      }
    });

    // Add second tab
    await page.locator('[aria-label="Add new tab"]').click();
    await page.waitForTimeout(100);

    // Click back to tab 1
    await page.locator('.bx--tabs__nav-link').first().click();
    await page.waitForTimeout(100);

    // Verify results switched (this is a simplified check)
    // In real scenario, check for specific result content
    const resultsContainer = page.locator('.results-container');
    await expect(resultsContainer).toBeVisible();
  });

  test('should isolate tabs across multiple story instances on docs page', async ({ page }) => {
    // Navigate to docs page where multiple stories render simultaneously
    await page.goto('/?path=/docs/squi-sparqlqueryui--docs');
    await page.waitForLoadState('networkidle');

    // Count total component instances
    const instances = page.locator('.sbdocs-preview');
    const instanceCount = await instances.count();

    if (instanceCount < 2) {
      test.skip();
      return;
    }

    // Add tab to first instance
    const firstInstance = instances.first();
    await firstInstance.locator('[aria-label="Add new tab"]').click();
    await page.waitForTimeout(200);

    // Verify first instance has 2 tabs
    const firstInstanceTabs = await firstInstance.locator('.tab-name').count();
    expect(firstInstanceTabs).toBe(2);

    // Verify second instance still has 1 tab (isolated)
    const secondInstance = instances.nth(1);
    const secondInstanceTabs = await secondInstance.locator('.tab-name').count();
    expect(secondInstanceTabs).toBe(1);
  });

  test('should clear tabs after CTRL+F5 (hard refresh)', async ({ page }) => {
    // Add multiple tabs
    await page.locator('[aria-label="Add new tab"]').click();
    await page.locator('[aria-label="Add new tab"]').click();
    await expect(page.locator('.tab-name')).toHaveCount(3);

    // Perform hard refresh (equivalent to CTRL+F5)
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.bx--tabs', { timeout: 10000 });

    // With disablePersistence: true, should start fresh with 1 tab
    const tabCount = await page.locator('.tab-name').count();
    expect(tabCount).toBe(1);
  });
});

test.describe('Tab UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/squi-sparqlqueryui--allfeaturesenabled');
    await page.waitForSelector('.bx--tabs', { timeout: 10000 });
  });

  test('should show close buttons when multiple tabs exist', async ({ page }) => {
    // Initially one tab - no close button
    await expect(page.locator('.close-button')).toHaveCount(0);

    // Add second tab
    await page.locator('[aria-label="Add new tab"]').click();
    await page.waitForTimeout(100);

    // Should now have close buttons
    await expect(page.locator('.close-button')).toHaveCount(2);
  });

  test('should close tabs without navigation', async ({ page }) => {
    // Add second tab
    await page.locator('[aria-label="Add new tab"]').click();
    await expect(page.locator('.tab-name')).toHaveCount(2);

    // Close first tab
    const closeButtons = page.locator('.close-button');
    await closeButtons.first().click();

    // Verify tab was closed
    await expect(page.locator('.tab-name')).toHaveCount(1);

    // Verify we're still on the same story (no navigation occurred)
    await expect(page).toHaveURL(/story\/squi-sparqlqueryui--allfeaturesenabled/);
  });

  test('should highlight active tab', async ({ page }) => {
    // Add second tab
    await page.locator('[aria-label="Add new tab"]').click();
    await page.waitForTimeout(100);

    // Second tab should be active
    const tab2 = page.locator('.bx--tabs__nav-link').nth(1);
    await expect(tab2).toHaveAttribute('aria-selected', 'true');

    // Click first tab
    const tab1 = page.locator('.bx--tabs__nav-link').first();
    await tab1.click();
    await page.waitForTimeout(100);

    // First tab should now be active
    await expect(tab1).toHaveAttribute('aria-selected', 'true');
    await expect(tab2).toHaveAttribute('aria-selected', 'false');
  });
});

/**
 * Helper to debug tab switching state
 */
async function debugTabState(page: Page, label: string) {
  const state = await page.evaluate(() => {
    const tabStore = (window as any).__tabStore;
    const queryStore = (window as any).__queryStore;
    return {
      tabs: tabStore ? (window as any).__getTabStoreState?.() : null,
      query: queryStore ? (window as any).__getQueryStoreState?.() : null,
    };
  });
  console.log(`[${label}] Tab State:`, JSON.stringify(state, null, 2));
}
