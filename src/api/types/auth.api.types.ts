/**
 * Represents a successful login response
 *
 * @remarks
 * Contains the authentication token returned after successful login
 *
 * @example
 * const successResponse: LoginSuccessResponse = {
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 * };
 */
export interface LoginSuccessResponse {
  /**
   * Authentication token
   *
   * @remarks
   * Typically a JSON Web Token (JWT) used for subsequent authenticated requests
   */
  token: string;
}

/**
 * Represents a login error response
 *
 * @remarks
 * Contains error information when login fails
 *
 * @example
 * const errorResponse: LoginErrorResponse = {
 *   error: 'Invalid credentials'
 * };
 */
export interface LoginErrorResponse {
  /**
   * Descriptive error message
   *
   * @remarks
   * Provides information about why the login attempt failed
   */
  error: string;
}

/**
 * Represents the login request payload
 *
 * @remarks
 * Contains the credentials required for authentication
 *
 * @example
 * const loginRequest: LoginRequest = {
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * };
 */
export interface LoginRequest {
  /**
   * User's email address
   *
   * @remarks
   * Used as the primary identifier for login
   */
  email: string;

  /**
   * User's password
   *
   * @remarks
   * Credentials for authentication
   */
  password: string;
}
