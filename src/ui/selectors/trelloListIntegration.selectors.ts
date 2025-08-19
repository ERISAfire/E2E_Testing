import { Page, Locator } from '@playwright/test';

// Navigation selectors
export const getAppSettings = (page: Page): Locator => page.getByLabel('App Settings');

export const getTrelloIntegrationButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Trello List Integration' });

// Trello List Integration form selectors
export const getAddNewTrelloListButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add new' });

// Modal/popup selector - click on dialog title to activate form
export const getTrelloListModalTitle = (page: Page): Locator =>
  page.locator('#create-update-trello-list-itegration-dialog');

// Trello list selector (single dropdown, not separate board + list)
export const getTrelloListDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Select a Trello list' });

export const getTrelloListOption = (page: Page, listName: string): Locator =>
  page.getByRole('option', { name: listName });

// Project status selector
export const getProjectStatusDropdown = (page: Page): Locator =>
  page.getByText('Select project status');

export const getProjectStatusOption = (page: Page, statusName: string): Locator =>
  page.getByRole('option', { name: statusName });

// Updated project status selector (for editing existing status)
export const getProjectStatusChip = (page: Page, currentStatus: string): Locator =>
  page.locator(`[role="combobox"]:has(.MuiChip-label:has-text("${currentStatus}"))`);

export const getAddTrelloListButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add' });

export const getSaveTrelloListButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Save' });

// Success/Error messages
export const getTrelloListSuccessToast = (page: Page): Locator =>
  page.getByText('Trello list integration has been added.');

export const getTrelloListUpdateToast = (page: Page): Locator =>
  page.getByText('Trello list integration has been updated.');

export const getTrelloListDeleteToast = (page: Page): Locator =>
  page.getByText('Trello list integration has been deleted.');

// Row actions button by Trello list name (similar to Coverage Attribute pattern)
export const getTrelloListRowActionsByName = (page: Page, trelloListName: string): Locator =>
  page
    .locator('tr', { hasText: trelloListName })
    .locator('button[aria-label="row-actions"]')
    .first();

// Menu items
export const getTrelloListEditMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Edit' });

export const getTrelloListDeleteMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Delete' });

// Confirmation dialogs
export const getTrelloListDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete' });

export const getTrelloListCancelButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Cancel' });

// Delete confirmation modal
export const getDeleteConfirmationModalTitle = (page: Page): Locator =>
  page.getByRole('heading', { name: 'Delete Trello list integration' });

export const getDeleteConfirmationText = (page: Page): Locator =>
  page.getByText('Are you sure you want to delete the Trello list integration for');

export const getDeleteConfirmationPermanentText = (page: Page): Locator =>
  page.getByText('This action is permanent and cannot be undone.');

// Status indicators and list info
export const getTrelloListInfo = (page: Page, listName: string): Locator =>
  page.getByText(`${listName} (`);

// Validation messages
export const getDuplicateListError = (page: Page): Locator =>
  page.getByText('This list integration already exists');
