/**
 * Login Page Object
 *
 * This class represents the Login page in the application and provides
 * methods to interact with its elements and perform authentication actions.
 * It follows the Page Object design pattern for better maintainability.
 */
import { BasePage } from '../../core/base/BasePage';
import { authSelectors } from '../selectors/auth.selectors';
import type { Page } from '@playwright/test';

export class LoginPage extends BasePage {
  /**
   * Creates a new LoginPage instance
   *
   * @param page - The Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to the login page
   *
   * @returns Promise that resolves when navigation is complete
   *
   * @example
   * await loginPage.goto();
   */
  async goto(): Promise<void> {
    await super.goto('/');
  }

  /**
   * Performs login with provided credentials
   *
   * Fills in the email and password fields, then submits the form
   *
   * @param email - The email or email to use
   * @param password - The password to use
   * @returns Promise that resolves when login attempt is complete
   *
   * @example
   * await loginPage.login('standard_user', 'secret_sauce');
   */
  async login(email: string, password: string): Promise<void> {
    await this.click(authSelectors.loginForm.signinButton);
    await this.page.waitForSelector(authSelectors.loginForm.emailInput, { timeout: 10000 });
    await this.fill(authSelectors.loginForm.emailInput, email);
    await this.fill(authSelectors.loginForm.password, password);
    await this.click(authSelectors.loginForm.submitButton);
  }

  /**
   * Gets the error message displayed after a failed login attempt
   *
   * @returns Promise that resolves to the error message text
   *
   * @example
   * const errorMessage = await loginPage.getErrorMessage();
   * console.log(`Login failed: ${errorMessage}`);
   */
  async getErrorMessage(): Promise<string> {
    const errorLocator = this.getLocator(authSelectors.loginForm.errorMessage);
    await this.assertions.shouldBeVisible(errorLocator);
    return this.getText(authSelectors.loginForm.errorMessage);
  }

  /**
   * Checks that the error message text matches the expected value
   * @param expectedText - expected error message text
   */
  async assertErrorMessage(expectedText: string): Promise<void> {
    const actualText = await this.getErrorMessage();
    if (actualText !== expectedText) {
      throw new Error(`Expected error message "${expectedText}", but got "${actualText}"`);
    }
  }
}
