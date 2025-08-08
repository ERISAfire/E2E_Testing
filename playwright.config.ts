/**
 * Playwright Configuration
 *
 * This file contains the configuration for Playwright test runner,
 * including test directory, reporters, artifact collection settings,
 * and filtering capabilities.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  /**
   * Directory where tests are located
   */
  testDir: './src/tests',

  /**
   * Global test timeout in milliseconds
   * Set to 2 minutes for complex UI tests with multiple operations
   */
  timeout: 90000,

  /**
   * Test reporters configuration
   * - list: Standard console reporter showing test progress
   * - allure-playwright: Generates Allure report data
   */
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        /**
         * Include test details in the report
         */
        detail: true,
        /**
         * Output folder for Allure results
         */
        outputFolder: 'allure-results',
        /**
         * Include suite titles in reports
         */
        suiteTitle: true,
      },
    ],
  ],

  /**
   * Test execution settings
   */
  use: {
    /**
     * Trace collection:
     * - 'on-first-retry': Collect trace only when test fails and is retried
     */
    trace: 'on-first-retry',

    /**
     * Screenshot collection:
     * - 'only-on-failure': Take screenshots only when tests fail
     */
    screenshot: 'only-on-failure',

    /**
     * Video recording:
     * - 'retain-on-failure': Record video but only save it when tests fail
     */
    video: 'retain-on-failure',
  },

  /**
   * Test filtering using tags
   * Allows running tests with specific tags via TAGS environment variable
   *
   * @example
   * // Run all tests with @smoke tag
   * TAGS=@smoke npm test
   *
   * // Run tests with both @smoke and @api tags
   * TAGS=@smoke.*@api npm test
   */
  grep: process.env.TAGS ? new RegExp(process.env.TAGS) : undefined,
});
