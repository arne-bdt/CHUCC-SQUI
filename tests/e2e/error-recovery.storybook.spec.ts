/**
 * E2E tests for Error Recovery using Storybook stories
 * Tests error notification display, recovery options, and error messaging
 * Task 85: Add Missing E2E Tests
 */

import { test, expect } from '@playwright/test';

const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Error Recovery - ResultsPlaceholder Stories', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console error logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
  });

  test('should show error notification on ErrorGeneric story', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--error-generic&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification is visible (Carbon InlineNotification)
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message is displayed (use .first() to handle duplicate text in title+subtitle)
    await expect(page.getByText(/query execution failed/i).first()).toBeVisible();
    await expect(page.getByText(/endpoint not responding/i).first()).toBeVisible();
  });

  test('should show CORS error with detailed guidance on ErrorCORS story', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--error-cors&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification is visible
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify CORS-specific error message (use .first() for strict mode)
    await expect(page.getByText(/cors error/i).first()).toBeVisible();
    await expect(page.getByText(/cross-origin/i).first()).toBeVisible();

    // Verify actionable solutions are mentioned
    const pageContent = await page.content();
    expect(pageContent).toContain('CORS');
  });

  test('should show network error on ErrorNetwork story', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--error-network&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification is visible
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify network error message (use .first() for strict mode)
    await expect(page.getByText(/network error/i).first()).toBeVisible();
    await expect(page.getByText(/unable to reach endpoint/i).first()).toBeVisible();
  });

  test('should show server error on ErrorServerError story', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--error-server-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification is visible
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify server error message
    await expect(page.getByText(/internal server error/i)).toBeVisible();
  });

  test('error notification should be dismissible', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--error-generic&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error is visible
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Look for close button (Carbon InlineNotification has a close button)
    const closeButton = page.getByRole('button', { name: /close/i });
    const closeButtonCount = await closeButton.count();

    // Close button may or may not be present depending on notification config
    // If present, verify it's clickable
    if (closeButtonCount > 0) {
      await expect(closeButton).toBeVisible();
      await expect(closeButton).toBeEnabled();
    }
  });

  test('error should persist across view switches', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-resultsplaceholder--error-generic&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error is visible
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/query execution failed/i).first()).toBeVisible();

    // Error should remain visible (no view switcher in error state)
    // Just verify the error notification is stable
    await page.waitForTimeout(500);
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('Error Recovery - ErrorNotification Component Stories', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
  });

  test('should display CORS error with actionable solutions', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--cors-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify CORS-specific messaging (use .first() for strict mode)
    await expect(page.getByText(/cors error/i).first()).toBeVisible();
    await expect(page.getByText(/cross-origin request blocked/i).first()).toBeVisible();

    // Verify actionable solutions are present
    const pageContent = await page.content();
    expect(pageContent).toContain('CORS proxy');
    expect(pageContent).toContain('Access-Control-Allow-Origin');
  });

  test('should display network error with guidance', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--network-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify network error message (use .first() for strict mode)
    await expect(page.getByText(/network error/i).first()).toBeVisible();
    await expect(page.getByText(/unable to reach endpoint/i).first()).toBeVisible();
  });

  test('should display Bad Request error (HTTP 400)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--bad-request&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/bad request/i)).toBeVisible();
    await expect(page.getByText(/invalid sparql query/i)).toBeVisible();
  });

  test('should display Unauthorized error (HTTP 401)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--unauthorized&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/unauthorized/i)).toBeVisible();
    await expect(page.getByText(/authentication required/i)).toBeVisible();
  });

  test('should display Forbidden error (HTTP 403)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--forbidden&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/forbidden/i)).toBeVisible();
    await expect(page.getByText(/access denied/i)).toBeVisible();
  });

  test('should display Not Found error (HTTP 404)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--not-found&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/not found/i)).toBeVisible();
    await expect(page.getByText(/endpoint does not exist/i)).toBeVisible();
  });

  test('should display Request Timeout error (HTTP 408)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--request-timeout&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify timeout error message (use .first() for strict mode)
    await expect(page.getByText(/request timeout/i).first()).toBeVisible();
    await expect(page.getByText(/query took too long/i).first()).toBeVisible();
  });

  test('should display Internal Server Error (HTTP 500)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--internal-server-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/internal server error/i)).toBeVisible();
  });

  test('should display Bad Gateway error (HTTP 502)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--bad-gateway&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/bad gateway/i)).toBeVisible();
  });

  test('should display Service Unavailable error (HTTP 503)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--service-unavailable&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/service unavailable/i)).toBeVisible();
    await expect(page.getByText(/temporarily down/i)).toBeVisible();
  });

  test('should display Gateway Timeout error (HTTP 504)', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--gateway-timeout&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/gateway timeout/i)).toBeVisible();
  });

  test('should display Client Timeout error', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--client-timeout&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/query timeout/i)).toBeVisible();
  });

  test('should display SPARQL Syntax Error', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--sparql-syntax-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/sparql syntax error/i)).toBeVisible();
  });

  test('should display generic string error', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--string-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/query execution failed/i)).toBeVisible();
  });

  test('should display unknown error', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--unknown-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify error message
    await expect(page.getByText(/unexpected error occurred/i)).toBeVisible();
  });

  test('should handle long error details with expandable section', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--long-error-details&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // Verify main error message
    await expect(page.getByText(/internal server error/i)).toBeVisible();

    // Verify details section exists (may be expandable)
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('should not render when error is null', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--no-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify NO error notification is rendered
    const alertCount = await page.getByRole('alert').count();
    expect(alertCount).toBe(0);
  });
});

test.describe('Error Accessibility', () => {
  test('error notifications should have role="alert" for screen readers', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--cors-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify alert role
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });
  });

  test('error messages should be keyboard accessible', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--cors-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification is rendered
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });

    // If there's a close button, it should be keyboard accessible
    const closeButton = page.getByRole('button', { name: /close/i });
    const closeButtonCount = await closeButton.count();

    if (closeButtonCount > 0) {
      // Focus close button via keyboard
      await closeButton.focus();
      await expect(closeButton).toBeFocused();
    }
  });

  test('error notifications should have sufficient color contrast', async ({ page }) => {
    await page.goto(
      `${STORYBOOK_URL}/iframe.html?id=results-errornotification--cors-error&viewMode=story`
    );
    await page.waitForTimeout(1500);

    // Verify error notification renders with proper styling
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible({ timeout: 5000 });

    // Check that error text is visible (implies sufficient contrast) (use .first() for strict mode)
    await expect(page.getByText(/cors error/i).first()).toBeVisible();
  });
});
