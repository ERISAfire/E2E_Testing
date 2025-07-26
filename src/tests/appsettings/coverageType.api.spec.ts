import { test, expect } from '@playwright/test';
import { EnvConfig } from '../../config/env.config';

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for coverage types
const COVERAGE_TYPES_PATH = '/v1/coverage-types';
const COVERAGE_TYPES_URL = `${API_BASE_URL}${COVERAGE_TYPES_PATH}`;

// Example payload
const coverageTypePayload = {
  name: 'Auto_Test',
  icon: 'fal 1',
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

let createdId: string;

test.describe('Coverage Type API', () => {
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
    const response = await request.post(COVERAGE_TYPES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: coverageTypePayload,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    createdId = body.id;
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

  // PATCH
  test('PATCH /coverage-types/:id - update @regression @integration @api @coverageType', async ({
    request,
  }) => {
    test.skip(!createdId, 'No coverage type created');
    const updatePayload = {
      ...coverageTypePayload,
      name: 'Label Updated',
      icon: 'wand-magic-sparkles',
      attributes: [
        {
          id: '31b0164a-f983-4e41-9ee9-938d1ec3f083',
          type: 'available',
        },
        {
          id: '1f36557d-e729-4a0e-8888-3dbb114bafdb',
          type: 'required',
        },
      ],
    };
    const response = await request.patch(`${COVERAGE_TYPES_URL}/${createdId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: updatePayload,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(createdId);
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
    test.skip(!createdId, 'No coverage type created');
    const response = await request.patch(`${COVERAGE_TYPES_URL}/${createdId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: '', // Invalid: empty name
        icon: 123, // Invalid: number instead of string
        attributes: 'not-an-array', // Invalid: string instead of array
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
    expect(Array.isArray(body.subErrors)).toBe(true);

    // Check for specific validation errors
    const errorMessages: string[] = body.subErrors;
    expect(errorMessages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/name should not be empty/),
        expect.stringMatching(/name must be longer than or equal to 3 characters/),
        expect.stringMatching(/icon must be a string/),
        expect.stringMatching(/attributes must be an array/),
        expect.stringMatching(
          /each value in nested property attributes must be either object or array/
        ),
      ])
    );
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
    test.skip(!createdId, 'No coverage type created');
    const archiveResponse = await request.patch(`${COVERAGE_TYPES_URL}/${createdId}/archive`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    expect(archiveResponse.status()).toBe(200);
    const archiveBody = await archiveResponse.json();
    expect(archiveBody).toHaveProperty('id', createdId);
  });

  // Test unarchive functionality
  test('PATCH /coverage-types/{id}/unarchive - should unarchive coverage type @regression @api @coverageType', async ({
    request,
  }) => {
    test.skip(!createdId, 'No coverage type created');
    await request.patch(`${COVERAGE_TYPES_URL}/${createdId}/archive`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const unarchiveResponse = await request.patch(`${COVERAGE_TYPES_URL}/${createdId}/unarchive`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    expect(unarchiveResponse.status()).toBe(200);
    const unarchiveBody = await unarchiveResponse.json();
    expect(unarchiveBody).toHaveProperty('id', createdId);
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

  // DELETE
  test('DELETE /coverage-types/:id - delete @regression @integration @api @coverageType', async ({
    request,
  }) => {
    test.skip(!createdId, 'No coverage type created');
    const response = await request.delete(`${COVERAGE_TYPES_URL}/${createdId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });
    expect(response.status()).toBe(200);
  });

  // NEGATIVE: DELETE with non-existent id
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
