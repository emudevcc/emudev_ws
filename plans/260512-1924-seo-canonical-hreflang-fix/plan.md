---
title: "SEO canonical fix: locale-aware hreflang"
description: "Fix Lighthouse 'canonical points to another hreflang location' by making localeAlternates locale-aware and converting static metadata exports to generateMetadata on all locale pages"
status: completed
priority: P1
branch: "development"
tags: [seo, i18n, metadata]
blockedBy: []
blocks: [260512-2048-magicui-blog-ui]
created: "2026-05-13T01:29:45.099Z"
createdBy: "ck:plan"
source: skill
---

# SEO canonical fix: locale-aware hreflang

## Problem

Lighthouse audit: **"Document does not have a valid rel=canonical — Points to another hreflang location (https://www.emudev.cc/en)"**

### Root cause

`localeAlternates(pathname)` in `lib/metadata.ts` always sets `canonical` to the **default locale path** (`/en/...`), regardless of which locale the page is currently serving.

Example — `/es/about` page currently emits:
```html
<link rel="canonical" href="https://www.emudev.cc/en/about" />   <!-- WRONG: English URL! -->
<link rel="alternate" hreflang="en" href="https://www.emudev.cc/en/about" />
<link rel="alternate" hreflang="es" href="https://www.emudev.cc/es/about" />
```

Lighthouse sees: "canonical points to `/en/about` which is already listed as the `en` hreflang URL — it's not self-referential for `/es/about`." → Invalid.

### Correct pattern

Each locale URL must have a **self-referential canonical** matching its own locale path:
```html
<!-- On /es/about -->
<link rel="canonical" href="https://www.emudev.cc/es/about" />
<link rel="alternate" hreflang="en" href="https://www.emudev.cc/en/about" />
<link rel="alternate" hreflang="es" href="https://www.emudev.cc/es/about" />
<link rel="alternate" hreflang="x-default" href="https://www.emudev.cc/en/about" />
```

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Fix localeAlternates and update all callers](./phase-01-fix-localealternates-and-update-all-callers.md) | Completed |

## Files

| File | Change |
|------|--------|
| `lib/metadata.ts` | Add `locale` param; canonical = `/${locale}${path}` |
| `app/[locale]/layout.tsx` | Pass locale to `localeAlternates()` |
| `app/[locale]/page.tsx` | Replace manual alternates with `localeAlternates('', locale)` |
| `app/[locale]/about/page.tsx` | `export const metadata` → `generateMetadata` with locale |
| `app/[locale]/projects/page.tsx` | Same conversion |
| `app/[locale]/contact/page.tsx` | Same conversion |
| `app/[locale]/blog/page.tsx` | ~~Same conversion~~ — **handled by plan 260512-2048-magicui-blog-ui phase 2** |
| `app/[locale]/blog/[slug]/page.tsx` | ~~Pass locale~~ — **handled by plan 260512-2048-magicui-blog-ui phase 3** |
| `app/[locale]/projects/[slug]/page.tsx` | Pass locale to `localeAlternates()` call |

## Completion Notes

- `localeAlternates(pathname, locale)` now emits a self-referential canonical for the active locale and keeps `x-default` on the default English URL.
- Static locale page metadata was converted to `generateMetadata` where needed.
- Dynamic blog/project slug pages now include locale-aware alternates.
- Verified rendered `/es/about` includes canonical `https://www.emudev.cc/es/about` plus `en`, `es`, and `x-default` alternates.
