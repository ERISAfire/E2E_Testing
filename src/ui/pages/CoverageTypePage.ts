import { Page, expect } from '@playwright/test';
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
} from '../selectors/coverageType.selectors';

export class CoverageTypePage {
  constructor(private page: Page) {}

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
      // Wait for any ongoing operations to complete
      await this.page.waitForLoadState('networkidle');

      // Scroll to the row
      const row = this.page.locator('tr', { hasText: oldName });
      await row.scrollIntoViewIfNeeded();
      await row.waitFor({ state: 'visible', timeout: 30000 });

      // Wait for and click the actions button
      const rowActionsBtn = getCoverageTypeEnabledRowActionsButton(this.page, oldName);
      await expect(rowActionsBtn).toBeEnabled({ timeout: 30000 });
      await rowActionsBtn.click({ force: true });

      // Click edit menu item
      const editMenuItem = getCoverageTypeEditMenuItem(this.page);
      await editMenuItem.waitFor({ state: 'visible', timeout: 10000 });
      await editMenuItem.click({ force: true });

      // Wait for the edit form to be visible
      await this.page.waitForSelector('form', { state: 'visible', timeout: 30000 });

      // Handle name update
      const nameInput = getCoverageTypeNameInput(this.page);
      await nameInput.click();
      await nameInput.fill('');
      await nameInput.fill(newName);

      // Handle radio buttons
      for (const { row, index } of rowRadios) {
        const radio = getCoverageTypeRowRadio(this.page, row, index);
        await radio.scrollIntoViewIfNeeded();
        await radio.check({ force: true });
      }

      // Save and wait for response
      const saveButton = getCoverageTypeSaveButton(this.page);
      await saveButton.click();

      // Wait for the success toast
      const toast = getCoverageTypeEditSuccessToast(this.page);
      await expect(toast).toBeVisible({ timeout: 30000 });

      // Wait for the toast to disappear
      await toast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    } catch (error) {
      // Take a screenshot on failure
      await this.page.screenshot({ path: `edit-coverage-type-error-${Date.now()}.png` });
      console.error('Error in editCoverageType:', error);
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
    await this.page.waitForTimeout(1000);
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
