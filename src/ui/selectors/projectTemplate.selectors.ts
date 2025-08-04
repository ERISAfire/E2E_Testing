import { Locator, Page } from '@playwright/test';

// Navigation
export const getAppSettings = (page: Page): Locator =>
  page.getByRole('link', { name: 'App Settings' });

export const getProjectTemplates = (page: Page): Locator =>
  page.getByRole('button', { name: 'Project Templates Create' });

// Creation form
export const getAddNewButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add New' });

export const getProjectTemplateNameInput = (page: Page): Locator =>
  page.getByLabel('Project Template Name *');

export const getStatusDropdown = (page: Page): Locator => page.getByLabel('Status *');

export const getStatusOption = (page: Page, status: string): Locator =>
  page.getByRole('option', { name: status, exact: true });

export const getColorInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Color & code' });

export const getTrelloCardTemplateDropdown = (page: Page): Locator =>
  page.getByLabel('Trello Card Template');

export const getTrelloCardTemplateOption = (page: Page): Locator =>
  page.getByRole('option', { name: 'Automation_Tests' });

// Project notes
export const getAddNewProjectNoteButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add New' });

export const getProjectNoteTitleInput = (page: Page): Locator => page.getByLabel('Title');

export const getProjectNoteDescriptionInput = (page: Page): Locator =>
  page
    .getByLabel('Add new project note')
    .locator('form div')
    .filter({ hasText: 'Description' })
    .locator('div')
    .nth(3);

export const getAddNoteButton = (page: Page): Locator => page.getByRole('button', { name: 'Add' });

// Actions
export const getSaveButton = (page: Page): Locator => page.getByRole('button', { name: 'Save' });

export const getProjectTemplateRowActionsButton = async (
  page: Page,
  templateName: string
): Promise<Locator> => {
  try {
    // Wait for the table to be visible
    await page.getByRole('table').waitFor({ state: 'visible', timeout: 10000 });

    // Find the row containing the template name
    const row = await page
      .locator('tr')
      .filter({
        has: page.getByRole('cell', { name: templateName, exact: true }),
      })
      .first();

    // Wait for the row to be visible
    await row.waitFor({ state: 'visible', timeout: 10000 });

    // Scroll the row into view
    await row.scrollIntoViewIfNeeded({ timeout: 10000 });

    // Find the actions button by its aria-label
    const actionsButton = row.locator('button[aria-label="row-actions"]');

    await actionsButton.waitFor({ state: 'visible', timeout: 10000 });

    return actionsButton;
  } catch (error) {
    console.error(`Error finding template row with name: ${templateName}`);
    console.error('Page content:', await page.content());
    throw error;
  }
};

export const getEditMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Edit' });

export const getDraftMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Set to Draft' });

export const getDeleteMenuItem = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Delete' });

// Delete dialog
export const getDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete', exact: true });

export const getDeleteDialogText = (page: Page): Locator =>
  page.getByText(/are you sure you want to delete/i);

export const getDeleteDialogTitle = (page: Page): Locator =>
  page.getByRole('heading', { name: /delete project template/i });

// Toast messages
export const getSuccessToast = (page: Page): Locator =>
  page.getByRole('alert').filter({ hasText: /project template has been/i });

export const getProjectNoteSuccessToast = (page: Page): Locator =>
  page.getByRole('alert').filter({ hasText: /project note has been added/i });
