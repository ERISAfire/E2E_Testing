import { test } from '../../../base-test';

// UI Pages
import { LoginPage } from '../../ui/pages/LoginPage';
import { ProjectsPage } from '../../ui/pages/ProjectsPage';

// Utilities and helpers
import { EnvConfig } from '../../config/env.config';
import { LogHelper } from '../../core/helpers/log.helper';
import { RandomUtils } from '../../core/utils/random.utils';
import { StringUtils } from '../../core/utils/string.utils';
import { TestDataFactory } from '../../factories/test-data.factory';

/**
 * Test suite for Auth UI
 *
 * This suite demonstrates two approaches to test data management:
 * 1. Using direct values and environment configuration
 * 2. Using TestDataFactory pattern
 *
 * Both approaches are valid and shown for demonstration purposes.
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
    LogHelper.info('Pages initialized');
    await loginPage.goto();
  });

  /**
   * Approach 1: Using environment configuration and utility methods
   *
   * This approach uses environment variables for credentials
   * and utility methods for generating random data.
   */
  test.describe('Approach 1: Environment configuration and utilities', () => {
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
      LogHelper.debug(`Testing with random email: ${randomEmail}`);

      await loginPage.login(randomEmail, StringUtils.generateRandomString());
      await loginPage.assertErrorMessage(
        "It looks like you're not on the guest list—yet. Let us know who you are via the in-app messenger, and we'll send you an invitation to ERISAfire Projects."
      );
    });
  });

  /**
   * Approach 2: Using TestDataFactory pattern
   *
   * This approach uses the TestDataFactory to abstract test data creation
   * and provide a consistent interface for getting test data.
   */
  test.describe('Approach 2: TestDataFactory pattern', () => {
    /**
     * Test successful login using TestDataFactory
     * @tags smoke, regression, critical, ui, auth
     */
    test.skip('successful login with TestDataFactory @smoke @regression @critical @ui @auth', async () => {
      // Using TestDataFactory to get predefined valid credentials
      const credentials = TestDataFactory.getSauceCredentials('standard');
      LogHelper.debug('Using UI credentials', credentials);

      await loginPage.login(credentials.email, credentials.password);
      await projectsPage.waitForLoad();
    });

    /**
     * Test failed login using TestDataFactory for locked user
     * @tags regression, ui, auth
     */
    test.skip('failed login with TestDataFactory @regression @ui @auth', async () => {
      // Using TestDataFactory to get credentials for a locked user
      const credentials = TestDataFactory.getSauceCredentials('locked');
      LogHelper.debug('Using locked UI credentials', credentials);

      await loginPage.login(credentials.email, credentials.password);
      await loginPage.getErrorMessage();
    });
  });
});
