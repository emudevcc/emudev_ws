import { test, expect } from '@playwright/test'

const publicPages = ['/', '/about', '/projects', '/blog', '/contact']

for (const path of publicPages) {
  test(`${path} returns 200`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    const res = await page.goto(path)
    expect(res?.status()).toBe(200)

    const appErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('gtag') && !e.includes('analytics')
    )
    expect(appErrors).toHaveLength(0)
  })
}

test('/sitemap.xml is valid XML', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.status()).toBe(200)
  const body = await res.text()
  expect(body).toContain('<?xml')
  expect(body).toContain('<urlset')
})

test('/robots.txt disallows /studio', async ({ request }) => {
  const res = await request.get('/robots.txt')
  expect(res.status()).toBe(200)
  const body = await res.text()
  expect(body).toContain('Disallow: /studio')
})
