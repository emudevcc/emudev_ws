import { test, expect } from '@playwright/test'

test('nav links resolve without 404', async ({ page }) => {
  await page.goto('/')

  const navLinks = await page.locator('nav a').all()
  for (const link of navLinks) {
    const href = await link.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto'))
      continue
    const res = await page.request.get(href)
    expect(res.status(), `Nav link ${href} returned ${res.status()}`).toBeLessThan(400)
  }
})

test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1').first()).toBeVisible()
  await expect(page.locator('h1').first()).not.toBeEmpty()
})
