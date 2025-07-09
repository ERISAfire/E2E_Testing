import { BaseAPI } from '../../core/base/BaseAPI';
import { expect } from '@playwright/test';
import type { APIClient, CustomAPIResponse, CustomAPIOptions } from '../../core/types/api.types';
import { authSchemas } from '../schemas/auth.schemas';
import type {
  LoginRequest,
  LoginSuccessResponse,
  LoginErrorResponse,
} from '../types/auth.api.types';

/**
 * Authentication API Service
 *
 * @remarks
 * Provides methods for handling authentication-related API interactions
 * Extends BaseAPI to leverage standardized API request handling
 *
 * @example
 * // Creating an instance of AuthAPI
 * const authApi = new AuthAPI(apiClient);
 *
 * @example
 * // Performing a login
 * const loginResponse = await authApi.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 */
export class AuthAPI extends BaseAPI {
  /**
   * Constructor for AuthAPI
   *
   * @param client - API Client configuration
   *
   * @remarks
   * Initializes the AuthAPI with the provided API client
   */
  constructor(client: APIClient) {
    super(client);
  }

  /**
   * Performs a login request
   *
   * @param data - Login credentials
   * @param options - Optional API request configuration
   *
   * @returns A promise resolving to the login response
   *
   * @remarks
   * - Sends a POST request to the login endpoint
   * - Dynamically selects schema based on error handling configuration
   * - Supports custom request options
   *
   * @example
   * // Successful login
   * const successResponse = await authApi.login({
   *   email: 'valid@example.com',
   *   password: 'correctpassword'
   * });
   *
   * @example
   * // Login with custom options
   * const response = await authApi.login(
   *   { email: 'user@example.com', password: 'password' },
   *   {
   *     extraHeaders: { 'X-Custom-Header': 'value' },
   *     ignoreErrors: true
   *   }
   * );
   */
  async login(
    data: LoginRequest,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<LoginSuccessResponse | LoginErrorResponse>> {
    return this.post<LoginSuccessResponse | LoginErrorResponse>('/login', data, {
      schema: options?.ignoreErrors ? authSchemas.loginError : authSchemas.loginSuccess,
      ...options,
    });
  }

  /**
   * Verifies a successful login response
   *
   * @param response - The login API response
   *
   * @throws {Error} If the response does not meet success criteria
   *
   * @remarks
   * Performs comprehensive validations on a successful login response:
   * - Checks HTTP status code
   * - Validates response schema
   * - Ensures a token is present
   *
   * @example
   * const loginResponse = await authApi.login(credentials);
   * await authApi.verifySuccessfulLogin(loginResponse);
   */
  async verifySuccessfulLogin(response: CustomAPIResponse<LoginSuccessResponse>): Promise<void> {
    await this.assertions.shouldHaveStatus(response, 200);
    await this.assertions.shouldMatchSchema(response.data, authSchemas.loginSuccess);
    expect(response.data.token).toBeTruthy();
  }

  /**
   * Verifies a failed login response
   *
   * @param response - The login API response
   *
   * @throws {Error} If the response does not meet error criteria
   *
   * @remarks
   * Performs comprehensive validations on a failed login response:
   * - Checks HTTP status code
   * - Validates error response schema
   * - Ensures an error message is present
   *
   * @example
   * const loginResponse = await authApi.login(invalidCredentials);
   * await authApi.verifyFailedLogin(loginResponse);
   */
  async verifyFailedLogin(response: CustomAPIResponse<LoginErrorResponse>): Promise<void> {
    await this.assertions.shouldHaveStatus(response, 401);
    await this.assertions.shouldMatchSchema(response.data, authSchemas.loginError);
    expect(response.data.error).toBeTruthy();
  }
}
