---
phase: 1
title: "API Security Smoke Tests"
status: pending
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: API Security Smoke Tests

## Overview

Create `tests/smoke/api-security.spec.ts`. Tests run against a live server (integration-only) and verify that the three API endpoints with auth gates properly reject unauthorized requests. No test currently exercises these endpoints at all.

## Requirements

- Functional: each auth-gated endpoint must reject requests missing or with wrong credentials
- Functional: `revalidate-tag` must reject malformed JSON
- Non-functional: tests must run without any real secrets (use wrong/missing values intentionally)

## Architecture

All tests are integration-only (guarded by `process.env.SMOKE_API_INTEGRATION === '1'`).
They use Playwright's `request` fixture (no browser tab needed — pure HTTP).

**Endpoints under test:**

| Endpoint | Method | Auth mechanism |
|---|---|---|
| `POST /api/revalidate-tag` | POST | `x-sanity-webhook-secret` header must match `SANITY_REVALIDATE_SECRET` env var |
| `GET /api/draft-mode/enable` | GET | `?secret=` query param must match `SANITY_REVALIDATE_SECRET` OR Sanity short-lived token |
| `GET /api/draft-mode/disable` | GET | No auth — just disables draft mode and redirects |

## Related Code Files

- Read: `app/api/revalidate-tag/route.ts`
- Read: `app/api/draft-mode/enable/route.ts`
- Read: `app/api/draft-mode/disable/route.ts`
- Create: `tests/smoke/api-security.spec.ts`

## Implementation Steps

1. Create `tests/smoke/api-security.spec.ts` with a single `test.describe` block guarded by `process.env.SMOKE_API_INTEGRATION === '1'`.

2. **revalidate-tag auth tests:**
   - `POST /api/revalidate-tag` with no `x-sanity-webhook-secret` header → expect `401`
   - `POST /api/revalidate-tag` with wrong header value (`'wrong-secret'`) → expect `401`
   - `POST /api/revalidate-tag` with correct header but invalid JSON body → expect `400`
     - Send `Content-Type: application/json` with body `'not-json'` (raw string, not object)
   - Note: a valid POST (correct secret + valid body) is intentionally **not** tested because `SANITY_REVALIDATE_SECRET` is not available in CI without real secrets.

3. **draft-mode/enable auth tests:**
   - `GET /api/draft-mode/enable` with no params → expect `401` or `503`
     - 503 = `SANITY_API_READ_TOKEN` not set AND no `?secret=` param → accept both
   - `GET /api/draft-mode/enable?secret=wrong-secret` → expect `401`
   - `GET /api/draft-mode/enable?secret=ci-placeholder` (matches CI build env) → response should NOT be `401`; accept `302`/`307` redirect (draft enabled) or `200`

4. **draft-mode/disable test (static — no auth required):**
   - This test can run in the static suite because it just reads the source file.
   - Static contract: read `app/api/draft-mode/disable/route.ts`, verify it calls `draft.disable()` and `redirect('/')`.

## Success Criteria

- [ ] `POST /api/revalidate-tag` without secret header → 401
- [ ] `POST /api/revalidate-tag` with wrong secret → 401
- [ ] `POST /api/revalidate-tag` with bad JSON body → 400
- [ ] `GET /api/draft-mode/enable` without params → 401 or 503
- [ ] `GET /api/draft-mode/enable?secret=wrong-secret` → 401
- [ ] Static contract: disable route calls `draft.disable()` and `redirect('/')`
- [ ] All integration tests skip when `SMOKE_API_INTEGRATION` is unset

## Code Sketch

```ts
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const runIntegration = process.env.SMOKE_API_INTEGRATION === '1'

test.describe('API security static contracts', () => {
  test('draft-mode/disable calls disable() and redirects to /', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'app/api/draft-mode/disable/route.ts'),
      'utf8'
    )
    expect(src).toContain('draft.disable()')
    expect(src).toContain("redirect('/')")
  })
})

test.describe('API auth gates', () => {
  test.skip(!runIntegration, 'Set SMOKE_API_INTEGRATION=1 against a live server.')

  test('POST /api/revalidate-tag — no secret header → 401', async ({ request }) => {
    const res = await request.post('/api/revalidate-tag', {
      data: { _type: 'project' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/revalidate-tag — wrong secret → 401', async ({ request }) => {
    const res = await request.post('/api/revalidate-tag', {
      headers: { 'x-sanity-webhook-secret': 'wrong-secret' },
      data: { _type: 'project' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/revalidate-tag — invalid JSON → 400', async ({ request }) => {
    const res = await request.post('/api/revalidate-tag', {
      headers: {
        'x-sanity-webhook-secret': 'ci-placeholder',
        'content-type': 'application/json',
      },
      data: 'not-json',
    })
    expect(res.status()).toBe(400)
  })

  test('GET /api/draft-mode/enable — no params → 401 or 503', async ({ request }) => {
    const res = await request.get('/api/draft-mode/enable', { maxRedirects: 0 })
    expect([401, 503]).toContain(res.status())
  })

  test('GET /api/draft-mode/enable — wrong secret → 401', async ({ request }) => {
    const res = await request.get('/api/draft-mode/enable?secret=wrong-secret', {
      maxRedirects: 0,
    })
    expect(res.status()).toBe(401)
  })
})
```

## Risk Assessment

- **Risk:** Playwright's `request.post` with a string body and `content-type: application/json` may be treated differently by Next.js. **Mitigation:** use `{ data: 'not-json' }` with explicit header override; Next.js `req.json()` will throw on invalid JSON → 400.
- **Risk:** `draft-mode/enable` with `?secret=ci-placeholder` may behave differently if `SANITY_REVALIDATE_SECRET` is not set in the test server. **Mitigation:** test skips in CI; the static contract covers the disable route.
