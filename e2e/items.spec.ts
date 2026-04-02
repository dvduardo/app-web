import { test, expect } from '@playwright/test';
import { generateTestUser, TestUser } from './helpers/auth';

test.describe('Gerenciamento de Itens', () => {
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

  test.describe('Criar Item', () => {
    test('deve exibir o formulário de novo item', async ({ page }) => {
      await page.goto('/dashboard/new');

      await expect(page.getByText('Novo Item')).toBeVisible();
      await expect(page.locator('#title')).toBeVisible();
      await expect(page.locator('#description')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Salvar Item' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Cancelar' })).toBeVisible();
    });

    test('deve exibir erro ao tentar salvar sem título', async ({ page }) => {
      await page.goto('/dashboard/new');

      await page.getByRole('button', { name: 'Salvar Item' }).click();

      await expect(page.locator('.text-red-800').first()).toContainText('Título');
    });

    test('deve criar um item com sucesso e redirecionar para o dashboard', async ({ page }) => {
      const itemTitle = `Item Teste ${Date.now()}`;

      await page.goto('/dashboard/new');
      await page.fill('#title', itemTitle);
      await page.fill('#description', 'Descrição do item de teste');
      await page.getByRole('button', { name: 'Salvar Item' }).click();

      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(itemTitle)).toBeVisible();
    });

    test('deve cancelar criação e voltar ao dashboard', async ({ page }) => {
      await page.goto('/dashboard/new');

      await page.getByRole('link', { name: 'Cancelar' }).click();

      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Editar Item', () => {
    test('deve editar um item existente', async ({ page }) => {
      const originalTitle = `Item Para Editar ${Date.now()}`;
      const updatedTitle = `Item Editado ${Date.now()}`;

      const response = await page.request.post('/api/items', {
        data: { title: originalTitle, description: 'Descrição original', customData: '{}' },
      });
      const { item } = await response.json();

      await page.goto(`/dashboard/item/${item.id}`);
      await expect(page.getByText('Editar Item')).toBeVisible();

      const titleInput = page.locator('input[placeholder="Ex: Harry Potter"]');
      await titleInput.clear();
      await titleInput.fill(updatedTitle);
      await page.getByRole('button', { name: 'Salvar' }).click();

      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(updatedTitle)).toBeVisible();
    });

    test('deve exibir link para voltar ao dashboard na página de edição', async ({ page }) => {
      const response = await page.request.post('/api/items', {
        data: { title: `Item Voltar ${Date.now()}`, description: '', customData: '{}' },
      });
      const { item } = await response.json();

      await page.goto(`/dashboard/item/${item.id}`);

      await expect(page.getByRole('link', { name: /Voltar/i })).toBeVisible();
    });
  });

  test.describe('Deletar Item', () => {
    test('deve deletar um item após confirmar', async ({ page }) => {
      const itemTitle = `Item Para Deletar ${Date.now()}`;

      await page.request.post('/api/items', {
        data: { title: itemTitle, description: '', customData: '{}' },
      });

      await page.goto('/dashboard');
      await expect(page.getByText(itemTitle)).toBeVisible();

      page.on('dialog', (dialog) => dialog.accept());
      await page.getByRole('button', { name: new RegExp(`Deletar item ${itemTitle}`, 'i') }).click();

      await expect(page.getByText(itemTitle)).not.toBeVisible();
    });

    test('deve cancelar a exclusão ao recusar o diálogo', async ({ page }) => {
      const itemTitle = `Item Não Deletar ${Date.now()}`;

      await page.request.post('/api/items', {
        data: { title: itemTitle, description: '', customData: '{}' },
      });

      await page.goto('/dashboard');
      await expect(page.getByText(itemTitle)).toBeVisible();

      page.on('dialog', (dialog) => dialog.dismiss());
      await page.getByRole('button', { name: new RegExp(`Deletar item ${itemTitle}`, 'i') }).click();

      await expect(page.getByText(itemTitle)).toBeVisible();
    });
  });
});
