import { test, expect } from '@playwright/test';
import { generateTestUser } from './helpers/auth';

test.describe('Autenticação', () => {
  test.describe('Página de Login', () => {
    test('deve exibir o formulário de login', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.locator('h2')).toContainText('Coleções');
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
      await expect(page.getByText('Crie uma aqui')).toBeVisible();
    });

    test('deve exibir erro ao submeter com email vazio', async ({ page }) => {
      await page.goto('/auth/login');

      // Desabilitar validação nativa do browser para testar validação React
      await page.evaluate(() => {
        document.querySelector('form')?.setAttribute('novalidate', '');
      });

      await page.fill('#password', 'qualquersenha');
      await page.getByRole('button', { name: 'Entrar' }).click();

      await expect(page.locator('.text-red-800').first()).toContainText('Email');
    });

    test('deve exibir erro ao submeter com senha vazia', async ({ page }) => {
      await page.goto('/auth/login');

      // Desabilitar validação nativa do browser para testar validação React
      await page.evaluate(() => {
        document.querySelector('form')?.setAttribute('novalidate', '');
      });

      await page.fill('#email', 'teste@exemplo.com');
      await page.getByRole('button', { name: 'Entrar' }).click();

      await expect(page.locator('.text-red-800').first()).toContainText('Senha');
    });

    test('deve permanecer no login com credenciais inválidas', async ({ page }) => {
      await page.goto('/auth/login');

      await page.fill('#email', 'invalido@exemplo.com');
      await page.fill('#password', 'senhaerrada');
      await page.getByRole('button', { name: 'Entrar' }).click();

      // O interceptor do axios redireciona para /auth/login em 401
      await page.waitForURL('/auth/login');
      await expect(page).toHaveURL('/auth/login');
      await expect(page.locator('h2')).toContainText('Coleções');
    });

    test('deve fazer login com sucesso e redirecionar para o dashboard', async ({ page }) => {
      const user = generateTestUser();

      await page.request.post('/api/auth/register', {
        data: { name: user.name, email: user.email, password: user.password },
      });

      await page.goto('/auth/login');
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);
      await page.getByRole('button', { name: 'Entrar' }).click();

      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText('Minhas Coleções')).toBeVisible();
    });

    test('deve navegar para a página de cadastro', async ({ page }) => {
      await page.goto('/auth/login');

      await page.getByText('Crie uma aqui').click();

      await expect(page).toHaveURL('/auth/register');
    });
  });

  test.describe('Página de Cadastro', () => {
    test('deve exibir o formulário de cadastro', async ({ page }) => {
      await page.goto('/auth/register');

      await expect(page.locator('#name')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Criar Conta' })).toBeVisible();
      await expect(page.getByText('Faça login aqui')).toBeVisible();
    });

    test('deve exibir erro quando as senhas não coincidem', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('#name', 'Usuário Teste');
      await page.fill('#email', 'teste@exemplo.com');
      await page.fill('#password', 'senha123');
      await page.fill('#confirmPassword', 'senhadiferente');
      await page.getByRole('button', { name: 'Criar Conta' }).click();

      await expect(page.locator('.text-red-800').first()).toContainText('senhas');
    });

    test('deve exibir erro quando a senha é muito curta', async ({ page }) => {
      await page.goto('/auth/register');

      await page.fill('#name', 'Usuário Teste');
      await page.fill('#email', 'teste@exemplo.com');
      await page.fill('#password', '123');
      await page.fill('#confirmPassword', '123');
      await page.getByRole('button', { name: 'Criar Conta' }).click();

      await expect(page.locator('.text-red-800').first()).toContainText('6 caracteres');
    });

    test('deve exibir erro quando o nome está vazio', async ({ page }) => {
      await page.goto('/auth/register');

      // Desabilitar validação nativa do browser para testar validação React
      await page.evaluate(() => {
        document.querySelector('form')?.setAttribute('novalidate', '');
      });

      await page.fill('#email', 'teste@exemplo.com');
      await page.fill('#password', 'senha123');
      await page.fill('#confirmPassword', 'senha123');
      await page.getByRole('button', { name: 'Criar Conta' }).click();

      await expect(page.locator('.text-red-800').first()).toContainText('Nome');
    });

    test('deve cadastrar com sucesso e redirecionar para a tela de login', async ({ page }) => {
      const user = generateTestUser();

      await page.goto('/auth/register');
      await page.fill('#name', user.name);
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);
      await page.fill('#confirmPassword', user.password);
      await page.getByRole('button', { name: 'Criar Conta' }).click();

      // Deve redirecionar para login com success param
      await expect(page).toHaveURL('/auth/login');
      // A mensagem de sucesso deve aparecer (toast)
      await expect(page.getByText(/Cadastro realizado com sucesso/i)).toBeVisible();
    });

    test('deve navegar para a página de login', async ({ page }) => {
      await page.goto('/auth/register');

      await page.getByText('Faça login aqui').click();

      await expect(page).toHaveURL('/auth/login');
    });
  });

  test.describe('Logout', () => {
    test('deve deslogar e redirecionar para login', async ({ page }) => {
      const user = generateTestUser();

      await page.request.post('/api/auth/register', {
        data: { name: user.name, email: user.email, password: user.password },
      });
      await page.request.post('/api/auth/login', {
        data: { email: user.email, password: user.password },
      });

      await page.goto('/dashboard');
      await expect(page.getByText('Minhas Coleções')).toBeVisible();

      await page.getByRole('button').filter({ hasText: /Sair/i }).click();

      await expect(page).toHaveURL('/auth/login');
    });
  });
});
