---
phase: 2
title: "Adapter Layer"
status: complete
priority: P2
effort: "1h"
dependencies: [phase-01-schema-query]
---

# Phase 2: Adapter Layer

## Overview

Create `lib/social-adapters.ts` with a pure `adaptSocialPost()` function that transforms a Sanity `SocialPost` into the frontend `SocialItem` shape expected by `SocialFeedGrid`. Includes a relative-time formatter for `postedAt`.

## Requirements

- Functional:
  - `adaptSocialPost(post: SocialPost): SocialItem` — maps every field
  - Platform-aware mapping: X posts use `text`/`handle`; Reddit posts use `postTitle`/`subreddit`/`upvotes`
  - `postedAt` ISO datetime → human-readable relative string (e.g. "3 days ago")
  - `permalink` → `url`; fall back to `'#'` when missing
  - Stats: `likes → likes`, `replies → comments`, `reposts → shares`
  - `adaptSocialPosts(posts: SocialPost[]): SocialItem[]` — batch helper
- Non-functional:
  - Pure functions — no side effects, no imports from React or Next
  - No external date library — use `Intl.RelativeTimeFormat` (built-in)

## Architecture

```
lib/sanity-queries.ts
  SocialPost (Sanity shape)
       │
       ▼
lib/social-adapters.ts
  adaptSocialPost()
       │
       ▼
components/ui/social-feed-grid.tsx
  SocialItem (frontend shape)
```

## Related Code Files

- Create: `lib/social-adapters.ts`

## Implementation Steps

1. **Create `lib/social-adapters.ts`**:

```ts
import type { SocialPost } from '@/lib/sanity-queries'
import type { SocialItem } from '@/components/ui/social-feed-grid'

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

function relativeTime(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000 // seconds, negative = past
  const abs = Math.abs(diff)
  if (abs < 60)   return rtf.format(Math.round(diff), 'second')
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), 'day')
  if (abs < 31536000) return rtf.format(Math.round(diff / 2592000), 'month')
  return rtf.format(Math.round(diff / 31536000), 'year')
}

export function adaptSocialPost(post: SocialPost): SocialItem {
  const platform = (post.platform ?? 'x') as SocialItem['platform']
  const postedAt = post.postedAt ? relativeTime(post.postedAt) : ''

  return {
    id: post._id,
    platform,
    url: post.permalink ?? '#',
    postedAt,
    // text post fields (x + reddit body)
    text: post.body ?? undefined,
    handle: post.handle ?? undefined,
    // reddit-specific
    postTitle: post.postTitle ?? undefined,
    subreddit: post.subreddit ?? undefined,
    upvotes: post.stats?.likes ?? undefined,   // reddit uses likes as upvotes
    // engagement (shared)
    likes: platform !== 'reddit' ? (post.stats?.likes ?? undefined) : undefined,
    comments: post.stats?.replies ?? undefined,
    shares: post.stats?.reposts ?? undefined,
  }
}

export function adaptSocialPosts(posts: SocialPost[]): SocialItem[] {
  return posts.map(adaptSocialPost)
}
```

**Notes:**
- Reddit upvotes come from `stats.likes` (reused field — Sanity schema has no separate upvotes field)
- X posts: `likes` is populated, `upvotes` is not
- `body` from Phase 1 is already plain text (via `pt::text()` in GROQ), so no PortableText processing here

## Success Criteria

- [x] `lib/social-adapters.ts` exists and exports `adaptSocialPost` + `adaptSocialPosts`
- [x] `adaptSocialPost` correctly maps X fields: `text`, `handle`, `likes`, `comments`, `shares`
- [x] `adaptSocialPost` correctly maps Reddit fields: `postTitle`, `subreddit`, `upvotes`, `text`
- [x] `relativeTime` returns human-readable strings for past dates
- [x] TypeScript check passes with no errors

## Verification

- Added `lib/social-adapters.ts` with platform normalization, relative-time formatting, and X/Reddit field mapping.
- Ran `npm run typecheck`, `npm run lint`, and `npm run build` successfully.

## Risk Assessment

- **`Intl.RelativeTimeFormat`**: Available in Node 12+ and all modern browsers. No risk.
- **Reddit upvotes via `stats.likes`**: Unconventional reuse but avoids schema changes. Document clearly in code comment.
