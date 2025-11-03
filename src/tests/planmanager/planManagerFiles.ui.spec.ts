import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { PlanManagerPage } from '../../ui/pages/PlanManagerPage.js';
import {
  getFileDeletedToast,
  getOpenEnrollmentGuideFirstDeleteButton,
} from '../../ui/selectors/planManager.selectors.js';

// Tiny valid PDF ("Schedule A") as base64 to avoid committing binary assets
// Generated minimal PDF that renders text "Schedule A"
const SCHEDULE_A_PDF_BASE64 =
  'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUj4+CmVuZG9iagoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxPj4KZW5kb2JqCgozIDAgb2JqCjw8L1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSPj4+Pj4+CmVuZG9iagoKNCAwIG9iago8PC9MZW5ndGggNDQ+PgpzdHJlYW0KQlQKL0YxIDEyIFRmIDcyIDEyMCBUZCAoU2NoZWR1bGUgQSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKNSAwIG9iago8PC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvTmFtZSAvRjEgL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA2MyAwMDAwMCBuIAowMDAwMDAwMTQ1IDAwMDAwIG4gCjAwMDAwMDAyNDMgMDAwMDAgbiAKMDAwMDAwMDM2NiAwMDAwMCBuIAowMDAwMDAwNDY5IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2IC9Sb290IDEgMCBSIC9JbmZvIDYgMCBSPj4Kc3RhcnR4cmVmCjUwNgolJUVPRg==';

function ensureScheduleAPdfOnDisk(): string {
  const tmpDir = path.resolve(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const filePath = path.join(tmpDir, 'schedule_a.pdf');
  fs.writeFileSync(filePath, Buffer.from(SCHEDULE_A_PDF_BASE64, 'base64'));
  return filePath;
}

// New UI test focused on file upload/delete flow for Plan Manager

test.describe.serial('Plan Manager UI - Files @ui @plans @regression @plan', () => {
  test('should upload and delete Schedule A file for a plan', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);

    // Create a new plan via existing page object flow
    const planManager = new PlanManagerPage(page);
    await planManager.navigate();

    await planManager.selectEmployer('Automation_Tests');
    await planManager.startNewPlan();

    const uniqueSuffix = Date.now().toString().slice(-6);
    const planName = `Automation Files Test ${uniqueSuffix}`;

    await planManager.fillGeneralPlanInformation({ planName, planNumber: '1' });
    await planManager.fillCompanyInformation({ sponsorCompanyName: 'Advice Corp' });
    await planManager.fillStatuses({
      erisaStatus: 'Non-ERISA',
      acaStatus: '50+ Full-Time Equivalents',
      participantsOnFirst: '100+',
      cobraStatus: '20+',
      marketSegment: '100-500',
    });
    await planManager.finishCreation();

    // Open the created plan from the timeline
    await planManager.openPlanFromTimeline(planName);

    // Scroll to the Open enrollment guide card
    const oeHeading = page
      .locator('h6')
      .filter({ hasText: /^Open enrollment guide$/ })
      .first();
    await oeHeading.scrollIntoViewIfNeeded();

    // Resolve its card container and Upload files button
    const oeCard = oeHeading.locator(
      'xpath=ancestor::div[contains(@class,"_filesCard_") or contains(@class,"MuiCard-root") or contains(@class,"MuiPaper")][1]'
    );
    await oeCard.waitFor({ state: 'visible', timeout: 15000 });
    const uploadBtn = oeCard.locator('button:has-text("Upload files")');
    await uploadBtn.waitFor({ state: 'visible', timeout: 10000 });
    await uploadBtn.scrollIntoViewIfNeeded();

    // Click Upload files and upload from disk (handle chooser or hidden input)
    const pdfPath = ensureScheduleAPdfOnDisk();
    await uploadBtn.click();
    const chooser = await page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
    if (chooser) {
      await chooser.setFiles(pdfPath);
    } else {
      const dialog = page.getByRole('dialog');
      const dialogInput = dialog.locator('input[type="file"]').first();
      if (await dialogInput.count()) {
        await dialogInput.setInputFiles(pdfPath);
      } else {
        const pageInput = page.locator('input[type="file"]').first();
        await pageInput.setInputFiles(pdfPath);
      }
    }

    // Verify file appears (list item should show and have a delete button)
    // Verify in-card empty state disappears or an item appears
    const emptyState = oeCard.getByText('No file uploaded yet.');
    await expect(emptyState).toBeHidden({ timeout: 20000 });

    // Delete the uploaded file
    // Optional cleanup: click first delete button inside this card if present
    const deleteBtnInCard = getOpenEnrollmentGuideFirstDeleteButton(page);
    if (await deleteBtnInCard.count()) {
      await deleteBtnInCard.click();
    }

    // Verify deletion toast
    await expect(getFileDeletedToast(page)).toBeVisible();

    // Finally, delete the plan year to clean up (reuse existing page object flow)
    await planManager.deletePlanYear(planName);
  });
});
