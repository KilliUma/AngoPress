import { test, expect, Page } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const USER_EMAIL = process.env.E2E_USER_EMAIL ?? 'demo@angopress.ao'
const USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'Demo@123!'

async function login(page: Page) {
  await page.goto(`${BASE}/login`)
  await page.fill('input[type="email"]', USER_EMAIL)
  await page.fill('input[type="password"]', USER_PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('Campanhas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('navegar para a lista de campanhas', async ({ page }) => {
    await page.goto(`${BASE}/campanhas`)
    await expect(page.getByRole('heading', { name: /campanhas/i })).toBeVisible()
  })

  test('abrir formulário de nova campanha', async ({ page }) => {
    await page.goto(`${BASE}/campanhas`)
    await page.click('button:has-text("Nova Campanha")')
    await expect(page).toHaveURL(/\/campanhas\/nova/)
    await expect(page.getByRole('heading', { name: /nova campanha/i })).toBeVisible()
  })

  test('criar campanha rascunho', async ({ page }) => {
    await page.goto(`${BASE}/campanhas/nova`)
    const uniqueName = `Campanha E2E ${Date.now()}`

    // Aguarda o formulário carregar
    await page.waitForSelector('input[name="name"]', { timeout: 10000 })
    await page.fill('input[name="name"]', uniqueName)
    await page.fill('input[name="subject"]', 'Assunto Teste E2E')

    // Guardar como rascunho (botão principal)
    await page.click('button[type="submit"]:has-text("Guardar")')

    // Verificar que volta para a lista ou mostra sucesso
    await expect(
      page.locator('[data-sonner-toast]').or(page.getByText(/guardada|sucesso|criada/i)),
    ).toBeVisible({ timeout: 8000 })
  })

  test('ver detalhe de campanha enviada (se existir)', async ({ page }) => {
    await page.goto(`${BASE}/campanhas`)
    // Clica em "Enviadas" tab
    await page.click('button:has-text("Enviadas")')
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    if (count === 0) {
      test.skip()
      return
    }
    await rows.first().click()
    await expect(page).toHaveURL(/\/campanhas\//)
    // Verificar que os cards de métricas estão visíveis
    await expect(page.getByText(/enviados/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Jornalistas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('listar jornalistas', async ({ page }) => {
    await page.goto(`${BASE}/jornalistas`)
    await expect(page.getByRole('heading', { name: /jornalistas/i })).toBeVisible()
  })

  test('abrir modal de adicionar jornalista', async ({ page }) => {
    await page.goto(`${BASE}/jornalistas`)
    await page.click('button:has-text("Adicionar")')
    await expect(page.getByRole('dialog').or(page.locator('[role="dialog"]'))).toBeVisible()
  })
})
