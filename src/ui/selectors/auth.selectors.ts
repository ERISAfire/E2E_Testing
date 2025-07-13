/**
 * Interface for a group of related selectors
 *
 * A collection of key-value pairs where each key is a semantic element name
 * and each value is a CSS selector string.
 */
interface Selector {
  [key: string]: string;
}

/**
 * Interface defining the structure of authentication selectors
 *
 * Contains groups of selectors for different authentication-related UI components.
 */
interface AuthSelectors {
  /**
   * Selectors for elements within the login form
   */
  loginForm: Selector;
}

/**
 * Authentication selectors
 *
 * Centralized collection of all selectors used for authentication UI components,
 * organized into logical groups for better maintainability.
 */
export const authSelectors: AuthSelectors = {
  loginForm: {
    /**
     * Signin button
     */
    signinButton: 'button.custom-btn.ls:has-text("Sign In")',

    /**
     * Email input field
     */
    emailInput: '[id="1-email"]',

    /**
     * Password input field
     */
    password: 'input[type="password"][name="password"].auth0-lock-input',

    /**
     * Login submit button
     */
    submitButton: 'button.auth0-lock-submit[name="submit"][type="submit"]',

    /**
     * Error message container that appears on failed login
     */
    errorMessage: '.auth0-global-message',
  },
};
