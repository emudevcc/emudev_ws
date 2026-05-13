---
title: "Sanity content population from CV"
description: "Populate all Sanity singletons and document types with real content derived from Esteban's CV, using an approachable & conversational tone. Delivered as NDJSON import files executed via the Sanity CLI."
status: completed
priority: P2
branch: "development"
tags: [sanity, content, cms]
blockedBy: []
blocks: []
created: "2026-05-13T01:37:45.017Z"
createdBy: "ck:plan"
source: skill
---

# Sanity content population from CV

## Problem

The Sanity Studio is empty — no documents exist. The site renders fallback strings everywhere. We need to populate all content types with real, publication-ready content drawn from Esteban's CV, bilingual (en/es), with a conversational tone.

## Approach

Write NDJSON import files (`sanity/seed/`) for each content type, then run:

```bash
npx sanity dataset import sanity/seed/seed.ndjson production --replace
```

This is idempotent (same `_id` = upsert) and safe to re-run.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [siteSettings singleton](./phase-01-sitesettings-singleton.md) | Completed |
| 2 | [About singleton](./phase-02-about-singleton.md) | Completed |
| 3 | [Experience documents](./phase-03-experience-documents.md) | Completed |
| 4 | [Skills catalog](./phase-04-skills-catalog.md) | Completed |
| 5 | [Certifications, Education & Languages](./phase-05-certifications-education-languages.md) | Completed |
| 6 | [Strengths (CliftonStrengths)](./phase-06-strengths.md) | Completed |
| 7 | [Sample projects](./phase-07-sample-projects.md) | Completed |

## Files

| File | Change |
|------|--------|
| `sanity/seed/01-site-settings.ndjson` | Create |
| `sanity/seed/02-about.ndjson` | Create |
| `sanity/seed/03-experience.ndjson` | Create |
| `sanity/seed/04-skills.ndjson` | Create |
| `sanity/seed/05-certifications.ndjson` | Create |
| `sanity/seed/05-education.ndjson` | Create |
| `sanity/seed/05-languages.ndjson` | Create |
| `sanity/seed/06-strengths.ndjson` | Create |
| `sanity/seed/07-projects.ndjson` | Create |
| `sanity/seed/seed.sh` | Create (merges all NDJSON and runs import) |

## Notes

- All `_id` values use a stable `seed-` prefix so re-import is idempotent
- Bilingual: every `localizedString` / `localizedRichText` gets both `en` and `es` values
- Rich text fields use portable-text block array format
- Skill references use `_ref` pointing to skill `_id` values defined in phase 4
- Images/logos: left empty (no binary assets in NDJSON seed — upload manually later)
- Execution completed on 2026-05-13: 39 seed documents were imported into the `production` dataset and a remote read-back query confirmed 39 `seed-*` documents.
- The local Sanity CLI import path was blocked by interactive login / dotenv expansion in this workspace, so the import was executed with Sanity's HTTP mutation API using the same `createOrReplace` semantics as `--replace`.
- Seed schema alignment was adjusted before import: `about.funFacts` and `experience.highlights` now match the repo's localized array-of-strings schema.
