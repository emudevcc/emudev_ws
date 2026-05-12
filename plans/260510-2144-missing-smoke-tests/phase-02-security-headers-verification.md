---
phase: 2
title: "Security Headers Verification"
status: pending
priority: P1
effort: "45m"
dependencies: []
---

# Phase 2: Security Headers Verification

## Overview

Create `tests/smoke/security-headers.spec.ts`. The app explicitly configures six security headers in `next.config.ts` but no test ever verifies they are emitted. A static-contract test reads the config file; an integration test hits a live response.

## Requirements

- Functional: static contract asserts each required header key + expected value substring is present in `next.config.ts`
- Functional: integration test asserts the headers are present in a real HTTP response
- Non-functional: static tests must pass with no server running

## Architecture

**Headers configured in `next.config.ts` (production values):**

| Header | Expected value |
|---|---|
| `Content-Security-Policy` | `frame-ancestors 'self' https://emudev.cc` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `X-DNS-Prefetch-Control` | `on` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |

Static test: read `next.config.ts` as text, assert each key and value string is present.
Integration test: `GET /en` and inspect response headers.

**Note on CSP in test environment:**
The dev build sets `frame-ancestors *` (permissive). CI uses `NODE_ENV=production` for the build step, so the production CSP should apply. The static test checks the production string; the integration test accepts either value.

## Related Code Files

- Read: `next.config.ts`
- Create: `tests/smoke/security-headers.spec.ts`

## Implementation Steps

1. Create `tests/smoke/security-headers.spec.ts`.

2. **Static describe block** — reads `next.config.ts` as a raw string and asserts:
   - The `securityHeaders` array is defined.
   - Each of the six header keys appears in the file.
   - The production `frame-ancestors 'self' https://emudev.cc` value appears (not just `frame-ancestors *`).
   - `nosniff`, `strict-origin-when-cross-origin`, `camera=(), microphone=(), geolocation=()`, `max-age=31536000` all appear.

3. **Integration describe block** — guarded by `process.env.SMOKE_SECURITY_INTEGRATION === '1'`:
   - `GET /en` (a real page response)
   - Assert response headers contain:
     - `x-content-type-options: nosniff`
     - `referrer-policy: strict-origin-when-cross-origin`
     - `permissions-policy` header is present (don't assert exact value — it may vary)
     - `content-security-policy` header is present

## Success Criteria

- [ ] Static: all six header keys found in `next.config.ts`
- [ ] Static: production CSP `frame-ancestors 'self' https://emudev.cc` found
- [ ] Static: HSTS `max-age=31536000; includeSubDomains` found
- [ ] Integration: `x-content-type-options: nosniff` in response headers
- [ ] Integration: `referrer-policy: strict-origin-when-cross-origin` in response headers
- [ ] Integration: `content-security-policy` header is present
- [ ] Integration tests skip when env var unset

## Code Sketch

```ts
import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const runIntegration = process.env.SMOKE_SECURITY_INTEGRATION === '1'

const REQUIRED_HEADER_KEYS = [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'X-DNS-Prefetch-Control',
  'Strict-Transport-Security',
]

const REQUIRED_VALUES = [
  "frame-ancestors 'self' https://emudev.cc",
  'nosniff',
  'strict-origin-when-cross-origin',
  'camera=(), microphone=(), geolocation=()',
  'max-age=31536000; includeSubDomains',
]

test.describe('security headers static contracts', () => {
  let config: string

  test.beforeAll(() => {
    config = fs.readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf8')
  })

  for (const key of REQUIRED_HEADER_KEYS) {
    test(`next.config.ts defines ${key}`, () => {
      expect(config).toContain(key)
    })
  }

  for (const value of REQUIRED_VALUES) {
    test(`next.config.ts includes value "${value}"`, () => {
      expect(config).toContain(value)
    })
  }
})

test.describe('security headers in HTTP responses', () => {
  test.skip(!runIntegration, 'Set SMOKE_SECURITY_INTEGRATION=1 against a live server.')

  test('GET /en includes required security headers', async ({ request }) => {
    const res = await request.get('/en')
    expect(res.status()).toBe(200)

    const headers = res.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['content-security-policy']).toBeTruthy()
    expect(headers['permissions-policy']).toBeTruthy()
  })
})
```

## Risk Assessment

- **Risk:** `beforeAll` in a `describe` block with `for` loops creates tests dynamically — Playwright supports this but order may vary. **Mitigation:** each test is independent; no ordering dependency.
- **Risk:** In dev mode (local `SMOKE_SECURITY_INTEGRATION=1`), CSP is `frame-ancestors *` not the production value, so the integration test only checks presence, not exact CSP value. Static test checks the production string in source — acceptable.
