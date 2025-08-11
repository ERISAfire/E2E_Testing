import { defineConfig } from '@playwright/test';

// Playwright configuration
export default defineConfig({
  // Test directory
  testDir: './src/tests',

  // Run tests in parallel
  fullyParallel: true,

  // Global test timeout (90 seconds)
  timeout: 90000,

  // Global expect timeout (30 seconds)
  expect: {
    timeout: 30000,
  },

  // Reporters configuration
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: true,
      },
    ],
  ],

  // Browser settings
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Trace collection
    trace: 'on-first-retry',

    // Screenshot collection
    screenshot: 'only-on-failure',

    // Video recording
    video: 'on-first-retry',
  },

  // Test projects
  projects: [
    // Setup project (runs first)
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts$/,
    },

    // Main test project (depends on setup)
    {
      name: 'e2e',
      dependencies: ['setup'],
    },
  ],

  // Test file patterns
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/node_modules/**', '**/dist/**'],

  // Test filtering using tags from TAGS environment variable
  grep: process.env.TAGS ? new RegExp(process.env.TAGS) : undefined,
});
