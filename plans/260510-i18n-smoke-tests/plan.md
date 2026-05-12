---
title: "i18n Bilingual Smoke Tests"
description: "Focused Playwright smoke suite for the en/es next-intl, Sanity localized content, language switcher, and SEO/sitemap work."
status: completed
priority: P2
branch: "development"
tags: [i18n, testing, smoke, playwright]
blockedBy: []
blocks: []
created: "2026-05-11T03:08:11.660Z"
createdBy: "codex"
source: manual
---

# i18n Bilingual Smoke Tests

## Overview

Create a focused smoke suite for the bilingual i18n implementation described in `plans/260510-i18n-bilingual/`.

The project already uses Playwright for smoke tests via:

```bash
npx playwright test tests/smoke/i18n-bilingual.spec.ts
```

Browser checks require a running Next server and are opt-in:

```bash
I18N_SMOKE_INTEGRATION=1 BASE_URL=http://localhost:3000 npx playwright test tests/smoke/i18n-bilingual.spec.ts
```

## Coverage

| Area | Coverage |
| --- | --- |
| next-intl routing | Static contract verifies `en`/`es`, default `en`, and `localePrefix: 'always'`; integration verifies `/` redirect and `/en/*` + `/es/*` routes. |
| UI translations | Static contract verifies English/Spanish message key parity and core namespaces; integration verifies rendered nav labels and no missing-message marker. |
| Sanity bilingual content | Static contract verifies localized fallback semantics and GROQ locale/fallback projections; integration verifies Sanity-backed list pages render in both locales. |
| Language switcher | Integration verifies switching `/en/about` to `/es/about` and back updates URL, `html[lang]`, and nav strings. |
| SEO/sitemap | Static contract verifies sitemap uses configured locales; integration verifies `/sitemap.xml` locale paths and hreflang tags. |

## Test Files

- `tests/smoke/i18n-bilingual.spec.ts`

## Notes

- The default run is intentionally serverless/static so at least one smoke test file is runnable without starting Next or Sanity Studio.
- Integration tests are skipped unless `I18N_SMOKE_INTEGRATION=1` is set.
- Full integration verification passes against a running local Next server, including hreflang alternates.
