import { test, expect } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';
import { LoginPage } from '../../ui/pages/LoginPage.js';

/**
 * Auth API tests
 *
 * Endpoints covered:
 * - POST /v1/auth/login
 * - POST /v1/auth/logout
 * - POST /v1/auth/session
 *
 * Notes:
 * - Login tests validate success and common error responses.
 * - Logout test obtains a fresh UI token (`erisafireusertoken`) from:
 *   - Set-Cookie in the login response, or
 *   - UI login fallback (reads cookie from the browser context).
 * - Session test uses the API bearer token (`API_BEARER_TOKEN`) and a cookie id (`erisafireuniqueid`) sent as { id: string }.
 */

test.describe.serial('Auth API - Session @api @auth', () => {
  let baseUrl: string;
  let apiBaseUrl: string;
  let bearerToken: string;
  let userEmail: string;
  let userPassword: string;

  test.beforeAll(() => {
    const env = EnvConfig.getInstance();
    baseUrl = env.get<string>('baseUrl');
    apiBaseUrl = env.get<string>('apiBaseUrl');
    bearerToken = env.get<string>('apiBearerToken');
    userEmail = env.get<string>('credentials.email');
    userPassword = env.get<string>('credentials.password');
  });

  test('should create a session with cookie id @api @auth', async ({ page, request }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    let cookies = await page.context().cookies();
    let cookieId = cookies.find((c) => c.name === 'erisafireuniqueid')?.value;

    if (!cookieId) {
      const url = new URL(baseUrl);
      cookieId = `ef-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      await page.context().addCookies([
        {
          name: 'erisafireuniqueid',
          value: cookieId,
          domain: url.hostname,
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'Lax',
          expires: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
        },
      ]);
      // Refresh cookies after setting
      cookies = await page.context().cookies();
    }

    const response = await request.post(`${apiBaseUrl}/v1/auth/session`, {
      headers: {
        accept: '*/*',
        authorization: `Bearer ${bearerToken}`,
        'content-type': 'application/json',
      },
      data: { id: cookieId },
    });

    expect(response.status(), 'Expected 2xx for session creation').toBeGreaterThanOrEqual(200);
    expect(response.status(), 'Expected 2xx for session creation').toBeLessThan(300);

    const body = await response.json().catch(() => null);
    expect(body, 'Expected JSON body in response').toBeTruthy();
  });

  test('should fail with invalid bearer token @negative @api @auth', async ({ page, request }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    let cookies = await page.context().cookies();
    let cookieId = cookies.find((c) => c.name === 'erisafireuniqueid')?.value;

    if (!cookieId) {
      const url = new URL(baseUrl);
      cookieId = `ef-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      await page.context().addCookies([
        {
          name: 'erisafireuniqueid',
          value: cookieId,
          domain: url.hostname,
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'Lax',
          expires: Math.floor(Date.now() / 1000) + 60 * 60,
        },
      ]);
      cookies = await page.context().cookies();
    }

    const response = await request.post(`${apiBaseUrl}/v1/auth/session`, {
      headers: {
        accept: '*/*',
        authorization: `Bearer ${bearerToken}x`,
        'content-type': 'application/json',
      },
      data: { id: cookieId },
    });

    expect([401, 403]).toContain(response.status());
  });

  test('should login with valid credentials @api @auth', async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': process.env.X_API_KEY as string,
      },
      data: {
        email: userEmail,
        password: userPassword,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({
      email: userEmail,
    });
    expect(typeof body.firstName).toBe('string');
    expect(typeof body.lastName).toBe('string');
    expect(typeof body.displayName).toBe('string');
  });

  test('should reject login with invalid password @negative @api @auth', async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': process.env.X_API_KEY as string,
      },
      data: {
        email: userEmail,
        password: `${userPassword}-invalid`,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      message: 'Email or Password is invalid',
      error: 'Bad Request',
      statusCode: 400,
    });
    expect(typeof body.correlationId).toBe('string');
  });

  test('should reject login for nonexistent user @negative @api @auth', async ({ request }) => {
    const nonExistingEmail = `testsautomation+notfound.${Date.now()}@example.com`;

    const response = await request.post(`${apiBaseUrl}/v1/auth/login`, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': process.env.X_API_KEY as string,
      },
      data: {
        email: nonExistingEmail,
        password: userPassword,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      message:
        'This user is not found in the system. Please contact ERISAfire support to request an invitation.',
      error: 'Bad Request',
      statusCode: 400,
    });
    if (body.code) {
      expect(body.code).toBe('USER.NOT_FOUND');
    }
    expect(typeof body.correlationId).toBe('string');
  });

  test('should logout using fresh UI token and revoke it @api @auth', async ({ page, request }) => {
    let token: string | undefined;

    // 1) Try to login via API and parse Set-Cookie for erisafireusertoken
    const loginResp = await request.post(`${apiBaseUrl}/v1/auth/login`, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': process.env.X_API_KEY as string,
      },
      data: { email: userEmail, password: userPassword },
    });
    expect([200, 201]).toContain(loginResp.status());
    const setCookieHeaders = loginResp
      .headersArray()
      .filter((h) => h.name.toLowerCase() === 'set-cookie');
    const setCookieCombined = setCookieHeaders.map((h) => h.value).join('\n');
    const m = /erisafireusertoken=([^;]+)/.exec(setCookieCombined);
    if (m && m[1]) {
      token = m[1];
    }

    // 2) Fallback to UI login + polling for cookie if header not present
    if (!token) {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(userEmail, userPassword);
      // Poll cookies for up to 5s
      const deadline = Date.now() + 5000;
      while (!token && Date.now() < deadline) {
        await page.waitForTimeout(250);
        const c = await page.context().cookies();
        token = c.find((ck) => ck.name === 'erisafireusertoken')?.value;
      }
    }

    expect(token).toBeTruthy();

    const logoutResponse = await request.post(`${apiBaseUrl}/v1/auth/logout`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    expect([200, 201, 204]).toContain(logoutResponse.status());

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    const cookies = await page.context().cookies();
    let cookieId = cookies.find((c) => c.name === 'erisafireuniqueid')?.value;
    if (!cookieId) {
      const url = new URL(baseUrl);
      cookieId = `ef-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      await page.context().addCookies([
        {
          name: 'erisafireuniqueid',
          value: cookieId,
          domain: url.hostname,
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'Lax',
          expires: Math.floor(Date.now() / 1000) + 60 * 60,
        },
      ]);
    }

    const postRevoke = await request.post(`${apiBaseUrl}/v1/auth/session`, {
      headers: {
        accept: '*/*',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      data: { id: cookieId },
    });
    expect([401, 403]).toContain(postRevoke.status());
  });
});
