---
title: "Bilingual i18n (en/es)"
description: "Add English + Spanish support with /en/ and /es/ URL prefixes using next-intl, Sanity localized fields, and hreflang SEO."
status: completed
priority: P2
branch: "development"
tags: [i18n, next-intl, sanity]
blockedBy: []
blocks: []
created: "2026-05-10T20:03:47.019Z"
createdBy: "ck:plan"
source: skill
---

# Bilingual i18n (en/es)

## Overview

Add English + Spanish support to the portfolio. All public pages serve under `/en/` and `/es/` URL prefixes. UI strings use `next-intl`. Sanity CMS content is bilingual via localized object fields (one document, nested `{ en, es }` values). SEO covered with hreflang alternates and locale-aware sitemap.

**Approach:** `next-intl` (App Router native, no pages-router hacks). Localized fields in Sanity (not separate documents per locale — simpler for a single-author portfolio). No `@sanity/document-internationalization` plugin needed.

## Architecture Summary

```
/              → redirect to /en (default locale)
/en/           → English home
/es/           → Spanish home
/en/blog/slug  → English blog post
/es/blog/slug  → Spanish blog post (Spanish slug)

app/
├── [locale]/           ← all public pages (en | es)
│   ├── layout.tsx      ← NextIntlClientProvider + lang=locale
│   ├── page.tsx
│   ├── about/page.tsx
│   ├── blog/[slug]/page.tsx
│   ├── contact/page.tsx
│   └── projects/[slug]/page.tsx
├── layout.tsx          ← minimal root (html/body shell only)
├── page.tsx            ← redirect to /en
├── api/                ← unchanged (no locale prefix)
├── studio/             ← unchanged
├── sitemap.ts          ← generates /en/ + /es/ entries
└── robots.ts           ← unchanged

middleware.ts            ← next-intl locale detection + redirect
i18n/
├── routing.ts           ← defineRouting({ locales: ['en','es'], defaultLocale: 'en' })
└── request.ts           ← getRequestConfig for server components
messages/
├── en.json
└── es.json
```

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [next-intl Setup + Route Migration](./phase-01-next-intl-setup-route-migration.md) | Completed | 2h |
| 2 | [UI String Extraction](./phase-02-ui-string-extraction.md) | Completed | 2h |
| 3 | [Sanity Bilingual Content](./phase-03-sanity-bilingual-content.md) | Completed | 3h |
| 4 | [SEO & Sitemap](./phase-04-seo-sitemap.md) | Completed | 1h |

## Progress Update — 2026-05-10

Completed:
- Installed and configured `next-intl` with explicit `/en` and `/es` locale prefixes.
- Moved public pages under `app/[locale]` and kept API/Studio routes outside the locale prefix.
- Added locale-aware navigation helpers, middleware, message files, and the locale switcher.
- Converted Sanity schemas to localized `{ en, es }` fields for posts, projects, tags, authors, and site settings.
- Updated Sanity GROQ queries to accept locale, use English fallback via `coalesce`, and resolve both English and Spanish slugs.
- Regenerated Sanity TypeScript types.
- Migrated existing published Sanity project/post/author content into the new English fields using `SANITY_API_WRITE_TOKEN`.
- Fixed frontend Sanity fetching when `.env.local` has blank public Sanity values.
- Updated internal project/blog/hero links to preserve the active locale.
- Updated sitemap generation to emit canonical `/en/...` and `/es/...` URLs.
- Verified `npm run build`, `npx tsc --noEmit`, and local runtime checks for localized sitemap and Spanish homepage links.

Remaining:
- None — all phases are closed.

## Key Decisions

- **next-intl** over next-i18next / react-i18next — native App Router support, no client-only limitation
- **Localized object fields** in Sanity over separate-document-per-locale — simpler for single-author; no plugin required
- **Slug per locale** — each content type gets `slug.en.current` and `slug.es.current`, allowing Spanish URLs like `/es/blog/mi-articulo`
- **Default locale** = `en` — `/` redirects to `/en`; middleware never strips the prefix (always explicit)
- **Studio + API** stay at root paths (no locale prefix)

## Dependencies

<!-- None — standalone plan -->
