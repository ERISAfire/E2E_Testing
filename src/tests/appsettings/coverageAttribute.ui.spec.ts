import { test } from '@playwright/test';
import 'dotenv/config';
import { CoverageAttributePage } from '../../ui/pages/CoverageAttributePage.js';

test.describe('Coverage Attribute UI E2E', () => {
  test('should create, edit and delete coverage attribute via UI @smoke @regression @critical @ui @coverageAttribute @e2e', async ({
    page,
  }) => {
    const loginPage = new (await import('../../ui/pages/LoginPage.js')).LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);
    const coverageAttributePage = new CoverageAttributePage(page);

    await coverageAttributePage.createCoverageAttribute({ name: 'Automation_test', color: '2345' });

    await coverageAttributePage.editCoverageAttribute(
      'Automation_test_test', // newName
      '8943' // newColor
    );

    await coverageAttributePage.deleteCoverageAttribute();
    await coverageAttributePage.assertValidationOnEmptySave();
  });
});
