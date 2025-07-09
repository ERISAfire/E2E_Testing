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
     * Username/email input field
     */
    username: '[data-test="username"]',

    /**
     * Password input field
     */
    password: '[data-test="password"]',

    /**
     * Login submit button
     */
    submitButton: '[data-test="login-button"]',

    /**
     * Error message container that appears on failed login
     */
    errorMessage: '[data-test="error"]',
  },
};
