import { test } from '@playwright/test';
import 'dotenv/config';
import { CoverageAttributePage } from '../../ui/pages/CoverageAttributePage';

test.describe('Coverage Attribute UI E2E', () => {
  test('should create, edit and delete coverage attribute via UI @smoke @regression @critical @ui @coverageAttribute @e2e', async ({
    page,
  }) => {
    // Login to the system
    const loginPage = new (await import('../../ui/pages/LoginPage')).LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);
    const coverageAttributePage = new CoverageAttributePage(page);

    // Create
    await coverageAttributePage.createCoverageAttribute({ name: 'Automation_test', color: '2345' });

    // Edit
    await coverageAttributePage.editCoverageAttribute(
      'Automation_test_test', // newName
      '8943' // newColor
    );

    // Delete
    await coverageAttributePage.deleteCoverageAttribute();

    // Negative: validation check on empty form
    await coverageAttributePage.assertValidationOnEmptySave();
  });
});
