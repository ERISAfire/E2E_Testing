import { test, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { ComplianceEventRulePage } from '../../ui/pages/ComplianceEventRulePage.js';
import { EnvConfig } from '../../config/env.config.js';

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for project templates
const TEMPLATES_PATH = '/v1/templates';
const TEMPLATES_URL = `${API_BASE_URL}${TEMPLATES_PATH}`;

// Interface for project template
interface ProjectTemplate {
  id: string;
  name: string;
  color: string;
  status: 'active' | 'draft';
  trelloCardId: string | null;
}

// Helper function to create a test project template via API
const createTestProjectTemplate = async (
  request: APIRequestContext,
  testRunId: string
): Promise<ProjectTemplate> => {
  const templateData = {
    name: `API_${testRunId}_Template`,
    color: `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`,
    status: 'active' as const,
    trelloCardId: '639371d1f9968405da28a5ec',
  };

  const response = await request.post(TEMPLATES_URL, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: templateData,
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(`Failed to create test project template: ${response.status()} - ${body}`);
  }

  const responseBody = await response.json();
  return responseBody;
};

// Helper function to delete a test project template via API
const deleteTestProjectTemplate = async (request: APIRequestContext, id: string): Promise<void> => {
  const response = await request.delete(`${TEMPLATES_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  if (response.status() !== 200) {
    console.warn(`Failed to delete test project template ${id}: ${response.status()}`);
  }
};

test.describe.serial('Compliance Event Rules UI E2E', () => {
  let testRunId: string;
  let testProjectTemplate: ProjectTemplate;

  // Setup - create project template via API before all tests
  test.beforeAll(async ({ request }) => {
    testRunId = `ui_${process.env.GITHUB_RUN_ID || Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    testProjectTemplate = await createTestProjectTemplate(request, testRunId);
  });

  // Cleanup - delete project template via API after all tests
  test.afterAll(async ({ request }) => {
    if (testProjectTemplate?.id) {
      try {
        await deleteTestProjectTemplate(request, testProjectTemplate.id);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });

  test('should create, edit, delete a compliance event rule and validate form fields @smoke @regression @ui @complianceEventRule', async ({
    page,
  }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);

    const complianceEventRulePage = new ComplianceEventRulePage(page);
    const timestamp = Date.now();
    const testName = `Automation_Test_${timestamp}`;
    const updatedTestName = `${testName}_Updated`;

    // Navigate to Compliance Event Rules after login
    await complianceEventRulePage.navigateToComplianceEventRules();

    // 1. Create compliance event rule using the API-created project template
    await complianceEventRulePage.createComplianceEventRule({
      name: testName,
      adminNote: 'Admin note for automation test',
      helpUrl:
        'https://help.erisafire.com/en/articles/4323332-when-do-i-need-to-update-my-erisafire-prepared-plan-document',
      color: '123456',
      projectTemplateName: testProjectTemplate.name, // Use the API-created template
    });

    // 1.1. Verify created compliance event rule details
    await complianceEventRulePage.verifyCreatedComplianceEventRule(testName, {
      helpUrl:
        'https://help.erisafire.com/en/articles/4323332-when-do-i-need-to-update-my-erisafire-prepared-plan-document',
      preventDuplicationRule: '1 per plan',
    });

    // 2. Edit compliance event rule
    await complianceEventRulePage.editComplianceEventRule(testName, {
      name: updatedTestName,
      adminNote: 'Updated admin note',
    });

    // 3. Delete compliance event rule
    await complianceEventRulePage.deleteComplianceEventRule(updatedTestName);

    // 4. Test form validation
    await complianceEventRulePage.assertValidationOnEmptySave();
  });
});
