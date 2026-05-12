---
phase: 8
title: 'Content Model Smoke Tests'
status: completed
priority: P1
effort: '2h'
dependencies: [7]
---

# Phase 8: Content Model Smoke Tests

## Overview

Create `tests/smoke/content-model.spec.ts` with static contract tests that verify the refactored schema layer is wired correctly — no browser or live server required. Update `tests/smoke/i18n-bilingual.spec.ts` to cover GROQ query patterns for new localized fields added in Phase 7. Tests run in the existing `smoke-static` CI job.

## Context Links

- Phase 7: [Wire Up Types and Queries](./phase-07-wire-up-types-and-queries.md) — must complete first
- Existing smoke tests: `tests/smoke/i18n-bilingual.spec.ts` (178 LOC)
- Playwright config: `playwright.config.ts`
- CI pattern: two GHA jobs — `smoke-static` (parallel, blocking, no browser) + `smoke-integration` (after ci, continue-on-error)

## Requirements

**Functional:**

- Static tests verify i18n helpers module, schema registry, new schema files, GROQ query functions, cache version, and coalesce patterns
- Updated i18n test covers new localized fields (`tagline`, `role`, `summary`) from new type queries
- All new tests are static (read file contents) — no browser, no `page.goto()`, no live server

**Non-functional:**

- New test file ≤ 120 LOC (KISS)
- Tests pass in CI without a running dev server
- Follow existing static test pattern from `i18n-bilingual.spec.ts` lines 1-98

## Architecture

```
tests/smoke/
├── content-model.spec.ts    ← NEW: static contracts for schema layer
├── i18n-bilingual.spec.ts   ← UPDATE: extend GROQ coalesce test for new fields
├── pages.spec.ts            ← no change
├── navigation.spec.ts       ← no change
├── health.spec.ts           ← no change
└── contact-form.spec.ts     ← no change
```

**Test groups in `content-model.spec.ts`:**

1. `sanity/lib/i18n-helpers.ts` exports all 6 factories
2. `sanity/schema.ts` registers all 14 document types
3. All 9 new schema files exist on disk
4. `sanity-queries.ts` defines query functions for all new types
5. `sanity-queries.ts` uses `localized-v3` cache version
6. New type queries use `coalesce(field[$locale], field.en)` for localized fields

## Related Code Files

- Create: `tests/smoke/content-model.spec.ts`
- Modify: `tests/smoke/i18n-bilingual.spec.ts`

## Implementation Steps

### Step 1: Create `tests/smoke/content-model.spec.ts`

```typescript
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

function readText(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

test.describe('content model static contracts', () => {
  test('sanity/lib/i18n-helpers.ts exports all 6 helper factories', () => {
    const helpers = readText('sanity/lib/i18n-helpers.ts')
    for (const name of [
      'localizedString',
      'localizedText',
      'localizedSlug',
      'localizedContent',
      'localizedRichText',
      'localizedArray',
    ]) {
      expect(helpers, `${name} should be exported`).toContain(`export const ${name}`)
    }
  })

  test('sanity/schema.ts registers all 14 document types', () => {
    const schema = readText('sanity/schema.ts')
    for (const typeName of [
      'projectType',
      'postType',
      'authorType',
      'tagType',
      'siteSettingsType',
      'aboutType',
      'experienceType',
      'skillType',
      'certificationType',
      'educationType',
      'languageType',
      'strengthType',
      'socialPostType',
      'testimonialType',
    ]) {
      expect(schema, `${typeName} should be in schema.ts`).toContain(typeName)
    }
  })

  test('all 9 new schema files exist', () => {
    for (const file of [
      'sanity/schemas/about-type.ts',
      'sanity/schemas/experience-type.ts',
      'sanity/schemas/skill-type.ts',
      'sanity/schemas/certification-type.ts',
      'sanity/schemas/education-type.ts',
      'sanity/schemas/language-type.ts',
      'sanity/schemas/strength-type.ts',
      'sanity/schemas/social-post-type.ts',
      'sanity/schemas/testimonial-type.ts',
    ]) {
      expect(fs.existsSync(path.join(process.cwd(), file)), `${file} should exist`).toBe(true)
    }
  })

  test('sanity-queries.ts defines query functions for all new types', () => {
    const queries = readText('lib/sanity-queries.ts')
    for (const fn of [
      'getExperiences',
      'getSkills',
      'getAbout',
      'getCertifications',
      'getEducation',
      'getLanguages',
      'getStrengths',
      'getSocialPosts',
      'getTestimonials',
    ]) {
      expect(queries, `${fn} should be exported`).toContain(`export const ${fn}`)
    }
  })

  test('sanity-queries.ts uses updated cache version localized-v3', () => {
    const queries = readText('lib/sanity-queries.ts')
    expect(queries).toContain("cacheVersion = 'localized-v3'")
  })

  test('new type queries use locale coalesce fallback for localized fields', () => {
    const queries = readText('lib/sanity-queries.ts')
    for (const field of ['tagline', 'role', 'summary']) {
      expect(queries, `${field} should use coalesce locale fallback`).toContain(
        `coalesce(${field}[$locale], ${field}.en)`
      )
    }
  })
})
```

### Step 2: Update `tests/smoke/i18n-bilingual.spec.ts`

Locate the test "Sanity queries use locale params and English fallback for localized fields" (~line 73). Extend the `for` loop field list.

**Current (line 76):**

```typescript
for (const field of ['title', 'description', 'excerpt', 'content', 'siteName']) {
```

**Change to:**

```typescript
for (const field of ['title', 'description', 'excerpt', 'content', 'siteName', 'tagline', 'role', 'summary']) {
```

No other changes to `i18n-bilingual.spec.ts`.

### Step 3: Verify CI coverage

Check `.github/workflows/ci.yml` — confirm the `smoke-static` job runs all `tests/smoke/*.spec.ts` files. The new `content-model.spec.ts` uses only `fs.readFileSync` (no `page.goto()`), so it belongs in the static job with no extra flags needed.

### Step 4: Run locally to validate

```bash
# Static only — no server needed
npx playwright test tests/smoke/content-model.spec.ts --reporter=list

# Full smoke-static suite
npx playwright test tests/smoke/ --grep-invert "browser integration" --reporter=list
```

All 6 new tests + updated i18n field test should pass after Phase 7 completes.

## Todo List

- [x] Create `tests/smoke/content-model.spec.ts` with 6 static `test()` calls
- [x] Update `tests/smoke/i18n-bilingual.spec.ts` ~line 76: add `tagline`, `role`, `summary` to field list
- [x] Confirm no `page.goto()` calls in new file (pure static)
- [x] Review `.github/workflows/ci.yml` — confirm static job picks up new file
- [x] Run `npx playwright test tests/smoke/content-model.spec.ts` — all 6 pass
- [x] Run full smoke suite — zero regressions in existing tests

## Success Criteria

- [x] `tests/smoke/content-model.spec.ts` exists, ≤ 120 LOC, 6 tests all green
- [x] `tests/smoke/i18n-bilingual.spec.ts` extended field list passes without breaking existing assertions
- [x] All Phase 8 tests are pure static — no server, no browser
- [x] `npx playwright test tests/smoke/` exits 0
- [x] CI `smoke-static` job passes including new test file

## Risk Assessment

| Risk                                                                              | Likelihood | Impact | Mitigation                                                  |
| --------------------------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------- |
| Phase 7 uses different query function names (e.g., `getSkillList` vs `getSkills`) | Low        | Medium | Sync names between Phase 7 and Phase 8 before implementing  |
| Cache version string differs from `localized-v3`                                  | Low        | Low    | Phase 7 specifies this; confirm at implementation           |
| New localized fields use different GROQ pattern                                   | Low        | Low    | Phase 7 GROQ snippets specify coalesce; align at write time |
| CI static job doesn't glob new file                                               | Very Low   | Medium | Verify `ci.yml` glob in step 3                              |

## Next Steps

- All phases (1-7) must complete before Phase 8 tests can pass
- After Phase 8: `/ck:git cp` to commit, `/ck:plan archive` to close plan
- Future: integration tests against live Sanity data deferred to separate plan
