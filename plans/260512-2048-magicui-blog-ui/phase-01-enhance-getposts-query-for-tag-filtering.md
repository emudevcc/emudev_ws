---
phase: 1
title: "Enhance getPosts query for tag filtering"
status: pending
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Enhance getPosts query for tag filtering

## Overview

The `getPosts` GROQ query currently omits `tags`. The blog list page needs tags on each post summary to drive the client-side tag filter. Update the query + `PostSummary` type.

## Requirements

- Functional: `getPosts()` returns `tags[]` on each post (same shape as `getPostBySlug`)
- Non-functional: zero TypeScript errors, no cache-key collision

## Related Code Files

- Modify: `lib/sanity-queries.ts` — `getPosts` GROQ + `PostSummary` type

## Implementation Steps

### Step 1: Update `PostSummary` type

```typescript
// lib/sanity-queries.ts
export type PostSummary = {
  _id: string
  title?: string
  slug?: LocalizedSlug
  excerpt?: string
  cover?: string
  publishedAt?: string
  readingMinutes?: number
  status?: string
  _createdAt: string
  author?: { name?: string; image?: string }  // add image
  tags?: Array<{ _id: string; title?: string }>  // ADD THIS
}
```

### Step 2: Update `getPosts` GROQ

Add `tags` projection (same pattern as `getPostBySlug`):

```groq
*[_type == "post"] | order(publishedAt desc) {
  _id,
  "title": coalesce(title[$locale], title.en),
  "slug": { "current": coalesce(slug[$locale].current, slug.en.current) },
  "excerpt": coalesce(excerpt[$locale], excerpt.en),
  "cover": cover.asset->url,
  publishedAt,
  readingMinutes,
  status,
  _createdAt,
  "author": author->{ "name": coalesce(name[$locale], name.en), "image": image.asset->url },
  "tags": tags[]->{ _id, "title": coalesce(title[$locale], title.en) }
}
```

### Step 3: Verify

```bash
npm run typecheck
```

## Todo List

- [ ] Add `tags` to `PostSummary` type
- [ ] Add `image` to `author` in `PostSummary` type
- [ ] Add `tags[]->` projection to `getPosts` GROQ query
- [ ] `npm run typecheck` — zero errors

## Success Criteria

- [ ] `PostSummary.tags` typed as `Array<{ _id: string; title?: string }> | undefined`
- [ ] `getPosts()` returns tags array in runtime data
- [ ] TypeScript: zero errors
