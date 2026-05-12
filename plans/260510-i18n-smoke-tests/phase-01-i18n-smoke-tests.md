---
phase: 1
title: "i18n Smoke Tests"
status: completed
priority: P2
effort: "1h"
dependencies: [260510-i18n-bilingual]
---

# Phase 1: i18n Smoke Tests

## Scope

Add one focused Playwright spec for bilingual smoke coverage without modifying runtime i18n configuration or existing application source files.

## Implemented

- Created `tests/smoke/i18n-bilingual.spec.ts`.
- Added static smoke contracts that run without a live Next server.
- Added browser integration checks gated by `I18N_SMOKE_INTEGRATION=1`.
- Covered all requested areas:
  - next-intl routing contract and integration routes
  - message namespace/key parity
  - Sanity localized-field fallback semantics and GROQ locale projections
  - language switcher URL/string behavior
  - sitemap and hreflang integration checks

## Commands

Default static run:

```bash
npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list
```

Full integration run, after starting Next:

```bash
npm run dev
I18N_SMOKE_INTEGRATION=1 BASE_URL=http://localhost:3000 npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list
```

## Result

Default static run passes:

- 5 passed
- 6 skipped integration checks

Full integration run passes after starting Next:

- 11 passed
- 0 failed

## Deferred Integration Assertions

These are present in the spec but skipped in default mode because they require a running server:

- `/` redirects to `/en`
- `/en/*` and `/es/*` static routes return 200
- rendered English/Spanish nav labels appear with no missing-message marker
- language switcher changes URL and rerenders locale strings
- Sanity-backed `/projects` and `/blog` pages render for both locales
- `/sitemap.xml` contains both locale variants
- hreflang tags exist on static pages
