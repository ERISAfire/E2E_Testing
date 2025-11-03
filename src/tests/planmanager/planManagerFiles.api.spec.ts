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

interface PlanFileItem {
  id: string;
  name: string;
  size: number;
  url: string;
  planId: string;
  type: string; // e.g., 'SchedulesA'
}
const authHeaders = {
  Authorization: `Bearer ${API_BEARER_TOKEN}`,
};
const noAuthHeaders = {} as const;

// Minimal valid PDF as base64 (same as UI test), renders text "Schedule A"
const SCHEDULE_A_PDF_BASE64 =
  'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUj4+CmVuZG9iagoKMiAwIG9iago8PC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxPj4KZW5kb2JqCgozIDAgb2JqCjw8L1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSPj4+Pj4+CmVuZG9iagoKNCAwIG9iago8PC9MZW5ndGggNDQ+PgpzdHJlYW0KQlQKL0YxIDEyIFRmIDcyIDEyMCBUZCAoU2NoZWR1bGUgQSkgVGoKRVQKZW5kc3RyZWFmCmVuZG9iagoKNSAwIG9iago8PC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvTmFtZSAvRjEgL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA2MyAwMDAwMCBuIAowMDAwMDAwMTQ1IDAwMDAwIG4gCjAwMDAwMDAyNDMgMDAwMDAgbiAKMDAwMDAwMDM2NiAwMDAwMCBuIAowMDAwMDAwNDY1IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSAyIC9Sb290IDEgMCBSIC9JbmZvIDYgMCBSPj4Kc3RhcnR4cmVmCjUwNgolJUVPRgo=';
const makePdfFilePayload = (): { name: string; mimeType: string; buffer: Buffer } => ({
  name: 'schedule_A.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from(SCHEDULE_A_PDF_BASE64, 'base64'),
});

const createTestPlan = async (
  request: APIRequestContext,
  payloadOverride?: Partial<Record<string, unknown>>
): Promise<string> => {
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  // Compute a unique future plan year per run to avoid overlapping with existing plans
  const baseYear = 2070;
  const offset = Date.now() % 20; // spreads years over a 20-year window
  const year = baseYear + offset;
  const startIso = new Date(Date.UTC(year, 0, 1, 12, 0, 0)).toISOString();
  const endIso = new Date(Date.UTC(year, 11, 31, 12, 0, 0)).toISOString();
  const payload = {
    employerId: 79,
    planName: `Files API ${uniqueSuffix}`,
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
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    data: payload,
  });
  const body = await response.json();
  expect(response.status(), await response.text()).toBe(201);
  expect(body).toHaveProperty('id');
  return (body as PlanResponseIdOnly).id;
};

const deleteTestPlan = async (request: APIRequestContext, id: string): Promise<void> => {
  const response = await request.delete(`${PLANS_URL}/${id}`, { headers: authHeaders });
  expect([200, 204].includes(response.status()), await response.text()).toBeTruthy();
};

// Spec

test.describe.serial('Plan Manager Files API @api @plans', () => {
  let planId: string;
  let uploadedFileId: string;

  test('POST /v1/plans/:id/files - upload SchedulesA file @api @plans @regression', async ({
    request,
  }) => {
    // Arrange: create a new plan to attach files to
    planId = await createTestPlan(request);

    // Act: upload file via multipart
    const response = await request.post(`${PLANS_URL}/${planId}/files`, {
      headers: authHeaders,
      multipart: {
        file: makePdfFilePayload(),
        type: 'SchedulesA',
      },
    });

    // Assert
    expect(response.status(), await response.text()).toBe(201);
    const body = (await response.json()) as PlanResponseIdOnly;
    expect(body).toHaveProperty('id');
    uploadedFileId = body.id;
  });

  // Negative: unauthorized upload
  test('POST /v1/plans/:id/files - 401 when unauthorized @api @plans @negative @regression', async ({
    request,
  }) => {
    test.skip(!planId, 'No plan created');
    const response = await request.post(`${PLANS_URL}/${planId}/files`, {
      headers: noAuthHeaders,
      multipart: {
        file: makePdfFilePayload(),
        type: 'SchedulesA',
      },
    });
    expect(response.status(), await response.text()).toBe(401);
  });

  // Negative: invalid type
  test('POST /v1/plans/:id/files - 400 when type is invalid @api @plans @negative @regression', async ({
    request,
  }) => {
    test.skip(!planId, 'No plan created');
    const response = await request.post(`${PLANS_URL}/${planId}/files`, {
      headers: authHeaders,
      multipart: {
        file: makePdfFilePayload(),
        type: 'InvalidTypeName',
      },
    });
    expect([400, 422].includes(response.status()), await response.text()).toBeTruthy();
  });

  // Negative: missing file field
  test('POST /v1/plans/:id/files - 400 when file is missing @api @plans @negative @regression', async ({
    request,
  }) => {
    test.skip(!planId, 'No plan created');
    const response = await request.post(`${PLANS_URL}/${planId}/files`, {
      headers: authHeaders,
      multipart: {
        // file missing on purpose
        type: 'SchedulesA',
      },
    });
    expect([400, 422].includes(response.status()), await response.text()).toBeTruthy();
  });

  test('GET /v1/plans/:id/files - list should contain uploaded file @api @plans @regression', async ({
    request,
  }) => {
    test.skip(!planId || !uploadedFileId, 'No plan or file uploaded');
    const response = await request.get(`${PLANS_URL}/${planId}/files`, { headers: authHeaders });
    expect(response.status(), await response.text()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    const list = body.data as PlanFileItem[];
    const found = list.find((f) => f.id === uploadedFileId);
    expect(found, 'Uploaded file should be present in list').toBeTruthy();
    if (found) {
      expect(found.planId).toBe(planId);
      expect(found.type).toBe('SchedulesA');
      expect(found.name).toMatch(/\.pdf$/i);
      expect(found.size).toBeGreaterThan(0);
    }
  });

  test('GET /v1/plans/:planId/files/:fileId/download - should return 200 @api @plans @regression', async ({
    request,
  }) => {
    test.skip(!planId || !uploadedFileId, 'No plan or file uploaded');
    const response = await request.get(`${PLANS_URL}/${planId}/files/${uploadedFileId}/download`, {
      headers: authHeaders,
    });
    expect(response.status(), await response.text()).toBe(200);
    const contentType = response.headers()['content-type'] || '';
    expect(/application\/(pdf|octet-stream)/i.test(contentType)).toBeTruthy();
    const buf = await response.body();
    expect(Buffer.byteLength(buf)).toBeGreaterThan(0);
  });

  // Negative: download with wrong file id
  test('GET /v1/plans/:planId/files/:fileId/download - 404 for nonexistent file @api @plans @negative @regression', async ({
    request,
  }) => {
    test.skip(!planId, 'No plan created');
    const badFileId = 'nonexistent-file-id';
    const response = await request.get(`${PLANS_URL}/${planId}/files/${badFileId}/download`, {
      headers: authHeaders,
    });
    expect([404, 400].includes(response.status()), await response.text()).toBeTruthy();
  });

  test('DELETE /v1/plans/:planId/files/:fileId - delete uploaded file @api @plans @regression', async ({
    request,
  }) => {
    test.skip(!planId || !uploadedFileId, 'No plan or file uploaded');
    const response = await request.delete(`${PLANS_URL}/${planId}/files/${uploadedFileId}`, {
      headers: authHeaders,
    });
    expect(response.status(), await response.text()).toBe(200);
    const body = (await response.json()) as PlanResponseIdOnly;
    expect(body.id).toBe(uploadedFileId);
  });

  test('DELETE /v1/plans/:id - cleanup plan @api @plans @regression', async ({ request }) => {
    test.skip(!planId, 'No plan created');
    await deleteTestPlan(request, planId);
  });
});
