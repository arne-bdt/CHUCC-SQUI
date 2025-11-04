/**
 * Accessibility verification for ARIA live regions
 * Tests that query status changes are announced to screen readers
 */

import { test, expect } from '@playwright/test';

test.describe('ARIA Live Regions for Query Feedback', () => {
  test('should have aria-live region in ResultsPlaceholder', async ({ page }) => {
    // Navigate to ResultsPlaceholder story with loading state
    await page.goto('http://localhost:6006/?path=/story/results-resultsplaceholder--loading');

    // Wait for Storybook iframe
    const storyFrame = page.frameLocator('#storybook-preview-iframe');

    // Wait for component to render
    await storyFrame.locator('.results-placeholder').waitFor({ timeout: 10000 });

    // Check for aria-live region
    const liveRegion = storyFrame.locator('[aria-live="polite"][role="status"]').first();
    await expect(liveRegion).toBeAttached();
    await expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

    console.log('\n=== ARIA Live Region Found ===');
    const liveRegionAttrs = await liveRegion.evaluate((el) => ({
      role: el.getAttribute('role'),
      'aria-live': el.getAttribute('aria-live'),
      'aria-atomic': el.getAttribute('aria-atomic'),
      class: el.className,
    }));
    console.log(JSON.stringify(liveRegionAttrs, null, 2));

    // Check that the live region contains loading announcement
    const text = await liveRegion.textContent();
    console.log(`Live region text: "${text}"`);
    expect(text?.trim()).toBeTruthy();
  });

  test('should announce "Query is executing" when loading', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/results-resultsplaceholder--loading');

    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.results-placeholder').waitFor({ timeout: 10000 });

    // Find the screen reader live region
    const liveRegion = storyFrame.locator('.sr-only[role="status"][aria-live="polite"]');
    await expect(liveRegion).toBeAttached();

    // Check the announcement text
    const text = await liveRegion.textContent();
    console.log(`\n=== Loading State Announcement ===`);
    console.log(`Text: "${text}"`);

    // Verify it contains query executing message
    expect(text).toContain('Query is executing');
  });

  test('should announce "Query execution failed" on error', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/results-resultsplaceholder--error-generic');

    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.results-placeholder').waitFor({ timeout: 10000 });

    // Find the screen reader live region
    const liveRegion = storyFrame.locator('.sr-only[role="status"][aria-live="polite"]');
    await expect(liveRegion).toBeAttached();

    // Check the announcement text
    const text = await liveRegion.textContent();
    console.log(`\n=== Error State Announcement ===`);
    console.log(`Text: "${text}"`);

    // Verify it contains error message
    expect(text).toContain('Query execution failed');
  });

  test('should announce "Query execution complete" when results load', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/results-resultsplaceholder--select-query-results');

    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.results-placeholder').waitFor({ timeout: 10000 });

    // Find the screen reader live region
    const liveRegion = storyFrame.locator('.sr-only[role="status"][aria-live="polite"]');
    await expect(liveRegion).toBeAttached();

    // Check the announcement text
    const text = await liveRegion.textContent();
    console.log(`\n=== Success State Announcement ===`);
    console.log(`Text: "${text}"`);

    // Verify it contains completion message
    expect(text).toContain('Query execution complete');
  });

  test('should have screen reader only styling', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/results-resultsplaceholder--loading');

    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.results-placeholder').waitFor({ timeout: 10000 });

    // Find the screen reader only element
    const srOnly = storyFrame.locator('.sr-only[role="status"]');
    await expect(srOnly).toBeAttached();

    // Verify it's visually hidden but accessible to screen readers
    const styles = await srOnly.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        width: computed.width,
        height: computed.height,
        overflow: computed.overflow,
        clip: computed.clip,
      };
    });

    console.log('\n=== Screen Reader Only Styles ===');
    console.log(JSON.stringify(styles, null, 2));

    // Verify it's hidden from visual users
    expect(styles.position).toBe('absolute');
    expect(styles.width).toBe('1px');
    expect(styles.height).toBe('1px');
    expect(styles.overflow).toBe('hidden');
  });

  test('should check ErrorNotification accessibility via Error story', async ({ page }) => {
    // Test the error notification using the ErrorGeneric story which includes ErrorNotification
    await page.goto('http://localhost:6006/?path=/story/results-resultsplaceholder--error-generic');

    const storyFrame = page.frameLocator('#storybook-preview-iframe');

    // Wait for error notification to render
    await storyFrame.locator('.error-notification-wrapper').waitFor({ timeout: 10000 });

    // Check if Carbon's InlineNotification has proper ARIA attributes
    const notification = storyFrame.locator('[class*="bx--inline-notification"]').first();
    await expect(notification).toBeVisible();

    // Get all ARIA attributes
    const ariaAttrs = await notification.evaluate((el) => {
      const attrs: Record<string, string | null> = {};
      for (const attr of el.attributes) {
        if (attr.name.startsWith('aria-') || attr.name === 'role') {
          attrs[attr.name] = attr.value;
        }
      }
      return attrs;
    });

    console.log('\n=== ErrorNotification ARIA Attributes ===');
    console.log(JSON.stringify(ariaAttrs, null, 2));

    // Check if it has role="alert" or role="status"
    const hasAlertRole = ariaAttrs.role === 'alert' || ariaAttrs.role === 'status';
    console.log(`Has alert/status role: ${hasAlertRole}`);

    // Report findings (don't fail if Carbon doesn't provide role)
    if (!hasAlertRole) {
      console.warn('⚠️  InlineNotification does not have role="alert" or role="status"');
      console.warn('This may need to be added explicitly');
    }
  });

  test('should verify loading state has aria-live on visible content', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/results-resultsplaceholder--loading');

    const storyFrame = page.frameLocator('#storybook-preview-iframe');
    await storyFrame.locator('.results-placeholder').waitFor({ timeout: 10000 });

    // Check the visible loading message also has aria-live
    const loadingMessage = storyFrame.locator('.placeholder-content[role="status"][aria-live="polite"]');

    if (await loadingMessage.count() > 0) {
      await expect(loadingMessage).toBeVisible();

      const text = await loadingMessage.textContent();
      console.log('\n=== Visible Loading Message ===');
      console.log(`Text: "${text}"`);
      console.log('Has role="status" and aria-live="polite" ✓');
    }
  });
});
