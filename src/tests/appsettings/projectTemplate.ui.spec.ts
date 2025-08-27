import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { ProjectTemplatePage } from '../../ui/pages/ProjectTemplatePage.js';
import { DateUtils } from '../../core/utils/date.utils.js';

test.describe.serial('Project Templates UI E2E', () => {
  test('should create, edit, delete a project template and validate form fields @smoke @regression @ui @projectTemplate', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);

    const projectTemplatePage = new ProjectTemplatePage(page);
    const templateName = `Auto_Test_${DateUtils.getCurrentDateFormatted('DDMMYYYY')}`;
    const updatedTemplateName = `${templateName}_Updated`;

    // 1. Create project template
    await projectTemplatePage.createProjectTemplate({
      name: templateName,
      status: 'Active',
      color: '#123456',
      trelloCardTemplate: 'Automation_Tests',
      note: {
        title: 'Test Note',
        description: 'This is a test note',
      },
    });

    // 2. Edit project template
    await projectTemplatePage.editTemplate(templateName, {
      name: updatedTemplateName,
      status: 'Draft',
      trelloCardTemplate: 'Automation_Tests_Updated',
      color: '#9ea025',
    });

    // 3. Delete the template
    await projectTemplatePage.deleteTemplate(updatedTemplateName);
  });
});
