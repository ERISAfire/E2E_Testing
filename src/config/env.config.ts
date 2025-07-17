import dotenv from 'dotenv';
import { Config } from '../core/types/config.types';

/**
 * Environment Configuration Management Class
 *
 * @remarks
 * Implements the Singleton pattern for managing application configuration
 * Loads environment variables from .env file
 * Provides type-safe access to configuration values
 *
 * @example
 * // Getting the configuration instance
 * const config = EnvConfig.getInstance();
 * const baseUrl = config.get('baseUrl');
 *
 * @example
 * // Checking environment variables on application startup
 * EnvConfig.checkEnvVariables();
 */
export class EnvConfig {
  /**
   * Singleton instance of EnvConfig
   * @private
   */
  private static instance: EnvConfig;

  /**
   * Parsed configuration object
   * @private
   */
  private config: Config;

  /**
   * Private constructor to enforce Singleton pattern
   *
   * @remarks
   * - Loads .env file using dotenv
   * - Initializes configuration by loading required environment variables
   */
  private constructor() {
    dotenv.config();
    this.config = this.loadConfig();
  }

  /**
   * Gets the singleton instance of EnvConfig
   *
   * @returns The singleton EnvConfig instance
   *
   * @remarks
   * Creates the instance if it doesn't exist, otherwise returns the existing instance
   *
   * @example
   * const config = EnvConfig.getInstance();
   */
  public static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  /**
   * Loads configuration from environment variables
   *
   * @returns Fully populated configuration object
   *
   * @throws {Error} If any required environment variable is missing
   *
   * @remarks
   * - Retrieves required environment variables
   * - Provides a default timeout if not specified
   *
   * @example
   * // Internally used to populate configuration
   * const config = this.loadConfig();
   */
  private loadConfig(): Config {
    const config: Config = {
      baseUrl: this.getRequiredEnv('BASE_URL'),
      apiBaseUrl: this.getRequiredEnv('API_BASE_URL'),
      defaultTimeout: Number(process.env.DEFAULT_TIMEOUT || 30000),
      credentials: {
        email: this.getRequiredEnv('USER_EMAIL'),
        password: this.getRequiredEnv('USER_PASSWORD'),
      },
      apiBearerToken: this.getRequiredEnv('API_BEARER_TOKEN'),
    };

    return config;
  }

  /**
   * Retrieves a required environment variable
   *
   * @param key - The name of the environment variable
   * @returns The value of the environment variable
   *
   * @throws {Error} If the environment variable is not set
   *
   * @remarks
   * Ensures that critical configuration variables are present
   *
   * @example
   * const baseUrl = this.getRequiredEnv('BASE_URL');
   */
  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is missing`);
    }
    return value;
  }

  /**
   * Returns the entire configuration object
   *
   * @returns The complete configuration
   *
   * @example
   * const fullConfig = config.getConfig();
   */
  public getConfig(): Config {
    return this.config;
  }

  /**
   * Retrieves a specific configuration value
   *
   * @template T - The type of the returned configuration value
   * @param key - Dot-notation key to access nested configuration values
   * @returns The value of the specified configuration key
   *
   * @throws {Error} If the configuration key is not found
   *
   * @remarks
   * Supports nested key access using dot notation
   *
   * @example
   * // Get top-level config
   * const baseUrl = config.get<string>('baseUrl');
   *
   * @example
   * // Get nested config
   * const email = config.get<string>('credentials.email');
   */
  public get<T>(key: keyof Config | string): T {
    const keys = key.split('.');
    // Use unknown as intermediate type instead of any
    let value: unknown = this.config;

    for (const k of keys) {
      // Type assertion is needed here because we're accessing properties dynamically
      value = (value as Record<string, unknown>)[k];
      if (value === undefined) {
        throw new Error(`Config key ${key} not found`);
      }
    }
    // Type assertion to T - user is responsible for providing correct type
    return value as T;
  }

  /**
   * Statically checks if all required environment variables are present
   *
   * @remarks
   * Useful for early validation of environment configuration
   * Triggers configuration loading, which will throw an error if any required variable is missing
   *
   * @example
   * // Call this method during application initialization
   * EnvConfig.checkEnvVariables();
   */
  public static checkEnvVariables(): void {
    const config = EnvConfig.getInstance();
    config.getConfig();
  }
}
