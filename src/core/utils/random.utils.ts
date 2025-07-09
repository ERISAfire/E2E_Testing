import { StringUtils } from './string.utils';

/**
 * Random Utility Methods
 *
 * This class provides utility methods for generating random values.
 * It includes methods for generating random numbers and random email addresses.
 *
 * @remarks
 * The methods in this class are static and can be used without instantiating the class.
 *
 * @example
 * // Generate a random number between 1 and 100
 * const randomNum = RandomUtils.getRandomNumber(1, 100);
 *
 * // Generate a random email address
 * const randomEmail = RandomUtils.getRandomEmail();
 */
export class RandomUtils {
  /**
   * Generates a random number within a specified range (inclusive)
   *
   * @param min - The minimum value of the range
   * @param max - The maximum value of the range
   * @returns A random integer between min and max (inclusive)
   *
   * @throws {Error} If min is greater than max
   *
   * @example
   * // Generate a random number between 1 and 10
   * const randomNum = RandomUtils.getRandomNumber(1, 10);
   *
   * @example
   * // Generate a random number between -5 and 5
   * const randomNum = RandomUtils.getRandomNumber(-5, 5);
   */
  static getRandomNumber(min: number, max: number): number {
    if (min > max) {
      throw new Error('Minimum value must be less than or equal to maximum value');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a random email address
   *
   * @returns A randomly generated email address with an example.com domain
   *
   * @remarks
   * The email username is generated using {@link StringUtils.generateRandomString}
   *
   * @example
   * // Generate a random email address
   * const randomEmail = RandomUtils.getRandomEmail();
   * // Possible result: 'x7f2hk3q@example.com'
   */
  static getRandomEmail(): string {
    const username = StringUtils.generateRandomString(8);
    return `${username}@example.com`;
  }
}
