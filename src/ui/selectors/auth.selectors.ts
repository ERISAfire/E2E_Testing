import { Page, Locator } from '@playwright/test';

/**
 * Authentication selectors
 *
 * Centralized collection of all selectors used for authentication UI components,
 * organized into logical groups for better maintainability.
 */
export const getSignInButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Log in' });

export const getEmailInput = (page: Page): Locator => page.locator('[id="1-email"]');

export const getPasswordInput = (page: Page): Locator =>
  page.locator('input[type="password"][name="password"].auth0-lock-input');

export const getSubmitButton = (page: Page): Locator =>
  page.locator('button.auth0-lock-submit[name="submit"][type="submit"]');

export const getErrorMessage = (page: Page): Locator => page.locator('.auth0-global-message');

export const getForgotPasswordLink = (page: Page): Locator =>
  page.getByRole('link', { name: "Don't remember your password?" });

export const getForgotPasswordEmailInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Email' });

export const getSendEmailButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Send email' });

export const getSuccessMessage = (page: Page): Locator => page.locator('.auth0-global-message');
