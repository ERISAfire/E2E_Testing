import { APIRequestContext } from '@playwright/test';

/**
 * Represents the HTTP methods supported for API requests
 *
 * @remarks
 * Defines the standard HTTP methods used in RESTful API interactions.
 *
 * @example
 * const method: HttpMethod = 'GET';
 * const postMethod: HttpMethod = 'POST';
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Additional configuration options for API requests
 *
 * @remarks
 * Provides flexibility in API request configuration with optional parameters.
 *
 * @example
 * const options: CustomAPIOptions = {
 *   extraHeaders: { 'Authorization': 'Bearer token123' },
 *   ignoreErrors: false,
 *   schema: { type: 'object', properties: { id: { type: 'string' } } }
 * };
 */
export interface CustomAPIOptions {
  /**
   * Additional headers to be sent with the request
   *
   * @remarks
   * Allows adding custom HTTP headers to the API request
   */
  extraHeaders?: Record<string, string>;

  /**
   * Flag to determine error handling behavior
   *
   * @remarks
   * When set to true, the request will not throw an error on non-200 status codes
   *
   * @defaultValue false
   */
  ignoreErrors?: boolean;

  /**
   * JSON schema for response validation
   *
   * @remarks
   * Optional schema to validate the structure of the API response
   */
  schema?: object;
}

/**
 * Standardized API response structure
 *
 * @typeParam T - The type of the response data
 *
 * @remarks
 * Provides a generic, consistent response format for API calls
 *
 * @example
 * const response: CustomAPIResponse<User> = {
 *   status: 200,
 *   data: { id: '123', name: 'John Doe' },
 *   contentType: 'application/json',
 *   headers: { 'Cache-Control': 'no-cache' }
 * };
 */
export interface CustomAPIResponse<T> {
  /**
   * HTTP status code of the response
   *
   * @remarks
   * Indicates the result of the API request
   */
  status: number;

  /**
   * Parsed response data
   *
   * @remarks
   * The body of the API response, typed generically
   */
  data: T;

  /**
   * Content type of the response
   *
   * @remarks
   * Optional field describing the MIME type of the response
   */
  contentType?: string;

  /**
   * Response headers
   *
   * @remarks
   * Optional field containing HTTP response headers
   */
  headers?: Record<string, string>;
}

/**
 * API client configuration interface
 *
 * @remarks
 * Provides the core components for making API requests
 *
 * @example
 * const apiClient: APIClient = {
 *   request: playwrightRequestContext,
 *   baseURL: 'https://api.example.com/v1'
 * };
 */
export interface APIClient {
  /**
   * Playwright's API request context
   *
   * @remarks
   * Used for making HTTP requests in Playwright test environments
   */
  request: APIRequestContext;

  /**
   * Base URL for API requests
   *
   * @remarks
   * The root URL to which all API endpoints will be appended
   */
  baseURL: string;
}
