import { Page, Locator } from '@playwright/test';

// Navigation selectors
export const getAddNewButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add new' });

export const getAppSettingsLink = (page: Page): Locator =>
  page.getByRole('link', { name: 'App Settings' });

export const getComplianceEventRulesCreateButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Compliance Event Rules Create' });

// Form selectors - Basic Info
export const getComplianceEventRuleNameInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Compliance event rule name' });

export const getAdministratorNoteInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Administrator note' });

export const getHelpArticleUrlInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Help article URL' });

export const getComplianceEventRuleColorInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Compliance event rule color *' });

export const getAssociatedProjectTemplateCombo = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Associated project template' });

export const getPreventDuplicationRuleCombo = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Prevent duplication rule' });

export const getPreventDuplicationRuleComboByPlaceholder = (page: Page): Locator =>
  page.locator('div[role="combobox"]').filter({ hasText: 'Select option' });

// Form selectors - Plan Criteria
export const getParticipantsOnPlanFirstCombo = (page: Page): Locator =>
  page.getByRole('combobox', { name: "Participants on plan's first" });

export const getMarketSegmentCombo = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Market segment Select number' });

export const getErisaStatusComboByRole = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'ERISA status Select ERISA' });

// Form selectors - Due Date Rules
export const getDueDateRuleSelect = (page: Page): Locator =>
  page.getByText('Select a rule for due date');

export const getDaysBeforeSpinButton = (page: Page): Locator =>
  page.getByRole('spinbutton', { name: 'X' });

export const getDueDateReferenceCombo = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Due date reference day Select' });

export const getEarliestPossibleEventDateInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Earliest possible event date' });

export const getLatestPossibleEventDateInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Latest possible event date' });

export const getReminderSpinButton = (page: Page): Locator =>
  page.getByRole('spinbutton', { name: 'Reminder' });

// Option selectors
export const getSelectOption = (page: Page): Locator =>
  page.getByRole('option', { name: 'Select option' });

export const getAnyOption = (page: Page): Locator => page.getByRole('option', { name: 'Any' });

export const getMinus99Option = (page: Page): Locator => page.getByRole('option', { name: '-99' });

export const getMinus99EmployeesOption = (page: Page): Locator =>
  page.getByRole('option', { name: '-99 employees' });

export const getErisaOption = (page: Page): Locator =>
  page.getByRole('option', { name: 'ERISA', exact: true });

export const getXDaysBeforeOption = (page: Page): Locator =>
  page.getByRole('option', { name: 'X Days Before' });

export const getPlanYearBeginDateOption = (page: Page): Locator =>
  page.getByRole('option', { name: 'Plan Year Begin Date' });

// Menu selectors
export const getPreventDuplicationRuleMenuFirstDiv = (page: Page): Locator =>
  page.locator('#menu-preventDuplicationRule div').first();

export const getPreventDuplicationRuleOption = (page: Page): Locator =>
  page.getByRole('option', { name: '1 per plan' });

export const getPreventDuplicationRuleFirstOption = (page: Page): Locator =>
  page.locator('[role="option"]').first();

export const getProjectTemplateMenuFirstDiv = (page: Page): Locator =>
  page.locator('#menu-templateId div').first();

// Button selectors
export const getFormSaveButton = (page: Page): Locator =>
  page.locator('form').getByRole('button', { name: 'Save' });

export const getFormButton = (page: Page): Locator => page.locator('form').getByRole('button');

export const getNextButton = (page: Page): Locator => page.getByRole('button', { name: 'Next' });

export const getFinishButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Finish' });

export const getSaveButton = (page: Page): Locator => page.getByRole('button', { name: 'Save' });

export const getCancelButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Cancel' });

export const getCloseButton = (page: Page): Locator =>
  page.locator('.MuiDialog-paper button').first();

// Modal and overlay selectors
export const getBackdropInvisible = (page: Page): Locator =>
  page.locator('.MuiBackdrop-root.MuiBackdrop-invisible');

export const getNewComplianceEventRuleHeading = (page: Page): Locator =>
  page.getByRole('heading', { name: 'New compliance event rule' });

export const getModalDialog = (page: Page): Locator => page.locator('.MuiDialog-paper');

export const getModalContent = (page: Page): Locator => page.locator('.MuiDialogContent-root');

// Step 2: Statuses selectors
export const getParticipantsOnPlanFirstCombobox = (page: Page): Locator =>
  page.locator('[role="combobox"]').filter({ hasText: 'Select market segment' });

export const getAcaStatusCombobox = (page: Page): Locator =>
  page.locator('[role="combobox"]').filter({ hasText: 'Select ACA status' });

export const getMarketSegmentCombobox = (page: Page): Locator =>
  page.locator('[role="combobox"]').filter({ hasText: 'Select number of employees' });

export const getErisaStatusCombobox = (page: Page): Locator =>
  page.locator('[role="combobox"]').filter({ hasText: 'Select ERISA status' });

// Toast messages
export const getCreatedToast = (page: Page): Locator =>
  page.getByText('Event rule has been added.');

export const getUpdatedToast = (page: Page): Locator =>
  page.locator('.MuiAlert-message').filter({ hasText: 'Event rule has been updated.' });

export const getDeletedToast = (page: Page): Locator =>
  page.locator('.MuiAlert-message').filter({ hasText: 'Event rule has been deleted.' });

// Row actions
export const getComplianceEventRuleRow = (page: Page, name: string): Locator =>
  page.getByText(name).locator('..');

export const getThreeDotsMenuButton = (page: Page, name: string): Locator =>
  page.getByText(name).locator('..').getByTestId('MoreVertIcon');

export const getEditMenuOption = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Edit' });

export const getDeleteMenuOption = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Delete' });

export const getDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete' });

export const getDeleteConfirmationModal = (page: Page): Locator =>
  page.locator('.MuiDialogContent-root');

export const getDeleteConfirmationText = (page: Page, ruleName: string): Locator =>
  page
    .locator('.MuiDialogContent-root')
    .filter({ hasText: `Are you sure you want to delete the ${ruleName} compliance event rule?` });

// Expand row functionality
export const getExpandRowButton = (page: Page, ruleName: string): Locator =>
  page.locator(`tr:has-text("${ruleName}")`).locator('button[aria-label="expand row"]');

// Expanded rule details verification
export const getGeneralDetailsTab = (page: Page): Locator =>
  page.getByRole('button', { name: 'General Details' });

export const getStatusesTab = (page: Page): Locator =>
  page.getByRole('button', { name: 'Statuses' });

export const getCoveragesTab = (page: Page): Locator =>
  page.getByRole('button', { name: 'Coverages' });

export const getReminderTimingTab = (page: Page): Locator =>
  page.getByRole('button', { name: 'Reminder & Timing' });

export const getExpandedHelpArticleUrl = (page: Page): Locator =>
  page.locator('div._col_yooz0_13:has(h6:has-text("Help article URL")) p');

export const getExpandedPreventDuplicationRule = (page: Page): Locator =>
  page.locator('div._col_yooz0_13:has(h6:has-text("Prevent duplication rule")) p');

// Validation

export const getComplianceEventRuleNameRequiredError = (page: Page): Locator =>
  page.locator('text=Compliance event rule name is required');

export const getPreventDuplicationRuleRequiredError = (page: Page): Locator =>
  page.getByText('This field is required').first();

export const getAssociatedProjectTemplateRequiredError = (page: Page): Locator =>
  page.getByText('This field is required').nth(1);

// Project template selection
export const getProjectTemplateOption = (page: Page, templateName: string): Locator =>
  page.getByRole('option', { name: templateName });

export const getProjectTemplateMenuOption = (page: Page, templateName: string): Locator =>
  page.locator('#menu-templateId').getByText(templateName);

// Final review validation selectors
export const getReviewComplianceEventName = (page: Page): Locator =>
  page.locator('h6:has-text("Compliance event name") + p');

export const getReviewAdministratorNote = (page: Page): Locator =>
  page.locator('h6:has-text("Administrator note") + p');

export const getReviewComplianceEventColor = (page: Page): Locator =>
  page.locator('h6:has-text("Compliance event rule color") + div');

export const getReviewPreventDuplicationRule = (page: Page): Locator =>
  page.locator('h6:has-text("Prevent duplication rule") + p');

export const getReviewAssociatedProjectTemplate = (page: Page): Locator =>
  page.locator('h6:has-text("Associated project template") + p');

export const getReviewHelpArticleUrl = (page: Page): Locator =>
  page.locator('h6:has-text("Help article URL") + p');

export const getReviewErisaStatus = (page: Page): Locator =>
  page.locator('h6:has-text("ERISA status") + p');

export const getReviewAcaStatus = (page: Page): Locator =>
  page.locator('h6:has-text("ACA status") + p');

export const getReviewMarketSegment = (page: Page): Locator =>
  page.locator('h6:has-text("Market segment") + p');

export const getReviewParticipantsOnPlanFirstDays = (page: Page): Locator =>
  page.locator('h6').filter({ hasText: 'Participants on plan' }).locator('+ p');

export const getReviewEventDueDate = (page: Page): Locator =>
  page.locator('h6:has-text("Event due date") + p');

export const getReviewXValue = (page: Page): Locator => page.locator('h6:has-text("X value") + p');

export const getReviewDueDateReferenceDay = (page: Page): Locator =>
  page.locator('h6:has-text("Due date reference day") + p');

export const getReviewEarliestPossibleEventDate = (page: Page): Locator =>
  page.locator('h6:has-text("Earliest possible event date") + p');

export const getReviewLatestPossibleEventDate = (page: Page): Locator =>
  page.locator('h6:has-text("Latest possible event date") + p');

export const getReviewReminder = (page: Page): Locator =>
  page.locator('h6:has-text("Reminder") + p');
