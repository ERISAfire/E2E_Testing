import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage.js';
import {
  getAppSettings,
  getTrelloLabelAssociationsButton,
  getAddNewButton,
  getTrelloConsultantModalTitle,
  getConsultantDropdown,
  getConsultantOption,
  getTrelloLabelsDropdown,
  getTrelloLabelsOption,
  getCreateButton,
  getSaveButton,
  getCancelButton,
  getTrelloConsultantAddedToast,
  getTrelloConsultantUpdatedToast,
  getTrelloConsultantDeletedToast,
  getTrelloConsultantRowActionsByName,
  getEditMenuItem,
  getDeleteMenuItem,
  getDeleteConfirmationText,
  getDeleteConfirmButton,
  getRequiredFieldError,
} from '../selectors/trelloLabelAssociations.selectors.js';

export interface TrelloLabelAssociationData {
  consultantName: string;
  trelloLabel: string;
}

export class TrelloLabelAssociationsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Trello Label Associations settings
   */
  async navigateToTrelloLabelAssociations(): Promise<void> {
    await getAppSettings(this.page).click();
    await getTrelloLabelAssociationsButton(this.page).click();
  }

  /**
   * Create a new Trello Label Association
   */
  async createTrelloLabelAssociation({
    consultantName,
    trelloLabel,
  }: TrelloLabelAssociationData): Promise<void> {
    await this.navigateToTrelloLabelAssociations();
    await getAddNewButton(this.page).click();

    // Wait for modal to open and click on modal title to activate the form
    await getTrelloConsultantModalTitle(this.page).click();

    // Wait a bit for form to initialize
    await this.page.waitForTimeout(1000);

    // Select consultant
    await getConsultantDropdown(this.page).click();
    await getConsultantOption(this.page, consultantName).click();

    // Wait for dropdown to close and form to update
    await this.page.waitForTimeout(500);

    // Select Trello label
    await getTrelloLabelsDropdown(this.page).click();
    await getTrelloLabelsOption(this.page, trelloLabel).click();

    // Wait for form validation to complete
    await this.page.waitForTimeout(1000);

    // Click on modal title to trigger validation
    await getTrelloConsultantModalTitle(this.page).click();

    // Wait for Create button to be enabled with longer timeout
    await expect(getCreateButton(this.page)).toBeEnabled({ timeout: 10000 });
    await getCreateButton(this.page).click();

    // Verify success
    await expect(getTrelloConsultantAddedToast(this.page)).toBeVisible({ timeout: 45000 });

    // Wait for the page to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Edit an existing Trello Label Association
   */
  async editTrelloLabelAssociation(consultantName: string, newTrelloLabel?: string): Promise<void> {
    try {
      // Wait for any previous operations to complete
      await this.page.waitForLoadState('networkidle');

      // Click row actions using the consultant name
      const rowActionsBtn = getTrelloConsultantRowActionsByName(this.page, consultantName);
      await rowActionsBtn.scrollIntoViewIfNeeded();
      await expect(rowActionsBtn).toBeEnabled();
      await rowActionsBtn.click();

      // Click edit menu
      await getEditMenuItem(this.page).click();

      // If new Trello label is provided, update it
      if (newTrelloLabel) {
        await getTrelloLabelsDropdown(this.page).click();
        await getTrelloLabelsOption(this.page, newTrelloLabel).click();

        // Wait for form validation to complete
        await this.page.waitForTimeout(1000);

        // Save changes
        await getSaveButton(this.page).click();

        // Wait for success toast
        await expect(getTrelloConsultantUpdatedToast(this.page)).toBeVisible({ timeout: 45000 });
      } else {
        // Just cancel the edit to test the cancel functionality
        await getCancelButton(this.page).click();
      }
    } catch (error) {
      console.error('Error editing Trello label association:', error);
      throw error;
    }
  }

  /**
   * Delete a Trello Label Association by consultant name
   */
  async deleteTrelloLabelAssociation(consultantName: string): Promise<void> {
    const rowActionsBtn = getTrelloConsultantRowActionsByName(this.page, consultantName);
    await rowActionsBtn.scrollIntoViewIfNeeded();
    await rowActionsBtn.click();

    // Wait for menu to open
    await this.page.waitForTimeout(500);

    // Wait for delete menu item to be visible and click
    await expect(getDeleteMenuItem(this.page)).toBeVisible();
    await getDeleteMenuItem(this.page).click();

    // Verify delete confirmation dialog
    await expect(getDeleteConfirmationText(this.page)).toBeVisible();

    await getDeleteConfirmButton(this.page).click();

    // Verify deletion
    await expect(getTrelloConsultantDeletedToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  /**
   * Validate form validation on empty save
   */
  async assertValidationOnEmptySave(): Promise<void> {
    await this.navigateToTrelloLabelAssociations();

    // Open the modal
    await getAddNewButton(this.page).click();

    // Try to interact with form fields to trigger validation
    await getConsultantDropdown(this.page).click();
    await getTrelloConsultantModalTitle(this.page).click();
    await getTrelloLabelsDropdown(this.page).click();

    // Close dropdown by pressing Escape or clicking outside
    await this.page.keyboard.press('Escape');

    // Click on modal to trigger validation
    await getTrelloConsultantModalTitle(this.page).click();

    // Check that validation errors are visible
    await expect(getRequiredFieldError(this.page)).toBeVisible();

    // Check that Create button is disabled
    await expect(getCreateButton(this.page)).toBeDisabled();

    // Close the modal
    await getCancelButton(this.page).click();
  }
}
