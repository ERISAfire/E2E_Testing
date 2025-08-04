import { Page, Locator } from '@playwright/test';

export const getAppSettings = (page: Page): Locator => page.getByLabel('App Settings');

export const getCoverageTypesCreateButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Coverage Types Create, edit' });

export const getAddNewCoverageTypeButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add new' });

export const getCoverageTypeNameInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Coverage type name' });

export const getCoverageTypeIconCombo = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Coverage type icon *' });

export const getCoverageTypeIconOption = (page: Page, optionName: string): Locator =>
  page.getByRole('option', { name: optionName });

export const getCoverageTypeRowRadio = (page: Page, rowName: string, radioIndex: number): Locator =>
  page.getByRole('row', { name: rowName }).getByRole('radio').nth(radioIndex);

export const getAddCoverageTypeButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add' });

export const getCoverageTypeSuccessToast = (page: Page): Locator =>
  page.getByText('Coverage type has been added.');

export const getCoverageTypeRowActionsButton = (page: Page, name: string): Locator =>
  page.locator('tr', { hasText: name }).locator('button[aria-label="row-actions"]');

export const getCoverageTypeEnabledRowActionsButton = (page: Page, name: string): Locator =>
  page
    .locator('tr', { hasText: name })
    .locator('button[aria-label="row-actions"]:not([disabled])')
    .first();

export const getCoverageTypeArchivedTab = (page: Page): Locator =>
  page.getByRole('tab', { name: 'Archived' });

export const getCoverageTypeArchivedRowActionsButton = (page: Page, name: string): Locator =>
  page
    .locator('tr', { hasText: name })
    .locator('button[aria-label="row-actions"]:not([disabled])')
    .first();

export const getCoverageTypeSaveButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Save' });

export const getCoverageTypeEditMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Edit' });

export const getCoverageTypeArchiveMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Archive' });

export const getCoverageTypeUnarchiveMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Unarchive' });

export const getCoverageTypeArchivedToast = (page: Page): Locator =>
  page.getByText('Coverage type has been archived.');

export const getCoverageTypeUnarchivedToast = (page: Page): Locator =>
  page.getByText('Coverage type has been unarchived.');

export const getCoverageTypeArchivedStatus = (page: Page, name: string): Locator =>
  page.locator('tr', { hasText: name }).getByText('Archived');

export const getCoverageTypeActiveStatus = (page: Page, name: string): Locator =>
  page.locator('tr', { hasText: name }).getByText('Active');

export const getCoverageTypeDeleteMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Delete' });

export const getCoverageTypeDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete', exact: true });

export const getCoverageTypeDeletedToast = (page: Page): Locator =>
  page.getByText('Coverage type has been deleted.');
