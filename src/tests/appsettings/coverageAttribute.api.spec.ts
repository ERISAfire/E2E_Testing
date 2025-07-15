import { test, expect } from '@playwright/test';

import * as dotenv from 'dotenv';
dotenv.config();

// Base URL and token from .env
const API_BASE_URL = process.env.API_BASE_URL!;
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN!;

// Endpoint for coverage attributes
const COVERAGE_ATTRIBUTES_PATH = '/v1/coverage-attributes';
const COVERAGE_ATTRIBUTES_URL = `${API_BASE_URL}${COVERAGE_ATTRIBUTES_PATH}`;

// Example of creating a coverage attribute
const coverageAttributePayload = {
  name: 'Label',
  color: '#999999',
};

let createdId: string;

// POST
// Create coverage attribute
// TODO: Add token retrieval

test.describe('Coverage Attribute API', () => {
  test('POST /coverage-attributes - create @smoke @regression @critical @api @coverageAttribute', async ({
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
  test('GET /coverage-attributes?sortBy=order&sortOrder=DESC&status=true - list @smoke @regression @critical @api @coverageAttribute', async ({
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

  // PATCH
  test.skip('PATCH /coverage-attributes/:id - update @regression @integration @api @coverageAttribute', async ({
    request,
  }) => {
    test.skip(!createdId, 'No coverage attribute created');
    const updatePayload = { ...coverageAttributePayload, name: 'Updated Label' };
    const response = await request.patch(`${COVERAGE_ATTRIBUTES_URL}/${createdId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: updatePayload,
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.name).toBe('Updated Label');
  });

  // DELETE
  test.skip('DELETE /coverage-attributes/:id - delete @regression @integration @api @coverageAttribute', async ({
    request,
  }) => {
    test.skip(!createdId, 'No coverage attribute created');
    const response = await request.delete(`${COVERAGE_ATTRIBUTES_URL}/${createdId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });
    expect(response.ok()).toBeTruthy();
  });
});
