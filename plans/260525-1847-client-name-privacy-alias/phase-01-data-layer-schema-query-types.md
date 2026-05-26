---
phase: 1
title: "Data Layer: Schema + Query + Types"
status: completed
priority: P2
effort: "20m"
dependencies: []
---

# Phase 1: Data Layer — Schema + Query + Types

## Overview
Add an optional `companyAlias` field to the experience Sanity schema. Update the GROQ projection to expose `displayCompany: coalesce(companyAlias, company)` instead of raw `company`, so real company names never reach the frontend when an alias is set.

## Requirements
- Functional:
  - `companyAlias` field: optional string in Sanity Studio with helper text "Public display name — use an industry synonym to protect client confidentiality (e.g. 'Global Financial Services Company')"
  - GROQ projects `"displayCompany": coalesce(companyAlias, company)` — alias wins, real name fallback when no alias set
  - Raw `company` field removed from GROQ projection (privacy boundary)
  - `Experience` TypeScript type: remove `company?: string`, add `displayCompany?: string`
- Non-functional:
  - Studio preview still shows real company name (unaffected — uses `company` directly)
  - Existing entries without alias continue rendering real name unchanged
  - No migration needed — `companyAlias` is optional, defaults to null

## Architecture

### Schema change (`sanity/schemas/experience-type.ts`)
Add after the `company` field:
```ts
defineField({
  name: 'companyAlias',
  type: 'string',
  description: "Public display name for client privacy. Leave empty to show the real company name. Example: 'Global Financial Services Firm'",
}),
```

### GROQ projection change (`lib/sanity-queries.ts`)
Replace:
```groq
company,
companyUrl,
```
With:
```groq
"displayCompany": coalesce(companyAlias, company),
companyUrl,
```
Note: `company` itself is intentionally excluded from the projection.

### TypeScript type change (`lib/sanity-queries.ts`)
In `export type Experience`:
- Remove: `company?: string`
- Add: `displayCompany?: string`

## Related Code Files
- Modify: `sanity/schemas/experience-type.ts`
- Modify: `lib/sanity-queries.ts` (GROQ projection + TypeScript type)

## Implementation Steps
1. Open `sanity/schemas/experience-type.ts` → add `companyAlias` field after `company`
2. Open `lib/sanity-queries.ts` → find the `getExperiences` GROQ query
3. Replace `company,` with `"displayCompany": coalesce(companyAlias, company),`
4. In `export type Experience` → remove `company?: string`, add `displayCompany?: string`
5. Run `npx tsc --noEmit` — expect type errors in `ExperienceCard` (fixed in Phase 2)

## Success Criteria
- [x] `companyAlias` field visible in Sanity Studio editor
- [x] GROQ query no longer projects raw `company`
- [x] `Experience` type has `displayCompany` instead of `company`
- [x] `npx tsc --noEmit` shows only the ExperienceCard error (resolved in Phase 2)

## Completion Notes

- Also removed the unused raw `clients` array from the frontend projection so client names do not reach browser page data.
- Added `clientAliases` to the schema and marked `clients` as internal-only.
- Added a Sanity text sanitization pass for known client names embedded in hero/about/experience copy.
- Replaced tracked seed-data client names with public-safe aliases.

## Risk Assessment
Low risk. `coalesce` fallback ensures no visual regression for existing entries. Studio preview unaffected.
