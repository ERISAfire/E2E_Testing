import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { CoverageTypePage } from '../../ui/pages/CoverageTypePage.js';

test.describe.serial('Coverage Types UI E2E', () => {
  test('should create, edit, delete a coverage type and validate form fields @smoke @regression @ui @coverageType', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);
    const coverageTypePage = new CoverageTypePage(page);

    const timestamp = Date.now();
    const testName = `Auto_Test_${timestamp}`;
    const updatedTestName = `${testName}_Updated`;

    await coverageTypePage.createCoverageType({
      name: testName,
      iconOption: '1',
      rowRadios: [
        { row: '4A', index: 0 },
        { row: '4B', index: 1 },
        { row: 'Hearing Aid', index: 2 },
        { row: 'Excepted Benefit', index: 0 },
        { row: 'Integrated', index: 1 },
        { row: 'Self-insured', index: 2 },
        { row: 'After-Tax', index: 1 },
      ],
    });

    await coverageTypePage.editCoverageType(testName, updatedTestName, [
      { row: '4A', index: 1 },
      { row: '4B', index: 2 },
    ]);

    await coverageTypePage.archiveCoverageType(updatedTestName);
    await coverageTypePage.unarchiveCoverageType(updatedTestName);
    await coverageTypePage.deleteCoverageType(updatedTestName);
    await coverageTypePage.assertValidationOnEmptySave();
  });
});
