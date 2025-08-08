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
    await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
    // Wait for the row actions button to be enabled
    const rowActionsBtn = getCoverageTypeEnabledRowActionsButton(this.page, oldName);
    await rowActionsBtn.scrollIntoViewIfNeeded();
    await expect(rowActionsBtn).toBeEnabled();
    await rowActionsBtn.click();
    await getCoverageTypeEditMenuItem(this.page).click();
    await getCoverageTypeNameInput(this.page).click();
    await getCoverageTypeNameInput(this.page).fill(newName);
    for (const { row, index } of rowRadios) {
      await getCoverageTypeRowRadio(this.page, row, index).check();
    }
    await getCoverageTypeSaveButton(this.page).click();
    await expect(getCoverageTypeEditSuccessToast(this.page)).toBeVisible();
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
