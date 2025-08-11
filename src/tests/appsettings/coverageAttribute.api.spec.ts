import { test, expect } from '@playwright/test';

import { EnvConfig } from '../../config/env.config';

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for coverage attributes
const COVERAGE_ATTRIBUTES_PATH = '/v1/coverage-attributes';
const COVERAGE_ATTRIBUTES_URL = `${API_BASE_URL}${COVERAGE_ATTRIBUTES_PATH}`;

// Example of creating a coverage attribute
const coverageAttributePayload = {
  name: 'Label',
  color: '15710d',
};

let createdId: string;

test.describe('Coverage Attribute API', () => {
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
        'color must be a hexadecimal color',
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
    expect(body.subErrors).toEqual(expect.arrayContaining(['color must be a hexadecimal color']));
  });

  // POST
  // Create coverage attribute
  test('POST /coverage-attributes - create @smoke @regression @critical @regression @api @coverageAttribute', async ({
    request,
  }) => {
    const response = await request.post(COVERAGE_ATTRIBUTES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: coverageAttributePayload,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    createdId = body.id;
  });

  // GET (list)
  test('GET /coverage-attributes?sortBy=order&sortOrder=DESC&status=true - list @smoke @regression @critical @regression @api @coverageAttribute', async ({
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
        expect(item).toHaveProperty('status');
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

  // PATCH
  test('PATCH /coverage-attributes/:id - update @regression @integration @regression @api @coverageAttribute', async ({
    request,
  }) => {
    test.skip(!createdId, 'No coverage attribute created');
    const updatePayload = { ...coverageAttributePayload, name: 'Updated Label', color: '#123456' };
    const response = await request.patch(`${COVERAGE_ATTRIBUTES_URL}/${createdId}`, {
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

  // Explicit DELETE test to verify the endpoint works
  test('DELETE /coverage-attributes/:id - should delete an existing coverage attribute @regression @api @coverageAttribute', async ({
    request,
  }) => {
    // Skip if no coverage attribute was created
    test.skip(
      !createdId,
      'No coverage attribute ID available for deletion - POST test may have failed'
    );

    // Act: Delete the coverage attribute
    const response = await request.delete(`${COVERAGE_ATTRIBUTES_URL}/${createdId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Assert
    expect(response.status()).toBe(200);
  });

  // Cleanup after all tests
  test.afterAll(async ({ request }) => {
    // Cleanup: Delete the created coverage attribute if it still exists
    if (createdId) {
      try {
        await request.delete(`${COVERAGE_ATTRIBUTES_URL}/${createdId}`, {
          headers: {
            Authorization: `Bearer ${API_BEARER_TOKEN}`,
          },
        });
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });
});
