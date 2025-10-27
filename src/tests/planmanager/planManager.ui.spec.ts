import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { PlanManagerPage } from '../../ui/pages/PlanManagerPage.js';

test.describe.serial('Plan Manager UI E2E', () => {
  test('should create, open from timeline, edit and delete a plan @smoke @regression @ui @plan', async ({
    page,
  }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);

    const planManager = new PlanManagerPage(page);

    // Navigate to Plan Manager
    await planManager.navigate();

    // Select Employer and start New Plan
    await planManager.selectEmployer('Automation_Tests');
    await planManager.startNewPlan();

    // Fill wizard steps
    await planManager.fillGeneralPlanInformation({
      planName: 'Automation Tests',
      planNumber: '1',
    });

    await planManager.fillCompanyInformation({
      sponsorCompanyName: 'Auto Tests',
      sponsorEin: '12-3456789',
      sponsorPhone: '123-456-7890',
    });

    await planManager.fillStatuses({
      erisaStatus: 'Non-ERISA',
      acaStatus: '+ Full-Time Equivalents',
      participantsOnFirst: '-99',
      cobraStatus: '-19',
      marketSegment: '-99 employees',
    });

    await planManager.finishCreation();

    // Open created plan from timeline (scrolling left if needed)
    await planManager.openPlanFromTimeline('Automation Tests 1');

    // Update General plan information
    await planManager.updateGeneralPlanInformation({
      planName: 'Automation Tests Updated',
      planNumber: '2',
    });

    // Update Company information
    await planManager.updateCompanyInformation({
      sponsorCompanyName: 'Advice Corp Updated',
      administratorName: 'John',
    });

    // Delete the plan year and validate modal text
    await planManager.deletePlanYear('Automation Tests Updated');

    // Validate New Plan modal required fields AFTER deletion
    await planManager.assertNewPlanValidation();
  });
});
