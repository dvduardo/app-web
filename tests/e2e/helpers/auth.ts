import { Page } from '@playwright/test';
import jwt from 'jsonwebtoken';

export interface TestUser {
  id?: string;
  name: string;
  email: string;
  password: string;
}

export interface TestCategory {
  id: string;
  name: string;
}

const TEST_BASE_URL = 'http://localhost:3000';

export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    name: `Test User ${timestamp}-${suffix}`,
    email: `test${timestamp}-${suffix}@example.com`,
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
  await loginViaAPI(page, user.email, user.password);
}

/**
 * Logs in an existing user via API, setting the auth cookie on the page context.
 */
export async function loginViaAPI(page: Page, email: string, password: string): Promise<void> {
  await page.request.post('/api/auth/login', {
    data: { email, password },
  });
}

export async function setAuthCookie(page: Page, user: TestUser): Promise<void> {
  if (!user.id) {
    throw new Error('TestUser precisa de id para autenticação de teste');
  }

  const secret = process.env.JWT_SECRET ?? 'e2e-test-jwt-secret';
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    secret,
    { expiresIn: '30d' }
  );

  await page.context().addCookies([
    {
      name: 'auth',
      value: token,
      url: TEST_BASE_URL,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  await page.goto('/dashboard');
}

export async function createCategoryViaAPI(
  page: Page,
  name = `Categoria ${Date.now()}`
): Promise<TestCategory> {
  const data = await page.evaluate(async ({ categoryName, baseUrl }) => {
    const response = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName }),
    });

    return response.json();
  }, { categoryName: name, baseUrl: TEST_BASE_URL });

  return data.category as TestCategory;
}

export async function createItemViaAPI(
  page: Page,
  input: {
    categoryId: string;
    title: string;
    description: string;
    status: string;
    isFavorite: boolean;
    customData: string;
  }
) {
  return page.evaluate(async ({ payload, baseUrl }) => {
    const response = await fetch(`${baseUrl}/api/items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.json();
  }, { payload: input, baseUrl: TEST_BASE_URL });
}
