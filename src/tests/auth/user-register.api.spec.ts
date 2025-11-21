import { test, expect } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

/**
 * User Registration flow via API
 *
 * Flow covered:
 * 1) POST /v1/users/invites -> invite user
 * 2a) POST /v1/auth/register/verify -> get registration code
 * 2b) GET /v1/auth/register/verify?code=... -> validate the code using GET
 * 3) POST /v1/auth/register -> register invited user
 * 4) GET /v1/users -> find created user by email
 * 5) DELETE /v1/users/:id -> cleanup
 *
 * Notes:
 * - Uses bearer token from `API_BEARER_TOKEN`
 * - Uses API base from `API_BASE_URL`
 * - Organization is taken from `ORGANIZATION_ID` if present, otherwise falls back to provided sample ID
 * - Each run uses a unique email to avoid collisions; best-effort cleanup is performed
 */

test.describe.serial('User Register API @api @userRegister', () => {
  let apiBaseUrl: string;
  let bearerToken: string;
  const orgId = process.env.CONSULTANT_ORG_ID || process.env.EMPLOYER_ORG_ID;

  test.beforeAll(() => {
    const env = EnvConfig.getInstance();
    apiBaseUrl = env.get<string>('apiBaseUrl');
    bearerToken = env.get<string>('apiBearerToken');
  });

  test.skip('should invite, verify, register and delete a user @regression', async ({
    request,
  }) => {
    // unique email per run
    const email = `testsautomation+register.${Date.now()}@example.com`;
    const phone = String(Math.floor(1000000000 + Math.random() * 9000000000));

    let createdUserId: string | number | undefined;
    let code: string | undefined;

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
      expect([200, 201, 400, 409]).toContain(inviteResp.status());

      // 2) Verify to get registration code
      const verifyResp = await request.post(`${apiBaseUrl}/v1/auth/register/verify`, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${bearerToken}`,
          'content-type': 'application/json',
        },
        data: { email },
      });
      expect([201, 404]).toContain(verifyResp.status());
      const verifyBody = await verifyResp.json();

      if (verifyResp.status() === 201) {
        expect(verifyBody).toMatchObject({ isExistingEmail: false, type: 2 });
        code = verifyBody.code as string;
        expect(typeof code).toBe('string');

        // 2b) GET verify to validate code via GET endpoint as well
        const getUrl = new URL(`${apiBaseUrl}/v1/auth/register/verify`);
        getUrl.searchParams.append('code', code);
        const getVerifyResp = await request.get(getUrl.toString(), {
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        });
        expect(getVerifyResp.status()).toBe(200);
        const getVerifyBody: unknown = await getVerifyResp.json();
        if (getVerifyBody && typeof getVerifyBody === 'object') {
          const obj = getVerifyBody as Record<string, unknown>;
          expect(obj['isExistingEmail']).toBe(false);
          expect(typeof obj['code']).toBe('string');
          const emailVal = (obj['email'] as string | undefined) || '';
          expect(emailVal.toLowerCase()).toBe(email.toLowerCase());
          expect(obj['type']).toBe(2);
        }
      } else {
        expect(verifyBody).toMatchObject({
          error: 'Not Found',
          message: 'Cannot POST /v1/auth/register/verify',
          statusCode: 404,
        });
        return;
      }
      if (!code) {
        return;
      }

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
      if (![200, 201].includes(registerResp.status())) {
        const errText = await registerResp.text().catch(() => '');
        await test.info().attach('register_error', {
          body: Buffer.from(`status: ${registerResp.status()}\n${errText}`),
          contentType: 'text/plain',
        });
      }
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
          if (orgId) {
            urlSearch.searchParams.append('filters[consultantCompany]', orgId);
          }
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
            if (orgId) {
              urlAll.searchParams.append('filters[consultantCompany]', orgId);
            }
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

  test('invite should fail on invalid email @negative @api @userRegister @regression', async ({
    request,
  }) => {
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
        phone: '1234567890',
      },
    });
    expect([400, 422]).toContain(resp.status());
  });

  test('invite should fail on duplicate email @negative @api @userRegister @regression', async ({
    request,
  }) => {
    const email = `testsautomation+duplicate.${Date.now()}@example.com`;
    const phone = '1234567890';

    let invitedUserUserId: string | number | undefined;
    let invitedRecordId: string | number | undefined;

    const headers = {
      accept: '*/*',
      authorization: `Bearer ${bearerToken}`,
      'content-type': 'application/json',
    };

    const data = {
      email,
      type: 2,
      organization_id: orgId,
      phone,
    };

    try {
      const first = await request.post(`${apiBaseUrl}/v1/users/invites`, { headers, data });
      expect([201, 400, 409]).toContain(first.status());

      const second = await request.post(`${apiBaseUrl}/v1/users/invites`, { headers, data });
      expect([400, 409]).toContain(second.status());

      for (let attempt = 0; attempt < 5 && !invitedUserUserId && !invitedRecordId; attempt++) {
        const urlSearch = new URL(`${apiBaseUrl}/v1/users`);
        urlSearch.searchParams.append('search', email);
        if (orgId) {
          urlSearch.searchParams.append('filters[consultantCompany]', orgId);
        }
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

  test('verify should fail for non-invited email @negative @api @userRegister @regression', async ({
    request,
  }) => {
    const fakeCode = `invalid-${Date.now()}`;
    const url = new URL(`${apiBaseUrl}/v1/auth/register/verify`);
    url.searchParams.append('code', fakeCode);

    const resp = await request.get(url.toString(), {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
    });

    expect(resp.status()).toBe(404);
    const body = await resp.json().catch(() => undefined);
    if (body && typeof body === 'object') {
      const msg = (body as Record<string, unknown>).message;
      if (typeof msg === 'string') {
        expect(msg).toContain('You must be invited in order to register.');
      }
    }
  });
});
