/**
 * Represents the core user data structure
 *
 * @remarks
 * This interface contains essential information about a user.
 * It can be used across various application contexts for user representation.
 *
 * @example
 * const user: UserData = {
 *   id: 'user123',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john.doe@example.com',
 *   age: 30
 * };
 */
export interface UserData {
  /** Unique identifier for the user */
  id: string;

  /** User's first name */
  firstName: string;

  /** User's last name */
  lastName: string;

  /** User's email address */
  email: string;

  /** User's age in years */
  age: number;
}

/**
 * Represents basic authentication credentials
 *
 * @remarks
 * A generic interface for login credentials with email and password.
 *
 * @example
 * const loginCredentials: Credentials = {
 *   email: 'johndoe',
 *   password: 'securePassword123'
 * };
 */
export interface Credentials {
  /** email for authentication */
  email: string;

  /** Password for authentication */
  password: string;
}

/**
 * Represents API authentication credentials
 *
 * @remarks
 * Specific interface for API-based authentication using email and password.
 *
 * @example
 * const apiLogin: ApiCredentials = {
 *   email: 'user@example.com',
 *   password: 'apiPassword456'
 * };
 */
export interface ApiCredentials {
  /** Email address used for API authentication */
  email: string;

  /** Password for API authentication */
  password: string;
}

/**
 * Specialized credentials for Sauce Demo authentication
 *
 * @remarks
 * Extends basic Credentials with a specific user type for testing purposes.
 * Used in Sauce Demo testing scenarios with different user account types.
 *
 * @example
 * const standardUser: SauceDemoCredentials = {
 *   email: 'standard_user',
 *   password: 'secret_sauce',
 *   type: 'standard'
 * };
 */
export interface SauceDemoCredentials extends Credentials {
  /**
   * Type of Sauce Demo user account
   *
   * @remarks
   * - 'standard': Normal user account
   * - 'locked': Account with login restrictions
   * - 'problem': User account with potential issues
   * - 'performance': User account with performance testing characteristics
   */
  type: 'standard' | 'locked' | 'problem' | 'performance';
}

/**
 * Specialized credentials for ReqRes API authentication
 *
 * @remarks
 * Extends API credentials with a validation type for testing API endpoints.
 *
 * @example
 * const validUser: ReqResCredentials = {
 *   email: 'eve.holt@reqres.in',
 *   password: 'cityslicka',
 *   type: 'valid'
 * };
 */
export interface ReqResCredentials extends ApiCredentials {
  /**
   * Validation status of the credentials
   *
   * @remarks
   * - 'valid': Credentials that pass authentication
   * - 'invalid': Credentials that fail authentication
   */
  type: 'valid' | 'invalid';
}
