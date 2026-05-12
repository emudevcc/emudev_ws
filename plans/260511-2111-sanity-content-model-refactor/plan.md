---
title: Sanity Content Model Refactor
description: >-
  Expand Sanity schemas from 5 to 14 document types to power
  Classic/Sidebar/Bento portfolio UI layouts.
status: completed
priority: P1
effort: 20h
branch: development
tags:
  - sanity
  - cms
  - schema
  - content-model
  - i18n
blockedBy: []
blocks: [260511-2210-classic-layout-ui]
created: '2026-05-11'
createdBy: 'ck:plan'
source: skill
---

# Sanity Content Model Refactor

## Overview

Refactor Sanity v3 content model to power upcoming portfolio UI work (Classic / Sidebar / Bento). This plan touches only the schema + GROQ layer — no UI components, no route changes. Scope: extract shared i18n helpers (DRY), expand `siteSettings`, add 9 new document types (about, experience, skill, certification, education, language, strength, socialPost, testimonial), expand `project` + `post`. All new fields optional — existing content unaffected. Author Phase A: keep author ref, add `authorOverride`; full deprecation deferred.

Final type count: 14 documents. Bilingual fields use `{ en, es }` pattern via shared `localizedString/localizedText/localizedSlug/localizedContent/localizedRichText/localizedArray` factories in `sanity/lib/i18n-helpers.ts`.

## Phases

| Phase | Name                                                                                     | Status    |
| ----- | ---------------------------------------------------------------------------------------- | --------- |
| 1     | [Extract i18n Helpers Module](./phase-01-extract-i18n-helpers-module.md)                 | Completed |
| 2     | [SiteSettings and About Singleton](./phase-02-sitesettings-and-about-singleton.md)       | Completed |
| 3     | [Skill and Experience Schemas](./phase-03-skill-and-experience-schemas.md)               | Completed |
| 4     | [Certification and Education Schemas](./phase-04-certification-and-education-schemas.md) | Completed |
| 5     | [Supporting Content Types](./phase-05-supporting-content-types.md)                       | Completed |
| 6     | [Expand Project and Post](./phase-06-expand-project-and-post.md)                         | Completed |
| 7     | [Wire Up Types and Queries](./phase-07-wire-up-types-and-queries.md)                     | Completed |
| 8     | [Content Model Smoke Tests](./phase-08-content-model-smoke-tests.md)                     | Completed |

## Dependencies

**Phase order (intra-plan):**

- Phase 1 blocks 2-6 (helpers must exist before re-import)
- Phase 3 (Skill) blocks Phase 4 (Certification refs Skill), Phase 5 (Testimonial refs Experience), Phase 6 (Project.tech refs Skill)
- Phase 7 depends on Phases 1-6 (registers all new types + regenerates `types/sanity.types.ts`)
- Phase 8 depends on Phase 7 (smoke tests validate schema registry and GROQ query layer)

**Cross-plan:**

| Plan                                        | Relationship | Notes                                                                                                                        |
| ------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `260510-i18n-bilingual`                     | Builds on    | Mostly complete. This plan reuses the localized field pattern + GROQ `coalesce(...[$locale], ...en)` convention. No blocker. |
| Future UI plans (Classic / Sidebar / Bento) | Blocks       | UI work consumes the types generated in Phase 7.                                                                             |

## Rollback

Each phase is additive except Phase 6 (renames `featuredImage` → `cover`, removes `tags[]` from project). Phase 6 rollback: revert schema file, leave existing documents untouched (Sanity tolerates unknown fields in dataset). For Phases 2-5, simply remove the new field/type from `sanity/schema.ts` registration to hide from Studio.

## Execution Result

Completed all 8 phases. Verification passed:

- `npm run sanity:types`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npx playwright test tests/smoke/content-model.spec.ts --reporter=list`
- `npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list`
- `npx playwright test tests/smoke/i18n-bilingual.spec.ts tests/smoke/content-model.spec.ts --grep "static contracts|content model static contracts" --reporter=list`

Note: `npx playwright test tests/smoke/ --grep-invert "browser integration" --reporter=list` is not serverless in the current repo because it also includes page/contact/navigation/health specs that launch Chromium or hit `localhost:3000`. The new content-model smoke tests are static and are wired into CI directly.

## Documentation Updates

Updated the documentation set to reflect the completed 14-type Sanity content model, generated Sanity types, grouped Studio structure, expanded GROQ/cache layer, content-model smoke tests, and completed sitemap/hreflang work:

- `README.md`
- `docs/code-standards.md`
- `docs/codebase-summary.md`
- `docs/deployment-guide.md`
- `docs/project-overview-pdr.md`
- `docs/project-roadmap.md`
- `docs/system-architecture.md`
