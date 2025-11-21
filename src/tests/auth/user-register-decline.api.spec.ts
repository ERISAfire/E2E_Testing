import { test, expect } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';

test.describe.serial('User Register Decline API @api @userRegister', () => {
  let apiBaseUrl: string;
  let bearerToken: string;
  let orgIdStr: string;

  test.beforeAll(() => {
    const env = EnvConfig.getInstance();
    apiBaseUrl = env.get<string>('apiBaseUrl');
    bearerToken = env.get<string>('apiBearerToken');
    const orgId = process.env.CONSULTANT_ORG_ID || process.env.EMPLOYER_ORG_ID;
    if (!orgId) {
      throw new Error('CONSULTANT_ORG_ID (or EMPLOYER_ORG_ID) env var is required');
    }
    orgIdStr = orgId;
  });

  test('should invite, verify, decline registration and cleanup @regression', async ({
    request,
  }) => {
    const email = `testsautomation+decline.${Date.now()}@example.com`;
    const phone = String(Math.floor(1000000000 + Math.random() * 9000000000));

    let invitedUserUserId: string | number | undefined;
    let invitedRecordId: string | number | undefined;

    try {
      const inviteResp = await request.post(`${apiBaseUrl}/v1/users/invites`, {
        headers: {
          accept: '*/*',
          authorization: `Bearer ${bearerToken}`,
          'content-type': 'application/json',
        },
        data: { email, type: 2, organization_id: orgIdStr, phone },
      });
      expect([200, 201, 400, 409]).toContain(inviteResp.status());

      const verifyResp = await request.post(`${apiBaseUrl}/v1/auth/register/verify`, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${bearerToken}`,
          'content-type': 'application/json',
        },
        data: { email },
      });
      expect([201, 404]).toContain(verifyResp.status());
      const verifyBody: unknown = await verifyResp.json();

      if (verifyResp.status() === 201) {
        expect(verifyBody && typeof verifyBody === 'object').toBeTruthy();
        const codeVal = (verifyBody as Record<string, unknown>)['code'];
        expect(typeof codeVal).toBe('string');

        const declineResp = await request.post(`${apiBaseUrl}/v1/auth/register/decline`, {
          headers: {
            accept: '*/*',
            authorization: `Bearer ${bearerToken}`,
            'content-type': 'application/json',
          },
          data: { code: codeVal },
        });
        expect([200, 201, 204]).toContain(declineResp.status());
      } else {
        expect(verifyBody && typeof verifyBody === 'object').toBeTruthy();
        const body = verifyBody as Record<string, unknown>;
        expect(body.error).toBe('Not Found');
        expect(body.message).toBe('Cannot POST /v1/auth/register/verify');
        expect(body.statusCode).toBe(404);
      }

      for (let attempt = 0; attempt < 5 && !invitedUserUserId && !invitedRecordId; attempt++) {
        const urlSearch = new URL(`${apiBaseUrl}/v1/users`);
        urlSearch.searchParams.append('search', email);
        urlSearch.searchParams.append('filters[consultantCompany]', orgIdStr);
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
      try {
        if (invitedUserUserId) {
          await request.delete(`${apiBaseUrl}/v1/users/${invitedUserUserId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch (e) {
        void e;
      }
      try {
        if (invitedUserUserId) {
          await request.delete(`${apiBaseUrl}/v1/users/invites/${invitedUserUserId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch (e) {
        void e;
      }
      try {
        if (invitedRecordId) {
          await request.delete(`${apiBaseUrl}/v1/users/${invitedRecordId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch (e) {
        void e;
      }
      try {
        if (invitedRecordId) {
          await request.delete(`${apiBaseUrl}/v1/users/invites/${invitedRecordId}`, {
            headers: { accept: '*/*', authorization: `Bearer ${bearerToken}` },
          });
        }
      } catch (e) {
        void e;
      }
    }
  });
});
