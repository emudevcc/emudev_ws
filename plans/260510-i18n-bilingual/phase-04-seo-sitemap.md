---
phase: 4
title: "SEO & Sitemap"
status: completed
priority: P2
effort: "1h"
dependencies: [1, 2, 3]
---

# Phase 4: SEO & Sitemap

## Overview

Add hreflang alternate links to every page, update `sitemap.ts` to emit both `/en/` and `/es/` URLs for all content, and ensure OG metadata is locale-aware. After this phase, search engines correctly understand the bilingual structure and serve the right language to the right audience.

## Requirements

- Functional:
  - `<link rel="alternate" hreflang="en" href="https://emudev.cc/en/...">` on every page
  - `<link rel="alternate" hreflang="es" href="https://emudev.cc/es/...">` on every page
  - `<link rel="alternate" hreflang="x-default" href="https://emudev.cc/en/...">` on every page
  - `sitemap.xml` includes both locale variants for every URL
  - OG `locale` tag matches active locale (`en_US` / `es_ES`)
- Non-functional:
  - No duplicate canonical tags
  - Sitemap stays under 50k URLs (well within limits for a portfolio)

## Architecture

```
app/[locale]/layout.tsx        ← base alternates via metadata.alternates
app/[locale]/page.tsx          ← page-level alternates (override layout)
app/[locale]/blog/[slug]/page.tsx  ← slug-aware alternates per post
app/[locale]/projects/[slug]/page.tsx  ← slug-aware alternates per project
app/sitemap.ts                 ← emits /en/ + /es/ entries for every URL
```

## Related Code Files

- Modify: `app/[locale]/layout.tsx` — add base alternates to metadata
- Modify: `app/[locale]/page.tsx` — locale-aware OG metadata
- Modify: `app/[locale]/about/page.tsx` — alternates
- Modify: `app/[locale]/blog/page.tsx` — alternates
- Modify: `app/[locale]/blog/[slug]/page.tsx` — slug-aware alternates
- Modify: `app/[locale]/contact/page.tsx` — alternates
- Modify: `app/[locale]/projects/page.tsx` — alternates
- Modify: `app/[locale]/projects/[slug]/page.tsx` — slug-aware alternates
- Modify: `app/sitemap.ts` — dual-locale entries

## Implementation Steps

### 1. Helper — build alternates for a given path

Create a small helper to avoid repeating the alternates object on every page. Since this is used only in server components, it can live in `lib/i18n-metadata.ts`:

```ts
// lib/i18n-metadata.ts
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emudev.cc'

export function buildAlternates(enPath: string, esPath: string = enPath) {
  return {
    canonical: `${BASE}/en${enPath}`,
    languages: {
      en: `${BASE}/en${enPath}`,
      es: `${BASE}/es${esPath}`,
      'x-default': `${BASE}/en${enPath}`,
    },
  }
}
```

For static pages (same path in both locales), call `buildAlternates('/about')`.
For dynamic pages with locale-specific slugs, call `buildAlternates('/blog/my-post', '/blog/mi-articulo')`.

### 2. Static pages — add alternates to `generateMetadata`

Apply to: `about`, `blog` (index), `contact`, `projects` (index), home (`page.tsx`).

```tsx
// app/[locale]/about/page.tsx
import { buildAlternates } from '@/lib/i18n-metadata'

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return {
    title: t('title'),
    description: t('metaDescription'),
    openGraph: { locale: locale === 'es' ? 'es_ES' : 'en_US' },
    alternates: buildAlternates('/about'),
  }
}
```

### 3. Dynamic pages — slug-aware alternates

For blog and project detail pages, fetch both locale slugs from Sanity to build correct alternates:

```tsx
// app/[locale]/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) return {}

  // post query should also return both slugs for alternate building
  const enSlug = post.slugEn   // add to query projection
  const esSlug = post.slugEs ?? post.slugEn

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { locale: locale === 'es' ? 'es_ES' : 'en_US' },
    alternates: buildAlternates(`/blog/${enSlug}`, `/blog/${esSlug}`),
  }
}
```

Update `getPostBySlug` in `lib/sanity-queries.ts` to also return both slugs:

```groq
*[_type == "post" && (slug.en.current == $slug || slug.es.current == $slug)][0] {
  ...,
  "slugEn": slug.en.current,
  "slugEs": slug.es.current,
}
```

Same pattern for `getProjectBySlug`.

### 4. Update `app/sitemap.ts` — emit both locales

```ts
import type { MetadataRoute } from 'next'
import { getProjects, getPosts } from '@/lib/sanity-queries'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emudev.cc'
const LOCALES = ['en', 'es'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use 'en' as the canonical locale for fetching — slugs for both locales come from the query
  const [projects, posts] = await Promise.all([
    getProjects('en'),
    getPosts('en'),
  ])
  const safeProjects = projects ?? []
  const safePosts = posts ?? []

  const staticPaths = ['', '/about', '/projects', '/blog', '/contact']

  const staticEntries = staticPaths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      priority: path === '' ? 1.0 : 0.8,
    }))
  )

  // For dynamic content, query must return both slugs (slugEn, slugEs)
  const projectEntries = safeProjects
    .filter((p) => p.slugEn)
    .flatMap((p) => [
      {
        url: `${BASE}/en/projects/${p.slugEn}`,
        lastModified: new Date(p.publishedAt ?? p._createdAt),
        priority: 0.8 as const,
      },
      {
        url: `${BASE}/es/projects/${p.slugEs ?? p.slugEn}`,
        lastModified: new Date(p.publishedAt ?? p._createdAt),
        priority: 0.8 as const,
      },
    ])

  const postEntries = safePosts
    .filter((p) => p.slugEn)
    .flatMap((p) => [
      {
        url: `${BASE}/en/blog/${p.slugEn}`,
        lastModified: new Date(p.publishedAt ?? p._createdAt),
        priority: 0.7 as const,
      },
      {
        url: `${BASE}/es/blog/${p.slugEs ?? p.slugEn}`,
        lastModified: new Date(p.publishedAt ?? p._createdAt),
        priority: 0.7 as const,
      },
    ])

  return [...staticEntries, ...projectEntries, ...postEntries]
}
```

> **Note:** `getProjects` and `getPosts` must be updated to also return `slugEn` and `slugEs` in their projections (in addition to the locale-resolved `slug`).

### 5. Smoke test — verify sitemap and hreflang

After deploying to preview:
1. Fetch `/sitemap.xml` — verify `/en/` and `/es/` entries for all pages
2. View source of `/en/about` — verify `<link rel="alternate" hreflang="es" href=".../es/about">`
3. View source of `/es/blog/[spanish-slug]` — verify `<link rel="alternate" hreflang="en" href=".../en/blog/[english-slug]">`

## Todo List

- [x] Create `lib/i18n-metadata.ts` with `buildAlternates()` helper
- [x] Update `generateMetadata` in `app/[locale]/page.tsx` — alternates + OG locale
- [x] Update `generateMetadata` in `app/[locale]/about/page.tsx`
- [x] Update `generateMetadata` in `app/[locale]/blog/page.tsx`
- [x] Update `generateMetadata` in `app/[locale]/contact/page.tsx`
- [x] Update `generateMetadata` in `app/[locale]/projects/page.tsx`
- [x] Update `getPostBySlug` query — add `slugEn`, `slugEs` to projection
- [x] Update `getProjectBySlug` query — add `slugEn`, `slugEs` to projection
- [x] Update `getPosts` query — add `slugEn`, `slugEs` to projection
- [x] Update `getProjects` query — add `slugEn`, `slugEs` to projection
- [x] Update `generateMetadata` in `app/[locale]/blog/[slug]/page.tsx` — slug-aware alternates
- [x] Update `generateMetadata` in `app/[locale]/projects/[slug]/page.tsx` — slug-aware alternates
- [x] Update `app/sitemap.ts` — dual-locale entries for all static + dynamic pages
- [x] Verify `/sitemap.xml` returns 200 and contains `/en/` and `/es/` URLs
- [x] Verify hreflang tags in page source for both static and dynamic pages
- [x] Run `npx tsc --noEmit` — no errors

## Success Criteria

- [x] `/sitemap.xml` contains `${BASE}/en/` and `${BASE}/es/` entries for every public page
- [x] Every page's `<head>` has three `<link rel="alternate">` tags: `hreflang="en"`, `hreflang="es"`, `hreflang="x-default"`
- [x] OG `locale` is `en_US` on `/en/*` and `es_ES` on `/es/*`
- [x] `/es/blog/[spanish-slug]` alternate points to correct `/en/blog/[english-slug]`
- [x] `npx tsc --noEmit` passes

## Progress Notes — 2026-05-10

- Sitemap now fetches projects/posts for each supported locale and emits canonical `/en/...` and `/es/...` entries.
- Runtime verification confirmed `/sitemap.xml` includes both locale variants for static pages and current dynamic Sanity content.
- Internal homepage, project card, and post card links were switched to `@/i18n/navigation` so links preserve the active locale.
- Metadata alternates, OG locale tags, slug-aware hreflang, sitemap verification, and TypeScript checks are closed.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `slugEs` null/undefined for posts without Spanish translation | Medium | Use `slugEs ?? slugEn` fallback — both locales point to English URL until translated |
| Sitemap query fetches posts twice (once per locale before) | Low | Fetch once with `'en'` locale and use both `slugEn`/`slugEs` from projection |
| hreflang self-referencing omitted | Low | `buildAlternates` includes both locales; Next.js adds canonical automatically |
| `generateMetadata` called with stale cached query missing `slugEn` | Medium | Update cache keys to include `slugEn`/`slugEs` when adding them to projections |
