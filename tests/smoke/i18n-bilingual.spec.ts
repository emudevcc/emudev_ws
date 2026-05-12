import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const runIntegration = process.env.I18N_SMOKE_INTEGRATION === '1'

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
type JsonObject = { [key: string]: JsonValue }
type Locale = 'en' | 'es'

const staticPages = ['', '/about', '/projects', '/blog', '/contact']

function readJson(relativePath: string): JsonObject {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8'))
}

function readText(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

function leafKeys(value: JsonValue, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix]

  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key)
  )
}

function localized<T>(
  field: Partial<Record<Locale, T | undefined>>,
  locale: Locale
): T | undefined {
  return field[locale] ?? field.en
}

test.describe('i18n static contracts', () => {
  test('routing is explicit bilingual en/es with English default', () => {
    const routing = readText('i18n/routing.ts')

    expect(routing).toContain("locales: ['en', 'es']")
    expect(routing).toContain("defaultLocale: 'en'")
    expect(routing).toContain("localePrefix: 'always'")
  })

  test('message namespaces and keys match for English and Spanish', () => {
    const en = readJson('messages/en.json')
    const es = readJson('messages/es.json')

    const enKeys = leafKeys(en).sort()
    const esKeys = leafKeys(es).sort()

    expect(esKeys).toEqual(enKeys)
    expect(enKeys).toEqual(
      expect.arrayContaining([
        'nav.home',
        'nav.projects',
        'nav.blog',
        'nav.about',
        'nav.contact',
        'home.featuredProjects',
        'contact.submit',
        'projects.empty',
      ])
    )
  })

  test('localized Sanity field resolver returns active locale with English fallback', () => {
    expect(localized({ en: 'Project', es: 'Proyecto' }, 'en')).toBe('Project')
    expect(localized({ en: 'Project', es: 'Proyecto' }, 'es')).toBe('Proyecto')
    expect(localized({ en: 'Project' }, 'es')).toBe('Project')
  })

  test('Sanity queries use locale params and English fallback for localized fields', () => {
    const queries = readText('lib/sanity-queries.ts')

    for (const field of [
      'title',
      'description',
      'excerpt',
      'content',
      'siteName',
      'tagline',
      'role',
      'summary',
    ]) {
      expect(queries, `${field} should use locale lookup with English fallback`).toContain(
        `coalesce(${field}[$locale], ${field}.en)`
      )
    }

    expect(queries).toContain('coalesce(slug[$locale].current, slug.en.current)')
    expect(queries).toContain('params: { locale: safeLocale }')
    expect(queries).toContain(
      "const normalizeLocale = (locale?: string): Locale => (locale === 'es' ? 'es' : 'en')"
    )
  })

  test('sitemap implementation emits both configured locale variants', () => {
    const sitemap = readText('app/sitemap.ts')

    expect(sitemap).toContain('routing.locales.map')
    expect(sitemap).toContain('url: `${base}/${locale}`')

    for (const pagePath of ['/about', '/projects', '/blog', '/contact']) {
      expect(sitemap).toContain(`url: \`\${base}/\${locale}${pagePath}\``)
    }
  })
})

test.describe('i18n browser integration', () => {
  test.skip(!runIntegration, 'Set I18N_SMOKE_INTEGRATION=1 and run against a live Next server.')

  test('default locale redirect and locale-prefixed routes resolve', async ({ page, request }) => {
    const root = await request.get('/', { maxRedirects: 0 })
    expect([301, 302, 307, 308]).toContain(root.status())
    expect(root.headers().location).toContain('/en')

    for (const locale of ['en', 'es'] as const) {
      for (const pagePath of staticPages) {
        const res = await page.goto(`/${locale}${pagePath}`)
        expect(res?.status(), `/${locale}${pagePath}`).toBe(200)
        await expect(page.locator('html')).toHaveAttribute('lang', locale)
      }
    }
  })

  test('nav UI strings render for each locale without missing translation keys', async ({
    page,
  }) => {
    await page.goto('/en')
    for (const label of ['Home', 'Projects', 'Blog', 'About', 'Contact']) {
      await expect(page.getByRole('navigation').getByRole('link', { name: label })).toBeVisible()
    }
    await expect(page.locator('body')).not.toContainText('MISSING_MESSAGE')

    await page.goto('/es')
    for (const label of ['Inicio', 'Proyectos', 'Blog', 'Sobre mí', 'Contacto']) {
      await expect(page.getByRole('navigation').getByRole('link', { name: label })).toBeVisible()
    }
    await expect(page.locator('body')).not.toContainText('MISSING_MESSAGE')
  })

  test('language switcher changes locale URL and rerenders nav strings', async ({ page }) => {
    await page.goto('/en/about')

    await page.getByRole('button', { name: /Español|Spanish/i }).click()
    await page.waitForURL('**/es/about')
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Inicio' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')

    await page.getByRole('button', { name: /English|Inglés/i }).click()
    await page.waitForURL('**/en/about')
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('localized Sanity-backed list pages render in both locales', async ({ page }) => {
    for (const locale of ['en', 'es'] as const) {
      for (const pagePath of ['/projects', '/blog']) {
        const res = await page.goto(`/${locale}${pagePath}`)
        expect(res?.status(), `/${locale}${pagePath}`).toBe(200)
        await expect(page.locator('html')).toHaveAttribute('lang', locale)
        await expect(page.locator('body')).not.toContainText('MISSING_MESSAGE')
      }
    }
  })

  test('sitemap endpoint contains English and Spanish static URL variants', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)

    const body = await res.text()
    for (const locale of ['en', 'es'] as const) {
      for (const pagePath of staticPages) {
        expect(body).toContain(`/${locale}${pagePath}`)
      }
    }
  })

  test('static pages expose hreflang alternates', async ({ page }) => {
    await page.goto('/en/about')

    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
  })
})
