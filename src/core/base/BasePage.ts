import type { Page, Locator } from '@playwright/test';
import { BaseAssertions } from './BaseAssertions';
import { EnvConfig } from '../../config/env.config';

/**
 * Base Page class for Playwright-based page object model
 *
 * @remarks
 * Provides common web page interaction methods and utilities
 * Serves as a base class for specific page object implementations
 *
 * @example
 * // Extending BasePage for a specific page
 * export class LoginPage extends BasePage {
 *   async login(email: string, password: string) {
 *     await this.fill('#email', email);
 *     await this.fill('#password', password);
 *     await this.click('#loginButton');
 *   }
 * }
 */
export class BasePage {
  /**
   * Assertions utility for page-level verifications
   *
   * @remarks
   * Provides common assertion methods for page interactions
   */
  protected assertions: BaseAssertions;

  /**
   * Constructor for BasePage
   *
   * @param page - Playwright Page object for browser interactions
   *
   * @remarks
   * Initializes the page and creates an assertions instance
   */
  constructor(protected readonly page: Page) {
    this.assertions = new BaseAssertions(page);
  }

  /**
   * Navigates to a specified page URL
   *
   * @param path - URL path to navigate to (default: '/')
   *
   * @remarks
   * Uses environment configuration to construct the full URL
   *
   * @example
   * // Navigate to the home page
   * await basePage.goto();
   *
   * @example
   * // Navigate to a specific page
   * await basePage.goto('/dashboard');
   */
  async goto(path: string = '/'): Promise<void> {
    const env = EnvConfig.getInstance();
    await this.page.goto(`${env.getConfig().baseUrl}${path}`);
  }

  /**
   * Clicks on an element
   *
   * @param selector - CSS or XPath selector for the element
   *
   * @remarks
   * Protected method for internal page interactions
   *
   * @example
   * // Click a login button
   * await this.click('#loginButton');
   */
  protected async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Fills an input element with a value
   *
   * @param selector - CSS or XPath selector for the input
   * @param value - Value to fill into the input
   *
   * @remarks
   * Protected method for internal page interactions
   *
   * @example
   * // Fill email input
   * await this.fill('#email', 'testuser');
   */
  protected async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Retrieves text content of an element
   *
   * @param selector - CSS or XPath selector for the element
   * @returns Text content of the element or empty string
   *
   * @remarks
   * Returns an empty string if no text content is found
   *
   * @example
   * // Get text of an error message
   * const errorText = await this.getText('.error-message');
   */
  protected async getText(selector: string): Promise<string> {
    return (await this.page.textContent(selector)) || '';
  }

  /**
   * Creates a Locator for an element
   *
   * @param selector - CSS or XPath selector
   * @returns Playwright Locator for the element
   *
   * @remarks
   * Useful for more advanced element interactions
   *
   * @example
   * // Get a locator for further interactions
   * const buttonLocator = this.getLocator('#submitButton');
   */
  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Waits for a specific selector to be present in the DOM
   *
   * @param selector - CSS or XPath selector to wait for
   *
   * @remarks
   * Blocks execution until the selector is found
   *
   * @example
   * // Wait for a loading spinner
   * await this.waitForSelector('.loading-spinner');
   */
  protected async waitForSelector(selector: string): Promise<void> {
    await this.page.waitForSelector(selector);
  }

  /**
   * Waits for a network response matching a specific URL pattern
   *
   * @param urlPattern - URL or RegExp to match against network responses
   *
   * @remarks
   * Useful for waiting on API calls or resource loading
   *
   * @example
   * // Wait for a specific API endpoint response
   * await this.waitForResponse(/\/api\/users/);
   */
  protected async waitForResponse(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse(urlPattern);
  }
}
