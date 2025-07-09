import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import type { CustomAPIResponse } from '../types/api.types';
import Ajv from 'ajv';

/**
 * Base UI Assertions Class for Playwright
 *
 * @remarks
 * Provides a set of common UI element assertion methods
 * Designed to simplify and standardize UI testing assertions
 *
 * @example
 * // Using BaseAssertions in a page object
 * class LoginPage {
 *   private assertions: BaseAssertions;
 *
 *   constructor(page: Page) {
 *     this.assertions = new BaseAssertions(page);
 *   }
 *
 *   async validateLoginButton() {
 *     await this.assertions.shouldBeVisible(this.loginButton);
 *     await this.assertions.shouldBeEnabled(this.loginButton);
 *   }
 * }
 */
export class BaseAssertions {
  /**
   * Constructor for BaseAssertions
   *
   * @param page - Playwright Page object for UI interactions
   */
  constructor(private readonly page: Page) {}

  /**
   * Asserts that an element is visible
   *
   * @param locator - Playwright Locator of the element
   * @param message - Optional custom error message
   *
   * @throws {Error} If the element is not visible
   *
   * @example
   * await assertions.shouldBeVisible(loginButton);
   * await assertions.shouldBeVisible(profileIcon, 'User profile icon should be visible');
   */
  async shouldBeVisible(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message || `Element should be visible`).toBeVisible();
  }

  /**
   * Asserts that an element has exactly the specified text
   *
   * @param locator - Playwright Locator of the element
   * @param text - Expected text content
   * @param message - Optional custom error message
   *
   * @throws {Error} If the element's text does not match exactly
   *
   * @example
   * await assertions.shouldHaveText(welcomeMessage, 'Welcome, John!');
   */
  async shouldHaveText(locator: Locator, text: string, message?: string): Promise<void> {
    await expect(locator, message || `Element should have text: ${text}`).toHaveText(text);
  }

  /**
   * Asserts that an element contains the specified text
   *
   * @param locator - Playwright Locator of the element
   * @param text - Text to check for
   * @param message - Optional custom error message
   *
   * @throws {Error} If the element does not contain the specified text
   *
   * @example
   * await assertions.shouldContainText(errorMessage, 'Invalid credentials');
   */
  async shouldContainText(locator: Locator, text: string, message?: string): Promise<void> {
    await expect(locator, message || `Element should contain text: ${text}`).toContainText(text);
  }

  /**
   * Asserts that an element is enabled
   *
   * @param locator - Playwright Locator of the element
   * @param message - Optional custom error message
   *
   * @throws {Error} If the element is not enabled
   *
   * @example
   * await assertions.shouldBeEnabled(submitButton);
   */
  async shouldBeEnabled(locator: Locator, message?: string): Promise<void> {
    await expect(locator, message || `Element should be enabled`).toBeEnabled();
  }
}

/**
 * API Assertions Class for Response Validation
 *
 * @remarks
 * Provides methods for validating API responses
 * Includes status code checks and JSON schema validation
 *
 * @example
 * // Using APIAssertions in an API test
 * class UserAPITest {
 *   private assertions: APIAssertions;
 *
 *   constructor() {
 *     this.assertions = new APIAssertions();
 *   }
 *
 *   async testUserCreation() {
 *     const response = await apiClient.createUser(userData);
 *     await this.assertions.shouldHaveSuccessStatus(response);
 *     await this.assertions.shouldMatchSchema(response.data, userSchema);
 *   }
 * }
 */
export class APIAssertions {
  /**
   * Ajv instance for JSON schema validation
   * @private
   */
  private ajv: Ajv;

  /**
   * Constructor initializes Ajv for JSON schema validation
   */
  constructor() {
    this.ajv = new Ajv();
  }

  /**
   * Asserts that the API response has a specific status code
   *
   * @param response - Custom API response object
   * @param status - Expected HTTP status code
   *
   * @throws {Error} If the status code does not match
   *
   * @example
   * await assertions.shouldHaveStatus(userResponse, 200);
   */
  async shouldHaveStatus(response: CustomAPIResponse<unknown>, status: number): Promise<void> {
    expect(response.status).toBe(status);
  }

  /**
   * Asserts that the API response has a success status code (200-299)
   *
   * @param response - Custom API response object
   *
   * @throws {Error} If the status code is not in the success range
   *
   * @example
   * await assertions.shouldHaveSuccessStatus(apiResponse);
   */
  async shouldHaveSuccessStatus(response: CustomAPIResponse<unknown>): Promise<void> {
    expect(response.status >= 200 && response.status <= 299).toBeTruthy();
  }

  /**
   * Validates response data against a JSON schema
   *
   * @param data - Data to validate
   * @param schema - JSON schema for validation
   *
   * @throws {Error} If the data does not match the schema
   *
   * @example
   * const userSchema = {
   *   type: 'object',
   *   properties: {
   *     id: { type: 'string' },
   *     name: { type: 'string' }
   *   },
   *   required: ['id', 'name']
   * };
   * await assertions.shouldMatchSchema(response.data, userSchema);
   */
  async shouldMatchSchema(data: unknown, schema: object): Promise<void> {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      throw new Error(`Schema validation failed: ${this.ajv.errorsText(validate.errors)}`);
    }
  }
}
