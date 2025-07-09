import { APIAssertions } from './BaseAssertions';
import type {
  HttpMethod,
  CustomAPIOptions,
  CustomAPIResponse,
  APIClient,
} from '../types/api.types';

/**
 * Base API Class for Standardized HTTP Request Handling
 *
 * @remarks
 * Provides a robust, generic implementation for making HTTP requests
 * Supports various HTTP methods with flexible configuration options
 * Includes built-in response parsing, error handling, and schema validation
 *
 * @example
 * // Extending BaseAPI for a specific service
 * export class UserAPI extends BaseAPI {
 *   async getUser(id: string): Promise<CustomAPIResponse<User>> {
 *     return this.get<User>(`/users/${id}`);
 *   }
 *
 *   async createUser(userData: CreateUserDto): Promise<CustomAPIResponse<User>> {
 *     return this.post<User>('/users', userData, {
 *       extraHeaders: { 'Authorization': 'Bearer token' },
 *       schema: userValidationSchema
 *     });
 *   }
 * }
 */
export class BaseAPI {
  /**
   * API Assertions utility for response validation
   *
   * @remarks
   * Provides methods for validating API responses
   */
  protected assertions: APIAssertions;

  /**
   * Constructor for BaseAPI
   *
   * @param client - API Client configuration with request context and base URL
   *
   * @remarks
   * Initializes the base API with a client and creates an assertions instance
   */
  constructor(private readonly client: APIClient) {
    this.assertions = new APIAssertions();
  }

  /**
   * Internal method to make HTTP requests with advanced configuration
   *
   * @typeParam T - The expected type of the response data
   *
   * @param method - HTTP method to use
   * @param endpoint - API endpoint path
   * @param body - Optional request body
   * @param options - Optional request configuration
   *
   * @returns Parsed API response with status, data, headers, and content type
   *
   * @throws {Error} For unsupported methods, parsing errors, or failed requests
   *
   * @remarks
   * - Automatically adds Content-Type header
   * - Supports custom headers and options
   * - Handles JSON and non-JSON responses
   * - Optional schema validation
   * - Configurable error handling
   *
   * @example
   * // Advanced request with custom headers and schema validation
   * const response = await this.makeRequest<User>('POST', '/users', userData, {
   *   extraHeaders: { 'X-Custom-Header': 'value' },
   *   schema: userValidationSchema,
   *   ignoreErrors: false
   * });
   */
  private async makeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options: CustomAPIOptions = {}
  ): Promise<CustomAPIResponse<T>> {
    const url = `${this.client.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.extraHeaders,
    };

    const requestOptions = {
      headers,
      data: body,
    };

    let response;
    switch (method) {
      case 'GET':
        response = await this.client.request.get(url, requestOptions);
        break;
      case 'POST':
        response = await this.client.request.post(url, requestOptions);
        break;
      case 'PUT':
        response = await this.client.request.put(url, requestOptions);
        break;
      case 'PATCH':
        response = await this.client.request.patch(url, requestOptions);
        break;
      case 'DELETE':
        response = await this.client.request.delete(url, requestOptions);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    const status = response.status();
    const responseHeaders = response.headers();
    const contentType = responseHeaders['content-type'] || '';

    let data: T;
    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
        if (options.schema) {
          await this.assertions.shouldMatchSchema(data, options.schema);
        }
      } else {
        const rawText = await response.text();
        data = `\`\`\`\n${rawText}\n\`\`\`` as T;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse response: ${error.message}`);
      }
      throw error;
    }

    if (!response.ok() && !options.ignoreErrors) {
      throw new Error(`API ${method} request failed: ${response.statusText()}`);
    }

    return {
      status,
      data,
      contentType,
      headers: responseHeaders,
    };
  }

  /**
   * Performs a GET request
   *
   * @typeParam T - The expected type of the response data
   *
   * @param endpoint - API endpoint path
   * @param options - Optional request configuration
   *
   * @returns Parsed API response
   *
   * @example
   * const users = await this.get<User[]>('/users');
   */
  protected async get<T>(
    endpoint: string,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, options);
  }

  /**
   * Performs a POST request
   *
   * @typeParam T - The expected type of the response data
   *
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Optional request configuration
   *
   * @returns Parsed API response
   *
   * @example
   * const newUser = await this.post<User>('/users', userData);
   */
  protected async post<T>(
    endpoint: string,
    body?: unknown,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, body, options);
  }

  /**
   * Performs a PUT request
   *
   * @typeParam T - The expected type of the response data
   *
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Optional request configuration
   *
   * @returns Parsed API response
   *
   * @example
   * const updatedUser = await this.put<User>('/users/123', userData);
   */
  protected async put<T>(
    endpoint: string,
    body?: unknown,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, body, options);
  }

  /**
   * Performs a PATCH request
   *
   * @typeParam T - The expected type of the response data
   *
   * @param endpoint - API endpoint path
   * @param body - Request body
   * @param options - Optional request configuration
   *
   * @returns Parsed API response
   *
   * @example
   * const partialUpdate = await this.patch<User>('/users/123', { name: 'New Name' });
   */
  protected async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, body, options);
  }

  /**
   * Performs a DELETE request
   *
   * @typeParam T - The expected type of the response data
   *
   * @param endpoint - API endpoint path
   * @param options - Optional request configuration
   *
   * @returns Parsed API response
   *
   * @example
   * const deleteResult = await this.delete<void>('/users/123');
   */
  protected async delete<T>(
    endpoint: string,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, options);
  }
}
