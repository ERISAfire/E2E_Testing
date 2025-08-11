/**
 * Base Test Configuration
 *
 * This file extends Playwright's base test functionality with custom behaviors
 * such as environment validation and automatic attachment of artifacts to Allure reports.
 *
 * It serves as the foundation for all tests in the framework.
 */
import { test as baseTest } from '@playwright/test';
import { attachScreenshotAndVideo } from './helpers/allure-helper';
import { EnvConfig } from '../config/env.config';

// Validate environment variables before any tests run
// This ensures all required configuration is available
EnvConfig.checkEnvVariables();

/**
 * Extended test object with custom fixtures and behaviors
 *
 * This test object should be imported and used in all test files
 * instead of the default Playwright test.
 *
 * @example
 * // In a test file:
 * import { test } from '../../base-test';
 *
 * test('my test', async ({ page }) => {
 *   // Test code here
 * });
 */
export const test = baseTest.extend({
  /**
   * Extended page fixture
   *
   * Enhances the standard page fixture with automatic attachment
   * of screenshots and videos to the Allure report for failed tests.
   */
  page: async ({ page }, use, testInfo) => {
    // Use the page in the test
    await use(page);

    // After the test, attach any artifacts if the test failed
    attachScreenshotAndVideo(testInfo);
  },
});
