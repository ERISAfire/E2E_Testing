/**
 * Configuration interface for application settings
 *
 * @remarks
 * This interface defines the core configuration parameters
 * used across the application, including base URLs,
 * default timeout, and authentication credentials.
 *
 * @example
 * const appConfig: Config = {
 *   baseUrl: 'https://myapp.com',
 *   apiBaseUrl: 'https://api.myapp.com/v1',
 *   defaultTimeout: 5000,
 *   credentials: {
 *     email: 'admin',
 *     password: 'securePassword123'
 *   }
 * };
 */
export interface Config {
  /**
   * Base URL for the main application
   *
   * @remarks
   * Typically used for routing and navigation purposes
   */
  baseUrl: string;

  /**
   * Base URL for API endpoints
   *
   * @remarks
   * Used for making API calls and service requests
   */
  apiBaseUrl: string;

  /**
   * Default timeout for API requests in milliseconds
   *
   * @remarks
   * Specifies how long to wait before canceling a request
   *
   * @defaultValue 5000 (5 seconds)
   */
  defaultTimeout: number;

  /**
   * Authentication credentials for the application
   *
   * @remarks
   * Contains email and password for authentication
   */
  credentials: {
    /** email for authentication */
    email: string;

    /** Password for authentication */
    password: string;
  };
}
