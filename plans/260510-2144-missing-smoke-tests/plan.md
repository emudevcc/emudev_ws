---
title: "Missing Smoke Tests: API Security, Headers, and Edge Cases"
description: "Four strictly necessary smoke test gaps: API endpoint security, security header contracts, robots.txt content, and 404 behaviour — none covered by any existing smoke file."
status: pending
priority: P1
branch: "development"
tags: [testing, smoke, security, playwright]
blockedBy: []
blocks: []
created: "2026-05-11T03:47:18.852Z"
createdBy: "ck:plan"
source: skill
---

# Missing Smoke Tests: API Security, Headers, and Edge Cases

## Overview

The existing smoke suite covers health, public pages, navigation, contact form, and i18n contracts.
Four strictly-necessary gaps remain — each would silently miss a production regression:

1. **API security** — `POST /api/revalidate-tag` and `GET /api/draft-mode/enable` are public endpoints with auth gates that are never exercised by any test.
2. **Security headers** — `next.config.ts` configures CSP, HSTS, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy, but no test verifies they are actually emitted.
3. **robots.txt content** — existing test only checks HTTP 200; disallow rules for `/studio` and `/api` are not validated.
4. **404 behaviour** — no test confirms unknown routes return 404 (not 200 or 500).

Phases 1–3 produce static-contract tests (no server needed, run in CI `smoke-static` job).
Phase 4 wires them into CI.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [API Security Smoke Tests](./phase-01-api-security-smoke-tests.md) | Pending |
| 2 | [Security Headers Verification](./phase-02-security-headers-verification.md) | Pending |
| 3 | [robots.txt Content and 404 Handling](./phase-03-robots-txt-content-and-404-handling.md) | Pending |
| 4 | [CI Integration](./phase-04-ci-integration.md) | Pending |

## Key Files

| File | Purpose |
|------|---------|
| `tests/smoke/api-security.spec.ts` | New — API auth gate tests |
| `tests/smoke/security-headers.spec.ts` | New — header contract tests |
| `tests/smoke/robots-and-404.spec.ts` | New — robots.txt content + 404 |
| `.github/workflows/ci.yml` | Update `smoke-static` grep pattern |

## Dependencies

None — these tests are self-contained.
