---
phase: 1
title: Fix Frame Policy
status: completed
priority: P1
effort: 15m
dependencies: []
---

# Phase 1: Fix Frame Policy

## Overview

In production, `next.config.ts` sets `X-Frame-Options: DENY` which blocks ALL framing. The Presentation Tool needs to iframe `emudev.cc` inside the studio at `emudev.cc/studio`. Replacing with CSP `frame-ancestors 'self'` allows same-origin framing while keeping cross-origin framing blocked.

## Requirements

- Functional: Presentation Tool can frame `emudev.cc` pages from `emudev.cc/studio`
- Non-functional: Cross-origin framing still blocked (same security level as `X-Frame-Options: SAMEORIGIN`)

## Architecture

```
browser
  └── emudev.cc/studio        ← studio iframe parent (same origin)
        └── <iframe src="emudev.cc/..."> ← framed page
```

`frame-ancestors 'self'` = only the same origin (`emudev.cc`) may frame the page. Equivalent security to `X-Frame-Options: SAMEORIGIN`.

Note: `frame-ancestors` in CSP overrides `X-Frame-Options` in all modern browsers. Setting both is redundant — CSP takes precedence.

## Related Code Files

- Modify: `next.config.ts`

## Implementation Steps

1. Open `next.config.ts`
2. Locate the `securityHeaders` array (top of file)
3. Replace the production branch of the ternary:

```ts
// Before
isDev
  ? { key: 'Content-Security-Policy', value: "frame-ancestors 'self' http://localhost:3333" }
  : { key: 'X-Frame-Options', value: 'DENY' }

// After
isDev
  ? { key: 'Content-Security-Policy', value: "frame-ancestors 'self' http://localhost:3333" }
  : { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" }
```

4. Run `npm run typecheck` — no type changes expected
5. Run `npm run build` locally to confirm header is set correctly

## Success Criteria

- [x] `next.config.ts` uses `Content-Security-Policy: frame-ancestors 'self' https://emudev.cc` in production (not `X-Frame-Options: DENY`)
- [x] `npm run build` succeeds
- [x] No other security headers removed or changed

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Third-party clickjacking via same-origin iframes | Low | Studio at `/studio` is protected by Sanity auth; no public embedable content |
| `X-Frame-Options` header also present (conflict) | None | We're replacing it, not adding to it |
