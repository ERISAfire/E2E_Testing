import { test, expect, APIRequestContext } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

// Config
const config = EnvConfig.getInstance();
const API_BASE_URL = config.getConfig().apiBaseUrl;
const API_BEARER_TOKEN = config.getConfig().apiBearerToken;

// Endpoints
const PLANS_PATH = '/v1/plans';
const PLANS_URL = `${API_BASE_URL}${PLANS_PATH}`;

// Data types
interface PlanResponseIdOnly {
  id: string;
}

interface PlanListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  employerId: number;
  planName: string;
  planNumber: number;
  planStartDate: string;
  planEndDate: string;
  sponsorEin: string;
  sponsorName: string;
  sponsorPhone: string;
  sponsorAddress: string;
  adminName: string;
  adminPhone: string;
  adminAddress: string;
  erisaStatus: string;
  acaStatus: string;
  cobraStatus: string;
  marketSegment: string;
  participantsCount: string;
  adminSameAsSponsor: boolean;
  originalEffectiveDate: string;
}

// Helpers
const authHeaders = {
  Authorization: `Bearer ${API_BEARER_TOKEN}`,
  'Content-Type': 'application/json',
};

// Generate a unique plan year (far future) to avoid overlap with existing plans
type UniquePlanDates = { startIso: string; endIso: string; year: number };
const computeUniquePlanDates = (): UniquePlanDates => {
  const base = 2070; // far future to avoid collisions with seeded data
  const offset = Math.floor(Date.now() / 1000) % 25; // 0..24
  const year = base + offset;
  const start = new Date(Date.UTC(year, 0, 1, 12, 0, 0)); // Jan 1, year at noon UTC
  const end = new Date(Date.UTC(year, 11, 31, 12, 0, 0)); // Dec 31, year at noon UTC
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    year,
  };
};

const createTestPlan = async (
  request: APIRequestContext,
  payloadOverride?: Partial<Record<string, unknown>>
): Promise<string> => {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const { startIso, endIso, year } = computeUniquePlanDates();
  const payload = {
    employerId: 79,
    planName: `Auto Plan ${year} ${uniqueSuffix}`,
    planNumber: Math.floor(Math.random() * 900) + 100,
    planStartDate: startIso,
    planEndDate: endIso,
    sponsorEin: '99-9999999',
    sponsorName: 'John Doe',
    sponsorPhone: '(123) 456-7890',
    sponsorAddress: '123 Main St, City, Country',
    adminSameAsSponsor: true,
    adminName: 'John Doe',
    adminPhone: '(123) 456-7890',
    adminAddress: '123 Main St, City, Country',
    erisaStatus: 'Unknown',
    acaStatus: '50+ full-time equivalents',
    cobraStatus: '20+ employees',
    marketSegment: '100-500 employees',
    participantsCount: '100+ employee-participants',
    originalEffectiveDate: '2024-01-01T12:00:00.000Z',
    ...payloadOverride,
  } as Record<string, unknown>;

  const response = await request.post(PLANS_URL, {
    headers: authHeaders,
    data: payload,
  });
  const body = await response.json();
  expect(response.status(), await response.text()).toBe(201);
  expect(body).toHaveProperty('id');
  return (body as PlanResponseIdOnly).id;
};

const deleteTestPlan = async (request: APIRequestContext, id: string): Promise<void> => {
  const response = await request.delete(`${PLANS_URL}/${id}`, { headers: authHeaders });
  // API returns { id } on success per user's sample
  expect(response.status(), await response.text()).toBe(200);
  const body = (await response.json()) as PlanResponseIdOnly;
  expect(body).toHaveProperty('id');
  expect(body.id).toBe(id);
};

// Spec

test.describe.serial('Plan Manager API', () => {
  let createdPlanId: string;
  const employerId = 79; // from user's sample
  let createdPlanSnapshot: PlanListItem | undefined;

  test('POST /v1/plans - create plan @smoke @regression @api @plans', async ({ request }) => {
    createdPlanId = await createTestPlan(request, {
      planName: '2025-26 Plan 501',
      planNumber: 501,
    });
  });

  test('GET /v1/plans?employerId=79 - list should contain created plan @smoke @regression @api @plans', async ({
    request,
  }) => {
    const response = await request.get(`${PLANS_URL}?employerId=${employerId}`, {
      headers: authHeaders,
    });
    expect(response.status(), await response.text()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);

    const found = (body.data as PlanListItem[]).find((p) => p.id === createdPlanId);
    expect(found, 'Created plan should be present in GET list').toBeTruthy();
    if (found) {
      expect(found.employerId).toBe(employerId);
      expect(found.planName).toContain('2025-26 Plan');
      expect(found.planNumber).toBe(501);
      expect(found.sponsorEin).toBe('99-9999999');
      expect(found.adminSameAsSponsor).toBe(true);
      createdPlanSnapshot = found;
    }
  });

  test('PATCH /v1/plans/:id - update plan basic fields @regression @api @plans', async ({
    request,
  }) => {
    test.skip(!createdPlanId, 'No plan created');
    // Ensure we have a full snapshot to satisfy strict PATCH validators
    if (!createdPlanSnapshot) {
      const res = await request.get(`${PLANS_URL}?employerId=${employerId}`, {
        headers: authHeaders,
      });
      expect(res.status()).toBe(200);
      const listBody = await res.json();
      createdPlanSnapshot = (listBody.data as PlanListItem[]).find(
        (p: PlanListItem) => p.id === createdPlanId
      );
      expect(createdPlanSnapshot, 'Unable to load created plan snapshot for PATCH').toBeTruthy();
    }

    const fullUpdatePayload = {
      employerId: createdPlanSnapshot!.employerId,
      planName: '2025-26 Plan 501 - Updated',
      planNumber: 502,
      planStartDate: createdPlanSnapshot!.planStartDate,
      planEndDate: createdPlanSnapshot!.planEndDate,
      sponsorEin: createdPlanSnapshot!.sponsorEin,
      sponsorName: createdPlanSnapshot!.sponsorName,
      sponsorPhone: createdPlanSnapshot!.sponsorPhone,
      sponsorAddress: createdPlanSnapshot!.sponsorAddress,
      adminSameAsSponsor: createdPlanSnapshot!.adminSameAsSponsor,
      adminName: createdPlanSnapshot!.adminName,
      adminPhone: createdPlanSnapshot!.adminPhone,
      adminAddress: createdPlanSnapshot!.adminAddress,
      erisaStatus: createdPlanSnapshot!.erisaStatus,
      acaStatus: createdPlanSnapshot!.acaStatus,
      cobraStatus: createdPlanSnapshot!.cobraStatus,
      marketSegment: createdPlanSnapshot!.marketSegment,
      participantsCount: createdPlanSnapshot!.participantsCount,
      originalEffectiveDate: createdPlanSnapshot!.originalEffectiveDate,
    } as Record<string, unknown>;

    const response = await request.patch(`${PLANS_URL}/${createdPlanId}`, {
      headers: authHeaders,
      data: fullUpdatePayload,
    });

    // According to user's sample, returns 200, response body unspecified.
    expect(response.status(), await response.text()).toBe(200);
    // Try to parse JSON; if fails, ignore.
    try {
      const body = await response.json();
      // Some services return only id on patch
      if (body && typeof body === 'object' && 'id' in body) {
        expect((body as PlanResponseIdOnly).id).toBe(createdPlanId);
      }
    } catch {
      // No JSON body; acceptable per sample
    }
  });

  test('DELETE /v1/plans/:id - delete created plan (cleanup last) @smoke @regression @api @plans', async ({
    request,
  }) => {
    test.skip(!createdPlanId, 'No plan created');
    await deleteTestPlan(request, createdPlanId);
    createdPlanId = '';
  });

  // NEGATIVE: POST with missing required fields
  test('POST /v1/plans - missing required fields should return 400 @negative @regression @api @plans', async ({
    request,
  }) => {
    const response = await request.post(PLANS_URL, {
      headers: authHeaders,
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: expect.any(String),
      message: expect.any(String),
    });
    // subErrors may vary by validator; just ensure it exists if provided
    if ('subErrors' in body) {
      expect(Array.isArray(body.subErrors)).toBe(true);
    }
  });

  // NEGATIVE: DELETE invalid id
  test('DELETE /v1/plans/:id with invalid id - should return 400 @negative @regression @api @plans', async ({
    request,
  }) => {
    const response = await request.delete(`${PLANS_URL}/not-a-uuid-123`, {
      headers: authHeaders,
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.any(String),
    });
  });

  // NEGATIVE: DELETE without token
  test('DELETE /v1/plans/:id without token - should return 401 @negative @regression @api @plans', async ({
    request,
  }) => {
    const response = await request.delete(`${PLANS_URL}/not-a-uuid-123`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      message: expect.any(String),
    });
  });
});
