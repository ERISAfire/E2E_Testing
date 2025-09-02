import { test, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../../ui/pages/LoginPage.js';
import { ComplianceEventRulePage } from '../../ui/pages/ComplianceEventRulePage.js';
import { EnvConfig } from '../../config/env.config.js';

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoints
const TEMPLATES_PATH = '/v1/templates';
const TEMPLATES_URL = `${API_BASE_URL}${TEMPLATES_PATH}`;
const COMPLIANCE_EVENT_RULES_PATH = '/v1/compliance-event-rules';
const COMPLIANCE_EVENT_RULES_URL = `${API_BASE_URL}${COMPLIANCE_EVENT_RULES_PATH}`;

// Interfaces
interface CreateComplianceEventRulePayload {
  name: string;
  administratorNote?: string;
  helpArticleUrl?: string;
  preventDuplicationRule: string;
  color: string;
  erisaStatus: string;
  acaStatus: string;
  participantsCount: string;
  marketSegment: string;
  eventDueDateRule: string;
  x: number;
  y: string;
  z: number;
  templateId: string;
  dueDateReferenceDay: string;
  earliestPossibleEventDate?: string;
  latestPossibleEventDate?: string;
  reminder: string;
  reminderEmail: string;
  coverageRules: unknown[];
}

interface ComplianceEventRule {
  id: string;
  name: string;
  administratorNote?: string;
  helpArticleUrl?: string;
  color: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to create a test compliance event rule via API
const createTestComplianceEventRule = async (
  request: APIRequestContext,
  testRunId: string,
  templateId: string
): Promise<ComplianceEventRule> => {
  const payload: CreateComplianceEventRulePayload = {
    name: `API_${testRunId}_ComplianceRule`,
    administratorNote: 'API test admin note',
    helpArticleUrl:
      'https://help.erisafire.com/en/articles/4323332-when-do-i-need-to-update-my-erisafire-prepared-plan-document',
    preventDuplicationRule: '1 per plan',
    color: '#FF5733',
    erisaStatus: 'ERISA',
    acaStatus: '0-49 Full-Time Equivalents',
    participantsCount: '1-99',
    marketSegment: '2-99 employees',
    eventDueDateRule: 'Y Date of Next Calendar Year After (+ X Days)',
    x: 10,
    y: '2025-08-05T21:00:00.000Z',
    z: 5,
    templateId: templateId,
    dueDateReferenceDay: 'Plan Year Begin Date',
    earliestPossibleEventDate: '2025-01-01T00:00:00+03:00',
    latestPossibleEventDate: '2025-12-31T00:00:00+03:00',
    reminder: '1',
    reminderEmail: '',
    coverageRules: [],
  };

  const response = await request.post(COMPLIANCE_EVENT_RULES_URL, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(`Failed to create test compliance event rule: ${response.status()} - ${body}`);
  }

  const responseBody = await response.json();
  return responseBody;
};

// Helper function to create a test project template via API
const createTestProjectTemplate = async (
  request: APIRequestContext,
  testRunId: string
): Promise<{ id: string; name: string }> => {
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
  return { id: responseBody.id, name: responseBody.name };
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

// Helper function to delete a test compliance event rule via API
const deleteTestComplianceEventRule = async (
  request: APIRequestContext,
  id: string
): Promise<void> => {
  const response = await request.delete(`${COMPLIANCE_EVENT_RULES_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  if (response.status() !== 200) {
    console.warn(`Failed to delete test compliance event rule ${id}: ${response.status()}`);
  }
};

test.describe.serial('Compliance Event Rules UI E2E', () => {
  let testRunId: string;
  let testProjectTemplate: { id: string; name: string };
  let testComplianceEventRule: ComplianceEventRule;

  // Setup - create project template and compliance event rule via API
  test.beforeAll(async ({ request }) => {
    testRunId = `ui_${process.env.GITHUB_RUN_ID || Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Create new project template
    testProjectTemplate = await createTestProjectTemplate(request, testRunId);

    // Create compliance event rule using the new template
    testComplianceEventRule = await createTestComplianceEventRule(
      request,
      testRunId,
      testProjectTemplate.id
    );
  });

  // Cleanup - delete compliance event rule and project template via API
  test.afterAll(async ({ request }) => {
    if (testComplianceEventRule?.id) {
      try {
        await deleteTestComplianceEventRule(request, testComplianceEventRule.id);
      } catch (error) {
        console.error('Error during compliance rule cleanup:', error);
      }
    }
    if (testProjectTemplate?.id) {
      try {
        await deleteTestProjectTemplate(request, testProjectTemplate.id);
      } catch (error) {
        console.error('Error during template cleanup:', error);
      }
    }
  });

  test('should verify, edit, delete a compliance event rule created via API @smoke @regression @ui @complianceEventRule', async ({
    page,
  }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.USER_EMAIL as string, process.env.USER_PASSWORD as string);

    const complianceEventRulePage = new ComplianceEventRulePage(page);
    const expectedRuleName = `API_${testRunId}_ComplianceRule`;
    const updatedTestName = `${expectedRuleName}_Updated`;

    // Navigate to Compliance Event Rules after login
    await complianceEventRulePage.navigateToComplianceEventRules();

    // 1. Verify the API-created compliance event rule exists and has correct data
    await complianceEventRulePage.verifyCreatedComplianceEventRule(expectedRuleName, {
      helpUrl:
        'https://help.erisafire.com/en/articles/4323332-when-do-i-need-to-update-my-erisafire-prepared-plan-document',
      preventDuplicationRule: '1 per plan',
    });

    // 2. Edit compliance event rule via UI
    await complianceEventRulePage.editComplianceEventRule(expectedRuleName, {
      name: updatedTestName,
      adminNote: 'Updated admin note via UI',
    });

    // 3. Delete compliance event rule via UI
    await complianceEventRulePage.deleteComplianceEventRule(updatedTestName);

    // 4. Test form validation
    await complianceEventRulePage.assertValidationOnEmptySave();
  });
});
