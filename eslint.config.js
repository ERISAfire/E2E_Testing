/**
 * ESLint Configuration
 *
 * This file configures ESLint for the project with TypeScript support.
 * It enforces code quality standards and prevents common errors.
 *
 * @see https://eslint.org/docs/latest/use/configure/
 * @see https://typescript-eslint.io/getting-started
 */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Include recommended ESLint rules
  eslint.configs.recommended,

  // Include recommended TypeScript-ESLint rules
  ...tseslint.configs.recommended,

  {
    /**
     * Define ignored file patterns
     */
    ignores: ['allure-report/**', 'allure-results/**', 'node_modules/**'],
  },

  {
    /**
     * Files to be linted
     */
    files: ['src/**/*.ts'],

    /**
     * Language options for TypeScript
     */
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        /**
         * Path to TypeScript configuration
         */
        project: './tsconfig.json',
      },
    },

    /**
     * Custom rule configuration
     */
    rules: {
      /**
       * Require explicit return types on functions and class methods
       * This improves type safety and documentation
       */
      '@typescript-eslint/explicit-function-return-type': 'error',

      /**
       * Disallow usage of the `any` type
       * Enforces proper typing throughout the codebase
       */
      '@typescript-eslint/no-explicit-any': 'error',

      /**
       * Report unused variables
       * Helps keep the codebase clean and efficient
       */
      '@typescript-eslint/no-unused-vars': 'error',
    },
  }
);
