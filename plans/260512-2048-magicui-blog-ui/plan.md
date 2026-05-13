---
title: "MagicUI-style blog UI (Sanity-powered)"
description: "Implement the visual design patterns of the MagicUI Pro Blog Template — featured hero post, animated card grid, client-side tag filter, and polished single-post layout — wired to the existing Sanity CMS + next-intl stack."
status: completed
priority: P2
branch: "development"
tags: [ui, blog, magic-ui, sanity, i18n]
blockedBy: []
blocks: [260512-1924-seo-canonical-hreflang-fix]
created: "2026-05-13T02:51:31.035Z"
completedAt: "2026-05-13"
createdBy: "ck:plan"
source: skill
---

# MagicUI-style blog UI (Sanity-powered)

## Problem

The MagicUI Pro Blog Template ships as an MDX-only Next.js starter — incompatible with the Sanity CMS + next-intl (en/es) setup. The current blog is a basic unstyled list.

**Goal:** Adopt the *visual and UX patterns* of the MagicUI blog (featured hero, card grid, tag filter, rich post typography) while keeping all content from Sanity and all routing through next-intl.

## Approach

- Phase 1: data layer — add `tags` to the `getPosts` list query (missing today)
- Phases 2–4: UI — new components + redesigned pages (implement phases 4 before 2/3 or alongside)
- Phase 5: metadata — convert `export const metadata` to `generateMetadata` with locale (overlaps with SEO plan 260512-1924 which handles the `localeAlternates` fix; this phase handles the blog-specific title/description/OG)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Enhance getPosts query for tag filtering](./phase-01-enhance-getposts-query-for-tag-filtering.md) | Completed |
| 2 | [Blog list page redesign](./phase-02-blog-list-page-redesign.md) | Completed |
| 3 | [Blog post page redesign](./phase-03-blog-post-page-redesign.md) | Completed |
| 4 | [New blog UI components](./phase-04-new-blog-ui-components.md) | Completed |
| 5 | [SEO metadata for blog pages](./phase-05-seo-metadata-for-blog-pages.md) | Completed |

## Files Changed

| File | Change |
|------|--------|
| `lib/sanity-queries.ts` | Add `tags` to `getPosts` GROQ + update `PostSummary` type |
| `app/[locale]/blog/page.tsx` | Full redesign — hero + grid + tag filter |
| `app/[locale]/blog/[slug]/page.tsx` | Full redesign — cover hero, author, tags, prose |
| `components/post-card.tsx` | Replace with `components/blog/blog-post-card.tsx` |
| `components/blog/blog-hero-post.tsx` | Create — featured post hero section |
| `components/blog/blog-tag-filter.tsx` | Create — client-side tag filter |
| `components/blog/blog-post-card.tsx` | Create — polished post card |

## Notes

- **No new dependencies required** — `BlurFade`, `MagicCard`, `Chip` are already installed
- Tag filter is client-side (no URL params needed for MVP)
- Phase 5 partially overlaps SEO plan 260512-1924 — coordinate so blog metadata changes aren't done twice
- Execution completed on 2026-05-13: blog summaries now include tags and author images, the list page renders a featured hero plus filtered animated grid, and post pages render cover imagery, author metadata, tags, localized dates, and Open Graph cover images.
- Verification passed: `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.
