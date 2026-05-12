---
title: "i18n Smoke Test Suite Report"
created: "2026-05-10T21:12:00-06:00"
author: "codex"
---

# i18n Smoke Test Suite Report

## Created

- `tests/smoke/i18n-bilingual.spec.ts`
- `plans/260510-i18n-smoke-tests/plan.md`
- `plans/260510-i18n-smoke-tests/phase-01-i18n-smoke-tests.md`

## What The Suite Covers

1. next-intl routing
   - Static check: `i18n/routing.ts` defines `['en', 'es']`, default `en`, and `localePrefix: 'always'`.
   - Integration check: `/` redirects to `/en`, and `/en/*` + `/es/*` static pages resolve with the correct `html[lang]`.

2. UI string translations
   - Static check: `messages/en.json` and `messages/es.json` have identical leaf-key coverage and required namespaces.
   - Integration check: rendered nav labels switch between English and Spanish with no `MISSING_MESSAGE` marker.

3. Sanity bilingual content
   - Static check: localized field fallback behavior is covered with a fixture resolver.
   - Static check: `lib/sanity-queries.ts` uses `$locale` and English fallback projections for localized fields.
   - Integration check: `/projects` and `/blog` pages render in both locales.

4. Language switcher
   - Integration check: switching `/en/about` to `/es/about` and back updates the URL, `html[lang]`, and nav strings.

5. SEO/sitemap
   - Static check: `app/sitemap.ts` emits configured locale variants.
   - Integration check: `/sitemap.xml` contains English and Spanish static paths.
   - Integration check: static pages expose `hreflang="en"`, `hreflang="es"`, and `hreflang="x-default"` alternates.

## Verification

Command run:

```bash
npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list
```

Result:

- 5 passed
- 6 skipped
- 0 failed

The skipped tests are browser integration checks. They are intentionally gated behind:

```bash
I18N_SMOKE_INTEGRATION=1
```

Use this after starting a Next server:

```bash
npm run dev
I18N_SMOKE_INTEGRATION=1 BASE_URL=http://localhost:3000 npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list
```

Integration result after implementing static-page metadata alternates:

- 11 passed
- 0 failed

## Known Gaps

- The Sanity content smoke test does not require a live Sanity Studio. It verifies local query contracts by default and validates rendered Sanity-backed pages only in integration mode.

## Unresolved Questions

- Should `npm run test:smoke` include integration mode in CI, or should CI keep this as a separate job with a managed `next dev`/preview URL?
- Should Spanish slug checks be added after real Spanish Sanity slugs are authored for posts and projects?
