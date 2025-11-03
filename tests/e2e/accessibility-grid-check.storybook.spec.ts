/**
 * Accessibility verification for DataTable component
 * Inspects ARIA roles and keyboard navigation support
 */

import { test, expect } from '@playwright/test';

test.describe('DataTable Accessibility', () => {
  test('should have proper ARIA roles on grid elements', async ({ page }) => {
    // Navigate to DataTable story
    await page.goto('http://localhost:6006/?path=/story/results-datatable--default');

    // Wait for Storybook iframe
    const storyFrame = page.frameLocator('#storybook-preview-iframe');

    // Wait for DataTable to render
    await storyFrame.locator('.data-table-container').waitFor({ timeout: 10000 });

    // Check wrapper ARIA roles (from DataTable.svelte)
    const container = storyFrame.locator('.data-table-container');
    await expect(container).toHaveAttribute('role', 'region');

    const gridWrapper = storyFrame.locator('.grid-wrapper');
    await expect(gridWrapper).toHaveAttribute('role', 'table');

    // Check wx-svelte-grid rendered elements
    const wxGrid = storyFrame.locator('.wx-grid');
    await expect(wxGrid).toBeVisible();

    // Get all ARIA roles in the grid
    const allElementsWithRole = await storyFrame.locator('[role]').all();
    const roles = await Promise.all(
      allElementsWithRole.map(async (el) => {
        const role = await el.getAttribute('role');
        const tagName = await el.evaluate((e) => e.tagName);
        return { role, tagName };
      })
    );

    console.log('\n=== ARIA Roles Found in DataTable ===');
    console.log(JSON.stringify(roles, null, 2));

    // Check for specific grid-related ARIA roles
    const gridRoles = roles.map((r) => r.role);
    console.log('\n=== All ARIA Roles ===');
    console.log(gridRoles.join(', '));

    // Verify essential grid ARIA structure
    const hasTableRole = gridRoles.includes('table');
    const hasRowRole = gridRoles.includes('row');
    const hasColumnHeaderRole = gridRoles.includes('columnheader');
    const hasCellRole = gridRoles.includes('cell') || gridRoles.includes('gridcell');

    console.log('\n=== ARIA Structure Check ===');
    console.log(`Has table role: ${hasTableRole}`);
    console.log(`Has row role: ${hasRowRole}`);
    console.log(`Has columnheader role: ${hasColumnHeaderRole}`);
    console.log(`Has cell/gridcell role: ${hasCellRole}`);

    // Get full DOM structure for inspection
    const gridHTML = await wxGrid.evaluate((el) => {
      // Get a sample of the first few elements with their roles
      const elements = el.querySelectorAll('[role]');
      return Array.from(elements)
        .slice(0, 10)
        .map((e) => ({
          tag: e.tagName,
          role: e.getAttribute('role'),
          class: e.className,
          text: e.textContent?.slice(0, 50),
        }));
    });

    console.log('\n=== Sample Grid Elements ===');
    console.log(JSON.stringify(gridHTML, null, 2));
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/results-datatable--default');

    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.wx-grid').waitFor({ timeout: 10000 });

    // Try to focus the grid
    await storyFrame.locator('.wx-grid').click();

    // Test keyboard navigation (Tab, Arrow keys)
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Check if an element within the grid is focused
    const focusedElement = await page.evaluate(() => {
      const activeEl = document.activeElement;
      const iframe = document.querySelector('#storybook-preview-iframe') as HTMLIFrameElement;
      if (iframe?.contentDocument) {
        const iframeActive = iframe.contentDocument.activeElement;
        return {
          tag: iframeActive?.tagName,
          class: iframeActive?.className,
          role: iframeActive?.getAttribute('role'),
        };
      }
      return null;
    });

    console.log('\n=== Focused Element After Tab ===');
    console.log(JSON.stringify(focusedElement, null, 2));

    // Test arrow key navigation
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    console.log('Keyboard navigation test completed');
  });
});
