# Test Automation Framework

## 🚀 Overview

This comprehensive test automation framework is designed for robust end-to-end testing of web applications, leveraging Playwright, TypeScript, and best practices in test automation. It uses a feature-based test organization approach with support for multiple test types per feature.

## ✨ Key Features

- **Feature-Based Test Organization**

  - Tests organized by feature/page instead of test type
  - Support for UI, API, Integration, and E2E tests per feature
  - Comprehensive tag-based filtering

- **Robust Test Architecture**

  - Page Object Pattern for UI
  - API client architecture
  - Custom base test with automatic Allure attachments
  - Comprehensive helper utilities

- **Technology Stack**
  - Playwright
  - TypeScript
  - Allure Reporting
  - ESLint & Prettier with Pre-commit Hooks
  - Faker for Test Data Generation

## 📋 Prerequisites

- Node.js (v22+ recommended)
- npm (v10+)

## 🔧 Installation

1. Clone the repository

```bash
git clone https://github.com/ERISAfire/E2E_Testing.git
```

2. Install dependencies

```bash
npm install
```

3. Install Playwright browsers

```bash
npx playwright install
```

4. Create a `.env` file based on `.env.example`

```bash
cp .env.example .env
```

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Specific Test Types

```bash
# Smoke Tests
npm run test:smoke

# Regression Tests
npm run test:regression

# API Tests
npm run test:api

# UI Tests
npm run test:ui

# Critical Path Tests
npm run test:critical

# Negative Tests
npm run test:negative
```

## 🔍 Test Filtering

Tests can be filtered using tags within test names:

```typescript
// Test with multiple tags
test('successful login @smoke @regression @critical @ui @auth', async () => {
  // Test code
});
```

Use grep to run specific tests:

```bash
# Run tests with @smoke tag
npx playwright test --grep @smoke

# Run tests with both @smoke and @api tags
npx playwright test --grep "@smoke.*@api"
```

## 📊 Reporting

### Generate Allure Report

```bash
npm run allure:serve    # Open interactive report
npm run allure:static   # Generate static report
```

## 🔄 CI/CD Integration

The framework includes GitHub Actions workflows for continuous integration and automated testing:

### Configurable Test Runner Workflow

The main workflow allows running tests with customizable parameters:

```yaml
name: Test Automation Framework CI/CD

on:
  workflow_dispatch:
    inputs:
      testTags:
        description: 'Tags to run (e.g. @smoke, @regression, @api, @ui, @critical, @auth)'
        required: true
        default: '@smoke'
        type: string
      branch:
        description: 'Branch to run tests from'
        required: true
        default: 'main'
        type: string

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          ref: ${{ github.event.inputs.branch }}

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Create .env file
        run: |
          cat > .env << EOF
          BASE_URL=${{ secrets.BASE_URL }}
          API_BASE_URL=${{ secrets.API_BASE_URL }}
          USER_EMAIL=${{ secrets.USER_EMAIL }}
          USER_PASSWORD=${{ secrets.USER_PASSWORD }}
          DEFAULT_TIMEOUT=30000
          API_TIMEOUT=10000
          EOF

      - name: Run tests with selected tags
        run: npx playwright test --grep "${{ github.event.inputs.testTags }}"

      - name: Generate Allure Report
        if: always()
        run: npm run allure:static

      - name: Publish Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: allure-report/
          retention-days: 30
```

### Automated Weekly Regression

A scheduled workflow runs the full regression suite every Monday:

```yaml
name: Weekly Regression Tests

on:
  schedule:
    # Run at 01:00 UTC every Monday
    - cron: '0 1 * * 1'
  workflow_dispatch: # Also allow manual triggering

jobs:
  regression:
    name: Run Regression Tests
    runs-on: ubuntu-latest
    timeout-minutes: 180

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        with:
          ref: 'main'

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Create .env file
        run: |
          cat > .env << EOF
          BASE_URL=${{ secrets.BASE_URL }}
          API_BASE_URL=${{ secrets.API_BASE_URL }}
          USER_EMAIL=${{ secrets.USER_EMAIL }}
          USER_PASSWORD=${{ secrets.USER_PASSWORD }}
          DEFAULT_TIMEOUT=30000
          API_TIMEOUT=10000
          EOF

      - name: Run regression tests
        run: |
          npm run allure:clean
          npx playwright test --grep @regression
        timeout-minutes: 120

      - name: Generate Allure Report
        if: always()
        run: npm run allure:static

      - name: Publish Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: regression-results
          path: allure-report/
          retention-days: 30
```

### CI/CD Features

- **Flexible Test Execution**

  - Run specific test suites using tags
  - Select branch for testing
  - Manual and scheduled runs supported

- **Secure Environment Configuration**

  - Sensitive information stored as GitHub Secrets
  - Dynamic `.env` file generation

- **Comprehensive Reporting**

  - Allure reports generated for all test runs
  - Test artifacts retained for 30 days
  - Reports available even when tests fail

- **Resource Optimization**
  - Timeout limits to prevent runaway workflows
  - Browser dependencies installed automatically

## 🛠 Project Structure

```
src/
├── config/
│   └── env.config.ts   # Environment configuration
│
├── core/
│   ├── base/
│   │   ├── BasePage.ts         # Base page object
│   │   ├── BaseAPI.ts          # Base API client
│   ├── utils/         # Utility functions
│   └── types/         # Core type definitions
│
├── factories/
│   └── test-data.factory.ts  # Test data generation
│
├── tests/              # Feature-based test organization
│   ├── auth/           # Authentication tests
│   │   ├── auth.api.spec.ts
│   │   ├── auth.ui.spec.ts
│   └── appsettings/       # Product-related tests
│       ├── coverageAttribute.api.spec.ts
│       ├── coverageType.ui.spec.ts
│       └── ...
│
└── ui/
    ├── pages/          # Page objects
    └── selectors/      # UI element selectors
```

## 💻 Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Type Checking

```bash
npm run compile
```

## 🔄 Pre-commit Hooks

The framework uses pre-commit hooks to automatically check and format code before committing. This helps maintain consistent code style and prevent common errors.

### Configured Checks

The following checks run automatically on each commit:

- **ESLint** - checks JavaScript/TypeScript code for errors and style issues
- **Prettier** - formats code according to configured rules

### Configuration Details

Pre-commit is configured using:

- **husky** - for Git hooks integration
- **lint-staged** - for running linters only on changed files

### Setup

If you've just cloned the repository, pre-commit hooks should be set up automatically when you run `npm install`.

To verify hooks are working, make any change and try to commit it.

### Manual Checks

You can manually run checks on all project files:

```bash
# ESLint check
npx eslint "**/*.{js,jsx,ts,tsx}"

# Prettier formatting
npx prettier --write "**/*.{js,jsx,ts,tsx,json,yml,yaml,css,scss,md}"

```

### Bypassing Checks

In exceptional cases, you can bypass pre-commit hooks using the `--no-verify` option:

```bash
git commit -m "Your message" --no-verify
```

However, it's recommended to use this option only in extreme cases.

### Excluded Files

Certain files and directories are excluded from checks:

- `allure-report/` and `allure-results/` - test reports
- `node_modules/` - dependencies
- Other auto-generated files

Exclusion settings can be found in:

- `.eslintignore` or `eslint.config.js` - for ESLint
- `.prettierignore` - for Prettier

## 🔒 Environment Configuration

The framework uses a typed, singleton-based configuration:

```typescript
// Get configuration instance
const env = EnvConfig.getInstance();

// Access configuration values
const baseUrl = env.get('baseUrl');
const credentials = env.get('credentials');
```

Environment variables are defined in `.env`:

```
# Base URLs
BASE_URL=https://frontend-stage01.erisafire-internal.dev/signin
API_BASE_URL=https://backend-stage01.erisafire-internal.dev

# Test Users
USER_EMAIL=iuliia.kariuk+automation@honeycombsoft.com
USER_PASSWORD=-/-

# Timeouts
DEFAULT_TIMEOUT=60000
API_TIMEOUT=10000
```

## 🧪 Test Creation Guide

### Test Types

The framework supports four test types, organized by feature:

- **UI Tests**: Browser-based testing with Page Objects (`.ui.spec.ts`)
- **API Tests**: Direct API testing with service classes (`.api.spec.ts`)

### Creating UI Tests

Example of a UI test:

```typescript
import { test } from '../../../base-test';
import { LoginPage } from '../../ui/pages/LoginPage';
import { ProductsPage } from '../../ui/pages/ProductsPage';
import { TestDataFactory } from '../../factories/test-data.factory';

test.describe('Login UI Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    await loginPage.goto();
  });

  test('successful login @smoke @ui @auth', async () => {
    // Using TestDataFactory to get test credentials
    const credentials = TestDataFactory.getSauceCredentials('standard');

    await loginPage.login(credentials.email, credentials.password);
    await productsPage.waitForLoad();
  });
});
```

### Creating API Tests

Example of an API test:

```typescript
import { test } from '../../../base-test';
import { AuthAPI } from '../../api/services/AuthAPI';
import { type CustomAPIResponse } from '../../core/types/api.types';
import { type LoginResponse } from '../../api/types/auth.api.types';
import { EnvConfig } from '../../config/env.config';
import { TestDataFactory } from '../../factories/test-data.factory';

test.describe('Auth API Tests', () => {
  let authAPI: AuthAPI;
  const env = EnvConfig.getInstance();

  test.beforeEach(async ({ request }) => {
    authAPI = new AuthAPI({
      request,
      baseURL: env.get('apiBaseUrl'),
    });
  });

  test('successful login @smoke @api @auth', async () => {
    const credentials = TestDataFactory.getReqResCredentials('valid');

    const response = (await authAPI.login(credentials)) as CustomAPIResponse<LoginResponse>;
    await authAPI.verifySuccessfulLogin(response);
  });
});
```

### Creating Page Objects

All UI interactions should be encapsulated in Page Objects. Create a new Page Object as follows:

```typescript
/**
 * Cart Page Object
 *
 * This class represents the shopping cart page and provides methods
 * to interact with its elements.
 */
import { BasePage } from '../../core/base/BasePage';
import { cartSelectors } from '../selectors/cart.selectors';
import type { Page } from '@playwright/test';

export class CartPage extends BasePage {
  /**
   * Creates a new CartPage instance
   *
   * @param page - The Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to the cart page
   */
  async goto(): Promise<void> {
    await super.goto('/cart.html');
  }

  /**
   * Gets the number of items in the cart
   */
  async getItemCount(): Promise<number> {
    const items = this.getLocator(cartSelectors.items);
    return await items.count();
  }

  /**
   * Removes an item from the cart by index
   *
   * @param index - The index of the item to remove
   */
  async removeItem(index: number): Promise<void> {
    const removeButtons = this.getLocator(cartSelectors.removeButton);
    await removeButtons.nth(index).click();
  }

  /**
   * Proceeds to checkout
   */
  async checkout(): Promise<void> {
    await this.click(cartSelectors.checkoutButton);
  }
}
```

For each Page Object, create a corresponding selectors file:

```typescript
/**
 * Selectors for the Cart page elements
 */
export const cartSelectors = {
  items: '.cart_item',
  removeButton: '.cart_button',
  checkoutButton: '#checkout',
  continueShoppingButton: '#continue-shopping',
};
```

### Creating API Services

API interactions should be encapsulated in service classes. Create a new API service as follows:

```typescript
/**
 * User API Service
 *
 * This class provides methods to interact with user-related API endpoints.
 */
import { BaseAPI } from '../../core/base/BaseAPI';
import { userSchemas } from '../schemas/user.schemas';
import type { APIClient, CustomAPIResponse, CustomAPIOptions } from '../../core/types/api.types';
import type { UserResponse, CreateUserRequest } from '../types/user.api.types';

export class UserAPI extends BaseAPI {
  /**
   * Creates a new UserAPI instance
   *
   * @param client - The API client configuration
   */
  constructor(client: APIClient) {
    super(client);
  }

  /**
   * Gets a user by ID
   *
   * @param id - The user ID
   * @param options - Optional API request options
   * @returns API response with user data
   */
  async getUserById(
    id: number,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<UserResponse>> {
    return this.get<UserResponse>(`/users/${id}`, {
      schema: userSchemas.user,
      ...options,
    });
  }

  /**
   * Creates a new user
   *
   * @param userData - The user data to create
   * @param options - Optional API request options
   * @returns API response with created user data
   */
  async createUser(
    userData: CreateUserRequest,
    options?: CustomAPIOptions
  ): Promise<CustomAPIResponse<UserResponse>> {
    return this.post<UserResponse>('/users', userData, {
      schema: userSchemas.user,
      ...options,
    });
  }

  /**
   * Verifies a successful user request
   *
   * @param response - The API response to verify
   */
  async verifySuccessfulUserResponse(response: CustomAPIResponse<UserResponse>): Promise<void> {
    await this.assertions.shouldHaveStatus(response, 200);
    // Add additional verification as needed
  }
}
```

For each API service, create corresponding type definitions:

```typescript
/**
 * User API Types
 */
export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface CreateUserRequest {
  name: string;
  job: string;
}
```

And schema validation files:

```typescript
/**
 * User API Schemas
 */
export const userSchemas = {
  user: {
    type: 'object',
    required: ['id', 'email'],
    properties: {
      id: { type: 'number' },
      email: { type: 'string' },
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      avatar: { type: 'string' },
    },
  },
};
```

### Test Data Management

The framework supports test data generation through the `TestDataFactory`:

```typescript
// Get credentials for UI testing (SauceDemo)
const credentials = TestDataFactory.getSauceCredentials('standard');
// Options: 'standard', 'locked', 'problem', 'performance'

// Get credentials for API testing (ReqRes)
const apiCredentials = TestDataFactory.getReqResCredentials('valid');
// Options: 'valid', 'invalid'

// Generate a random user
const user = TestDataFactory.generateUser();

// Generate a list of users
const users = TestDataFactory.generateUserList(5);
```

### Tagging Strategy

Use tags to categorize tests:

- **Test Types**

  - `@ui` - UI tests
  - `@api` - API tests
  - `@e2e` - End-to-end tests

- **Test Levels**

  - `@smoke` - Critical path tests (subset of regression)
  - `@regression` - Full regression suite
  - `@critical` - Business-critical tests
  - `@negative` - Negative tests

- **Feature Areas**
  - `@auth` - Authentication-related tests
  - `@coverageAttribute` - Coverage attribute tests
  - `@coverageType` - Coverage type tests

## 🤝 Contributing

1. Follow the established project structure
2. Ensure proper test categorization and tagging
3. Use the factory pattern for test data
4. Add TSDoc comments to all new classes and methods
5. Run linting and formatting before committing
6. Make sure all pre-commit checks pass successfully
