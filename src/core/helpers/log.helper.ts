/**
 * Utility class for logging messages with different severity levels
 *
 * @remarks
 * Provides static methods for logging information, errors, and debug messages.
 * Supports additional arguments for context and interpolation.
 *
 * @example
 * // Logging basic information
 * LogHelper.info('User logged in', { userId: '123' });
 *
 * @example
 * // Logging an error
 * LogHelper.error('Database connection failed', new Error('Connection timeout'));
 *
 * @example
 * // Debug logging (only visible when DEBUG=true)
 * LogHelper.debug('Detailed process information', { step: 'initialization' });
 */
export class LogHelper {
  /**
   * Logs an informational message
   *
   * @param message - The primary log message
   * @param args - Optional additional arguments for context or interpolation
   *
   * @remarks
   * Uses console.log with an [INFO] prefix for standard informational messages.
   *
   * @example
   * LogHelper.info('Operation started');
   * LogHelper.info('User created', { userId: '456', email: 'user@example.com' });
   */
  static info(message: string, ...args: unknown[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  /**
   * Logs an error message
   *
   * @param message - The error message description
   * @param args - Optional additional arguments such as error objects or context
   *
   * @remarks
   * Uses console.error with an [ERROR] prefix for error-level messages.
   *
   * @example
   * LogHelper.error('Payment processing failed');
   * LogHelper.error('Network error', new Error('Connection lost'), { endpoint: '/api/data' });
   */
  static error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Logs a debug message (conditionally)
   *
   * @param message - The debug message
   * @param args - Optional additional arguments for context
   *
   * @remarks
   * Only logs debug messages when the environment variable DEBUG is set to 'true'.
   * Useful for detailed logging during development or troubleshooting.
   *
   * @example
   * // This will only log if process.env.DEBUG === 'true'
   * LogHelper.debug('Detailed parsing information', { input: rawData });
   */
  static debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}
