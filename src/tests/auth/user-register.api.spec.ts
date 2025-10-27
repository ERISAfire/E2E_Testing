import { test, expect } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

/**
 * User Registration flow via API
 *
 * Flow covered:
 * 1) POST /v1/users/invites -> invite user
 * 2) POST /v1/auth/register/verify -> get registration code
 * 3) POST /v1/auth/register -> register invited user
 * 4) GET /v1/users -> find created user by email
 * 5) DELETE /v1/users/:id -> cleanup
 *
 * Notes:
 * - Uses bearer token from `API_BEARER_TOKEN`
 * - Uses API base from `API_BASE_URL`
 * - Organization is taken from `ORGANIZATION_ID` if present, otherwise falls back to provided sample ID
 */

test.describe.serial('User Register API @api @userRegister', () => {
  let apiBaseUrl: string;
  let bearerToken: string;
  const orgId = process.env.ORGANIZATION_ID || '66e5f76a-6ba5-4e8c-bf34-5e3ed1b3bef3';

  test.beforeAll(() => {
    const env = EnvConfig.getInstance();
    apiBaseUrl = env.get<string>('apiBaseUrl');
    bearerToken = env.get<string>('apiBearerToken');
  });

  test('should invite, verify, register and delete a user', async ({ request }) => {
    // unique email per run
    const email = `testsautomation+register.${Date.now()}@example.com`;
    const phone = `+1${Math.floor(1000000000 + Math.random() * 8999999999)}`;

    let createdUserId: string | number | undefined;

    try {
      // 1) Invite user
      const inviteResp = await request.post(`${apiBaseUrl}/v1/users/invites`, {
        headers: {
          accept: '*/*',
          authorization: `Bearer ${bearerToken}`,
          'content-type': 'application/json',
        },
        data: {
          email,
          type: 2,
          organization_id: orgId,
          phone,
        },
      });
      expect(inviteResp.status()).toBe(201);

      // 2) Verify to get registration code
      const verifyResp = await request.post(`${apiBaseUrl}/v1/auth/register/verify`, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${bearerToken}`,
          'content-type': 'application/json',
        },
        data: { email },
      });
      expect(verifyResp.status()).toBe(201);
      const verifyBody = await verifyResp.json();
      expect(verifyBody).toMatchObject({ isExistingEmail: false, type: 2 });
      const code: string = verifyBody.code;
      expect(typeof code).toBe('string');

      // 3) Register user with the code
      const registerResp = await request.post(`${apiBaseUrl}/v1/auth/register`, {
        headers: {
          accept: '*/*',
          authorization: `Bearer ${bearerToken}`,
          'content-type': 'application/json',
        },
        data: {
          firstName: 'Alex',
          lastName: 'Smith',
          phone,
          code,
          password: 'Test1234#',
          passwordRequired: true,
        },
      });
      expect([200, 201]).toContain(registerResp.status());
      let registerBody: unknown;
      try {
        registerBody = await registerResp.json();
      } catch {
        registerBody = undefined;
      }

      // 4) Find created user by email
      if (registerBody && typeof registerBody === 'object') {
        if ('id' in (registerBody as Record<string, unknown>)) {
          createdUserId = (registerBody as { id: string | number }).id;
        } else if ('user' in (registerBody as Record<string, unknown>)) {
          const userObj = (registerBody as Record<string, unknown>)['user'];
          if (
            userObj &&
            typeof userObj === 'object' &&
            'id' in (userObj as Record<string, unknown>)
          ) {
            const idVal = (userObj as { id?: unknown }).id;
            if (typeof idVal === 'string' || typeof idVal === 'number') {
              createdUserId = idVal;
            }
          }
        }
      } else {
        // Try to login to obtain the user object (and ID) deterministically
        if (!createdUserId) {
          const loginResp = await request.post(`${apiBaseUrl}/v1/auth/login`, {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
            },
            data: { email, password: 'Test1234#' },
          });
          if (loginResp.status() >= 200 && loginResp.status() < 300) {
            const loginBody: unknown = await loginResp.json().catch(() => undefined);
            if (loginBody && typeof loginBody === 'object') {
              if ('id' in (loginBody as Record<string, unknown>)) {
                const idVal = (loginBody as { id?: unknown }).id;
                if (typeof idVal === 'string' || typeof idVal === 'number') {
                  createdUserId = idVal;
                }
              } else if ('user' in (loginBody as Record<string, unknown>)) {
                const u = (loginBody as Record<string, unknown>)['user'];
                if (u && typeof u === 'object' && 'id' in (u as Record<string, unknown>)) {
                  const idVal = (u as { id?: unknown }).id;
                  if (typeof idVal === 'string' || typeof idVal === 'number') {
                    createdUserId = idVal;
                  }
                }
              }
            }
          }
        }
      }

      if (!createdUserId) {
        let foundId: string | number | undefined;
        const headers = { accept: 'application/json', authorization: `Bearer ${bearerToken}` };
        for (let attempt = 0; attempt < 10 && !foundId; attempt++) {
          const urlSearch = new URL(`${apiBaseUrl}/v1/users`);
          urlSearch.searchParams.append('search', email);
          urlSearch.searchParams.append('filters[consultantCompany]', orgId);
          urlSearch.searchParams.append('perPage', '100');
          urlSearch.searchParams.append('page', '1');
          const res = await request.get(urlSearch.toString(), { headers });
          if (res.status() === 200) {
            const body: unknown = await res.json();
            const list = Array.isArray(body)
              ? (body as ReadonlyArray<Record<string, unknown>>)
              : body && typeof body === 'object'
                ? (((body as Record<string, unknown>)['data'] ||
                    (body as Record<string, unknown>)['items'] ||
                    (body as Record<string, unknown>)['results']) as
                    | ReadonlyArray<Record<string, unknown>>
                    | undefined)
                : undefined;
            if (list && Array.isArray(list)) {
              type ListItem = {
                id?: string | number;
                email?: string;
                userId?: string | number;
                user?: { id?: string | number; email?: string };
              };
              const arr = list as ReadonlyArray<ListItem>;
              const f = arr.find(
                (it) =>
                  ((it.email || it.user?.email || '') as string).toLowerCase() ===
                  email.toLowerCase()
              );
              if (f) {
                const cand = f.userId ?? f.user?.id ?? f.id;
                if (typeof cand === 'string' || typeof cand === 'number') {
                  foundId = cand;
                }
              }
            }
          }
          if (!foundId) {
            const urlAll = new URL(`${apiBaseUrl}/v1/users`);
            urlAll.searchParams.append('filters[consultantCompany]', orgId);
            urlAll.searchParams.append('perPage', '100');
            urlAll.searchParams.append('page', '1');
            const resAll = await request.get(urlAll.toString(), { headers });
            if (resAll.status() === 200) {
              const allBody: unknown = await resAll.json();
              const listAll = Array.isArray(allBody)
                ? (allBody as ReadonlyArray<Record<string, unknown>>)
                : allBody && typeof allBody === 'object'
                  ? (((allBody as Record<string, unknown>)['data'] ||
                      (allBody as Record<string, unknown>)['items'] ||
                      (allBody as Record<string, unknown>)['results']) as
                      | ReadonlyArray<Record<string, unknown>>
                      | undefined)
                  : undefined;
              if (listAll && Array.isArray(listAll)) {
                type ListItem = {
                  id?: string | number;
                  email?: string;
                  userId?: string | number;
                  user?: { id?: string | number; email?: string };
                };
                const arrAll = listAll as ReadonlyArray<ListItem>;
                const fAll = arrAll.find(
                  (it) =>
                    ((it.email || it.user?.email || '') as string).toLowerCase() ===
                    email.toLowerCase()
                );
                if (fAll) {
                  const cand = fAll.userId ?? fAll.user?.id ?? fAll.id;
                  if (typeof cand === 'string' || typeof cand === 'number') {
                    foundId = cand;
                  }
                }
              }
            }
          }
          if (!foundId) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
        createdUserId = foundId;
      }
      if (!createdUserId) {
        const headers = { accept: 'application/json', authorization: `Bearer ${bearerToken}` };
        const resAll = await request.get(`${apiBaseUrl}/v1/users`, { headers });
        if (resAll.status() === 200) {
          const body: unknown = await resAll.json();
          if (Array.isArray(body)) {
            const items = body as ReadonlyArray<Record<string, unknown>>;
            const match = items.find((u) => {
              const candidates = [
                u['email'],
                u['emailAddress'],
                u['userEmail'],
                u['login'],
                u['username'],
                u['user_name'],
                u['contactEmail'],
              ];
              const val = candidates.find((v) => typeof v === 'string') as string | undefined;
              return (val || '').toLowerCase() === email.toLowerCase();
            });
            if (match && 'id' in match) {
              const idVal = match['id'];
              if (typeof idVal === 'string' || typeof idVal === 'number') {
                createdUserId = idVal;
              }
            }
          }
        }
      }
      expect(createdUserId, 'Expected to find the newly created user in listing').toBeTruthy();

      // 5) Cleanup: delete the user
      const delResp = await request.delete(`${apiBaseUrl}/v1/users/${createdUserId}`, {
        headers: {
          accept: '*/*',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      expect([200, 204]).toContain(delResp.status());
    } finally {
      // Best-effort cleanup if earlier step failed after user creation
      if (createdUserId) {
        try {
          await request.delete(`${apiBaseUrl}/v1/users/${createdUserId}`, {
            headers: {
              accept: '*/*',
              authorization: `Bearer ${bearerToken}`,
            },
          });
        } catch {
          // ignore
        }
      }
    }
  });

  test('invite should fail on invalid email @negative @api @userRegister', async ({ request }) => {
    const resp = await request.post(`${apiBaseUrl}/v1/users/invites`, {
      headers: {
        accept: '*/*',
        authorization: `Bearer ${bearerToken}`,
        'content-type': 'application/json',
      },
      data: {
        email: 'invalid-email',
        type: 2,
        organization_id: orgId,
        phone: '+10000000000',
      },
    });
    expect([400, 422]).toContain(resp.status());
  });

  test('invite should fail on duplicate email @negative @api @userRegister', async ({
    request,
  }) => {
    const email = `testsautomation+negdup.${Date.now()}@example.com`;
    const headers = {
      accept: '*/*',
      authorization: `Bearer ${bearerToken}`,
      'content-type': 'application/json',
    };
    const data = { email, type: 2, organization_id: orgId, phone: '+10000000001' };

    let invitedUserUserId: string | number | undefined;
    let invitedRecordId: string | number | undefined;
    try {
      const first = await request.post(`${apiBaseUrl}/v1/users/invites`, { headers, data });
      expect([200, 201]).toContain(first.status());

      const second = await request.post(`${apiBaseUrl}/v1/users/invites`, { headers, data });
      expect([400, 409]).toContain(second.status());

      // Try to locate the invited user to clean up
      for (let attempt = 0; attempt < 5 && !invitedUserUserId && !invitedRecordId; attempt++) {
        const urlSearch = new URL(`${apiBaseUrl}/v1/users`);
        urlSearch.searchParams.append('search', email);
        urlSearch.searchParams.append('filters[consultantCompany]', orgId);
        urlSearch.searchParams.append('perPage', '50');
        urlSearch.searchParams.append('page', '1');
        const res = await request.get(urlSearch.toString(), {
          headers: { accept: 'application/json', authorization: `Bearer ${bearerToken}` },
        });
        if (res.status() === 200) {
          const body: unknown = await res.json();
          const list = Array.isArray(body)
            ? (body as ReadonlyArray<Record<string, unknown>>)
            : body && typeof body === 'object'
              ? (((body as Record<string, unknown>)['data'] ||
                  (body as Record<string, unknown>)['items'] ||
                  (body as Record<string, unknown>)['results']) as
                  | ReadonlyArray<Record<string, unknown>>
                  | undefined)
              : undefined;
          if (list && Array.isArray(list)) {
            type ListItem = {
              id?: string | number;
              userId?: string | number;
              user?: { id?: string | number; email?: string };
              email?: string;
            };
            const match = (list as ReadonlyArray<ListItem>).find(
              (it) =>
                ((it.email || it.user?.email || '') as string).toLowerCase() === email.toLowerCase()
            );
            if (match) {
              if (typeof match.userId === 'string' || typeof match.userId === 'number') {
                invitedUserUserId = match.userId;
              } else if (typeof match.user?.id === 'string' || typeof match.user?.id === 'number') {
                invitedUserUserId = match.user.id as string | number;
              }
              if (typeof match.id === 'string' || typeof match.id === 'number') {
                invitedRecordId = match.id;
              }
            }
          }
        }
        if (!invitedUserUserId && !invitedRecordId) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    } finally {
      // Attempt delete by userId first, then by top-level record id
      try {
        if (invitedUserUserId) {
          await request.delete(`${apiBaseUrl}/v1/users/${invitedUserUserId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch {
        // ignore
      }
      // Also try invites endpoint
      try {
        if (invitedUserUserId) {
          await request.delete(`${apiBaseUrl}/v1/users/invites/${invitedUserUserId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch {
        // ignore
      }
      try {
        if (invitedRecordId) {
          await request.delete(`${apiBaseUrl}/v1/users/${invitedRecordId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch {
        // ignore
      }
      // And invites by record id
      try {
        if (invitedRecordId) {
          await request.delete(`${apiBaseUrl}/v1/users/invites/${invitedRecordId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch {
        // ignore
      }
    }
  });

  test('verify should fail for non-invited email @negative @api @userRegister', async ({
    request,
  }) => {
    const email = `testsautomation+notinvited.${Date.now()}@example.com`;
    const resp = await request.post(`${apiBaseUrl}/v1/auth/register/verify`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${bearerToken}`,
        'content-type': 'application/json',
      },
      data: { email },
    });
    expect([404, 400]).toContain(resp.status());
    const body = await resp.json().catch(() => undefined);
    if (body && typeof body === 'object') {
      expect((body as Record<string, unknown>).message).toBeDefined();
    }
  });
});
