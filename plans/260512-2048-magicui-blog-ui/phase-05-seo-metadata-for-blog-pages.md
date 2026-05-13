---
phase: 5
title: "SEO metadata for blog pages"
status: pending
priority: P2
effort: "20m"
dependencies: [2, 3]
---

# Phase 5: SEO metadata for blog pages

## Overview

Both blog pages need `generateMetadata` with locale-aware `localeAlternates()`. Phases 2 and 3 already implement this as part of the redesign — this phase is a verification + coordination checkpoint against the SEO canonical plan (260512-1924).

## Requirements

- Functional: `/en/blog` canonical = `/en/blog`; `/es/blog` canonical = `/es/blog`; post pages likewise self-referential
- Non-functional: no duplicate work with SEO plan 260512-1924 phase 1

## Related Code Files

- Verify: `app/[locale]/blog/page.tsx` — `generateMetadata` added in phase 2
- Verify: `app/[locale]/blog/[slug]/page.tsx` — `generateMetadata` updated in phase 3

## Cross-Plan Coordination

SEO plan `260512-1924` phase 1 lists these two files in its "Related Code Files":

```
- Modify: `app/[locale]/blog/page.tsx`
- Modify: `app/[locale]/blog/[slug]/page.tsx`
```

**Resolution:**
- This plan (blog UI redesign) handles the full page rewrites including `generateMetadata`.
- SEO plan 260512-1924 should mark these two files as **already handled** when it runs.
- The only remaining work for SEO plan on these files: confirm `localeAlternates('/blog', locale)` and `localeAlternates('/blog/${slug}', locale)` are called with `locale` (done in phases 2 and 3 of this plan).

## Implementation Steps

### Step 1: Verify blog list page metadata

In `app/[locale]/blog/page.tsx` (written in phase 2):

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Blog',
    description: 'Thoughts and articles by Esteban Montero',
    alternates: localeAlternates('/blog', locale),  // ✓ locale passed
  }
}
```

### Step 2: Verify blog post page metadata

In `app/[locale]/blog/[slug]/page.tsx` (written in phase 3):

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: localeAlternates(`/blog/${slug}`, locale),  // ✓ locale passed
    openGraph: post.cover ? { images: [{ url: post.cover }] } : undefined,
  }
}
```

### Step 3: Full verification

```bash
npm run typecheck
npm run lint
npm run build
```

Then after deploy, check rendered `<head>` on `/en/blog` and `/es/blog`:
- `<link rel="canonical">` should match the page's own locale URL
- Both `en` and `es` hreflang links present
- `x-default` → `/en/blog`

## Todo List

- [ ] Confirm `localeAlternates('/blog', locale)` in blog list page
- [ ] Confirm `localeAlternates('/blog/${slug}', locale)` in blog post page
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — passes
- [ ] Update SEO plan 260512-1924 to note blog pages handled here

## Success Criteria

- [ ] `/es/blog` canonical = `https://www.emudev.cc/es/blog`
- [ ] `/en/blog` canonical = `https://www.emudev.cc/en/blog`
- [ ] Blog post pages have self-referential canonical per locale
- [ ] No Lighthouse "canonical points to another hreflang location" on blog pages
