import { test, expect } from '@playwright/test'

test('contact form renders and submits without 500', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.locator('form')).toBeVisible()

  await page.fill('input[name="name"]', 'Smoke Test')
  await page.fill('input[name="email"]', 'smoke@example.com')
  await page.fill('textarea[name="message"]', 'Automated smoke test — ignore')
  await page.click('button[type="submit"]')

  // Wait for server action response
  await page.waitForTimeout(2000)

  const bodyText = await page.textContent('body')
  expect(bodyText).not.toContain('500')
  expect(bodyText).not.toContain('Internal Server Error')
})
