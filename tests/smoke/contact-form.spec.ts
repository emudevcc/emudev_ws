import { test, expect } from '@playwright/test'

test('contact page renders form with required fields', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.locator('form')).toBeVisible()
  await expect(page.locator('input[name="name"]')).toBeVisible()
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('textarea[name="message"]')).toBeVisible()
  await expect(page.locator('button[type="submit"]')).toBeVisible()
})
