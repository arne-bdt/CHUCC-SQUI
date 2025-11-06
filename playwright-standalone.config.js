import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Standalone Build E2E tests
 * Tests run against the standalone distribution to verify offline capability
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/standalone-*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx http-server dist-standalone -p 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
