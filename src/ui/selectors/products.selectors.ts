/**
 * Products Page Selectors
 *
 * This file contains all selectors for the Products page UI elements,
 * organized into logical sections for better maintainability.
 */
export const productsSelectors = {
  /**
   * Header section selectors
   */
  header: {
    /**
     * Page title element
     */
    title: '.title',

    /**
     * Shopping cart count badge
     */
    cartBadge: '.shopping_cart_badge',

    /**
     * Shopping cart link/icon
     */
    cartLink: '.shopping_cart_link',
  },

  /**
   * Product listing section selectors
   */
  productsList: {
    /**
     * Container for the entire products list
     */
    container: '.inventory_list',

    /**
     * Individual product item container
     */
    item: '.inventory_item',

    /**
     * Product name element
     */
    itemName: '.inventory_item_name',

    /**
     * Product price element
     */
    itemPrice: '.inventory_item_price',
  },

  /**
   * Product sorting controls
   */
  sorting: {
    /**
     * Dropdown for sorting products
     */
    dropdown: '[data-test="product_sort_container"]',
  },
};
