import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { PlanManagerPage } from '../../ui/pages/PlanManagerPage.js';

// UI test for Coverage CRUD within Plan Manager
// Flow: Create plan -> Add coverage -> Edit coverage -> Delete coverage -> Cleanup plan year

test.describe.serial('Plan Manager UI - Coverage @ui @plans @regression @plan', () => {
  test('should add, edit, and delete a coverage in a plan, then delete the plan year', async ({
    page,
  }) => {
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
    const planName = `Automation Coverage Test ${uniqueSuffix}`;

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

    // Coverage CRUD using page object helpers
    await planManager.addCoverage({ type: 'Voluntary Life (4B)', attributeName: 'test name' });
    await planManager.openCoverageCard('Voluntary Life (4B)');
    await planManager.editCoverageType({
      from: 'Voluntary Life (4B)',
      to: 'Voluntary ADD (4L 4Q)',
    });
    await planManager.deleteCoverage('Voluntary ADD (4L 4Q)');

    // Cleanup: delete the plan year
    await planManager.deletePlanYear(planName);
  });
});
