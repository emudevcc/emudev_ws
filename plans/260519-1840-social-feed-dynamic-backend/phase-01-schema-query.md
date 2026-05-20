---
phase: 1
title: "Schema & Query"
status: complete
priority: P2
effort: "1h"
dependencies: []
---

# Phase 1: Schema & Query

## Overview

Expand the Sanity `socialPost` schema with a `postTitle` field (needed for Reddit posts) and update the GROQ query to use `pt::text()` for the body field so the adapter receives a plain string, not a raw PortableText array.

## Requirements

- Functional:
  - `postTitle` field in Sanity schema for Reddit post titles (hidden for X platform)
  - `SocialPost` TypeScript type updated to include `postTitle?: string`
  - GROQ query projects `body` as plain text via `pt::text()` to avoid shipping PortableText to the adapter
- Non-functional:
  - Schema change is backward-compatible (field is optional, no migration needed)
  - Cache key unchanged (still `localized-v5`)

## Architecture

```
Sanity Studio
  socialPost document
    platform: 'x' | 'reddit'
    handle: string
    postTitle?: string   ← NEW (reddit only, hidden for x)
    subreddit?: string   (reddit only)
    body: PortableText   → projected as pt::text() in GROQ
    postedAt: datetime
    permalink: url
    stats: { likes, replies, reposts }
    featured: boolean
```

## Related Code Files

- Modify: `sanity/schemas/social-post-type.ts`
- Modify: `lib/sanity-queries.ts` (GROQ projection + TypeScript type)

## Implementation Steps

1. **Add `postTitle` to schema** (`sanity/schemas/social-post-type.ts`):
   ```ts
   defineField({
     name: 'postTitle',
     title: 'Post Title',
     type: 'string',
     description: 'Reddit post title (leave blank for X/Twitter)',
     hidden: ({ parent }) => parent?.platform !== 'reddit',
   }),
   ```
   Insert after the `subreddit` field.

2. **Update GROQ projection** in `getSocialPosts` (`lib/sanity-queries.ts`):
   ```groq
   *[_type == "socialPost"] | order(postedAt desc) {
     _id,
     platform,
     handle,
     postTitle,
     subreddit,
     "body": pt::text(coalesce(body[$locale], body.en)),
     postedAt,
     permalink,
     stats,
     featured
   }
   ```
   The `pt::text()` call converts PortableText to a plain string server-side — no PortableText processing needed in the adapter.

3. **Update `SocialPost` TypeScript type**:
   ```ts
   export type SocialPost = {
     _id: string
     platform?: string
     handle?: string
     postTitle?: string   // ← add
     subreddit?: string
     body?: string        // ← was unknown[], now plain string from pt::text()
     postedAt?: string
     permalink?: string
     stats?: { likes?: number; replies?: number; reposts?: number }
     featured?: boolean
   }
   ```

## Success Criteria

- [x] `postTitle` field visible in Sanity Studio for Reddit posts, hidden for X
- [x] `SocialPost.body` is `string | undefined` (not `unknown[]`)
- [x] TypeScript check passes (`npm run typecheck`)
- [ ] GROQ query returns `body` as plain text string in dev console / Sanity Vision

## Verification

- Updated `sanity/schemas/social-post-type.ts` with optional Reddit-only `postTitle`.
- Updated `lib/sanity-queries.ts` so `SocialPost.body` is typed as `string` and GROQ uses `pt::text(coalesce(body[$locale], body.en))`.
- Ran `npm run typecheck`, `npm run lint`, and `npm run build` successfully.
- Sanity Vision was not manually opened in this pass.

## Risk Assessment

- **`pt::text()` availability**: Supported in Sanity GROQ v2+ (in use). No risk.
- **Body type change**: `body` goes from `unknown[]` to `string` in the TypeScript type. Any existing code reading `body` as an array will break — but currently only `getSocialPosts` uses it, and the adapter (Phase 2) will consume the string directly.
