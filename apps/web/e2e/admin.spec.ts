import { test, expect, Page } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@angopress.ao'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123!'

async function loginAdmin(page: Page) {
  await page.goto(`${BASE}/login`)
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
}

test.describe('Admin — Gestão', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page)
  })

  test('ver dashboard de administração', async ({ page }) => {
    await expect(page.getByText(/utilizadores|assinaturas|campanhas/i)).toBeVisible()
  })

  test('navegar para a lista de utilizadores', async ({ page }) => {
    await page.goto(`${BASE}/admin/utilizadores`)
    await expect(page.getByRole('heading', { name: /utilizadores/i })).toBeVisible()
  })

  test('navegar para a lista de assinaturas', async ({ page }) => {
    await page.goto(`${BASE}/admin/assinaturas`)
    await expect(page.getByRole('heading', { name: /assinaturas/i })).toBeVisible()
  })

  test('navegar para gestão de planos', async ({ page }) => {
    await page.goto(`${BASE}/admin/planos`)
    await expect(page.getByRole('heading', { name: /planos/i })).toBeVisible()
  })

  test('aprovar assinatura pendente (se existir)', async ({ page }) => {
    await page.goto(`${BASE}/admin/assinaturas`)
    // Filtrar por pendentes
    const pendingTab = page.locator('button:has-text("Pendentes")')
    if (await pendingTab.isVisible()) {
      await pendingTab.click()
    }
    const approveButton = page.locator('button:has-text("Aprovar")').first()
    if (await approveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await approveButton.click()
      await expect(
        page.locator('[data-sonner-toast]').or(page.getByText(/aprovada|sucesso/i)),
      ).toBeVisible({ timeout: 8000 })
    } else {
      test.skip()
    }
  })
})
