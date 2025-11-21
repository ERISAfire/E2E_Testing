import { APIRequestContext, Page } from '@playwright/test';
import { EnvConfig } from '../../config/env.config.js';
import { LoginPage } from '../../ui/pages/LoginPage.js';

const env = EnvConfig.getInstance().getConfig();
const API_BASE_URL = env.apiBaseUrl;
const AUTH_LOGIN_URL = `${API_BASE_URL}/v1/auth/login`;

export async function loginAndGetBearer(
  request: APIRequestContext,
  page: Page,
  email: string,
  password: string
): Promise<string> {
  const resp = await request.post(AUTH_LOGIN_URL, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-key': process.env.X_API_KEY as string,
    },
    data: { email, password },
  });

  const setCookieHeaders = resp
    .headersArray()
    .filter((h: { name: string; value: string }) => h.name.toLowerCase() === 'set-cookie');
  const setCookieCombined = setCookieHeaders
    .map((h: { name: string; value: string }) => h.value)
    .join('\n');
  const m = /erisafireusertoken=([^;]+)/.exec(setCookieCombined);
  let token = m?.[1];

  if (!token) {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    const deadline = Date.now() + 7000;
    while (!token && Date.now() < deadline) {
      await page.waitForTimeout(250);
      const cookies = await page.context().cookies();
      token = cookies.find((ck) => ck.name === 'erisafireusertoken')?.value;
    }
  }

  if (!token) {
    throw new Error('Expected erisafireusertoken from API Set-Cookie or UI login');
  }
  return token as string;
}

export async function loginAndGetBearerApiOnly(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string | undefined> {
  const resp = await request.post(AUTH_LOGIN_URL, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-key': process.env.X_API_KEY as string,
    },
    data: { email, password },
  });
  if (![200, 201].includes(resp.status())) return undefined;
  const setCookieHeaders = resp
    .headersArray()
    .filter((h: { name: string; value: string }) => h.name.toLowerCase() === 'set-cookie');
  const setCookieCombined = setCookieHeaders
    .map((h: { name: string; value: string }) => h.value)
    .join('\n');
  const m = /erisafireusertoken=([^;]+)/.exec(setCookieCombined);
  return m?.[1];
}
