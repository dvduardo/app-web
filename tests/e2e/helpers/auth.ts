import { Page } from '@playwright/test';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123',
  };
}

/**
 * Registers a user via API and logs in, setting the auth cookie on the page context.
 */
export async function registerAndLogin(page: Page, user: TestUser): Promise<void> {
  await page.request.post('/api/auth/register', {
    data: { name: user.name, email: user.email, password: user.password },
  });
  await page.request.post('/api/auth/login', {
    data: { email: user.email, password: user.password },
  });
}

/**
 * Logs in an existing user via API, setting the auth cookie on the page context.
 */
export async function loginViaAPI(page: Page, email: string, password: string): Promise<void> {
  await page.request.post('/api/auth/login', {
    data: { email, password },
  });
}
