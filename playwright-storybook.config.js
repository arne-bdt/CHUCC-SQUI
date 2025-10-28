import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Storybook E2E tests
 * Tests run against Storybook stories to catch real UI interaction bugs
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.storybook.spec.ts',
  fullyParallel: false, // Run sequentially for easier debugging
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for Storybook tests
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:6006',
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
    command: 'npm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
