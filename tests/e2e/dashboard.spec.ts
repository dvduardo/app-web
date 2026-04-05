import { test, expect } from '@playwright/test';
import { createCategoryViaAPI, createItemViaAPI, generateTestUser, setAuthCookie, TestCategory, TestUser } from './helpers/auth';

test.describe('Dashboard', () => {
  test('deve redirecionar usuários não autenticados para o login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/auth/login');
  });

  test.describe('Usuário autenticado', () => {
    let testUser: TestUser;
    let testCategory: TestCategory;

    test.beforeAll(async ({ request }) => {
      testUser = generateTestUser();
      const response = await request.post('/api/auth/register', {
        data: { name: testUser.name, email: testUser.email, password: testUser.password },
      });
      const data = await response.json();
      testUser = { ...testUser, id: data.user.id };
    });

    test.beforeEach(async ({ page }) => {
      await setAuthCookie(page, testUser);
      testCategory = await createCategoryViaAPI(page, `Categoria Dashboard ${Date.now()}`);
    });

    test('deve exibir o cabeçalho do dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page.getByText('Minhas Coleções')).toBeVisible();
      await expect(page.getByText(/Bem-vindo/)).toBeVisible();
    });

    test('deve exibir os botões de ação', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page.getByRole('link', { name: /Novo/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Somente favoritos/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Todos os status/i })).toBeVisible();
    });

    test('deve exibir o campo de busca', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page.locator('#search')).toBeVisible();
      await expect(page.locator('#search')).toHaveAttribute(
        'placeholder',
        'Buscar por título ou descrição...'
      );
    });

    test('deve exibir estado vazio quando não há itens', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByText('Carregando itens...')).not.toBeVisible();

      await expect(page.getByText('Nenhum item ainda')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Criar seu primeiro item' })).toBeVisible();
    });

    test('deve navegar para a página de novo item', async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('link', { name: /Novo/i }).click();

      await expect(page).toHaveURL('/dashboard/new');
      await expect(page.getByRole('heading', { name: 'Novo Item' })).toBeVisible();
    });

    test('deve filtrar itens pela busca', async ({ page }) => {
      const itemTitle = `Item de Busca ${Date.now()}`;

      await createItemViaAPI(page, {
          categoryId: testCategory.id,
          title: itemTitle,
          description: 'Descrição para testar busca',
          status: 'owned',
          isFavorite: false,
          customData: '{}',
      });

      await page.goto('/dashboard');
      await expect(page.getByText('Carregando itens...')).not.toBeVisible();
      await expect(page.getByText(itemTitle)).toBeVisible();

      await page.fill('#search', 'xyzinexistente');
      await expect(
        page.getByText('Nenhum item encontrado com os filtros atuais')
      ).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(itemTitle)).not.toBeVisible();

      await page.fill('#search', itemTitle);
      await expect(page.getByText(itemTitle)).toBeVisible({ timeout: 10000 });
    });
  });
});
