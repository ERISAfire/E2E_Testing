/**
 * Products Page Selectors
 *
 * This file contains all selectors for the Products page UI elements,
 * organized into logical sections for better maintainability.
 */
export const projectsSelectors = {
  /**
   * Header section selectors
   */
  header: {
    /**
     * Page title element
     * <span class="MuiTypography-root MuiTypography-h5 MuiCardHeader-title css-1bsjnwy">Projects</span>
     */
    title: 'span:has-text("Projects")',
  },

  /**
   * Projects section selectors
   */
  projectsList: {
    /**
     * Container for the entire projects list
     */
    container: '.inventory_list',

    /**
     * Individual projects item container
     */
    item: '.inventory_item',

    /**
     * Projects name element
     */
    itemName: '.inventory_item_name',
  },
};
