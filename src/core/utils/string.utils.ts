/**
 * String Utility Methods
 *
 * This class provides utility methods for string manipulation and generation.
 */
export class StringUtils {
  /**
   * Generates a random alphanumeric string of specified length
   *
   * @param length - The length of the string to generate (default: 10)
   * @returns Random alphanumeric string
   *
   * @example
   * // Generate a random string of default length (10)
   * const randomStr = StringUtils.generateRandomString();
   *
   * // Generate a random string of length 5
   * const shortRandomStr = StringUtils.generateRandomString(5);
   */
  static generateRandomString(length: number = 10): string {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  }

  /**
   * Capitalizes the first letter of a string
   *
   * @param str - The input string to capitalize
   * @returns String with first letter capitalized
   *
   * @example
   * const capitalized = StringUtils.capitalizeFirstLetter('hello');
   * // Result: 'Hello'
   */
  static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
