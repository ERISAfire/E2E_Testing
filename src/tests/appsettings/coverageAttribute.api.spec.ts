import { test, expect, APIRequestContext } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

interface TestCoverageAttribute {
  id: string;
  name: string;
  color: string;
}

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for coverage attributes
const COVERAGE_ATTRIBUTES_PATH = '/v1/coverage-attributes';
const COVERAGE_ATTRIBUTES_URL = `${API_BASE_URL}${COVERAGE_ATTRIBUTES_PATH}`;

// Helper function to create a unique coverage attribute
const createTestCoverageAttribute = async (
  request: APIRequestContext,
  nameSuffix: string = ''
): Promise<TestCoverageAttribute> => {
  const payload = {
    name: `Test Label ${nameSuffix || Date.now()}`,
    color: `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`,
  };

  const response = await request.post(COVERAGE_ATTRIBUTES_URL, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(`Failed to create test coverage attribute: ${response.status()} - ${body}`);
  }

  const body = await response.json();
  return { id: body.id, ...payload };
};

// Helper function to delete a coverage attribute
const deleteTestCoverageAttribute = async (
  request: APIRequestContext,
  id: string
): Promise<void> => {
  const response = await request.delete(`${COVERAGE_ATTRIBUTES_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  if (response.status() !== 200) {
    console.warn(`Failed to delete test coverage attribute ${id}: ${response.status()}`);
  }
};

// Example of creating a coverage attribute
const coverageAttributePayload = {
  name: 'Test Label',
  color: '#15710d',
};

test.describe.serial('Coverage Attribute API', () => {
  // Generate a unique test run ID to prevent conflicts
  let testRunId: string;
  let testCoverageAttribute: TestCoverageAttribute;

  // Setup - initialize test run ID and create test coverage attribute before all tests
  test.beforeAll(async ({ request }) => {
    testRunId = `api_${process.env.GITHUB_RUN_ID || Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    testCoverageAttribute = await createTestCoverageAttribute(request, testRunId);
  });

  // Cleanup - delete test coverage attribute after all tests
  test.afterAll(async ({ request }) => {
    if (testCoverageAttribute?.id) {
      try {
        await deleteTestCoverageAttribute(request, testCoverageAttribute.id);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });
  // NEGATIVE: Missing required fields
  test('POST /coverage-attributes - should fail with missing required fields @negative @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.post(COVERAGE_ATTRIBUTES_URL, {
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
      message: 'Validation error',
      error: 'Bad Request',
    });
    expect(Array.isArray(body.subErrors)).toBe(true);
    expect(body.subErrors).toEqual(
      expect.arrayContaining([
        'name must be shorter than or equal to 54 characters',
        'name must be longer than or equal to 3 characters',
        'name must be a string',
        'name should not be empty',
        'color must be HEX starting with "#" (e.g. #ee2020)',
        'color must be a string',
      ])
    );
  });

  // NEGATIVE: Invalid color format
  test('POST /coverage-attributes - should fail with invalid color format @negative @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.post(COVERAGE_ATTRIBUTES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Invalid Color',
        color: 'not-a-color',
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      message: 'Validation error',
      error: 'Bad Request',
    });
    expect(Array.isArray(body.subErrors)).toBe(true);
    expect(body.subErrors).toEqual(
      expect.arrayContaining(['color must be HEX starting with "#" (e.g. #ee2020)'])
    );
  });

  // POST - Create coverage attribute
  test('POST /coverage-attributes - create @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.post(COVERAGE_ATTRIBUTES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: coverageAttributePayload,
    });

    const responseBody = await response.text();
    expect(response.status()).toBe(201);

    // Parse and verify the response body
    const body = JSON.parse(responseBody);
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');

    // Clean up - delete the created coverage attribute
    await deleteTestCoverageAttribute(request, body.id);
  });

  // GET (list)
  test('GET /coverage-attributes?sortBy=order&sortOrder=DESC&status=true - list @smoke @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.get(
      `${COVERAGE_ATTRIBUTES_URL}?sortBy=order&sortOrder=DESC&status=true`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
        },
      }
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('limit');
    expect(body).toHaveProperty('page');
    expect(Array.isArray(body.data)).toBeTruthy();
    if (body.data.length > 0) {
      for (const item of body.data) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('color');
        expect(item).toHaveProperty('order');
        expect(item).toHaveProperty('createdAt');
        expect(item).toHaveProperty('updatedAt');
      }
    }
  });

  // NEGATIVE: GET list without token
  test('GET /coverage-attributes without token - should fail with 401 @negative @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.get(COVERAGE_ATTRIBUTES_URL);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication error: Token missing',
    });
  });

  // PATCH - Update coverage attribute
  test('PATCH /coverage-attributes/:id - update @regression @api @coverageAttribute', async ({
    request,
  }) => {
    // Use the shared test coverage attribute
    const updatePayload = {
      name: `Updated Label ${testRunId}_${Date.now()}`,
      color: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`,
    };

    const response = await request.patch(`${COVERAGE_ATTRIBUTES_URL}/${testCoverageAttribute.id}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: updatePayload,
    });

    // Verify the response
    expect(response.status()).toBe(200);
    const body = await response.json();

    // According to API specification, PATCH only returns the ID
    expect(Object.keys(body)).toEqual(['id']);
    expect(body.id).toBe(testCoverageAttribute.id);
  });

  // NEGATIVE: PATCH with non-existent id
  test('PATCH /coverage-attributes/:id with non-existent id - should fail with 400 @negative @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.patch(`${COVERAGE_ATTRIBUTES_URL}/nonexistent-id-12345`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Does Not Exist',
        color: '#000000',
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed (uuid is expected)',
    });
    expect(body).toHaveProperty('correlationId');
  });

  // NEGATIVE: PATCH without token
  test('PATCH /coverage-attributes/:id without token - should fail with 401 @negative @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.patch(`${COVERAGE_ATTRIBUTES_URL}/nonexistent-id-12345`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        name: 'No Token',
        color: '#000000',
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

  // NEGATIVE: DELETE with non-existent id
  test('DELETE /coverage-attributes/:id with non-existent id - should fail with 400 @negative @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.delete(`${COVERAGE_ATTRIBUTES_URL}/nonexistent-id-12345`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed (uuid is expected)',
    });
    expect(body).toHaveProperty('correlationId');
  });

  // NEGATIVE: DELETE without token
  test('DELETE /coverage-attributes/:id without token - should fail with 401 @negative @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.delete(`${COVERAGE_ATTRIBUTES_URL}/nonexistent-id-12345`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      message: expect.any(String),
    });
  });

  // DELETE - Remove coverage attribute (should be last test as it deletes the shared test object)
  test('DELETE /coverage-attributes/:id - should delete an existing coverage attribute @smoke @regression @api @coverageAttribute', async ({
    request,
  }) => {
    // Use the shared test coverage attribute
    const response = await request.delete(
      `${COVERAGE_ATTRIBUTES_URL}/${testCoverageAttribute.id}`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseBody = await response.text();

    // Verify the response
    expect(response.status()).toBe(200);

    // Verify the response body contains the ID of the deleted attribute
    const body = JSON.parse(responseBody);
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(testCoverageAttribute.id);

    // Mark as deleted so afterAll doesn't try to delete it again
    testCoverageAttribute.id = '';
  });
});
