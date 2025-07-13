/**
 * Factory for generating test data
 *
 * This class provides methods to generate various types of test data,
 * both static predefined data and dynamically generated random data.
 */
import { faker } from '@faker-js/faker';
import { UserData, Credentials } from '../core/types/test-data.types';
import { LoginRequest } from '../api/types/auth.api.types';

export class TestDataFactory {
  /**
   * Generates a user with random data
   *
   * @param overrides - Optional partial user data to override generated values
   * @returns Complete user data object
   *
   * @example
   * // Generate a basic random user
   * const user = TestDataFactory.generateUser();
   *
   * // Generate a user with specific email
   * const user = TestDataFactory.generateUser({ email: 'test@example.com' });
   */
  static generateUser(overrides: Partial<UserData> = {}): UserData {
    return {
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      ...overrides,
    };
  }

  /**
   * Generates credentials for SauceDemo website
   *
   * @param type - The type of user to generate credentials for
   * @returns Credentials object with email and password
   *
   * @example
   * // Get standard user credentials
   * const creds = TestDataFactory.getSauceCredentials('standard');
   *
   * // Get locked out user credentials
   * const creds = TestDataFactory.getSauceCredentials('locked');
   */
  static getSauceCredentials(
    type: 'standard' | 'locked' | 'problem' | 'performance' = 'standard'
  ): Credentials {
    const basePassword = 'secret_sauce';
    const userTypes: Record<string, string> = {
      standard: 'standard_user',
      locked: 'locked_out_user',
      problem: 'problem_user',
      performance: 'performance_glitch_user',
    };

    return {
      email: userTypes[type],
      password: basePassword,
    };
  }

  /**
   * Generates credentials for ReqRes API
   *
   * @param type - Whether to generate valid or invalid credentials
   * @returns LoginRequest object with email and password
   *
   * @example
   * // Get valid API credentials
   * const creds = TestDataFactory.getReqResCredentials('valid');
   *
   * // Get random invalid credentials
   * const creds = TestDataFactory.getReqResCredentials('invalid');
   */
  static getReqResCredentials(type: 'valid' | 'invalid' = 'valid'): LoginRequest {
    if (type === 'valid') {
      return {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka',
      };
    }

    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
  }

  /**
   * Generates a list of random users
   *
   * @param count - Number of users to generate, defaults to 5
   * @returns Array of UserData objects
   *
   * @example
   * // Generate 10 random users
   * const users = TestDataFactory.generateUserList(10);
   */
  static generateUserList(count: number = 5): UserData[] {
    return Array.from({ length: count }, () => this.generateUser());
  }
}
