/**
 * Login Page Object
 *
 * This class represents the Login page in the application and provides
 * methods to interact with its elements and perform authentication actions.
 * It follows the Page Object design pattern for better maintainability.
 */
import { BasePage } from '../../core/base/BasePage.js';
import { EnvConfig } from '../../config/env.config.js';
import {
  getSignInButton,
  getEmailInput,
  getPasswordInput,
  getSubmitButton,
  getErrorMessage as getErrorMessageLocator,
  getForgotPasswordLink,
  getForgotPasswordEmailInput,
  getSendEmailButton,
  getSuccessMessage,
} from '../selectors/auth.selectors.js';
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
   * await loginPage.login('user@example.com', 'password');
   */
  async login(email: string, password: string): Promise<void> {
    if (!email || !password) {
      const env = EnvConfig.getInstance();
      const creds = env.get<{ email: string; password: string }>('credentials');
      email = email || creds.email;
      password = password || creds.password;
    }
    await (await getSignInButton(this.page)).click();
    await this.page.waitForSelector('[id="1-email"]', { timeout: 10000 });
    await (await getEmailInput(this.page)).fill(email);
    await (await getPasswordInput(this.page)).fill(password);
    await (await getSubmitButton(this.page)).click();
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
    const errorLocator = getErrorMessageLocator(this.page);
    await this.assertions.shouldBeVisible(errorLocator);
    return errorLocator.textContent() as Promise<string>;
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

  /**
   * Initiates the password reset process for a given email
   *
   * @param email - The email address to send the password reset to
   * @returns Promise that resolves when the password reset request is submitted
   *
   * @example
   * await loginPage.requestPasswordReset('user@example.com');
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Click on the login button to show the login form if needed
    await getSignInButton(this.page).click();

    // Click on the forgot password link
    await getForgotPasswordLink(this.page).click();

    // Fill in the email field
    await getForgotPasswordEmailInput(this.page).fill(email);

    // Click the send email button
    await getSendEmailButton(this.page).click();
  }

  /**
   * Gets the success message text after requesting a password reset
   *
   * @returns Promise that resolves to the success message text
   *
   * @example
   * const message = await loginPage.getPasswordResetSuccessMessage();
   */
  async getPasswordResetSuccessMessage(): Promise<string> {
    const messageLocator = getSuccessMessage(this.page);
    await this.assertions.shouldBeVisible(messageLocator);
    return messageLocator.textContent() as Promise<string>;
  }
}
