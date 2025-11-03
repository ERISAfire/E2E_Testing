import { Page, Locator } from '@playwright/test';

// Navigation
export const getPlanManagerLink = (page: Page): Locator =>
  page.getByRole('link', { name: 'Plan Manager' });

// Employer selection
export const getEmployerDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Employer' });
export const getEmployerOption = (page: Page, employerName: string): Locator =>
  page.getByRole('option', { name: employerName });

// Main actions
export const getNewPlanButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'New Plan' });
export const getNextButton = (page: Page): Locator => page.getByRole('button', { name: 'Next' });
export const getBackNextComposite = (page: Page): Locator => page.getByText('BackNext');
export const getFinishButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Finish' });
export const getUpdateButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Update' });
export const getNewPlanModalTitle = (page: Page): Locator =>
  page.getByRole('heading', { name: 'New plan year' });
// Active dialog container
export const getActiveDialog = (page: Page): Locator => page.getByRole('dialog');

// Robust close button selector within the active dialog
export const getDialogCloseButton = (page: Page): Locator =>
  getActiveDialog(page)
    .locator(
      'button[aria-label="close" i], button[aria-label="Close" i], [class*="MuiDialogTitle"] button, button:has(svg[data-icon="xmark"])'
    )
    .first();
export const getPlanNameRequiredError = (page: Page): Locator =>
  page.getByText('Plan name is required');
export const getPlanNumberRequiredError = (page: Page): Locator =>
  page.getByText('Plan number is required');

// General plan information
export const getGeneralPlanInfoHeader = (page: Page): Locator =>
  page.getByRole('heading', { name: 'General plan information' });
export const getPlanNameInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Plan name' });
export const getPlanNumberInput = (page: Page): Locator =>
  page.getByRole('spinbutton', { name: 'Plan number' });

// Company information
export const getCompanyInfoHeader = (page: Page): Locator =>
  page.getByRole('heading', { name: 'Company information' });
export const getSponsorCompanyNameInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Sponsor company name' });
export const getSponsorEinInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Sponsor EIN' });
export const getSponsorPhoneInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Sponsor phone' });
export const getAdministratorNameInput = (page: Page): Locator =>
  page.getByRole('textbox', { name: 'Administrator name' });

// Statuses section
export const getStatusesHeader = (page: Page): Locator =>
  page.getByRole('heading', { name: 'Statuses' });
export const getErisaStatusDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: /ERISA status/i });
export const getAcaStatusDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: /ACA status/i });
export const getParticipantsDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: /Participants on plan’s first/i });
export const getCobraStatusDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: /COBRA status/i });
export const getMarketSegmentDropdown = (page: Page): Locator =>
  page.getByRole('combobox', { name: /Market segment/i });
export const getSelectOptionByName = (page: Page, option: string): Locator =>
  page.getByRole('option', { name: option });

// Toasts
export const getCreationSuccessToast = (page: Page): Locator =>
  page.getByText('New plan has been added.');
export const getUpdateSuccessToast = (page: Page): Locator =>
  page.getByText('Plan has been updated.');

// Timeline (vis.js)
export const getTimelineCenterPanel = (page: Page): Locator =>
  page.locator('.vis-panel.vis-center');
export const getTimelineGroup = (page: Page): Locator =>
  page.locator('.vis-foreground > .vis-group');
export const getPlanItemInTimeline = (page: Page, text: string): Locator => page.getByText(text);

// Accordions toggle button within section by title
export const getSectionToggleByTitle = (page: Page, title: string): Locator =>
  page
    .locator('div')
    .filter({ hasText: new RegExp(`^${title}$`) })
    .getByRole('button');

// Delete Plan Year flow
export const getDeletePlanYearButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Delete Plan Year' });

export const getDeletePlanYearModalContent = (page: Page): Locator =>
  page.locator('.MuiDialogContent-root');

export const getDeleteConfirmButton = (page: Page): Locator =>
  page.getByRole('button', { name: /^Delete$/ });

// Coverages section
export const getAddCoverageButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add Coverage' });
export const getCoverageTypeCombobox = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Coverage type' });
export const getCoverageTypeOption = (page: Page, name: string): Locator =>
  page.getByRole('option', { name });
export const getCoverageAttributeCombobox = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Coverage attribute' });
export const getCoverageAddButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Add' });
export const getCoverageSaveButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Save' });
export const getCoverageCardHeading = (page: Page, name: string): Locator =>
  page.getByRole('heading', { name });
export const getCoverageKebabButtons = (page: Page): Locator =>
  page.locator('#plan-card-container').getByRole('button').filter({ hasText: /^$/ });
export const getCoverageMenuEdit = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Edit' });
export const getCoverageMenuDelete = (page: Page): Locator =>
  page.getByRole('menuitem', { name: 'Delete' });
export const getDeleteCoverageModal = (page: Page): Locator => page.getByLabel('Delete coverage');

// Coverage: precise kebab button for a given card heading
export const getCoverageCardContainerByHeading = (page: Page, name: string): Locator =>
  getCoverageCardHeading(page, name).locator(
    'xpath=ancestor::div[contains(@id,"plan-card-container") or contains(@class,"MuiCard-root")][1]'
  );

export const getCoverageCardKebabButton = (page: Page, name: string): Locator =>
  getCoverageCardContainerByHeading(page, name)
    .locator('button.MuiIconButton-root:not([aria-label="Download all"])')
    .filter({ has: page.locator('svg') })
    .first();

// Coverage toasts
export const getCoverageCreatedToast = (page: Page): Locator =>
  page.getByText('Coverage has been created.');
export const getCoverageUpdatedToast = (page: Page): Locator =>
  page.getByText('Coverage has been updated.');
export const getCoverageDeletedToast = (page: Page): Locator =>
  page.getByText('Coverage has been deleted.');

// Files: Open enrollment guide
export const getOpenEnrollmentGuideHeading = (page: Page): Locator =>
  page
    .locator('h6')
    .filter({ hasText: /^Open enrollment guide$/ })
    .first();

export const getOpenEnrollmentGuideCard = (page: Page): Locator =>
  getOpenEnrollmentGuideHeading(page).locator(
    'xpath=ancestor::div[contains(@class,"_filesCard_") or contains(@class,"MuiCard-root") or contains(@class,"MuiPaper")][1]'
  );

export const getOpenEnrollmentGuideUploadButton = (page: Page): Locator =>
  getOpenEnrollmentGuideCard(page).locator('button:has-text("Upload files")');

export const getOpenEnrollmentGuideEmptyState = (page: Page): Locator =>
  getOpenEnrollmentGuideCard(page).getByText('No file uploaded yet.', { exact: true });

// Generic helper: first file input inside the active dialog (if upload opens a modal)
export const getDialogFileInput = (page: Page): Locator =>
  getActiveDialog(page).locator('input[type="file"]').first();

// Files: deletion helpers
export const getOpenEnrollmentGuideFirstDeleteButton = (page: Page): Locator =>
  getOpenEnrollmentGuideCard(page)
    .locator('button.MuiIconButton-root:has(svg[data-icon="trash"]), button[aria-label="Delete" i]')
    .first();

export const getFileDeletedToast = (page: Page): Locator =>
  page.getByText('File has been deleted.');
