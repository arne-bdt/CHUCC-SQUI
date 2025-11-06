/**
 * E2E Test for Standalone Build - Offline/Air-Gapped Deployment
 *
 * Verifies that the standalone build works completely offline without any
 * external network requests (CDN dependencies, etc.)
 *
 * @see .tasks/60-remove-cdn-dependencies.md
 */

import { test, expect } from '@playwright/test';

const STANDALONE_URL = 'http://localhost:8080';

test.describe('Standalone Build - Offline Capability', () => {
  test('should load without any external network requests', async ({ page, context }) => {
    // Track all network requests
    const externalRequests: string[] = [];
    const failedRequests: string[] = [];

    // Intercept all network requests
    page.on('request', (request) => {
      const url = request.url();

      // Filter out localhost/file requests (these are allowed)
      if (!url.startsWith(STANDALONE_URL) &&
          !url.startsWith('file://') &&
          !url.startsWith('data:') &&
          !url.startsWith('blob:')) {
        externalRequests.push(url);
      }
    });

    // Track failed requests
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    // Navigate to standalone build
    await page.goto(STANDALONE_URL);

    // Wait for app to initialize
    await page.waitForTimeout(2000);

    // Verify no external requests were made
    expect(externalRequests,
      `External network requests detected:\n${externalRequests.join('\n')}`
    ).toHaveLength(0);

    // Verify no failed requests (especially CSS)
    const cssFailures = failedRequests.filter(url => url.includes('.css'));
    expect(cssFailures,
      `CSS files failed to load:\n${cssFailures.join('\n')}`
    ).toHaveLength(0);
  });

  test('should load Carbon CSS from local files', async ({ page }) => {
    await page.goto(STANDALONE_URL);

    // Check that the CSS link element exists and points to local file
    const cssLink = page.locator('link[rel="stylesheet"][href*="css/all.css"]');
    await expect(cssLink).toHaveCount(1);

    const href = await cssLink.getAttribute('href');
    expect(href).toBe('./css/all.css');

    // Verify no CDN links
    const cdnLinks = page.locator('link[href*="unpkg.com"], link[href*="cdn."]');
    await expect(cdnLinks).toHaveCount(0);
  });

  test('should have Carbon styles applied (no unstyled content)', async ({ page }) => {
    await page.goto(STANDALONE_URL);

    // Wait for app to render
    await page.waitForTimeout(2000);

    // Check that Carbon CSS variables are defined
    const hasCarbon = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      // Check for Carbon Design System CSS custom properties
      return style.getPropertyValue('--cds-ui-background') !== '';
    });

    expect(hasCarbon).toBe(true);

    // Verify no "unstyled content flash" - body should have background color
    const backgroundColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
    expect(backgroundColor).not.toBe(''); // Not empty
  });

  test('should render the application UI correctly', async ({ page }) => {
    await page.goto(STANDALONE_URL);

    // Wait for app to initialize
    await page.waitForTimeout(2000);

    // Check for key UI elements (these should be visible if CSS loaded correctly)
    // Note: We can't check for specific text without knowing the app state,
    // but we can verify the app structure rendered
    const appContainer = page.locator('#app');
    await expect(appContainer).toBeVisible();

    // Verify the app rendered content (not just loading spinner)
    const hasContent = await page.evaluate(() => {
      const app = document.getElementById('app');
      return app && app.children.length > 0;
    });

    expect(hasContent).toBe(true);
  });

  test('should block external CDN requests in simulated offline mode', async ({ page, context }) => {
    const blockedRequests: string[] = [];
    const allowedRequests: string[] = [];

    // Block ALL external requests (simulate offline environment)
    await context.route('**/*', (route) => {
      const url = route.request().url();

      // Allow only localhost and data URLs
      if (url.startsWith(STANDALONE_URL) ||
          url.startsWith('data:') ||
          url.startsWith('blob:')) {
        allowedRequests.push(url);
        route.continue();
      } else {
        blockedRequests.push(url);
        route.abort('failed');
      }
    });

    // Navigate to standalone build with all external requests blocked
    await page.goto(STANDALONE_URL);

    // Wait for app to attempt to initialize
    await page.waitForTimeout(3000);

    // Verify NO external requests were attempted
    const externalAttempts = blockedRequests.filter(url =>
      url.includes('unpkg.com') ||
      url.includes('cdn.') ||
      url.includes('jsdelivr') ||
      url.includes('googleapis')
    );

    expect(externalAttempts,
      `Application attempted to load external resources in offline mode:\n${externalAttempts.join('\n')}`
    ).toHaveLength(0);

    // Verify the app still works (no console errors about missing CSS)
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    const cssErrors = errors.filter(e =>
      e.toLowerCase().includes('css') ||
      e.toLowerCase().includes('stylesheet') ||
      e.toLowerCase().includes('failed to load')
    );

    expect(cssErrors,
      `Console errors detected:\n${cssErrors.join('\n')}`
    ).toHaveLength(0);
  });

  test('should have all theme CSS files available', async ({ page }) => {
    const themes = ['all.css', 'white.css', 'g10.css', 'g90.css', 'g100.css'];

    for (const theme of themes) {
      const response = await page.request.get(`${STANDALONE_URL}/css/${theme}`);

      expect(response.status(),
        `${theme} should be available (HTTP 200)`
      ).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType,
        `${theme} should have correct content-type`
      ).toContain('text/css');

      const size = parseInt(response.headers()['content-length'] || '0');
      expect(size,
        `${theme} should not be empty`
      ).toBeGreaterThan(1000); // Carbon CSS files are sizeable
    }
  });
});
