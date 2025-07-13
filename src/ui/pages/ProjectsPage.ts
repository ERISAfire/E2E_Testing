/**
 * Projects Page Object
 *
 * This class represents the Projects page in the application and provides
 * methods to interact with its elements and perform actions.
 * It follows the Page Object design pattern for better maintainability.
 */
import { BasePage } from '../../core/base/BasePage';
//import { projectsSelectors } from '../../ui/selectors/projects.selectors';
import type { Page } from '@playwright/test';

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
    await this.assertions.shouldBeVisible(titleLocator);
    await this.assertions.shouldHaveText(titleLocator, 'Projects');
  }
}
