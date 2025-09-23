import { test, expect, APIRequestContext } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

// Types based on provided API shape
interface TrelloLabelAssociationItemLabel {
  id: string;
  trelloLabelId: string;
  name: string;
  color: string;
}

interface TrelloLabelAssociationItemOrg {
  organization_id: string;
  name: string;
}

interface TrelloLabelAssociationItem {
  id: string;
  order: string;
  organization: TrelloLabelAssociationItemOrg;
  labels: TrelloLabelAssociationItemLabel[];
  createdAt: string;
  updatedAt: string;
}

interface CreateTrelloLabelAssociationPayload {
  consultantOrgId: string;
  labelIds: string[];
}

// Config
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoint
const TRELLO_LABEL_ASSOCIATIONS_PATH = '/v1/trello/consultant-associations';
const TRELLO_LABEL_ASSOCIATIONS_URL = `${API_BASE_URL}${TRELLO_LABEL_ASSOCIATIONS_PATH}`;

// Test data (as provided)
const TEST_CONSULTANT_ORG_ID = '66e5f76a-6ba5-4e8c-bf34-5e3ed1b3bef3'; // Automation_Tests
const TEST_LABEL_ID = '903fac81-9962-478d-a46a-bac6d0627629'; // Automation_Tests

// Helpers
const createAssociation = async (
  request: APIRequestContext,
  payload: CreateTrelloLabelAssociationPayload
): Promise<string> => {
  const response = await request.post(TRELLO_LABEL_ASSOCIATIONS_URL, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(`Failed to create Trello Label Association: ${response.status()} - ${body}`);
  }

  const body = await response.json();
  return body.id as string; // API returns { id }
};

const deleteAssociation = async (request: APIRequestContext, id: string): Promise<void> => {
  const response = await request.delete(`${TRELLO_LABEL_ASSOCIATIONS_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${API_BEARER_TOKEN}`,
    },
  });

  if (response.status() !== 200) {
    console.warn(`Failed to delete Trello Label Association ${id}: ${response.status()}`);
  }
};

// Find existing association ID by consultantOrgId and labelId (uses GET list)
const findAssociationIdByOrgAndLabel = async (
  request: APIRequestContext,
  consultantOrgId: string,
  labelId: string
): Promise<string | null> => {
  const response = await request.get(TRELLO_LABEL_ASSOCIATIONS_URL, {
    headers: { Authorization: `Bearer ${API_BEARER_TOKEN}` },
  });
  if (response.status() !== 200) return null;
  const body = await response.json();
  const match = (body.data as TrelloLabelAssociationItem[]).find(
    (item) =>
      item.organization?.organization_id === consultantOrgId &&
      Array.isArray(item.labels) &&
      item.labels.some((l) => l.id === labelId)
  );
  return match?.id ?? null;
};

// Suite
test.describe.serial('Trello Label Associations API', () => {
  // POST - create
  test('POST /trello/consultant-associations - create @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    let tempId: string | null = null;
    try {
      tempId = await createAssociation(request, {
        consultantOrgId: TEST_CONSULTANT_ORG_ID,
        labelIds: [TEST_LABEL_ID],
      });
    } catch (err: unknown) {
      // If duplicate exists already in environment, delete it and retry once
      const existingId = await findAssociationIdByOrgAndLabel(
        request,
        TEST_CONSULTANT_ORG_ID,
        TEST_LABEL_ID
      );
      if (existingId) {
        await deleteAssociation(request, existingId);
        tempId = await createAssociation(request, {
          consultantOrgId: TEST_CONSULTANT_ORG_ID,
          labelIds: [TEST_LABEL_ID],
        });
      } else {
        throw err;
      }
    }

    expect(typeof tempId).toBe('string');

    // Cleanup
    await deleteAssociation(request, tempId as string);
  });

  // NEGATIVE: POST - missing required fields
  test('POST /trello/consultant-associations - missing required fields should 400 @negative @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    const response = await request.post(TRELLO_LABEL_ASSOCIATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'Bad Request');
    expect(body).toHaveProperty('message');
  });

  // NEGATIVE: POST - invalid types/format
  test('POST /trello/consultant-associations - invalid types should 400 @negative @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    const response = await request.post(TRELLO_LABEL_ASSOCIATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        consultantOrgId: 'not-a-uuid',
        labelIds: ['not-a-uuid'],
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'Bad Request');
    expect(body).toHaveProperty('message');
  });

  // NEGATIVE: Duplicate create (self-contained)
  test('POST /trello/consultant-associations - duplicate should 400 with message @negative @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    // Ensure a base association exists for this test
    const baseId = await createAssociation(request, {
      consultantOrgId: TEST_CONSULTANT_ORG_ID,
      labelIds: [TEST_LABEL_ID],
    });

    try {
      const response = await request.post(TRELLO_LABEL_ASSOCIATIONS_URL, {
        headers: {
          Authorization: `Bearer ${API_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: {
          consultantOrgId: TEST_CONSULTANT_ORG_ID,
          labelIds: [TEST_LABEL_ID],
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body).toMatchObject({
        message: 'Consultant already has an association',
        error: 'Bad Request',
        statusCode: 400,
      });
      expect(body).toHaveProperty('correlationId');
    } finally {
      // Cleanup base association
      await deleteAssociation(request, baseId);
    }
  });

  // GET - list
  test('GET /trello/consultant-associations - list @smoke @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    const response = await request.get(TRELLO_LABEL_ASSOCIATIONS_URL, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length > 0) {
      const item = body.data[0] as TrelloLabelAssociationItem;
      expect(item).toHaveProperty('id');
      expect(typeof item.id).toBe('string');
      expect(item).toHaveProperty('order');
      expect(typeof item.order).toBe('string');
      expect(item).toHaveProperty('organization');
      expect(item.organization).toMatchObject({
        organization_id: expect.any(String),
        name: expect.any(String),
      });
      expect(Array.isArray(item.labels)).toBe(true);
      if (item.labels.length > 0) {
        const label = item.labels[0];
        expect(label).toMatchObject({
          id: expect.any(String),
          trelloLabelId: expect.any(String),
          name: expect.any(String),
          color: expect.any(String),
        });
      }
      expect(new Date(item.createdAt).toString()).not.toBe('Invalid Date');
      expect(new Date(item.updatedAt).toString()).not.toBe('Invalid Date');
    }
  });

  // NEGATIVE: GET without token
  test('GET /trello/consultant-associations without token - 401 @negative @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    const response = await request.get(TRELLO_LABEL_ASSOCIATIONS_URL);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication error: Token missing',
    });
  });

  // DELETE - remove a temp association
  test('DELETE /trello/consultant-associations/:id - delete @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    const tempId = await createAssociation(request, {
      consultantOrgId: TEST_CONSULTANT_ORG_ID,
      labelIds: [TEST_LABEL_ID],
    });

    const response = await request.delete(`${TRELLO_LABEL_ASSOCIATIONS_URL}/${tempId}`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(tempId);
  });

  // NEGATIVE: DELETE with invalid id format
  test('DELETE /trello/consultant-associations/:id invalid id - 400 @negative @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    const response = await request.delete(`${TRELLO_LABEL_ASSOCIATIONS_URL}/not-a-uuid`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('statusCode', 400);
    expect(body).toHaveProperty('error', 'Bad Request');
    expect(body).toHaveProperty('message');
  });

  // NEGATIVE: POST without token
  test('POST /trello/consultant-associations without token - 401 @negative @regression @api @trelloLabelAssociations', async ({
    request,
  }) => {
    const response = await request.post(TRELLO_LABEL_ASSOCIATIONS_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        consultantOrgId: TEST_CONSULTANT_ORG_ID,
        labelIds: [TEST_LABEL_ID],
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
});
