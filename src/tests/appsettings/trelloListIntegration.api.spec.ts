import { test, expect, APIRequestContext } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

// Interface for Trello List Integration
interface TrelloListIntegration {
  id: number;
  createdAt: string;
  updatedAt: string;
  trelloListId: string;
  trelloListName: string;
  projectStatus: string;
  order: string;
}

// Interface for creating Trello List Integration
interface CreateTrelloListIntegrationPayload {
  projectStatus: string;
  trelloListName: string;
  trelloListId: string;
}

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for Trello List Integrations
const TRELLO_LIST_INTEGRATIONS_PATH = '/v1/trello/list-integrations';
const TRELLO_LIST_INTEGRATIONS_URL = `${API_BASE_URL}${TRELLO_LIST_INTEGRATIONS_PATH}`;

// Helper function to create a test Trello List Integration
const createTestTrelloListIntegration = async (
  request: APIRequestContext
): Promise<TrelloListIntegration> => {
  const payload: CreateTrelloListIntegrationPayload = {
    projectStatus: 'Nearly There',
    trelloListName: 'Automation_Tests',
    trelloListId: '68959bf51a77af3e8aabfc43',
  };

  const response = await request.post(TRELLO_LIST_INTEGRATIONS_URL, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(
      `Failed to create test Trello List Integration: ${response.status()} - ${body}`
    );
  }

  const body = await response.json();

  // Since POST only returns {id}, we need to construct the full object
  return {
    id: body.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trelloListId: '68959bf51a77af3e8aabfc43',
    trelloListName: 'Automation_Tests',
    projectStatus: payload.projectStatus,
    order: '', // Will be set by the API
  };
};

// Helper function to delete a test Trello List Integration
const deleteTestTrelloListIntegration = async (
  request: APIRequestContext,
  id: number
): Promise<void> => {
  const response = await request.delete(`${TRELLO_LIST_INTEGRATIONS_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  if (response.status() !== 200) {
    console.warn(`Failed to delete test Trello List Integration ${id}: ${response.status()}`);
  }
};

test.describe.serial('Trello List Integration API', () => {
  let testTrelloListIntegration: TrelloListIntegration;

  // Setup - create test integration before all tests
  test.beforeAll(async ({ request }) => {
    testTrelloListIntegration = await createTestTrelloListIntegration(request);
  });

  // Cleanup - delete test integration after all tests
  test.afterAll(async ({ request }) => {
    if (testTrelloListIntegration?.id) {
      try {
        await deleteTestTrelloListIntegration(request, testTrelloListIntegration.id);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });

  // NEGATIVE: Missing required fields
  test('POST /trello/list-integrations - should fail with missing required fields @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.post(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {}, // Empty payload
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'Bad Request');
    expect(body).toHaveProperty('message');
  });

  // NEGATIVE: Missing trelloListName
  test('POST /trello/list-integrations - should fail with missing trelloListName @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.post(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        projectStatus: 'Start',
        trelloListId: 'test123',
        // Missing trelloListName
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  // POST - Create Trello List Integration
  test('POST /trello/list-integrations - create @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const payload = {
      projectStatus: 'Start',
      trelloListName: 'Automation_Tests',
      trelloListId: '68959bf51a77af3e8aabfc43',
    };

    const response = await request.post(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('number');

    // Clean up - delete the created integration
    await deleteTestTrelloListIntegration(request, body.id);
  });

  // GET (list)
  test('GET /trello/list-integrations - list @smoke @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.get(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();

    if (body.data.length > 0) {
      const integration = body.data[0] as TrelloListIntegration;

      // Verify required fields
      expect(integration).toHaveProperty('id');
      expect(typeof integration.id).toBe('number');

      expect(integration).toHaveProperty('createdAt');
      expect(new Date(integration.createdAt).toString()).not.toBe('Invalid Date');

      expect(integration).toHaveProperty('updatedAt');
      expect(new Date(integration.updatedAt).toString()).not.toBe('Invalid Date');

      expect(integration).toHaveProperty('trelloListId');
      expect(typeof integration.trelloListId).toBe('string');

      expect(integration).toHaveProperty('trelloListName');
      expect(typeof integration.trelloListName).toBe('string');

      expect(integration).toHaveProperty('projectStatus');
      expect(typeof integration.projectStatus).toBe('string');

      expect(integration).toHaveProperty('order');
      expect(typeof integration.order).toBe('string');
    }
  });

  // NEGATIVE: GET list without token
  test('GET /trello/list-integrations without token - should fail with 401 @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.get(TRELLO_LIST_INTEGRATIONS_URL);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication error: Token missing',
    });
  });

  // Verify created integration in list
  test('Verify created integration in list @smoke @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.get(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Find our test integration in the list
    const foundIntegration = body.data.find(
      (item: TrelloListIntegration) => item.id === testTrelloListIntegration.id
    );
    expect(foundIntegration).toBeDefined();

    if (foundIntegration) {
      expect(foundIntegration.trelloListName).toBe(testTrelloListIntegration.trelloListName);
      expect(foundIntegration.trelloListId).toBe(testTrelloListIntegration.trelloListId);
      expect(foundIntegration.projectStatus).toBe(testTrelloListIntegration.projectStatus);
    }
  });

  // Test project status validation
  test('GET /trello/list-integrations - should return valid project statuses @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.get(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.data.length > 0) {
      body.data.forEach((integration: TrelloListIntegration) => {
        expect(typeof integration.projectStatus).toBe('string');
        expect(integration.projectStatus.length).toBeGreaterThan(0);
        // Note: Not enforcing specific statuses as they might be configurable
      });
    }
  });

  // Test order field format
  test('GET /trello/list-integrations - should return valid order formats @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.get(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.data.length > 0) {
      body.data.forEach((integration: TrelloListIntegration) => {
        expect(typeof integration.order).toBe('string');
        // Order format appears to be like "0|i0000b:" or "0|hzzzzz:"
        expect(integration.order).toMatch(/^0\|[a-z0-9]+:$/);
      });
    }
  });

  // NEGATIVE: POST without token
  test('POST /trello/list-integrations without token - should fail with 401 @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.post(TRELLO_LIST_INTEGRATIONS_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        projectStatus: 'Start',
        trelloListName: 'Test List',
        trelloListId: 'test123',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      message: expect.any(String),
    });
  });

  // PATCH - Update Trello List Integration
  test('PATCH /trello/list-integrations/:id - update @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    // Use the shared test integration
    const updatePayload = {
      projectStatus: 'Done',
      trelloListName: 'Automation_Tests',
      trelloListId: '68959bf51a77af3e8aabfc43',
    };

    const response = await request.patch(
      `${TRELLO_LIST_INTEGRATIONS_URL}/${testTrelloListIntegration.id}`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: updatePayload,
      }
    );

    // Verify the response
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(testTrelloListIntegration.id);
  });

  // NEGATIVE: PATCH with non-existent id
  test('PATCH /trello/list-integrations/:id with non-existent id - should fail with 404 @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.patch(`${TRELLO_LIST_INTEGRATIONS_URL}/999999`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        projectStatus: 'Done',
        trelloListName: 'Automation_Tests',
        trelloListId: '68959bf51a77af3e8aabfc43',
      },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 404);
  });

  // NEGATIVE: PATCH with missing required fields
  test('PATCH /trello/list-integrations/:id with missing required fields - should fail with 400 @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.patch(
      `${TRELLO_LIST_INTEGRATIONS_URL}/${testTrelloListIntegration.id}`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: {}, // Empty payload
      }
    );

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  // NEGATIVE: PATCH without token
  test('PATCH /trello/list-integrations/:id without token - should fail with 401 @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.patch(
      `${TRELLO_LIST_INTEGRATIONS_URL}/${testTrelloListIntegration.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          projectStatus: 'Done',
          trelloListName: 'Automation_Tests',
          trelloListId: '68959bf51a77af3e8aabfc43',
        },
      }
    );

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      message: expect.any(String),
    });
  });

  // DELETE - Remove Trello List Integration
  test('DELETE /trello/list-integrations/:id - should delete an existing integration @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    // Create a temporary integration to delete
    const tempIntegration = await createTestTrelloListIntegration(request);

    // Delete the integration
    const response = await request.delete(`${TRELLO_LIST_INTEGRATIONS_URL}/${tempIntegration.id}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    // Verify the response
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(tempIntegration.id);
  });

  // NEGATIVE: DELETE with non-existent id
  test('DELETE /trello/list-integrations/:id with non-existent id - should fail with 404 @negative @regression @api @trelloListIntegration', async ({
    request,
  }) => {
    const response = await request.delete(`${TRELLO_LIST_INTEGRATIONS_URL}/999999`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 404);
  });
});
