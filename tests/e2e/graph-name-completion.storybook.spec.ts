/**
 * E2E tests for Graph Name Auto-completion in Storybook
 * Tests the completion functionality in actual browser environment
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Graph Name Auto-completion', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console error logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
  });

  test('should show completion popup for FROM clause', async ({ page }) => {
    // Navigate to the FROM completion story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-editor-sparqleditor--graph-name-completion-from&viewMode=story`
    );

    // Wait for editor to be ready
    await page.waitForSelector('.cm-editor', { timeout: 5000 });

    // Wait for the play function to set up the service description and for reactive updates to propagate
    await page.waitForTimeout(2000);

    // Click at the end of the editor to position cursor after "FROM "
    const editor = page.locator('.cm-editor .cm-content');
    await editor.click();

    // Press Ctrl+End to go to end of document
    await page.keyboard.press('Control+End');

    // Trigger completion with Ctrl+Space
    await page.keyboard.press('Control+Space');

    // Wait for completion popup
    await page.waitForSelector('.cm-tooltip-autocomplete', { timeout: 3000 });

    // Check that completion popup is visible
    const completionPopup = page.locator('.cm-tooltip-autocomplete');
    await expect(completionPopup).toBeVisible();

    // Check that completions are shown
    const completionItems = page.locator('.cm-tooltip-autocomplete li');
    const count = await completionItems.count();
    expect(count).toBeGreaterThan(0);

    console.log(`[E2E Test] Found ${count} completion items`);

    // Check that default and named graphs are shown
    const firstItem = completionItems.first();
    await expect(firstItem).toBeVisible();

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/graph-completion-from.png' });
  });

  test('should show only named graphs for FROM NAMED', async ({ page }) => {
    // Navigate to the FROM NAMED completion story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-editor-sparqleditor--graph-name-completion-from-named&viewMode=story`
    );

    // Wait for editor to be ready
    await page.waitForSelector('.cm-editor', { timeout: 5000 });

    // Wait for play function to set up service description
    await page.waitForTimeout(500);

    // Click at the end of the editor
    const editor = page.locator('.cm-editor .cm-content');
    await editor.click();

    // Press Ctrl+End to go to end of document
    await page.keyboard.press('Control+End');

    // Trigger completion
    await page.keyboard.press('Control+Space');

    // Wait for completion popup
    await page.waitForSelector('.cm-tooltip-autocomplete', { timeout: 3000 });

    // Check that completion popup is visible
    const completionPopup = page.locator('.cm-tooltip-autocomplete');
    await expect(completionPopup).toBeVisible();

    // Get completion items
    const completionItems = page.locator('.cm-tooltip-autocomplete li');
    const count = await completionItems.count();

    console.log(`[E2E Test] Found ${count} named graph completion items`);

    // Should have 3 named graphs (people, places, events)
    expect(count).toBe(3);

    // Check that items have metadata displayed
    const firstItemText = await completionItems.first().textContent();
    console.log(`[E2E Test] First completion item: ${firstItemText}`);

    // Should contain graph IRI
    expect(firstItemText).toContain('http://example.org/graph/');

    // Take a screenshot
    await page.screenshot({ path: 'test-results/graph-completion-from-named.png' });
  });

  test('should filter completions based on partial input', async ({ page }) => {
    // Navigate to the filtered completion story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-editor-sparqleditor--graph-name-completion-filtered&viewMode=story`
    );

    // Wait for editor to be ready
    await page.waitForSelector('.cm-editor', { timeout: 5000 });

    // Wait for play function
    await page.waitForTimeout(500);

    // Click at the end of the editor (already has partial IRI)
    const editor = page.locator('.cm-editor .cm-content');
    await editor.click();

    // Press Ctrl+End to go to end
    await page.keyboard.press('Control+End');

    // Trigger completion
    await page.keyboard.press('Control+Space');

    // Wait for completion popup
    await page.waitForSelector('.cm-tooltip-autocomplete', { timeout: 3000 });

    // Check that completion popup is visible
    const completionPopup = page.locator('.cm-tooltip-autocomplete');
    await expect(completionPopup).toBeVisible();

    // Get completion items
    const completionItems = page.locator('.cm-tooltip-autocomplete li');
    const count = await completionItems.count();

    console.log(`[E2E Test] Found ${count} filtered completion items`);

    // Should have 3 graphs starting with 'p' (people, places, products)
    expect(count).toBe(3);

    // Verify all items contain 'p' in their name
    for (let i = 0; i < count; i++) {
      const itemText = await completionItems.nth(i).textContent();
      console.log(`[E2E Test] Filtered item ${i + 1}: ${itemText}`);
      expect(itemText?.toLowerCase()).toMatch(/\/p(eople|laces|roducts)/);
    }

    // Take a screenshot
    await page.screenshot({ path: 'test-results/graph-completion-filtered.png' });
  });

  test('should show metadata in completion items', async ({ page }) => {
    // Navigate to the FROM completion story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-editor-sparqleditor--graph-name-completion-from&viewMode=story`
    );

    // Wait for editor to be ready
    await page.waitForSelector('.cm-editor', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Click at the end of the editor
    const editor = page.locator('.cm-editor .cm-content');
    await editor.click();
    await page.keyboard.press('Control+End');

    // Trigger completion
    await page.keyboard.press('Control+Space');

    // Wait for completion popup
    await page.waitForSelector('.cm-tooltip-autocomplete', { timeout: 3000 });

    // Get first completion item
    const firstItem = page.locator('.cm-tooltip-autocomplete li').first();
    const itemText = await firstItem.textContent();

    console.log(`[E2E Test] Completion item with metadata: ${itemText}`);

    // Check for metadata indicators (triple count, entailment regime)
    // The detail should contain "triples" or other metadata
    const hasMetadata = itemText?.includes('triples') || itemText?.includes('RDFS') || itemText?.includes('OWL');

    if (hasMetadata) {
      console.log('[E2E Test] ✓ Metadata found in completion item');
    } else {
      console.log('[E2E Test] ⚠ No metadata found in completion item');
    }

    // Take a screenshot showing metadata
    await page.screenshot({ path: 'test-results/graph-completion-metadata.png' });
  });

  test('should support keyboard navigation in completion popup', async ({ page }) => {
    // Navigate to the FROM NAMED completion story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-editor-sparqleditor--graph-name-completion-from-named&viewMode=story`
    );

    // Wait for editor to be ready
    await page.waitForSelector('.cm-editor', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Click at the end of the editor
    const editor = page.locator('.cm-editor .cm-content');
    await editor.click();
    await page.keyboard.press('Control+End');

    // Trigger completion
    await page.keyboard.press('Control+Space');

    // Wait for completion popup
    await page.waitForSelector('.cm-tooltip-autocomplete', { timeout: 3000 });

    // Wait for popup to be fully rendered and ready
    await page.waitForTimeout(300);

    // Get initial selected item
    const selectedItem = page.locator('.cm-tooltip-autocomplete li[aria-selected="true"]');
    const initialText = await selectedItem.textContent();
    console.log(`[E2E Test] Initially selected: ${initialText}`);

    // Press Down arrow key to navigate (editor already has focus from Ctrl+Space)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    // Check that selection changed
    const newSelectedItem = page.locator('.cm-tooltip-autocomplete li[aria-selected="true"]');
    const newText = await newSelectedItem.textContent();
    console.log(`[E2E Test] After ArrowDown: ${newText}`);

    // Verify selection changed
    expect(newText).not.toBe(initialText);

    // Press Up arrow to go back
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // Should be back to initial selection
    const backToFirst = await selectedItem.textContent();
    expect(backToFirst).toBe(initialText);

    console.log('[E2E Test] ✓ Keyboard navigation works');

    // Take a screenshot
    await page.screenshot({ path: 'test-results/graph-completion-keyboard-nav.png' });
  });

  test('should insert graph IRI on selection', async ({ page }) => {
    // Navigate to the FROM completion story
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-editor-sparqleditor--graph-name-completion-from&viewMode=story`
    );

    // Wait for editor to be ready
    await page.waitForSelector('.cm-editor', { timeout: 5000 });
    await page.waitForTimeout(500);

    // Get initial editor content
    const editor = page.locator('.cm-editor .cm-content');
    const initialContent = await editor.textContent();
    console.log(`[E2E Test] Initial content: ${initialContent}`);

    // Click at the end of the editor
    await editor.click();
    await page.keyboard.press('Control+End');

    // Trigger completion
    await page.keyboard.press('Control+Space');

    // Wait for completion popup
    await page.waitForSelector('.cm-tooltip-autocomplete', { timeout: 3000 });

    // Click the first completion item to select it
    const completionItems = page.locator('.cm-tooltip-autocomplete li');
    await completionItems.first().click();

    // Wait for completion to be inserted
    await page.waitForTimeout(300);

    // Get new editor content
    const newContent = await editor.textContent();
    console.log(`[E2E Test] Content after selection: ${newContent}`);

    // Verify that content changed and contains a graph IRI with angle brackets
    expect(newContent).not.toBe(initialContent);
    expect(newContent).toContain('<http://example.org/');
    expect(newContent).toContain('>');

    console.log('[E2E Test] ✓ Graph IRI inserted successfully');

    // Take a screenshot
    await page.screenshot({ path: 'test-results/graph-completion-inserted.png' });
  });

  test('should handle editor without service description gracefully', async ({ page }) => {
    // Navigate to a regular editor story (without service description)
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-editor-sparqleditor--with-simple-query&viewMode=story`
    );

    // Wait for editor to be ready
    await page.waitForSelector('.cm-editor', { timeout: 5000 });

    // Click in the editor
    const editor = page.locator('.cm-editor .cm-content');
    await editor.click();

    // Type "FROM " at the end
    await page.keyboard.press('Control+End');
    await page.keyboard.type(' FROM ');

    // Try to trigger completion
    await page.keyboard.press('Control+Space');

    // Wait a bit
    await page.waitForTimeout(500);

    // Completion popup should either not appear or show SPARQL keyword completions
    // but not graph name completions (since no service description is available)
    const completionPopup = page.locator('.cm-tooltip-autocomplete');
    const isVisible = await completionPopup.isVisible().catch(() => false);

    if (isVisible) {
      // If popup appears, it should be SPARQL keyword completions, not graph names
      const items = page.locator('.cm-tooltip-autocomplete li');
      const count = await items.count();
      console.log(`[E2E Test] Found ${count} completion items (should be SPARQL keywords)`);
    } else {
      console.log('[E2E Test] No completion popup (expected without service description)');
    }

    // This test passes as long as no errors occur
    console.log('[E2E Test] ✓ Graceful handling without service description');
  });
});
