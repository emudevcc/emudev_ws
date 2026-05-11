---
phase: 3
title: Secure Draft-Mode Route
status: completed
priority: P1
effort: 45m
dependencies:
  - 2
---

# Phase 3: Secure Draft-Mode Route

## Overview

The current draft-mode enable route has a security hole: `hasSanityToken = Boolean(sanityPreviewSecret)` accepts ANY non-empty string as a valid Sanity token — no validation. Combined with `SANITY_API_READ_TOKEN` now being set (Phase 2), this means anyone who passes `?sanity-preview-secret=foo` can enable draft mode and trigger draft content fetches. Fix by validating the Sanity token using `@sanity/preview-url-secret` (already a transitive dep via `next-sanity`).

## Requirements

- Functional: Presentation Tool's Sanity-generated short-lived tokens are validated server-side
- Functional: Static secret path (`?secret=`) still works as fallback
- Non-functional: No arbitrary string enables draft mode

## Architecture

### Current flow (insecure)
```
Presentation Tool → GET /api/draft-mode/enable?sanity-preview-secret=<token>
  → hasSanityToken = Boolean(token) → always true if non-empty
  → draft mode enabled regardless of token validity
```

### Fixed flow
```
Presentation Tool → GET /api/draft-mode/enable?sanity-preview-secret=<token>
  → validatePreviewUrl(sanityClient, req.url)
      → calls sanity.io to verify token is valid + not expired
  → if valid: enable draft mode + redirect
  → if invalid: 401
```

### How `@sanity/preview-url-secret` works

Sanity generates short-lived secrets stored in the Sanity dataset itself. `validatePreviewUrl` fetches the secret document from Sanity using `SANITY_API_READ_TOKEN` and compares it. This means:
- Token is time-limited (expires after ~1h by default)
- Token is tied to a specific dataset/project
- Arbitrary strings are rejected

## Related Code Files

- Modify: `app/api/draft-mode/enable/route.ts`
- Read: `lib/sanity-client.ts` (reuse client config)

## Implementation Steps

### 1. Verify `@sanity/preview-url-secret` is available

```bash
node -e "require('@sanity/preview-url-secret')" 2>/dev/null && echo "available" || echo "missing"
# If missing: npm install @sanity/preview-url-secret
```

It ships as part of `next-sanity` dependencies — should already be present.

### 2. Update `app/api/draft-mode/enable/route.ts`

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { sanityClient } from '@/lib/sanity-client'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const secret = searchParams.get('secret')
  const redirectUrl =
    searchParams.get('redirect') ?? searchParams.get('sanity-preview-pathname') ?? '/'

  // Path 1: static secret (webhook-style, e.g. manual testing)
  if (secret) {
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const safePath = redirectUrl.startsWith('/') ? redirectUrl : '/'
    const draft = await draftMode()
    draft.enable()
    redirect(safePath)
  }

  // Path 2: Sanity Presentation Tool short-lived token
  const { isValid, redirectTo } = await validatePreviewUrl(
    sanityClient.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
    req.url
  )
  if (!isValid) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const safePath = (redirectTo ?? redirectUrl).startsWith('/') ? (redirectTo ?? redirectUrl) : '/'
  const draft = await draftMode()
  draft.enable()
  redirect(safePath)
}
```

### 3. Run typecheck

```bash
npm run typecheck
```

### 4. Test locally with static secret (quick sanity check)

```bash
# Start dev server
npm run dev

# Test static secret path
curl -I "http://localhost:3000/api/draft-mode/enable?secret=<your-secret>&redirect=/"
# Expect: 307 redirect (not 401)

# Test rejection of arbitrary token
curl -I "http://localhost:3000/api/draft-mode/enable?sanity-preview-secret=garbage"
# Expect: 401
```

## Success Criteria

- [x] `validatePreviewUrl` used for Sanity-generated tokens (no `Boolean()` bypass)
- [x] Static secret path (`?secret=`) still returns 307 redirect with correct secret
- [x] Arbitrary `?sanity-preview-secret=anything` returns 401
- [x] `npm run typecheck` passes
- [ ] `npm run build` succeeds

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `SANITY_API_READ_TOKEN` not set → `validatePreviewUrl` throws | High | Phase 2 must complete first; add guard log if token missing |
| `@sanity/preview-url-secret` not installed | Medium | Check in Step 1; install if missing |
| `validatePreviewUrl` API changes between versions | Low | Pinned via `next-sanity` transitive dep; test after upgrade |
