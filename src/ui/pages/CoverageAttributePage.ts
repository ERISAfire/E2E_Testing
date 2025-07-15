import { Page, expect } from '@playwright/test';
import {
  getAppSettingsLink,
  getCoverageAttributeCreateButton,
  getAddNewButton,
  getCoverageAttributeNameInput,
  getCoverageAttributeColorInput,
  getNewCoverageAttributeHeading,
  getAddButton,
  getSuccessToast,
  getCoverageAttributeRowActionsButton,
  getCoverageAttributeEditMenuItem,
  getSaveButton,
  getUpdateSuccessToast,
  getCoverageAttributeDeleteMenuItem,
  getDeleteConfirmButton,
  getDeleteSuccessToast,
} from '../selectors/coverageAttribute.selectors';

export class CoverageAttributePage {
  constructor(private page: Page) {}

  async createCoverageAttribute({ name, color }: { name: string; color: string }): Promise<void> {
    await getAppSettingsLink(this.page).click();
    await getCoverageAttributeCreateButton(this.page).click();
    await getAddNewButton(this.page).click();
    await getCoverageAttributeNameInput(this.page).fill(name);
    await getCoverageAttributeColorInput(this.page).click();
    await getCoverageAttributeColorInput(this.page).fill(color);
    await getNewCoverageAttributeHeading(this.page).click(); // To lose focus
    await getAddButton(this.page).click();
    await expect(getSuccessToast(this.page)).toBeVisible();
    await expect(getSuccessToast(this.page)).toHaveText('Coverage attribute has been added.');
  }

  async editCoverageAttribute(newName: string, newColor: string): Promise<void> {
    const rowButton = getCoverageAttributeRowActionsButton(this.page, 'Automation_test');
    await rowButton.scrollIntoViewIfNeeded();
    await rowButton.click();
    await getCoverageAttributeEditMenuItem(this.page).click();
    await getCoverageAttributeNameInput(this.page).click();
    await getCoverageAttributeNameInput(this.page).fill(newName);
    await getCoverageAttributeColorInput(this.page).click();
    await getCoverageAttributeColorInput(this.page).fill(newColor);
    await getSaveButton(this.page).click();
    await expect(getUpdateSuccessToast(this.page)).toBeVisible();
    await expect(getSuccessToast(this.page)).toHaveText('Coverage attribute has been updated.');
  }

  async deleteCoverageAttribute(): Promise<void> {
    const rowButton = getCoverageAttributeRowActionsButton(this.page, 'Automation_test_test');
    await rowButton.scrollIntoViewIfNeeded();
    await rowButton.click();
    await getCoverageAttributeDeleteMenuItem(this.page).click();
    await getDeleteConfirmButton(this.page).click();
    await expect(getDeleteSuccessToast(this.page)).toBeVisible();
  }
}
