/**
 * Products Page Selectors
 *
 * This file contains all selectors for the Products page UI elements,
 * organized into logical sections for better maintainability.
 */
export const projectsSelectors = {
  header: {
    title: 'span:has-text("Projects")',
  },
};

import { Page, Locator } from '@playwright/test';

// Main header
export const getProjectsHeaderTitle = (page: Page): Locator =>
  page.locator(projectsSelectors.header.title);

// Global actions
export const getProjectsAddNewButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add new' });
export const getProjectsAddNewProjectMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Project' });

// Create/Edit form fields
export const getProjectTemplateDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Project template Select' });
export const getProjectTemplateOption = (page: Page, templateName: string): Locator =>
  page.getByRole('option', { name: templateName });

export const getProjectNameInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Project name' });

export const getTrelloCardDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Trello card' });
export const getTrelloCardOption = (page: Page, cardName: string): Locator =>
  page.getByRole('option', { name: cardName });

export const getEmployerDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Employer' });
export const getEmployerOption = (page: Page, employerName: string): Locator =>
  page.getByRole('option', { name: employerName });

export const getPlanYearDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Plan year Select plan' });
export const getPlanYearOptionByText = (page: Page, text: string): Locator =>
  page.getByText(text, { exact: true });
// Partial/regex option finder for cases like '2024 Plan 2 energy'
export const getPlanYearOptionByContains = (page: Page, partial: string): Locator =>
  page.getByRole('option', { name: new RegExp(partial, 'i') });

export const getSaveButton = (page: Page): Locator => page.getByRole('button', { name: 'Save' });
export const getEditButton = (page: Page): Locator => page.getByRole('button', { name: 'Edit' });
export const getDeleteProjectButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete project' });

// Status dropdown (label contains current status, e.g., "Status Start", "Status Drafting")
export const getStatusDropdownByCurrent = (page: Page, currentStatus: string): Locator =>
  page
    .getByRole('combobox', { name: `Status ${currentStatus}` })
    .locator('div')
    .first();
export const getStatusOption = (page: Page, status: string): Locator =>
  page.getByRole('option', { name: status });

// Table/list helpers
export const getProjectRowByName = (page: Page, projectName: string): Locator =>
  page.locator('tr', { hasText: projectName });
export const getProjectRowCellByExactStatus = (page: Page, status: string): Locator =>
  page
    .locator('div')
    .filter({ hasText: new RegExp(`^${status}$`) })
    .locator('div')
    .nth(1);
export const getStatusChipByText = (page: Page, status: string): Locator =>
  page.locator('span').filter({ hasText: status }).first();

// Toasts and confirmations
export const getProjectAddedToast = (page: Page): Locator =>
  page.getByText('Project has been added.');
export const getProjectUpdatedToast = (page: Page): Locator =>
  page.getByText('Project has been updated.');
export const getProjectDeletedToast = (page: Page): Locator =>
  page.getByText('Project has been deleted.');

export const getDeleteConfirmText = (page: Page): Locator =>
  page.getByText('Are you sure you want to');
export const getDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete' });
