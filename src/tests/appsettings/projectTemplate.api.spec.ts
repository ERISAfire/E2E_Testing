import { test, expect } from '@playwright/test';
import { EnvConfig } from '../../config/env.config';

// Get config singleton
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint for project templates
const TEMPLATES_PATH = '/v1/templates';
const TEMPLATES_URL = `${API_BASE_URL}${TEMPLATES_PATH}`;

// Interface for the template response
export interface ProjectTemplate {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  color: string;
  status: 'active' | 'draft';
  trelloCardId: string | null;
  order: string;
  complianceEventRule?: {
    id: string;
    name: string;
    // Add other fields as needed
  };
}

// Use describe.serial to ensure tests run in order and share state
test.describe.serial('Project Templates API', () => {
  // Generate a unique test run ID to prevent conflicts
  const testRunId = `api_${process.env.GITHUB_RUN_ID || Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Variable to store the created template ID between tests
  let createdTemplateId: string;
  test('GET /templates - should return list of project templates @regression @api @projectTemplate', async ({
    request,
  }) => {
    // Act
    const response = await request.get(TEMPLATES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Assert
    expect(response.status()).toBe(200);
    const body = await response.json();

    // Verify response structure
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);

    // If there are templates, verify their structure
    if (body.data.length > 0) {
      const template = body.data[0] as ProjectTemplate;

      // Required fields
      expect(template).toHaveProperty('id');
      expect(typeof template.id).toBe('string');

      expect(template).toHaveProperty('name');
      expect(typeof template.name).toBe('string');

      expect(template).toHaveProperty('color');
      expect(template.color).toMatch(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);

      expect(template).toHaveProperty('status');
      expect(['active', 'draft']).toContain(template.status);

      // Optional fields with type checking
      if (template.trelloCardId !== null) {
        expect(typeof template.trelloCardId).toBe('string');
      }

      // Check complianceEventRule if it exists
      if (template.complianceEventRule) {
        expect(template.complianceEventRule).toHaveProperty('id');
        expect(typeof template.complianceEventRule.id).toBe('string');

        expect(template.complianceEventRule).toHaveProperty('name');
        expect(typeof template.complianceEventRule.name).toBe('string');
      }
    }
  });

  test('GET /templates - should return templates with valid status values @regression @api @projectTemplate', async ({
    request,
  }) => {
    // Act
    const response = await request.get(TEMPLATES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Assert
    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.data.length > 0) {
      // Check that all templates have valid status values
      const statuses = new Set(body.data.map((t: ProjectTemplate) => t.status));
      expect(Array.from(statuses).every((s) => ['active', 'draft'].includes(s as string))).toBe(
        true
      );
    }
  });

  test('GET /templates - should return templates with valid date formats @regression @api @projectTemplate', async ({
    request,
  }) => {
    // Act
    const response = await request.get(TEMPLATES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Assert
    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.data.length > 0) {
      // Check that all date fields are valid ISO 8601 dates
      body.data.forEach((template: ProjectTemplate) => {
        expect(new Date(template.createdAt).toString()).not.toBe('Invalid Date');
        expect(new Date(template.updatedAt).toString()).not.toBe('Invalid Date');
      });
    }
  });

  test('GET /templates - should return templates with valid color formats @regression @api @projectTemplate', async ({
    request,
  }) => {
    // Act
    const response = await request.get(TEMPLATES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Assert
    expect(response.status()).toBe(200);
    const body = await response.json();

    if (body.data.length > 0) {
      // Check that all color fields are valid hex colors (3 or 6 digits, with or without #)
      const colorRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      body.data.forEach((template: ProjectTemplate) => {
        expect(template.color).toMatch(colorRegex);
      });
    }
  });

  test('POST /templates - should create a new project template @regression @smoke @api @projectTemplate', async ({
    request,
  }) => {
    // Arrange
    // Generate unique test data with test run ID
    const templateData = {
      name: `API_${testRunId}_Template`,
      color: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`,
      status: 'active' as const,
      trelloCardId: `test_${testRunId}_card`,
    };

    // Act
    const response = await request.post(TEMPLATES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: templateData,
    });

    // Assert
    expect(response.status()).toBe(201);
    const responseBody = await response.json();

    // Verify response structure and data
    expect(responseBody).toMatchObject({
      name: templateData.name,
      color: templateData.color,
      status: templateData.status,
      trelloCardId: templateData.trelloCardId,
    });

    // Verify required fields
    expect(responseBody).toHaveProperty('id');
    const templateId = responseBody.id;
    expect(typeof templateId).toBe('string');
    expect(responseBody).toHaveProperty('createdAt');
    expect(new Date(responseBody.createdAt).toString()).not.toBe('Invalid Date');
    expect(responseBody).toHaveProperty('updatedAt');
    expect(new Date(responseBody.updatedAt).toString()).not.toBe('Invalid Date');
    expect(responseBody).toHaveProperty('order');
    expect(typeof responseBody.order).toBe('string');

    // Store the created template ID for use in the PATCH test
    createdTemplateId = templateId;
  });

  test('POST /templates - should fail with missing required fields @negative @regression @api @projectTemplate', async ({
    request,
  }) => {
    // Act - Send empty payload
    const response = await request.post(TEMPLATES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {},
    });

    // Assert
    expect(response.status()).toBe(400);
    const body = await response.json();

    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('error', 'Bad Request');

    // Check for validation errors on required fields
    const requiredFields = ['name', 'color', 'status'];
    requiredFields.forEach((field) => {
      expect(JSON.stringify(body)).toContain(field);
    });
  });

  test.skip('POST /templates - should fail with invalid status @negative @regression @api @projectTemplate', async ({
    request,
  }) => {
    // Arrange
    const invalidData = {
      name: 'Invalid Status Test',
      color: '#123456',
      status: 'invalid_status',
      trelloCardId: '639371d1f9968405da28a5ec',
    };

    // Act
    const response = await request.post(TEMPLATES_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: invalidData,
    });

    // Assert
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
  });

  test('PATCH /templates/:id - should update an existing project template @regression @smoke @api @projectTemplate', async ({
    request,
  }) => {
    // Fail the test if no template was created (shouldn't happen with describe.serial)
    if (!createdTemplateId) {
      throw new Error('No template ID available for update - POST test may have failed');
    }

    // Prepare update data
    const updateData = {
      name: `Updated Template ${Date.now()}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      status: 'draft' as const,
      trelloCardId: '639371d1f9968405da28a5ec',
    };

    // Act: Update the template using the stored template ID
    const updateResponse = await request.patch(`${TEMPLATES_URL}/${createdTemplateId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: updateData,
    });

    // Assert
    expect(updateResponse.status()).toBe(200);
    const responseBody = await updateResponse.json();

    // Verify the response contains the template ID
    expect(responseBody).toHaveProperty('id', createdTemplateId);
  });

  test.afterAll(async ({ request }) => {
    // Cleanup: Delete the created template after all tests
    if (createdTemplateId) {
      try {
        await request.delete(`${TEMPLATES_URL}/${createdTemplateId}`, {
          headers: {
            Authorization: `Bearer ${API_BEARER_TOKEN}`,
          },
        });
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  });

  test('DELETE /templates/:id - should delete an existing project template @regression @smoke @api @projectTemplate', async ({
    request,
  }) => {
    // Skip if no template was created
    test.skip(
      !createdTemplateId,
      'No template ID available for deletion - POST test may have failed'
    );

    // Act: Delete the template using the stored template ID
    const deleteResponse = await request.delete(`${TEMPLATES_URL}/${createdTemplateId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Assert
    expect(deleteResponse.status()).toBe(200);
  });
});
