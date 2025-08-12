import { test, expect, APIRequestContext } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for coverage types
const COVERAGE_TYPES_PATH = '/v1/coverage-types';
const COVERAGE_TYPES_URL = `${API_BASE_URL}${COVERAGE_TYPES_PATH}`;

// Helper function to create a test coverage type
interface TestCoverageType {
  id: string;
  name: string;
  icon: string;
  attributes: Array<{ id: string; type: string }>;
}

const createTestCoverageType = async (
  request: APIRequestContext,
  testRunId: string
): Promise<TestCoverageType> => {
  const payload = {
    name: `API_${testRunId}_${Date.now()}`,
    icon: `icon_${testRunId}_${Date.now()}`,
    attributes: [
      {
        id: '31b0164a-f983-4e41-9ee9-938d1ec3f083',
        type: 'required',
      },
      {
        id: '1f36557d-e729-4a0e-8888-3dbb114bafdb',
        type: 'available',
      },
    ],
  };

  const response = await request.post(COVERAGE_TYPES_URL, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(`Failed to create test coverage type: ${response.status()} - ${body}`);
  }

  const body = await response.json();
  return { id: body.id, ...payload };
};

// Remove unused coverageTypePayload since we're using createTestCoverageType

test.describe('Coverage Types API', () => {
  // Generate a unique test run ID to prevent conflicts
  const testRunId = `api_${process.env.GITHUB_RUN_ID || Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // NEGATIVE: Missing required fields
  test('POST /coverage-types - should fail with missing required fields @negative @regression @api @coverageType', async ({
    request,
  }) => {
    const response = await request.post(COVERAGE_TYPES_URL, {
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
    expect(typeof body.correlationId).toBe('string');
    expect(Array.isArray(body.subErrors)).toBe(true);
    expect(body.subErrors).toEqual(
      expect.arrayContaining([
        'name must be shorter than or equal to 54 characters',
        'name must be longer than or equal to 3 characters',
        'name must be a string',
        'name should not be empty',
        'icon should not be empty',
        'icon must be a string',
        'attributes must be an array',
      ])
    );
  });

  // Create coverage type
  test('POST /coverage-types - create @smoke @regression @critical @api @coverageType', async ({
    request,
  }) => {
    const coverageTypeData = {
      name: `API_${testRunId}_Coverage`,
      icon: `icon_${testRunId}`,
      attributes: [
        {
          id: '31b0164a-f983-4e41-9ee9-938d1ec3f083',
          type: 'required',
        },
        {
          id: '1f36557d-e729-4a0e-8888-3dbb114bafdb',
          type: 'available',
        },
      ],
    };
    const response = await request.post(COVERAGE_TYPES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: coverageTypeData,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');

    // Verify the response contains the expected fields
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
  });

  // GET (list)
  test('GET /coverage-types?sortBy=order&sortOrder=DESC&status=true - list @smoke @regression @critical @api @coverageType', async ({
    request,
  }) => {
    const response = await request.get(
      `${COVERAGE_TYPES_URL}?sortBy=order&sortOrder=DESC&status=true`,
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
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('attributes');
        expect(Array.isArray(item.attributes)).toBeTruthy();
        for (const attr of item.attributes) {
          expect(attr).toHaveProperty('id');
          expect(attr).toHaveProperty('type');
        }
        expect(item).toHaveProperty('order');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('createdAt');
        expect(item).toHaveProperty('updatedAt');
      }
    }
  });

  // NEGATIVE: GET list without token
  test('GET /coverage-types without token - should fail with 401 @negative @regression @api @coverageType', async ({
    request,
  }) => {
    const response = await request.get(COVERAGE_TYPES_URL);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication error: Token missing',
    });
  });

  // PATCH - Update coverage type
  test('PATCH /coverage-types/:id - update @regression @api @coverageType', async ({ request }) => {
    // First create a test coverage type
    const testCoverageType = await createTestCoverageType(request, testRunId);

    // Prepare update payload
    const updatePayload = {
      name: `API_${testRunId}_Updated_${Date.now()}`,
      icon: `icon_${testRunId}_updated`,
      attributes: [
        {
          id: '31b0164a-f983-4e41-9ee9-938d1ec3f083',
          type: 'required',
        },
        {
          id: '1f36557d-e729-4a0e-8888-3dbb114bafdb',
          type: 'available',
        },
      ],
    };

    // Update the coverage type
    const response = await request.patch(`${COVERAGE_TYPES_URL}/${testCoverageType.id}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: updatePayload,
    });

    // Verify the response
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(testCoverageType.id);
  });

  // NEGATIVE: PATCH with non-existent id
  test('PATCH /coverage-types/:id with non-existent id - should fail with 400 @negative @regression @api @coverageType', async ({
    request,
  }) => {
    const response = await request.patch(`${COVERAGE_TYPES_URL}/nonexistent-id-12345`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Does Not Exist',
        icon: 'icon-x',
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation error',
    });
    expect(body).toHaveProperty('correlationId');
  });

  // NEGATIVE: PATCH with invalid payload
  test('PATCH /coverage-types/:id with invalid payload - should fail with 400 @negative @regression @api @coverageType', async ({
    request,
  }) => {
    // First create a test coverage type
    const testCoverageType = await createTestCoverageType(request, testRunId);

    const response = await request.patch(`${COVERAGE_TYPES_URL}/${testCoverageType.id}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        // Invalid payload - missing required fields
        invalidField: 'test',
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'Bad Request');
  });

  // NEGATIVE: PATCH without token
  test('PATCH /coverage-types/:id without token - should fail with 401 @negative @regression @api @coverageType', async ({
    request,
  }) => {
    const response = await request.patch(`${COVERAGE_TYPES_URL}/nonexistent-id-12345`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        name: 'No Token',
        icon: 'icon-x',
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

  // Test archive functionality
  test('PATCH /coverage-types/{id}/archive - should archive coverage type @regression @api @coverageType', async ({
    request,
  }) => {
    // First create a test coverage type
    const testCoverageType = await createTestCoverageType(request, testRunId);

    // Archive the coverage type
    const archiveResponse = await request.patch(
      `${COVERAGE_TYPES_URL}/${testCoverageType.id}/archive`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Verify the response
    expect(archiveResponse.status()).toBe(200);
    const archiveBody = await archiveResponse.json();
    expect(archiveBody).toHaveProperty('id', testCoverageType.id);
    // The API only returns the ID, so we just verify the ID is returned
    expect(archiveBody).toHaveProperty('id');
  });

  // Test unarchive functionality
  test('PATCH /coverage-types/{id}/unarchive - should unarchive coverage type @regression @api @coverageType', async ({
    request,
  }) => {
    // First create and archive a test coverage type
    const testCoverageType = await createTestCoverageType(request, testRunId);

    // First archive the coverage type
    await request.patch(`${COVERAGE_TYPES_URL}/${testCoverageType.id}/archive`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Then unarchive it
    const unarchiveResponse = await request.patch(
      `${COVERAGE_TYPES_URL}/${testCoverageType.id}/unarchive`,
      {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Verify the response
    expect(unarchiveResponse.status()).toBe(200);
    const unarchiveBody = await unarchiveResponse.json();
    expect(unarchiveBody).toHaveProperty('id', testCoverageType.id);
    // The API only returns the ID, so we just verify the ID is returned
    expect(unarchiveBody).toHaveProperty('id');
  });

  // NEGATIVE: Try to archive non-existent coverage type
  test('PATCH /coverage-types/{id}/archive with non-existent id - should fail @negative @regression @api @coverageType', async ({
    request,
  }) => {
    const response = await request.patch(`${COVERAGE_TYPES_URL}/non-existent-id-12345/archive`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
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

  // NEGATIVE: Try to unarchive non-existent coverage type
  test('PATCH /coverage-types/{id}/unarchive with non-existent id - should fail @negative @regression @api @coverageType', async ({
    request,
  }) => {
    const response = await request.patch(`${COVERAGE_TYPES_URL}/non-existent-id-12345/unarchive`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
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

  // NEGATIVE: DELETE with non-existent id

  // Explicit DELETE test to verify the endpoint works
  test('DELETE /coverage-types/:id - should delete an existing coverage type @regression @api @coverageType', async ({
    request,
  }) => {
    // First create a test coverage type
    const testCoverageType = await createTestCoverageType(request, testRunId);

    // Act: Delete the coverage type
    const response = await request.delete(`${COVERAGE_TYPES_URL}/${testCoverageType.id}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    // Assert: Verify the response
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id', testCoverageType.id);
  });

  // No global cleanup needed - each test is responsible for its own cleanup

  test('DELETE /coverage-types/:id with non-existent id - should fail with 400 @negative @regression @api @coverageType', async ({
    request,
  }) => {
    const response = await request.delete(`${COVERAGE_TYPES_URL}/nonexistent-id-12345`, {
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
});
