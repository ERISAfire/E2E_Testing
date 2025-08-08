import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage';
import { CoverageTypePage } from '../../ui/pages/CoverageTypePage';

test.describe('Coverage Types UI E2E', () => {
  test('should create, edit and delete a coverage type @regression @ui @e2e @coverageType', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);
    const coverageTypePage = new CoverageTypePage(page);
    // Create coverage type
    await coverageTypePage.createCoverageType({
      name: 'Auto_Test',
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
    // Edit created coverage type
    await coverageTypePage.editCoverageType('Auto_Test', 'Auto_Test_Updated', [
      { row: '4A', index: 1 },
      { row: '4B', index: 2 },
    ]);
    // Archive the edited coverage type
    await coverageTypePage.archiveCoverageType('Auto_Test_Updated');
    // Unarchive the edited coverage type
    await coverageTypePage.unarchiveCoverageType('Auto_Test_Updated');
    // Delete the edited coverage type
    await coverageTypePage.deleteCoverageType('Auto_Test_Updated');

    // Validation after deletion: creating a new type
    await coverageTypePage.assertValidationOnEmptySave();
  });
});
