import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage.js';
import {
  getAddNewButton,
  getAppSettings,
  getAddNewProjectNoteButton,
  getProjectNoteMenuItem,
  getProjectTemplates,
  getAddNoteButton,
  getColorInput,
  getDeleteConfirmButton,
  getDeleteDialogText,
  getDeleteDialogTitle,
  getDeleteMenuItem,
  getEditMenuItem,
  getProjectNoteDescriptionInput,
  getProjectNoteSuccessToast,
  getProjectNoteTitleInput,
  getProjectTemplateNameInput,
  getProjectTemplateRowActionsButton,
  getSaveButton,
  getStatusDropdown,
  getStatusOption,
  getSuccessToast,
  getTrelloCardTemplateDropdown,
  getTrelloCardTemplateOption,
  getPlanYearBeginDateButton,
  getPlanYearEndDateButton,
  getPlanYearButton,
} from '../selectors/projectTemplate.selectors.js';

type Status = 'Active' | 'Draft';

interface ProjectTemplateOptions {
  name: string;
  status?: Status;
  color?: string;
  trelloCardTemplate?: string;
  note?: {
    title: string;
    description: string;
  };
}

export class ProjectTemplatePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToProjectTemplates(): Promise<void> {
    await getAppSettings(this.page).click();
    await getProjectTemplates(this.page).click();
  }

  async startCreatingNewTemplate(): Promise<void> {
    await getAddNewButton(this.page).click();
  }

  async addProjectNote(title: string, description: string): Promise<void> {
    // Open Add New menu and choose Project note
    await getAddNewProjectNoteButton(this.page).click();
    await getProjectNoteMenuItem(this.page).click();

    // Fill in the note details
    await getProjectNoteTitleInput(this.page).click();
    await getProjectNoteTitleInput(this.page).fill(title);
    await getProjectNoteDescriptionInput(this.page).click();
    await getProjectNoteDescriptionInput(this.page).fill(description);

    // Set Plan Year context as per new flow
    await getPlanYearBeginDateButton(this.page).click();
    await getPlanYearEndDateButton(this.page).click();
    await getPlanYearButton(this.page).click();
    await getPlanYearButton(this.page).click();

    // Add the note and verify toast
    await getAddNoteButton(this.page).click();
    await expect(getProjectNoteSuccessToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async saveTemplate(): Promise<void> {
    await getSaveButton(this.page).click();
    await expect(getSuccessToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async editTemplate(
    templateName: string,
    updates: {
      name?: string;
      status?: Status;
      color?: string;
      trelloCardTemplate?: string;
    }
  ): Promise<void> {
    // Open the actions menu for the template
    const actionsButton = await getProjectTemplateRowActionsButton(this.page, templateName);
    await actionsButton.click();
    await getEditMenuItem(this.page).click();

    // Update fields if provided
    if (updates.name) {
      await getProjectTemplateNameInput(this.page).fill(updates.name);
    }

    if (updates.status) {
      await getStatusDropdown(this.page).click();
      await getStatusOption(this.page, updates.status).click();
    }

    if (updates.color) {
      await getColorInput(this.page).click();
      await getColorInput(this.page).fill(updates.color);
    }

    if (updates.trelloCardTemplate) {
      await getTrelloCardTemplateDropdown(this.page).click();
      await getTrelloCardTemplateOption(this.page).click();
    }

    await this.saveTemplate();
  }

  async deleteTemplate(templateName: string): Promise<void> {
    // Open the actions menu for the template
    const actionsButton = await getProjectTemplateRowActionsButton(this.page, templateName);
    await actionsButton.click();
    await getDeleteMenuItem(this.page).click();

    // Verify delete dialog
    await expect(getDeleteDialogTitle(this.page)).toBeVisible();
    await expect(getDeleteDialogText(this.page)).toContainText(templateName);

    // Confirm deletion
    await getDeleteConfirmButton(this.page).click();
    await expect(getSuccessToast(this.page)).toBeVisible();
  }

  async createProjectTemplate({
    name,
    status = 'Active',
    color = '#123456',
    trelloCardTemplate = 'Automation_Tests',
    note,
  }: ProjectTemplateOptions): Promise<string> {
    await this.navigateToProjectTemplates();
    await this.startCreatingNewTemplate();

    // First fill in the template name
    await getProjectTemplateNameInput(this.page).fill(name);

    // Then fill in the rest of the details
    if (status) {
      await getStatusDropdown(this.page).click();
      await getStatusOption(this.page, status).click();
    }

    if (color) {
      await getColorInput(this.page).click();
      await getColorInput(this.page).fill(color);
    }

    if (trelloCardTemplate) {
      await getTrelloCardTemplateDropdown(this.page).click();
      await getTrelloCardTemplateOption(this.page).click();
    }

    // Now it's safe to add a note
    if (note) {
      await this.addProjectNote(note.title, note.description);
    }

    await this.saveTemplate();

    // Return the template name as the identifier
    return name;
  }
}
