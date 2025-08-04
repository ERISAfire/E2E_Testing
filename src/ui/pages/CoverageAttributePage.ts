import { Page, expect } from '@playwright/test';
import {
  getAppSettings,
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
  getCancelButton,
} from '../selectors/coverageAttribute.selectors';

export class CoverageAttributePage {
  constructor(private page: Page) {}

  async createCoverageAttribute({ name, color }: { name: string; color: string }): Promise<void> {
    await getAppSettings(this.page).click();
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

  async assertValidationOnEmptySave(): Promise<void> {
    // Explicitly scroll the page to the top
    await this.page.evaluate(() => window.scrollTo(0, 0));
    const createButton = getAddNewButton(this.page);
    await createButton.click();

    // Simulate losing focus for both inputs
    await this.page.getByRole('textbox', { name: 'Coverage attribute name' }).click();
    await this.page.getByRole('heading', { name: 'New coverage attribute' }).click();
    await this.page.getByRole('textbox', { name: 'Coverage attribute color *' }).click();
    await this.page.getByRole('heading', { name: 'New coverage attribute' }).click();

    // Validation message check
    await expect(this.page.getByText('Attribute name is required')).toBeVisible();
    await expect(this.page.getByText('Attribute color is required')).toBeVisible();

    // Disabled button check
    const saveButton = getAddButton(this.page);
    await expect(saveButton).toBeDisabled();

    await getCancelButton(this.page).click();
  }
}
