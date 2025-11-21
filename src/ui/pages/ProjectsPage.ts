/**
 * Projects Page Object
 *
 * This class represents the Projects page in the application and provides
 * methods to interact with its elements and perform actions.
 * It follows the Page Object design pattern for better maintainability.
 */
import { BasePage } from '../../core/base/BasePage.js';
//import { projectsSelectors } from '../../ui/selectors/projects.selectors';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import {
  getProjectsAddNewButton,
  getProjectsAddNewProjectMenuItem,
  getProjectTemplateDropdown,
  getProjectTemplateOption,
  getProjectNameInput,
  getTrelloCardDropdown,
  getTrelloCardOption,
  getEmployerDropdown,
  getEmployerOption,
  getPlanYearDropdown,
  getPlanYearOptionByContains,
  getSaveButton,
  getEditButton,
  getDeleteProjectButton,
  getStatusDropdownByCurrent,
  getStatusOption,
  getStatusChipByText,
  getProjectAddedToast,
  getProjectUpdatedToast,
  getProjectDeletedToast,
  getDeleteConfirmText,
  getDeleteConfirmButton,
} from '../selectors/projects.selectors.js';

export interface CreateProjectData {
  templateName: string;
  projectName: string;
  trelloCardName: string;
  employerName: string;
  planYearLabel: string;
}

export class ProjectsPage extends BasePage {
  /**
   * Creates a new ProjectsPage instance
   *
   * @param page - The Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Waits for the Projects page to load completely
   *
   * Verifies that the page title is visible and has the correct text,
   * confirming that navigation to the Projects page was successful.
   *
   * @returns Promise that resolves when the page is fully loaded
   *
   * @example
   * await projectsPage.waitForLoad();
   */
  async waitForLoad(): Promise<void> {
    const titleLocator = this.page.getByText('Projects', { exact: true });
    await titleLocator.waitFor({ state: 'visible', timeout: 30000 });
    await this.assertions.shouldHaveText(titleLocator, 'Projects');
  }

  async createProject(data: CreateProjectData): Promise<void> {
    await getProjectsAddNewButton(this.page).click();
    await getProjectsAddNewProjectMenuItem(this.page).click();

    await getProjectTemplateDropdown(this.page).click();
    await getProjectTemplateOption(this.page, data.templateName).click();

    await getProjectNameInput(this.page).click();
    await getProjectNameInput(this.page).fill(data.projectName);

    await getTrelloCardDropdown(this.page).click();
    // Some dropdowns require typing to filter; attempt a direct option click primarily
    await getTrelloCardOption(this.page, data.trelloCardName).click();

    await getEmployerDropdown(this.page).click();
    await getEmployerOption(this.page, data.employerName).click();

    await getPlanYearDropdown(this.page).click();
    // Prefer partial match due to prefixed year in option text (e.g., "2024 Plan 2 energy")
    const planOption = getPlanYearOptionByContains(this.page, data.planYearLabel);
    await expect(planOption).toBeVisible({ timeout: 10000 });
    await planOption.click();

    await getSaveButton(this.page).click();
    await expect(getProjectAddedToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async editProjectStatus(currentStatus: string, newStatus: string): Promise<void> {
    await getEditButton(this.page).click();
    await getStatusDropdownByCurrent(this.page, currentStatus).click();
    await getStatusOption(this.page, newStatus).click();
    await getSaveButton(this.page).click();
    await expect(getProjectUpdatedToast(this.page)).toBeVisible({ timeout: 45000 });
    // Verify status chip updated with exact text
    const statusChip = getStatusChipByText(this.page, newStatus);
    await expect(statusChip).toBeVisible();
    await expect(statusChip).toHaveText(newStatus);
    // Verify the ACTIVE step label equals the new status (avoid matching other steps)
    const activeStep = this.page.locator('span.MuiStepLabel-root', {
      has: this.page.locator('span.MuiStepLabel-iconContainer.Mui-active'),
    });
    // Exactly one active step
    await expect(activeStep).toHaveCount(1);
    // Active step label equals expected status
    const activeStepLabel = activeStep.locator('h6').first();
    await expect(activeStepLabel).toHaveText(newStatus);
  }

  async deleteProject(): Promise<void> {
    await getDeleteProjectButton(this.page).click();
    await expect(getDeleteConfirmText(this.page)).toBeVisible();
    await getDeleteConfirmButton(this.page).click();
    await expect(getProjectDeletedToast(this.page)).toBeVisible({ timeout: 45000 });
  }
}
