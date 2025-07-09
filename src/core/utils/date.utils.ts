/**
 * Date Utility Methods
 *
 * This class provides utility methods for date manipulation and formatting.
 *
 * @remarks
 * The methods in this class are static and can be used without instantiating the class.
 *
 * @example
 * // Get current date in default format
 * const currentDate = DateUtils.getCurrentDateFormatted();
 *
 * // Add days to a specific date
 * const futureDate = DateUtils.addDays(new Date(), 7);
 */
export class DateUtils {
  /**
   * Gets the current date formatted as a string
   *
   * @param format - The desired date format (default: 'YYYY-MM-DD')
   * @returns A string representation of the current date
   *
   * @example
   * // Get current date in ISO format (e.g., '2025-02-24')
   * const todayDate = DateUtils.getCurrentDateFormatted();
   *
   * @example
   * // Get current date in custom format (e.g., '24/02/2025')
   * const customFormat = DateUtils.getCurrentDateFormatted('DD/MM/YYYY');
   */
  static getCurrentDateFormatted(format: string = 'YYYY-MM-DD'): string {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    // Replace format tokens with actual values
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('M', (now.getMonth() + 1).toString())
      .replace('D', now.getDate().toString());
  }

  /**
   * Adds a specified number of days to a given date
   *
   * @param date - The starting date
   * @param days - Number of days to add (can be positive or negative)
   * @returns A new Date object with days added
   *
   * @throws {TypeError} If date is not a valid Date object
   *
   * @example
   * // Add 7 days to the current date
   * const futureDate = DateUtils.addDays(new Date(), 7);
   *
   * @example
   * // Subtract 3 days from a specific date
   * const pastDate = DateUtils.addDays(new Date('2025-01-15'), -3);
   */
  static addDays(date: Date, days: number): Date {
    if (!(date instanceof Date)) {
      throw new TypeError('First argument must be a Date object');
    }

    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
