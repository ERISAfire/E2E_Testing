import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage.js';
import {
  getAddNewButton,
  getAppSettingsLink,
  getComplianceEventRulesCreateButton,
  getComplianceEventRuleNameInput,
  getAdministratorNoteInput,
  getHelpArticleUrlInput,
  getComplianceEventRuleColorInput,
  getAssociatedProjectTemplateCombo,
  getPreventDuplicationRuleCombo,
  getDueDateRuleSelect,
  getDaysBeforeSpinButton,
  getDueDateReferenceCombo,
  getEarliestPossibleEventDateInput,
  getLatestPossibleEventDateInput,
  getReminderSpinButton,
  getXDaysBeforeOption,
  getPlanYearBeginDateOption,
  getProjectTemplateMenuOption,
  getNextButton,
  getFinishButton,
  getSaveButton,
  getCloseButton,
  getModalContent,
  getErisaStatusCombobox,
  getMarketSegmentCombobox,
  getCreatedToast,
  getUpdatedToast,
  getDeletedToast,
  getDeleteConfirmButton,
  getDeleteConfirmationModal,
  getDeleteConfirmationText,
  getExpandRowButton,
  getGeneralDetailsTab,
  getStatusesTab,
  getCoveragesTab,
  getReminderTimingTab,
  getExpandedHelpArticleUrl,
  getExpandedPreventDuplicationRule,
  getComplianceEventRuleNameRequiredError,
  getPreventDuplicationRuleRequiredError,
  getAssociatedProjectTemplateRequiredError,
  getAcaStatusCombobox,
  getParticipantsOnPlanFirstCombobox,
  getNewComplianceEventRuleHeading,
  getThreeDotsMenuButton,
  getEditMenuOption,
  getDeleteMenuOption,
  getReviewComplianceEventName,
  getReviewAdministratorNote,
  getReviewPreventDuplicationRule,
  getReviewAssociatedProjectTemplate,
  getReviewHelpArticleUrl,
  getReviewErisaStatus,
  getReviewAcaStatus,
  getReviewMarketSegment,
  getReviewParticipantsOnPlanFirstDays,
  getReviewEventDueDate,
  getReviewXValue,
  getReviewDueDateReferenceDay,
  getReviewEarliestPossibleEventDate,
  getReviewLatestPossibleEventDate,
  getReviewReminder,
} from '../selectors/complianceEventRule.selectors.js';

export interface ComplianceEventRuleData {
  name: string;
  adminNote?: string;
  helpUrl?: string;
  color: string;
  projectTemplateName: string;
}

export class ComplianceEventRulePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToComplianceEventRules(): Promise<void> {
    await getAppSettingsLink(this.page).click();
    await getComplianceEventRulesCreateButton(this.page).click();
  }

  async createComplianceEventRule(data: ComplianceEventRuleData): Promise<void> {
    // Start creating new rule (assuming we're already on the compliance event rules page)
    await getAddNewButton(this.page).click();

    // Step 1: Basic Information
    await getComplianceEventRuleNameInput(this.page).fill(data.name);

    if (data.adminNote) {
      await getAdministratorNoteInput(this.page).fill(data.adminNote);
    }

    if (data.helpUrl) {
      await getHelpArticleUrlInput(this.page).fill(data.helpUrl);
    }

    await getComplianceEventRuleColorInput(this.page).fill(data.color);

    // Select project template
    await getAssociatedProjectTemplateCombo(this.page).click();
    await getProjectTemplateMenuOption(this.page, data.projectTemplateName).click();

    // Select prevent duplication rule
    await getPreventDuplicationRuleCombo(this.page).click();
    // Wait for dropdown options to appear and select specific option
    await this.page.waitForSelector('[role="option"]', { state: 'visible' });
    await this.page.locator('[role="option"][data-value="1 per plan"]').click();

    // Click on modal content to activate Next button
    await getModalContent(this.page).click();

    // Continue to next step
    await getNextButton(this.page).click();

    // Step 2: Statuses

    // Participants on plan's first day - select "1-99"
    await getErisaStatusCombobox(this.page).click();
    await this.page.waitForSelector('[role="option"]', { state: 'visible' });
    await this.page.waitForTimeout(500);
    await this.page.getByText('ERISA', { exact: true }).click();

    // ACA status - select "0-49 Full-Time Equivalents"
    await getAcaStatusCombobox(this.page).click();
    await this.page.waitForSelector('[role="option"]', { state: 'visible' });
    await this.page.waitForTimeout(500);
    await this.page.getByText('0-49 Full-Time Equivalents', { exact: true }).click();

    // ERISA status - select "ERISA"
    await getParticipantsOnPlanFirstCombobox(this.page).click();
    await this.page.waitForSelector('[role="option"]', { state: 'visible' });
    await this.page.waitForTimeout(500);
    await this.page.getByText('1-99', { exact: true }).click();

    // Market segment - select "2-99"
    await getMarketSegmentCombobox(this.page).click();
    await this.page.waitForSelector('[role="option"]', { state: 'visible' });
    await this.page.waitForTimeout(500);
    await this.page.getByText('2-99 employees', { exact: true }).click();

    // Click on dialog title to activate Next button
    await getNewComplianceEventRuleHeading(this.page).click();
    await getNextButton(this.page).click();

    // Step 3: Сoverages
    await getNextButton(this.page).click();

    // Step 4: Reminder and Timing
    await getDueDateRuleSelect(this.page).click();
    await getXDaysBeforeOption(this.page).click();
    await getDaysBeforeSpinButton(this.page).fill('10');
    await getDueDateReferenceCombo(this.page).click();
    await getPlanYearBeginDateOption(this.page).click();
    await getEarliestPossibleEventDateInput(this.page).fill('01/01/2030');
    await getLatestPossibleEventDateInput(this.page).fill('01/01/2040');
    await getReminderSpinButton(this.page).fill('1');

    await getModalContent(this.page).click();
    await getNextButton(this.page).click();

    // Step 5: Final review and finish - Validate all entered data

    // Validate General details
    await expect(getReviewComplianceEventName(this.page)).toContainText(data.name);
    if (data.adminNote) {
      await expect(getReviewAdministratorNote(this.page)).toContainText(data.adminNote);
    }
    await expect(getReviewPreventDuplicationRule(this.page)).toContainText('1 per plan');
    await expect(getReviewAssociatedProjectTemplate(this.page)).toContainText(
      data.projectTemplateName
    );
    if (data.helpUrl) {
      await expect(getReviewHelpArticleUrl(this.page)).toContainText(data.helpUrl);
    }

    // Validate Statuses
    await expect(getReviewErisaStatus(this.page)).toContainText('ERISA');
    await expect(getReviewAcaStatus(this.page)).toContainText('0-49 Full-Time Equivalents');
    await expect(getReviewMarketSegment(this.page)).toContainText('2-99 employees');
    await expect(getReviewParticipantsOnPlanFirstDays(this.page)).toContainText('1-99');

    // Scroll down to see Reminder and Timing details
    await this.page.evaluate(() => window.scrollBy(0, 300));
    await this.page.waitForTimeout(500);

    // Validate Reminder and Timing details
    await expect(getReviewEventDueDate(this.page)).toContainText('X Days Before');
    await expect(getReviewXValue(this.page)).toContainText('10');
    await expect(getReviewDueDateReferenceDay(this.page)).toContainText('Plan Year Begin Date');
    await expect(getReviewEarliestPossibleEventDate(this.page)).toContainText('01-01-2030');
    await expect(getReviewLatestPossibleEventDate(this.page)).toContainText('01-01-2040');
    await expect(getReviewReminder(this.page)).toContainText('1 day before due date');

    await getFinishButton(this.page).click();

    // Wait for success toast
    await expect(getCreatedToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async editComplianceEventRule(
    currentName: string,
    newData: Partial<ComplianceEventRuleData>
  ): Promise<void> {
    // Wait for UI to stabilize after previous actions
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Find the compliance event rule row and click the three-dot menu
    const threeDotsButton = getThreeDotsMenuButton(this.page, currentName);
    await threeDotsButton.waitFor({ state: 'visible', timeout: 10000 });
    await threeDotsButton.click({ force: true });

    // Wait for menu to appear and click Edit option
    await this.page.waitForSelector('[role="menuitem"]', { state: 'visible' });
    await getEditMenuOption(this.page).click();

    // Update fields if provided
    if (newData.name) {
      await getComplianceEventRuleNameInput(this.page).clear();
      await getComplianceEventRuleNameInput(this.page).fill(newData.name);
    }

    if (newData.adminNote) {
      await getAdministratorNoteInput(this.page).clear();
      await getAdministratorNoteInput(this.page).fill(newData.adminNote);
    }

    if (newData.helpUrl) {
      await getHelpArticleUrlInput(this.page).clear();
      await getHelpArticleUrlInput(this.page).fill(newData.helpUrl);
    }

    if (newData.color) {
      await getComplianceEventRuleColorInput(this.page).clear();
      await getComplianceEventRuleColorInput(this.page).fill(newData.color);
    }

    // Navigate through stepper steps
    // Step 1 -> Step 2: Statuses
    await getModalContent(this.page).click();
    await getNextButton(this.page).click();

    // Step 2 -> Step 3: Coverages
    //await getNewComplianceEventRuleHeading(this.page).click();
    await getNextButton(this.page).click();

    // Step 3 -> Step 4: Reminder and Timing
    await getNextButton(this.page).click();

    // Step 4 -> Step 5: Final review
    //await getModalContent(this.page).click();
    await getNextButton(this.page).click();

    // Step 5: Save changes
    await getSaveButton(this.page).click();

    // Wait for success toast
    await expect(getUpdatedToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async verifyCreatedComplianceEventRule(
    name: string,
    expectedData: { helpUrl?: string; preventDuplicationRule?: string }
  ): Promise<void> {
    // Wait for the page to be fully loaded and expand button to be enabled
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000); // Additional wait for UI to stabilize

    // Expand the created rule row
    const expandButton = getExpandRowButton(this.page, name);
    await expandButton.waitFor({ state: 'visible', timeout: 10000 });
    await expandButton.click({ force: true });

    // Verify tabs are visible
    await expect(getGeneralDetailsTab(this.page)).toBeVisible({ timeout: 10000 });
    await expect(getStatusesTab(this.page)).toBeVisible({ timeout: 5000 });
    await expect(getCoveragesTab(this.page)).toBeVisible({ timeout: 5000 });
    await expect(getReminderTimingTab(this.page)).toBeVisible({ timeout: 5000 });

    // Verify expanded details content
    if (expectedData.helpUrl) {
      await expect(getExpandedHelpArticleUrl(this.page)).toHaveText(expectedData.helpUrl);
    }

    if (expectedData.preventDuplicationRule) {
      await expect(getExpandedPreventDuplicationRule(this.page)).toHaveText(
        expectedData.preventDuplicationRule
      );
    }

    // Note: We don't collapse the row back as it's not critical for the test
    // and the expand button state might change after expansion
  }

  async deleteComplianceEventRule(name: string): Promise<void> {
    // Wait for UI to stabilize after previous actions
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // Find the compliance event rule row and click the three-dot menu
    const threeDotsButton = getThreeDotsMenuButton(this.page, name);
    await threeDotsButton.waitFor({ state: 'visible', timeout: 10000 });
    await threeDotsButton.click({ force: true });

    // Wait for menu to appear and click Delete option
    await this.page.waitForSelector('[role="menuitem"]', { state: 'visible' });
    await getDeleteMenuOption(this.page).click();

    // Verify delete confirmation modal appears with correct content
    await expect(getDeleteConfirmationModal(this.page)).toBeVisible({ timeout: 5000 });
    await expect(getDeleteConfirmationText(this.page, name)).toBeVisible({ timeout: 5000 });

    // Confirm deletion
    await getDeleteConfirmButton(this.page).click();

    // Wait for success toast
    await expect(getDeletedToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async assertValidationOnEmptySave(): Promise<void> {
    await getAddNewButton(this.page).click();

    // Trigger validation by clicking on required fields and then outside
    // Click on compliance event rule name field and then outside
    await getComplianceEventRuleNameInput(this.page).click();
    await getModalContent(this.page).click();
    await expect(getComplianceEventRuleNameRequiredError(this.page)).toBeVisible({ timeout: 5000 });

    // Click on prevent duplication rule field and then outside
    await getPreventDuplicationRuleCombo(this.page).click();
    await this.page.keyboard.press('Escape'); // Close dropdown
    await getNewComplianceEventRuleHeading(this.page).click();
    await expect(getPreventDuplicationRuleRequiredError(this.page)).toBeVisible({ timeout: 5000 });

    // Click on associated project template field and then outside
    await getAssociatedProjectTemplateCombo(this.page).click();
    await this.page.keyboard.press('Escape'); // Close dropdown
    await getNewComplianceEventRuleHeading(this.page).click();
    await expect(getAssociatedProjectTemplateRequiredError(this.page)).toBeVisible({
      timeout: 5000,
    });

    // Verify that Next button is disabled when required fields are empty
    await expect(getNextButton(this.page)).toBeDisabled();

    // Close the modal using X button
    await getCloseButton(this.page).click();

    // Wait for modal to close
    await this.page.waitForTimeout(1000);
  }

  async waitForPageLoad(): Promise<void> {
    // Wait for the compliance event rules page to load
    await expect(getComplianceEventRulesCreateButton(this.page)).toBeVisible({ timeout: 30000 });
  }
}
