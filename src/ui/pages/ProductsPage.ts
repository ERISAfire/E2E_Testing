/**
 * Products Page Object
 *
 * This class represents the Products page in the application and provides
 * methods to interact with its elements and perform actions.
 * It follows the Page Object design pattern for better maintainability.
 */
import { BasePage } from '../../core/base/BasePage';
import { productsSelectors } from '../selectors/products.selectors';
import type { Page } from '@playwright/test';

export class ProductsPage extends BasePage {
  /**
   * Creates a new ProductsPage instance
   *
   * @param page - The Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Waits for the Products page to load completely
   *
   * Verifies that the page title is visible and has the correct text,
   * confirming that navigation to the Products page was successful.
   *
   * @returns Promise that resolves when the page is fully loaded
   *
   * @example
   * await productsPage.waitForLoad();
   */
  async waitForLoad(): Promise<void> {
    const titleLocator = this.getLocator(productsSelectors.header.title);
    await this.assertions.shouldBeVisible(titleLocator);
    await this.assertions.shouldHaveText(titleLocator, 'Products');
  }

  /**
   * Gets the current number of items in the shopping cart
   *
   * @returns Promise that resolves to the cart item count as a string
   *
   * @example
   * const count = await productsPage.getCartItemsCount();
   * console.log(`Items in cart: ${count}`);
   */
  async getCartItemsCount(): Promise<string> {
    const cartBadge = this.getLocator(productsSelectors.header.cartBadge);
    await this.assertions.shouldBeVisible(cartBadge);
    return this.getText(productsSelectors.header.cartBadge);
  }

  /**
   * Sorts the products list using the dropdown menu
   *
   * @param value - The sort option value to select
   * @returns Promise that resolves when sorting is applied
   *
   * @example
   * // Sort by price low to high
   * await productsPage.sortProducts('lohi');
   */
  async sortProducts(value: string): Promise<void> {
    await this.page.selectOption(productsSelectors.sorting.dropdown, value);
  }
}
