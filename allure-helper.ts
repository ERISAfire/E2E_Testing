/**
 * Allure Helper Functions
 *
 * This module provides utility functions for working with Allure reporting
 * in Playwright tests, including tag processing and artifact attachment.
 *
 * @see https://allurereport.org/
 */
import { TestInfo } from '@playwright/test';

/**
 * Extracts tag annotations from test title
 *
 * Parses the test title to find tags formatted as @tag
 *
 * @param testInfo - The Playwright TestInfo object
 * @returns Array of tags found in the test title
 *
 * @example
 * // For a test named "login test @smoke @critical"
 * // This would return ["@smoke", "@critical"]
 */
export function processTestTags(testInfo: TestInfo): string[] {
  const tagMatches = testInfo.title.match(/@\w+/g);

  return tagMatches || [];
}

/**
 * Attaches screenshots and videos to Allure report for failed tests
 *
 * This function finds screenshots and videos automatically captured by Playwright
 * for failed tests and attaches them to the Allure report with appropriate naming.
 *
 * @param testInfo - The Playwright TestInfo object
 *
 * @example
 * // Usage in base-test.ts
 * test.extend({
 *   page: async ({ page }, use, testInfo) => {
 *     await use(page);
 *     attachScreenshotAndVideo(testInfo);
 *   }
 * });
 */
export function attachScreenshotAndVideo(testInfo: TestInfo): void {
  // Only attach artifacts for failed tests
  if (testInfo.status === 'failed') {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const safeTestName = testInfo.title.replace(/\s+/g, '_');

    // Find and attach screenshot
    if (testInfo.attachments.find((a) => a.name === 'screenshot')) {
      const screenshotPath = testInfo.attachments.find((a) => a.name === 'screenshot')?.path;
      if (screenshotPath) {
        testInfo.attach(`${safeTestName}_screenshot_${timestamp}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }
    }

    // Find and attach video
    if (testInfo.attachments.find((a) => a.name === 'video')) {
      const videoPath = testInfo.attachments.find((a) => a.name === 'video')?.path;
      if (videoPath) {
        testInfo.attach(`${safeTestName}_video_${timestamp}`, {
          path: videoPath,
          contentType: 'video/webm',
        });
      }
    }
  }
}
