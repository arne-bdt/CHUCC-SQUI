/**
 * E2E tests for query validation warnings in Storybook
 * Tests ValidationMessages component rendering and interactions
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('ValidationMessages Component', () => {
  test('should render empty state with no issues', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-validationmessages--empty`);

    // Should not have any notification components
    const notifications = page.locator('.bx--inline-notification');
    await expect(notifications).toHaveCount(0);
  });

  test('should render single warning correctly', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--single-warning`
    );

    // Check warning notification is present
    const notification = page.locator('.bx--inline-notification--warning');
    await expect(notification).toBeVisible();

    // Check title
    await expect(page.getByText('Query Compatibility Issues')).toBeVisible();

    // Check subtitle
    await expect(page.getByText('1 potential issue(s) detected')).toBeVisible();

    // Check message
    await expect(
      page.getByText('BIND clause is from SPARQL 1.1 but endpoint only supports SPARQL 1.0')
    ).toBeVisible();

    // Check action button
    const actionButton = page.getByRole('button', { name: 'Learn more' });
    await expect(actionButton).toBeVisible();
  });

  test('should render multiple warnings', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--multiple-warnings`
    );

    // Check subtitle shows correct count
    await expect(page.getByText('3 potential issue(s) detected')).toBeVisible();

    // Check all three warnings are present
    await expect(page.getByText(/BIND clause is from SPARQL 1.1/)).toBeVisible();
    await expect(page.getByText(/does not support URI dereferencing/)).toBeVisible();
    await expect(page.getByText(/SERVICE keyword is from SPARQL 1.1/)).toBeVisible();

    // Check multiple action buttons
    const actionButtons = page.getByRole('button', { name: 'Learn more' });
    await expect(actionButtons).toHaveCount(2);
  });

  test('should render single info message', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-validationmessages--single-info`);

    // Check info notification is present
    const notification = page.locator('.bx--inline-notification--info');
    await expect(notification).toBeVisible();

    // Check title
    await expect(page.getByText('Query Suggestions')).toBeVisible();

    // Check subtitle
    await expect(page.getByText('1 suggestion(s)')).toBeVisible();

    // Check message
    await expect(page.getByText(/Graph .* not in endpoint's named graphs list/)).toBeVisible();

    // Check action button
    const actionButton = page.getByRole('button', { name: 'See available graphs' });
    await expect(actionButton).toBeVisible();
  });

  test('should render multiple info messages', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-validationmessages--multiple-infos`);

    // Check subtitle shows correct count
    await expect(page.getByText('2 suggestion(s)')).toBeVisible();

    // Check both info messages are present
    await expect(page.getByText(/Graph .* not in endpoint's named graphs list/)).toBeVisible();
    await expect(
      page.getByText(/Custom function .* not listed in endpoint capabilities/)
    ).toBeVisible();
  });

  test('should render single error message', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-validationmessages--single-error`);

    // Check error notification is present
    const notification = page.locator('.bx--inline-notification--error');
    await expect(notification).toBeVisible();

    // Check title
    await expect(page.getByText('Query Errors')).toBeVisible();

    // Check subtitle
    await expect(page.getByText('1 error(s) detected')).toBeVisible();

    // Check message
    await expect(page.getByText(/Query syntax error/)).toBeVisible();
  });

  test('should render multiple errors', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--multiple-errors`
    );

    // Check subtitle shows correct count
    await expect(page.getByText('3 error(s) detected')).toBeVisible();

    // Check all three errors are present
    await expect(page.getByText(/Query syntax error/)).toBeVisible();
    await expect(page.getByText(/Undefined prefix/)).toBeVisible();
    await expect(page.getByText(/Invalid IRI syntax/)).toBeVisible();
  });

  test('should render mixed severity levels separately', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--mixed-severity`
    );

    // Check all three notification types are present
    await expect(page.locator('.bx--inline-notification--error')).toBeVisible();
    await expect(page.locator('.bx--inline-notification--warning')).toBeVisible();
    await expect(page.locator('.bx--inline-notification--info')).toBeVisible();

    // Check titles
    await expect(page.getByText('Query Errors')).toBeVisible();
    await expect(page.getByText('Query Compatibility Issues')).toBeVisible();
    await expect(page.getByText('Query Suggestions')).toBeVisible();

    // Check correct counts
    await expect(page.getByText('1 error(s) detected')).toBeVisible();
    await expect(page.getByText('2 potential issue(s) detected')).toBeVisible();
    await expect(page.getByText('1 suggestion(s)')).toBeVisible();
  });

  test('should render SPARQL 1.0 endpoint warnings correctly', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--sparql-10-endpoint-warnings`
    );

    // Check count
    await expect(page.getByText('4 potential issue(s) detected')).toBeVisible();

    // Check all SPARQL 1.1 feature warnings
    await expect(page.getByText(/BIND clause is from SPARQL 1.1/)).toBeVisible();
    await expect(page.getByText(/MINUS is from SPARQL 1.1/)).toBeVisible();
    await expect(page.getByText(/VALUES is from SPARQL 1.1/)).toBeVisible();
    await expect(page.getByText(/CONTAINS function is from SPARQL 1.1/)).toBeVisible();
  });

  test('should render feature support warnings correctly', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--feature-support-warnings`
    );

    // Check count
    await expect(page.getByText('3 potential issue(s) detected')).toBeVisible();

    // Check all feature warnings
    await expect(page.getByText(/does not support URI dereferencing/)).toBeVisible();
    await expect(page.getByText(/does not support federated queries/)).toBeVisible();
    await expect(page.getByText(/requires dataset specification/)).toBeVisible();
  });

  test('should handle long messages with proper layout', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--long-messages`
    );

    // Check messages are visible and readable
    await expect(
      page.getByText(/This is a very long warning message that explains in detail/)
    ).toBeVisible();

    // Check the notification doesn't overflow or break layout
    const notification = page.locator('.bx--inline-notification--warning').first();
    const box = await notification.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('should show close button when enabled', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--with-close-button`
    );

    // Close button should be present in Carbon notification
    // Note: Carbon close button has class 'bx--inline-notification__close-button'
    const closeButton = page.locator('.bx--inline-notification__close-button');
    await expect(closeButton).toBeVisible();
  });

  test('should have accessible action buttons', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--single-warning`
    );

    const actionButton = page.getByRole('button', { name: 'Learn more' });

    // Check button is keyboard accessible
    await actionButton.focus();
    await expect(actionButton).toBeFocused();

    // Check button has proper ARIA label
    await expect(actionButton).toHaveAttribute('aria-label', 'Learn more');
  });

  test('should use list structure for multiple issues', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--multiple-warnings`
    );

    // Check list elements exist
    const list = page.locator('.validation-list');
    await expect(list).toBeVisible();

    // Check list items
    const listItems = page.locator('.validation-list li');
    await expect(listItems).toHaveCount(3);
  });

  test('should handle rapid severity switching', async ({ page }) => {
    // Navigate through different severity stories quickly
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-validationmessages--single-error`);
    await expect(page.locator('.bx--inline-notification--error')).toBeVisible();

    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--single-warning`
    );
    await expect(page.locator('.bx--inline-notification--warning')).toBeVisible();

    await page.goto(`${STORYBOOK_URL}/iframe.html?id=components-validationmessages--single-info`);
    await expect(page.locator('.bx--inline-notification--info')).toBeVisible();

    // Should not have stale notifications
    await expect(page.locator('.bx--inline-notification--error')).not.toBeVisible();
    await expect(page.locator('.bx--inline-notification--warning')).not.toBeVisible();
  });

  test('should render correctly in different viewport sizes', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=components-validationmessages--mixed-severity`
    );

    // Test desktop viewport (default)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.bx--inline-notification')).toHaveCount(3);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.bx--inline-notification')).toHaveCount(3);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.bx--inline-notification')).toHaveCount(3);

    // All notifications should still be visible
    await expect(page.getByText('Query Errors')).toBeVisible();
    await expect(page.getByText('Query Compatibility Issues')).toBeVisible();
    await expect(page.getByText('Query Suggestions')).toBeVisible();
  });
});
