---
title: "Social Feed Dynamic Backend Wiring"
description: "Replace dummy social data with live Sanity CMS data. X and Reddit only. Dedicated adapter layer converts Sanity shape to frontend SocialItem."
status: complete
priority: P2
branch: "development"
tags: ["sanity", "social", "frontend"]
blockedBy: []
blocks: []
created: "2026-05-20T00:45:43.530Z"
createdBy: "ck:plan"
source: skill
---

# Social Feed Dynamic Backend Wiring

## Overview

The `SocialPostsGrid` section currently ignores the `posts` prop from Sanity and renders hardcoded `SOCIAL_DUMMY_ITEMS` instead. This plan wires the real Sanity data to the frontend via a dedicated adapter, expands the Sanity schema with a `postTitle` field for Reddit, and removes the dummy data.

**Scope decisions:**
- Platforms: X + Reddit only (no schema expansion for YouTube/TikTok/Instagram/Threads)
- Stats: manual entry in Sanity Studio
- Mapping: `lib/social-adapters.ts` dedicated transform function
- Filter tabs: dynamically show only platforms that have at least 1 item

## Outcome

Implemented Sanity-backed social feed rendering:

- Added optional Reddit `postTitle` field to `socialPost` schema
- Updated `getSocialPosts()` to project `body` as plain text with `pt::text()`
- Added `lib/social-adapters.ts` with `adaptSocialPost()` and `adaptSocialPosts()`
- Wired `SocialPostsGrid` to use the real `posts` prop
- Added empty states in English and Spanish
- Made `SocialFeedGrid` tabs derive from actual item platforms
- Removed `lib/social-dummy-data.ts`

Verification:

- `npm run typecheck` passed
- `npm run lint` passed
- `npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list` passed
- `npm run build` passed

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Schema & Query](./phase-01-schema-query.md) | Complete | 1h |
| 2 | [Adapter Layer](./phase-02-adapter-layer.md) | Complete | 1h |
| 3 | [Frontend Wiring & Cleanup](./phase-03-frontend-wiring-cleanup.md) | Complete | 1h |

## Key Files

| File | Change |
|------|--------|
| `sanity/schemas/social-post-type.ts` | Add `postTitle` field (Reddit post title) |
| `lib/sanity-queries.ts` | Update GROQ + `SocialPost` type to include `postTitle`, use `pt::text()` for body |
| `lib/social-adapters.ts` | **NEW** — `adaptSocialPost()` transform |
| `components/sections/SocialPostsGrid.tsx` | Use real `posts` prop + adapter |
| `components/ui/social-feed-grid.tsx` | Dynamic tab filtering (hide platforms with 0 items) |
| `lib/social-dummy-data.ts` | Delete |

## Dependencies

None — isolated to the social feature.
