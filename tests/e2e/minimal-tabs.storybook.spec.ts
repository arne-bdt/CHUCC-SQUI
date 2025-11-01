import { test, expect } from '@playwright/test';

test.describe('MinimalTabs E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/tabrebuild-01-minimaltabs--default');
    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.tab-name').first().waitFor({ timeout: 10000 });
  });

  test('should switch tab content when clicking tabs', async ({ page }) => {
    const storyFrame = page.frameLocator('#storybook-preview-iframe');

    // Get initial tab ID
    const initialTabId = await storyFrame.locator('[data-testid="active-tab-id"]').textContent();
    expect(initialTabId).toContain('tab-');

    // Add second tab
    const addButton = storyFrame.locator('[aria-label="Add new tab"]');
    await addButton.click();
    await page.waitForTimeout(200);

    // Tab 2 should be active (different ID)
    const tab2Id = await storyFrame.locator('[data-testid="active-tab-id"]').textContent();
    expect(tab2Id).not.toBe(initialTabId);

    // Click back to tab 1
    const tabs = storyFrame.locator('.tab-name');
    await tabs.first().click();
    await page.waitForTimeout(200);

    // CRITICAL TEST: Active tab ID should switch back
    const switchedTabId = await storyFrame.locator('[data-testid="active-tab-id"]').textContent();
    expect(switchedTabId).toBe(initialTabId);
  });
});
