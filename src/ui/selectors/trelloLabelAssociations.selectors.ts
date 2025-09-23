import { Page, Locator } from '@playwright/test';

// Navigation selectors
export const getAppSettings = (page: Page): Locator => page.getByLabel('App Settings');

export const getTrelloLabelAssociationsButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Trello Label Associations' });

// Trello Label Associations form selectors
export const getAddNewButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add new' });

// Modal/popup selector
export const getTrelloConsultantModalTitle = (page: Page): Locator =>
  page.getByRole('heading', { name: 'New Trello Consultant' });

// Consultant selector
export const getConsultantDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Select a Consultant' });

export const getConsultantOption = (page: Page, consultantName: string): Locator =>
  page.getByRole('option', { name: consultantName });

// Trello Labels selector
export const getTrelloLabelsDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Trello Labels' });

export const getTrelloLabelsOption = (page: Page, labelName: string): Locator =>
  page.getByRole('option', { name: labelName });

// Action buttons
export const getCreateButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Create' });

export const getSaveButton = (page: Page): Locator => page.getByRole('button', { name: 'Save' });

export const getCancelButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Cancel' });

// Success/Error messages
export const getTrelloConsultantAddedToast = (page: Page): Locator =>
  page.getByText('Trello Consultant Association has been added.');

export const getTrelloConsultantUpdatedToast = (page: Page): Locator =>
  page.getByText('Trello Consultant Association has been updated.');

export const getTrelloConsultantDeletedToast = (page: Page): Locator =>
  page.getByText('Trello Consultant Association has been deleted.');

// Row actions button by consultant name
export const getTrelloConsultantRowActionsByName = (page: Page, consultantName: string): Locator =>
  page
    .locator('tr', { hasText: consultantName })
    .locator('button[aria-label="row-actions"]')
    .first();

// Menu items
export const getEditMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Edit' });

export const getDeleteMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Delete' });

// Confirmation dialogs
export const getDeleteConfirmationText = (page: Page): Locator =>
  page.getByText('Are you sure you want to');

export const getDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete' });

// Validation messages
export const getRequiredFieldError = (page: Page): Locator =>
  page.getByText('This field is required').first();
