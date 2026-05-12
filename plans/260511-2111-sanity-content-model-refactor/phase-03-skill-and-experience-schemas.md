---
phase: 3
title: "Skill and Experience Schemas"
status: pending
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 3: Skill and Experience Schemas

## Overview

Introduce the two referenced foundational types used across the portfolio: `skill` (atomic tech/tool taxonomy) and `experience` (work timeline). Skill is created **first** because Experience, Project (Phase 6), and Certification (Phase 4) all reference it. Both types are collections (multi-doc), not singletons.

## Requirements

**Functional — Skill**
- Fields: name (string), slug (slug, source `name`), category (enum), icon (image OR string for `simple-icons` slug), level (enum), yearsExperience (number, optional), order (number, optional)
- `category` enum: `language | framework | tool | platform | cloud | design`
- `level` enum: `core | proficient | familiar`
- `icon` field: prefer image upload; allow fallback string slug for simple-icons (e.g. `react`, `typescript`)

**Functional — Experience**
- Fields: role🌐, company (string), companyUrl (url), companyLogo (image), location (string), employmentType (enum), startDate (date), endDate (date, optional — null = current), summary (rich text🌐), highlights (array<string>🌐), tech (array<ref skill>), clients (array<string>), order (number)
- `employmentType` enum: `full-time | contract | freelance | internship`
- `endDate` null means "Present" — query layer handles formatting

**Non-functional**
- Skill is referenced from 3 other types — schema must be stable before Phase 4/6
- Both types preview should display in Studio list view with key meta

## Architecture

**Skill** structure:
```ts
{
  name: 'skill',
  type: 'document',
  fields: [
    name, slug, category, iconImage, iconSlug, level, yearsExperience, order
  ],
}
```

`icon` modeled as two parallel fields for simplicity (UI picks first non-null):
- `iconImage` (image)
- `iconSlug` (string) — simple-icons CDN slug

**Experience** structure: ordered chronologically by `startDate desc`. `tech` is `array of {type: reference, to: [{type:'skill'}]}`.

## Related Code Files

**Create**
- `sanity/schemas/skill-type.ts`
- `sanity/schemas/experience-type.ts`

**Modify**
- None (registration deferred to Phase 7)

## Implementation Steps

1. **Create Skill** — `sanity/schemas/skill-type.ts`:
   ```ts
   import { defineType, defineField } from 'sanity'

   const CATEGORIES = [
     { title: 'Language', value: 'language' },
     { title: 'Framework', value: 'framework' },
     { title: 'Tool', value: 'tool' },
     { title: 'Platform', value: 'platform' },
     { title: 'Cloud', value: 'cloud' },
     { title: 'Design', value: 'design' },
   ] as const

   const LEVELS = [
     { title: 'Core', value: 'core' },
     { title: 'Proficient', value: 'proficient' },
     { title: 'Familiar', value: 'familiar' },
   ] as const

   export const skillType = defineType({
     name: 'skill',
     title: 'Skill',
     type: 'document',
     fields: [
       defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
       defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
       defineField({ name: 'category', type: 'string', options: { list: CATEGORIES } }),
       defineField({ name: 'iconImage', type: 'image', options: { hotspot: false } }),
       defineField({ name: 'iconSlug', type: 'string', description: 'simple-icons slug (e.g. "react"). Used if iconImage empty.' }),
       defineField({ name: 'level', type: 'string', options: { list: LEVELS } }),
       defineField({ name: 'yearsExperience', type: 'number' }),
       defineField({ name: 'order', type: 'number' }),
     ],
     preview: { select: { title: 'name', subtitle: 'category', media: 'iconImage' } },
     orderings: [{ title: 'Manual order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
   })
   ```

2. **Create Experience** — `sanity/schemas/experience-type.ts`:
   ```ts
   import { defineType, defineField } from 'sanity'
   import { localizedString, localizedRichText, localizedArray } from '../lib/i18n-helpers'

   const EMPLOYMENT_TYPES = [
     { title: 'Full-time', value: 'full-time' },
     { title: 'Contract', value: 'contract' },
     { title: 'Freelance', value: 'freelance' },
     { title: 'Internship', value: 'internship' },
   ] as const

   export const experienceType = defineType({
     name: 'experience',
     title: 'Experience',
     type: 'document',
     fields: [
       localizedString('role', 'Role', true),
       defineField({ name: 'company', type: 'string', validation: (r) => r.required() }),
       defineField({ name: 'companyUrl', type: 'url' }),
       defineField({ name: 'companyLogo', type: 'image', options: { hotspot: true } }),
       defineField({ name: 'location', type: 'string' }),
       defineField({ name: 'employmentType', type: 'string', options: { list: EMPLOYMENT_TYPES } }),
       defineField({ name: 'startDate', type: 'date', validation: (r) => r.required() }),
       defineField({ name: 'endDate', type: 'date', description: 'Leave empty for current role' }),
       localizedRichText('summary', 'Summary'),
       localizedArray('highlights', 'Highlights'),
       defineField({
         name: 'tech',
         type: 'array',
         of: [{ type: 'reference', to: [{ type: 'skill' }] }],
       }),
       defineField({ name: 'clients', type: 'array', of: [{ type: 'string' }] }),
       defineField({ name: 'order', type: 'number' }),
     ],
     preview: {
       select: { title: 'role.en', subtitle: 'company', media: 'companyLogo' },
     },
     orderings: [
       { title: 'Start date, newest first', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] },
     ],
   })
   ```

3. `npm run typecheck`. Registration is Phase 7.

## Todo List

- [ ] Create `skill-type.ts` with 8 fields, 2 enums, preview, ordering
- [ ] Create `experience-type.ts` with 13 fields (incl. tech ref), preview, ordering
- [ ] `npm run typecheck` passes

## Success Criteria

- [ ] Skill document validates with required name + slug
- [ ] Experience document validates with required role.en + company + startDate
- [ ] Experience.tech reference picker shows Skill documents in Studio (post-Phase 7)
- [ ] Empty `endDate` saves successfully (current role)
- [ ] Category/level/employmentType enums appear as dropdowns

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Skill ref breaks if name renamed before Phase 4/6 | Low | High | Lock `name: 'skill'` constant; do not rename later |
| Two parallel icon fields confusing | Medium | Low | Field descriptions clarify precedence; UI doc in Phase 7 query layer |
| Date-only field timezone confusion | Low | Low | Use `type: 'date'` not `datetime`; document format `YYYY-MM-DD` |

## Rollback

Delete the two new files. Nothing references them yet (registration is Phase 7). No dataset impact.
