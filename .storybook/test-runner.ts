/**
 * Storybook Test Runner Configuration
 * Runs play functions from stories as actual tests
 *
 * Docs: https://storybook.js.org/docs/writing-tests/test-runner
 */

import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  // Increase timeout for large dataset tests (e.g., 10,000 rows)
  // Default is 15s, we increase to 30s to accommodate performance tests
  async preVisit(page) {
    // Set longer timeout for page operations
    page.setDefaultTimeout(30000); // 30 seconds
  },

  // Optional: Add custom test logic after each story
  async postVisit(page, context) {
    // You can add custom assertions here if needed
    // For example, check for console errors:
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // Fail test if console errors occurred
    if (logs.length > 0) {
      throw new Error(`Console errors detected:\n${logs.join('\n')}`);
    }
  },

  // Tags to skip (if needed)
  // tags: {
  //   exclude: ['skip-test'],
  // },
};

export default config;
