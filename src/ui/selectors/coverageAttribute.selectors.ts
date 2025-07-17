// Selectors for the Coverage Attribute page
import { Page, Locator } from '@playwright/test';

export const getAppSettingsLink = (page: Page): Locator =>
  page.getByRole('link', { name: 'App Settings' });

export const getCoverageAttributeCreateButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Coverage Attributes Create,' });

export const getAddNewButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add new' });

export const getCoverageAttributeNameInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Coverage attribute name' });

export const getCoverageAttributeColorInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Coverage attribute color *' });

export const getNewCoverageAttributeHeading = (page: Page): Locator =>
  page.getByRole('heading', { name: 'New coverage attribute' });

export const getAddButton = (page: Page): Locator => page.getByRole('button', { name: 'Add' });

export const getSuccessToast = (page: Page): Locator =>
  page.getByText('Coverage attribute has been');

export const getCoverageAttributeRowActionsButton = (page: Page, name: string): Locator =>
  page.locator('tr', { hasText: name }).locator('button[aria-label="row-actions"]');

export const getCoverageAttributeEditMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Edit' });

export const getCancelButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Cancel' });

export const getSaveButton = (page: Page): Locator => page.getByRole('button', { name: 'Save' });

export const getUpdateSuccessToast = (page: Page): Locator =>
  page.getByText('Coverage attribute has been updated.');

export const getCoverageAttributeDeleteMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Delete' });

export const getDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete' });

export const getDeleteSuccessToast = (page: Page): Locator =>
  page.getByText('Coverage attribute has been deleted.');
