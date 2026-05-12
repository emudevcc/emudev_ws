---
phase: 8
title: "SEO and Polish"
status: pending
priority: P2
effort: "3h"
dependencies: [3, 4, 5, 6, 7]
---

# Phase 8: SEO and Polish

## Overview

Final pass: dynamic metadata, OG image route, sitemap update, scroll-in BlurFade audit, and smoke test run. No new sections — this is stabilization before shipping.

## Requirements

**Functional:**
- `app/[locale]/page.tsx` exports `generateMetadata` wired to `getSiteSettings`
- `app/opengraph-image.tsx` (or equivalent) generates a dynamic OG card
- Sitemap includes the home page for both locales
- All sections have `<BlurFade>` on first visible element (scroll-in on enter)

**Non-functional:**
- `<title>` renders as `{shortName} — {role}` per locale
- OG image: 1200×630, dark background, name + role + avatar
- `robots.txt` allows all crawlers

## Related Code Files

- Modify: `app/[locale]/page.tsx` (add `generateMetadata`)
- Create: `app/[locale]/opengraph-image.tsx`
- Modify: `app/sitemap.ts` (or `app/sitemap.xml/route.ts`)
- Audit: all section components for BlurFade coverage

## Implementation Steps

### Step 1: Add `generateMetadata` to `app/[locale]/page.tsx`

```tsx
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return {
    title: settings ? `${settings.shortName} — ${settings.role}` : 'Portfolio',
    description: settings?.tagline ?? '',
    openGraph: {
      title: settings?.shortName ?? '',
      description: settings?.tagline ?? '',
      locale,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', es: '/es' },
    },
  }
}
```

### Step 2: Create `app/[locale]/opengraph-image.tsx`

```tsx
import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/sanity/queries'

export const runtime = 'edge'
export const alt = 'Portfolio OG image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: { locale: string } }) {
  const settings = await getSiteSettings(params.locale)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#fafafa',
          gap: 16,
        }}
      >
        {settings?.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.avatar} width={96} height={96}
            style={{ borderRadius: '50%', objectFit: 'cover' }} alt="" />
        )}
        <p style={{ fontSize: 52, fontWeight: 700, margin: 0 }}>
          {settings?.shortName ?? 'Portfolio'}
        </p>
        <p style={{ fontSize: 24, color: '#a1a1aa', margin: 0 }}>
          {settings?.role ?? ''}
        </p>
      </div>
    ),
    { ...size }
  )
}
```

### Step 3: Update sitemap

If `app/sitemap.ts` exists, add home page entries:

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://example.com'
const LOCALES = ['en', 'es']

export default function sitemap(): MetadataRoute.Sitemap {
  const homeEntries = LOCALES.map(locale => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(LOCALES.map(l => [l, `${BASE_URL}/${l}`])),
    },
  }))

  // Merge with existing entries (blog posts, projects) if sitemap already exists
  return [...homeEntries]
}
```

### Step 4: BlurFade audit

Scan all section components for missing BlurFade on section entry:

```bash
grep -rn "section id=" components/sections/ | grep -v BlurFade
```

Every section must wrap its eyebrow + h2 in at least one `<BlurFade delay={0}>`. Verify each section file visually.

### Step 5: `robots.txt`

Ensure `app/robots.ts` (or static `public/robots.txt`) allows all:

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/sitemap.xml`,
  }
}
```

### Step 6: Run smoke tests

```bash
npm run build
npx playwright test tests/smoke/ --reporter=list
```

Fix any regressions (i18n key parity, route 200s, etc.).

### Step 7: Full preview check

Start dev server and manually verify:
- [ ] `/en` — Hero loads, all 12 sections visible
- [ ] `/es` — Spanish strings render correctly
- [ ] Dock nav scrolls to sections, active icon updates
- [ ] Dark/light toggle works
- [ ] Lang toggle switches locale
- [ ] Contact form submits (or shows error gracefully)
- [ ] OG image renders at `/en/opengraph-image`

## Todo List

- [ ] Add `generateMetadata` to `app/[locale]/page.tsx`
- [ ] Create `app/[locale]/opengraph-image.tsx`
- [ ] Update `app/sitemap.ts` with home page entries for both locales
- [ ] Create/update `app/robots.ts`
- [ ] BlurFade audit — all sections have entry animation
- [ ] `npm run build` — zero errors
- [ ] `npx playwright test tests/smoke/` — all pass
- [ ] Manual preview check (12-point list above)

## Success Criteria

- [ ] `<title>` is `{shortName} — {role}` per locale
- [ ] OG image renders at `/{locale}/opengraph-image`
- [ ] Sitemap includes `/en` and `/es` home URLs
- [ ] All smoke tests pass (including i18n parity)
- [ ] No console errors in browser on full page scroll
- [ ] `npm run build` passes with zero warnings

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OG image `edge` runtime can't call Sanity | Low | Medium | Use ISR-compatible fetch with `{ next: { revalidate: 3600 } }` instead of `cache: 'no-store'` |
| Sitemap conflicts with existing sitemap route | Low | Low | Merge entries; check for existing `app/sitemap.ts` before creating |
| BlurFade causes layout shift (CLS) | Very Low | Low | BlurFade uses opacity only — no layout changes; CLS-safe |
| Smoke tests fail due to new i18n keys | Low | Medium | Phase 1 adds all keys; verify parity before running smoke tests |
