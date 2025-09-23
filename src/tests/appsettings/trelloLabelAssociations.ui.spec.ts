import { test } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { TrelloLabelAssociationsPage } from '../../ui/pages/TrelloLabelAssociationsPage.js';

test.describe.serial('Trello Label Associations UI E2E', () => {
  test('should create, edit, delete a Trello label association and validate form fields @smoke @regression @ui @trelloLabelAssociations', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);
    const trelloLabelAssociationsPage = new TrelloLabelAssociationsPage(page);

    const testConsultantName = 'Automation_Tests';
    const testTrelloLabel = 'Automation_Tests';

    // 1. Create Trello Label Association
    await trelloLabelAssociationsPage.createTrelloLabelAssociation({
      consultantName: testConsultantName,
      trelloLabel: testTrelloLabel,
    });

    // 2. Edit Trello Label Association (test cancel functionality)
    await trelloLabelAssociationsPage.editTrelloLabelAssociation(testConsultantName);

    // 3. Delete Trello Label Association
    await trelloLabelAssociationsPage.deleteTrelloLabelAssociation(testConsultantName);

    // 4. Test form validation
    await trelloLabelAssociationsPage.assertValidationOnEmptySave();
  });
});
