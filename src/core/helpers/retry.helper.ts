/**
 * Utility class for implementing retry mechanisms
 *
 * @remarks
 * Provides a static method to retry asynchronous operations
 * with configurable retry attempts and delay between retries.
 *
 * @example
 * // Example of retrying an API call
 * const fetchData = async () => {
 *   return RetryHelper.retryOperation(
 *     async () => {
 *       const response = await fetch('https://api.example.com/data');
 *       if (!response.ok) throw new Error('Fetch failed');
 *       return response.json();
 *     },
 *     3,  // max 3 retry attempts
 *     1000 // 1 second delay between retries
 *   );
 * };
 *
 * @example
 * // Example of retrying a database operation
 * const saveUser = async (userData) => {
 *   return RetryHelper.retryOperation(
 *     () => database.save(userData),
 *     5,  // max 5 retry attempts
 *     500 // 500ms delay between retries
 *   );
 * };
 */
export class RetryHelper {
  /**
   * Retries an asynchronous operation with configurable retry parameters
   *
   * @typeParam T - The return type of the operation
   *
   * @param operation - The async function to be retried
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @param delay - Delay between retry attempts in milliseconds (default: 1000)
   *
   * @returns A promise resolving to the result of the operation
   *
   * @throws {Error} - Throws the last encountered error if all retry attempts fail
   *
   * @remarks
   * - If the operation succeeds, it returns immediately
   * - If the operation fails, it will retry up to `maxRetries` times
   * - Between each retry, it waits for the specified `delay`
   * - If all retries fail, it throws the last encountered error
   *
   * @example
   * // Retry a potentially flaky network request
   * const result = await RetryHelper.retryOperation(
   *   () => axios.get('https://api.example.com/data'),
   *   3,   // try 3 times
   *   1000 // wait 1 second between attempts
   * );
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Log the error and retry attempt (optional, but recommended for debugging)
        console.warn(`Retry attempt ${attempt} failed:`, error);

        // Wait before next retry
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If all retries fail, throw the last encountered error
    throw lastError;
  }
}
