---
title: Sanity Presentation Tool — Production Live Preview
description: >-
  Make Sanity Presentation Tool (live preview) fully functional in production on
  emudev.cc by fixing frame policy, setting Vercel env vars, and hardening the
  draft-mode route.
status: pending
priority: P1
effort: 2h
branch: development
tags:
  - sanity
  - cms
  - preview
  - vercel
  - security
blockedBy: []
blocks: []
created: '2026-05-10T16:29:43.366Z'
createdBy: 'ck:plan'
source: skill
---

# Sanity Presentation Tool — Production Live Preview

## Overview

Sanity's Presentation Tool requires the site to be iframeable by the studio, a live-preview URL pointing to production, and a shared secret to enable draft mode. The studio is embedded at `https://emudev.cc/studio` via `NextStudio`. Three issues block production live preview:

1. **`X-Frame-Options: DENY`** in production `next.config.ts` prevents the studio from framing the site.
2. **`SANITY_STUDIO_PREVIEW_URL`** not set → studio points to `http://localhost:3000` in production build.
3. **`SANITY_STUDIO_REVALIDATE_SECRET`** not set → draft-mode enable URL has empty secret.
4. **`SANITY_API_READ_TOKEN`** missing → draft mode enabled but draft content not fetched.
5. **`hasSanityToken` bypass** in draft-mode route accepts any string as valid Sanity token.

## Phases

| Phase | Name | Status | Effort | Depends On |
|-------|------|--------|--------|------------|
| 1 | [Fix Frame Policy](./phase-01-fix-frame-policy.md) | Completed | 15m | — |
| 2 | [Set Vercel Env Vars](./phase-02-set-vercel-env-vars.md) | Completed | 30m | — |
| 3 | [Secure Draft-Mode Route](./phase-03-secure-draft-mode-route.md) | Completed | 45m | 2 |
| 4 | [E2E Verification](./phase-04-e2e-verification.md) | Pending | 30m | 1, 2, 3 |

Phases 1 and 2 are independent; Phase 3 depends on 2 (needs the token); Phase 4 validates all.

## Key Files

| File | Change |
|------|--------|
| `next.config.ts` | Replace `X-Frame-Options: DENY` with CSP `frame-ancestors 'self'` in prod |
| `app/api/draft-mode/enable/route.ts` | Validate Sanity token via `@sanity/preview-url-secret` |
| Vercel dashboard / CLI | Set `SANITY_STUDIO_PREVIEW_URL`, `SANITY_STUDIO_REVALIDATE_SECRET`, `SANITY_API_READ_TOKEN` |

## Dependencies

- No new npm packages required (Phase 3 adds `@sanity/preview-url-secret` — already a transitive dep of `next-sanity`)
- `SANITY_REVALIDATE_SECRET` already set in Vercel production env (per Phase 6 plan)
- Overlapping plan: `plans/260507-1641-personal-portfolio/phase-06-vercel-cloudflare-infrastructure.md` (env secret matrix)
