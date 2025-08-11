import { test } from '../../core/base-test.js';
import { expect } from '@playwright/test';

// UI Pages
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { ProjectsPage } from '../../ui/pages/ProjectsPage.js';

// Utilities and helpers
import { EnvConfig } from '../../config/env.config.js';
import { RandomUtils } from '../../core/utils/random.utils.js';
import { StringUtils } from '../../core/utils/string.utils.js';

/**
 * Test suite for Auth UI
 *
 * This suite demonstrates test data management using direct values and environment configuration.
 */
test.describe('Auth UI Tests', () => {
  let loginPage: LoginPage;
  let projectsPage: ProjectsPage;
  const env = EnvConfig.getInstance();

  /**
   * Initialize pages and navigate to login page before each test
   */
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectsPage = new ProjectsPage(page);
    await loginPage.goto();
  });

  /**
   * Using environment configuration and utility methods
   *
   * This approach uses environment variables for credentials
   * and utility methods for generating random data.
   */
  test.describe('Login Tests', () => {
    /**
     * Test successful login using environment credentials
     * @tags smoke, regression, critical, ui, auth
     */
    test('should successfully login with valid credentials @smoke @regression @critical @ui @auth', async () => {
      // Using credentials from environment configuration
      await loginPage.login(
        env.get<string>('credentials.email'),
        env.get<string>('credentials.password')
      );
      await projectsPage.waitForLoad();
    });

    /**
     * Test failed login with random invalid credentials
     * @tags regression, ui, auth
     */
    test('should fail with invalid credentials @regression @ui @auth', async () => {
      // Using utility methods to generate random credentials
      const randomEmail = RandomUtils.getRandomEmail();

      await loginPage.login(randomEmail, StringUtils.generateRandomString());
      await loginPage.assertErrorMessage(
        "It looks like you're not on the guest list—yet. Let us know who you are via the in-app messenger, and we'll send you an invitation to ERISAfire Projects."
      );
    });

    /**
     * Test password reset functionality
     * @tags regression, ui, auth, password-reset
     */
    test('should allow password reset for existing email @regression @ui @auth @password-reset', async () => {
      const testEmail = 'iuliia.kariuk+automation@honeycombsoft.com';

      // Request password reset
      await loginPage.requestPasswordReset(testEmail);

      // Verify the success message
      const successMessage = await loginPage.getPasswordResetSuccessMessage();
      expect(successMessage).toContain(
        "If there's a user account with that email, we will send you an email to reset your password."
      );
    });
  });
});
