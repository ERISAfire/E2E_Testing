import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage';
import { CoverageTypePage } from '../../ui/pages/CoverageTypePage';

test.describe('Coverage Types UI E2E', () => {
  test('should create, edit and delete a coverage type @regression @ui @e2e @coverageType', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const coverageTypePage = new CoverageTypePage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);

    // Create coverage type with unique name
    const timestamp = Date.now();
    const coverageTypeName = `Auto_Test_${timestamp}`;
    await test.step('Create coverage type', async () => {
      await coverageTypePage.createCoverageType({
        name: coverageTypeName,
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
    });

    // Add a small delay to ensure the UI is stable
    await page.waitForTimeout(2000);

    // Edit created coverage type
    const updatedName = `${coverageTypeName}_Updated`;
    await test.step('Edit coverage type', async () => {
      await coverageTypePage.editCoverageType(coverageTypeName, updatedName, [
        { row: '4A', index: 1 },
        { row: '4B', index: 2 },
      ]);
    });

    // Add a small delay before archiving
    await page.waitForTimeout(2000);

    // Archive the edited coverage type
    await test.step('Archive coverage type', async () => {
      await coverageTypePage.archiveCoverageType(updatedName);
    });

    // Add a small delay before unarchiving
    await page.waitForTimeout(2000);

    // Unarchive the edited coverage type
    await test.step('Unarchive coverage type', async () => {
      await coverageTypePage.unarchiveCoverageType(updatedName);
    });

    // Add a small delay before deleting
    await page.waitForTimeout(2000);

    // Delete the edited coverage type
    await test.step('Delete coverage type', async () => {
      await coverageTypePage.deleteCoverageType(updatedName);
    });

    // Validation after deletion
    await test.step('Verify validation on empty save', async () => {
      await coverageTypePage.assertValidationOnEmptySave();
    });
  });
});
