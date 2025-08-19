import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage.js';
import {
  getAddNewTrelloListButton,
  getAddTrelloListButton,
  getSaveTrelloListButton,
  getAppSettings,
  getTrelloIntegrationButton,
  getTrelloListDropdown,
  getTrelloListOption,
  getProjectStatusDropdown,
  getProjectStatusOption,
  getTrelloListSuccessToast,
  getTrelloListUpdateToast,
  getTrelloListDeleteToast,
  getTrelloListRowActionsByName,
  getTrelloListEditMenuItem,
  getTrelloListDeleteMenuItem,
  getTrelloListDeleteConfirmButton,
  getTrelloListCancelButton,
  getDeleteConfirmationModalTitle,
  getDeleteConfirmationText,
  getDeleteConfirmationPermanentText,
  getTrelloListModalTitle,
  getProjectStatusChip,
  getTrelloListInfo,
} from '../selectors/trelloListIntegration.selectors.js';

export interface TrelloListIntegrationData {
  trelloListName: string;
  projectStatus: string;
}

export class TrelloListIntegrationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Trello List Integration settings
   */
  async navigateToTrelloIntegration(): Promise<void> {
    await getAppSettings(this.page).click();
    await getTrelloIntegrationButton(this.page).click();
  }

  /**
   * Create a new Trello List Integration
   */
  async createTrelloListIntegration({
    trelloListName,
    projectStatus,
  }: TrelloListIntegrationData): Promise<void> {
    await this.navigateToTrelloIntegration();
    await getAddNewTrelloListButton(this.page).click();

    // Click on dialog title to activate the form
    await getTrelloListModalTitle(this.page).click();

    // Wait a bit for form to initialize
    await this.page.waitForTimeout(1000);

    // Select Trello list
    await getTrelloListDropdown(this.page).click();
    await getTrelloListOption(this.page, trelloListName).click();

    // Wait for dropdown to close and form to update
    await this.page.waitForTimeout(500);

    // Select project status
    await getProjectStatusDropdown(this.page).click();
    await getProjectStatusOption(this.page, projectStatus).click();

    // Wait for form validation to complete
    await this.page.waitForTimeout(1000);

    // Try clicking somewhere in the form to trigger validation
    await getTrelloListModalTitle(this.page).click();

    // Wait for Add button to be enabled with longer timeout
    await expect(getAddTrelloListButton(this.page)).toBeEnabled({ timeout: 10000 });
    await getAddTrelloListButton(this.page).click();

    // Verify success
    await expect(getTrelloListSuccessToast(this.page)).toBeVisible({ timeout: 45000 });

    // Wait for the page to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Edit an existing Trello List Integration
   */
  async editTrelloListIntegration(
    trelloListName: string,
    currentProjectStatus: string,
    newProjectStatus: string
  ): Promise<void> {
    try {
      // Wait for any previous operations to complete
      await this.page.waitForLoadState('networkidle');

      // Click row actions using the Trello list name
      const rowActionsBtn = getTrelloListRowActionsByName(this.page, trelloListName);
      await rowActionsBtn.scrollIntoViewIfNeeded();
      await expect(rowActionsBtn).toBeEnabled();
      await rowActionsBtn.click();

      // Click edit menu
      await getTrelloListEditMenuItem(this.page).click();

      // Update project status
      await getProjectStatusChip(this.page, currentProjectStatus).click();
      await getProjectStatusOption(this.page, newProjectStatus).click();

      // Save changes
      await getSaveTrelloListButton(this.page).click();

      // Wait for success toast
      await expect(getTrelloListUpdateToast(this.page)).toBeVisible({ timeout: 45000 });
    } catch (error) {
      console.error('Error editing Trello list integration:', error);
      throw error;
    }
  }

  /**
   * Delete a Trello List Integration by name
   */
  async deleteTrelloListIntegrationByName(trelloListName: string): Promise<void> {
    const rowActionsBtn = getTrelloListRowActionsByName(this.page, trelloListName);
    await rowActionsBtn.scrollIntoViewIfNeeded();
    await rowActionsBtn.click();

    // Wait for menu to open
    await this.page.waitForTimeout(500);

    // Wait for delete menu item to be visible and click
    await expect(getTrelloListDeleteMenuItem(this.page)).toBeVisible();
    await getTrelloListDeleteMenuItem(this.page).click();

    // Verify delete confirmation modal elements
    await expect(getDeleteConfirmationModalTitle(this.page)).toBeVisible();
    await expect(getDeleteConfirmationText(this.page)).toBeVisible();
    await expect(getDeleteConfirmationPermanentText(this.page)).toBeVisible();
    await expect(getTrelloListInfo(this.page, trelloListName)).toBeVisible();

    await getTrelloListDeleteConfirmButton(this.page).click();

    // Verify deletion
    await expect(getTrelloListDeleteToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  /**
   * Validate form validation on empty save
   */
  async assertValidationOnEmptySave(): Promise<void> {
    await this.navigateToTrelloIntegration();

    // Open the modal
    await getAddNewTrelloListButton(this.page).click();

    // Try to interact with form fields to trigger validation
    await getTrelloListDropdown(this.page).click();
    await getTrelloListModalTitle(this.page).click();
    await getProjectStatusDropdown(this.page).click();
    // Close dropdown by pressing Escape or clicking outside
    await this.page.keyboard.press('Escape');
    // Click on modal to trigger validation
    await getTrelloListModalTitle(this.page).click();

    // Check that validation errors are visible (should already be triggered by previous interactions)
    await expect(this.page.getByText('This field is required').first()).toBeVisible();

    // Check that Add button is disabled
    await expect(getAddTrelloListButton(this.page)).toBeDisabled();

    // Close the modal
    await getTrelloListCancelButton(this.page).click();
  }
}
