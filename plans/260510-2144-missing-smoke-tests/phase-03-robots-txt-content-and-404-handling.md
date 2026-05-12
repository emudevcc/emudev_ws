---
phase: 3
title: "robots.txt Content and 404 Handling"
status: pending
priority: P2
effort: "30m"
dependencies: []
---

# Phase 3: robots.txt Content and 404 Handling

## Overview

Create `tests/smoke/robots-and-404.spec.ts`. Two small gaps in existing coverage:

1. `pages.spec.ts` checks `GET /robots.txt` returns 200 — nothing more. The disallow rules for `/studio` and `/api` (sensitive admin surfaces) are never validated.
2. No test anywhere confirms that an unknown URL returns 404 instead of silently serving a 200 or crashing with 500.

Both are integration-only (need a running server).

## Requirements

- Functional: robots.txt body must disallow `/studio` and `/api`
- Functional: robots.txt body must reference the sitemap URL
- Functional: a clearly non-existent path must return 404
- Non-functional: static contract for robots.ts source (no server required)

## Architecture

**Static contract** — reads `app/robots.ts` and asserts the disallow array contains `/studio` and `/api`.

**Integration tests** — guarded by `SMOKE_ROBOTS_INTEGRATION=1`:
- Parse robots.txt response text, assert `Disallow: /studio` and `Disallow: /api` are present
- Assert `Sitemap:` line is present
- GET a clearly non-existent path and expect 404

**404 path strategy:** use `/this-page-does-not-exist-smoke-test` — avoids any possible match in the app router. The locale middleware matcher excludes `api`, `studio`, `_next`, and files with extensions, so this path goes through next-intl middleware which will redirect to `/en/this-page-does-not-exist-smoke-test` — that should resolve to the `[locale]` catch-all and return 404.

## Related Code Files

- Read: `app/robots.ts`
- Read: `middleware.ts` (confirm matcher excludes test path)
- Create: `tests/smoke/robots-and-404.spec.ts`

## Implementation Steps

1. Create `tests/smoke/robots-and-404.spec.ts`.

2. **Static describe block** — reads `app/robots.ts` as text:
   - Assert `'/studio'` appears in the disallow list
   - Assert `'/api'` appears in the disallow list
   - Assert `sitemap` URL reference is present

3. **Integration describe block** — guarded by `SMOKE_ROBOTS_INTEGRATION=1`:
   - `GET /robots.txt`, parse body text:
     - `expect(body).toContain('Disallow: /studio')`
     - `expect(body).toContain('Disallow: /api')`
     - `expect(body).toContain('Sitemap:')`
   - `GET /this-page-does-not-exist-smoke-test` (follow redirects):
     - `expect(res.status()).toBe(404)`

## Success Criteria

- [ ] Static: `/studio` in robots.ts disallow array
- [ ] Static: `/api` in robots.ts disallow array
- [ ] Static: sitemap reference in robots.ts
- [ ] Integration: `Disallow: /studio` in robots.txt body
- [ ] Integration: `Disallow: /api` in robots.txt body
- [ ] Integration: `Sitemap:` in robots.txt body
- [ ] Integration: unknown path → 404

## Code Sketch

```ts
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const runIntegration = process.env.SMOKE_ROBOTS_INTEGRATION === '1'

test.describe('robots.txt static contracts', () => {
  test('app/robots.ts disallows /studio and /api and references sitemap', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'app/robots.ts'), 'utf8')
    expect(src).toContain("'/studio'")
    expect(src).toContain("'/api'")
    expect(src).toContain('sitemap')
  })
})

test.describe('robots.txt and 404 integration', () => {
  test.skip(!runIntegration, 'Set SMOKE_ROBOTS_INTEGRATION=1 against a live server.')

  test('robots.txt disallows sensitive paths and references sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('Disallow: /studio')
    expect(body).toContain('Disallow: /api')
    expect(body).toContain('Sitemap:')
  })

  test('unknown route returns 404', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist-smoke-test')
    expect(res?.status()).toBe(404)
  })
})
```

## Risk Assessment

- **Risk:** Next.js robots.ts generates the response — the text format may use `Disallow: /studio\nDisallow: /api` on separate lines or combined. **Mitigation:** check each string independently; `toContain` is substring-based.
- **Risk:** The 404 path may be intercepted by the locale middleware redirect before reaching the 404 handler, returning a 302 first. `page.goto` follows redirects so the final status should be 404. **Mitigation:** use `page.goto` (not `request.get`) so redirects are followed and the final page status is captured.
- **Risk:** If a custom 404 page is not yet implemented, Next.js App Router still returns 404 for unmatched routes — this is framework-guaranteed behavior regardless of page existence.
