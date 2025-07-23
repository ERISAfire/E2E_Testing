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
    signinButton: 'button:has-text("Log in")',
    emailInput: '[id="1-email"]',
    password: 'input[type="password"][name="password"].auth0-lock-input',
    submitButton: 'button.auth0-lock-submit[name="submit"][type="submit"]',
    errorMessage: '.auth0-global-message',
  },
};
