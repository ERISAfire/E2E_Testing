import { test } from '../../../base-test';

// API services and types
import { AuthAPI } from '../../api/services/AuthAPI';
import { type CustomAPIResponse } from '../../core/types/api.types';
import { type LoginErrorResponse, type LoginSuccessResponse } from '../../api/types/auth.api.types';

// Utilities and helpers
import { EnvConfig } from '../../config/env.config';
import { LogHelper } from '../../core/helpers/log.helper';
import { RetryHelper } from '../../core/helpers/retry.helper';
import { RandomUtils } from '../../core/utils/random.utils';
import { StringUtils } from '../../core/utils/string.utils';
import { TestDataFactory } from '../../factories/test-data.factory';

/**
 * Test suite for Auth API
 *
 * This suite demonstrates two approaches to test data management:
 * 1. Using direct values and utility methods
 * 2. Using TestDataFactory pattern
 *
 * Both approaches are valid and shown for demonstration purposes.
 */
test.describe('Auth API Tests', () => {
  let authAPI: AuthAPI;
  const env = EnvConfig.getInstance();

  /**
   * Initialize the API client before each test
   */
  test.beforeEach(async ({ request }) => {
    authAPI = new AuthAPI({
      request,
      baseURL: env.get<string>('apiBaseUrl'),
    });
    LogHelper.info('API client initialized');
  });

  /**
   * Approach 1: Using direct values and utility methods
   *
   * This approach uses utility classes directly for generating random data
   * and manually specifies fixed test data.
   */
  test.describe('Approach 1: Direct values and utilities', () => {
    /**
     * Test successful login using retry mechanism
     * @tags smoke, regression, critical, api, auth
     */
    test.skip('should successfully login with valid credentials @smoke @regression @critical @api @auth', async () => {
      // Using retry mechanism for stability
      const response = await RetryHelper.retryOperation(async () => {
        return (await authAPI.login({
          email: 'eve.holt@reqres.in',
          password: 'cityslicka',
        })) as CustomAPIResponse<LoginSuccessResponse>;
      });

      await authAPI.verifySuccessfulLogin(response);
    });

    /**
     * Test failed login with random invalid credentials
     * @tags regression, api, auth
     */
    test.skip('should fail with invalid credentials @regression @api @auth', async () => {
      // Using utility methods directly
      const response = (await authAPI.login(
        {
          email: RandomUtils.getRandomEmail(),
          password: StringUtils.generateRandomString(),
        },
        { ignoreErrors: true }
      )) as CustomAPIResponse<LoginErrorResponse>;

      await authAPI.verifyFailedLogin(response);
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
     * @tags smoke, regression, critical, api, auth
     */
    test.skip('successful login with TestDataFactory @smoke @regression @critical @api @auth', async () => {
      // Using TestDataFactory to get predefined valid credentials
      const credentials = TestDataFactory.getReqResCredentials('valid');
      LogHelper.debug('Using API credentials', credentials);

      const response = (await authAPI.login(
        credentials
      )) as CustomAPIResponse<LoginSuccessResponse>;
      await authAPI.verifySuccessfulLogin(response);
    });

    /**
     * Test failed login using TestDataFactory for invalid credentials
     * @tags regression, api, auth
     */
    test.skip('failed login with TestDataFactory @regression @api @auth', async () => {
      // Using TestDataFactory to get randomly generated invalid credentials
      const credentials = TestDataFactory.getReqResCredentials('invalid');
      LogHelper.debug('Using invalid API credentials', credentials);

      const response = (await authAPI.login(credentials, {
        ignoreErrors: true,
      })) as CustomAPIResponse<LoginErrorResponse>;

      await authAPI.verifyFailedLogin(response);
    });
  });
});
