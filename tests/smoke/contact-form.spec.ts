import { test, expect } from '@playwright/test'

test('contact section renders form with required fields', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('form')).toBeVisible()
  await expect(page.locator('input[name="name"]')).toBeVisible()
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('textarea[name="message"]')).toBeVisible()
  await expect(page.locator('button[type="submit"]')).toBeVisible()
})

test('contact form submits without 500', async ({ page }) => {
  await page.goto('/en')

  await page.fill('input[name="name"]', 'Smoke Test')
  await page.fill('input[name="email"]', 'smoke@example.com')
  await page.fill('textarea[name="message"]', 'Automated smoke test — ignore')
  await page.click('button[type="submit"]')

  // Wait for server action to settle (success div or graceful error — never a 500)
  await page.waitForLoadState('networkidle')

  const bodyText = await page.textContent('body')
  expect(bodyText).not.toContain('Application error')
  expect(bodyText).not.toContain('Internal Server Error')
})
