import { Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base/BasePage.js';
import {
  getPlanManagerLink,
  getEmployerDropdown,
  getEmployerOption,
  getPlanNameInput,
  getPlanNumberInput,
  getNextButton,
  getBackNextComposite,
  getSponsorCompanyNameInput,
  getSponsorEinInput,
  getSponsorPhoneInput,
  getErisaStatusDropdown,
  getAcaStatusDropdown,
  getParticipantsDropdown,
  getCobraStatusDropdown,
  getMarketSegmentDropdown,
  getSelectOptionByName,
  getFinishButton,
  getUpdateButton,
  getCreationSuccessToast,
  getUpdateSuccessToast,
  getTimelineCenterPanel,
  getPlanItemInTimeline,
  getGeneralPlanInfoHeader,
  getCompanyInfoHeader,
  getSectionToggleByTitle,
  getAdministratorNameInput,
  getDeletePlanYearButton,
  getDeletePlanYearModalContent,
  getDeleteConfirmButton,
  getNewPlanButton,
  getNewPlanModalTitle,
  getPlanNameRequiredError,
  getPlanNumberRequiredError,
  getDialogCloseButton,
} from '../selectors/planManager.selectors.js';

export interface PlanGeneralInfo {
  planName: string;
  planNumber: string;
}

export interface CompanyInfo {
  sponsorCompanyName: string;
  sponsorEin?: string;
  sponsorPhone?: string;
  administratorName?: string;
}

export interface StatusesInfo {
  erisaStatus: string; // e.g. 'Non-ERISA'
  acaStatus: string; // e.g. '+ Full-Time Equivalents'
  participantsOnFirst: string; // e.g. '-99'
  cobraStatus: string; // e.g. '-19'
  marketSegment: string; // e.g. '-99 employees'
}

export class PlanManagerPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await getPlanManagerLink(this.page).click();
  }

  async selectEmployer(employerName: string): Promise<void> {
    await getEmployerDropdown(this.page).click();
    await getEmployerOption(this.page, employerName).click();
  }

  async startNewPlan(): Promise<void> {
    await getNewPlanButton(this.page).click();
  }

  async fillGeneralPlanInformation({ planName, planNumber }: PlanGeneralInfo): Promise<void> {
    await getPlanNameInput(this.page).fill(planName);
    await getPlanNumberInput(this.page).fill(planNumber);
    // proceed next
    // Some wizards render a combined BackNext area; click it to activate then click Next
    await getBackNextComposite(this.page).click();
    await getNextButton(this.page).click();
  }

  async fillCompanyInformation({
    sponsorCompanyName,
    sponsorEin,
    sponsorPhone,
  }: CompanyInfo): Promise<void> {
    await getSponsorCompanyNameInput(this.page).fill(sponsorCompanyName);
    if (sponsorEin) await getSponsorEinInput(this.page).fill(sponsorEin);
    if (sponsorPhone) await getSponsorPhoneInput(this.page).fill(sponsorPhone);
    await getBackNextComposite(this.page).click();
    await getNextButton(this.page).click();
  }

  async fillStatuses({
    erisaStatus,
    acaStatus,
    participantsOnFirst,
    cobraStatus,
    marketSegment,
  }: StatusesInfo): Promise<void> {
    await getErisaStatusDropdown(this.page).click();
    await getSelectOptionByName(this.page, erisaStatus).click();

    await getAcaStatusDropdown(this.page).click();
    await getSelectOptionByName(this.page, acaStatus).click();

    await getParticipantsDropdown(this.page).click();
    await getSelectOptionByName(this.page, participantsOnFirst).click();

    await getCobraStatusDropdown(this.page).click();
    await getSelectOptionByName(this.page, cobraStatus).click();

    await getMarketSegmentDropdown(this.page).click();
    await getSelectOptionByName(this.page, marketSegment).click();

    await getNextButton(this.page).click();
  }

  async finishCreation(): Promise<void> {
    // Toggle through headers to ensure sections fold/unfold as in user flow (optional)
    await getGeneralPlanInfoHeader(this.page).click();
    await getCompanyInfoHeader(this.page).click();
    //await getSectionToggleByTitle(this.page, 'Statuses').click();

    await getFinishButton(this.page).click();
    await expect(getCreationSuccessToast(this.page)).toBeVisible({ timeout: 45000 });
    // Give the timeline a moment to render the newly created item
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  async openPlanFromTimeline(textToFind: string): Promise<void> {
    // Ensure the timeline panel is present and focused
    const panel = getTimelineCenterPanel(this.page);
    await panel.waitFor({ state: 'visible', timeout: 10000 });
    await panel.scrollIntoViewIfNeeded();
    await panel.click();

    // Prefer dragging the vis-foreground layer which captures interactions in vis.js
    const foreground = this.page.locator('.vis-panel.vis-center .vis-content .vis-foreground');
    const content = this.page.locator('.vis-panel.vis-center .vis-content');
    const dragTarget = (await foreground.isVisible())
      ? foreground
      : (await content.isVisible())
        ? content
        : panel;
    await dragTarget.click();

    // Attempt to find the item, panning the timeline to the right (which scrolls view left)
    for (let i = 0; i < 12; i++) {
      const item = getPlanItemInTimeline(this.page, textToFind);
      if (await item.isVisible()) {
        // Ensure the item is not hidden under the left sidebar; if so, pan more to the right
        const panelBox = await panel.boundingBox();
        let itemBox = await item.boundingBox();

        if (panelBox && itemBox) {
          const safeLeft = panelBox.x + 160; // sidebar safety margin
          let safetyAttempts = 0;
          while (itemBox.x < safeLeft && safetyAttempts < 5) {
            // Pan further to the right to move view left
            const dragBox =
              (await this.page
                .locator('.vis-panel.vis-center .vis-content .vis-foreground')
                .boundingBox()) || panelBox;
            const startX = dragBox.x + Math.max(40, Math.min(80, dragBox.width * 0.1));
            const startY = dragBox.y + dragBox.height / 2;
            await this.page.mouse.move(startX, startY);
            await this.page.mouse.down();
            await this.page.mouse.move(startX + 600, startY, { steps: 12 });
            await this.page.mouse.up();
            await this.page.waitForTimeout(300);
            itemBox = (await item.boundingBox()) || itemBox;
            safetyAttempts++;
          }

          // Click via absolute coordinates to avoid auto-scroll that reintroduces sidebar overlay
          const clickX = Math.max(itemBox.x + itemBox.width / 2, safeLeft + 10);
          const clickY = itemBox.y + itemBox.height / 2;
          await this.page.mouse.click(clickX, clickY);
          return;
        }

        // Fallback to normal click if bounding boxes are not available
        await item.click();
        return;
      }

      const box = await dragTarget.boundingBox();
      if (box) {
        const startX = box.x + Math.max(40, Math.min(80, box.width * 0.1)); // safe inside the panel
        const startY = box.y + box.height / 2; // keep Y fixed to avoid vertical scroll
        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        // Drag to the right by 700px to move the visible window to earlier dates
        await this.page.mouse.move(startX + 700, startY, { steps: 14 });
        await this.page.mouse.up();
      }
      await this.page.waitForTimeout(500);
    }

    // If not found after attempts, let the click throw for debugging
    await getPlanItemInTimeline(this.page, textToFind).click();
  }

  async updateGeneralPlanInformation(update: PlanGeneralInfo): Promise<void> {
    // Open accordion for General plan information
    await getSectionToggleByTitle(this.page, 'General plan information').click();
    await getPlanNameInput(this.page).fill(update.planName);
    await getPlanNumberInput(this.page).fill(update.planNumber);
    await getUpdateButton(this.page).click();
    await expect(getUpdateSuccessToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async updateCompanyInformation(update: CompanyInfo): Promise<void> {
    await getSectionToggleByTitle(this.page, 'Company information').click();
    if (update.sponsorCompanyName) {
      await getSponsorCompanyNameInput(this.page).fill(update.sponsorCompanyName);
    }
    if (update.administratorName) {
      await getAdministratorNameInput(this.page).fill(update.administratorName);
    }
    await getUpdateButton(this.page).click();
    await expect(getUpdateSuccessToast(this.page)).toBeVisible({ timeout: 45000 });
  }

  async deletePlanYear(expectedPlanName: string): Promise<void> {
    // Scroll to bottom where the Delete Plan Year button is located
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const delBtn = getDeletePlanYearButton(this.page);
    await delBtn.scrollIntoViewIfNeeded();
    await delBtn.click();

    // Verify modal content text contains the expected plan name and the permanence note
    const modalContent = getDeletePlanYearModalContent(this.page);
    await expect(modalContent).toBeVisible();
    await expect(modalContent).toContainText(`Are you sure you want to delete the`);
    await expect(modalContent).toContainText(expectedPlanName);
    await expect(modalContent).toContainText(
      'This action will remove the plan year permanently and cannot be undone.'
    );

    // Confirm deletion
    await getDeleteConfirmButton(this.page).click();
    // Optionally wait for modal to close
    await expect(modalContent).toBeHidden({ timeout: 20000 });
  }

  async assertNewPlanValidation(): Promise<void> {
    // Open New Plan modal
    await getNewPlanButton(this.page).click();
    await expect(getNewPlanModalTitle(this.page)).toBeVisible();

    // Trigger validation by focusing required fields and blurring
    await getPlanNameInput(this.page).click();
    await getPlanNumberInput(this.page).click();
    // Click on the modal title area to blur inputs
    await getNewPlanModalTitle(this.page).click();

    // Assert validation errors
    await expect(getPlanNameRequiredError(this.page)).toBeVisible();
    await expect(getPlanNumberRequiredError(this.page)).toBeVisible();

    // Assert Next button disabled
    await expect(getNextButton(this.page)).toBeDisabled();

    // Close the modal
    await getDialogCloseButton(this.page).click();
  }
}
