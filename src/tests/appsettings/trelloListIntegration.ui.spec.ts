import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { TrelloListIntegrationPage } from '../../ui/pages/TrelloListIntegrationPage.js';

test.describe.serial('Trello List Integration UI E2E', () => {
  test('should create, edit, delete a Trello list integration and validate form fields @smoke @regression @ui @trelloListIntegration', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);
    const trelloListIntegrationPage = new TrelloListIntegrationPage(page);

    const testTrelloListName = 'Automation_Tests';
    const initialProjectStatus = 'Start';
    const updatedProjectStatus = 'Info Needed';

    // 1. Create Trello List Integration
    await trelloListIntegrationPage.createTrelloListIntegration({
      trelloListName: testTrelloListName,
      projectStatus: initialProjectStatus,
    });

    // 2. Edit Trello List Integration
    await trelloListIntegrationPage.editTrelloListIntegration(
      testTrelloListName,
      initialProjectStatus,
      updatedProjectStatus
    );

    // 3. Delete Trello List Integration
    await trelloListIntegrationPage.deleteTrelloListIntegrationByName(testTrelloListName);

    // 4. Test form validation
    await trelloListIntegrationPage.assertValidationOnEmptySave();
  });
});
