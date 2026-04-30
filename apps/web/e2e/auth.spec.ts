import { test, expect } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@angopress.ao'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123!'
const USER_EMAIL = process.env.E2E_USER_EMAIL ?? 'demo@angopress.ao'
const USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'Demo@123!'

test.describe('Autenticação', () => {
  test('deve redirecionar para login se não autenticado', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await expect(page).toHaveURL(/\/login/)
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', 'invalido@angopress.ao')
    await page.fill('input[type="password"]', 'senhaerrada')
    await page.click('button[type="submit"]')
    await expect(
      page
        .locator('[data-sonner-toast]')
        .or(page.locator('.sentry-error-embed'))
        .or(page.getByText(/credenciais|inválido|erro/i)),
    ).toBeVisible({ timeout: 8000 })
  })

  test('utilizador regular consegue fazer login e ver dashboard', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', USER_EMAIL)
    await page.fill('input[type="password"]', USER_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('utilizador consegue terminar sessão', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', USER_EMAIL)
    await page.fill('input[type="password"]', USER_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    // Clicar no botão de logout (ícone LogOut)
    await page.click('button[title="Terminar sessão"]')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})

test.describe('Admin — Autenticação', () => {
  test('admin consegue fazer login e ver painel admin', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
    await expect(page.getByText(/administra/i)).toBeVisible()
  })
})
