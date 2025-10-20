import { test, expect, APIRequestContext } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

// Interface for Compliance Event Rule
interface ComplianceEventRule {
  id: string;
  name: string;
  administratorNote: string;
  helpArticleUrl: string;
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
  earliestPossibleEventDate: string;
  latestPossibleEventDate: string | null;
  reminder: string;
  reminderEmail: string;
  coverageRules: CoverageRule[];
}

// Interface for Coverage Rule
interface CoverageRule {
  coverageTypeId: string;
  includedAttributes: string[];
  excludedAttributes: string[];
}

// Interface for creating Compliance Event Rule
interface CreateComplianceEventRulePayload {
  name: string;
  administratorNote: string;
  helpArticleUrl: string;
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
  earliestPossibleEventDate: string;
  latestPossibleEventDate: string | null;
  reminder: string;
  reminderEmail: string;
  coverageRules: CoverageRule[];
}

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for compliance event rules
const COMPLIANCE_EVENT_RULES_PATH = '/v1/compliance-event-rules';
const COMPLIANCE_EVENT_RULES_URL = `${API_BASE_URL}${COMPLIANCE_EVENT_RULES_PATH}`;

// Helper function to create a test project template
const createTestProjectTemplate = async (
  request: APIRequestContext,
  testRunId: string
): Promise<string> => {
  const templateData = {
    name: `API_${testRunId}_Template`,
    color: `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`,
    status: 'active' as const,
    trelloCardId: '639371d1f9968405da28a5ec',
  };

  const response = await request.post(`${API_BASE_URL}/v1/templates`, {
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
  return responseBody.id;
};

// Helper function to delete a test project template
const deleteTestProjectTemplate = async (request: APIRequestContext, id: string): Promise<void> => {
  const response = await request.delete(`${API_BASE_URL}/v1/templates/${id}`, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  if (response.status() !== 200) {
    console.warn(`Failed to delete test project template ${id}: ${response.status()}`);
  }
};

// Helper function to create a test compliance event rule
const createTestComplianceEventRule = async (
  request: APIRequestContext,
  testRunId: string,
  templateId: string
): Promise<ComplianceEventRule> => {
  const payload: CreateComplianceEventRulePayload = {
    name: `API_${testRunId}_Rule`,
    administratorNote: 'admin notes',
    helpArticleUrl:
      'https://help.erisafire.com/en/articles/4323332-when-do-i-need-to-update-my-erisafire-prepared-plan-document',
    preventDuplicationRule: '1 per plan',
    color: '#123456',
    erisaStatus: 'ERISA',
    acaStatus: '0-49 Full-Time Equivalents',
    participantsCount: '1-99',
    marketSegment: '2-99 employees',
    eventDueDateRule: 'Y Date of Next Calendar Year After (+ X Days)',
    x: 1,
    y: '2025-08-05T21:00:00.000Z',
    z: 5,
    templateId: templateId,
    dueDateReferenceDay: 'Plan Year Begin Date',
    earliestPossibleEventDate: '2025-08-30T00:00:00+03:00',
    latestPossibleEventDate: '2025-09-19T00:00:00+03:00',
    reminder: '10',
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

  const body = await response.json();
  return { id: body.id, ...payload };
};

// Helper function to delete a test compliance event rule
const deleteTestComplianceEventRule = async (
  request: APIRequestContext,
  id: string
): Promise<void> => {
  const response = await request.delete(`${COMPLIANCE_EVENT_RULES_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  const status = response.status();
  if (status === 404) {
    return; // already deleted, ignore
  }
  if (status !== 200 && status !== 204) {
    console.warn(`Failed to delete test compliance event rule ${id}: ${status}`);
  }
};

test.describe.serial('Compliance Event Rule API', () => {
  // Generate a unique test run ID to prevent conflicts
  let testRunId: string;
  let testComplianceEventRule: ComplianceEventRule;
  let testProjectTemplateId: string;

  // Setup - initialize test run ID, create project template and compliance event rule before all tests
  test.beforeAll(async ({ request }) => {
    testRunId = `api_${process.env.GITHUB_RUN_ID || Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    testProjectTemplateId = await createTestProjectTemplate(request, testRunId);
    testComplianceEventRule = await createTestComplianceEventRule(
      request,
      testRunId,
      testProjectTemplateId
    );
  });

  // Cleanup - delete test compliance event rule and project template after all tests
  test.afterAll(async ({ request }) => {
    if (testComplianceEventRule?.id) {
      try {
        await deleteTestComplianceEventRule(request, testComplianceEventRule.id);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    if (testProjectTemplateId) {
      try {
        await deleteTestProjectTemplate(request, testProjectTemplateId);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });

  // POST - Create compliance event rule
  test('POST /compliance-event-rules - create @regression @api @complianceEventRule', async ({
    request,
  }) => {
    // Create a separate template for this test to avoid templateId conflict
    const separateTemplateId = await createTestProjectTemplate(request, `separate_${testRunId}`);

    const payload: CreateComplianceEventRulePayload = {
      name: `Form 1095-B ACA Reporting ${Date.now()}`,
      administratorNote: 'admin notes',
      helpArticleUrl:
        'https://help.erisafire.com/en/articles/4323332-when-do-i-need-to-update-my-erisafire-prepared-plan-document',
      preventDuplicationRule: '1 per plan',
      color: '#123456',
      erisaStatus: 'ERISA',
      acaStatus: '0-49 Full-Time Equivalents',
      participantsCount: '1-99',
      marketSegment: '2-99 employees',
      eventDueDateRule: 'Y Date of Next Calendar Year After (+ X Days)',
      x: 1,
      y: '2025-08-05T21:00:00.000Z',
      z: 5,
      templateId: separateTemplateId,
      dueDateReferenceDay: 'Plan Year Begin Date',
      earliestPossibleEventDate: '2025-08-30T00:00:00+03:00',
      latestPossibleEventDate: '2025-09-19T00:00:00+03:00',
      reminder: '10',
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

    const responseBody = await response.text();

    if (response.status() !== 201) {
      console.error('Response status:', response.status());
      console.error('Response body:', responseBody);
      console.error('Request payload:', JSON.stringify(payload, null, 2));
    }

    expect(response.status()).toBe(201);

    // Parse and verify the response body
    const body = JSON.parse(responseBody);
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');

    // Clean up - delete the created compliance event rule and template
    await deleteTestComplianceEventRule(request, body.id);
    await deleteTestProjectTemplate(request, separateTemplateId);
  });

  // NEGATIVE: Missing required fields
  test('POST /compliance-event-rules - should fail with missing required fields @negative @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const response = await request.post(COMPLIANCE_EVENT_RULES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {}, // Empty payload
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      message: expect.any(String),
      error: 'Bad Request',
    });
  });

  // NEGATIVE: Invalid color format
  test('POST /compliance-event-rules - should fail with invalid color format @negative @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const payload = {
      name: 'Test Rule',
      administratorNote: 'Test Note',
      helpArticleUrl: 'https://example.com/help',
      preventDuplicationRule: '1 per plan',
      color: 'invalid-color', // Invalid color format
      erisaStatus: 'ERISA',
      acaStatus: '0-49 Full-Time Equivalents',
      participantsCount: '100+',
      marketSegment: '2-99 Employees',
      eventDueDateRule: 'X Days Before',
      x: 10,
      y: '2025-01-01',
      z: 5,
      templateId: '550e8400-e29b-41d4-a716-446655440000',
      dueDateReferenceDay: 'Plan Year Begin Date',
      earliestPossibleEventDate: '2024-01-01T12:00:00.000Z',
      latestPossibleEventDate: null,
      reminder: '10',
      reminderEmail: '<b>Hello there</b>',
      coverageRules: [],
    };

    const response = await request.post(COMPLIANCE_EVENT_RULES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: payload,
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });

  // NEGATIVE: POST without token
  test('POST /compliance-event-rules without token - should fail with 401 @negative @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const payload = {
      name: 'Test Rule',
      administratorNote: 'Test Note',
      color: '#FF5733',
    };

    const response = await request.post(COMPLIANCE_EVENT_RULES_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      message: expect.any(String),
    });
  });

  // GET (list) - Verify real API response structure
  test('GET /compliance-event-rules?status=true - list @smoke @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const response = await request.get(`${COMPLIANCE_EVENT_RULES_URL}?status=true`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();

    if (body.data.length > 0) {
      const rule = body.data[0];

      // Verify required fields structure
      expect(rule).toHaveProperty('id');
      expect(typeof rule.id).toBe('string');
      expect(rule).toHaveProperty('name');
      expect(typeof rule.name).toBe('string');
      expect(rule).toHaveProperty('administratorNote');
      expect(rule).toHaveProperty('helpArticleUrl');
      expect(rule).toHaveProperty('preventDuplicationRule');
      expect(rule).toHaveProperty('color');
      expect(rule).toHaveProperty('erisaStatus');
      expect(rule).toHaveProperty('acaStatus');
      expect(rule).toHaveProperty('participantsCount');
      expect(rule).toHaveProperty('marketSegment');
      expect(rule).toHaveProperty('eventDueDateRule');
      expect(rule).toHaveProperty('templateId');
      expect(rule).toHaveProperty('dueDateReferenceDay');
      expect(rule).toHaveProperty('reminder');
      expect(typeof rule.reminder).toBe('string');
      expect(rule).toHaveProperty('coverageRules');
      expect(Array.isArray(rule.coverageRules)).toBeTruthy();
    }
  });

  // NEGATIVE: GET list without token
  test('GET /compliance-event-rules without token - should fail with 401 @negative @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const response = await request.get(`${COMPLIANCE_EVENT_RULES_URL}?status=true`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication error: Token missing',
    });
  });

  // Verify created compliance event rule in list
  test('Verify created compliance event rule in list @smoke @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const response = await request.get(`${COMPLIANCE_EVENT_RULES_URL}?status=true`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Find our test compliance event rule in the list
    const foundRule = body.data.find(
      (item: ComplianceEventRule) => item.id === testComplianceEventRule.id
    );
    expect(foundRule).toBeDefined();

    if (foundRule) {
      expect(foundRule.name).toBe(testComplianceEventRule.name);
      expect(foundRule.templateId).toBe(testProjectTemplateId);
      expect(foundRule.color).toBe('#123456');
      expect(foundRule.administratorNote).toBe('admin notes');
    }
  });

  // PATCH - Update compliance event rule
  test('PATCH /compliance-event-rules/:id - update @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const updatePayload = {
      name: `Updated_${testComplianceEventRule.name}`,
      administratorNote: 'updated admin notes',
      helpArticleUrl: 'https://help.erisafire.com/en/articles/updated-article',
      preventDuplicationRule: '1 per participant',
      color: '#654321',
      erisaStatus: 'Non-ERISA',
      acaStatus: '50+ Full-Time Equivalents',
      participantsCount: '100+',
      marketSegment: '100+ employees',
      eventDueDateRule: 'X Days After',
      x: 15,
      y: '2025-12-31T21:00:00.000Z',
      z: 10,
      templateId: testProjectTemplateId,
      dueDateReferenceDay: 'Plan Year End Date',
      earliestPossibleEventDate: '2025-09-01T00:00:00+03:00',
      latestPossibleEventDate: '2025-10-15T00:00:00+03:00',
      reminder: '15',
      reminderEmail: 'updated@example.com',
      coverageRules: [],
    };

    const response = await request.patch(
      `${COMPLIANCE_EVENT_RULES_URL}/${testComplianceEventRule.id}`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: updatePayload,
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Based on memory, PATCH endpoints typically return only the ID
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(testComplianceEventRule.id);

    // Verify the update by fetching the updated rule
    const getResponse = await request.get(`${COMPLIANCE_EVENT_RULES_URL}?status=true`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(getResponse.status()).toBe(200);
    const getBody = await getResponse.json();
    const updatedRule = getBody.data.find(
      (item: ComplianceEventRule) => item.id === testComplianceEventRule.id
    );

    expect(updatedRule).toBeDefined();
    expect(updatedRule.name).toBe(updatePayload.name);
    expect(updatedRule.administratorNote).toBe(updatePayload.administratorNote);
    expect(updatedRule.color).toBe(updatePayload.color);
    expect(updatedRule.erisaStatus).toBe(updatePayload.erisaStatus);
    expect(updatedRule.participantsCount).toBe(updatePayload.participantsCount);
  });

  // NEGATIVE: PATCH with non-existent ID
  test('PATCH /compliance-event-rules/:id - should fail with non-existent ID @negative @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
    const updatePayload = {
      name: 'Updated Rule Name',
      color: '#FF5733',
    };

    const response = await request.patch(`${COMPLIANCE_EVENT_RULES_URL}/${nonExistentId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: updatePayload,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.any(String),
    });
  });

  // NEGATIVE: PATCH without token
  test('PATCH /compliance-event-rules/:id without token - should fail with 401 @negative @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const updatePayload = {
      name: 'Updated Rule Name',
      color: '#FF5733',
    };

    const response = await request.patch(
      `${COMPLIANCE_EVENT_RULES_URL}/${testComplianceEventRule.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        data: updatePayload,
      }
    );

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication error: Token missing',
    });
  });

  // NEGATIVE: PATCH with invalid data format
  test('PATCH /compliance-event-rules/:id - should fail with invalid color format @negative @regression @api @complianceEventRule', async ({
    request,
  }) => {
    const updatePayload = {
      name: 'Updated Rule Name',
      color: 'invalid-color-format', // Invalid color format
      x: 'invalid-number', // Invalid number format
    };

    const response = await request.patch(
      `${COMPLIANCE_EVENT_RULES_URL}/${testComplianceEventRule.id}`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: updatePayload,
      }
    );

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
  });
});
