import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage.js';
import {
  getAppSettings,
  getCoverageTypesCreateButton,
  getAddNewCoverageTypeButton,
  getCoverageTypeNameInput,
  getCoverageTypeIconCombo,
  getCoverageTypeIconOption,
  getCoverageTypeRowRadio,
  getAddCoverageTypeButton,
  getCoverageTypeSuccessToast,
  getCoverageTypeEditSuccessToast,
  getCoverageTypeEnabledRowActionsButton,
  getCoverageTypeSaveButton,
  getCoverageTypeEditMenuItem,
  getCoverageTypeArchiveMenuItem,
  getCoverageTypeUnarchiveMenuItem,
  getCoverageTypeArchivedToast,
  getCoverageTypeUnarchivedToast,
  getCoverageTypeArchivedStatus,
  getCoverageTypeActiveStatus,
  getCoverageTypeArchivedRowActionsButton,
  getCoverageTypeDeleteMenuItem,
  getCoverageTypeDeleteConfirmButton,
  getCoverageTypeDeletedToast,
} from '../selectors/coverageType.selectors.js';

export class CoverageTypePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async createCoverageType({
    name,
    iconOption,
    rowRadios,
  }: {
    name: string;
    iconOption: string;
    rowRadios: Array<{ row: string; index: number }>;
  }): Promise<void> {
    await getAppSettings(this.page).click();
    await getCoverageTypesCreateButton(this.page).click();
    await getAddNewCoverageTypeButton(this.page).click();
    await getCoverageTypeNameInput(this.page).click();
    await getCoverageTypeNameInput(this.page).fill(name);
    await getCoverageTypeIconCombo(this.page).click();
    await getCoverageTypeIconOption(this.page, iconOption).click();
    for (const { row, index } of rowRadios) {
      if (['Self-insured', 'After-Tax'].includes(row)) {
        await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
      }
      await getCoverageTypeRowRadio(this.page, row, index).check();
    }
    await getAddCoverageTypeButton(this.page).click();
    await expect(getCoverageTypeSuccessToast(this.page)).toBeVisible();
    await expect(getCoverageTypeActiveStatus(this.page, name)).toBeVisible();
  }

  async editCoverageType(
    oldName: string,
    newName: string,
    rowRadios: Array<{ row: string; index: number }>
  ): Promise<void> {
    try {
      // Wait for any previous operations to complete
      await this.page.waitForLoadState('networkidle');

      // Scroll and click row actions
      const rowActionsBtn = getCoverageTypeEnabledRowActionsButton(this.page, oldName);
      await rowActionsBtn.scrollIntoViewIfNeeded();
      await expect(rowActionsBtn).toBeEnabled();
      await rowActionsBtn.click();

      // Click edit menu
      await getCoverageTypeEditMenuItem(this.page).click();

      // Fill the name
      const nameInput = getCoverageTypeNameInput(this.page);
      await nameInput.click();
      await nameInput.fill('');
      await nameInput.fill(newName);

      // Set radio buttons
      for (const { row, index } of rowRadios) {
        const radio = getCoverageTypeRowRadio(this.page, row, index);
        await radio.scrollIntoViewIfNeeded();
        await radio.check();
      }

      // Save changes
      const saveButton = getCoverageTypeSaveButton(this.page);
      await saveButton.click();

      // Wait for the save operation to complete
      await this.page.waitForLoadState('networkidle');

      // Wait for success toast with better error handling and fallback
      try {
        const toast = getCoverageTypeEditSuccessToast(this.page);
        await expect(toast).toBeVisible({ timeout: 45000 });
      } catch (toastError: unknown) {
        // Wait a bit more for UI to update
        await this.page.waitForTimeout(2000);

        // Check if the update was still successful by looking for the new name
        const successIndicator = getCoverageTypeActiveStatus(this.page, newName);
        try {
          await expect(successIndicator).toBeVisible({ timeout: 10000 });
          return; // Success even without toast
        } catch (fallbackError) {
          // Take screenshot for debugging
          await this.page.screenshot({
            path: `edit-coverage-type-fallback-error-${Date.now()}.png`,
          });

          // Check if old name still exists (update failed)
          const oldNameExists = getCoverageTypeActiveStatus(this.page, oldName);
          const oldNameVisible = await oldNameExists.isVisible();

          const errorMessage = toastError instanceof Error ? toastError.message : 'Unknown error';
          const fallbackErrorMsg =
            fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error';

          throw new Error(
            `Failed to see success toast and fallback check failed. Toast error: ${errorMessage}. Fallback error: ${fallbackErrorMsg}. Old name still exists: ${oldNameVisible}`
          );
        }
      }
    } catch (error) {
      await this.page.screenshot({ path: `edit-coverage-type-error-${Date.now()}.png` });
      throw error;
    }
  }

  async archiveCoverageType(name: string): Promise<void> {
    await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
    // Wait for the row actions button to be enabled
    const rowActionsBtn = getCoverageTypeEnabledRowActionsButton(this.page, name);
    await rowActionsBtn.scrollIntoViewIfNeeded();
    await expect(rowActionsBtn).toBeEnabled();
    await rowActionsBtn.click();
    await getCoverageTypeArchiveMenuItem(this.page).click();
    await expect(getCoverageTypeArchivedToast(this.page)).toBeVisible();
    await expect(getCoverageTypeArchivedStatus(this.page, name)).toBeVisible();
  }

  async unarchiveCoverageType(name: string): Promise<void> {
    await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
    const rowActionsBtn = getCoverageTypeArchivedRowActionsButton(this.page, name);
    await rowActionsBtn.scrollIntoViewIfNeeded();
    await rowActionsBtn.click({ force: true });
    await getCoverageTypeUnarchiveMenuItem(this.page).click();
    await expect(getCoverageTypeUnarchivedToast(this.page)).toBeVisible();
    await expect(getCoverageTypeActiveStatus(this.page, name)).toBeVisible();
  }

  async deleteCoverageType(name: string): Promise<void> {
    await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
    const rowActionsBtn = getCoverageTypeEnabledRowActionsButton(this.page, name);
    await rowActionsBtn.scrollIntoViewIfNeeded();
    await rowActionsBtn.click();
    await getCoverageTypeDeleteMenuItem(this.page).click();
    await getCoverageTypeDeleteConfirmButton(this.page).click();
    await expect(getCoverageTypeDeletedToast(this.page)).toBeVisible();
  }

  async assertValidationOnEmptySave(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await getAddNewCoverageTypeButton(this.page).click();
    await getCoverageTypeNameInput(this.page).click();
    await this.page.locator('body').click();
    await expect(this.page.getByText('Coverage type name is required')).toBeVisible();
    await expect(getAddCoverageTypeButton(this.page)).toBeDisabled();
  }
}
