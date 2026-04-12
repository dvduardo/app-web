import { test, expect } from '@playwright/test';
import {
  createCategoryViaAPI,
  createItemViaAPI,
  generateTestUser,
  loginViaAPI,
  TestCategory,
  TestUser,
} from './helpers/auth';

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
      await loginViaAPI(page, testUser.email, testUser.password);
      testCategory = await createCategoryViaAPI(page, `Categoria Dashboard ${Date.now()}`);
    });

    // ── Header ──────────────────────────────────────────────────────────────

    test('deve exibir o cabeçalho do dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText('Minhas Coleções').first()).toBeVisible();
    });

    // ── Estado vazio — deve rodar ANTES de qualquer teste que cria itens ────

    test('deve exibir estado vazio quando não há itens', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByText('Carregando itens...')).not.toBeVisible();

      await expect(page.getByText('Nenhum item ainda')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Criar seu primeiro item' })).toBeVisible();
    });

    // ── Busca ───────────────────────────────────────────────────────────────

    test('deve exibir o campo de busca', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page.locator('#search')).toBeVisible();
      await expect(page.locator('#search')).toHaveAttribute(
        'placeholder',
        'Buscar por título ou descrição...',
      );
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
      await expect(page.getByText(itemTitle).first()).toBeVisible();

      await page.fill('#search', 'xyzinexistente');
      await expect(
        page.getByText('Nenhum item encontrado com os filtros atuais'),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(itemTitle).first()).not.toBeVisible();

      await page.fill('#search', itemTitle);
      await expect(page.getByText(itemTitle).first()).toBeVisible({ timeout: 10000 });
    });

    // ── Navegação ────────────────────────────────────────────────────────────

    test('deve navegar para a página de novo item pelo botão do header', async ({ page }) => {
      await page.goto('/dashboard');

      // Desktop "Novo" button in toolbar (visible on sm+)
      await page.getByRole('link', { name: /Novo/i }).first().click();

      await expect(page).toHaveURL('/dashboard/new');
      await expect(page.getByRole('heading', { name: 'Novo Item' })).toBeVisible();
    });

    // ── Toggle grade / lista ─────────────────────────────────────────────────

    test('deve alternar entre grade e lista', async ({ page }) => {
      await createItemViaAPI(page, {
        categoryId: testCategory.id,
        title: `Item Toggle ${Date.now()}`,
        description: '',
        status: 'owned',
        isFavorite: false,
        customData: '{}',
      });

      await page.goto('/dashboard');
      await expect(page.getByText('Carregando itens...')).not.toBeVisible();

      // Default is grid — grid wrapper should be present
      const gridWrapper = page.locator('.grid.grid-cols-1');
      await expect(gridWrapper).toBeVisible();

      // Switch to list
      await page.getByRole('button', { name: /Exibir em lista/i }).click();
      await expect(page.locator('.flex.flex-col.gap-3').first()).toBeVisible();

      // Switch back to grid
      await page.getByRole('button', { name: /Exibir em grade/i }).click();
      await expect(gridWrapper).toBeVisible();
    });

    // ── Sidebar (desktop) ────────────────────────────────────────────────────

    test('deve filtrar por categoria via sidebar', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      const uniqueTitle = `Item Sidebar ${Date.now()}`;
      await createItemViaAPI(page, {
        categoryId: testCategory.id,
        title: uniqueTitle,
        description: '',
        status: 'owned',
        isFavorite: false,
        customData: '{}',
      });

      await page.goto('/dashboard');
      await expect(page.getByText('Carregando itens...')).not.toBeVisible();

      // Click the category in the sidebar
      const sidebar = page.locator('aside');
      await sidebar.getByRole('button', { name: new RegExp(testCategory.name) }).click();

      await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 });
    });

    test('deve filtrar favoritos via sidebar', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      await createItemViaAPI(page, {
        categoryId: testCategory.id,
        title: `Item Favorito Sidebar ${Date.now()}`,
        description: '',
        status: 'owned',
        isFavorite: true,
        customData: '{}',
      });

      await page.goto('/dashboard');
      await expect(page.getByText('Carregando itens...')).not.toBeVisible();

      const sidebar = page.locator('aside');
      await sidebar.getByRole('button', { name: /Favoritos/i }).click();

      // Should show at least one item
      await expect(page.locator('.grid .group, .flex.flex-col .group').first()).toBeVisible({
        timeout: 10000,
      });
    });

    // ── Mobile tabs ──────────────────────────────────────────────────────────

    test.describe('Mobile — viewport 390x844', () => {
      test.use({ viewport: { width: 390, height: 844 } });

      test('deve exibir as abas mobile e navegar entre elas', async ({ page }) => {
        await page.goto('/dashboard');

        const tablist = page.getByRole('tablist', { name: /Contexto do dashboard/i });
        await expect(tablist).toBeVisible();

        const tabColecao   = tablist.getByRole('tab', { name: /Coleção/i });
        const tabFavoritos = tablist.getByRole('tab', { name: /Favoritos/i });
        const tabDesejos   = tablist.getByRole('tab', { name: /Desejos/i });

        // Default: Coleção active
        await expect(tabColecao).toHaveAttribute('aria-selected', 'true');
        await expect(tabFavoritos).toHaveAttribute('aria-selected', 'false');
        await expect(tabDesejos).toHaveAttribute('aria-selected', 'false');

        // Switch to Favoritos
        await tabFavoritos.click();
        await expect(tabFavoritos).toHaveAttribute('aria-selected', 'true');
        await expect(tabColecao).toHaveAttribute('aria-selected', 'false');

        // Switch to Desejos
        await tabDesejos.click();
        await expect(tabDesejos).toHaveAttribute('aria-selected', 'true');
        await expect(tabFavoritos).toHaveAttribute('aria-selected', 'false');

        // Back to Coleção
        await tabColecao.click();
        await expect(tabColecao).toHaveAttribute('aria-selected', 'true');
      });

      test('bottom nav e abas ficam sincronizados', async ({ page }) => {
        await page.goto('/dashboard');

        // Click "Favoritos" in bottom nav
        const bottomFav = page.getByRole('button', { name: /Favoritos/i }).last();
        await bottomFav.click();

        // Mobile tab should reflect the change
        const tablist = page.getByRole('tablist');
        await expect(
          tablist.getByRole('tab', { name: /Favoritos/i }),
        ).toHaveAttribute('aria-selected', 'true');

        // Click "Coleção" tab to go back
        await tablist.getByRole('tab', { name: /Coleção/i }).click();

        // Bottom nav "Favoritos" button should no longer be pressed
        await expect(bottomFav).toHaveAttribute('aria-pressed', 'false');
      });

      test('deve navegar para novo item pelo bottom nav', async ({ page }) => {
        await page.goto('/dashboard');

        await page.getByRole('link', { name: /Novo item/i }).click();

        await expect(page).toHaveURL('/dashboard/new');
      });

      test('deve ativar desejos pelo bottom nav', async ({ page }) => {
        await page.goto('/dashboard');

        const wishBtn = page.getByRole('button', { name: /Desejos/i });
        await wishBtn.click();
        await expect(wishBtn).toHaveAttribute('aria-pressed', 'true');

        // Tab should reflect wishlist active
        const tablist = page.getByRole('tablist');
        await expect(
          tablist.getByRole('tab', { name: /Desejos/i }),
        ).toHaveAttribute('aria-selected', 'true');
      });
    });

    // ── Excluir item ─────────────────────────────────────────────────────────

    test('deve excluir um item', async ({ page }) => {
      const itemTitle = `Item Delete ${Date.now()}`;

      await createItemViaAPI(page, {
        categoryId: testCategory.id,
        title: itemTitle,
        description: '',
        status: 'owned',
        isFavorite: false,
        customData: '{}',
      });

      await page.goto('/dashboard');
      await expect(page.getByText('Carregando itens...')).not.toBeVisible();
      await expect(page.getByText(itemTitle)).toBeVisible();

      page.on('dialog', (dialog) => dialog.accept());

      // The delete button has aria-label="Deletar item {title}" (see item-card.tsx)
      await page.getByRole('button', { name: `Deletar item ${itemTitle}` }).click();

      await expect(page.getByText(itemTitle)).not.toBeVisible({ timeout: 10000 });
    });
  });
});
