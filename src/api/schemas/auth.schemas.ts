/**
 * JSON Schema definitions for authentication responses
 *
 * @remarks
 * Provides validation schemas for successful and error login responses
 * Used with Ajv for runtime JSON schema validation
 *
 * @example
 * // Using schema for successful login validation
 * const validate = ajv.compile(authSchemas.loginSuccess);
 * const isValid = validate(loginResponse);
 */
export const authSchemas = {
  /**
   * JSON Schema for successful login response
   *
   * @remarks
   * Validates that the response contains a token
   * - Requires a 'token' property
   * - Token must be a string
   *
   * @example
   * // Valid successful login response
   * {
   *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   * }
   */
  loginSuccess: {
    type: 'object',
    required: ['token'],
    properties: {
      /**
       * Authentication token
       *
       * @remarks
       * Must be a non-empty string
       * Typically a JSON Web Token (JWT)
       */
      token: { type: 'string' },
    },
  },

  /**
   * JSON Schema for login error response
   *
   * @remarks
   * Validates that the error response contains an error message
   * - Requires an 'error' property
   * - Error must be a string
   *
   * @example
   * // Valid login error response
   * {
   *   error: 'Invalid credentials'
   * }
   */
  loginError: {
    type: 'object',
    required: ['error'],
    properties: {
      /**
       * Error message describing login failure
       *
       * @remarks
       * Must be a non-empty string
       * Provides context for why the login was unsuccessful
       */
      error: { type: 'string' },
    },
  },
};
