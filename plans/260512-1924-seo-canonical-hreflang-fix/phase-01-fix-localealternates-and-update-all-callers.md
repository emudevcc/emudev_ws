---
phase: 1
title: "Fix localeAlternates and update all callers"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Fix localeAlternates and update all callers

## Overview

Add a `locale` parameter to `localeAlternates()` so canonical is self-referential per locale. Convert pages using static `export const metadata` to `generateMetadata` so they can forward the locale. All changes are in metadata generation only — no UI changes.

## Requirements

- **Functional:** Every locale page emits a canonical matching its own locale URL (`/es/...` → canonical `/es/...`)
- **Non-functional:** Zero TypeScript errors; `npm run lint` clean; `npm run build` passes

## Related Code Files

- Modify: `lib/metadata.ts`
- Modify: `app/[locale]/layout.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `app/[locale]/about/page.tsx`
- Modify: `app/[locale]/projects/page.tsx`
- Modify: `app/[locale]/contact/page.tsx`
- Modify: `app/[locale]/blog/page.tsx`
- Modify: `app/[locale]/blog/[slug]/page.tsx`
- Modify: `app/[locale]/projects/[slug]/page.tsx`

## Implementation Steps

### Step 1: Update `lib/metadata.ts`

Add optional `locale` param. When provided, canonical is the current-locale path; `x-default` is always the default locale:

```typescript
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

export function localeAlternates(
  pathname = '',
  locale: string = routing.defaultLocale
): Metadata['alternates'] {
  const normalizedPath = pathname ? `/${pathname.replace(/^\/+/, '')}` : ''
  const defaultPath = `/${routing.defaultLocale}${normalizedPath}`

  return {
    canonical: `/${locale}${normalizedPath}`,   // self-referential for current locale
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}${normalizedPath}`])
      ),
      'x-default': defaultPath,
    },
  }
}
```

### Step 2: Update `app/[locale]/layout.tsx`

Pass locale to `localeAlternates()`:

```tsx
export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale)
  // ...
  return {
    // ...
    alternates: localeAlternates('', locale),   // was: localeAlternates()
    // ...
  }
}
```

### Step 3: Update `app/[locale]/page.tsx`

Replace manual `alternates` object with `localeAlternates()`:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return {
    title: settings ? `${settings.shortName ?? settings.siteName} - ${settings.role}` : 'Portfolio',
    description: settings?.tagline ?? settings?.description ?? '',
    openGraph: { ... },
    alternates: localeAlternates('', locale),  // replaces manual { canonical, languages }
  }
}
```

Add import: `import { localeAlternates } from '@/lib/metadata'`

### Step 4: Convert static-metadata pages to `generateMetadata`

Pages using `export const metadata` can't read `params.locale`. Convert each to `generateMetadata`:

**`app/[locale]/about/page.tsx`:**
```tsx
import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'About',
    description: 'About Esteban Montero — software engineer',
    alternates: localeAlternates('/about', locale),
  }
}
```

Apply the same pattern to `contact/page.tsx`, `projects/page.tsx`, `blog/page.tsx`.

### Step 5: Update dynamic `[slug]` pages

`app/[locale]/blog/[slug]/page.tsx` and `app/[locale]/projects/[slug]/page.tsx` already use `generateMetadata`. Find where they call `localeAlternates` and pass `locale`:

```tsx
alternates: localeAlternates(`/projects/${slug}`, locale),
```

### Step 6: Verify

```bash
npm run typecheck   # zero errors
npm run lint        # zero warnings
npm run build       # passes
```

Then deploy and rerun Lighthouse on `https://www.emudev.cc/es` and `https://www.emudev.cc/en`:
- Canonical on `/es` should be `https://www.emudev.cc/es`
- Canonical on `/en` should be `https://www.emudev.cc/en`
- Both have hreflang `{ en, es, x-default: /en }`
- Lighthouse "canonical" audit should pass

## Todo List

- [x] Update `lib/metadata.ts` — add `locale` param, self-referential canonical
- [x] Update `app/[locale]/layout.tsx` — pass locale to `localeAlternates()`
- [x] Update `app/[locale]/page.tsx` — use `localeAlternates('', locale)`, remove manual alternates
- [x] Convert `app/[locale]/about/page.tsx` to `generateMetadata`
- [x] Convert `app/[locale]/projects/page.tsx` to `generateMetadata`
- [x] Convert `app/[locale]/contact/page.tsx` to `generateMetadata`
- [x] Convert `app/[locale]/blog/page.tsx` to `generateMetadata`
- [x] Update `app/[locale]/blog/[slug]/page.tsx` — pass locale to `localeAlternates()`
- [x] Update `app/[locale]/projects/[slug]/page.tsx` — pass locale to `localeAlternates()`
- [x] `npm run typecheck` — zero errors
- [x] `npm run lint` — zero warnings
- [x] `npm run build` — passes

## Success Criteria

- [x] `/es/about` canonical = `https://www.emudev.cc/es/about` (not `/en/about`)
- [x] `/en/about` canonical = `https://www.emudev.cc/en/about`
- [x] All locale pages have `x-default: /en` hreflang
- [x] Lighthouse SEO audit: no canonical errors
- [x] `npm run build` passes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Static `metadata` export can't read runtime locale | Known | High | Convert to `generateMetadata` — already done by 4 of 9 pages |
| `[slug]` pages already call `localeAlternates` incorrectly | Low | Medium | Grep for all `localeAlternates` calls and verify each passes locale |
| Breaking existing hreflang smoke tests | Low | Low | Tests check structure, not locale value — verify after changes |
