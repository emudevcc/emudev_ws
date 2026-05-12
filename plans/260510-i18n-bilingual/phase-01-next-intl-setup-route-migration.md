---
phase: 1
title: "next-intl Setup + Route Migration"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: next-intl Setup + Route Migration

## Overview

Install `next-intl`, configure routing, create the `i18n/` config files, stub out message files, add `middleware.ts`, and restructure all public pages under `app/[locale]/`. API routes and Studio stay at root. After this phase the app renders under `/en/` and `/es/` with hardcoded English UI strings (phase 2 extracts them).

## Requirements

- Functional:
  - `GET /` → 302 to `/en`
  - `GET /en/*` and `GET /es/*` → serve correct pages
  - `GET /api/*`, `GET /studio/*` → untouched (no locale prefix)
  - Locale switcher in nav (links to same page in the other locale)
- Non-functional:
  - TypeScript strict; no `any` casts for locale params
  - All existing routes resolve — no 404 regressions

## Architecture

```
next.config.ts           ← wrapped with createNextIntlPlugin(./i18n/request.ts)
middleware.ts            ← createMiddleware(routing); matcher excludes api/studio/_next
i18n/routing.ts          ← defineRouting({ locales, defaultLocale })
i18n/request.ts          ← getRequestConfig — loads messages per locale
messages/en.json         ← stub { "nav": { "home": "Home", ... } }
messages/es.json         ← stub { "nav": { "home": "Inicio", ... } }

app/
├── layout.tsx           ← bare html/body shell (no metadata, no SiteNav)
├── page.tsx             ← permanentRedirect('/en')
├── [locale]/
│   ├── layout.tsx       ← NextIntlClientProvider + lang={locale} + SiteNav
│   ├── page.tsx         ← (moved from app/page.tsx)
│   ├── about/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/page.tsx
│   └── projects/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── api/                 ← unchanged
├── studio/              ← unchanged
├── sitemap.ts           ← unchanged (updated in phase 4)
└── robots.ts            ← unchanged
```

## Related Code Files

- Create: `middleware.ts`
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `messages/en.json`
- Create: `messages/es.json`
- Create: `app/[locale]/layout.tsx` (moved + extended from `app/layout.tsx`)
- Create: `app/[locale]/page.tsx` (moved from `app/page.tsx`)
- Create: `app/[locale]/about/page.tsx` (moved)
- Create: `app/[locale]/blog/page.tsx` (moved)
- Create: `app/[locale]/blog/[slug]/page.tsx` (moved)
- Create: `app/[locale]/blog/[slug]/opengraph-image.tsx` (moved)
- Create: `app/[locale]/contact/page.tsx` (moved)
- Create: `app/[locale]/projects/page.tsx` (moved)
- Create: `app/[locale]/projects/[slug]/page.tsx` (moved)
- Create: `app/[locale]/projects/[slug]/opengraph-image.tsx` (moved)
- Modify: `app/layout.tsx` → bare shell
- Modify: `app/page.tsx` → redirect to /en
- Modify: `next.config.ts` → wrap with createNextIntlPlugin
- Create: `components/locale-switcher.tsx`
- Modify: `components/site-nav.tsx` → use next-intl Link + add locale switcher

## Implementation Steps

### 1. Install next-intl

```bash
npm install next-intl
```

Verify compatible version resolves (next-intl ^3.x works with Next.js 15).

### 2. Create `i18n/routing.ts`

```ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
})
```

### 3. Create `i18n/request.ts`

```ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'en' | 'es')) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

### 4. Create `messages/en.json` (stub — full strings added in phase 2)

```json
{
  "nav": {
    "home": "Home",
    "projects": "Projects",
    "blog": "Blog",
    "about": "About",
    "contact": "Contact"
  }
}
```

### 5. Create `messages/es.json` (stub)

```json
{
  "nav": {
    "home": "Inicio",
    "projects": "Proyectos",
    "blog": "Blog",
    "about": "Sobre mí",
    "contact": "Contacto"
  }
}
```

### 6. Update `next.config.ts` — wrap with createNextIntlPlugin

```ts
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const isDev = process.env.NODE_ENV === 'development'

const securityHeaders = [ /* unchanged */ ]

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  transpilePackages: ['@sanity/icons', '@sanity/ui'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default withNextIntl(nextConfig)
```

### 7. Create `middleware.ts`

```ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all paths except: api, studio, _next internals, static files, favicons
  matcher: ['/((?!api|studio|_next|_vercel|.*\\..*).*)'],
}
```

### 8. Update root `app/layout.tsx` — bare shell only

The `[locale]/layout.tsx` will own the full layout. Root layout becomes:

```tsx
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
```

> The `<html>` and `<body>` tags move to `app/[locale]/layout.tsx` so `lang` can be set dynamically.

### 9. Create root `app/page.tsx` — redirect to default locale

```tsx
import { permanentRedirect } from 'next/navigation'

export default function RootPage() {
  permanentRedirect('/en')
}
```

### 10. Create `app/[locale]/layout.tsx`

Move the existing `app/layout.tsx` content here, replacing hardcoded `lang="en"` with the dynamic locale param. Add `NextIntlClientProvider`.

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SanityVisualEditing } from '@/components/sanity-visual-editing'
import { SiteNav } from '@/components/site-nav'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'emudev', template: '%s | emudev' },
  description: 'Software engineer portfolio — Esteban Montero',
  openGraph: { siteName: 'emudev', type: 'website' },
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'es')) notFound()

  const messages = await getMessages()
  const { isEnabled: isDraft } = await draftMode()

  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          <SiteNav />
          <main>{children}</main>
          {isDraft && <SanityVisualEditing />}
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### 11. Move all page files under `app/[locale]/`

Move (do not copy) each page and keep content identical — string extraction happens in phase 2:

| From | To |
|------|----|
| `app/page.tsx` | `app/[locale]/page.tsx` |
| `app/about/page.tsx` | `app/[locale]/about/page.tsx` |
| `app/blog/page.tsx` | `app/[locale]/blog/page.tsx` |
| `app/blog/[slug]/page.tsx` | `app/[locale]/blog/[slug]/page.tsx` |
| `app/blog/[slug]/opengraph-image.tsx` | `app/[locale]/blog/[slug]/opengraph-image.tsx` |
| `app/contact/page.tsx` | `app/[locale]/contact/page.tsx` |
| `app/projects/page.tsx` | `app/[locale]/projects/page.tsx` |
| `app/projects/[slug]/page.tsx` | `app/[locale]/projects/[slug]/page.tsx` |
| `app/projects/[slug]/opengraph-image.tsx` | `app/[locale]/projects/[slug]/opengraph-image.tsx` |

After moving, all pages receive an extra `params` prop containing `locale`. Update `params` types:

```ts
// Before
type Props = { params: Promise<{ slug: string }> }

// After
type Props = { params: Promise<{ locale: string; slug: string }> }
```

### 12. Create `components/locale-switcher.tsx` — client component

```tsx
'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next-intl/navigation' // wait — need next-intl navigation exports

// next-intl v3: create navigation helpers from routing
```

> Use the navigation helpers created via `createNavigation(routing)` in `i18n/navigation.ts`.

Create `i18n/navigation.ts`:
```ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
```

Then `components/locale-switcher.tsx`:
```tsx
'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useTransition } from 'react'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const other = locale === 'en' ? 'es' : 'en'

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: other })
    })
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      aria-label={`Switch to ${other === 'en' ? 'English' : 'Español'}`}
    >
      {other === 'en' ? 'EN' : 'ES'}
    </button>
  )
}
```

### 13. Update `components/site-nav.tsx` — use next-intl Link

Replace `next/link` with locale-aware `Link` from `@/i18n/navigation`. Nav labels will be replaced with translation keys in phase 2, but the links need updating now.

```tsx
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './locale-switcher'
// ... use Link instead of next/link Link
```

## Todo List

- [x] `npm install next-intl`
- [x] Create `i18n/routing.ts`
- [x] Create `i18n/request.ts`
- [x] Create `i18n/navigation.ts`
- [x] Create `messages/en.json` (nav stub)
- [x] Create `messages/es.json` (nav stub)
- [x] Update `next.config.ts` with `createNextIntlPlugin`
- [x] Create `middleware.ts`
- [x] Update root `app/layout.tsx` → bare shell
- [x] Update root `app/page.tsx` → `permanentRedirect('/en')`
- [x] Create `app/[locale]/layout.tsx` with `NextIntlClientProvider`
- [x] Move all page files to `app/[locale]/`
- [x] Update `params` types in all moved pages to include `locale`
- [x] Create `components/locale-switcher.tsx`
- [x] Update `components/site-nav.tsx` to use next-intl Link + add LocaleSwitcher
- [x] Verify `/en` and `/es` serve pages (no 404)
- [ ] Verify `/api/health` still works (no locale prefix)
- [ ] Verify `/studio` still works
- [x] Verify `npx tsc --noEmit` passes

## Success Criteria

- [ ] `GET /` → 308 to `/en`
- [x] `GET /en/`, `/en/about`, `/en/projects`, `/en/blog`, `/en/contact` all return 200
- [x] `GET /es/`, `/es/about`, `/es/projects`, `/es/blog`, `/es/contact` all return 200
- [ ] `GET /api/health` → 200 (no locale prefix in API routes)
- [ ] `GET /studio` → Sanity Studio loads
- [x] `lang` attribute on `<html>` is `"en"` on `/en/` and `"es"` on `/es/`
- [x] Locale switcher in nav toggles between `/en/*` and `/es/*`
- [x] `npx tsc --noEmit` — no type errors

## Completion Notes — 2026-05-10

- Public pages were moved into `app/[locale]`; root `/` redirects to the default English locale.
- `next-intl` routing, middleware, request config, locale-aware navigation helpers, and the locale switcher were added.
- Runtime checks confirmed localized public pages return 200, and build/typecheck passed.
- API and Studio routes remain outside the localized route group; explicit `/api/health` and `/studio` smoke checks are still listed for follow-up.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `params.locale` type error for pages with extra params (`slug`) | Medium | Update all Props types to include `locale` |
| Root layout losing `globals.css` import | Medium | Keep `globals.css` import in `[locale]/layout.tsx` |
| Middleware intercepting `/studio` or `/api` | High | Matcher regex explicitly excludes `studio` and `api` |
| `createNavigation` API differs between next-intl v3 minor versions | Low | Pin version in package.json, verify against installed version |
