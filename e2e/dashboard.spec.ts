import { test, expect } from '@playwright/test';
import { generateTestUser, registerAndLogin, TestUser } from './helpers/auth';

test.describe('Dashboard', () => {
  test('deve redirecionar usuários não autenticados para o login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/auth/login');
  });

  test.describe('Usuário autenticado', () => {
    let testUser: TestUser;

    test.beforeAll(async ({ request }) => {
      testUser = generateTestUser();
      await request.post('/api/auth/register', {
        data: { name: testUser.name, email: testUser.email, password: testUser.password },
      });
    });

    test.beforeEach(async ({ page }) => {
      await page.request.post('/api/auth/login', {
        data: { email: testUser.email, password: testUser.password },
      });
    });

    test('deve exibir o cabeçalho do dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page.getByText('Minhas Coleções')).toBeVisible();
      await expect(page.getByText(/Bem-vindo/)).toBeVisible();
    });

    test('deve exibir os botões de ação', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page.getByRole('link', { name: /Novo/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Exportar/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Importar/i })).toBeVisible();
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

      await expect(page.getByText('Nenhum item ainda')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Criar seu primeiro item' })).toBeVisible();
    });

    test('deve navegar para a página de novo item', async ({ page }) => {
      await page.goto('/dashboard');

      await page.getByRole('link', { name: /Novo/i }).click();

      await expect(page).toHaveURL('/dashboard/new');
      await expect(page.getByText('Novo Item')).toBeVisible();
    });

    test('deve filtrar itens pela busca', async ({ page }) => {
      const itemTitle = `Item de Busca ${Date.now()}`;

      await page.request.post('/api/items', {
        data: { title: itemTitle, description: 'Descrição para testar busca', customData: '{}' },
      });

      await page.goto('/dashboard');
      await expect(page.getByText(itemTitle)).toBeVisible();

      await page.fill('#search', 'xyzinexistente');
      await expect(page.getByText('Nenhum item encontrado')).toBeVisible();
      await expect(page.getByText(itemTitle)).not.toBeVisible();

      await page.fill('#search', itemTitle);
      await expect(page.getByText(itemTitle)).toBeVisible();
    });
  });
});
